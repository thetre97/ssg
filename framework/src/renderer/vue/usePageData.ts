import { inject } from 'vue'
import type { App } from 'vue'

export const pageDataKey = 'ssgPageData'

export function usePageData<Type> () {
  const pageData = inject<Type>(pageDataKey)
  return pageData
}

export function setPageData (app: App, pageData: unknown) {
  app.provide(pageDataKey, pageData)
}
