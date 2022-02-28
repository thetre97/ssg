import * as vite from 'vite'
import bodyParser from 'body-parser'
import fs from 'fs'
import path from 'path'
import { createPageRenderer } from 'vite-plugin-ssr'
import { getGraphQLParameters, processRequest, renderGraphiQL, shouldRenderGraphiQL, sendResult, Request } from 'graphql-helix'
import { loadConfig } from 'unconfig'
import { prerender } from 'vite-plugin-ssr/cli'

// Utils
import { createDataStore } from './datastore'

// Types
import { DataStore } from 'types/datastore'
import type { ServerConfig } from 'types/server'
import { IncomingMessage } from 'http'
import { PrerenderContext } from 'types/render'

const root = path.resolve('.')

async function writePage ({ _prerenderResult }: PrerenderContext) {
  const fileFolder = path.dirname(_prerenderResult.filePath)
  fs.mkdirSync(fileFolder, { recursive: true })
  fs.writeFileSync(_prerenderResult.filePath, _prerenderResult.fileContent)
}

const SSG_BUNDLE_IMPORT_ID = '@ssg/data'

export function Plugin (): vite.Plugin {
  let datastore: DataStore
  let storedConfig: vite.UserConfig

  return {
    name: 'ssg-custom-blocks',
    enforce: 'pre',
    configResolved (config) {
      storedConfig = config as unknown as vite.UserConfig
    },
    resolveId (id: string) {
      if (id === SSG_BUNDLE_IMPORT_ID) {
        console.log('resolveId', id)
        return id
      }
    },
    load (id) {
      if (id === SSG_BUNDLE_IMPORT_ID) {
        console.log('wanting to load', id)
        return {
          code: 'export default \'test-string\''
        }
      }
    },
    async transform (code, id, options) {
      if (!/vue&type=page-query/.test(id)) return

      console.log('transforming:', id)
      if (options?.ssr) {
        // Run query in prerender fn
      }

      // Probably not a great idea to do this in prod, as we are storing all this data in JS.
      // So we could use the query export in SSR, then use that export in the VPS prerender fn
      // The idea of running the query here is that we can update the page-query query, and HMR will reload it with the new data
      try {
        const { data, errors } = await datastore.graphql(code)
        const pageData = { data, errors, query: code }
        return `export default Comp => {
          Comp.pageData = ${JSON.stringify(pageData)}
        }`
      } catch (error) {
        console.error(error)
      }
    },
    async buildStart () {
      const serverConfig = await loadConfig<ServerConfig>({
        sources: [
          {
            files: 'ssg.server',
            extensions: ['ts', 'js', 'mjs']
          }
        ]
      })

      datastore = await createDataStore()
      if (serverConfig?.config?.data) await serverConfig.config.data(datastore)
    },
    async closeBundle () {
      if (storedConfig.build?.ssr) {
        console.log('  > Prerendering site...')
        console.time('  Finished prerendering in')
        await prerender({ pageContextInit: { datastore }, onPagePrerender: writePage })
        console.timeEnd('  Finished prerendering in')
      }
    },
    configureServer (server) {
      const renderPage = createPageRenderer({ viteDevServer: server, isProduction: false, root })

      return () => {
        let graphqlEndpoint = ''
        server.httpServer?.once('listening', () => {
          graphqlEndpoint = `http://${server.config.server.host || 'localhost'}:${server.config.server.port || 3000}/graphql`

          setTimeout(() => {
            console.log(`  > GraphQL Explorer: ${graphqlEndpoint}`)
          }, 0)
        })

        server.middlewares.use(bodyParser.json())

        server.middlewares.use(async (req, res, next) => {
          if (req.originalUrl === '/graphql') {
            const request: Request = {
              body: (req as IncomingMessage & { body: any }).body,
              headers: req.headers,
              method: req.method || 'POST',
              query: {}
            }

            if (shouldRenderGraphiQL(request)) return res.end(renderGraphiQL({ endpoint: graphqlEndpoint }))

            const { operationName, query, variables } = getGraphQLParameters(request)
            const result = await processRequest({
              operationName,
              query,
              variables,
              request,
              schema: datastore.schema.getSchema()
            })

            return sendResult(result, res)
          }

          const pageContextInit = { url: req.originalUrl as string, datastore }
          const pageContext = await renderPage(pageContextInit)
          const { httpResponse } = pageContext
          if (!httpResponse) return next()
          const { body, statusCode, contentType } = httpResponse
          res.statusCode = statusCode
          res.setHeader('Content-Type', contentType).end(body)
        })
      }
    }
  }
}
