import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import WorkDesktop from '../../src'
import { createMockAdapter } from './mock'
import DemoBlock from './components/DemoBlock.vue'
import CodeBlock from './components/CodeBlock.vue'
import App from './App.vue'
import router from './router'

// 全局配置：urlPrefix=/mock + mock adapter 在请求层短路，使全部 API 类示例无需后端。
// 注意：必须作为 app.use(WorkDesktop, config) 第二参数传入——install 内部会 initConfig，
// 若先单独 initConfig 再 app.use(WorkDesktop) 不带参，install 会把配置重置回默认值。
const wdConfig = {
  request: {
    urlPrefix: '/mock',
    axiosConfig: {
      adapter: createMockAdapter()
    }
  },
  page: {
    pager: { pageSize: 10 }
  }
}

const app = createApp(App)
app.use(ElementPlus)
app.use(router)
app.use(WorkDesktop, wdConfig)
app.component('DemoBlock', DemoBlock)
app.component('CodeBlock', CodeBlock)
app.mount('#app')
