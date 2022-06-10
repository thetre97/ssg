import { PageContext } from '../../../types/renderer'

export function onBeforeRoute ({ url }: PageContext) {
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
