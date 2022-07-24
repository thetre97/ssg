import type { WindConfig, WindClient } from '../../types/config'
import type { ServerConfigFn } from '../lib'

export function serverConfig (config: ServerConfigFn) {
  return config
}

export function defineConfig (config: WindConfig) {
  return config
}

type ClientConfigFn = (config: WindClient) => void

export function clientConfig (config: ClientConfigFn) {
  return config
}

export { WindClient, WindConfig }
