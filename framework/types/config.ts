import { Route } from './router'
import { Plugin } from 'vite'

export interface WindConfig {
  routes: Route[],
  vitePlugins: Plugin[] | Plugin[][]
}
