/// <reference types="@peeky/test"/>

import { log } from '../src/index'

describe('Example test suite', () => {
  test('must work', () => {
    const output = log('Travis')
    expect(output).toBe('Hello Travis!')
  })
})
