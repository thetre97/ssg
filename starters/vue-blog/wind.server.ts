import { serverConfig } from 'wind-ssg'

export default serverConfig((server) => {
  server.loadSource(store => {
    const collection = store.createCollection({ name: 'Post' })

    const posts = Array.from({ length: 10000 }, (_, i) => ({
      id: i + 1,
      title: `Demo Post ${i + 1}`,
      slug: i + 1,
      date: '2022-05'
    }))

    collection.add(posts)
  },)
})
