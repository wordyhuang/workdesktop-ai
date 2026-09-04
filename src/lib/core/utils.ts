/**
 * 通用工具函数
 */

/**
 * 判断是否为普通对象（用于 deep merge）
 */
export function isPlainObject(value: unknown): value is Record<string, any> {
  if (value === null || typeof value !== 'object') return false
  const proto = Object.getPrototypeOf(value)
  return proto === Object.prototype || proto === null
}

/**
 * deep merge：对象深合并；数组覆盖；基本类型后者覆盖前者
 * 与 lodash.merge 语义一致：从左到右，后者优先级高
 */
export function deepMerge<T = any>(...sources: any[]): T {
  const result: Record<string, any> = {}
  for (const source of sources) {
    if (!isPlainObject(source)) continue
    for (const key of Object.keys(source)) {
      const targetVal = result[key]
      const sourceVal = source[key]
      if (Array.isArray(sourceVal)) {
        // 数组：覆盖不合并
        result[key] = sourceVal.slice()
      } else if (isPlainObject(sourceVal)) {
        result[key] = deepMerge(isPlainObject(targetVal) ? targetVal : {}, sourceVal)
      } else if (sourceVal !== undefined) {
        result[key] = sourceVal
      }
    }
  }
  return result as T
}

/**
 * 按路径取对象值，如 getValue(obj, 'a.b.c')
 */
export function getValueByPath(obj: any, path: string): any {
  if (!path || obj == null) return undefined
  return path.split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), obj)
}

/**
 * 生成唯一 id
 */
let uidSeed = 0
export function uniqueId(prefix = 'wd'): string {
  uidSeed += 1
  return `${prefix}-${Date.now().toString(36)}-${uidSeed}`
}

/**
 * 安全 JSON parse（localStorage 用）
 */
export function safeJsonParse<T>(text: string | null, fallback: T): T {
  if (!text) return fallback
  try {
    return JSON.parse(text) as T
  } catch {
    return fallback
  }
}

/**
 * 防抖
 */
export function debounce<F extends (...args: any[]) => any>(fn: F, wait = 300) {
  let timer: ReturnType<typeof setTimeout> | null = null
  const debounced = function (this: unknown, ...args: Parameters<F>) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), wait)
  }
  debounced.cancel = () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }
  return debounced
}
