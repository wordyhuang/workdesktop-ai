import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { resetConfig } from '../../core/config'

const { mockHttpRequest } = vi.hoisted(() => ({ mockHttpRequest: vi.fn() }))
vi.mock('../../core/http', () => ({
  request: { request: mockHttpRequest }
}))

import { useDataGrid } from '../useDataGrid'

/** 最近一次 http 请求体 */
function lastPayload() {
  const call = mockHttpRequest.mock.calls[mockHttpRequest.mock.calls.length - 1][0]
  return call.data ?? call.params
}

describe('useDataGrid', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetConfig()
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    // 默认：列表成功
    mockHttpRequest.mockResolvedValue({
      success: true,
      data: { list: [{ id: 1 }, { id: 2 }], total: 42, pageSize: 20, currentPage: 1 }
    })
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('无 api 时不发请求且返回空列表', async () => {
    const grid = useDataGrid({ pageSize: 20 })
    const r = await grid.fetchData()
    expect(r.list).toEqual([])
    expect(r.total).toBe(0)
    expect(mockHttpRequest).not.toHaveBeenCalled()
  })

  it('fetchData 组装分页参数并解封列表', async () => {
    const onLoaded = vi.fn()
    const grid = useDataGrid({ api: '/users', onLoaded })
    const result = await grid.fetchData()
    expect(grid.list.value).toHaveLength(2)
    expect(grid.total.value).toBe(42)
    expect(result.currentPage).toBe(1)
    expect(onLoaded).toHaveBeenCalledWith({ list: [{ id: 1 }, { id: 2 }], total: 42 })
    // 请求体：{ currentPage, pageSize, param:{} }
    expect(lastPayload()).toEqual({ currentPage: 1, pageSize: 20, param: {} })
    expect(mockHttpRequest.mock.calls[0][0]).toMatchObject({ url: '/users', method: 'post' })
  })

  it('apiParam / searchParams / extra 合并进 param', async () => {
    const grid = useDataGrid({ api: '/users', apiParam: { dept: 'd1' } })
    await grid.search({ kw: 'k' })
    await grid.fetchData({ extra: 1 })
    expect(lastPayload().param).toEqual({ dept: 'd1', kw: 'k', extra: 1 })
  })

  it('search 重置回第一页', async () => {
    const grid = useDataGrid({ api: '/users' })
    await grid.onChangeCurrentpage(3)
    await grid.search({ kw: 'a' })
    expect(grid.currentPage.value).toBe(1)
    expect(lastPayload().currentPage).toBe(1)
  })

  it('data 为数组时 list 与 total 取数组', async () => {
    mockHttpRequest.mockResolvedValue({ success: true, data: [{ id: 1 }, { id: 2 }, { id: 3 }] })
    const grid = useDataGrid({ api: '/users' })
    await grid.fetchData()
    expect(grid.list.value).toHaveLength(3)
    expect(grid.total.value).toBe(3)
  })

  it('业务失败返回空列表', async () => {
    mockHttpRequest.mockResolvedValue({ success: false, data: null, code: -1, message: 'x' })
    const grid = useDataGrid({ api: '/users' })
    const r = await grid.fetchData()
    expect(grid.list.value).toEqual([])
    expect(grid.total.value).toBe(0)
    expect(r.list).toEqual([])
  })

  it('get 方法时参数走 params', async () => {
    const grid = useDataGrid({ api: '/users', apiMethod: 'get' })
    await grid.fetchData()
    const call = mockHttpRequest.mock.calls[0][0]
    expect(call.method).toBe('get')
    expect(call.params).toEqual({ currentPage: 1, pageSize: 20, param: {} })
  })

  it('onChangePagesize 重置到第一页并带新 pageSize 请求', async () => {
    const grid = useDataGrid({ api: '/users' })
    await grid.onChangePagesize(50)
    expect(grid.currentPage.value).toBe(1)
    expect(grid.pageSize.value).toBe(50)
    expect(lastPayload()).toEqual({ currentPage: 1, pageSize: 50, param: {} })
  })

  it('reset 清空搜索条件', async () => {
    const grid = useDataGrid({ api: '/users' })
    await grid.search({ kw: 'a', type: 1 })
    await grid.reset()
    expect(Object.keys(grid.searchParams)).toHaveLength(0)
  })

  it('selection 增删查', () => {
    const grid = useDataGrid({ api: '/users' })
    grid.setSelection([{ id: 1 }])
    expect(grid.getSelection()).toEqual([{ id: 1 }])
    expect(grid.selection.value).toHaveLength(1)
    grid.clearSelection()
    expect(grid.getSelection()).toEqual([])
  })

  it('immediate=true 挂载即请求', async () => {
    useDataGrid({ api: '/users', immediate: true })
    await vi.waitFor(() => expect(mockHttpRequest).toHaveBeenCalledTimes(1))
  })

  it('刷新当前页 refresh 等价 fetchData', async () => {
    const grid = useDataGrid({ api: '/users' })
    await grid.refresh()
    expect(mockHttpRequest).toHaveBeenCalledTimes(1)
  })
})
