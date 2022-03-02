import { createServer, build, InlineConfig } from 'vite'
import { command } from 'bandersnatch'

// Vite Plugins
import vue from '@vitejs/plugin-vue'
import ssr from 'vite-plugin-ssr/plugin'
import { SSGPlugin } from '../plugin'

const viteConfig: InlineConfig = {
  root: process.cwd(),
  plugins: [
    vue(),
    ssr({
      pageFiles: {
        include: ['@travisreynolds/ssg']
      }
    }),
    SSGPlugin()
  ],
  server: {
    port: 3000,
    host: true
  }
}

export const developCmd = command('develop')
  .description('Start the development server.')
  .action(async () => {
    const server = await createServer(viteConfig)

    await server.listen()
    server.printUrls()
  })

export const buildCmd = command('build')
  .description('Build the project.')
  .action(async () => {
    await build(viteConfig)
    await build({
      ...viteConfig,
      build: {
        ssr: true
      }
    })
  })
