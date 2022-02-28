export { Plugin as ssg } from './plugin'

export type { ServerConfig } from '../types/server'

export const vpsPlugin = {
  pageFiles: {
    include: ['node_modules/@travisreynolds/ssg/']
  }
}
