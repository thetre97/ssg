import type { WindConfig } from '../../types/config'
import type { ServerConfigFn } from '../lib'

export function serverConfig (config: ServerConfigFn) {
  return config
}

export function defineConfig (config: WindConfig) {
  return config
}
