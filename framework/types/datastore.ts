import type { Collection } from 'lokijs'
import type { ExecutionResult, GraphQLSchema } from 'graphql'
import type { ObjMap } from 'graphql-compose'
import type { PageContextBuiltIn } from 'vite-plugin-ssr'
import type { PageContextBuiltInClient } from 'vite-plugin-ssr/client'

export interface Schema {
  getSchema: () => GraphQLSchema
}

export interface StoreCollection {
  collection: Collection
  add: (items: unknown | unknown[]) => Collection
}

export interface Store {
  createCollection: (name: string) => StoreCollection
  getCollection: (name: string) => StoreCollection
}

export type GraphQLExecutor = (query: string, variables?: Record<string, unknown>) => Promise<ExecutionResult<ObjMap<unknown>, ObjMap<unknown>>>

export interface DataStore {
  store: Store
  schema: Schema
  graphql: GraphQLExecutor
}

export interface PageContextServer extends PageContextBuiltIn {
  datastore: DataStore
}
export interface PageContextClient extends PageContextBuiltInClient {
  datastore: DataStore
}
