import { onMounted, shallowRef } from 'vue'
import { getGlobalConfig, getComponentDefault } from '../core/config'
import { deepMerge } from '../core/utils'
import type { WorkDesktopConfig } from '../../types/config'

/**
 * useConfig（PRD 5.3 / 5.2）
 *
 * 组件内合并三级配置：全局 componentDefault[组件名] → 本地 props。
 * 全局配置在组件 onMounted 时读取一次并缓存（运行中改配置只影响新挂载组件）。
 *
 * 返回一个响应式 ref，merge 后的组件配置对象：
 *   componentDefault 的值作为默认，props 中非 undefined 的值覆盖。
 *
 * @example
 * const cfg = useConfig('WdDatagrid', props)
 * cfg.value.withPager
 */
export function useConfig<T extends Record<string, any> = Record<string, any>>(
  componentName?: string,
  props?: T
) {
  const configRef = shallowRef<T>(buildComponentConfig<T>(componentName, props))

  onMounted(() => {
    // onMounted 时 install 已完成、window.workDesktopConfig 已就绪，再读一次
    configRef.value = buildComponentConfig<T>(componentName, props)
  })

  return configRef
}

/**
 * 非响应式：直接取当前全局 WorkDesktopConfig
 */
export function useGlobalConfig(): WorkDesktopConfig {
  return getGlobalConfig()
}

function buildComponentConfig<T extends Record<string, any>>(
  componentName?: string,
  props?: T
): T {
  const componentDefaults = componentName ? getComponentDefault(componentName) : {}
  const localProps: Record<string, any> = {}
  if (props) {
    for (const [k, v] of Object.entries(props)) {
      if (v !== undefined) localProps[k] = v
    }
  }
  // 优先级：componentDefault < 本地 props
  return deepMerge<T>({} as T, componentDefaults, localProps)
}
