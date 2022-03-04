import type { PageContextServer } from '@travisreynolds/ssg'

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
