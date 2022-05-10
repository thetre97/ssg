
import consola, { Consola, LogLevel } from 'consola'
import { assert, create, Struct, StructError } from 'superstruct'

const defaultReporter = consola.create({
  level: LogLevel.Verbose,
  defaults: {
    tag: 'wind-ssg'
  }
})

function assertArguments<T, V> (input: unknown, schema: Struct<T, V>, reporter: Consola = defaultReporter) {
  try {
    assert(input, schema)
  } catch (err) {
    const error = err as StructError
    reporter.error(error.message)
    throw error
  }
}

function createArguments<T, V> (input: unknown, schema: Struct<T, V>, reporter: Consola = defaultReporter) {
  try {
    return create(input, schema)
  } catch (err) {
    const error = err as StructError
    reporter.error(error.message)
    throw error
  }
}

function throwPrettyError (message: string, reporter: Consola = defaultReporter) {
  reporter.error(message)
  throw new Error(message)
}

const utils = {
  reporter: defaultReporter,
  assertArguments,
  createArguments,
  throwPrettyError
}

export type FrameworkUtils = typeof utils

export default utils
