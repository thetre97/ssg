import ts from 'rollup-plugin-ts'
import del from 'rollup-plugin-delete'
import externals from 'rollup-plugin-node-externals'

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
    input: 'src/cli.ts',
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
      ts()
    ]
  }
]
