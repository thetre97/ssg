import { createServer, build, InlineConfig } from 'vite'
import { command } from 'bandersnatch'
import { loadConfig } from 'unconfig'

// Vite Plugins
import vue from '@vitejs/plugin-vue'
import vps from 'vite-plugin-ssr/plugin'
import { WindSSG } from '../plugin'

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

    return {
      root: process.cwd(),
      plugins: [
        vue(),
        vps({
          prerender: true,
          pageFiles: {
            include: ['wind-ssg']
          }
        }),
        WindSSG(),
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
  })
