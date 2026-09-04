/**
 * Vue 插件入口（PRD 8.2 双入口）
 *
 * npm：app.use(WorkDesktop, config)
 * script：window.workDesktopConfig 配置 + window.WorkDesktop 自动安装
 */
import type { App, Plugin } from 'vue'
import type { DeepPartial, WorkDesktopConfig } from '../types/config'
import { initConfig } from './core/config'
import * as components from '../components'

const componentList = Object.values(components)

const install: Plugin['install'] = (app: App, config?: DeepPartial<WorkDesktopConfig>) => {
  // 双入口配置汇入同一套 merge 逻辑
  initConfig(config)
  componentList.forEach((comp: any) => {
    if (comp?.name) app.component(comp.name, comp)
  })
}

const WorkDesktop: Plugin = { install }

export default WorkDesktop
export { install }
