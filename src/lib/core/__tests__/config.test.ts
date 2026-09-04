import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  getGlobalConfig,
  setGlobalConfig,
  resetConfig,
  mergeConfig,
  getComponentDefault,
  initConfig
} from '../config'
import { defaultConfig } from '../../configs/default-config'

describe('config 三级配置（default → global → local）', () => {
  beforeEach(() => {
    resetConfig()
    vi.restoreAllMocks()
  })
  afterEach(() => {
    resetConfig()
    delete (window as any).workDesktopConfig
  })

  it('getGlobalConfig 初始等于 defaultConfig', () => {
    expect(getGlobalConfig()).toEqual(defaultConfig)
  })

  it('setGlobalConfig 增量合并，不丢未覆盖字段', () => {
    setGlobalConfig({ request: { urlPrefix: '/api', loading: { enable: false } } })
    const cfg = getGlobalConfig()
    expect(cfg.request.urlPrefix).toBe('/api')
    expect(cfg.request.loading.enable).toBe(false)
    // 深合并：未覆盖的 loading.props 仍在
    expect(cfg.request.loading.props.text).toBe('加载中...')
    expect(cfg.page.pager.pageSize).toBe(20)
  })

  it('mergeConfig(local)：global 与 local 深合并且不改写全局', () => {
    setGlobalConfig({ request: { urlPrefix: '/api' } })
    const merged = mergeConfig({ request: { urlPrefix: '/v2' } })
    expect(merged.request.urlPrefix).toBe('/v2')
    // 全局不被改写
    expect(getGlobalConfig().request.urlPrefix).toBe('/api')
    // mergeConfig() 无参直接返回当前全局
    expect(mergeConfig()).toBe(getGlobalConfig())
  })

  it('resetConfig 恢复默认层', () => {
    setGlobalConfig({ request: { urlPrefix: '/api' } })
    resetConfig()
    expect(getGlobalConfig().request.urlPrefix).toBe('')
  })

  it('getComponentDefault 支持 PascalName 与 wd-xx 反查', () => {
    setGlobalConfig({ page: { componentDefault: { WdDatagrid: { withPager: true } } } })
    expect(getComponentDefault('WdDatagrid')).toEqual({ withPager: true })
    expect(getComponentDefault('wd-datagrid')).toEqual({ withPager: true })
    expect(getComponentDefault('Unknown')).toEqual({})
  })

  it('initConfig 汇入 use 参数', () => {
    initConfig({ request: { urlPrefix: '/use' } })
    expect(getGlobalConfig().request.urlPrefix).toBe('/use')
  })

  it('initConfig 同时读取 window.workDesktopConfig，use 参数优先', () => {
    (window as any).workDesktopConfig = { request: { urlPrefix: '/win', throwException: true } }
    initConfig({ request: { urlPrefix: '/use' } })
    const cfg = getGlobalConfig()
    expect(cfg.request.urlPrefix).toBe('/use')
    expect(cfg.request.throwException).toBe(true)
  })

  it('initConfig 无 use 参数时采用 window 配置', () => {
    (window as any).workDesktopConfig = { request: { urlPrefix: '/win' } }
    initConfig()
    expect(getGlobalConfig().request.urlPrefix).toBe('/win')
  })
})
