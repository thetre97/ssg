import { defineConfig } from 'vite'

// Vite Plugins
import vue from '@vitejs/plugin-vue'
import vps from 'vite-plugin-ssr/plugin'
import { Wind } from '../plugin'

export const config = defineConfig({
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
    Wind()
  ],
  server: {
    port: 3000,
    host: true
  }
})

export default (async function run () {
  //
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
      wind
    ],
    server: {
      port: 3000,
      host: true
    }
  }
}())
