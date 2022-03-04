import { faker } from '@faker-js/faker'
import { ServerConfig } from '@travisreynolds/ssg'

const serverConfig: ServerConfig = {
  data: async ({ store }) => {
    const authors = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      slug: faker.lorem.slug(6),
      name: `${faker.name.firstName()} ${faker.name.lastName()}`
    }))

    const authorsCollection = store.createCollection('Author', { primaryKey: 'id', uniqueKeys: ['id'], route: '/authors/:id' })
    authorsCollection.add(authors)
    authorsCollection.createRelation({ field: 'posts', foreignKey: 'authorId', localKey: 'id', type: '[Post]' })

    const posts = Array.from({ length: 1000 }, (_, i) => ({
      id: i + 1,
      slug: faker.lorem.slug(6),
      title: faker.lorem.sentence(),
      content: faker.lorem.paragraphs(6),
      coverImage: faker.image.imageUrl(800, 400, undefined, true, true),
      authorId: faker.random.arrayElement(authors).id
    }))

    const collection = store.createCollection('post', { primaryKey: 'id', uniqueKeys: ['id', 'slug'], route: '/posts/:slug' })
    collection.add(posts)
    collection.createRelation({ field: 'author', foreignKey: 'id', localKey: 'authorId', type: 'Author' })
  }
}

export default serverConfig
