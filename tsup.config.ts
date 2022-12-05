import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['./src'],
  format: ['esm', 'cjs', 'iife'],
  target: 'node14',
  clean: true,
  dts: true,
})
