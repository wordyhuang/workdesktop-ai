import { describe, it, expect, beforeEach, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { SKIN_PRESETS, getSkinPreset, listSkins } from '../skins'
import { applyTheme, resolveTheme } from '../theme'
import { setGlobalConfig, resetConfig } from '../config'

/** 读取当前注入的主题 CSS 文本 */
function themeCss(): string {
  const el = document.head.querySelector('style[data-workdesktop-theme]') as HTMLStyleElement | null
  return el?.textContent || ''
}

describe('skins 预设皮肤库', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('内置 14 套皮肤，结构完整（key/label/desc/theme）', () => {
    const skins = listSkins()
    expect(skins).toHaveLength(14)
    expect(Object.keys(SKIN_PRESETS)).toEqual([
      'default',
      'fashion',
      'business',
      'tech',
      'cyberpunk',
      'chinese',
      'flat',
      'cool',
      'governance',
      'apple',
      'arco',
      'antd',
      'soft',
      'song'
    ])
    for (const skin of skins) {
      expect(skin.key).toBeTruthy()
      expect(skin.label).toBeTruthy()
      expect(skin.desc).toBeTruthy()
      expect(skin.theme).toBeTypeOf('object')
    }
  })

  it('getSkinPreset 命中返回预设，未传/未知返回 undefined', () => {
    expect(getSkinPreset('tech')?.label).toBe('科技')
    expect(getSkinPreset()).toBeUndefined()
    expect(getSkinPreset('not-exist')).toBeUndefined()
  })

  it('非默认皮肤均携带主色覆盖，default 为空预设（回落出厂令牌）', () => {
    expect(SKIN_PRESETS.default.theme.colors).toBeUndefined()
    expect(SKIN_PRESETS.default.theme.cssVars).toBeUndefined()
    for (const skin of listSkins()) {
      if (skin.key === 'default') continue
      expect(skin.theme.colors?.primary).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })
})

describe('theme.resolveTheme 皮肤解析', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('skin 预设打底，用户 colors/cssVars 继续覆盖', () => {
    const resolved = resolveTheme({
      skin: 'chinese',
      colors: { primary: '#123456' },
      cssVars: { '--wd-radius-base': '8px' }
    })
    // 用户 primary 覆盖皮肤金箔色，皮肤其余色保留
    expect(resolved?.colors?.primary).toBe('#123456')
    expect(resolved?.colors?.success).toBe('#3e9e86')
    // 用户 cssVars 覆盖皮肤同名变量
    expect(resolved?.cssVars?.['--wd-radius-base']).toBe('8px')
    expect(resolved?.cssVars?.['--wd-bg-color-page']).toBe('#0a211c')
  })

  it('未知皮肤告警并回退（仅保留用户自定义，不注入皮肤色）', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const resolved = resolveTheme({ skin: 'nope' as any, colors: { primary: '#123456' } })
    expect(warn).toHaveBeenCalledOnce()
    expect(resolved?.colors?.primary).toBe('#123456')
    expect(resolved?.colors?.success).toBeUndefined()
  })

  it('无 skin / 无 theme 原样透传', () => {
    expect(resolveTheme(undefined)).toBeUndefined()
    const t = { colors: { primary: '#123456' } }
    expect(resolveTheme(t)).toBe(t)
  })
})

describe('theme.applyTheme 皮肤应用与色阶推导', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('skin 一键套用：注入皮肤 colors（wd+el 同步）与 cssVars', () => {
    applyTheme({ skin: 'governance' })
    const css = themeCss()
    expect(css).toContain('--wd-color-primary: #c7000b')
    expect(css).toContain('--el-color-primary: #c7000b')
    expect(css).toContain('--wd-bg-color-page: #fdf9f3')
  })

  it('皮肤主色按 EP 公式推导 El 派生色阶，消除浅阶断层', () => {
    applyTheme({ skin: 'chinese' })
    const css = themeCss()
    // #c9a24b 混白 50% → #e4d1a5，混白 90% → #faf6ed
    expect(css).toContain('--el-color-primary-light-5: #e4d1a5')
    expect(css).toContain('--el-color-primary-light-9: #faf6ed')
    // 语义色 success 同样推导
    expect(css).toContain('--el-color-success-light-3')
    expect(css).toContain('--el-color-success-dark-2')
  })

  it('用户 colors 覆盖皮肤主色后，色阶按用户值推导', () => {
    applyTheme({ skin: 'chinese', colors: { primary: '#123456' } })
    const css = themeCss()
    expect(css).toContain('--el-color-primary: #123456')
    // #123456 混白 30% → #597189，混黑 20% → #0e2a45
    expect(css).toContain('--el-color-primary-light-3: #597189')
    expect(css).toContain('--el-color-primary-dark-2: #0e2a45')
  })

  it('用户 cssVars 优先级最高，可覆盖皮肤变量与推导色阶', () => {
    applyTheme({
      skin: 'tech',
      cssVars: { '--wd-bg-color-page': '#000000', '--el-color-primary-light-3': '#abcdef' }
    })
    const css = themeCss()
    expect(css).toContain('--wd-bg-color-page: #000000')
    expect(css).toContain('--el-color-primary-light-3: #abcdef')
  })

  it('default 皮肤不注入色阶（回落 theme.css 出厂固化值）', () => {
    applyTheme({ skin: 'default' })
    const css = themeCss()
    expect(css).not.toContain('--el-color-primary-light-3')
    expect(css).not.toContain('--el-color-primary:')
  })

  it('error 语义键归一 danger 且色阶不重复注入', () => {
    applyTheme({ colors: { error: '#ff0000' } })
    const css = themeCss()
    expect(css).toContain('--el-color-danger: #ff0000')
    expect(css).toContain('--el-color-danger-light-5: #ff8080')
    // 同一变量只出现一次
    expect(css.match(/--el-color-danger-light-5/g)).toHaveLength(1)
  })

  it('深色皮肤（cyberpunk）携带 El 填充系变量联动', () => {
    applyTheme({ skin: 'cyberpunk' })
    const css = themeCss()
    expect(css).toContain('--wd-bg-color-page: #0a0714')
    expect(css).toContain('--el-fill-color-blank: #120e24')
    expect(css).toContain('--el-mask-color: rgba(10, 5, 24, 0.7)')
    // El 菜单深色联动：hover 反白从 EP 默认 light-9 浅粉改为品红同源深透底（与 cool 同款处理）
    expect(css).toContain('--el-menu-hover-bg-color: rgba(217, 70, 239, 0.14)')
  })
})

describe('skins 样式维度：边框 / 圆角 / 间距随皮肤差异化', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('描边皮肤（governance / cyberpunk）注入 2px 边框宽', () => {
    for (const key of ['governance', 'cyberpunk'] as const) {
      applyTheme({ skin: key })
      expect(themeCss()).toContain('--wd-border-width: 2px')
    }
  })

  it('间距随皮肤拉开差异：cyberpunk 紧凑，chinese 宽松', () => {
    applyTheme({ skin: 'cyberpunk' })
    expect(themeCss()).toContain('--wd-spacing-base: 10px')
    applyTheme({ skin: 'chinese' })
    expect(themeCss()).toContain('--wd-spacing-base: 14px')
    expect(themeCss()).toContain('--wd-spacing-large: 18px')
  })

  it('圆角风格化：cyberpunk 纯直角，apple 大圆角', () => {
    applyTheme({ skin: 'cyberpunk' })
    expect(themeCss()).toContain('--wd-radius-base: 0px')
    applyTheme({ skin: 'apple' })
    expect(themeCss()).toContain('--wd-radius-base: 10px')
  })

  it('用户 cssVars 覆盖皮肤边框 / 间距取值', () => {
    applyTheme({ skin: 'governance', cssVars: { '--wd-border-width': '3px' } })
    expect(themeCss()).toContain('--wd-border-width: 3px')
  })

  it('未扩展维度的皮肤（business）不注入 border-width，回落出厂令牌', () => {
    applyTheme({ skin: 'business' })
    expect(themeCss()).not.toContain('--wd-border-width')
  })
})

