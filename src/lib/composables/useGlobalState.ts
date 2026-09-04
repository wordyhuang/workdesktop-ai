import { reactive, isReactive } from 'vue'

/**
 * 全局响应式状态单例（PRD 5.3，替代 Pinia 的轻量方案）
 * 相同 key 共享同一份状态，跨组件/跨层级复用。
 */

const globalStore: Record<string, any> = reactive({})

export function useGlobalState<T extends object = Record<string, any>>(
  key: string,
  initial?: T
): { state: T; set: (partial: Partial<T> | ((prev: T) => Partial<T>)) => void; reset: () => void } {
  if (!(key in globalStore)) {
    globalStore[key] = initial ? (isReactive(initial) ? initial : { ...initial }) : {}
  } else if (initial && typeof initial === 'object') {
    // 已存在则补齐缺失的初始字段
    for (const k of Object.keys(initial)) {
      if (globalStore[key][k] === undefined) {
        globalStore[key][k] = (initial as any)[k]
      }
    }
  }

  const state = globalStore[key] as T

  const set = (partial: Partial<T> | ((prev: T) => Partial<T>)) => {
    const patch = typeof partial === 'function' ? (partial as (p: T) => Partial<T>)(state) : partial
    Object.assign(globalStore[key], patch)
  }

  const reset = () => {
    const fresh = initial ? { ...initial } : {}
    Object.keys(globalStore[key]).forEach((k) => delete globalStore[key][k])
    Object.assign(globalStore[key], fresh)
  }

  return { state, set, reset }
}
