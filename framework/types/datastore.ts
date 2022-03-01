import type { Collection } from 'lokijs'
import type { ExecutionResult, GraphQLSchema } from 'graphql'
import type { ObjMap } from 'graphql-compose'
import type { PageContextBuiltIn } from 'vite-plugin-ssr'
import type { PageContextBuiltInClient } from 'vite-plugin-ssr/client'

export interface Schema {
  getSchema: () => GraphQLSchema
  createTypes: () => void
}

export interface StoreCollection {
  collection: Collection
  add: (items: unknown | unknown[]) => Collection
}

export interface StoreCollectionMeta {
  /** Loki collection name, and GraphQL typeName */
  name: string
  /** GraphQL Query field name */
  fieldName: string
  /** GraphQL Query list name */
  fieldListName: string
}

export interface Store {
  collectionMap: Map<string, StoreCollectionMeta>
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
