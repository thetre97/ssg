
import Loki, { Collection as LokiCollection } from 'lokijs'
import utils from './utils'
import { camelCase, pascalCase } from 'change-case'
import { object, string, array, optional, defaulted, Describe, coerce, union } from 'superstruct'
import { compile as compilePath, PathFunction } from 'path-to-regexp'
import { pluralize } from 'graphql-compose'
import { nanoid } from 'nanoid'

// Types
import {
  CollectionCreate,
  CollectionGet,
  CollectionItem,
  CollectionItemAdd,
  CollectionItemFind,
  CollectionItemGet,
  CollectionItemRemove,
  CollectionMeta,
  CollectionRemove,
  CollectionsMetaMap
} from '../../types/datastore'
import { RouteMap } from '../../types/router'

// Validation Schemas
const CollectionCreateSchema: Describe<CollectionCreate> = object({
  name: string(),
  options: optional(object({
    primaryKey: optional(defaulted(string(), 'id')),
    uniqueKeys: optional(array(string())),
    route: optional(string())
  }))
})

const CollectionGetSchema: Describe<CollectionGet> = object({
  name: coerce(string(), string(), value => pascalCase(value))
})

const CollectionRemoveSchema: Describe<CollectionRemove> = object({
  name: coerce(string(), string(), value => pascalCase(value))
})

const CollectionItemAddSchema: Describe<CollectionItemAdd> = union([object(), array(object())])
const CollectionItemGetSchema: Describe<CollectionItemGet> = object({ key: string() })
const CollectionItemRemoveSchema: Describe<CollectionItemRemove> = object({ key: string() })

export class Collection {
  private reporter = utils.reporter.withScope('collection')
  private collection: LokiCollection
  private meta: CollectionMeta
  private datastore: DataStore

  createPath: PathFunction<object> | undefined

  constructor (collection: LokiCollection, meta: CollectionMeta, datastore: DataStore) {
    this.collection = collection
    this.meta = meta
    this.datastore = datastore

    // If we have a string route with params, precompile the path formatter function
    if (meta.route?.parsedRoute?.path) {
      this.createPath = compilePath(meta.route.parsedRoute.path ?? '', { encode: encodeURIComponent })
    }
  }

  private formatItem = (item: Record<string, unknown>) => {
    const { route } = this.meta

    // If we have a string route with params, make sure we have all the params we need.
    if (route?.parsedRoute?.params) {
      for (const param of route.parsedRoute.params) {
        if (!Reflect.has(item, param.name)) throw new Error(`Item ${item.id} is missing a required route parameter: ${param.name}`)
      }
    }

    const id = item.id as string | number ?? nanoid()

    // TODO: Add a check here to make sure we aren't duplicating paths /and or ID's
    // TODO: Decide whether to allow a user to add a path field to override this.
    // TODO: Add a URL parsing library to normalize URL's, to make sure we aren't parsing in `/posts//1`
    const path = this.createPath
      ? this.createPath(item)
      : typeof route?.path === 'function'
        ? route.path(item, this.datastore)
        : undefined

    const template = this.meta.route?.template
    return { ...item, id, path, template }
  }

  /** Add a single item, or an array of items, to the current collection. */
  public add = (input: CollectionItemAdd): void => {
    utils.assertArguments(input, CollectionItemAddSchema, this.reporter)

    const items = Array.isArray(input) ? input : [input]
    // TODO: Could add a check here to make sure there are no duplicate items if we have an array
    const formattedItems = items.map(item => this.formatItem(item))

    this.collection.insert(formattedItems)

    this.reporter.log(`Added ${formattedItems.length} items to ${this.collection.name} collection`)
  }

  /** Get a single item from the collection by its primary key (usually ID). */
  public get = (input: CollectionItemGet): CollectionItem => {
    utils.assertArguments(input, CollectionItemGetSchema, this.reporter)

    const item = this.collection.by(this.meta.primaryKey, input.key)
    return item ?? undefined
  }

  /** Find items using a specific query */
  public find = (input: CollectionItemFind): CollectionItem[] => {
    const items = this.collection.find(input)

    this.reporter.log(`Found ${items.length} matching query in ${this.collection.name} collection`)
    return items
  }

