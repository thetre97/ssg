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

  // TODO: Rename this as routesMap, and use this property to store a cached list of routes
  private routes: RouteMap

  constructor (database: Loki, collections: CollectionsMetaMap, routes: RouteMap) {
    this.database = database
    this.collections = collections
    this.routes = routes

    utils.reporter.log('Created Router')
  }

  /** Load routes from a Wind config file */
  loadRoutes = (routes: Route[]) => {
    utils.assertArguments(routes, WindConfigRoutesSchema, this.reporter)

    for (const route of routes) {
      let parsedRoute: RouteMeta['parsedRoute'] = null

      if (typeof route.path === 'string') {
        const params: Key[] = []
        pathToRegexp(route.path, params, { encode: encodeURIComponent })
        parsedRoute = { params, path: route.path }
      }

      // TODO: We guess the vps pageId, but we may need to update this in future if vps changes its ID's, or we allow templates in different folders.
      const presumedPageId = `/src/templates/${route.collection}`

      this.routes.set(route.collection, {
        ...route,
        parsedRoute,
        pageId: presumedPageId
      })
    }
  }

  /**
   * Fetch a list of all routes, and their corresponding collection items.
   * TODO: As this is mostly used by vps, we could accept an input of all pageIds, so we can check we have correctly guessed them.
   * TODO: Memoize this function - OR, store a list of routes, and call this function to update them.
   * */
  fetchRoutes = () => {
    // TODO: Cache this, and only update if we update our routes
    const routes = Array.from(this.routes)

    const collectionItems = routes.flatMap<[string, CollectionItemWithMeta]>(([collectionName, routeMeta]) => {
      const collection = this.database.getCollection<CollectionItemWithMeta>(collectionName)
      if (!collection) return []
      return collection.data.flatMap<[string, CollectionItemWithMeta]>(item => {
        Reflect.set(item, 'pageId', routeMeta.pageId)
        return item.path ? [[item.path, item]] : []
      })
    })

    return new Map(collectionItems)
  }
}
