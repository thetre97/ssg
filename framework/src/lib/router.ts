import { array, func, object, string, union } from 'superstruct'
import utils from './utils'

// Types
import type { CollectionItemWithMeta, CollectionsMetaMap } from '../../types/datastore'
import type Loki from 'lokijs'
import type { Route, RouteMap, RouteMeta } from '../../types/router'
import { Key, pathToRegexp } from 'path-to-regexp'

const WindConfigRoutesSchema = array(object({
  collection: string(),
  template: string(),
  path: union([string(), func()])
}))

export default class Router {
  private reporter = utils.reporter.withScope('router')

  private database: Loki
  private collections: CollectionsMetaMap
  private routes: RouteMap

  constructor (database: Loki, collections: CollectionsMetaMap, routes: RouteMap) {
    this.database = database
    this.collections = collections
    this.routes = routes

    utils.reporter.log('Created Router')
  }

  loadRoutes = (routes: Route[]) => {
    utils.assertArguments(routes, WindConfigRoutesSchema, this.reporter)

    for (const route of routes) {
      let parsedRoute: RouteMeta['parsedRoute'] = null

      if (typeof route.path === 'string') {
        const params: Key[] = []
        pathToRegexp(route.path, params, { encode: encodeURIComponent })
        parsedRoute = { params, path: route.path }
      }

      // We also need to check for a template, get it's path, and set it as the template id...

      this.routes.set(route.collection, {
        ...route,
        parsedRoute
      })
    }
  }

  fetchRoutes = () => {
    const routes = Array.from(this.routes)

    const collectionsWithRoutes = routes.flatMap<CollectionItemWithMeta>(([collectionName]) => {
      const collection = this.database.getCollection<CollectionItemWithMeta>(collectionName)
      return collection ? collection.data : []
    })

    const collectionItemsWithRoutes = collectionsWithRoutes.flatMap<[string, CollectionItemWithMeta]>(item => {
      return item.path ? [[item.path, item]] : []
    })

    return new Map(collectionItemsWithRoutes)
  }
}
