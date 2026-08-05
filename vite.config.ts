import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // @ 映射到 src 文件夹
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    host: '0.0.0.0'
  }
})