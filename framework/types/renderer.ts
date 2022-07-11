import type { PageContextBuiltIn } from 'vite-plugin-ssr'
import { pageDataKey } from '../src/renderer/vue'
import DataLayer from '../src/lib'

export interface PageContext extends PageContextBuiltIn {
  datalayer: DataLayer
  [pageDataKey]?: Record<string, unknown>
  staticData?: Record<string, unknown>
  _allPageIds: string[]
  _pageId?: string
  Page: {
    pageQuery?: {
      query?: string
    }
  }
}
