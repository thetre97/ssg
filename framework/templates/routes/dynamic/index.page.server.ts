import type { PageContextServer } from '@travisreynolds/ssg'

import routeTemplate from './index.page.route'

// We should use this in the datastore to autogenerate paths
const getPageRoute = (data) => {
  const params = {}
  const url = routeTemplate.split('/').map(str => {
    if (!str.includes(':')) return str

    const param = str.replace(':', '')
    const paramValue = Reflect.get(data, param)
    if (!paramValue) throw new Error(`Missing value in data for param ${param}`)

    Reflect.set(params, param, paramValue)
    return paramValue
  }).join('/')

  return { url, params }
}

export const pageQuery = 'query Post ($slug: String!){ post (slug: $slug) { id, title, content, coverImage }}'

export async function onBeforeRender (pageContext) {
  const variables = { slug: pageContext.routeParams.slug }
  const { data, errors } = await pageContext.datastore.graphql(pageQuery, variables)

  if (errors) throw new Error(errors[0].message)
  const post = data!.post

  return {
    pageContext: {
      pageProps: { post },
      documentProps: {}
    }
  }
}

export async function prerender (ctx: PageContextServer) {
  const postsCollection = ctx.datastore.store.getCollection('Post')

  return postsCollection.collection.data.flatMap((post) => {
    if (!post) return []
    return [{ url: post.path }]
  })
}
