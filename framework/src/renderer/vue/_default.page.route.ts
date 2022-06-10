import { PageContext } from '../../../types/renderer'

export function onBeforeRoute ({ url }: PageContext) {
  // TODO: Create a list of template routes that we should ignore
  if (url.includes('templates')) return { pageContext: { _pageId: '/src/pages/404' } }

  const routes = global.__SSG_DATALAYER.router.fetchRoutes()
  const item = routes.get(url)

  if (item && item.pageId) {
    return {
      pageContext: {
        _pageId: item.pageId
      }
    }
  }
}
