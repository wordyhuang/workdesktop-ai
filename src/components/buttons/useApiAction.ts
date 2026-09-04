import { ref } from 'vue'
import { request, type ApiEventPayload } from '../../lib/core/http'
import { refreshDataGrid } from '../../lib/core/linkage'
import type { ReqOptions } from '../../types/config'

/**
 * 按钮组共享：点击 → 请求 → 提示 → 联动刷新（PRD 4.4 按钮组）
 * 业务失败 resolve 不抛异常；网络异常 reject。
 */
export function useApiAction(options: {
  getApi: () => string
  getMethod: () => 'get' | 'post' | 'put' | 'delete'
  getParam: () => Record<string, any>
  getFilter: () => string
  getHeadRefresh: () => boolean | string
  emit: (event: any, ...args: any[]) => void
  /** 是否按钮级 loading（ApiButton buttonLoading=false 时按钮不转圈） */
  buttonLoading?: () => boolean
  /** 请求附加项（pageLoading=true 时开启全局 ElLoading 遮罩） */
  getReqOptions?: () => ReqOptions
}) {
  const loading = ref(false)

  async function doRequest(extraParam?: Record<string, any>): Promise<boolean> {
    const api = options.getApi()
    if (!api) return false

    const method = options.getMethod()
    const param = { ...options.getParam(), ...(extraParam || {}) }
    const useBtnLoading = options.buttonLoading ? options.buttonLoading() : true
    const reqOptions: ReqOptions = options.getReqOptions
      ? options.getReqOptions()
      : {}

    const beforePayload: ApiEventPayload = { type: 'apiBefore', url: api, method, params: param }
    options.emit('apiBefore', beforePayload)

    if (useBtnLoading) loading.value = true

    try {
      const result =
        method === 'get' || method === 'delete'
          ? await request.request({ url: api, method, params: param }, reqOptions)
          : await request.request({ url: api, method, data: param }, reqOptions)

      if (result.success) {
        options.emit('apiSuccess', { data: result.data, code: result.code, message: result.message })
        // 声明式联动：刷新目标 DataGrid
        const head = options.getHeadRefresh()
        if (head) {
          refreshDataGrid(head, options.getFilter())
        }
        options.emit('apiAfter', { data: result.data, code: result.code })
        return true
      }
      options.emit('apiFail', { data: null, code: result.code, message: result.message })
      options.emit('apiAfter', { code: result.code, message: result.message })
      return false
    } catch (error: any) {
      options.emit('apiException', { error, message: error?.message })
      options.emit('apiAfter', { error })
      return false
    } finally {
      loading.value = false
    }
  }

  return { loading, doRequest }
}
