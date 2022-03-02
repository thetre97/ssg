import { command } from 'bandersnatch'
import * as Eta from 'eta'
import path from 'path'
import pkgDir from 'pkg-dir'
import fs, { ensureDir } from 'fs-extra'
import pMap from 'p-map'
import { singularize } from 'inflection'
import { camelCase } from 'change-case'

export const testRoute = command('test').action(() => {
  const packageRoot = pkgDir.sync(__dirname)
  console.log(packageRoot)
})

// Generate a new dynamic route
export const dynamicRouteCmd = command('generate:route')
  .description('Generate a new route')
  .argument('routeType', {
    description: 'Choose a type of route to generate',
    choices: ['dynamic'],
    default: 'dynamic',
    type: 'string',
    prompt: true
  })
  .argument('name', {
    description: 'Choose a name for this route',
    type: 'string',
    prompt: true
  })
  .argument('type', {
    description: 'Choose a DB type that this route will apply to',
    type: 'string',
    prompt: true
  })
  .argument('route', {
    description: 'Choose the URL pathname for this route',
    type: 'string',
    prompt: true
  })
  .action(async ({ routeType = 'dynamic', name, type, route }) => {
    if (!name) throw new Error('Missing route name.')

    const pkgRoot = await pkgDir(__dirname)
    const projectRoot = await pkgDir(process.cwd())
    if (!pkgRoot) throw new Error('Could not find the plugin root folder.')
    if (!projectRoot) throw new Error('Could not find the project root folder - make sure you are running in the correct folder.')

    if (routeType === 'dynamic') {
      if (!route) throw new Error('Missing route pathname for dynamic route.')
      if (!type) throw new Error('Missing route data type.')

      const typeName = camelCase(type)
      const typeNameSingle = singularize(typeName)

      const templateDir = path.join(pkgRoot, 'templates/routes/dynamic')
      const templateFiles = await fs.readdir(templateDir)
      const templateFilesData = await pMap(templateFiles, async filePath => {
        const data = await fs.readFile(path.join(templateDir, filePath), 'utf-8')
        return { path: filePath, data }
      })

      const routeParams = route.split('/').filter(str => str.includes(':')).map(str => str.replace(':', ''))
      const templateData = {
        route: {
          name: name,
          path: route,
          params: routeParams
        },
        type: {
          type: typeName,
          single: typeNameSingle
        }
      }

      const destinationFolderPath = path.join(projectRoot, 'pages', templateData.route.name)
      await ensureDir(destinationFolderPath)

      await pMap(templateFilesData, async (file) => {
        const rendered = await Eta.renderAsync(file.data, templateData)
        if (!rendered) throw new Error(`Failed to render template ${file.path}`)

        const renderedFilePath = path.join(destinationFolderPath, file.path)
        await fs.writeFile(renderedFilePath, rendered)
      })
    }
  })