describe('skins 文本可读性：四级文字对底色的对比度门槛', () => {
  // WCAG 相对亮度与对比度
  function luminance(hex: string): number {
    const h = hex.replace('#', '')
    const lin = (v: string) => {
      const c = parseInt(v, 16) / 255
      return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    }
    return 0.2126 * lin(h.slice(0, 2)) + 0.7152 * lin(h.slice(2, 4)) + 0.0722 * lin(h.slice(4, 6))
  }
  function contrast(fg: string, bg: string): number {
    const [l1, l2] = [luminance(fg), luminance(bg)].sort((a, b) => b - a)
    return (l1 + 0.05) / (l2 + 0.05)
  }
  // 取皮肤注入的全局令牌值：跳过 var() 引用（换装块在 Station chrome 作用域把文字令牌
  // 重映射为 on-dark 色板，属局部声明；本用例检查的是页面/卡片消费的全局实色）
  const cssVar = (css: string, name: string) => {
    for (const m of css.matchAll(new RegExp(`${name}\\s*:\\s*([^;]+)`, 'g'))) {
      const v = m[1].trim()
      if (!v.startsWith('var(')) return v
    }
    return undefined
  }

  // 皮肤未覆盖的文本令牌回落 tokens.css 出厂值（theme.css 惰性引用，不出现在注入文本中）
  const FACTORY_TEXT: Record<string, string> = {
    '--wd-text-color-primary': '#24272c',
    '--wd-text-color-regular': '#555b63',
    '--wd-text-color-secondary': '#7d8187',
    '--wd-text-color-placeholder': '#a8abb2',
  }
  // 正文 4.5（WCAG AA）；次要 3.0（大文字/辅助信息）；占位符为刻意弱化的提示文字（EP/antd 出厂同样低于正文门槛），只设防倒退下限
  const GATES: Record<string, number> = {
    '--wd-text-color-primary': 4.5,
    '--wd-text-color-regular': 4.5,
    '--wd-text-color-secondary': 3.0,
    '--wd-text-color-placeholder': 2.0,
  }

  it('全皮肤四级文字对页面底/卡片底的对比度达门槛（正文 4.5 / 次要 3.0 / 占位防倒退 2.0）', () => {
    for (const skin of listSkins()) {
      applyTheme({ skin: skin.key })
      const css = themeCss()
      const pageBg = cssVar(css, '--wd-bg-color-page') || '#f4f6fa'
      const cardBg = cssVar(css, '--wd-bg-color') || '#ffffff'
      for (const [name, gate] of Object.entries(GATES)) {
        const fg = cssVar(css, name) || FACTORY_TEXT[name]
        expect(contrast(fg, pageBg), `${skin.key} ${name}(${fg}) vs page ${pageBg}`).toBeGreaterThanOrEqual(gate)
        expect(contrast(fg, cardBg), `${skin.key} ${name}(${fg}) vs card ${cardBg}`).toBeGreaterThanOrEqual(gate)
      }
    }
  })

  it('出厂次要文字落位 tokens.css：未覆盖皮肤（default/flat/business/governance）的回落值达标', () => {
    const tokens = readFileSync(resolve(__dirname, '../../../styles/tokens.css'), 'utf-8')
    expect(tokens).toContain('--wd-text-color-secondary: #7d8187')
  })

  it('出厂 on-dark 色板落位 tokens.css：对商务藏青深色表面（#1e2c4f）的对比度达门槛', () => {
    const tokens = readFileSync(resolve(__dirname, '../../../styles/tokens.css'), 'utf-8')
    const navyBg = '#1e2c4f'
    for (const [name, gate] of [
      ['--wd-text-color-primary-on-dark', 4.5],
      ['--wd-text-color-regular-on-dark', 4.5],
      ['--wd-text-color-secondary-on-dark', 3.0],
      ['--wd-text-color-placeholder-on-dark', 2.0],
      ['--wd-color-link-on-dark', 4.5],
    ] as const) {
      const fg = cssVar(tokens, name)
      expect(fg, `${name} 应在 tokens.css 出厂声明`).toBeTruthy()
      expect(contrast(fg!, navyBg), `${name}(${fg}) vs 藏青 ${navyBg}`).toBeGreaterThanOrEqual(gate)
    }
    // 出厂链接色引用主色（浅底正常），深色表面由皮肤换装块重映射为 on-dark 链接色
    expect(tokens).toContain('--wd-color-link: var(--wd-color-primary)')
  })
})

