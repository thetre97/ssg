declare module 'virtual:wind-client' {
  import { WindClient } from './config'

  interface ClientImport {
    default: (app: WindClient) => void
  }

  const clientFn: ClientImport

  export { clientFn }
}
