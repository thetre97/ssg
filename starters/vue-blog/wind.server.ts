import { serverConfig } from 'wind-ssg'

import {faker} from '@faker-js/faker'

export default serverConfig((server) => {
  server.loadSource(store => {
    const collection = store.createCollection({ name: 'Post' })

    const posts = Array.from({ length: 10000 }, (_, i) => ({
      id: i + 1,
      title: faker.lorem.words(4),
      slug: i + 1,
      date: faker.date.past(),
      content: faker.lorem.paragraphs(5, '<br/><br/>\n'),
      featuredImage: faker.image.nature(1200, 800)
    }))

    collection.add(posts)
  })
})
