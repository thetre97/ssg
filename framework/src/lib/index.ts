import Loki from 'lokijs'
import _jiti from 'jiti'
import { createHooks, Hookable, HookKeys, Hooks } from 'hookable'
import fg from 'fast-glob'

import DataStore from './datastore'
import GraphQL from './graphql'
import utils from './utils'

// Types
import type { CollectionItem, CollectionsMetaMap } from '../../types/datastore'
import { WindConfig } from '../../types/config'
import Router from './router'
import { RouteMap } from '../../types/router'

export interface DataLayerHooks {
  loadSource: (store: DataStore) => void
  onCreateNode: <Item = CollectionItem>(node: Item, store: DataStore) => void
  afterData: (store: DataStore) => void
  createSchema: (graphql: GraphQL, store: DataStore) => void
  afterSchema: (graphql: GraphQL, store: DataStore) => void
  createPages: () => void
  bootstrapped: () => void
  afterBuild: () => void
}

export type ServerHooks = Hookable<Hooks, HookKeys<DataLayerHooks>>

export type ServerConfigFn = (server: ReturnType<typeof serverConfigSetup>) => void

function serverConfigSetup (hooks: ServerHooks) {
  return {
    loadSource: (fn: (store: DataStore) => void) => hooks.hook('loadSource', fn),
    afterBuild: () => {}
  }
}

const jiti = _jiti(process.cwd(), { requireCache: false, cache: false, v8cache: false })

/** Initialise our database, GraphQL schema, and return public methods. */
export default class Wind {
  // TODO: Look at IOC for all this
  private database = new Loki('wind-ssg')
  private collections: CollectionsMetaMap = new Map()
  private routes: RouteMap = new Map()

  private reporter = utils.reporter.withScope('DataLayer')

  public datastore: DataStore
  public router: Router
  public graphql: GraphQL

  public hooks = createHooks<DataLayerHooks>()

  constructor () {
    const datastore = new DataStore(this.database, this.collections, this.routes)
    const router = new Router(this.database, this.collections, this.routes)
    const graphql = new GraphQL(this.database, this.collections)

    this.datastore = datastore
    this.graphql = graphql
    this.router = router

    this.reporter.log('Loaded Wind')
  }

  // TODO: None of this really relates to the datalayer - I will likely refactor this, or just rename to Wind? As opposed to the Vite plugin

  /** Bootstraps the DataLayer
   * 0. Loads user config
   * 1. Runs user data hooks
   * 2. Fires data finished hook
   * 3. Builds schema
   * 4. Runs user schema hooks
   * 5. Fires schema finished hook
   * 6. Runs routing fn
   * 6. Runs user routing hooks
   * 8. Fires bootstrap hooks
   */
  async start () {
    this.reporter.log('Bootstrapping DataLayer')

    const windConfig = await this.loadConfig<WindConfig>('config')
    if (windConfig?.routes) this.router.loadRoutes(windConfig.routes)

    const serverFn = serverConfigSetup(this.hooks)
    const serverConfig = await this.loadConfig<ServerConfigFn>('server')
    if (serverConfig) serverConfig(serverFn)

    await this.hooks.callHook('loadSource', this.datastore)
    await this.hooks.callHook('afterData', this.datastore)

    this.graphql.createTypes()
    await this.hooks.callHook('createSchema', this.graphql, this.datastore)
    await this.hooks.callHook('afterSchema', this.graphql, this.datastore)

    await this.graphql.generate()
  }

  loadConfig = async <T>(type: 'server' | 'client' | 'config'): Promise<T | undefined> => {
    this.reporter.log(`Loading Wind ${type} file`)
    const [entry] = await fg(`wind.${type}.{js,ts,mjs}`, {
      cwd: process.cwd(),
      absolute: true,
      caseSensitiveMatch: false,
      onlyFiles: true
    })

    if (entry) {
      const src = jiti(entry)
      this.reporter.log('Loaded file')
      return src.default
    }
  }
}
