/**
 * WdDrawer 联动注册中心测试
 * Station 顶部刷新按钮优先刷新当前「可见」的同 filter 组 Drawer，
 * 没有可见抽屉时才回退刷新内容页（由 Station 侧根据返回数量判断）。
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  registerDrawer,
  refreshDrawers,
  getDrawers,
  clearDrawerLinkageRegistry,
  type DrawerInstance
} from '../drawer-linkage'

function makeDrawer(filter = '', visible = true, overrides: Partial<DrawerInstance> = {}): DrawerInstance {
  return {
    filter,
    isVisible: () => visible,
    refresh: vi.fn(),
    ...overrides
  }
}

describe('drawer-linkage 抽屉联动注册中心', () => {
  beforeEach(() => {
    clearDrawerLinkageRegistry()
  })

  it('refreshDrawers 只刷新可见的抽屉', () => {
    const opened = makeDrawer('main', true)
    const closed = makeDrawer('main', false)
    registerDrawer(opened)
    registerDrawer(closed)
    expect(refreshDrawers('main')).toBe(1)
    expect(opened.refresh).toHaveBeenCalledTimes(1)
    expect(closed.refresh).not.toHaveBeenCalled()
  })

  it('组内全部不可见时返回 0（调用方回退刷新内容页）', () => {
    registerDrawer(makeDrawer('main', false))
    expect(refreshDrawers('main')).toBe(0)
  })

  it('组内无注册实例时返回 0', () => {
    expect(refreshDrawers('nothing')).toBe(0)
  })

  it('filter 分组隔离：只刷新同组抽屉', () => {
    const main = makeDrawer('main', true)
    const other = makeDrawer('other', true)
    registerDrawer(main)
    registerDrawer(other)
    expect(refreshDrawers('main')).toBe(1)
    expect(main.refresh).toHaveBeenCalledTimes(1)
    expect(other.refresh).not.toHaveBeenCalled()
  })

  it('默认 filter（空字符串）为一组', () => {
    const a = makeDrawer('', true)
    const b = makeDrawer(undefined as any, true)
    registerDrawer(a)
    registerDrawer(b)
    expect(refreshDrawers()).toBe(2)
  })

  it('多个可见抽屉全部刷新', () => {
    const a = makeDrawer('main', true)
    const b = makeDrawer('main', true)
    registerDrawer(a)
    registerDrawer(b)
    expect(refreshDrawers('main')).toBe(2)
    expect(a.refresh).toHaveBeenCalledTimes(1)
    expect(b.refresh).toHaveBeenCalledTimes(1)
  })

  it('单个抽屉 refresh 抛异常不影响其他实例且不计入数量', () => {
    const bad = makeDrawer('main', true, { refresh: vi.fn(() => { throw new Error('boom') }) })
    const good = makeDrawer('main', true)
    registerDrawer(bad)
    registerDrawer(good)
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(refreshDrawers('main')).toBe(1)
    expect(good.refresh).toHaveBeenCalledTimes(1)
    spy.mockRestore()
  })

  it('isVisible 抛异常时按不可见处理且不中断遍历', () => {
    const bad = makeDrawer('main', true, { isVisible: () => { throw new Error('boom') } })
    const good = makeDrawer('main', true)
    registerDrawer(bad)
    registerDrawer(good)
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(refreshDrawers('main')).toBe(1)
    spy.mockRestore()
  })

  it('注册返回的注销函数可移除实例', () => {
    const drawer = makeDrawer('main', true)
    const dispose = registerDrawer(drawer)
    dispose()
    expect(refreshDrawers('main')).toBe(0)
    expect(getDrawers('main')).toHaveLength(0)
  })

  it('getDrawers 返回组内全部实例', () => {
    const a = makeDrawer('main', true)
    const b = makeDrawer('main', false)
    registerDrawer(a)
    registerDrawer(b)
    registerDrawer(makeDrawer('other', true))
    expect(getDrawers('main')).toHaveLength(2)
    expect(getDrawers('other')).toHaveLength(1)
    expect(getDrawers('empty')).toHaveLength(0)
  })

  it('clearDrawerLinkageRegistry 清空全部分组', () => {
    registerDrawer(makeDrawer('main', true))
    registerDrawer(makeDrawer('other', true))
    clearDrawerLinkageRegistry()
    expect(refreshDrawers('main')).toBe(0)
    expect(refreshDrawers('other')).toBe(0)
  })
})
