import composeWithJson from 'graphql-compose-json'
import { SchemaComposer } from 'graphql-compose'
import { all as deepmerge } from 'deepmerge'
import { graphql as graphqlQuery, parse, printSchema } from 'graphql'
import path from 'node:path'
import fs from 'fs-extra'

import { codegen } from '@graphql-codegen/core'
import * as typescriptPlugin from '@graphql-codegen/typescript'

import utils from './utils'

// Types
import Loki from 'lokijs'
import { GraphQLQuery, GraphQLQueryResult } from '../../types/graphql'
import { CollectionsMetaMap } from '../../types/datastore'

// Schema Validators

export default class GraphQL {
  private reporter = utils.reporter.withScope('GraphQL')
  private schemaComposer = new SchemaComposer()

  private database: Loki
  private collectionsMetadata: CollectionsMetaMap

  private excludedFields = ['meta', '$loki']

  constructor (database: Loki, collectionsMetadata: CollectionsMetaMap) {
    this.database = database
    this.collectionsMetadata = collectionsMetadata

    utils.reporter.log('Created GraphQL')
  }

  lokiFilterTC = this.schemaComposer.createInputTC({
    name: 'LokiFiltersInput',
    fields: {
      eq: 'String',
      ne: 'String'
    }
  })

  /** Create types from all collections in the datastore */
  createTypes = () => {
    // TODO: Decide whether we should keep the root db in the datalayer, so we can access directly
    const collections = this.database.collections

    for (const collection of collections) {
      const collectionMeta = this.collectionsMetadata.get(collection.name)
      if (!collectionMeta) {
        this.reporter.warn(`No matching metadata for DB collection ${collection.name}`)
        continue
      }

      const objectWithAllKeys = deepmerge(collection.data)
      this.excludedFields.forEach(key => Reflect.deleteProperty(objectWithAllKeys, key))

      const TC = composeWithJson(collectionMeta.name, objectWithAllKeys)
      this.schemaComposer.createObjectTC(TC)

      // Probably need more complex mapping here, by checking the allObjectKeys value type
      const uniqueArgs = Array.from(new Set([...collection.uniqueNames, collectionMeta.primaryKey])).map(key => [key, key === collectionMeta.primaryKey ? 'ID' : 'String'])

      // And similar here, but we also want to provide the Loki filtering functionality, so need to allow nested types
      // (using a basic InputType for key types, like LokiFilterInput = { $eq: String })

      const allFieldArgs = Object.keys(objectWithAllKeys).map(key => [key, this.lokiFilterTC])

      this.schemaComposer.Query.addFields({
        [collectionMeta.fieldName]: {
          type: TC,
          args: Object.fromEntries(uniqueArgs),
          resolve: (_, args) => {
            if (Reflect.has(args, collectionMeta.primaryKey)) return collection.by(collectionMeta.primaryKey, Reflect.get(args, collectionMeta.primaryKey))
            return collection.findOne(args)
          }
        },
        [collectionMeta.fieldListName]: {
          type: [TC],
          args: {
            limit: 'Int',
            skip: 'Int',
            filter: this.schemaComposer.createInputTC({
              name: `${collectionMeta.name}FilterInput`,
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

    utils.reporter.log('Created GraphQL Types')
  }

  /** Build and return the GraphQL Schema */
  schema = () => {
    utils.reporter.log('Fetched GraphQL Types')

    return this.schemaComposer.buildSchema({
      keepUnusedTypes: true
    })
  }

  /** Run a GraphQL query against the schema, and return the result. */
  query = (input: GraphQLQuery): GraphQLQueryResult => {
    return graphqlQuery({
      // TODO: Schema - we should use a cached version here, as this will likely be called multiple times in quick succession
      schema: this.schema(),
      variableValues: input.variables,
      source: input.query
    })
  }

  /** Generate GraphQL Types */
  generate = async () => {
    const outputDir = path.resolve(process.cwd(), 'generated')
    const outputFile = path.join(outputDir, 'graphql.ts')
    utils.reporter.log(`Creating codegen file at ${outputFile}`)

    await fs.ensureDir(outputDir)

    const output = await codegen({
      documents: [],
      config: {},
      // used by a plugin internally, although the 'typescript' plugin currently
      // returns the string output, rather than writing to a file
      filename: outputFile,
      schema: parse(printSchema(this.schema())),
      plugins: [
        // Each plugin should be an object
        {
          typescript: {} // Here you can pass configuration to the plugin
        }
      ],
      pluginMap: {
        typescript: typescriptPlugin
      }
    })

    await fs.writeFile(outputFile, output)
  }
}
