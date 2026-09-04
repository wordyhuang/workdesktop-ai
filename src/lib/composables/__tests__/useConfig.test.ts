import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { resetConfig, setGlobalConfig } from '../../core/config'
import { useConfig, useGlobalConfig } from '../useConfig'

describe('useConfig', () => {
  beforeEach(() => {
    resetConfig()
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })
  afterEach(() => {
    resetConfig()
    vi.restoreAllMocks()
  })

  it('合并组件默认配置与本地 props：componentDefault 为底，props 覆盖', () => {
    setGlobalConfig({
      page: {
        componentDefault: {
          WdDatagrid: { withPager: true, pageSize: 30 }
        }
      }
    })
    const cfg = useConfig('WdDatagrid', { withPager: false, foo: undefined })
    expect(cfg.value.withPager).toBe(false)
    expect(cfg.value.pageSize).toBe(30)
    // undefined 的 props 不覆盖
    expect(cfg.value.foo).toBeUndefined()
  })

  it('无组件名时仅透传本地 props 合并', () => {
    const cfg = useConfig(undefined, { a: 1, b: undefined })
    expect(cfg.value.a).toBe(1)
    expect(cfg.value.b).toBeUndefined()
  })

  it('未配置 componentDefault 时返回空默认', () => {
    const cfg = useConfig('WdBare')
    expect(cfg.value).toEqual({})
  })

  it('useGlobalConfig 返回当前全局配置', () => {
    setGlobalConfig({ request: { urlPrefix: '/g' } })
    expect(useGlobalConfig().request.urlPrefix).toBe('/g')
  })
})
