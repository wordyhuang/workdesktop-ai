import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  registerDataGrid,
  refreshDataGrid,
  searchDataGrid,
  resetSearchDataGrid,
  getDataGrids,
  clearLinkageRegistry,
  type DataGridInstance
} from '../linkage'

function makeGrid(filter = '', overrides: Partial<DataGridInstance> = {}): DataGridInstance {
  return {
    filter,
    refresh: vi.fn(),
    search: vi.fn(),
    resetSearch: vi.fn(),
    ...overrides
  }
}

describe('linkage 声明式联动注册中心', () => {
  beforeEach(() => {
    clearLinkageRegistry()
  })

  it('refreshDataGrid：headRefreshDatagrid 为空时不动作', () => {
    const grid = makeGrid('list')
    registerDataGrid(grid)
    expect(refreshDataGrid(false, 'list')).toBe(0)
    expect(refreshDataGrid(undefined, 'list')).toBe(0)
    expect(grid.refresh).not.toHaveBeenCalled()
  })

  it('refreshDataGrid=true 刷新同 filter 组', () => {
    const a = makeGrid('main')
    const b = makeGrid('main')
    registerDataGrid(a)
    registerDataGrid(b)
    expect(refreshDataGrid(true, 'main')).toBe(2)
    expect(a.refresh).toHaveBeenCalledTimes(1)
    expect(b.refresh).toHaveBeenCalledTimes(1)
  })

  it('refreshDataGrid=字符串可跨组定向刷新', () => {
    const grid = makeGrid('other')
    registerDataGrid(grid)
    expect(refreshDataGrid('other', 'self')).toBe(1)
    expect(grid.refresh).toHaveBeenCalledTimes(1)
  })

  it('refreshDataGrid：目标组不存在返回 0', () => {
    registerDataGrid(makeGrid('main'))
    expect(refreshDataGrid(true, 'nothing')).toBe(0)
  })

  it('注册返回的注销函数可移除实例', () => {
    const grid = makeGrid('main')
    const dispose = registerDataGrid(grid)
    dispose()
    expect(refreshDataGrid(true, 'main')).toBe(0)
    expect(getDataGrids('main')).toHaveLength(0)
  })

  it('单个实例 refresh 抛错不影响同组其它实例', () => {
    const errGrid = makeGrid('main', { refresh: vi.fn(() => { throw new Error('boom') }) } as any)
    const okGrid = makeGrid('main')
    registerDataGrid(errGrid)
    registerDataGrid(okGrid)
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(refreshDataGrid(true, 'main')).toBe(1)
    expect(okGrid.refresh).toHaveBeenCalledTimes(1)
    spy.mockRestore()
  })

  it('searchDataGrid 优先走 search，缺失时回退 refresh', () => {
    const withSearch = makeGrid('main')
    const noSearch = makeGrid('main', { search: undefined } as any)
    registerDataGrid(withSearch)
    registerDataGrid(noSearch)
    const params = { kw: 'x' }
    expect(searchDataGrid(params, true, 'main')).toBe(2)
    expect(withSearch.search).toHaveBeenCalledWith(params)
    expect(noSearch.refresh).toHaveBeenCalledTimes(1)
    expect(withSearch.refresh).not.toHaveBeenCalled()
  })

  it('resetSearchDataGrid 优先走 resetSearch，缺失时回退 refresh', () => {
    const withReset = makeGrid('main')
    const noReset = makeGrid('main', { resetSearch: undefined } as any)
    registerDataGrid(withReset)
    registerDataGrid(noReset)
    expect(resetSearchDataGrid(true, 'main')).toBe(2)
    expect(withReset.resetSearch).toHaveBeenCalledTimes(1)
    expect(noReset.refresh).toHaveBeenCalledTimes(1)
  })

  it('getDataGrids 返回指定 filter 组实例', () => {
    const a = makeGrid('g1')
    const b = makeGrid('g2')
    registerDataGrid(a)
    registerDataGrid(b)
    expect(getDataGrids('g1')).toEqual([a])
    expect(getDataGrids('g2')).toEqual([b])
    expect(getDataGrids('g9')).toEqual([])
    // 空 filter 与空字符串同组
    const c = makeGrid('')
    registerDataGrid(c)
    expect(getDataGrids()).toEqual([c])
  })

  it('多个 filter 组互不干扰', () => {
    const g1 = makeGrid('groupA')
    const g2 = makeGrid('groupB')
    registerDataGrid(g1)
    registerDataGrid(g2)
    expect(refreshDataGrid(true, 'groupA')).toBe(1)
    expect(g2.refresh).not.toHaveBeenCalled()
  })
})
