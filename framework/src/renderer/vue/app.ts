import { createSSRApp, defineComponent, h } from 'vue'
import PageShell from './PageShell.vue'
import { setPageData } from './usePageData'

// Types
import { PageContext } from '../../../types/renderer'

export function createApp (pageContext: PageContext) {
  const { Page, pageData } = pageContext

  const PageWithLayout = defineComponent({
    render () {
      return h(
        PageShell,
        {},
        {
          default () {
            return h(Page, {})
          }
        }
      )
    }
  })

  const app = createSSRApp(PageWithLayout)

  setPageData(app, pageData)

  return app
}
