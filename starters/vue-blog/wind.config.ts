import {defineConfig} from 'wind-ssg'

export default defineConfig({
  routes: [
    {
      collection: 'Post',
      template: 'Post',
      path: '/posts/:slug'
    }
  ]
})
