import { DataStore } from './datastore'

export interface ServerConfig {
  data: (ctx: DataStore) => Promise<void>
}
