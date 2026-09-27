import { describe, it, expect, beforeEach, vi } from 'vitest'
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

  it('内置 10 套皮肤，结构完整（key/label/desc/theme）', () => {
    const skins = listSkins()
    expect(skins).toHaveLength(10)
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
      'apple'
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

describe('skins 组件级维度：组件样式随皮肤差异化', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('cyberpunk 注入组件级令牌：面板品红霓虹描边 + 紫辉光 + 青品标识条 + 导航区压黑', () => {
    applyTheme({ skin: 'cyberpunk' })
    const css = themeCss()
    expect(css).toContain('--wd-panel-border-color: rgba(217, 70, 239, 0.4)')
    expect(css).toContain('--wd-panel-header-bg: rgba(217, 70, 239, 0.08)')
    expect(css).toContain('--wd-panel-title-color: #e879f9')
    expect(css).toContain('--wd-panel-shadow-sm: 0 0 18px rgba(217, 70, 239, 0.16)')
    expect(css).toContain('--wd-panel-title-bar-bg: linear-gradient(180deg, #00e5ff, #d946ef)')
    expect(css).toContain('--wd-datagrid-bg: #150f2a')
    expect(css).toContain('--wd-editable-grid-border-color: rgba(217, 70, 239, 0.4)')
    expect(css).toContain('--wd-station-header-bg: #070412')
    expect(css).toContain('--wd-search-bg: #150f2a')
    // 背景素材（bg-image 伴随令牌）：内容容器青色 HUD 网格，Station 导航区品红扫描线
    expect(css).toContain('--wd-panel-bg-image: repeating-linear-gradient(0deg, rgba(0, 229, 255, 0.05) 0 1px, transparent 1px 24px), repeating-linear-gradient(90deg, rgba(0, 229, 255, 0.05) 0 1px, transparent 1px 24px)')
    expect(css).toContain('--wd-datagrid-bg-image: repeating-linear-gradient(0deg, rgba(0, 229, 255, 0.05) 0 1px, transparent 1px 24px), repeating-linear-gradient(90deg, rgba(0, 229, 255, 0.05) 0 1px, transparent 1px 24px)')
    expect(css).toContain('--wd-editable-grid-bg-image: repeating-linear-gradient(0deg, rgba(0, 229, 255, 0.05) 0 1px, transparent 1px 24px), repeating-linear-gradient(90deg, rgba(0, 229, 255, 0.05) 0 1px, transparent 1px 24px)')
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
    expect(css).toContain('--wd-datagrid-bg: #fffaf0')
    expect(css).toContain('--wd-search-bg: #fffaf0')
  })

  it('chinese 墨绿金箔：面板深墨绿底 + 金箔描边与标题 + 导航区压深', () => {
    applyTheme({ skin: 'chinese' })
    const css = themeCss()
    expect(css).toContain('--wd-panel-bg: #102c23')
    expect(css).toContain('--wd-panel-title-color: #dec07a')
    expect(css).toContain('--wd-panel-header-bg: rgba(201, 162, 75, 0.1)')
    expect(css).toContain('--wd-panel-border-color: rgba(201, 162, 75, 0.42)')
    expect(css).toContain('--wd-datagrid-bg: #102c23')
    // 表格边框烫金：容器外框实色金箔 + el-table 内部单元格线同源亮金（弱于外框拉开层次）
    expect(css).toContain('--wd-datagrid-border-color: #c9a24b')
    expect(css).toContain('--wd-editable-grid-border-color: #c9a24b')
    expect(css).toContain('--el-table-border-color: rgba(201, 162, 75, 0.45)')
    expect(css).toContain('--wd-station-aside-bg: #071a15')
    expect(css).toContain('--el-fill-color-blank: #123128')
    expect(css).toContain('--el-color-white: #0d231c')
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
    expect(css).toContain('--wd-datagrid-border-color: rgba(0, 229, 255, 0.3)')
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

  it('tech 背景素材：面板无背景图（装饰收敛到非连续边框），表格 HUD 网格，导航区扫描线', () => {
    applyTheme({ skin: 'tech' })
    const css = themeCss()
    // 面板保持纯深空蓝，不挂背景图
    expect(css).not.toContain('--wd-panel-bg-image')
    // 内容容器青色 HUD 网格，Station 导航区青色扫描线
    expect(css).toContain('--wd-datagrid-bg-image: repeating-linear-gradient(0deg, rgba(0, 229, 255, 0.045)')
    expect(css).toContain('--wd-editable-grid-bg-image: repeating-linear-gradient(0deg, rgba(0, 229, 255, 0.045)')
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
    // 容器类毛玻璃：面板 / 搜索 / 表格半透白底（透出页面光斑），面板亮边高光
    expect(css).toContain('--wd-panel-bg: rgba(255, 255, 255, 0.62)')
    expect(css).toContain('--wd-panel-border-color: rgba(255, 255, 255, 0.7)')
    expect(css).toContain('--wd-search-bg: rgba(255, 255, 255, 0.5)')
    expect(css).toContain('--wd-datagrid-bg: rgba(255, 255, 255, 0.55)')
    expect(css).toContain('--wd-editable-grid-bg: rgba(255, 255, 255, 0.55)')
    expect(css).toContain('.wd-panel,')
    expect(css).toContain('.wd-editable-grid {')
    expect(css).toContain('backdrop-filter: blur(14px) saturate(1.4)')
    // EP 表格默认不透明白底会盖住容器玻璃底，透明化后透出；表头留半透白分层，行 hover 暖色透底
    expect(css).toContain('--el-table-bg-color: transparent')
    expect(css).toContain('--el-table-tr-bg-color: transparent')
    expect(css).toContain('--el-table-header-bg-color: rgba(255, 255, 255, 0.45)')
    expect(css).toContain('--el-table-row-hover-bg-color: rgba(205, 60, 29, 0.05)')
  })

  it('resetConfig 恢复默认后皮肤注入清空', () => {
    setGlobalConfig({ theme: { skin: 'tech' } })
    expect(themeCss()).toContain('--wd-color-primary: #00e5ff')
    resetConfig()
    const css = themeCss()
    expect(css).not.toContain('--wd-color-primary: #00e5ff')
  })
})
