import { faker } from '@faker-js/faker'
import { ServerConfig } from '@travisreynolds/ssg'

const serverConfig: ServerConfig = {
  data: async ({ store }) => {
    const posts = Array.from({ length: 1000 }, (_, i) => ({
      id: i + 1,
      slug: faker.lorem.slug(6),
      title: faker.lorem.sentence(),
      content: faker.lorem.paragraphs(6),
      coverImage: faker.image.imageUrl(800, 400, undefined, true, true)
    }))

    const collection = store.createCollection('post')
    collection.add(posts)
  }
}

export default serverConfig
