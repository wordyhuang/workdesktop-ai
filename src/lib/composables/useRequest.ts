import { ref, shallowRef, isRef, onUnmounted } from 'vue'
import { request, type ApiResult } from '../core/http'
import type { ReqOptions } from '../../types/config'

/**
 * useRequest（PRD 5.3）
 * 封装请求逻辑，返回 data/loading/error + 请求方法。
 *
 * @example
 * const { data, loading, run } = useRequest<User[]>('/api/users', {
 *   method: 'post',
 *   immediate: false,
 *   reqConfig: { showTips: false }
 * })
 * run({ page: 1 })
 */

export interface UseRequestOptions {
  /** 请求方法，默认 post */
  method?: 'get' | 'post' | 'put' | 'delete'
  /** 是否立即自动请求，默认 true */
  immediate?: boolean
  /** 自动请求时的初始参数 */
  initialParams?: any
  /** 请求级覆盖项（透传给 http） */
  reqOptions?: ReqOptions
  /** 成功回调（data 为解封后的业务数据） */
  onSuccess?: (data: any, result: ApiResult) => void
  /** 业务失败回调 */
  onFail?: (result: ApiResult) => void
  /** 异常回调 */
  onError?: (error: any) => void
}

export function useRequest<T = any>(api: string | (() => string), options: UseRequestOptions = {}) {
  const {
    method = 'post',
    immediate = true,
    initialParams,
    reqOptions,
    onSuccess,
    onFail,
    onError
  } = options

  const data = shallowRef<T | null>(null)
  const loading = ref(false)
  const error = shallowRef<Error | null>(null)

  let controller: AbortController | null = null

  function resolveApi(): string {
    return typeof api === 'function' ? api() : api
  }

  async function run(params?: any): Promise<ApiResult<T> | null> {
    loading.value = true
    error.value = null
    // 支持中断：上一个未完成则中止
    if (controller) controller.abort()
    controller = new AbortController()

    const opts: ReqOptions = { ...reqOptions, signal: controller.signal }
    try {
      let result: ApiResult<T>
      const url = resolveApi()
      if (method === 'get' || method === 'delete') {
        result = await request.request<T>(
          { url, method, params },
          opts
        )
      } else {
        result = await request.request<T>({ url, method, data: params }, opts)
      }

      if (result.success) {
        data.value = result.data
        onSuccess?.(result.data, result)
      } else {
        onFail?.(result)
      }
      return result
    } catch (e: any) {
      error.value = e instanceof Error ? e : new Error(e?.message || '请求失败')
      onError?.(e)
      return null
    } finally {
      loading.value = false
      controller = null
    }
  }

  function refresh() {
    return run(lastParams)
  }

  function abort() {
    if (controller) {
      controller.abort()
      controller = null
      loading.value = false
    }
  }

  let lastParams: any = initialParams

  // 包装 run 记录最后参数供 refresh
  const runWrap = (params?: any) => {
    lastParams = params ?? lastParams
    return run(params)
  }

  if (immediate) {
    run(initialParams)
  }

  onUnmounted(abort)

  return {
    data,
    loading,
    error,
    run: runWrap,
    refresh,
    abort
  }
}

/** 工具：解包可能为 ref 的值 */
export function unrefValue<T>(v: T | { value: T }): T {
  return isRef(v) ? (v as any).value : (v as T)
}
