/* eslint-disable no-undef */
import { App } from 'vue'
import { Plugin } from 'vite'
import { Route } from './router'

export interface WindConfig {
  routes: Route[],
  vitePlugins: Plugin[] | Plugin[][]
}

export interface WindClient {
  app: App<Element>
}
