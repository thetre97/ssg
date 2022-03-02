import { PageContextClient } from '@travisreynolds/ssg'

export const pageQuery = 'query Data ($id: ID!){ item: <%= it.type.single %> (id: $id) { id }}'

export async function onBeforeRender (pageContext: PageContextClient) {
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
