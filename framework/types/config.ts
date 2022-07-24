/* eslint-disable no-undef */
import { Route } from './router'
import { Plugin } from 'vite'
import { App } from 'vue'

export interface WindConfig {
  routes: Route[],
  vitePlugins: Plugin[] | Plugin[][]
}

export interface WindClient {
  app: App<Element>
}
