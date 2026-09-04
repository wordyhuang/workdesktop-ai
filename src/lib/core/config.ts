import type { DeepPartial, WorkDesktopConfig } from '../../types/config'
import { defaultConfig } from '../configs/default-config'
import { deepMerge } from './utils'
import { applyTheme } from './theme'

/**
 * 配置管理模块（PRD 5.2 / 第 8 章）
 * 三级：defaultConfig → globalConfig → localProps
 */

let globalConfig: WorkDesktopConfig = deepMerge<WorkDesktopConfig>(defaultConfig)

/**
 * 读取宿主 window.workDesktopConfig（script 入口用）
 */
function readWindowConfig(): DeepPartial<WorkDesktopConfig> | undefined {
  if (typeof window !== 'undefined' && window.workDesktopConfig) {
    return window.workDesktopConfig as DeepPartial<WorkDesktopConfig>
  }
  return undefined
}

/**
 * 增量合并到全局层。库 install 时与运行时 setGlobalConfig 共用。
 * 返回 merge 后的有效配置。
 */
export function setGlobalConfig(partial?: DeepPartial<WorkDesktopConfig>): WorkDesktopConfig {
  if (partial) {
    globalConfig = deepMerge<WorkDesktopConfig>(globalConfig, partial)
  }
  // 配置变化后重新应用主题（colors/cssVars → :root CSS 变量）
  applyTheme(globalConfig.theme)
  return globalConfig
}

/**
 * 读取当前全局层（含默认层 merge 结果）
 */
export function getGlobalConfig(): WorkDesktopConfig {
  return globalConfig
}

/**
 * 恢复默认层
 */
export function resetConfig(): WorkDesktopConfig {
  globalConfig = deepMerge<WorkDesktopConfig>(defaultConfig)
  applyTheme(globalConfig.theme)
  return globalConfig
}

/**
 * 合并本地层（组件 props / 组件级配置），产出最终配置。
 * 优先级：localProps > globalConfig > defaultConfig
 */
export function mergeConfig(local?: DeepPartial<WorkDesktopConfig> | Record<string, any>): WorkDesktopConfig {
  if (!local) return globalConfig
  return deepMerge<WorkDesktopConfig>(globalConfig, local as DeepPartial<WorkDesktopConfig>)
}

/**
 * 取某组件类型的全局默认配置（page.componentDefault[PascalName]）
 */
export function getComponentDefault(componentName: string): Record<string, any> {
  const map = globalConfig.page?.componentDefault || {}
  return map[componentName] || map[toPascal(componentName)] || {}
}

function toPascal(name: string): string {
  return name
    .replace(/(^|-|_)(\w)/g, (_m, _p, c: string) => c.toUpperCase())
    .replace(/^wd/i, 'Wd')
}

/**
 * 库初始化：合并双入口配置（npm app.use 参数 + window.workDesktopConfig）
 * 两条入口汇入同一套 merge 逻辑，行为一致（PRD 8.2）
 */
export function initConfig(useConfig?: DeepPartial<WorkDesktopConfig>): WorkDesktopConfig {
  // 先重置，避免 HMR / 多次 install 叠加
  globalConfig = deepMerge<WorkDesktopConfig>(defaultConfig)
  const winConfig = readWindowConfig()
  // window 配置与 use 参数合并；两者都给时 use 参数优先
  const merged = winConfig ? deepMerge<WorkDesktopConfig>(globalConfig, winConfig, useConfig || {}) : deepMerge<WorkDesktopConfig>(globalConfig, useConfig || {})
  globalConfig = merged
  applyTheme(globalConfig.theme)
  return globalConfig
}
