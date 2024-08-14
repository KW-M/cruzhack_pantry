import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: 'cohere.ts',
      name: 'cohere',
      // the proper extensions will be added
      fileName: 'cohere',
    },
  },
  plugins: [],
})
