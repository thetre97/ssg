import * as vite from 'vite'
import bodyParser from 'body-parser'
import fs from 'fs'
import path from 'path'
import serveStatic from 'serve-static'
import { createPageRenderer } from 'vite-plugin-ssr'
import { getDistDirectory, renderAltair, RenderOptions } from 'altair-static'
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

export function SSGPlugin (): vite.Plugin {
  let datastore: DataStore
  let storedConfig: vite.UserConfig

  return {
    name: 'ssg-custom-blocks',
    enforce: 'pre',
    configResolved (config) {
      storedConfig = config as unknown as vite.UserConfig
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

      // Load any data
      if (serverConfig?.config?.data) await serverConfig.config.data(datastore)
      // Also load any plugins that load data (probably should be before the above)

      // Now create schema stuff
      datastore.schema.createTypes()
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
        server.middlewares.use('/altair', serveStatic(getDistDirectory()))

        server.middlewares.use(async (req, res, next) => {
          if (req.originalUrl === '/altair') {
            const renderOptions: RenderOptions = {
              baseURL: '/altair/test',
              endpointURL: '/graphql'
            }
            const altairAsString = renderAltair(renderOptions)
            return res.end(altairAsString)
          }

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
