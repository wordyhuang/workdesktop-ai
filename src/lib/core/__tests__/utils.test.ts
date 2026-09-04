import { describe, it, expect } from 'vitest'
import { deepMerge, getValueByPath, safeJsonParse, debounce, isPlainObject } from '../utils'

describe('utils.deepMerge', () => {
  it('深合并嵌套对象', () => {
    const a = { request: { urlPrefix: '/a', loading: { enable: true } } }
    const b = { request: { loading: { enable: false, text: 'x' } } }
    const r = deepMerge(a, b)
    expect(r.request.urlPrefix).toBe('/a')
    expect(r.request.loading.enable).toBe(false)
    expect(r.request.loading.text).toBe('x')
  })

  it('数组覆盖不合并', () => {
    const r = deepMerge({ list: [1, 2] }, { list: [3] })
    expect(r.list).toEqual([3])
    expect(r.list).not.toBe([3])
  })

  it('基本类型后者覆盖前者，undefined 不覆盖', () => {
    expect(deepMerge({ a: 1 }, { a: 2 }).a).toBe(2)
    expect(deepMerge({ a: 1 }, { a: undefined }).a).toBe(1)
  })

  it('多源合并顺序', () => {
    const r = deepMerge({ a: 1 }, { a: 2 }, { a: 3 })
    expect(r.a).toBe(3)
  })

  it('跳过非对象源', () => {
    const r = deepMerge({ a: 1 }, null as any, 'x' as any, { b: 2 })
    expect(r).toEqual({ a: 1, b: 2 })
  })
})

describe('utils.其他工具', () => {
  it('isPlainObject 判断', () => {
    expect(isPlainObject({})).toBe(true)
    expect(isPlainObject([])).toBe(false)
    expect(isPlainObject(null)).toBe(false)
    expect(isPlainObject(new Date())).toBe(false)
  })

  it('getValueByPath 按路径取值', () => {
    const obj = { a: { b: { c: 42 } } }
    expect(getValueByPath(obj, 'a.b.c')).toBe(42)
    expect(getValueByPath(obj, 'a.x')).toBeUndefined()
    expect(getValueByPath(null as any, 'a')).toBeUndefined()
  })

  it('safeJsonParse 兜底', () => {
    expect(safeJsonParse('{"a":1}', null)).toEqual({ a: 1 })
    expect(safeJsonParse('bad', { d: 1 })).toEqual({ d: 1 })
    expect(safeJsonParse(null, 0)).toBe(0)
  })

  it('debounce 延迟执行与 cancel', async () => {
    let count = 0
    const fn = debounce(() => {
      count += 1
    }, 20)
    fn()
    fn()
    await new Promise((r) => setTimeout(r, 40))
    expect(count).toBe(1)
    fn()
    fn.cancel()
    await new Promise((r) => setTimeout(r, 40))
    expect(count).toBe(1)
  })
})
