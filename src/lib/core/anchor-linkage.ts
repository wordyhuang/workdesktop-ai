/**
 * WdAnchor 跨组件联动注册中心
 *
 * filter 分组：所有参与联动的 Anchor 实例以相同 filter 注册；
 * 业务代码可在任意位置调用 setAnchorItems / notifyAnchorChange / getAnchorItems，
 * 实现跨组件、跨页面（不同 Anchor 实例同组）的菜单内容指定与刷新驱动。
 */

export interface AnchorItemLike {
  title: string
  level: number
}

export interface AnchorInstance {
  /** 组件 filter 分组标识 */
  filter: string
  /** 业务代码跨组件指定菜单内容 */
  setItems: (items: AnchorItemLike[]) => void
  /** 触发组件重新扫描（自动模式）或重算（手动模式） */
  refresh: () => void
}

/** filter 分组 → Anchor 实例集合 */
const anchorRegistry: Map<string, Set<AnchorInstance>> = new Map()

/** 最近一次 setAnchorItems 写入的快照（供 getAnchorItems 读取） */
const itemsCache: Map<string, AnchorItemLike[]> = new Map()

function groupOf(filter?: string): string {
  return filter || ''
}

/**
 * 注册 Anchor 实例，返回注销函数（组件 onUnmounted 调用）
 */
export function registerAnchorInstance(instance: AnchorInstance): () => void {
  const key = groupOf(instance.filter)
  if (!anchorRegistry.has(key)) {
    anchorRegistry.set(key, new Set())
  }
  anchorRegistry.get(key)!.add(instance)
  return () => {
    anchorRegistry.get(key)?.delete(instance)
  }
}

/**
 * 跨组件指定菜单内容：把同组 Anchor 全部切换为手动 items 模式
 * @returns 被设置的实例数量
 */
export function setAnchorItems(filter: string, items: AnchorItemLike[]): number {
  itemsCache.set(groupOf(filter), items.map((i) => ({ ...i })))
  const group = anchorRegistry.get(groupOf(filter))
  if (!group) return 0
  let count = 0
  group.forEach((ins) => {
    try {
      ins.setItems(items)
      count += 1
    } catch (e) {
      console.error('[WorkDesktop] setAnchorItems error:', e)
    }
  })
  return count
}

/**
 * 通知同组 Anchor 重新扫描 / 刷新
 * @returns 被通知的实例数量
 */
export function notifyAnchorChange(filter: string): number {
  const group = anchorRegistry.get(groupOf(filter))
  if (!group) return 0
  let count = 0
  group.forEach((ins) => {
    try {
      ins.refresh()
      count += 1
    } catch (e) {
      console.error('[WorkDesktop] notifyAnchorChange error:', e)
    }
  })
  return count
}

/**
 * 读取同组 Anchor 当前菜单（最近一次 setAnchorItems 传入的快照）
 */
export function getAnchorItems(filter: string): AnchorItemLike[] {
  const cache = itemsCache.get(groupOf(filter))
  return cache ? [...cache] : []
}

/**
 * 仅供测试 / 调试：清空注册中心
 */
export function clearAnchorRegistry(): void {
  anchorRegistry.clear()
  itemsCache.clear()
}
