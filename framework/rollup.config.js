import del from 'rollup-plugin-delete'
import externals from 'rollup-plugin-node-externals'
import json from '@rollup/plugin-json'
import ts from 'rollup-plugin-ts'

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        format: 'cjs',
        exports: 'auto',
        file: 'dist/index.js',
        sourcemap: true
      },
      {
        format: 'es',
        exports: 'auto',
        file: 'dist/index.esm.js',
        sourcemap: true
      }
    ],
    plugins: [
      del({ targets: 'dist/*' }),
      externals({ deps: true }),
      ts()
    ]
  },
  {
    input: 'src/cli/index.ts',
    output: [
      {
        format: 'cjs',
        exports: 'auto',
        file: 'dist/cli.js',
        sourcemap: true
      }
    ],
    plugins: [
      externals({ deps: true }),
      json(),
      ts()
    ]
  }
]
