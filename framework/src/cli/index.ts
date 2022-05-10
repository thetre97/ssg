#!/bin/env node

import { program } from 'bandersnatch'

import { developCmd, buildCmd } from './vite'

const cli = program({
  version: true,
  description: 'Wind SSG CLI'
})

cli.default(developCmd).add(developCmd).add(buildCmd)

cli.run()
