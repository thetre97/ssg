import Loki, { Collection } from 'lokijs'
import { SchemaComposer, pluralize } from 'graphql-compose'
import { graphql as graphqlQuery } from 'graphql'
import { camelCase, pascalCase } from 'change-case'

// Types
import { DataStore, GraphQLExecutor, Store, StoreCollection } from '../types/datastore'

async function loadDB (): Promise<Loki> {
  return new Loki('ssg.db')
  // return new Promise((resolve, reject) => {
  //   const db = new Loki('ssg.db', {
  //     verbose: true,
  //     autosave: true,
  //     autoload: true,
  //     autoloadCallback: (err) => {
  //       if (err) reject(err)
  //       resolve(db)
  //     }
  //   })
  // })
}

const excludedFields = ['meta', '$loki']

function collectionFactory (db: Loki, schemaComposer: SchemaComposer): Store {
  /** Maps an items fields to their corresponding GraphQL type */
  const updateTypeFields = (name: string, item: object) => {
    const collectionTC = schemaComposer.getOrCreateOTC(pascalCase(name))
    const entries = Object.entries(item).filter(([key]) => !excludedFields.includes(key))

    const findType = (value: unknown) => {
      const typeOf = typeof value
      if (typeOf === 'number') return 'Float'
      if (typeOf === 'string') return 'String'
      if (typeOf === 'boolean') return 'Boolean'
      if (value instanceof Date) return 'Date'

      // Handle other types
      return 'JSON'
    }

    const fields = Object.fromEntries(entries.map(([key, value]) => [key, findType(value)]))
    collectionTC.addFields(fields)

    schemaComposer.Query.addFieldArgs(camelCase(name), fields)
  }

  /** Returns collection helper functions, I.e. adding/removing items from a collection */
  const databaseFunctions = (collection: Collection): StoreCollection => ({
    collection,
    add: (items: any | any[]): Collection => {
      const formattedItems = Array.isArray(items) ? items.map(item => ({ ...item, id: item.id.toString() })) : { ...items, id: items.id.toString() }
      collection.insert(formattedItems)

      if (Array.isArray(items)) items.forEach(item => updateTypeFields(collection.name, item))
      else updateTypeFields(collection.name, items)

      return collection
    }
  })

  return {
    /** Create a new collection with a specific name, and return the collection and helper functions. */
    createCollection: (name: string) => {
      if (!name) throw new Error('createCollection must be passed a name.')

      const collectionName = pascalCase(name)
      const collectionPluralName = pluralize(collectionName)

      const collection = db.addCollection(collectionName, { autoupdate: true })

      const fieldName = camelCase(collectionName)
      const fieldListName = camelCase(`all${collectionPluralName}`)

      const defaultFields = { id: 'ID!' }
      const collectionTC = schemaComposer.createObjectTC({ name: collectionName, fields: defaultFields })

      schemaComposer.Query.addFields({
        [fieldName]: {
          type: collectionTC,
          args: {
            id: 'ID!'
          },
          resolve: (_, args) => {
            return collection.findOne(args)
          }
        },
        [fieldListName]: {
          type: [collectionTC],
          resolve: () => collection.data
        }
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

function schemaFactory (db: Loki, schemaComposer: SchemaComposer) {
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
    graphql
  }
}

export async function createDataStore (): Promise<DataStore> {
  try {
    const db = await loadDB()
    const schemaComposer = new SchemaComposer()

    const store = collectionFactory(db, schemaComposer)
    const { graphql, ...schema } = schemaFactory(db, schemaComposer)

    return { store, schema, graphql }
  } catch (err) {
    const error = err as Error
    console.error(error.message)
    throw error
  }
}
