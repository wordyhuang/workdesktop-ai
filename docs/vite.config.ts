/**
 * 文档站独立构建配置（T6.1 文档站）
 * root 指向 docs/，消费组件库源码（../src），不影响库自身构建
 */
import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { createMockHttpHandler } from './src/mock'

/**
 * HTTP 层 mock 插件：让 /mock/* 请求真实发出（Network 可见）并由 dev server 返回假数据，
 * 使 API 类示例无需后端即可演示，同时避免「点击后看不到请求」的困惑。
 */
function mockServerPlugin(): Plugin {
  return {
    name: 'wd-mock-server',
    configureServer(server) {
      server.middlewares.use(createMockHttpHandler())
    }
  }
}

export default defineConfig({
  root: __dirname,
  plugins: [vue(), mockServerPlugin()],
  resolve: {
    alias: {
      '@docs': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 5003,
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