describe('skins 深色表面换装：on-dark 文字令牌（浅色/深色两套默认色）', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  // 换装块：深色表面（Station 导航区 chrome）上重映射 wd+el 两层文字令牌与链接色。
  // CSS 自定义属性在声明元素处对 var() 求值（css-variables-2），theme.css 的
  // --el-text-color-*: var(--wd-text-color-*) 已在 :root 求值完毕，子树内仅重映射
  // wd 层不会联动 el 消费方，故必须双层同时重映射
  const REMAP_VARS = [
    '--wd-text-color-primary: var(--wd-text-color-primary-on-dark)',
    '--wd-text-color-regular: var(--wd-text-color-regular-on-dark)',
    '--wd-text-color-secondary: var(--wd-text-color-secondary-on-dark)',
    '--wd-text-color-placeholder: var(--wd-text-color-placeholder-on-dark)',
    '--el-text-color-primary: var(--wd-text-color-primary-on-dark)',
    '--el-text-color-regular: var(--wd-text-color-regular-on-dark)',
    '--el-text-color-secondary: var(--wd-text-color-secondary-on-dark)',
    '--el-text-color-placeholder: var(--wd-text-color-placeholder-on-dark)',
    '--wd-color-link: var(--wd-color-link-on-dark)',
  ]

  it('business 深色表面（顶栏/侧栏/底栏）换装块：wd+el 双层重映射，浅色内容区不联动', () => {
    applyTheme({ skin: 'business' })
    const css = themeCss()
    for (const remap of REMAP_VARS) {
      expect(css, `business 换装块应含 ${remap}`).toContain(remap)
    }
    // 换装作用域限定 Station 导航区 chrome（业务白卡内容区保持浅色默认色）
    expect(css).toMatch(/\.wd-station \.wd-station__header,\s*\.wd-station \.wd-station__aside,\s*\.wd-station \.wd-station__footer\s*\{/)
    expect(css).not.toContain('.wd-station__content')
  })

  it('tech/cyberpunk/cool 深色表面（顶栏/侧栏/页签条）换装块，on-dark 色板按各自色系重写保持身份', () => {
    const onDarkOverrides: Record<string, Record<string, string>> = {
      tech: {
        '--wd-text-color-primary-on-dark': '#dcf4ff',
        '--wd-color-link-on-dark': '#00e5ff'
      },
      cyberpunk: {
        '--wd-text-color-primary-on-dark': '#f3e8ff',
        '--wd-color-link-on-dark': '#e879f9'
      },
      cool: {
        '--wd-text-color-primary-on-dark': '#e8eaf0',
        '--wd-color-link-on-dark': '#a78bff'
      }
    }
    for (const key of ['tech', 'cyberpunk', 'cool'] as const) {
      applyTheme({ skin: key })
      const css = themeCss()
      for (const remap of REMAP_VARS) {
        expect(css, `${key} 换装块应含 ${remap}`).toContain(remap)
      }
      expect(css).toMatch(/\.wd-station \.wd-station__header,\s*\.wd-station \.wd-station__aside,\s*\.wd-station \.wd-station__tabs-bar\s*\{/)
      for (const [name, value] of Object.entries(onDarkOverrides[key])) {
        expect(css, `${key} 应重写 ${name} 为 ${value}`).toContain(`${name}: ${value}`)
      }
    }
  })

  it('business 顶栏插槽回归防护：默认按钮 ghost 化（el 文字换装后白底按钮浅字不可读），面包屑链接 hover 转商务金', () => {
    applyTheme({ skin: 'business' })
    const css = themeCss()
    // ghost 按钮：透明底 + 半透明白描边 + on-dark 文字（与 nav-item hover 同源），限定顶栏作用域
    expect(css).toMatch(/\.wd-station__header \.el-button:not\(\[class\*='el-button--'\]\):not\(\.is-text\):not\(\.is-link\)/)
    expect(css).toContain('--el-button-bg-color: transparent')
    // 面包屑链接 hover：div.wd-station 前缀达 (0,6,1) 压过 WdPath scoped 编译产物 (0,5,0)，转商务金
    expect(css).toContain('div.wd-station .wd-station__header .wd-path .el-breadcrumb__inner.is-link:hover')
  })

  it('Path.vue 链接段消费 --wd-color-link（换装后自动随深色表面切换），不再硬绑主色', () => {
    const path = readFileSync(resolve(__dirname, '../../../components/styles/Path.vue'), 'utf-8')
    expect(path).toContain('color: var(--wd-color-link, #409eff)')
    expect(path).not.toContain('color: var(--wd-color-primary, #409eff)')
  })
})

describe('skins 组件级维度：组件样式随皮肤差异化', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('全皮肤定稿：datagrid 不注入边框与背景（bg / border-color / bg-image 一律不出现）', () => {
    for (const skin of listSkins()) {
      applyTheme({ skin: skin.key })
      const css = themeCss()
      expect(css, skin.key).not.toContain('--wd-datagrid-bg')
      expect(css, skin.key).not.toContain('--wd-datagrid-border-color')
      expect(css, skin.key).not.toContain('--wd-datagrid-bg-image')
    }
  })

  it('全皮肤定稿：editablegrid 不注入边框与背景（bg / border-color / bg-image 一律不出现）', () => {
    for (const skin of listSkins()) {
      applyTheme({ skin: skin.key })
      const css = themeCss()
      expect(css, skin.key).not.toContain('--wd-editable-grid-bg')
      expect(css, skin.key).not.toContain('--wd-editable-grid-border-color')
      expect(css, skin.key).not.toContain('--wd-editable-grid-bg-image')
    }
  })

  it('cyberpunk 注入组件级令牌：面板品红霓虹描边 + 紫辉光 + 青品标识条 + 导航区压黑', () => {
    applyTheme({ skin: 'cyberpunk' })
    const css = themeCss()
    expect(css).toContain('--wd-panel-border-color: rgba(217, 70, 239, 0.4)')
    expect(css).toContain('--wd-panel-header-bg: rgba(217, 70, 239, 0.08)')
    expect(css).toContain('--wd-panel-title-color: #e879f9')
    expect(css).toContain('--wd-panel-shadow-sm: 0 0 18px rgba(217, 70, 239, 0.16)')
    expect(css).toContain('--wd-panel-title-bar-bg: linear-gradient(180deg, #00e5ff, #d946ef)')
    expect(css).toContain('--wd-station-header-bg: #070412')
    expect(css).toContain('--wd-search-bg: #150f2a')
    // 背景素材（bg-image 伴随令牌）：面板 / 搜索青色 HUD 网格，Station 导航区品红扫描线（editablegrid 全皮肤定稿无背景）
    expect(css).toContain('--wd-panel-bg-image: repeating-linear-gradient(0deg, rgba(0, 229, 255, 0.05) 0 1px, transparent 1px 24px), repeating-linear-gradient(90deg, rgba(0, 229, 255, 0.05) 0 1px, transparent 1px 24px)')
    expect(css).toContain('--wd-search-bg-image: repeating-linear-gradient(0deg, rgba(0, 229, 255, 0.05) 0 1px, transparent 1px 24px), repeating-linear-gradient(90deg, rgba(0, 229, 255, 0.05) 0 1px, transparent 1px 24px)')
    expect(css).toContain('--wd-station-aside-bg-image: repeating-linear-gradient(0deg, rgba(217, 70, 239, 0.06) 0 1px, transparent 1px 4px)')
    expect(css).toContain('--wd-station-header-bg-image: repeating-linear-gradient(0deg, rgba(217, 70, 239, 0.06) 0 1px, transparent 1px 4px)')
    expect(css).toContain('--wd-station-tabs-bg-image: repeating-linear-gradient(0deg, rgba(217, 70, 239, 0.06) 0 1px, transparent 1px 4px)')
  })

  it('cyberpunk cssRules：品红渐变主按钮 + 紫光外发光 + ghost 默认按钮 + 霓虹 primary 标签', () => {
    applyTheme({ skin: 'cyberpunk' })
    const css = themeCss()
    // 主按钮：品红→紫罗兰渐变 + 紫光外发光（渐变起点 var(--el-color-primary) 随用户覆盖联动）
    expect(css).toContain('.el-button--primary {')
    expect(css).toContain('background-image: linear-gradient(135deg, var(--el-color-primary), #ad6bf5)')
    expect(css).toContain('box-shadow: 0 0 14px rgba(217, 70, 239, 0.45)')
    // 默认按钮：ghost 紫（:not 排除语义色按钮与 text/link 形态）
    expect(css).toContain(".el-button:not([class*='el-button--']):not(.is-text):not(.is-link) {")
    expect(css).toContain('--el-button-text-color: #e9d5ff')
    // primary 标签：深紫底 + 亮紫字
    expect(css).toContain('.el-tag.el-tag--primary {')
    expect(css).toContain('--el-tag-bg-color: rgba(217, 70, 239, 0.16)')
    expect(css).toContain('--el-tag-text-color: #e9d5ff')
  })

  it('governance 红头白字：Panel 标题栏红底白字，其余组件暖米底', () => {
    applyTheme({ skin: 'governance' })
    const css = themeCss()
    expect(css).toContain('--wd-panel-header-bg: #c7000b')
    expect(css).toContain('--wd-panel-title-color: #ffffff')
    expect(css).toContain('--wd-search-bg: #fffaf0')
  })

  it('chinese 墨绿金箔：面板深墨绿底 + 金箔描边与标题 + 导航区压深', () => {
    applyTheme({ skin: 'chinese' })
    const css = themeCss()
    expect(css).toContain('--wd-panel-bg: #102c23')
    expect(css).toContain('--wd-panel-title-color: #dec07a')
    expect(css).toContain('--wd-panel-header-bg: rgba(201, 162, 75, 0.1)')
    expect(css).toContain('--wd-panel-border-color: rgba(201, 162, 75, 0.42)')
    // el-table 内部单元格线烫金（同源亮金；datagrid / editablegrid 容器全皮肤定稿无外框无背景）
    expect(css).toContain('--el-table-border-color: rgba(201, 162, 75, 0.45)')
    expect(css).toContain('--wd-station-aside-bg: #071a15')
    expect(css).toContain('--el-fill-color-blank: #123128')
    expect(css).toContain('--el-color-white: #0d231c')
    // 中文字体：行楷优先（STXingkai 华文行楷 → KaiTi 楷体 → STKaiti 华文楷体 → 思源宋体 serif 回退）
    expect(css).toContain('--el-font-family:')
    expect(css).toContain('STXingkai')
    // 背景素材（内联 SVG data URI）：侧栏山水 + 页头祥云 + 面板贴底淡山水
    expect(css).toContain('--wd-station-aside-bg-image: url("data:image/svg+xml')
    expect(css).toContain('--wd-station-header-bg-image: url("data:image/svg+xml')
    expect(css).toContain('--wd-panel-bg-image: url("data:image/svg+xml')
    // 山水纹特征：青峦 %233e9e86 + 金脊线 %23c9a24b + 朱砂日 %23c0453c
    expect(css).toContain("%23c0453c' fill-opacity='0.5'")
    expect(css).toContain("stroke='%23c9a24b'")
    expect(css).toContain("fill='%233e9e86'")
  })

  it('chinese cssRules：金箔渐变主按钮 + ghost 金默认按钮 + 深金 primary 标签', () => {
    applyTheme({ skin: 'chinese' })
    const css = themeCss()
    // 主按钮：金箔渐变 + 淡金外发光（渐变起点 var(--el-color-primary) 随用户覆盖联动）
    expect(css).toContain('.el-button--primary {')
    expect(css).toContain('background-image: linear-gradient(135deg, var(--el-color-primary), #e0be6e)')
    expect(css).toContain('box-shadow: 0 0 12px rgba(201, 162, 75, 0.4)')
    // 默认按钮：ghost 金（:not 排除语义色按钮与 text/link 形态）
    expect(css).toContain(".el-button:not([class*='el-button--']):not(.is-text):not(.is-link) {")
    expect(css).toContain('--el-button-text-color: #dec07a')
    // primary 标签：深金底 + 亮金字
    expect(css).toContain('.el-tag.el-tag--primary {')
    expect(css).toContain('--el-tag-bg-color: rgba(201, 162, 75, 0.16)')
    expect(css).toContain('--el-tag-text-color: #dec07a')
    // 背景素材定位规则：提权 (0,2,1) 压过组件 scoped background 简写初始值
    expect(css).toContain('div.wd-station .wd-station__aside {')
    expect(css).toContain('background-position: bottom center')
    expect(css).toContain('div.wd-station .wd-station__header {')
    expect(css).toContain('background-position: right 16px center')
    expect(css).toContain('div.wd-panel.wd-panel {')
    // 面板头右侧小祥云（header 无背景令牌，image 挂 cssRules）
    expect(css).toContain('div.wd-panel .wd-panel__header {')
    expect(css).toContain('background-position: right 14px center')
    // 中文字体：正文/组件继承体（body 全局）同步行楷优先
    expect(css).toContain('body {')
    expect(css).toContain('font-family:')
    expect(css).toContain('STXingkai')
  })

  it('cool 霓虹紫点缀：面板泛紫描边 + 紫光标题 + 导航区压黑', () => {
    applyTheme({ skin: 'cool' })
    const css = themeCss()
    expect(css).toContain('--wd-panel-border-color: rgba(124, 92, 255, 0.35)')
    expect(css).toContain('--wd-panel-header-bg: rgba(124, 92, 255, 0.08)')
    expect(css).toContain('--wd-panel-title-color: #a78bff')
    expect(css).toContain('--wd-station-header-bg: #0c0e12')
    expect(css).toContain('--wd-station-aside-bg: #0c0e12')
    expect(css).toContain('--wd-station-tabs-bg: #0c0e12')
  })

  it('cool cssRules：霓虹渐变主按钮 + ghost 默认按钮 + 霓虹 primary 标签', () => {
    applyTheme({ skin: 'cool' })
    const css = themeCss()
    // 主按钮：紫罗兰渐变 + 紫光外发光（渐变起点 var(--el-color-primary) 随用户覆盖联动）
    expect(css).toContain('.el-button--primary {')
    expect(css).toContain('background-image: linear-gradient(135deg, var(--el-color-primary), #a855f7)')
    expect(css).toContain('box-shadow: 0 0 14px rgba(124, 92, 255, 0.45)')
    // 默认按钮：ghost 紫（:not 排除语义色按钮与 text/link 形态）
    expect(css).toContain(".el-button:not([class*='el-button--']):not(.is-text):not(.is-link) {")
    expect(css).toContain('--el-button-text-color: #c4b5fd')
    // primary 标签：深紫底 + 亮紫字
    expect(css).toContain('.el-tag.el-tag--primary {')
    expect(css).toContain('--el-tag-bg-color: rgba(124, 92, 255, 0.16)')
    expect(css).toContain('--el-tag-text-color: #c4b5fd')
  })

  it('cool 动画体系：4 个关键帧（呼吸/流光/入场/流动）', () => {
    applyTheme({ skin: 'cool' })
    const css = themeCss()
    expect(css).toContain('@keyframes wd-cool-glow')
    expect(css).toContain('@keyframes wd-cool-shine')
    expect(css).toContain('@keyframes wd-cool-pop-in')
    expect(css).toContain('@keyframes wd-cool-flow')
  })

  it('cool 动画体系：覆盖全部 22 类可动画组件（涵盖率 100% > 90% 门槛）', () => {
    applyTheme({ skin: 'cool' })
    const css = themeCss()
    // 覆盖清单（与 cool.ts 注释同步维护）：wd 26 组件按底层 EP 元素归并 + EP 直用组件，
    // 归并为 22 类可动画组件，展开为 25 条断言锚点
    // （Iframe 为纯内容容器，无交互动画意义，不计入分母）
    const anchors: Array<[string, string]> = [
      ['按钮族弹性过渡', '.el-button {'],
      ['按钮 hover 上浮', '.el-button:not(.is-disabled):not(.is-loading):hover'],
      ['主按钮流光', '.el-button--primary::after'],
      ['标签过渡', '.el-tag {'],
      ['输入框聚焦光晕', '.el-input__wrapper'],
      ['文本域聚焦光晕', '.el-textarea__inner'],
      ['选择器聚焦光晕', '.el-select__wrapper'],
      ['下拉弹出层入场', '.el-select-dropdown.el-popper'],
      ['菜单项过渡', '.el-menu-item'],
      ['菜单选中光条', '.el-menu-item::before'],
      ['页签项过渡', '.el-tabs__item'],
      ['表格行过渡', '.el-table__row'],
      ['分页按钮过渡', '.el-pagination .el-pager li'],
      ['弹窗入场', '.el-dialog {'],
      ['消息框入场', '.el-message-box {'],
      ['抽屉弹性滑入', '.el-drawer {'],
      ['消息入场', '.el-message {'],
      ['开关光晕', '.el-switch__core'],
      ['单选过渡', '.el-radio__inner'],
      ['复选过渡', '.el-checkbox__inner'],
      ['加载呼吸', '.el-loading-spinner .path'],
      ['进度条流光', '.el-progress-bar__inner'],
      ['上传拖拽区过渡', '.el-upload-dragger'],
      ['面板 hover 发光', '.wd-panel:hover'],
      ['面板标识条呼吸', '.wd-panel__header::before']
    ]
    let hits = 0
    for (const [name, anchor] of anchors) {
      if (css.includes(anchor)) hits += 1
      else expect.soft(css, `动画锚点缺失：${name}（${anchor}）`).toContain(anchor)
    }
    // 涵盖率门槛：>90%（目标 25/25 = 100%）
    expect(hits / anchors.length).toBeGreaterThan(0.9)
  })

  it('apple 仿苹果：iOS 蓝（加深至 AA）+ iOS 系统语义色 + 浅灰白底近黑字', () => {
    applyTheme({ skin: 'apple' })
    const css = themeCss()
    expect(css).toContain('--wd-color-primary: #006ee6')
    expect(css).toContain('--el-color-primary: #006ee6')
    expect(css).toContain('--wd-color-success: #34c759')
    expect(css).toContain('--wd-color-warning: #ff9500')
    expect(css).toContain('--wd-color-danger: #ff3b30')
    expect(css).toContain('--wd-color-info: #8e8e93')
    expect(css).toContain('--wd-bg-color-page: #f5f5f7')
    expect(css).toContain('--wd-text-color-primary: #1d1d1f')
    expect(css).toContain('--wd-text-color-secondary: #6e6e73')
    expect(css).toContain('--wd-border-color: #d2d2d7')
    expect(css).toContain('--wd-border-color-light: #e5e5ea')
    expect(css).toContain('--wd-radius-base: 10px')
    // 主色按 EP 公式推导色阶（混白 30% → #4d9aee，混黑 20% → #0058b8）
    expect(css).toContain('--el-color-primary-light-3: #4d9aee')
    expect(css).toContain('--el-color-primary-dark-2: #0058b8')
  })

  it('apple 组件级：白卡 16px 大圆角 + 苹果柔影 + 极浅描边 + 标识条归零 + 毛玻璃顶栏底', () => {
    applyTheme({ skin: 'apple' })
    const css = themeCss()
    expect(css).toContain('--wd-panel-radius: 16px')
    expect(css).toContain('--wd-panel-border-color: #e5e5ea')
    expect(css).toContain('--wd-panel-shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.04), 0 12px 32px rgba(0, 0, 0, 0.08)')
    expect(css).toContain('--wd-panel-title-bar-width: 0')
    expect(css).toContain('--wd-datagrid-radius: 16px')
    expect(css).toContain('--wd-station-aside-bg: #ffffff')
    expect(css).toContain('--wd-station-header-bg: rgba(251, 251, 253, 0.72)')
    // 菜单 hover 浅灰底 + 表格表头灰色小字
    expect(css).toContain('--el-menu-hover-bg-color: rgba(0, 0, 0, 0.04)')
    expect(css).toContain('--el-table-header-text-color: #6e6e73')
  })

  it('business 注入组件级令牌：Station 藏青边栏框架（侧栏 / 顶栏 / 底栏）+ 白卡金标条', () => {
    applyTheme({ skin: 'business' })
    const css = themeCss()
    expect(css).toContain('--wd-station-aside-bg: #1e2c4f')
    expect(css).toContain('--wd-station-header-bg: #1e2c4f')
    expect(css).toContain('--wd-station-footer-bg: #1e2c4f')
    expect(css).toContain('--wd-panel-title-bar-bg: #c9a24b')
    // 藏青边栏配套：菜单金实心选中 + 顶栏文字浅化
    expect(css).toContain('.wd-station__menu .el-menu-item.is-active')
    expect(css).toContain('background: var(--wd-color-warning)')
    expect(css).toContain('.wd-station__footer {')
  })

  it('apple cssRules：胶囊按钮（按钮组回落）+ hover 加深 + iOS 浅灰默认按钮 + 实心标签 + 输入框光晕 + 毛玻璃顶栏 + 蓝底白字菜单', () => {
    applyTheme({ skin: 'apple' })
    const css = themeCss()
    // 胶囊按钮 + 按钮组两端胶囊回落
    expect(css).toContain('.el-button { border-radius: 999px; }')
    expect(css).toContain('.el-button-group .el-button:first-child { border-radius: 999px 0 0 999px; }')
    // 主按钮 hover 加深（引用 dark-2 推导色，随用户覆盖主色联动）
    expect(css).toContain('--el-button-hover-bg-color: var(--el-color-primary-dark-2)')
    // 默认按钮 iOS 浅灰底（:not 排除语义色按钮与 text/link 形态）
    expect(css).toContain(".el-button:not([class*='el-button--']):not(.is-text):not(.is-link) {")
    expect(css).toContain('--el-button-bg-color: #e8e8ed')
    // 标签胶囊化 + primary 实心蓝白字 + info 白底灰边
    expect(css).toContain('.el-tag { border-radius: 999px; }')
    expect(css).toContain('.el-tag.el-tag--primary {')
    expect(css).toContain('--el-tag-bg-color: var(--el-color-primary)')
    expect(css).toContain('--el-tag-text-color: #fff')
    expect(css).toContain('.el-tag.el-tag--info {')
    // 输入框聚焦 iOS 光晕（color-mix 随主色联动）
    expect(css).toContain('.el-input__wrapper.is-focus {')
    expect(css).toContain('color-mix(in srgb, var(--el-color-primary) 12%, transparent)')
    // 毛玻璃顶栏 + iOS 蓝色实心菜单选中态（蓝底白字加粗，hover 加深）
    expect(css).toContain('.wd-station__header {')
    expect(css).toContain('backdrop-filter: saturate(180%) blur(16px)')
    expect(css).toContain('.wd-station__menu .el-menu-item.is-active {')
    expect(css).toContain('background: var(--el-color-primary)')
    expect(css).toContain('color: #fff')
    expect(css).toContain('.wd-station__menu .el-menu-item.is-active:hover {')
    expect(css).toContain('background: var(--el-color-primary-dark-2)')
  })

  it('arco 字节风：Arcoblue 蓝 + 字节灰阶（对比度压深）+ 小圆角 + 白卡细边', () => {
    applyTheme({ skin: 'arco' })
    const css = themeCss()
    expect(css).toContain('--wd-color-primary: #165dff')
    expect(css).toContain('--el-color-primary: #165dff')
    expect(css).toContain('--wd-color-success: #00b42a')
    expect(css).toContain('--wd-color-warning: #ff7d00')
    expect(css).toContain('--wd-color-danger: #f53f3f')
    expect(css).toContain('--wd-color-info: #86909c')
    // 字节灰阶：页面底 gray-1、正文 gray-9/8、secondary 与 placeholder 压深至 WCAG AA
    expect(css).toContain('--wd-bg-color-page: #f7f8fa')
    expect(css).toContain('--wd-text-color-primary: #1d2129')
    expect(css).toContain('--wd-text-color-regular: #272e3b')
    expect(css).toContain('--wd-text-color-secondary: #5c6b7a')
    expect(css).toContain('--wd-text-color-placeholder: #65707f')
    expect(css).toContain('--wd-border-color: #e5e6eb')
    expect(css).toContain('--wd-border-color-light: #f2f3f5')
    // 小圆角是 Arco 识别特征（按钮/控件 2px）
    expect(css).toContain('--wd-radius-base: 2px')
    expect(css).toContain('--wd-radius-small: 2px')
    // 主色按 EP 公式推导色阶（混白 30% → #5c8eff，混黑 20% → #124acc）
    expect(css).toContain('--el-color-primary-light-3: #5c8eff')
    expect(css).toContain('--el-color-primary-dark-2: #124acc')
  })

  it('arco 组件级：白卡 4px 小圆角 + 字节灰细边 + 极轻阴影 + 标识条归零', () => {
    applyTheme({ skin: 'arco' })
    const css = themeCss()
    expect(css).toContain('--wd-panel-radius: 4px')
    expect(css).toContain('--wd-panel-border-color: #e5e6eb')
    expect(css).toContain('--wd-panel-shadow-sm: 0 1px 2px rgba(29, 33, 41, 0.06)')
    expect(css).toContain('--wd-panel-title-bar-width: 0')
    expect(css).toContain('--wd-datagrid-radius: 4px')
  })

  it('arco cssRules：hover 变浅 + 灰底无边框默认按钮 + 浅蓝标签 + 浅蓝菜单选中 + 表头灰底', () => {
    applyTheme({ skin: 'arco' })
    const css = themeCss()
    // 主按钮：Arco 悬停变浅（light-3）、按下更深（dark-2），与苹果相反
    expect(css).toContain('.el-button--primary {')
    expect(css).toContain('--el-button-hover-bg-color: var(--el-color-primary-light-3)')
    expect(css).toContain('--el-button-active-bg-color: var(--el-color-primary-dark-2)')
    // 默认按钮（secondary）：灰底无边框，hover 加深一级灰
    expect(css).toContain(".el-button:not([class*='el-button--']):not(.is-text):not(.is-link) {")
    expect(css).toContain('--el-button-bg-color: #f2f3f5')
    expect(css).toContain('--el-button-hover-bg-color: #e5e6eb')
    // 标签：primary 浅蓝底蓝字无边框（底色取 light-9 随主色覆盖联动）
    expect(css).toContain('.el-tag.el-tag--primary {')
    expect(css).toContain('--el-tag-bg-color: var(--el-color-primary-light-9)')
    expect(css).toContain('--el-tag-text-color: var(--el-color-primary)')
    // 菜单：hover 浅灰（作用域限定 Station，避免 :root 注入被 EP 元素规则盖住）+ 选中浅蓝底蓝字无左条
    expect(css).toContain('.wd-station__menu,')
    expect(css).toContain('--el-menu-hover-bg-color: #f2f3f5')
    expect(css).toContain('.wd-station__menu .el-menu-item.is-active {')
    expect(css).toContain('background: var(--el-color-primary-light-9)')
    expect(css).toContain('color: var(--el-color-primary)')
    // 表格：表头浅灰底 + 中灰字 + 细边（同选择器级覆盖）
    expect(css).toContain('.el-table {')
    expect(css).toContain('--el-table-header-bg-color: #f7f8fa')
    expect(css).toContain('--el-table-header-text-color: #4e5969')
    expect(css).toContain('--el-table-border-color: #e5e6eb')
  })

  it('antd 蚂蚁风：Ant 蓝 + 暖黑灰阶（对比度压深）+ 6px 圆角 + 白卡浅灰底', () => {
    applyTheme({ skin: 'antd' })
    const css = themeCss()
    // Ant 官方 Seed Token：主色 colorPrimary #1677ff（与品牌主色一致）、info 同为品牌蓝
    expect(css).toContain('--wd-color-primary: #1677ff')
    expect(css).toContain('--el-color-primary: #1677ff')
    expect(css).toContain('--wd-color-success: #52c41a')
    expect(css).toContain('--wd-color-warning: #faad14')
    expect(css).toContain('--wd-color-danger: #ff4d4f')
    expect(css).toContain('--wd-color-info: #1677ff')
    // 暖黑灰阶：页面底 colorBgLayout、正文 0.88 黑近似、secondary/placeholder 压深至 WCAG AA
    expect(css).toContain('--wd-bg-color-page: #f0f2f5')
    expect(css).toContain('--wd-text-color-primary: #1f1f1f')
    expect(css).toContain('--wd-text-color-regular: #404040')
    expect(css).toContain('--wd-text-color-secondary: #595959')
    expect(css).toContain('--wd-text-color-placeholder: #707070')
    expect(css).toContain('--wd-border-color: #d9d9d9')
    expect(css).toContain('--wd-border-color-light: #f0f0f0')
    // Ant 圆角：基础 6px（Seed borderRadius）、小圆角 4px（borderRadiusSM）
    expect(css).toContain('--wd-radius-base: 6px')
    expect(css).toContain('--wd-radius-small: 4px')
    // 主色按 EP 公式推导色阶（混白 30% → #5ca0ff，混黑 20% → #125fcc）
    expect(css).toContain('--el-color-primary-light-3: #5ca0ff')
    expect(css).toContain('--el-color-primary-dark-2: #125fcc')
  })

  it('antd 组件级：白卡 8px 大圆角 + 灰细边 + Ant 三段式轻影 + 标识条归零 + 暗蓝侧栏', () => {
    applyTheme({ skin: 'antd' })
    const css = themeCss()
    expect(css).toContain('--wd-panel-radius: 8px')
    expect(css).toContain('--wd-panel-border-color: #f0f0f0')
    expect(css).toContain('--wd-panel-shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.03)')
    expect(css).toContain('--wd-panel-title-bar-width: 0')
    expect(css).toContain('--wd-datagrid-radius: 8px')
    // 导航区：Ant Design Pro 招牌暗蓝侧栏
    expect(css).toContain('--wd-station-aside-bg: #001529')
  })

  it('antd cssRules：hover 变浅 + 白底灰边默认按钮 + 浅蓝标签 + 暗蓝侧栏主色实心选中 + 表头灰底', () => {
    applyTheme({ skin: 'antd' })
    const css = themeCss()
    // 主按钮：Ant hover 变浅（light-5 ≈ #4096ff 档）、按下更深（dark-2 ≈ #0958d9 档），色阶随覆盖联动
    expect(css).toContain('.el-button--primary {')
    expect(css).toContain('--el-button-hover-bg-color: var(--el-color-primary-light-5)')
    expect(css).toContain('--el-button-active-bg-color: var(--el-color-primary-dark-2)')
    // 默认按钮（Ant default）：白底灰边近黑字，hover 边框/文字变主色（区别于 Arco 灰底无边框）
    expect(css).toContain(".el-button:not([class*='el-button--']):not(.is-text):not(.is-link) {")
    expect(css).toContain('--el-button-bg-color: #fff')
    expect(css).toContain('--el-button-border-color: #d9d9d9')
    expect(css).toContain('--el-button-hover-border-color: var(--el-color-primary)')
    expect(css).toContain('--el-button-hover-text-color: var(--el-color-primary)')
    // 标签：primary 浅蓝底蓝字无边框（底色取 light-9 随主色覆盖联动）
    expect(css).toContain('.el-tag.el-tag--primary {')
    expect(css).toContain('--el-tag-bg-color: var(--el-color-primary-light-9)')
    expect(css).toContain('--el-tag-text-color: var(--el-color-primary)')
    // 顶栏菜单：浅色 hover 浅灰 + 选中浅蓝底蓝字（作用域限定 Station）
    expect(css).toContain('.wd-station__top-menu .el-menu {')
    expect(css).toContain('--el-menu-hover-bg-color: #f5f5f5')
    expect(css).toContain('.wd-station__top-menu .el-menu-item.is-active {')
    expect(css).toContain('background: var(--el-color-primary-light-9)')
    expect(css).toContain('color: var(--el-color-primary)')
    // 侧栏菜单：Ant Design Pro 招牌暗蓝——去右边框、logo 白字、0.65 白字、选中主色实心白字
    expect(css).toContain('.wd-station .wd-station__aside {')
    expect(css).toContain('border-right: none')
    expect(css).toContain('.wd-station__aside .wd-station__logo-title {')
    expect(css).toContain('.wd-station__menu {')
    expect(css).toContain('--el-menu-text-color: rgba(255, 255, 255, 0.65)')
    expect(css).toContain('--el-menu-hover-bg-color: rgba(255, 255, 255, 0.08)')
    // 侧栏分组标题（headerMode=title/both）：暗蓝下用半透明白变量，供 scoped 样式回退消费
    expect(css).toContain('--wd-station-menu-group-color: rgba(255, 255, 255, 0.45)')
    expect(css).toContain('.wd-station__menu .el-menu-item.is-active {')
    expect(css).toContain('background: var(--el-color-primary)')
    expect(css).toContain('.wd-station__menu .el-menu-item.is-active:hover {')
    expect(css).toContain('background: var(--el-color-primary-dark-2)')
    expect(css).toContain('.wd-station__menu .el-sub-menu.is-active > .el-sub-menu__title {')
    expect(css).toContain('color: #fff')
    // 表格：表头 colorFillAlter 灰底 + 中灰字 + 细边（同选择器级覆盖）
    expect(css).toContain('.el-table {')
    expect(css).toContain('--el-table-header-bg-color: #fafafa')
    expect(css).toContain('--el-table-header-text-color: #595959')
    expect(css).toContain('--el-table-border-color: #f0f0f0')
    expect(css).toContain('--el-table-row-hover-bg-color: #fafafa')
  })

  it('soft 柔和拟物风：品红主色 + 蓝灰黑文字（对比度压深）+ 8px 控件大圆角 + 白卡浅蓝灰底', () => {
    applyTheme({ skin: 'soft' })
    const css = themeCss()
    // Creative Tim Soft UI Dashboard 官方色板：primary 品红 #cb0c9f（白字 ≈5.1 达 AA）、success 黄绿、info 青
    expect(css).toContain('--wd-color-primary: #cb0c9f')
    expect(css).toContain('--el-color-primary: #cb0c9f')
    expect(css).toContain('--wd-color-success: #82d616')
    expect(css).toContain('--wd-color-warning: #fbcf33')
    expect(css).toContain('--wd-color-danger: #ea0606')
    expect(css).toContain('--wd-color-info: #17c1e8')
    // 蓝灰黑文字体系：官方 text-primary #344767、text-secondary #67748e（≈4.7 达 AA）；
    // placeholder 官方 0.6 透明 ≈#868c97 仅 ≈3.5 不达标，压深至 #66708a ≈4.8
    expect(css).toContain('--wd-bg-color-page: #f4f6fa')
    expect(css).toContain('--wd-text-color-primary: #344767')
    expect(css).toContain('--wd-text-color-regular: #425475')
    expect(css).toContain('--wd-text-color-secondary: #67748e')
    expect(css).toContain('--wd-text-color-placeholder: #66708a')
    // 蓝灰调边框（区别于 Ant 暖灰）
    expect(css).toContain('--wd-border-color: #d5dbe3')
    expect(css).toContain('--wd-border-color-light: #e9edf3')
    // Soft UI 大圆角：控件 8px、小 6px
    expect(css).toContain('--wd-radius-base: 8px')
    expect(css).toContain('--wd-radius-small: 6px')
    // 主色按 EP 公式推导色阶（混白 30% → #db55bc，混黑 20% → #a20a7f）
    expect(css).toContain('--el-color-primary-light-3: #db55bc')
    expect(css).toContain('--el-color-primary-dark-2: #a20a7f')
  })

  it('soft 组件级：白卡 12px 大圆角 + Soft UI 招牌柔影 + 标识条归零 + 纯白侧栏', () => {
    applyTheme({ skin: 'soft' })
    const css = themeCss()
    expect(css).toContain('--wd-panel-radius: 12px')
    expect(css).toContain('--wd-panel-border-color: #e9edf3')
    expect(css).toContain('--wd-panel-shadow-sm: 0 20px 27px 0 rgba(0, 0, 0, 0.05)')
    expect(css).toContain('--wd-panel-title-bar-width: 0')
    expect(css).toContain('--wd-datagrid-radius: 12px')
    // 导航区：Soft UI 官方 sidenav bg-white 纯白侧栏（选中态为品紫渐变胶囊，见 cssRules）
    expect(css).toContain('--wd-station-aside-bg: #ffffff')
    // tabs 激活底：与宋韵定稿一致，不画浅底色块，激活态仅靠品红文字色 + 底部滑块横线表达
    expect(css).not.toContain('--wd-station-tabs-active-bg')
  })

  it('soft cssRules：主按钮变深+品色柔影 + 白底蓝灰边默认按钮 + 胶囊徽章 + 焦点光晕 + 白侧栏品紫渐变胶囊选中 + 表头浅灰', () => {
    applyTheme({ skin: 'soft' })
    const css = themeCss()
    // 主按钮：Soft UI 官方 hover 变深（#ad0a87 ≈ dark-2 档）+ 招牌品色柔影（色阶随覆盖联动）
    expect(css).toContain('.el-button--primary {')
    expect(css).toContain('--el-button-hover-bg-color: var(--el-color-primary-dark-2)')
    expect(css).toContain('--el-button-active-bg-color: var(--el-color-primary-dark-2)')
    expect(css).toContain('box-shadow: 0 4px 6px -1px rgba(203, 12, 159, 0.2)')
    // 默认按钮：白底 + 蓝灰描边 + 蓝灰黑字，hover 边框/文字变主色
    expect(css).toContain(".el-button:not([class*='el-button--']):not(.is-text):not(.is-link) {")
    expect(css).toContain('--el-button-bg-color: #fff')
    expect(css).toContain('--el-button-border-color: #d5dbe3')
    expect(css).toContain('--el-button-text-color: #344767')
    // 徽章胶囊化（Soft UI pill 徽标）+ primary 浅品底品字无边框（底色取 light-9 随覆盖联动）
    expect(css).toContain('.el-tag {')
    expect(css).toContain('border-radius: 999px')
    expect(css).toContain('.el-tag.el-tag--primary {')
    expect(css).toContain('--el-tag-bg-color: var(--el-color-primary-light-9)')
    expect(css).toContain('--el-tag-text-color: var(--el-color-primary)')
    // 输入框聚焦：主色柔光晕（color-mix 随主色覆盖联动）
    expect(css).toContain('.el-input__wrapper.is-focus {')
    expect(css).toContain('color-mix(in srgb, var(--el-color-primary) 12%, transparent)')
    // 顶栏菜单：浅色 hover 浅灰 + 选中浅品底品字
    expect(css).toContain('.wd-station__top-menu .el-menu {')
    expect(css).toContain('--el-menu-hover-bg-color: #f8f9fa')
    expect(css).toContain('.wd-station__top-menu .el-menu-item.is-active {')
    // 白侧栏：去右边框（scoped 特异性需 .wd-station 前缀压过）+ 菜单蓝灰黑字 + 浅品 hover 晕染
    expect(css).toContain('.wd-station .wd-station__aside {')
    expect(css).toContain('border-right: none')
    expect(css).toContain('.wd-station__menu {')
    expect(css).toContain('--el-menu-text-color: #344767')
    expect(css).toContain('--el-menu-hover-bg-color: rgba(203, 12, 159, 0.06)')
    // 选中态：Soft UI 招牌品紫渐变胶囊白字（菜单项圆角化 + 内边距营造胶囊）
    expect(css).toContain('.wd-station__menu .el-menu-item {')
    expect(css).toContain('border-radius: 8px')
    expect(css).toContain('background: linear-gradient(310deg, #cb0c9f, #7928ca)')
    expect(css).toContain('.wd-station__menu .el-menu-item.is-active {')
    expect(css).toContain('color: #fff')
    expect(css).toContain('.wd-station__menu .el-sub-menu.is-active > .el-sub-menu__title {')
    expect(css).toContain('color: var(--el-color-primary)')
    // 表格：表头浅灰底 + 蓝灰黑字 + 浅边（同选择器级覆盖）
    expect(css).toContain('.el-table {')
    expect(css).toContain('--el-table-header-bg-color: #f8f9fa')
    expect(css).toContain('--el-table-header-text-color: #344767')
    expect(css).toContain('--el-table-border-color: #e9edf3')
    expect(css).toContain('--el-table-row-hover-bg-color: #f8f9fa')
  })

  it('song 天青宋韵：墨青主色 + 宣纸青灰底 + 墨色文字 + 2~4px 小圆角 + 宋式宽松留白', () => {
    applyTheme({ skin: 'song' })
    const css = themeCss()
    // 汝窑天青取可承载白字的深阶 #4a7d78（白字对比度 ≈4.7 达 AA），语义色同取低饱和宋色
    expect(css).toContain('--wd-color-primary: #4a7d78')
    expect(css).toContain('--el-color-primary: #4a7d78')
    expect(css).toContain('--wd-color-success: #4f8f68')
    expect(css).toContain('--wd-color-warning: #c0954a')
    expect(css).toContain('--wd-color-danger: #a85a4f')
    expect(css).toContain('--wd-color-info: #7e8f8b')
    // 页面宣纸青灰 + 卡片近白 + 浮层纸白；墨色文字体系（placeholder 压深保可读）
    expect(css).toContain('--wd-bg-color: #fbfcfb')
    expect(css).toContain('--wd-bg-color-page: #eef3f1')
    expect(css).toContain('--wd-bg-color-overlay: #fdfefd')
    expect(css).toContain('--wd-text-color-primary: #2b3330')
    expect(css).toContain('--wd-text-color-regular: #56605c')
    expect(css).toContain('--wd-text-color-secondary: #7b8580')
    expect(css).toContain('--wd-text-color-placeholder: #97a19c')
    // 青灰细边 + 宋式克制小圆角（控件 4px / 小 2px）+ 宽松留白
    expect(css).toContain('--wd-border-color: #cfd9d5')
    expect(css).toContain('--wd-border-color-light: #e2e9e6')
    expect(css).toContain('--wd-radius-base: 4px')
    expect(css).toContain('--wd-radius-small: 2px')
    expect(css).toContain('--wd-spacing-base: 14px')
    expect(css).toContain('--wd-spacing-large: 18px')
    // 主色按 EP 公式推导色阶（混白 30% → #80a4a1，混黑 20% → #3b6460）
    expect(css).toContain('--el-color-primary-light-3: #80a4a1')
    expect(css).toContain('--el-color-primary-dark-2: #3b6460')
  })

  it('song 组件级：宣纸白面板 + 天青标识条 + 青灰细描边 + 青瓷导航区 + 冰裂纹背景素材', () => {
    applyTheme({ skin: 'song' })
    const css = themeCss()
    // 面板：宣纸白底 + 极轻青灰阴影 + 墨青标题 + 2px 天青渐变标识条 + 宋式留白间距
    expect(css).toContain('--wd-panel-bg: #fbfcfb')
    expect(css).toContain('--wd-panel-radius: 4px')
    expect(css).toContain('--wd-panel-border-color: #d9e3df')
    expect(css).toContain('--wd-panel-title-color: #3a6360')
    expect(css).toContain('--wd-panel-title-bar-width: 2px')
    expect(css).toContain('--wd-panel-title-bar-bg: linear-gradient(180deg, #4a7d78, #8fb9b4)')
    expect(css).toContain('--wd-panel-header-padding: 14px 18px')
    expect(css).toContain('--wd-panel-body-padding: 18px')
    expect(css).toContain('--wd-panel-footer-bg: #f4f8f6')
    expect(css).toContain('--wd-panel-margin-bottom: 14px')
    expect(css).toContain('--wd-panel-shadow-sm: 0 1px 2px rgba(49, 74, 71, 0.04)')
    expect(css).toContain('--wd-panel-shadow-md: 0 6px 18px rgba(49, 74, 71, 0.08)')
    // 内容容器：搜索 / 表单操作条统一青灰细边与小圆角；datagrid / editablegrid 全皮肤定稿无边框无背景，仅保留小圆角
    expect(css).toContain('--wd-datagrid-radius: 4px')
    expect(css).toContain('--wd-datagrid-padding: 16px')
    expect(css).toContain('--wd-search-bg: #f4f8f6')
    expect(css).toContain('--wd-search-padding: 16px')
    expect(css).toContain('--wd-form-footer-bg: #f4f8f6')
    expect(css).toContain('--wd-form-footer-padding: 12px 18px')
    expect(css).toContain('--wd-form-footer-radius: 4px')
    // 导航区：青瓷淡底侧栏 + 近白页头 / 页签条 + 天青激活态 + 灰青分组标题
    expect(css).toContain('--wd-station-aside-bg: #e9f0ed')
    expect(css).toContain('--wd-station-header-bg: #f7faf8')
    expect(css).toContain('--wd-station-tabs-bg: #f1f6f4')
    expect(css).toContain('--wd-station-tabs-active-color: #4a7d78')
    // tabs 激活底：按定稿不画任何浅青底色块（cssVars 不声明 active-bg，cssRules 也不注入激活底伪元素），
    // 激活态仅靠天青文字色 + 底部滑块横线表达
    expect(css).not.toContain('--wd-station-tabs-active-bg')
    expect(css).not.toContain('#dce9e5')
    expect(css).not.toContain('.el-tabs__item.is-active::after')
    expect(css).toContain('--wd-station-menu-group-color: #849b95')
    // 背景素材：面板汝窑冰裂纹开片 + 侧栏淡远山（内联 SVG 零外部资源）
    expect(css).toContain("--wd-panel-bg-image: url(\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='260' height='170'")
    expect(css).toContain("--wd-station-aside-bg-image: url(\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='480' height='110'")
  })

  it('song cssRules：宋体字系 + 平涂天青主按钮 + 宣纸白默认按钮 + 小圆角标签 + 选中态左墨线 + 表头浅天青', () => {
    applyTheme({ skin: 'song' })
    const css = themeCss()
    // 宋体衬线字体栈（正文继承 + EP 变量在 cssVars 注入）
    expect(css).toContain("font-family: 'Songti SC'")
    expect(css).toContain("'STSong', 'SimSun', '宋体'")
    // 主按钮：天青平涂（宋式克制不做渐变），hover 取深阶 + 极轻投影
    expect(css).toContain('.el-button--primary {')
    expect(css).toContain('--el-button-hover-bg-color: var(--el-color-primary-dark-2)')
    expect(css).toContain('box-shadow: 0 1px 2px rgba(49, 74, 71, 0.12)')
    // 默认按钮：宣纸白底 + 青灰细边 + 墨色字，hover 转天青
    expect(css).toContain(".el-button:not([class*='el-button--']):not(.is-text):not(.is-link) {")
    expect(css).toContain('--el-button-bg-color: #fbfcfb')
    expect(css).toContain('--el-button-border-color: #cfd9d5')
    expect(css).toContain('--el-button-text-color: #2b3330')
    // 标签：宋式 2px 小圆角 + primary 浅天青底极细青边
    expect(css).toContain('.el-tag {')
    expect(css).toContain('border-radius: 2px')
    expect(css).toContain('.el-tag.el-tag--primary {')
    expect(css).toContain('--el-tag-border-color: rgba(74, 125, 120, 0.34)')
    expect(css).toContain('--el-tag-text-color: var(--el-color-primary)')
    // 输入框聚焦：1px 内描边 + 3px 极淡外晕（比 Soft 更收敛）
    expect(css).toContain('.el-input__wrapper.is-focus {')
    expect(css).toContain('color-mix(in srgb, var(--el-color-primary) 10%, transparent)')
    // 顶栏菜单：浅青灰 hover + 浅天青底青字选中
    expect(css).toContain('.wd-station__top-menu .el-menu {')
    expect(css).toContain('--el-menu-hover-bg-color: rgba(74, 125, 120, 0.06)')
    expect(css).toContain('.wd-station__top-menu .el-menu-item.is-active {')
    // 青瓷侧栏：青灰细分割线 + 菜单墨字 + 选中项左侧 2px 墨线（宋式留白标记）
    expect(css).toContain('.wd-station .wd-station__aside {')
    expect(css).toContain('border-right: 1px solid #dbe5e1')
    expect(css).toContain('.wd-station__menu {')
    expect(css).toContain('--el-menu-text-color: #2b3330')
    expect(css).toContain('--el-menu-hover-bg-color: rgba(74, 125, 120, 0.08)')
    expect(css).toContain('.wd-station__menu .el-menu-item.is-active {')
    expect(css).toContain('box-shadow: inset 2px 0 0 var(--el-color-primary)')
    expect(css).toContain('.wd-station__menu .el-sub-menu.is-active > .el-sub-menu__title {')
    // 表格：表头浅天青底 + 墨青字 + 青灰细线（同选择器级覆盖）
    expect(css).toContain('.el-table {')
    expect(css).toContain('--el-table-header-bg-color: #f3f8f6')
    expect(css).toContain('--el-table-header-text-color: #3a6360')
    expect(css).toContain('--el-table-border-color: #e0e8e4')
    expect(css).toContain('--el-table-row-hover-bg-color: #f6faf8')
    // 冰裂纹平铺尺寸（宋汝窑开片意象）
    expect(css).toContain('div.wd-panel.wd-panel {')
    expect(css).toContain('background-size: 260px 170px')
  })

  it('tech 深空霓虹青：深空蓝底 + 青色描边辉光 + 青蓝标识条 + 导航区压黑 + El 深色联动', () => {
    applyTheme({ skin: 'tech' })
    const css = themeCss()
    expect(css).toContain('--wd-color-primary: #00e5ff')
    expect(css).toContain('--wd-bg-color-page: #050d1a')
    expect(css).toContain('--wd-panel-bg: #0a1828')
    expect(css).toContain('--wd-panel-border-color: rgba(0, 229, 255, 0.14)')
    expect(css).toContain('--wd-panel-title-color: #5ee9ff')
    expect(css).toContain('--wd-panel-shadow-md: 0 0 28px rgba(0, 229, 255, 0.26)')
    expect(css).toContain('--wd-panel-title-bar-bg: linear-gradient(180deg, #00e5ff, #2979ff)')
    expect(css).toContain('--wd-station-aside-bg: #040b16')
    expect(css).toContain('--wd-station-header-bg: #040b16')
    expect(css).toContain('--wd-station-tabs-bg: #040b16')
    // DataForm 按钮容器：青蓝渐变 HUD 操作条 + 圆角 + 四周内边距（按钮不再贴边）
    expect(css).toContain('--wd-form-footer-bg: linear-gradient(90deg, rgba(0, 229, 255, 0.09), rgba(41, 121, 255, 0.05))')
    expect(css).toContain('--wd-form-footer-padding: 10px 12px')
    expect(css).toContain('--wd-form-footer-radius: 6px')
    // El 深色联动 + 菜单 hover 青色同源深透底（防 EP 默认 light-9 浅青糊成亮块）
    expect(css).toContain('--el-fill-color-blank: #0a1828')
    expect(css).toContain('--el-color-white: #06121f')
    expect(css).toContain('--el-mask-color: rgba(2, 8, 18, 0.72)')
    expect(css).toContain('--el-menu-hover-bg-color: rgba(0, 229, 255, 0.1)')
    // 表格内线青色（cssRules 同选择器级覆盖，防 :root 注入被 EP 元素规则盖住）
    expect(css).toContain('--el-table-border-color: rgba(0, 229, 255, 0.2)')
  })

  it('tech 背景素材：面板无背景图（装饰收敛到非连续边框），搜索 HUD 网格，导航区扫描线', () => {
    applyTheme({ skin: 'tech' })
    const css = themeCss()
    // 面板保持纯深空蓝不挂背景图；datagrid / editablegrid 全皮肤定稿无背景（不挂 HUD 网格）
    expect(css).not.toContain('--wd-panel-bg-image')
    // 搜索青色 HUD 网格，Station 导航区青色扫描线
    expect(css).toContain('--wd-search-bg-image: repeating-linear-gradient(0deg, rgba(0, 229, 255, 0.045)')
    expect(css).toContain('--wd-station-aside-bg-image: repeating-linear-gradient(0deg, rgba(0, 229, 255, 0.05) 0 1px, transparent 1px 4px)')
    expect(css).toContain('--wd-station-header-bg-image: repeating-linear-gradient(0deg, rgba(0, 229, 255, 0.05) 0 1px, transparent 1px 4px)')
    expect(css).toContain('--wd-station-tabs-bg-image: repeating-linear-gradient(0deg, rgba(0, 229, 255, 0.05) 0 1px, transparent 1px 4px)')
  })

  it('tech cssRules：青光渐变主按钮 + ghost 青默认按钮 + 霓虹 primary 标签 + 菜单选中光条', () => {
    applyTheme({ skin: 'tech' })
    const css = themeCss()
    // 主按钮：青→蓝渐变 + 青光外发光（渐变起点 var(--el-color-primary) 随用户覆盖联动）
    expect(css).toContain('.el-button--primary {')
    expect(css).toContain('background-image: linear-gradient(135deg, var(--el-color-primary), #2979ff)')
    expect(css).toContain('box-shadow: 0 0 14px rgba(0, 229, 255, 0.45)')
    // 默认按钮：ghost 青（:not 排除语义色按钮与 text/link 形态）
    expect(css).toContain(".el-button:not([class*='el-button--']):not(.is-text):not(.is-link) {")
    expect(css).toContain('--el-button-text-color: #a5f3ff')
    // primary 标签：深青底 + 亮青字
    expect(css).toContain('.el-tag.el-tag--primary {')
    expect(css).toContain('--el-tag-bg-color: rgba(0, 229, 255, 0.14)')
    expect(css).toContain('--el-tag-text-color: #a5f3ff')
    // 菜单选中：青 tint 底 + 左霓虹条 + 文字发光
    expect(css).toContain('.el-menu--vertical .el-menu-item.is-active {')
    expect(css).toContain('box-shadow: inset 2px 0 0 var(--el-color-primary)')
  })

  it('tech 科技动画：4 个关键帧（面板扫描光 / 标识条呼吸 / 按钮流光 / 进度条流光）+ 聚焦光晕', () => {
    applyTheme({ skin: 'tech' })
    const css = themeCss()
    expect(css).toContain('@keyframes wd-tech-scan')
    expect(css).toContain('@keyframes wd-tech-glow')
    expect(css).toContain('@keyframes wd-tech-shine')
    expect(css).toContain('@keyframes wd-tech-flow')
    // 面板扫描光带 + 标识条呼吸
    expect(css).toContain('.wd-panel::after {')
    expect(css).toContain('animation: wd-tech-scan 6s linear infinite')
    expect(css).toContain('.wd-panel__header::before {')
    expect(css).toContain('animation: wd-tech-glow 3.6s ease-in-out infinite')
    // 主按钮 hover 流光 + 输入框聚焦青光环 + 进度条流光 + 加载呼吸
    expect(css).toContain('.el-button--primary::after {')
    expect(css).toContain('animation: wd-tech-shine 0.7s ease')
    expect(css).toContain('.el-input__wrapper.is-focus,')
    expect(css).toContain('0 0 12px rgba(0, 229, 255, 0.45)')
    expect(css).toContain('.el-progress-bar__inner::after {')
    expect(css).toContain('animation: wd-tech-flow 1.2s linear infinite')
    expect(css).toContain('.el-loading-spinner .path {')
  })

  it('tech 非连续边框：四角 L 角码 + 断续虚线段 + 底边调暗 + 近直角（参考 Loss Curve 科技面板）', () => {
    applyTheme({ skin: 'tech' })
    const css = themeCss()
    // 底边调暗衬断续感 + 面板近直角
    expect(css).toContain('--wd-panel-border-color: rgba(0, 229, 255, 0.14)')
    expect(css).toContain('--wd-panel-radius: 3px')
    // ::before 绘制（::after 已被扫描光占用）；no-border 变体不画框；不拦截交互
    expect(css).toContain('.wd-panel:not(.wd-panel--no-border)::before {')
    expect(css).toContain('pointer-events: none')
    // 四角 L 角码：8 层 3px 粗 20px 臂亮青（视觉主角）
    expect(css).toContain('left top / 20px 3px')
    expect(css).toContain('left top / 3px 20px')
    expect(css).toContain('right bottom / 20px 3px')
    expect(css).toContain('right bottom / 3px 20px')
    // 四边断续虚线：16px 亮段 / 12px 间隔，0.42 弱于角码拉开层次，横竖两组；
    // 内缩 32px 让开角码（20px 臂 + 12px 间隙，不横穿角码区）
    expect(css).toContain('repeating-linear-gradient(90deg, rgba(0, 229, 255, 0.42) 0 16px, transparent 16px 28px)')
    expect(css).toContain('repeating-linear-gradient(180deg, rgba(0, 229, 255, 0.42) 0 16px, transparent 16px 28px)')
    expect(css).toContain('left 32px top / calc(100% - 64px) 1px')
    expect(css).toContain('left 32px bottom / calc(100% - 64px) 1px')
    expect(css).toContain('left top 32px / 1px calc(100% - 64px)')
    expect(css).toContain('right top 32px / 1px calc(100% - 64px)')
    // 角码与虚线青色辉光
    expect(css).toContain('drop-shadow(0 0 3px rgba(0, 229, 255, 0.55))')
  })

  it('cssRules 仅随所属皮肤注入：default / 未知皮肤不携带规则', () => {
    applyTheme({ skin: 'default' })
    expect(themeCss()).not.toContain('.el-button--primary {')
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    applyTheme({ skin: 'nope' as any })
    expect(themeCss()).not.toContain('.el-button--primary {')
  })

  it('用户 cssVars 可覆盖皮肤组件级令牌', () => {
    applyTheme({ skin: 'governance', cssVars: { '--wd-panel-header-bg': '#123456' } })
    expect(themeCss()).toContain('--wd-panel-header-bg: #123456')
  })

  it('未扩展组件级维度的皮肤（flat）不注入组件级令牌', () => {
    applyTheme({ skin: 'flat' })
    const css = themeCss()
    expect(css).not.toContain('--wd-panel-bg')
    expect(css).not.toContain('--wd-datagrid-bg')
    expect(css).not.toContain('--wd-station-header-bg')
  })
})

