import { createSSRApp, defineComponent, h } from 'vue'
import PageShell from './PageShell.vue'
import { setPageData, pageDataKey } from './usePageData'

import { clientFn } from 'virtual:wind-client'

// Types
import { PageContext } from '../../../types/renderer'

export async function createApp (pageContext: PageContext) {
  const PageWithLayout = defineComponent({
    render () {
      return h(
        PageShell,
        {},
        {
          default () {
            return h(pageContext.Page, {})
          }
        }
      )
    }
  })

  const app = createSSRApp(PageWithLayout)
  setPageData(app, pageContext[pageDataKey])

  if (clientFn?.default) clientFn.default(app)

  return app
}
