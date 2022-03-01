import Loki, { Collection } from 'lokijs'
import composeWithJson from 'graphql-compose-json'
import { SchemaComposer, pluralize } from 'graphql-compose'
import { all as deepmerge } from 'deepmerge'
import { camelCase, pascalCase } from 'change-case'
import { graphql as graphqlQuery } from 'graphql'

// Types
import { DataStore, GraphQLExecutor, Schema, Store, StoreCollection } from '../types/datastore'

async function loadDB (): Promise<Loki> {
  return new Loki('ssg.db')
}

const excludedFields = ['meta', '$loki']

function collectionFactory (db: Loki, schemaComposer: SchemaComposer): Store {
  const collectionMap: Store['collectionMap'] = new Map()

  /** Returns collection helper functions, I.e. adding/removing items from a collection */
  const databaseFunctions = (collection: Collection): StoreCollection => ({
    collection,
    add: (items: any | any[]): Collection => {
      const formattedItems = Array.isArray(items) ? items.map(item => ({ ...item, id: item.id.toString() })) : { ...items, id: items.id.toString() }
      collection.insert(formattedItems)

      return collection
    }
  })

  return {
    collectionMap,
    /** Create a new collection with a specific name, and return the collection and helper functions. */
    createCollection: (name: string) => {
      if (!name) throw new Error('createCollection must be passed a name.')

      const collectionName = pascalCase(name)
      const collectionPluralName = pluralize(collectionName)
      const fieldName = camelCase(collectionName)
      const fieldListName = camelCase(`all${collectionPluralName}`)

      collectionMap.set(collectionName, { name: collectionName, fieldName, fieldListName })
      const collection = db.addCollection(collectionName, {
        autoupdate: true,
        // Let persons add unique keys
        indices: ['id', 'slug'],
        unique: ['id', 'slug']
      })

      return databaseFunctions(collection)
    },
    /** Get a collection by its name */
    getCollection: (name: string) => {
      const collectionName = pascalCase(name)
      const collection = db.getCollection(collectionName)
      if (!collection) throw new Error(`No collection found for ${name} (normalized to ${collectionName})`)

      return databaseFunctions(collection)
    }
  }
}

function schemaFactory (db: Loki, store: Store, schemaComposer: SchemaComposer) {
  const createTypes: Schema['createTypes'] = () => {
    for (const collection of db.collections) {
      const meta = store.collectionMap.get(collection.name)
      if (!meta) throw new Error(`Missing meta information for collection ${collection.name}`)

      const allObjectKeys = deepmerge(collection.data)
      excludedFields.forEach(key => Reflect.deleteProperty(allObjectKeys, key))

      const TC = composeWithJson(meta.name, allObjectKeys)
      schemaComposer.createObjectTC(TC)

      // Probably need more complex mapping here, by checking the allObjectKeys value type
      const uniqueArgs = Array.from(new Set([...collection.uniqueNames, 'id'])).map(key => [key, key === 'id' ? 'ID' : 'String'])

      // And similar here, but we also want to provide the Loki filtering functionality, so need to allow nested types
      // (using a basic InputType for key types, like LokiFilterInput = { $eq: String })
      const lokiFilterTC = schemaComposer.createInputTC({
        name: 'LokiFiltersInput',
        fields: {
          eq: 'String',
          ne: 'String'
        }
      })
      const allFieldArgs = Object.keys(allObjectKeys).map(key => [key, lokiFilterTC])

      schemaComposer.Query.addFields({
        [meta.fieldName]: {
          type: TC,
          args: Object.fromEntries(uniqueArgs),
          resolve: (_, args) => {
            if (args.id) return collection.get(args.id)
            return collection.findOne(args)
          }
        },
        [meta.fieldListName]: {
          type: [TC],
          args: {
            limit: 'Int',
            skip: 'Int',
            filter: schemaComposer.createInputTC({
              name: `${meta.name}FilterInput`,
              fields: Object.fromEntries(allFieldArgs)
            })
          },
          resolve: (_, args: { skip: number, limit: number, filter: Record<string, Record<string, string>>}) => {
            const argKeys = Object.keys(args)
            if (!argKeys.length) return collection.data

            let data = collection.data

            // Could create some Loki views, to add filters?
            if (args.filter) {
              const filters = Object.entries(args.filter).map(([key, filters]) => {
                const transformedKeys = Object.entries(filters).map(([key, value]) => [`$${key}`, value])
                return [key, Object.fromEntries(transformedKeys)]
              })

              if (filters.length) {
                data = collection.find(Object.fromEntries(filters))
              }
            }

            return data.slice(args.skip ?? 0, args.limit)
          }
        }
      })
    }
  }

  const getSchema = () => schemaComposer.buildSchema()
  const graphql: GraphQLExecutor = (query, variables) => {
    return graphqlQuery({
      schema: getSchema(),
      variableValues: variables,
      source: query
    })
  }
  return {
    getSchema,
    createTypes,
    graphql
  }
}

export async function createDataStore (): Promise<DataStore> {
  try {
    const db = await loadDB()
    const schemaComposer = new SchemaComposer()

    const store = collectionFactory(db, schemaComposer)
    const { graphql, ...schema } = schemaFactory(db, store, schemaComposer)

    return { store, schema, graphql }
  } catch (err) {
    const error = err as Error
    console.error(error.message)
    throw error
  }
}
