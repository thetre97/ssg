import { PageContext } from '../../../types/renderer'

export function onBeforeRoute ({ url }: PageContext) {
  console.log('onBeforeRoute', { url })
  // If we have this current url in our pages datastore, associate it with the relevant template (pageId).
  const pageId = '/src/templates/Post'

  if (pageId) {
    return {
      pageContext: {
        _pageId: pageId
      }
    }
  }
}