describe('config 集成：theme.skin 经全局配置生效', () => {
  beforeEach(() => {
    resetConfig()
    vi.restoreAllMocks()
  })

  it('setGlobalConfig({ theme: { skin } }) 套用预设皮肤', () => {
    setGlobalConfig({ theme: { skin: 'fashion' } })
    const css = themeCss()
    expect(css).toContain('--wd-color-primary: #cd3c1d')
    expect(css).toContain('--wd-bg-color-page: #f6f1ea')
    expect(css).toContain('--wd-panel-radius: 14px')
    expect(css).toContain('--wd-datagrid-radius: 14px')
    // 标题回归纯文字：彩色标识条宽度归零
    expect(css).toContain('--wd-panel-title-bar-width: 0')
    // 面板空间感：padding 两轮各 +3（出厂 header 12/16/12/18、body/card-header 16）+ 面板下间距 12→18
    expect(css).toContain('--wd-panel-header-padding: 18px 22px 18px 24px')
    expect(css).toContain('--wd-panel-body-padding: 22px')
    expect(css).toContain('--wd-panel-card-header-padding: 22px')
    expect(css).toContain('--wd-panel-margin-bottom: 18px')
    // 搜索面板 padding 同步加大（出厂 8px 12px 0）
    expect(css).toContain('--wd-search-padding: 11px 15px 3px')
    // 底层容器 padding 按情况加大：表格 / 可编辑表格 12→15，表单 footer 12px 0 0 → 15px 0 3px
    expect(css).toContain('--wd-datagrid-padding: 15px')
    expect(css).toContain('--wd-editable-grid-padding: 15px')
    expect(css).toContain('--wd-form-footer-padding: 15px 0 3px')
    // 表格单元格横向留白加大（出厂 12px），杂志风表格更透气
    expect(css).toContain('.el-table .cell {')
    expect(css).toContain('padding: 0 14px')
    // 字体整体加大 1px（出厂 base/small/large 14/12/16）
    expect(css).toContain('--wd-font-size-base: 15px')
    expect(css).toContain('--wd-font-size-small: 13px')
    expect(css).toContain('--wd-font-size-large: 17px')
    // 导航区：半透奶油白侧栏 + 半透白顶栏 / tabs 条（毛玻璃）
    expect(css).toContain('--wd-station-aside-bg: rgba(251, 247, 240, 0.72)')
    expect(css).toContain('--wd-station-header-bg: rgba(255, 255, 255, 0.65)')
    expect(css).toContain('--wd-station-tabs-bg: rgba(255, 255, 255, 0.55)')
    // 皮肤专属规则：页面柔光斑氛围底 + 毛玻璃导航区 + 侧栏深墨胶囊选中态
    expect(css).toContain('.wd-station {')
    expect(css).toContain('rgba(205, 60, 29, 0.16)')
    expect(css).toContain('backdrop-filter: blur(16px) saturate(1.5)')
    expect(css).toContain('.wd-station__menu.el-menu,')
    expect(css).toContain('.wd-station__menu .el-menu-item.is-active {')
    expect(css).toContain('background: #1f2532')
    // 容器类毛玻璃：面板 / 搜索半透白底（透出页面光斑），容器浅暖描边与毛玻璃融合（editablegrid 全皮肤定稿无背景无描边，不参与）
    expect(css).toContain('--wd-panel-bg: rgba(255, 255, 255, 0.62)')
    expect(css).toContain('--wd-panel-border-color: rgba(233, 225, 214, 0.9)')
    expect(css).toContain('--wd-search-bg: rgba(255, 255, 255, 0.5)')
    expect(css).toContain('.wd-panel,')
    expect(css).toContain('backdrop-filter: blur(14px) saturate(1.4)')
    // 浅色边框：搜索根类出厂无边框，皮肤补 1px 暖浅描边（Panel 走 --wd-panel-border-color 令牌；datagrid / editablegrid 全皮肤定稿无描边，不加入选择器）
    expect(css).toContain('.wd-search-panel {')
    expect(css).not.toContain('.wd-datagrid,')
    expect(css).not.toContain('.wd-editable-grid {')
    expect(css).toContain('border: 1px solid rgba(233, 225, 214, 0.9)')
    // EP 表格默认不透明白底会盖住容器玻璃底，透明化后透出；表头留半透白分层，行 hover 暖色透底
    expect(css).toContain('--el-table-bg-color: transparent')
    expect(css).toContain('--el-table-tr-bg-color: transparent')
    expect(css).toContain('--el-table-header-bg-color: rgba(255, 255, 255, 0.45)')
    expect(css).toContain('--el-table-row-hover-bg-color: rgba(205, 60, 29, 0.05)')
  })

  it('setGlobalConfig 切换 song 天青宋韵皮肤生效', () => {
    setGlobalConfig({ theme: { skin: 'song' } })
    const css = themeCss()
    expect(css).toContain('--wd-color-primary: #4a7d78')
    expect(css).toContain('--wd-bg-color-page: #eef3f1')
    expect(css).toContain('--wd-panel-title-color: #3a6360')
    expect(css).toContain('--wd-panel-title-bar-width: 2px')
    expect(css).toContain('--wd-station-aside-bg: #e9f0ed')
    expect(css).toContain('box-shadow: inset 2px 0 0 var(--el-color-primary)')
  })

  it('resetConfig 恢复默认后皮肤注入清空', () => {
    setGlobalConfig({ theme: { skin: 'tech' } })
    expect(themeCss()).toContain('--wd-color-primary: #00e5ff')
    resetConfig()
    const css = themeCss()
    expect(css).not.toContain('--wd-color-primary: #00e5ff')
  })
})
