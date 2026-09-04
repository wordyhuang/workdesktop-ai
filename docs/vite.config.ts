/**
 * 文档站独立构建配置（T6.1 文档站）
 * root 指向 docs/，消费组件库源码（../src），不影响库自身构建
 */
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  root: __dirname,
  plugins: [vue()],
  resolve: {
    alias: {
      '@docs': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 5174,
    host: '0.0.0.0'
  },
  build: {
    outDir: resolve(__dirname, '../dist-docs'),
    emptyOutDir: true
  },
  optimizeDeps: {
    include: ['element-plus', '@element-plus/icons-vue', 'vue-router']
  }
})