  /** Retrive an array of all items in the current collection. */
  public list = () => {
    const items = this.collection.data
    this.reporter.log(`Listing ${items.length} items in ${this.collection.name} collection`)
    return items
  }

  /** Remove an item */
  public remove = (input: CollectionItemRemove): void => {
    utils.assertArguments(input, CollectionItemRemoveSchema, this.reporter)

    const item = this.collection.by(this.meta.primaryKey, input.key)
    if (!item) {
      this.reporter.warn(`No item with key ${input.key} was found in the collection - ignoring`)
      return
    }

    this.collection.remove(item)

    this.reporter.log(`Removed ${item.key} item from the ${this.collection.name} collection`)
  }
}

export default class DataStore {
  private reporter = utils.reporter.withScope('datastore')

  private db: Loki
  private metadata: CollectionsMetaMap
  private routes: RouteMap

  constructor (database: Loki, metadata: CollectionsMetaMap, routes: RouteMap) {
    this.db = database
    this.metadata = metadata
    this.routes = routes

    utils.reporter.log('Created DataStore')
  }

  // Create Relations

  /** Add a collection to the database, specifying the collection name and options. */
  public createCollection = (input: CollectionCreate): Collection => {
    utils.assertArguments(input, CollectionCreateSchema, this.reporter)

    const collectionName = pascalCase(input.name)
    const collectionPluralName = pluralize(collectionName)
    const fieldName = camelCase(collectionName)
    const fieldListName = camelCase(`all${collectionPluralName}`)

    this.reporter.log('Creating new collection:')
    this.reporter.log({
      collectionName,
      collectionPluralName,
      fieldName,
      fieldListName
    })

    const primaryKey = input.options?.primaryKey ?? 'id'
    const uniqueKeys = new Set(['path', primaryKey, ...(input.options?.uniqueKeys ?? [])])

    // Here we find our route
    const route = this.routes.get(collectionName)

    const collectionMeta: CollectionMeta = {
      name: collectionName,
      primaryKey,
      fieldName,
      fieldListName,
      relations: [],
      route
    }

    this.metadata.set(collectionName, collectionMeta)

    const collection = this.db.addCollection(collectionName, {
      autoupdate: true,
      indices: input.options?.primaryKey ?? 'id',
      unique: Array.from(uniqueKeys)
    })

    return new Collection(collection, collectionMeta, this)
  }

  /** Get a single collection, specifying its name. */
  public getCollection = (input: CollectionGet): Collection => {
    const { name } = utils.createArguments(input, CollectionGetSchema, this.reporter)

    const collectionMeta = this.metadata.get(name)
    if (!collectionMeta) {
      this.reporter.error(`No collection exists with the name ${name}`)
      throw new Error(`No collection exists with the name ${name}`)
    }

    const collection = this.db.getCollection(name)

    this.reporter.log(`Found collection ${name}`)
    return new Collection(collection, collectionMeta, this)
  }

  /** List all collections currently in the database. */
  public listCollections = (): Collection[] => {
    const collections = this.db.collections

    this.reporter.log(`Listing ${collections.length} collections in the database`)

    return collections.flatMap(collection => {
      const collectionMeta = this.metadata.get(collection.name)
      if (!collectionMeta) return []
      return [new Collection(collection, collectionMeta, this)]
    })
  }

  /** Remove a collection from the database, specifying the database name. */
  public removeCollection = (input: CollectionRemove): void => {
    const { name } = utils.createArguments(input, CollectionRemoveSchema, this.reporter)

    const hasCollection = this.metadata.has(name)
    if (!hasCollection) utils.throwPrettyError(`No collection exists with the name ${name}`, this.reporter)

    this.db.removeCollection(name)
    this.metadata.delete(name)

    this.reporter.log(`Removed collection ${name} from the database`)
  }

  /** Get the root database instance, to manually interact with it. */
  _getDB (): Loki {
    this.reporter.warn('You are accessing the DB instance directly - be careful!')
    return this.db
  }
}
