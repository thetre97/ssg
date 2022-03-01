import vue from '@vitejs/plugin-vue'
import ssr from 'vite-plugin-ssr/plugin'
import ssg from '@travisreynolds/ssg'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    vue(),
    ssr({
      pageFiles: {
        include: ['@travisreynolds/ssg']
      }
    }),
    ssg()
  ]
})
