import type { PageContextServer } from '@travisreynolds/ssg'

// import { pageQuery } from '../post/onBeforeRender'

export async function onBeforeRender (ctx: PageContextServer) {
  const posts = await fetchPosts(ctx.datastore)
  return {
    pageContext: {
      pageProps: { posts },
      documentProps: { title: getTitle(posts) }
    }
  }
}

async function fetchPosts ({ graphql }: PageContextServer['datastore']): Promise<any[]> {
  const { data, errors } = await graphql('{ allPosts { id, title, slug } }') as any
  if (errors) throw new Error(errors[0].message)
  return data.allPosts
}

export async function prerender (ctx: PageContextServer) {
  const posts = await fetchPosts(ctx.datastore)

  // TODO: Working out how best to extract only the fields needed here,
  // as otherwise we embed the whole doc from the above query.with fields we don't need, or fields that are missing
  // ? We could enforce a specific alias, like { header { title } page: post { id } }, then we can search for that with the graphql.visit fn.
  // ? Then we can rename the query, or get fields (probably both): { header { title } allPost { id } }
  // const parsedQuery = parse(pageQuery)
  // const subQuery = parsedQuery.definitions[0].selectionSet.selections[0].selectionSet.selections
  // const fields = (print(subQuery) as unknown as string[]).join(', ')

  // // And we need to enforce adding the slug/path param
  // const { data: allPostsData } = await ctx.datastore.graphql(`{ allPosts { __internalPath: slug ${fields} } }`)

  return [
    {
      url: '/posts',
      pageContext: {
        pageProps: { posts },
        documentProps: { title: getTitle(posts) }
      }
    },
    ...posts.map((post) => {
      const url = `/post/${post.slug}`
      /** We can extract the post query from ../post/onBeforeRender and use it to query a bunch of results at once here,
      * - and then pass to pageContext then we don't need to run each individual query */
      return { url, pageContext: { pageProps: { post } } }
    })
  ]
}

function getTitle (posts: any[]): string {
  const title = `${posts.length} posts`
  return title
}
