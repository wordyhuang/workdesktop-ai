import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type Method
} from 'axios'
import { ElMessage, ElNotification, ElLoading, ElMessageBox } from 'element-plus'
import type { ReqOptions, TipsConfig, WorkDesktopConfig } from '../../types/config'
import { getGlobalConfig } from './config'
import { deepMerge } from './utils'

/**
 * HTTP 请求模块（PRD 5.1 / 第 7 章）
 *
 * RequestAPI 是本库的请求核心（PRD 5.1）：所有请求类组件（DataGrid/DataForm/
 * 按钮组/输入选择/上传等）都基于它开发；同时对外公开，允许开发者在组件外
 * 手动调用 API 请求代码。库内置全局单例 `request`，也可 `new RequestAPI()` 自建实例。
 *
 * 响应处理流程：
 * 1. 请求前显示 loading（可配置）
 * 2. 响应到达，按 resConfig 解封：取 code/message/data
 * 3. code 匹配成功码 → apiSuccess + 成功提示
 * 4. code 不匹配 → apiFail + 失败提示（业务失败 resolve，不 reject）
 * 5. 网络异常 → apiException + 异常提示（reject）
 * 6. 请求完成 → apiAfter + 关闭 loading
 */

export type ApiEventType = 'apiBefore' | 'apiSuccess' | 'apiFail' | 'apiException' | 'apiAfter'

export interface ApiEventPayload {
  type: ApiEventType
  url?: string
  method?: string
  params?: any
  /** 解封后的业务数据 */
  data?: any
  code?: number | string
  message?: string
  error?: any
  /** 原始响应 */
  raw?: any
}

export type ApiEventHandler = (payload: ApiEventPayload) => void

/** 业务失败时 resolve 的结果（PRD 7.4：不抛异常，组件据此感知） */
export interface ApiResult<T = any> {
  success: boolean
  data: T | null
  code?: number | string
  message?: string
  raw?: any
}

type Listener = ApiEventHandler

/**
 * 统一提示：按 tipsMode 分发到 ElMessage / ElNotification / ElMessageBox
 *
 * - 'message'：轻量消息（自动消失），type 取自 tipsType
 * - 'notify'：右上角通知，type 取自 tipsType
 * - 'messagebox'：模态弹框（需用户确认），type 取自 tipsType，title 可配置
 * - 'none' / showTips=false：不提示
 */
function showTips(tips: TipsConfig | undefined, message: string) {
  if (!tips || tips.showTips === false) return
  const mode = tips.tipsMode
  if (!mode || mode === 'none') return
  const type = tips.tipsType || 'info'
  const props = tips.props || {}
  if (mode === 'message') {
    ElMessage({ message, type, ...props })
    return
  }
  if (mode === 'notify') {
    ElNotification({ message, type, ...props })
    return
  }
  if (mode === 'messagebox') {
    const title = tips.title || ''
    ElMessageBox.alert(message, title, { type, ...props }).catch(() => {
      // 用户关闭弹框（ESC/遮罩）不抛异常到上层
    })
    return
  }
  // 兜底：未知 mode 不提示
}

/**
 * RequestAPI 请求客户端（公开类）
 *
 * 所有组件基于它开发；开发者也可手动 new 实例并调用 get/post/put/delete/request。
 * 默认单例见文件底部 `export const request`。
 */
export class RequestAPI {
  private axiosInstance: AxiosInstance
  private listeners: Set<Listener> = new Set()
  /** 组件/实例级配置覆盖（request.create 使用） */
  private instanceConfig: DeepPartialConfig = {}
  private loadingInstance: ReturnType<typeof ElLoading.service> | null = null
  private loadingCount = 0
  /** 进行中的请求（in-flight dedup）：key = method:url:序列化params，并发相同请求合并为一次网络调用 */
  private inFlightRequests = new Map<string, Promise<ApiResult<any>>>()

  constructor(axiosConfig?: AxiosRequestConfig) {
    this.axiosInstance = axios.create(axiosConfig || {})
  }

  /**
   * 创建绑定组件级配置的实例（PRD 5.1）
   * 子实例复用父级监听器与去重表：同族实例（全局单例 + 各组件 create 出来的子实例）
   * 之间并发相同请求同样合并，保证表列内多行组件发起的相同请求只打一次网络。
   */
  create(componentReqConfig?: DeepPartialConfig): RequestAPI {
    const child = new RequestAPI()
    child.instanceConfig = componentReqConfig || {}
    child.listeners = this.listeners
    child.inFlightRequests = this.inFlightRequests
    return child
  }

