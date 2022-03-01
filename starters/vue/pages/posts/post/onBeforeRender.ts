export const pageQuery = 'query Post ($slug: String!){ post (slug: $slug) { id, title, content, coverImage }}'

export async function onBeforeRender (pageContext) {
  const variables = { slug: pageContext.routeParams.slug }
  const { data, errors } = await pageContext.datastore.graphql(pageQuery, variables)

  if (errors) throw new Error(errors[0].message)
  const post = data!.post

  return {
    pageContext: {
      pageProps: { post },
      documentProps: {
        title: post.title
      }
    }
  }
}
