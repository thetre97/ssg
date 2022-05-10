import { renderToString } from '@vue/server-renderer'
import { escapeInject, dangerouslySkipEscape } from 'vite-plugin-ssr'
import { createApp } from './app'

import { pageDataKey } from './usePageData'

// Types
import type { PageContext } from '../../../types/renderer'

export const passToClient = ['pageProps', 'urlPathname', pageDataKey]

export async function render (pageContext: PageContext) {
  const app = createApp(pageContext)
  const appHtml = await renderToString(app)

  const title = 'Vite SSR app'
  const desc = 'App using Vite + vite-plugin-ssr'

  const documentHtml = escapeInject`<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="${desc}" />
        <title>${title}</title>
      </head>
      <body>
        <div id="app">${dangerouslySkipEscape(appHtml)}</div>
      </body>
    </html>`

  return { documentHtml }
}

export async function onBeforeRender ({ datalayer, url, Page }: PageContext) {
  const pageQuery = Page.pageQuery?.query
  if (pageQuery) {
    // TODO: This should be cached somewhere
    const routes = datalayer.router.fetchRoutes()
    const item = routes.get(url)

    // Now use this as variables in the query?
    const { data, errors } = await datalayer.graphql.query({
      query: pageQuery,
      variables: item
    })

    if (errors) {
      return errors.forEach(error => console.error(error.message))
    }

    if (data) {
      return {
        pageContext: { pageData: data }
      }
    }
  }
}

export function prerender () {
  // Here, we should fetch all routes and their data, and return as an array.
  const routes = global.datalayer.router.fetchRoutes()

  console.log('global prerender')
}
