import { LokiOps } from 'lokijs'
import { RouteMeta } from './router'

type PartialModel<E, T> = { [P in keyof E]?: T | E[P] };
type LokiQuery<E> = PartialModel<E & { $and: any; $or: any }, { [Y in keyof LokiOps]?: any }>;

/**
 * ========================
 *  DataStore Types
 * ========================
 */

/** Specify collection options, like the primary key, unique keys, and a default route. */
export interface CollectionOptions {
  /** The collection primary key - usually ID. */
  primaryKey?: string
  /** Any unique keys that can be used as filters - for example ID, slug, title */
  uniqueKeys?: string[]
  /** A default route for this collection - for example `/posts/:slug` */
  route?: string
}

export interface CollectionCreate {
  /** Collection name - should be in camelCase, but will be formatted to various cases. */
  name: string
  /** Specify collection options, like the primary key, unique keys, and a default route. */
  options?: CollectionOptions
}

export interface CollectionGet {
  /** Collection name - must be the formatted name returned by `createCollection`. */
  name: string
}

export interface CollectionRemove {
  /** Collection name - must be the formatted name returned by `createCollection`. */
  name: string
}

/**
 * ========================
 *  Internal Types
 * ========================
 */
export interface CollectionRelationOptions {
  field: string
  type: string
  localKey: string
  foreignKey: 'id' | string
}

/** Collection metadata that is stored for use internally. */
export interface CollectionMeta {
  /** Loki collection name, and GraphQL typeName */
  name: string
  /** Loki collection primary key */
  primaryKey: string
  /** GraphQL Query field name */
  fieldName: string
  /** GraphQL Query list name */
  fieldListName: string,
  relations: CollectionRelationOptions[]
  /** Template route configuration. */
  route?: RouteMeta
}

export type CollectionsMetaMap = Map<string, CollectionMeta>

/**
 * ========================
 *  Collection Types
 * ========================
 */
export type CollectionItem = Record<string, unknown>
export interface CollectionItemWithMeta extends CollectionItem {
  id: string
  path?: string
  $loki: string
  meta: Record<string, unknown>
}

export type CollectionItemAdd<Item = CollectionItem> = Item | Item[]

export interface CollectionItemGet {
  key: string
}
export interface CollectionItemFind {
  query: LokiQuery<CollectionItem>
}

export interface CollectionItemRemove {
  key: string
}
