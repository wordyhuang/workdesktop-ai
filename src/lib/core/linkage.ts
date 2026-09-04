/**
 * 声明式联动注册中心（PRD 6.2）
 *
 * filter 分组机制：所有参与联动的组件有通用 prop `filter`（默认 ''）。
 * 联动只在 filter 相同的组件之间发生。
 *
 * DataGrid 挂载时按 filter 注册到注册中心；
 * DataForm / ApiButton / Dialog / Drawer 等动作完成后，
 * 调用 refreshDataGrid(headRefreshDatagrid, selfFilter) 刷新目标。
 */

export interface DataGridInstance {
  /** 组件 filter 分组标识 */
  filter: string
  /** 刷新当前页数据 */
  refresh: () => any
  /** 带搜索参数查询（重置到第一页，合并搜索条件） */
  search?: (params?: Record<string, any>) => any
  /** 清空搜索条件并刷新 */
  resetSearch?: () => any
}

/** filter 分组 → DataGrid 实例集合（同组多个全部刷新） */
const dataGridRegistry: Map<string, Set<DataGridInstance>> = new Map()

function groupOf(filter?: string): string {
  return filter || ''
}

/**
 * 注册 DataGrid 实例，返回注销函数（组件 onUnmounted 调用）
 */
export function registerDataGrid(instance: DataGridInstance): () => void {
  const key = groupOf(instance.filter)
  if (!dataGridRegistry.has(key)) {
    dataGridRegistry.set(key, new Set())
  }
  dataGridRegistry.get(key)!.add(instance)
  return () => {
    dataGridRegistry.get(key)?.delete(instance)
  }
}

/**
 * 刷新目标 DataGrid
 * @param headRefreshDatagrid true=刷同 filter 组；字符串=定向刷该 filter 组
 * @param selfFilter 发起组件自身 filter
 * @returns 被刷新的实例数量
 */
export function refreshDataGrid(
  headRefreshDatagrid: boolean | string | undefined,
  selfFilter?: string
): number {
  if (!headRefreshDatagrid) return 0

  // 字符串：显式指定目标 filter（跨组定向联动）
  const targetFilter = typeof headRefreshDatagrid === 'string' ? headRefreshDatagrid : groupOf(selfFilter)

  const group = dataGridRegistry.get(targetFilter)
  if (!group) return 0

  let count = 0
  group.forEach((grid) => {
    try {
      grid.refresh()
      count += 1
    } catch (e) {
      console.error('[WorkDesktop] refreshDataGrid error:', e)
    }
  })
  return count
}

/**
 * 获取某 filter 组的 DataGrid 实例（事件联动 / 自定义逻辑用）
 */
export function getDataGrids(filter?: string): DataGridInstance[] {
  const group = dataGridRegistry.get(groupOf(filter))
  return group ? Array.from(group) : []
}

/**
 * SearchPanel 联动：带搜索参数刷新目标 DataGrid（重置到第一页）
 * @param params 搜索表单值
 */
export function searchDataGrid(
  params: Record<string, any> | undefined,
  headRefreshDatagrid: boolean | string | undefined,
  selfFilter?: string
): number {
  if (!headRefreshDatagrid) return 0
  const targetFilter = typeof headRefreshDatagrid === 'string' ? headRefreshDatagrid : groupOf(selfFilter)
  const group = dataGridRegistry.get(targetFilter)
  if (!group) return 0

  let count = 0
  group.forEach((grid) => {
    try {
      if (grid.search) {
        grid.search(params)
      } else {
        grid.refresh()
      }
      count += 1
    } catch (e) {
      console.error('[WorkDesktop] searchDataGrid error:', e)
    }
  })
  return count
}

/**
 * SearchPanel 重置联动：清空目标 DataGrid 搜索条件并刷新
 */
export function resetSearchDataGrid(
  headRefreshDatagrid: boolean | string | undefined,
  selfFilter?: string
): number {
  if (!headRefreshDatagrid) return 0
  const targetFilter = typeof headRefreshDatagrid === 'string' ? headRefreshDatagrid : groupOf(selfFilter)
  const group = dataGridRegistry.get(targetFilter)
  if (!group) return 0

  let count = 0
  group.forEach((grid) => {
    try {
      if (grid.resetSearch) {
        grid.resetSearch()
      } else {
        grid.refresh()
      }
      count += 1
    } catch (e) {
      console.error('[WorkDesktop] resetSearchDataGrid error:', e)
    }
  })
  return count
}

/**
 * 仅供测试 / 调试：清空注册中心
 */
export function clearLinkageRegistry(): void {
  dataGridRegistry.clear()
}
