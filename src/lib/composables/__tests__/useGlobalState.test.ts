import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useGlobalState } from '../useGlobalState'

describe('useGlobalState 全局状态单例', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('相同 key 共享同一份状态', () => {
    const a = useGlobalState('cart', { items: [] as number[] })
    const b = useGlobalState('cart')
    a.state.items.push(1)
    expect(b.state.items).toEqual([1])
    expect(a.state).toBe(b.state)
  })

  it('set 支持对象与函数式更新', () => {
    const { state, set } = useGlobalState('counter', { n: 0 })
    set({ n: 5 })
    expect(state.n).toBe(5)
    set((prev: any) => ({ n: prev.n + 1 }))
    expect(state.n).toBe(6)
  })

  it('初始缺省字段在第二次访问时补齐', () => {
    const a = useGlobalState('obj', { x: 1 })
    const b = useGlobalState('obj', { x: 1, y: 2 })
    expect(b.state.y).toBe(2)
    expect(a.state.y).toBe(2)
  })

  it('reset 恢复初始值', () => {
    const { state, set, reset } = useGlobalState('r', { n: 1, m: 'a' })
    set({ n: 99 })
    reset()
    expect(state.n).toBe(1)
    expect(state.m).toBe('a')
  })

  it('无初始值 reset 清空', () => {
    const { state, set, reset } = useGlobalState('empty')
    set({ k: 1 } as any)
    reset()
    expect(Object.keys(state)).toHaveLength(0)
  })
})
