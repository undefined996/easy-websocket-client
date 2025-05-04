/// <reference types="vitest" />
import { defineConfig, loadEnv } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig(({ mode }) => {
  loadEnv(mode, process.cwd());
  return {
    plugins: [dts({
      outDir: 'types',
      copyDtsFiles: false
    })],
    build: {
      lib: {
        entry: './src/index.ts',
        name: 'easy-websocket-client',
        fileName: (format) => {
          return `${format}/index.js`
        },
        formats: ['es', 'cjs', 'umd']
      },
      minify: 'oxc',
      outDir: './dist',
      sourcemap: false,
      emptyOutDir: true,
    },
    test: {
      testTimeout: 20_000
    }
  }
})
