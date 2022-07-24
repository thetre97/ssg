import { defineConfig } from 'wind-ssg'
import WindiCSS from 'vite-plugin-windicss'


export default defineConfig({
  routes: [
    {
      collection: 'Post',
      template: 'Post',
      path: '/posts/:slug'
    }
  ],
  vitePlugins: [
    WindiCSS(),
  ]
})
