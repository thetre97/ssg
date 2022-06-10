import { createServer, build, InlineConfig } from 'vite'
import { command } from 'bandersnatch'
import { loadConfig } from 'unconfig'
import path from 'path'

// Vite Plugins
import vue from '@vitejs/plugin-vue'
import vps from 'vite-plugin-ssr/plugin'
import { prerender } from 'vite-plugin-ssr/cli'

import { Wind } from '../plugin'

interface SSGConfig {
  vitePlugins: unknown[]
}

async function loadViteConfig (): Promise<InlineConfig> {
  try {
    const source = await loadConfig<SSGConfig>({
      cwd: process.cwd(),
      sources: [
        {
          files: 'ssg.config',
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
          prerender: true,
          disableBuildChaining: true,
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
    const viteConfigPath = path.resolve(__dirname, '../../src/cli', './vite.config.ts')
    const viteConfig = await loadViteConfig()
    process.env.WIND_LOAD_DATA = false
    await build(viteConfig)
    // TODO: Check this, if we run both these steps then we start Wind twice. SSR or client shouldn't need any data?
    await build({ ...viteConfig, build: { ssr: true } })
    console.log('LOAD DATA NOW!')
    process.env.WIND_LOAD_DATA = true
    await prerender({ configFile: viteConfigPath })
  })
