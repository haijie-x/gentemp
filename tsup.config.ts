import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['./src'],
  format: ['esm', 'cjs'],
  target: 'node14',
  clean: true,
  dts: true,
})
