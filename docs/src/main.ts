import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'
import WorkDesktop from '../../src'
import { createMockAdapter } from './mock'
import DemoBlock from './components/DemoBlock.vue'
import CodeBlock from './components/CodeBlock.vue'
import UnpackNote from './components/UnpackNote.vue'
import PageHeader from './components/PageHeader.vue'
import App from './App.vue'
import router from './router'

// 全局配置：urlPrefix=/mock。
// - 开发模式（dev）：请求真实发出到 dev server，由 docs/vite.config.ts 的 wd-mock-server
//   插件在 HTTP 层返回假数据（浏览器 Network 可见 /mock/xxx）。
// - 生产构建（build/preview 等静态部署无后端）：回退 axios adapter 短路，保证示例仍可演示。
const wdConfig = {
  request: {
    urlPrefix: '/mock',
    ...(import.meta.env.PROD
      ? { axiosConfig: { adapter: createMockAdapter() } }
      : {})
  },
  page: {
    pager: { pageSize: 10 }
  }
}

const app = createApp(App)
app.use(ElementPlus, { locale: zhCn })
app.use(router)
app.use(WorkDesktop, wdConfig)
app.component('DemoBlock', DemoBlock)
app.component('CodeBlock', CodeBlock)
app.component('UnpackNote', UnpackNote)
app.component('PageHeader', PageHeader)
app.mount('#app')
