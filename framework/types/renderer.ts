import type { PageContextBuiltIn } from 'vite-plugin-ssr'
import DataLayer from '../src/lib'

export interface PageContext extends PageContextBuiltIn {
  datalayer: DataLayer
  pageData?: Record<string, unknown>
  staticData?: Record<string, unknown>
  _allPageIds: string[]
  _pageId?: string
  Page: {
    pageQuery?: {
      query?: string
    }
  }
}
