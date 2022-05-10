import { ExecutionResult, Source } from 'graphql'
import { ObjMap } from 'graphql-compose'

export interface GraphQLQuery {
  query: string | Source
  variables?: Record<string, unknown>
}

export type GraphQLQueryResult = Promise<ExecutionResult<ObjMap<unknown>, ObjMap<unknown>>>
