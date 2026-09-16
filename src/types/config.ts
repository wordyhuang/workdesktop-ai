/**
 * WorkDesktop 全局配置类型（PRD 5.2）
 */

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export interface RequestLoadingConfig {
  enable: boolean
  props?: Record<string, any>
}

export interface PageParamConfig {
  /** 当前页字段名，默认 'currentPage' */
  pageField: string
  /** 每页条数字段名，默认 'pageSize' */
  sizeField: string
  /** 搜索条件外层字段名，默认 'param' */
  searchField: string
}

export interface TransformConfig {
  /** 请求拦截器（加 token 等），返回处理后的 axios config */
  requestInterceptor?: (config: any) => any
  /** 响应拦截器 */
  responseInterceptor?: (response: any) => any
}

export interface RequestConfig {
  /** 接口地址前缀 */
  urlPrefix: string
  /** 网络异常是否抛出 */
  throwException: boolean
  /** 并发相同请求合并去重（method+url+params 一致只发一次），默认 true；reqOptions.dedup 可单次覆盖 */
  dedup: boolean
  loading: RequestLoadingConfig
  /** 透传给 axios 的配置（headers、timeout、withCredentials 等） */
  axiosConfig: Record<string, any>
  pageParam: PageParamConfig
  transform: TransformConfig
}

export interface ResponsePropsConfig {
  codeName: string
  messageName: string
  dataName: string
}

export interface ResponseListConfig {
  listName: string
  totalName: string
  pageSizeName: string
  currentPageName: string
}

export interface TipsConfig {
  /** 提示呈现方式：
   * - 'message'：轻量消息提示（ElMessage）
   * - 'notify'：右上角通知（ElNotification）
   * - 'messagebox'：模态弹框（ElMessageBox.alert），需用户手动确认
   * - 'none'：不提示
   */
  tipsMode: 'message' | 'notify' | 'messagebox' | 'none'
  /** 提示语义类型：success/warning/error/info */
  tipsType: 'success' | 'warning' | 'error' | 'info'
  /** 是否显示提示 */
  showTips?: boolean
  /** 弹框标题（仅 messagebox 模式有效） */
  title?: string
  /** 透传给对应组件的属性（ElMessage / ElNotification / ElMessageBox） */
  props?: Record<string, any>
}

export interface ResponseConfig {
  props: ResponsePropsConfig
  /** code >= successCode 视为成功（负数为失败） */
  successCode: number
  list: ResponseListConfig
  success: TipsConfig
  fail: TipsConfig
  exception: TipsConfig
  complete: { tipsType: string }
}

export interface PagerConfig {
  size: number
  pageSizes: number[]
  pageSize: number
  layout: string
  hideOnSinglePage: boolean
  /** 分页在底栏的水平位置：left/center/right，默认 right */
  position: 'left' | 'center' | 'right'
}

export interface PageConfig {
  /** 全局尺寸：large/default/small */
  global: { size: string }
  /** 按组件类型的默认配置，key 为组件 PascalName，如 WdDataGrid */
  componentDefault: Record<string, any>
  pager: PagerConfig
}

export interface ThemeConfig {
  /** 语义令牌覆盖（primary/success/warning/danger/info） */
  colors?: Record<string, string>
  /** CSS 变量覆盖（--wd-* / --el-*），优先级高于 colors */
  cssVars?: Record<string, string>
}

export interface WorkDesktopConfig {
  /** 库版本号，界面上显示的版本号统一从这里读取（与 package.json version 保持一致） */
  version: string
  page: PageConfig
  request: RequestConfig
  response: ResponseConfig
  theme: ThemeConfig
}

/** 请求级覆盖项（PRD 5.1 reqOptions） */
export interface ReqOptions {
  /** 是否显示 loading */
  showLoading?: boolean
  /** 是否显示提示 */
  showTips?: boolean
  /** 提示配置覆盖 */
  tipsConfig?: Partial<Record<'success' | 'fail' | 'exception', TipsConfig>>
  /** 透传给 axios 的单次配置 */
  axiosConfig?: Record<string, any>
  /** AbortSignal，用于中断 */
  signal?: AbortSignal
  /** 单次请求是否参与去重（默认取全局 request.dedup） */
  dedup?: boolean
  /** 是否列表请求（影响封包分页参数与解封列表结构），由调用方组件控制，http 不强制 */
  [key: string]: any
}
