import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'api': path.resolve(__dirname, 'src/Pages/Plan/api'),
      'src': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    watch: {
      ignored: ['../backend/**', '**/node_modules/**', '**/.git/**']
    }
  }
})