import type { ThemeConfig } from '../../types/config'
import { getSkinPreset } from './skins'

let styleEl: HTMLStyleElement | null = null

/**
 * 语义令牌 → CSS 变量名映射（PRD 9.1）
 * colors 支持语义键快捷映射，同时同步到 ElementPlus 变量（9.3）
 */
const SEMANTIC_VAR_MAP: Record<string, { wd: string; el: string }> = {
  primary: { wd: '--wd-color-primary', el: '--el-color-primary' },
  success: { wd: '--wd-color-success', el: '--el-color-success' },
  warning: { wd: '--wd-color-warning', el: '--el-color-warning' },
  danger: { wd: '--wd-color-danger', el: '--el-color-danger' },
  error: { wd: '--wd-color-danger', el: '--el-color-danger' },
  info: { wd: '--wd-color-info', el: '--el-color-info' }
}

/** 需要推导 El 派生色阶的语义色（归一化后，error 已并入 danger） */
const STEP_COLORS = ['primary', 'success', 'warning', 'danger', 'info']

/** EP 混色公式：light-N = 混白 N/10，dark-2 = 混黑 20% */
const STEP_SPECS: Array<{ suffix: string; target: [number, number, number]; ratio: number }> = [
  { suffix: 'light-3', target: [255, 255, 255], ratio: 0.3 },
  { suffix: 'light-5', target: [255, 255, 255], ratio: 0.5 },
  { suffix: 'light-7', target: [255, 255, 255], ratio: 0.7 },
  { suffix: 'light-8', target: [255, 255, 255], ratio: 0.8 },
  { suffix: 'light-9', target: [255, 255, 255], ratio: 0.9 },
  { suffix: 'dark-2', target: [0, 0, 0], ratio: 0.2 }
]

/** #rrggbb → [r, g, b]；非法输入回退品牌蓝 */
function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return [0x16, 0x77, 0xff]
  const n = parseInt(m[1], 16)
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff]
}

/** 按 EP 公式把颜色与目标色按比例混合，返回 #rrggbb */
function mixWith(hex: string, target: [number, number, number], ratio: number): string {
  const [r, g, b] = hexToRgb(hex)
  const ch = (c: number, t: number) => Math.round(c + (t - c) * ratio)
  const to2 = (v: number) => v.toString(16).padStart(2, '0')
  return `#${to2(ch(r, target[0]))}${to2(ch(g, target[1]))}${to2(ch(b, target[2]))}`
}

/**
 * 解析最终生效的主题：皮肤预设打底，用户 colors/cssVars 继续覆盖
 * 优先级：cssVars > colors > 皮肤预设；未知皮肤告警并回退默认
 */
export function resolveTheme(theme?: ThemeConfig): ThemeConfig | undefined {
  if (!theme) return theme
  if (!theme.skin) return theme
  const preset = getSkinPreset(theme.skin)
  if (!preset) {
    console.warn(`[WorkDesktop] 未知皮肤 "${theme.skin}"，已回退默认皮肤`)
    return { colors: theme.colors, cssVars: theme.cssVars }
  }
  return {
    colors: { ...preset.theme.colors, ...theme.colors },
    cssVars: { ...preset.theme.cssVars, ...theme.cssVars }
  }
}

/**
 * 将 theme 配置写入 :root CSS 变量（PRD 9.2 方式二）
 * 输出顺序：colors 语义键 → 语义色 El 派生色阶 → cssVars 精细覆盖（后者覆盖前者）
 */
export function applyTheme(input?: ThemeConfig): void {
  if (typeof document === 'undefined') return
  const theme = resolveTheme(input)
  if (!theme) return
  if (!styleEl) {
    styleEl = document.createElement('style')
    styleEl.setAttribute('data-workdesktop-theme', '')
    document.head.appendChild(styleEl)
  }

  const lines: string[] = [':root {']
  const semanticColors: Record<string, string> = {}

  // 1) colors 语义键 → --wd-* 与 --el-*（error 归一到 danger）
  if (theme.colors) {
    for (const [key, value] of Object.entries(theme.colors)) {
      const map = SEMANTIC_VAR_MAP[key.toLowerCase()]
      if (map) {
        lines.push(`  ${map.wd}: ${value};`)
        lines.push(`  ${map.el}: ${value};`)
        // 归一化（error → danger），供色阶推导去重
        semanticColors[map.el.replace('--el-color-', '')] = value
      } else {
        // 非语义键直接作为变量名
        const varName = key.startsWith('--') ? key : `--wd-color-${key}`
        lines.push(`  ${varName}: ${value};`)
      }
    }
  }

  // 2) 语义色 El 派生色阶（EP 混色公式），消除「主色换了、浅阶还是旧色」的断层
  for (const name of STEP_COLORS) {
    const color = semanticColors[name]
    if (!color) continue
    for (const spec of STEP_SPECS) {
      lines.push(`  --el-color-${name}-${spec.suffix}: ${mixWith(color, spec.target, spec.ratio)};`)
    }
  }

  // 3) cssVars 精细覆盖（优先级最高，可覆盖 colors 与色阶推导结果）
  if (theme.cssVars) {
    for (const [name, value] of Object.entries(theme.cssVars)) {
      const varName = name.startsWith('--') ? name : `--${name}`
      lines.push(`  ${varName}: ${value};`)
    }
  }

  lines.push('}')
  // 皮肤专属 CSS 规则（SkinPreset.cssRules）：追加在 :root 变量块之后，切肤重建自动移除
  const preset = input?.skin ? getSkinPreset(input.skin) : undefined
  if (preset?.cssRules) lines.push(preset.cssRules)
  styleEl.textContent = lines.join('\n')
}
