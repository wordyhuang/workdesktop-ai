import { describe, it, expect, beforeEach, vi } from 'vitest'
import { applyTheme } from '../theme'

describe('theme.applyTheme', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('colors 语义键映射到 --wd-* 与 --el-*', () => {
    applyTheme({ colors: { primary: '#123456' } })
    const el = document.head.querySelector('style[data-workdesktop-theme]')
    expect(el).toBeTruthy()
    const css = (el as HTMLStyleElement).textContent || ''
    expect(css).toContain('--wd-color-primary: #123456')
    expect(css).toContain('--el-color-primary: #123456')
  })

  it('error 语义键归一到 danger 变量，非语义键自动加前缀', () => {
    applyTheme({ colors: { error: '#f00', brand: '#0f0' } })
    const css = (document.head.querySelector('style[data-workdesktop-theme]') as HTMLStyleElement).textContent || ''
    expect(css).toContain('--wd-color-danger: #f00')
    expect(css).toContain('--wd-color-brand: #0f0')
  })

  it('cssVars 优先级高于 colors，且支持原生 -- 变量名', () => {
    applyTheme({
      colors: { primary: '#111' },
      cssVars: { '--el-color-primary': '#222', '--wd-radius': '8px' }
    })
    const css = (document.head.querySelector('style[data-workdesktop-theme]') as HTMLStyleElement).textContent || ''
    // cssVars 覆盖 same var
    expect(css).toContain('--el-color-primary: #222')
    expect(css).toContain('--wd-radius: 8px')
    // colors 仍输出但同名字段被 cssVars 覆盖（后者出现在其后）
    expect(css.indexOf('--el-color-primary: #222') > css.indexOf('--el-color-primary: #111')).toBe(true)
  })

  it('theme 为空时生成空 :root 块', () => {
    applyTheme({})
    const css = (document.head.querySelector('style[data-workdesktop-theme]') as HTMLStyleElement).textContent || ''
    expect(css).toContain(':root {')
  })

  it('无 document（SSR）环境安全跳过', () => {
    vi.stubGlobal('document', undefined)
    expect(() => applyTheme({ colors: { primary: '#123456' } })).not.toThrow()
    vi.unstubAllGlobals()
  })

  it('theme 未传时不操作', () => {
    vi.stubGlobal('document', undefined)
    expect(() => applyTheme(undefined)).not.toThrow()
    vi.unstubAllGlobals()
  })
})
