/**
 * WorkDesktop 组件库主入口
 *
 * ESM：import WorkDesktop from 'workdesktop-ai'
 * UMD：window.WorkDesktop（script 标签，配合 window.workDesktopConfig）
 */
import './styles/index.css'

// 插件（默认导出）
export { default as WorkDesktop, default } from './lib/install'

// 全部组件（按需命名导入）
export * from './components'

// 配置运行时 API
export {
  initConfig,
  setGlobalConfig,
  getGlobalConfig,
  resetConfig,
  mergeConfig,
  getComponentDefault
} from './lib/core/config'

// HTTP 客户端
export { request, default as http } from './lib/core/http'
export type { ApiResult, ApiEventPayload, ApiEventType, ApiEventHandler } from './lib/core/http'

// 声明式联动
export {
  registerDataGrid,
  refreshDataGrid,
  searchDataGrid,
  resetSearchDataGrid,
  getDataGrids,
  clearLinkageRegistry
} from './lib/core/linkage'

// 组合式 hooks
export { useRequest } from './lib/composables/useRequest'
export { useDataGrid } from './lib/composables/useDataGrid'
export { useConfig, useGlobalConfig } from './lib/composables/useConfig'
export { useEventBus } from './lib/composables/useEventBus'
export { useGlobalState } from './lib/composables/useGlobalState'

// 工具
export { deepMerge } from './lib/core/utils'

// 类型
export type * from './types'
