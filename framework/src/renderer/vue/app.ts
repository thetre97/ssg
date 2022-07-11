import { createSSRApp, defineComponent, h } from 'vue'
import PageShell from './PageShell.vue'
import { setPageData, pageDataKey } from './usePageData'

// Types
import { PageContext } from '../../../types/renderer'

export function createApp (pageContext: PageContext) {
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

  return app
}
