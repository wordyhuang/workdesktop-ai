import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useEventBus } from '../useEventBus'

describe('useEventBus 轻量事件总线', () => {
  let bus: ReturnType<typeof useEventBus>
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    bus = useEventBus()
    bus.clear()
  })
  afterEach(() => {
    bus.clear()
    vi.restoreAllMocks()
  })

  it('on/emit 触发并透传 payload', () => {
    const fn = vi.fn()
    bus.on('evt', fn)
    bus.emit('evt', { a: 1 })
    expect(fn).toHaveBeenCalledWith({ a: 1 })
  })

  it('off 解绑后不再触发', () => {
    const fn = vi.fn()
    const dispose = bus.on('evt', fn)
    bus.emit('evt')
    dispose()
    bus.emit('evt')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('autoOn 返回解绑函数，可手动释放', () => {
    const fn = vi.fn()
    const fn2 = vi.fn()
    bus.on('e1', fn)
    bus.on('e1', fn2)
    bus.emit('e1')
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn2).toHaveBeenCalledTimes(1)
    const dispose = bus.on('e1', fn)
    bus.emit('e1')
    expect(fn).toHaveBeenCalledTimes(2)
    dispose()
    bus.emit('e1')
    expect(fn).toHaveBeenCalledTimes(2)
    expect(fn2).toHaveBeenCalledTimes(3)
  })

  it('clear(event) 只清指定事件', () => {
    const fn = vi.fn()
    const fn2 = vi.fn()
    bus.on('e1', fn)
    bus.on('e2', fn2)
    bus.clear('e1')
    bus.emit('e1')
    bus.emit('e2')
    expect(fn).not.toHaveBeenCalled()
    expect(fn2).toHaveBeenCalledTimes(1)
  })

  it('clear() 清空全部', () => {
    const fn = vi.fn()
    bus.on('e1', fn)
    bus.on('e2', fn)
    bus.clear()
    bus.emit('e1')
    bus.emit('e2')
    expect(fn).not.toHaveBeenCalled()
  })

  it('handler 抛错不影响其它 handler', () => {
    const good = vi.fn()
    bus.on('e', () => {
      throw new Error('bad')
    })
    bus.on('e', good)
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    bus.emit('e')
    expect(good).toHaveBeenCalledTimes(1)
    spy.mockRestore()
  })

  it('未注册事件 emit 静默', () => {
    expect(() => bus.emit('nothing')).not.toThrow()
  })
})
