import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'
import WorkDesktop from '../../src'
import { siteBaseConfig } from './site-config'
import DemoBlock from './components/DemoBlock.vue'
import CodeBlock from './components/CodeBlock.vue'
import UnpackNote from './components/UnpackNote.vue'
import PageHeader from './components/PageHeader.vue'
import App from './App.vue'
import router from './router'

// 全站基础配置（urlPrefix=/mock + 分页 pageSize=10）单一来源见 ./site-config.ts，
// 示例页清场（restoreSiteConfig）与入口挂载共用，避免 resetConfig 后站点配置无人补回。

const app = createApp(App)
app.use(ElementPlus, { locale: zhCn })
app.use(router)
app.use(WorkDesktop, siteBaseConfig)
app.component('DemoBlock', DemoBlock)
app.component('CodeBlock', CodeBlock)
app.component('UnpackNote', UnpackNote)
app.component('PageHeader', PageHeader)
app.mount('#app')
