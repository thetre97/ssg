import { createServer, build, InlineConfig } from 'vite'
import { command } from 'bandersnatch'
import { loadConfig } from 'unconfig'
import fs from 'node:fs/promises'
import path from 'node:path'

// Vite Plugins
import vue from '@vitejs/plugin-vue'
import vps from 'vite-plugin-ssr/plugin'
import { prerender } from 'vite-plugin-ssr/prerender'

// Wind
import { Wind } from '../plugin'

// Types
import type { WindConfig } from '../../types/config'

interface PrerenderPageContext {
    _prerenderResult: {
    filePath: string
    fileContent: string
  }
}

async function loadViteConfig (): Promise<InlineConfig> {
  try {
    const source = await loadConfig<WindConfig>({
      cwd: process.cwd(),
      sources: [
        {
          files: 'wind.config',
          extensions: ['ts', 'js', 'mjs']
        }
      ]
    })

    const wind = await Wind()

    return {
      root: process.cwd(),
      plugins: [
        vue(),
        vps({
          disableAutoFullBuild: true,
          pageFiles: {
            include: ['wind-ssg']
          }
        }),
        wind,
        ...(source.config?.vitePlugins ?? [])
      ],
      server: {
        port: 3000,
        host: true
      }
    }
  } catch (error) {
    throw new Error(`Failed to load ssg.config file: ${(error as Error).message}`)
  }
}

export const developCmd = command('develop')
  .description('Start the development server.')
  .action(async () => {
    const viteConfig = await loadViteConfig()
    const server = await createServer(viteConfig)

    await server.listen()
    server.printUrls()
  })

export const buildCmd = command('build')
  .description('Build the project.')
  .action(async () => {
    const viteConfig = await loadViteConfig()

    await build(viteConfig)
    await build({ ...viteConfig, build: { ssr: true } })

    await prerender({
      viteConfig,
      onPagePrerender: async (pageContext: PrerenderPageContext) => {
        const { filePath, fileContent } = pageContext._prerenderResult
        await fs.mkdir(path.dirname(filePath), { recursive: true })
        await fs.writeFile(filePath, fileContent)
      }
    })

    console.log('\nFinished building site.\n')
  })
