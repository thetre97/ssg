import ts from 'rollup-plugin-ts'
import del from 'rollup-plugin-delete'
import externals from 'rollup-plugin-node-externals'

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        format: 'cjs',
        file: 'dist/index.js',
        sourcemap: true
      },
      {
        format: 'es',
        file: 'dist/index.esm.js',
        sourcemap: true
      }
    ],
    plugins: [
      del({ targets: 'dist/*' }),
      externals({ deps: true }),
      ts()
    ]
  }
]
