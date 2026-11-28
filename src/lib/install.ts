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

const componentList = Object.entries(components)

const install: Plugin['install'] = (app: App, config?: DeepPartial<WorkDesktopConfig>) => {
  // 双入口配置汇入同一套 merge 逻辑
  initConfig(config)
  // 按导出键名注册（支持 WdDatagrid 等别名导出），同时保留组件自带 name 以兼容既有引用；去重避免同名重复注册警告
  const registered = new Set<string>()
  componentList.forEach(([exportName, comp]: [string, any]) => {
    if (!comp) return
    for (const name of [exportName, comp.name]) {
      if (!name || registered.has(name)) continue
      app.component(name, comp)
      registered.add(name)
    }
  })
}

const WorkDesktop: Plugin = { install }

export default WorkDesktop
export { install }
