/**
 * WdStation 联动注册中心
 *
 * 复用 DataGrid linkage 的 filter 分组心智：
 * - Station 挂载时按 filter 注册；
 * - 业务代码调用 setStationFooter(target, info, selfFilter) 更新底部动态信息；
 * - refreshStationView(target, selfFilter) 触发内容区强制刷新（重新挂载）。
 *
 * target：true = 与发起方同 filter 组；字符串 = 定向该 filter 组。
 */

export interface StationInstance {
  /** 组件 filter 分组标识 */
  filter: string
  /** 设置底部动态信息 */
  setFooterInfo: (info: string) => void
  /** 刷新内容区（强制重挂载） */
  refresh: () => void
  /** 当前激活菜单的路径链（分组标题 → 菜单 → 子菜单），供 WdPath 自动模式读取 */
  getActiveMenuChain?: () => MenuChainItem[]
  /** 打开并激活一个标签页（WdStationTabButton 联动） */
  openTab?: (tab: StationTabInput) => void
}

/** 外部联动打开的标签页入参（key / title 可缺省：仅给 path 时由 Station 反查菜单补齐） */
export interface StationTabInput {
  /** 标签唯一标识（与 Station 菜单项 key 一致；缺省时按 path 反查） */
  key?: string
  /** 标签标题（缺省时按 path 反查菜单标题，仍未取到则回退 key） */
  title?: string
  /** 标签对应路由路径 */
  path?: string
  /** 标签图标（EP 图标名 / 图标字体 class / 组件） */
  icon?: string | object
  /** 固定标签（不可关闭） */
  affix?: boolean
}

/** 菜单链节点（面包屑自动模式的菜单段） */
export interface MenuChainItem {
  /** 标题 */
  title: string
  /** 路由路径 */
  path?: string
  /** 图标（ElementPlus 图标名字符串或组件） */
  icon?: string | object
}

/** filter 分组 → Station 实例集合 */
const stationRegistry: Map<string, Set<StationInstance>> = new Map()

function groupOf(filter?: string): string {
  return filter || ''
}

/**
 * 注册 Station 实例，返回注销函数（组件 onUnmounted 调用）
 */
export function registerStation(instance: StationInstance): () => void {
  const key = groupOf(instance.filter)
  if (!stationRegistry.has(key)) {
    stationRegistry.set(key, new Set())
  }
  stationRegistry.get(key)!.add(instance)
  return () => {
    stationRegistry.get(key)?.delete(instance)
  }
}

function resolveTargets(target: boolean | string | undefined, selfFilter?: string): StationInstance[] {
  if (!target) return []
  const targetFilter = typeof target === 'string' ? target : groupOf(selfFilter)
  const group = stationRegistry.get(targetFilter)
  return group ? Array.from(group) : []
}

/**
 * 设置目标 Station 底部动态信息
 * @param target true=同 filter 组；字符串=定向该 filter 组
 * @param info 展示内容（文本）
 * @param selfFilter 发起方自身 filter
 * @returns 被更新的实例数量
 */
export function setStationFooter(
  target: boolean | string,
  info: string,
  selfFilter?: string
): number {
  const targets = resolveTargets(target, selfFilter)
  let count = 0
  targets.forEach((station) => {
    try {
      station.setFooterInfo(info)
      count += 1
    } catch (e) {
      console.error('[WorkDesktop] setStationFooter error:', e)
    }
  })
  return count
}

/**
 * 刷新目标 Station 内容区（强制重新挂载）
 * @param target true=同 filter 组（默认）；字符串=定向该 filter 组
 * @param selfFilter 发起方自身 filter
 * @returns 被刷新的实例数量
 */
export function refreshStationView(
  target: boolean | string = true,
  selfFilter?: string
): number {
  const targets = resolveTargets(target, selfFilter)
  let count = 0
  targets.forEach((station) => {
    try {
      station.refresh()
      count += 1
    } catch (e) {
      console.error('[WorkDesktop] refreshStationView error:', e)
    }
  })
  return count
}

/**
 * 读取目标 Station 当前激活菜单的路径链（供 WdPath 自动模式使用）
 * @param target true=同 filter 组；字符串=定向该 filter 组
 * @param selfFilter 发起方自身 filter
 * @returns 菜单链节点数组（无匹配实例时为空数组）
 */
export function getStationMenuChain(
  target: boolean | string | undefined,
  selfFilter?: string
): MenuChainItem[] {
  const targets = resolveTargets(target, selfFilter)
  for (const station of targets) {
    try {
      const chain = station.getActiveMenuChain?.()
      if (chain && chain.length) return chain
    } catch (e) {
      console.error('[WorkDesktop] getStationMenuChain error:', e)
    }
  }
  return []
}

/**
 * 打开目标 Station 的一个标签页并激活（WdStationTabButton 使用）
 * @param target true=同 filter 组；字符串=定向该 filter 组
 * @param tab 标签入参（key 可缺省，仅给 path 时由 Station 反查菜单补齐）
 * @param selfFilter 发起方自身 filter
 * @returns 成功打开的实例数量（同组多个 Station 时按注册顺序尝试，首个成功即返回）
 */
export function openStationTab(
  target: string | boolean | undefined,
  tab: StationTabInput,
  selfFilter?: string
): number {
  if (!tab.key && !tab.path) return 0
  const targets = resolveTargets(target, selfFilter)
  for (const station of targets) {
    if (!station.openTab) continue
    try {
      station.openTab(tab)
      return 1
    } catch (e) {
      console.error('[WorkDesktop] openStationTab error:', e)
    }
  }
  return 0
}

/** filter 分组 → 路径组件刷新回调集合（Station 菜单变化时通知同组 Path 重新读取菜单链） */
const pathListeners: Map<string, Set<() => void>> = new Map()

/**
 * 订阅某 filter 组的 Station 变化（菜单/分组切换），返回取消订阅函数
 */
export function subscribeStationChange(filter: string, cb: () => void): () => void {
  const key = groupOf(filter)
  if (!pathListeners.has(key)) {
    pathListeners.set(key, new Set())
  }
  pathListeners.get(key)!.add(cb)
  return () => {
    pathListeners.get(key)?.delete(cb)
  }
}

/**
 * 通知某 filter 组的订阅者：Station 的激活菜单/分组发生了变化
 * （Station 内部在菜单选中、分组切换、路由反查、挂载时调用）
 */
export function notifyStationChange(filter: string): void {
  pathListeners.get(groupOf(filter))?.forEach((cb) => {
    try {
      cb()
    } catch (e) {
      console.error('[WorkDesktop] notifyStationChange error:', e)
    }
  })
}

/**
 * 仅供测试 / 调试：清空路径组件订阅者
 */
export function clearPathListeners(): void {
  pathListeners.clear()
}

/**
 * 仅供测试 / 调试：清空注册中心
 */
export function clearStationRegistry(): void {
  stationRegistry.clear()
}
