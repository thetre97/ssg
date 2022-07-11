// import { getPage } from 'vite-plugin-ssr/client'
import { createApp } from './app'

// Types
import { PageContext } from '../../../types/renderer'

export async function render (pageContext: PageContext) {
  console.log(pageContext)
  const app = createApp(pageContext)
  app.mount('#app')
}
