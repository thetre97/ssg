import { Key } from 'path-to-regexp'
import DataStore from '../src/lib/datastore'
import { CollectionItem } from './datastore'

export interface RoutePathFn {
  (item: CollectionItem, store: DataStore): string
}

/** Collections route configuration.
 * You can specify the collection this applies to, the template that should be used,
 * and the route each item should have.
 */
export interface Route {
  /** The name of the collection this route config applies to - should be the name returned from the
   * `createCollection` function, which is usually the `PascalCase` version of original collection name you specified.
   */
  collection: string
  /** Template name, without the `templates/` folder prefix, or the file extension.
   * Can also be a resolved path from `path.resolve('./templates/*.vue')`
  */
  template: string
  /** Specify a relative URL path for each collection item. You can specify a string with route params, or use a function which returns a string
   * if you need some custom logic.
   * If you specify a string with route params, you can use any key in the collection item as a parameter - just prefix it with `:`.
   * @example '/posts/:slug' - `/posts/hello-world`
   * @example '/posts/:date/:slug' - `/posts/2022-05-09/hello-world`
   *
   * If you specify a function, the current item and the datastore are passed in as arguments, and you should return a string
   * with the resolved URL.
   * @example (item) => `/posts/${item.date}/${item.slug}` - `/posts/2022-05-09/hello-world`
   */
  path: string | RoutePathFn
  /** A template must have a corresponding pageId from vite-plugin-ssr - we can usually guess this ahead of time, as we run before vps. */
  pageId?: string
}

/** Parsed route string, with the original path and the params needed. */
export interface RouteParamMeta {
  /** The original route specified by the user. */
  path: string
  /** A list of params within the route, that will be matched will collection node keys. */
  params: Key[]
}

export interface RouteMeta extends Route {
  /** If the used specified a string, we parse it to get the params we'll need. */
  parsedRoute: RouteParamMeta | null
}

export type RouteMap = Map<string, RouteMeta>

export type RouteItem = Record<string, CollectionItem>
