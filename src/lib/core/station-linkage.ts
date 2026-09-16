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
 * 仅供测试 / 调试：清空注册中心
 */
export function clearStationRegistry(): void {
  stationRegistry.clear()
}