  on(handler: Listener): () => void {
    this.listeners.add(handler)
    return () => this.listeners.delete(handler)
  }

  off(handler: Listener): void {
    this.listeners.delete(handler)
  }

  private emit(payload: ApiEventPayload): void {
    this.listeners.forEach((fn) => {
      try {
        fn(payload)
      } catch (e) {
        // 监听器异常不影响主流程
        console.error('[WorkDesktop] api event handler error:', e)
      }
    })
  }

  /**
   * 取有效配置：全局配置 + 实例级覆盖
   */
  private resolveConfig(): WorkDesktopConfig {
    const global = getGlobalConfig()
    return this.instanceConfig && Object.keys(this.instanceConfig).length
      ? deepMerge<WorkDesktopConfig>(global, this.instanceConfig as any)
      : global
  }

  private openLoading(reqOptions?: ReqOptions) {
    const cfg = this.resolveConfig()
    const enable = reqOptions?.showLoading ?? cfg.request.loading.enable
    if (!enable) return
    this.loadingCount += 1
    if (this.loadingCount === 1) {
      this.loadingInstance = ElLoading.service({
        ...cfg.request.loading.props,
        ...(reqOptions?.axiosConfig?.loadingProps || {})
      })
    }
  }

  private closeLoading(reqOptions?: ReqOptions) {
    const cfg = this.resolveConfig()
    const enable = reqOptions?.showLoading ?? cfg.request.loading.enable
    if (!enable) return
    this.loadingCount = Math.max(0, this.loadingCount - 1)
    if (this.loadingCount === 0 && this.loadingInstance) {
      this.loadingInstance.close()
      this.loadingInstance = null
    }
  }

  /**
   * 核心请求方法
   * 返回 Promise<ApiResult<T>>：业务失败也 resolve（success=false），仅网络异常 reject
   */
  async request<T = any>(config: AxiosRequestConfig, reqOptions?: ReqOptions): Promise<ApiResult<T>> {
    const cfg = this.resolveConfig()
    const method = (config.method || 'get').toLowerCase()
    const url = this.buildUrl(config.url || '', cfg)

    // 请求去重（in-flight dedup）：并发相同的 method+url+params 合并为一次网络调用，
    // 后续调用方直接共享首个请求结果；仅合并并发中的请求，完成即清理，串行不受影响。
    // 合并时跟随方不重复触发事件与 loading；跟随方的 signal 不挂到共享请求（避免单行卸载误杀整批）。
    const dedupEnabled = reqOptions?.dedup ?? cfg.request.dedup
    if (dedupEnabled) {
      const key = this.buildDedupKey(method, url, config)
      const inFlight = this.inFlightRequests.get(key)
      if (inFlight) return inFlight as Promise<ApiResult<T>>
      const promise = this.executeRequest<T>(config, reqOptions, url, method)
      this.inFlightRequests.set(key, promise)
      promise.then(
        () => this.inFlightRequests.delete(key),
        () => this.inFlightRequests.delete(key)
      )
      return promise
    }

    return this.executeRequest<T>(config, reqOptions, url, method)
  }

  /** 去重 key：method + 解析后 url + 序列化请求体；请求体不可序列化时退化为固定后缀（该场景不合并） */
  private buildDedupKey(method: string, url: string, config: AxiosRequestConfig): string {
    let paramsKey: string
    try {
      paramsKey = JSON.stringify(config.data ?? config.params ?? null)
    } catch {
      paramsKey = '[unserializable]'
    }
    return `${method}:${url}:${paramsKey}`
  }

