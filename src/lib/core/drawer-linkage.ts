/**
 * Drawer 联动注册中心
 *
 * 与 linkage.ts（DataGrid 联动）同模式：filter 分组注册。
 * Station 顶部刷新按钮点击时优先刷新当前「可见」的同组 Drawer，
 * 没有可见抽屉（返回 0）才回退刷新 Station 内容页。
 *
 * Drawer 挂载时按 filter 注册到注册中心（isVisible + refresh），
 * Station.refresh 调用 refreshDrawers(selfFilter) 触发。
 */

export interface DrawerInstance {
  /** 组件 filter 分组标识（与 Station/DataGrid 的 filter 通用） */
  filter: string
  /** 抽屉是否当前可见（只有可见的抽屉会被刷新） */
  isVisible: () => boolean
  /** 刷新抽屉内容（iframe 重载 / 内容组件 refresh / key 重挂载） */
  refresh: () => any
}

/** filter 分组 → Drawer 实例集合 */
const drawerRegistry: Map<string, Set<DrawerInstance>> = new Map()

function groupOf(filter?: string): string {
  return filter || ''
}

/**
 * 注册 Drawer 实例，返回注销函数（组件 onUnmounted 调用）
 */
export function registerDrawer(instance: DrawerInstance): () => void {
  const key = groupOf(instance.filter)
  if (!drawerRegistry.has(key)) {
    drawerRegistry.set(key, new Set())
  }
  drawerRegistry.get(key)!.add(instance)
  return () => {
    drawerRegistry.get(key)?.delete(instance)
  }
}

/**
 * 刷新同 filter 组内所有「可见」的 Drawer
 * @param selfFilter 发起方（Station）自身 filter
 * @returns 实际刷新的实例数量（0 = 没有可见抽屉，调用方可回退刷新内容页）
 */
export function refreshDrawers(selfFilter?: string): number {
  const group = drawerRegistry.get(groupOf(selfFilter))
  if (!group) return 0

  let count = 0
  group.forEach((drawer) => {
    try {
      if (!drawer.isVisible()) return
      drawer.refresh()
      count += 1
    } catch (e) {
      console.error('[WorkDesktop] refreshDrawers error:', e)
    }
  })
  return count
}

/**
 * 获取某 filter 组的 Drawer 实例（事件联动 / 自定义逻辑用）
 */
export function getDrawers(filter?: string): DrawerInstance[] {
  const group = drawerRegistry.get(groupOf(filter))
  return group ? Array.from(group) : []
}

/**
 * 仅供测试 / 调试：清空注册中心
 */
export function clearDrawerLinkageRegistry(): void {
  drawerRegistry.clear()
}
