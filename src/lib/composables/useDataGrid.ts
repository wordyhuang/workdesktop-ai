import { ref, reactive, shallowRef } from 'vue'
import { request, type ApiResult } from '../core/http'
import { getGlobalConfig } from '../core/config'

/**
 * useDataGrid（PRD 5.3）
 * DataGrid 状态管理：分页 / 搜索 / 选中 / 请求
 *
 * @example
 * const grid = useDataGrid({ pageSize: 20 })
 * grid.fetchData()
 */

export interface UseDataGridOptions {
  /** 数据接口地址 */
  api?: string
  /** 请求方法，默认 post */
  apiMethod?: 'get' | 'post' | 'put' | 'delete'
  /** 固定请求参数 */
  apiParam?: Record<string, any>
  /** 初始每页条数 */
  pageSize?: number
  /** 是否自动请求 */
  immediate?: boolean
  /** 请求级覆盖 */
  reqOptions?: import('../../types/config').ReqOptions
  /** 请求成功回调（解封后的列表结果） */
  onLoaded?: (result: { list: any[]; total: number }) => void
}

export interface ListData {
  list: any[]
  total: number
  pageSize: number
  currentPage: number
}

export function useDataGrid(options: UseDataGridOptions = {}) {
  const cfg = getGlobalConfig()
  const {
    api,
    apiMethod = 'post',
    apiParam = {},
    pageSize: initPageSize = cfg.page.pager.pageSize,
    immediate = false,
    reqOptions,
    onLoaded
  } = options

  const currentPage = ref(1)
  const pageSize = ref(initPageSize)
  const total = ref(0)
  const list = shallowRef<any[]>([])
  const loading = ref(false)
  const searchParams = reactive<Record<string, any>>({})
  const selection = ref<any[]>([])

  const pageParam = cfg.request.pageParam
  const listCfg = cfg.response.list

  let controller: AbortController | null = null

  /**
   * 组装列表请求体：{ currentPage, pageSize, param: {...搜索+固定参数} }
   */
  function buildParams(extra?: Record<string, any>) {
    const params: Record<string, any> = {
      [pageParam.pageField]: currentPage.value,
      [pageParam.sizeField]: pageSize.value
    }
    params[pageParam.searchField] = {
      ...apiParam,
      ...searchParams,
      ...(extra || {})
    }
    return params
  }

  /**
   * 请求数据
   */
  async function fetchData(extra?: Record<string, any>): Promise<ListData> {
    if (!api) {
      list.value = []
      total.value = 0
      return { list: [], total: 0, pageSize: pageSize.value, currentPage: currentPage.value }
    }

    loading.value = true
    if (controller) controller.abort()
    controller = new AbortController()

    const body = buildParams(extra)
    try {
      let result: ApiResult<any>
      if (apiMethod === 'get') {
        result = await request.request({ url: api, method: 'get', params: body }, { ...reqOptions, signal: controller.signal })
      } else {
        result = await request.request({ url: api, method: apiMethod, data: body }, { ...reqOptions, signal: controller.signal })
      }

      if (result.success) {
        const data = result.data
        // 解封列表结构
        let rows: any[] = []
        let totalCount = 0
        if (Array.isArray(data)) {
          rows = data
          totalCount = data.length
        } else if (data && typeof data === 'object') {
          rows = data[listCfg.listName] ?? data.list ?? []
          totalCount = data[listCfg.totalName] ?? data.total ?? rows.length
        }
        list.value = rows
        total.value = totalCount
        onLoaded?.({ list: rows, total: totalCount })
        return {
          list: rows,
          total: totalCount,
          pageSize: data?.[listCfg.pageSizeName] ?? pageSize.value,
          currentPage: data?.[listCfg.currentPageName] ?? currentPage.value
        }
      }
      list.value = []
      total.value = 0
      return { list: [], total: 0, pageSize: pageSize.value, currentPage: currentPage.value }
    } finally {
      loading.value = false
      controller = null
    }
  }

  /** 刷新当前页 */
  function refresh() {
    return fetchData()
  }

  /** 重置到第一页并清空搜索条件 */
  function reset() {
    currentPage.value = 1
    Object.keys(searchParams).forEach((k) => delete searchParams[k])
    return fetchData()
  }

  function onChangeCurrentpage(value: number) {
    currentPage.value = value
    return fetchData()
  }

  function onChangePagesize(value: number) {
    pageSize.value = value
    currentPage.value = 1
    return fetchData()
  }

  function setSelection(rows: any[]) {
    selection.value = rows || []
  }

  function getSelection() {
    return selection.value
  }

  function clearSelection() {
    selection.value = []
  }

  /** 合并搜索条件并查询（搜索面板用） */
  function search(params?: Record<string, any>) {
    if (params) Object.assign(searchParams, params)
    currentPage.value = 1
    return fetchData()
  }

  if (immediate) {
    fetchData()
  }

  return {
    // 状态
    currentPage,
    page: currentPage,
    pageSize,
    total,
    list,
    loading,
    searchParams,
    selection,
    // 方法
    fetchData,
    refresh,
    reset,
    search,
    onChangeCurrentpage,
    onChangePagesize,
    setSelection,
    getSelection,
    clearSelection,
    buildParams
  }
}

export type DataGridController = ReturnType<typeof useDataGrid>
