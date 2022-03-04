import type { PageContextServer } from '@travisreynolds/ssg'

const pageQuery = `query Post {
  allPosts {
    id
    title
    path
  }
}`

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
  const { data, errors } = await graphql(pageQuery) as any
  if (errors) throw new Error(errors[0].message)
  return data.allPosts
}

export async function prerender (ctx: PageContextServer) {
  const posts = await fetchPosts(ctx.datastore)

  return [
    {
      url: '/posts',
      pageContext: {
        pageProps: { posts },
        documentProps: { title: getTitle(posts) }
      }
    }
  ]
}

function getTitle (posts: any[]): string {
  const title = `${posts.length} posts`
  return title
}