  /** 真实请求执行体（含事件/loading/封解封），被 request() 去重包装后调用 */
  private async executeRequest<T = any>(
    config: AxiosRequestConfig,
    reqOptions: ReqOptions | undefined,
    url: string,
    method: string
  ): Promise<ApiResult<T>> {
    const cfg = this.resolveConfig()

    const baseEvent: ApiEventPayload = {
      type: 'apiBefore',
      url,
      method,
      params: config.data ?? config.params
    }
    this.emit(baseEvent)

    // loading
    this.openLoading(reqOptions)

    // 组装 axios 配置
    let axiosConfig: AxiosRequestConfig = {
      ...cfg.request.axiosConfig,
      ...config,
      url,
      method: method as Method,
      signal: reqOptions?.signal ?? config.signal
    }

    // 请求拦截器（加 token 等）
    const reqInterceptor = cfg.request.transform.requestInterceptor
    if (reqInterceptor) {
      axiosConfig = (await reqInterceptor(axiosConfig)) || axiosConfig
    }

    try {
      let response: AxiosResponse = await this.axiosInstance.request(axiosConfig)

      // 响应拦截器
      const resInterceptor = cfg.request.transform.responseInterceptor
      if (resInterceptor) {
        response = (await resInterceptor(response)) ?? response
      }

      const body = response.data
      const result = this.unpack<T>(body, cfg, reqOptions, { url, method, params: baseEvent.params })
      this.emit({
        type: result.success ? 'apiSuccess' : 'apiFail',
        url,
        method,
        params: baseEvent.params,
        data: result.data,
        code: result.code,
        message: result.message,
        raw: body
      })
      this.emit({ type: 'apiAfter', url, method, data: result.data, code: result.code, message: result.message })
      return result
    } catch (error: any) {
      const message = error?.message || '网络异常，请稍后重试'
      const excTips = reqOptions?.tipsConfig?.exception ?? cfg.response.exception
      showTips(excTips, message)
      this.emit({ type: 'apiException', url, method, params: baseEvent.params, error, message })
      this.emit({ type: 'apiAfter', url, method, error, message })
      if (cfg.request.throwException) {
        throw error
      }
      // 网络层异常才 reject
      return Promise.reject<ApiResult<T>>(
        Object.assign(new Error(message), { success: false, data: null, message, error })
      )
    } finally {
      this.closeLoading(reqOptions)
    }
  }

  /**
   * 解封响应体：按 resConfig 取 code/message/data
   */
  private unpack<T>(
    body: any,
    cfg: WorkDesktopConfig,
    reqOptions: ReqOptions | undefined,
    meta: { url: string; method: string; params: any }
  ): ApiResult<T> {
    // 兼容非标准响应（直接返回数组/原始值）
    if (body == null || typeof body !== 'object' || Array.isArray(body)) {
      return { success: true, data: body as T, raw: body }
    }

    const { codeName, messageName, dataName } = cfg.response.props
    const code = body[codeName]
    const message = body[messageName] ?? ''
    const data = body[dataName]

    const isSuccess = this.checkSuccess(code, cfg)

    if (isSuccess) {
      const successTips = reqOptions?.tipsConfig?.success ?? cfg.response.success
      if (successTips?.showTips) {
        showTips(successTips, message || '操作成功')
      }
      return { success: true, data: data as T, code, message, raw: body }
    }

    // 业务失败：resolve 到 apiFail 分支，不 reject
    const failTips = reqOptions?.tipsConfig?.fail ?? cfg.response.fail
    if (failTips?.showTips !== false) {
      showTips(failTips, message || '操作失败')
    }
    return { success: false, data: null, code, message, raw: body }
  }

  private checkSuccess(code: any, cfg: WorkDesktopConfig): boolean {
    if (code === undefined || code === null) return true
    const num = Number(code)
    if (Number.isNaN(num)) return true
    return num >= cfg.response.successCode
  }

  private buildUrl(url: string, cfg: WorkDesktopConfig): string {
    if (!url) return url
    if (/^https?:\/\//.test(url)) return url
    const prefix = cfg.request.urlPrefix || ''
    if (!prefix) return url
    return `${prefix.replace(/\/$/, '')}/${url.replace(/^\//, '')}`
  }

  // 便捷方法。返回值已解封业务 data（成功场景）
  get<T = any>(url: string, params?: any, reqOptions?: ReqOptions): Promise<ApiResult<T>> {
    return this.request<T>({ url, method: 'get', params }, reqOptions)
  }

  post<T = any>(url: string, data?: any, reqOptions?: ReqOptions): Promise<ApiResult<T>> {
    return this.request<T>({ url, method: 'post', data }, reqOptions)
  }

  put<T = any>(url: string, data?: any, reqOptions?: ReqOptions): Promise<ApiResult<T>> {
    return this.request<T>({ url, method: 'put', data }, reqOptions)
  }

  delete<T = any>(url: string, params?: any, reqOptions?: ReqOptions): Promise<ApiResult<T>> {
    return this.request<T>({ url, method: 'delete', params }, reqOptions)
  }
}

type DeepPartialConfig = Record<string, any>

/**
 * 全局单例（脱离组件直接调用，PRD 5.1）
 *
 * 所有组件共享该实例；开发者也可直接手动调用，或 `new RequestAPI()` 自建独立实例。
 */
export const request = new RequestAPI()

export default request
