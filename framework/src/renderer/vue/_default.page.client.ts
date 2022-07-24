// import { getPage } from 'vite-plugin-ssr/client'
import { createApp } from './app'

// Types
import { PageContext } from '../../../types/renderer'

export async function render (pageContext: PageContext) {
  const app = await createApp(pageContext)
  app.mount('#app')
}
