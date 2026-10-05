import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  registerStation,
  setStationFooter,
  refreshStationView,
  getStationMenuChain,
  subscribeStationChange,
  notifyStationChange,
  clearStationRegistry,
  clearPathListeners
} from '../station-linkage'

const makeStation = (filter = '', chain: { title: string; path?: string }[] = []) => {
  const instance: any = {
    filter,
    setFooterInfo: vi.fn(),
    refresh: vi.fn(),
    getActiveMenuChain: chain.length ? vi.fn(() => chain) : undefined
  }
  const unregister = registerStation(instance)
  return { instance, unregister }
}

beforeEach(() => {
  clearStationRegistry()
  clearPathListeners()
})

describe('registerStation / setStationFooter / refreshStationView', () => {
  it('按 filter 分组注册，setStationFooter 只更新同组实例并返回数量', () => {
    const a = makeStation('g1')
    const b = makeStation('g1')
    const c = makeStation('g2')

    const n = setStationFooter('g1', '信息')
    expect(n).toBe(2)
    expect(a.instance.setFooterInfo).toHaveBeenCalledWith('信息')
    expect(b.instance.setFooterInfo).toHaveBeenCalledWith('信息')
    expect(c.instance.setFooterInfo).not.toHaveBeenCalled()

    const m = setStationFooter(true, 'x', 'g2')
    expect(m).toBe(1)
    expect(c.instance.setFooterInfo).toHaveBeenCalledWith('x')
  })

  it('refreshStationView 刷新同组实例并返回数量', () => {
    const a = makeStation('g')
    const b = makeStation('g')
    const n = refreshStationView('g')
    expect(n).toBe(2)
    expect(a.instance.refresh).toHaveBeenCalledTimes(1)
    expect(b.instance.refresh).toHaveBeenCalledTimes(1)
  })

  it('注销后不再被联动命中', () => {
    const { instance, unregister } = makeStation('g')
    unregister()
    expect(setStationFooter('g', 'x')).toBe(0)
    expect(instance.setFooterInfo).not.toHaveBeenCalled()
  })
})

describe('getStationMenuChain（面包屑自动模式读取菜单链）', () => {
  it('返回同 filter 组首个实例的菜单链', () => {
    makeStation('g', [{ title: '工作区', path: '/work' }, { title: '任务列表' }])
    const chain = getStationMenuChain(true, 'g')
    expect(chain).toEqual([{ title: '工作区', path: '/work' }, { title: '任务列表' }])
  })

  it('支持字符串定向其他 filter 组', () => {
    makeStation('source', [{ title: '系统设置' }])
    makeStation('other', [{ title: '无关组' }])
    const chain = getStationMenuChain('source')
    expect(chain.map((c) => c.title)).toEqual(['系统设置'])
  })

  it('无匹配实例或实例无菜单链时返回空数组', () => {
    expect(getStationMenuChain('nope')).toEqual([])
    makeStation('g') // 未提供 getActiveMenuChain
    expect(getStationMenuChain(true, 'g')).toEqual([])
  })

  it('实例 getActiveMenuChain 抛错时被隔离，不影响其他实例', () => {
    const bad: any = {
      filter: 'g',
      setFooterInfo: vi.fn(),
      refresh: vi.fn(),
      getActiveMenuChain: () => {
        throw new Error('boom')
      }
    }
    registerStation(bad)
    makeStation('g', [{ title: '正常组' }])
    const chain = getStationMenuChain(true, 'g')
    expect(chain.map((c) => c.title)).toEqual(['正常组'])
  })
})

describe('subscribeStationChange / notifyStationChange', () => {
  it('通知同 filter 组订阅者，其他组不受影响', () => {
    const cbA = vi.fn()
    const cbB = vi.fn()
    subscribeStationChange('g', cbA)
    subscribeStationChange('other', cbB)

    notifyStationChange('g')
    expect(cbA).toHaveBeenCalledTimes(1)
    expect(cbB).not.toHaveBeenCalled()
  })

  it('取消订阅后不再收到通知', () => {
    const cb = vi.fn()
    const unsub = subscribeStationChange('g', cb)
    unsub()
    notifyStationChange('g')
    expect(cb).not.toHaveBeenCalled()
  })

  it('订阅者抛错被隔离，不影响其他订阅者', () => {
    const bad = vi.fn(() => {
      throw new Error('boom')
    })
    const good = vi.fn()
    subscribeStationChange('g', bad)
    subscribeStationChange('g', good)
    notifyStationChange('g')
    expect(good).toHaveBeenCalledTimes(1)
  })
})
