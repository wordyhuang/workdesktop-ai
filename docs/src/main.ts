import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import WorkDesktop, { initConfig } from '../../src'
import { createMockInterceptor } from './mock'
import DemoBlock from './components/DemoBlock.vue'
import CodeBlock from './components/CodeBlock.vue'
import App from './App.vue'
import router from './router'

// 全局配置：urlPrefix=/mock + 响应拦截 mock，使全部 API 类示例无需后端
initConfig({
  request: {
    urlPrefix: '/mock',
    transform: {
      responseInterceptor: createMockInterceptor()
    }
  },
  page: {
    pager: { pageSize: 10 }
  }
})

const app = createApp(App)
app.use(ElementPlus)
app.use(router)
app.use(WorkDesktop)
app.component('DemoBlock', DemoBlock)
app.component('CodeBlock', CodeBlock)
app.mount('#app')
