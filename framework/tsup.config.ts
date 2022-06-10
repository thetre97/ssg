import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [
    'src/cli/index.ts',
    'src/index.ts',
    'src/renderer/vue/index.ts'
  ],
  format: ['cjs', 'esm'],
  splitting: false,
  sourcemap: true,
  clean: true,
  dts: true,
  target: 'node14'
})
