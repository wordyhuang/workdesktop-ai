import type { ThemeConfig } from '../../types/config'

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

let styleEl: HTMLStyleElement | null = null

/**
 * 将 theme 配置写入 :root CSS 变量（PRD 9.2 方式二）
 * colors 展开优先级低于 cssVars（cssVars 可直接覆盖 colors 生成的变量）
 */
export function applyTheme(theme?: ThemeConfig): void {
  if (typeof document === 'undefined' || !theme) return
  if (!styleEl) {
    styleEl = document.createElement('style')
    styleEl.setAttribute('data-workdesktop-theme', '')
    document.head.appendChild(styleEl)
  }

  const lines: string[] = [':root {']

  // 1) colors 语义键 → --wd-* 与 --el-*
  if (theme.colors) {
    for (const [key, value] of Object.entries(theme.colors)) {
      const map = SEMANTIC_VAR_MAP[key.toLowerCase()]
      if (map) {
        lines.push(`  ${map.wd}: ${value};`)
        lines.push(`  ${map.el}: ${value};`)
      } else {
        // 非语义键直接作为变量名
        const varName = key.startsWith('--') ? key : `--wd-color-${key}`
        lines.push(`  ${varName}: ${value};`)
      }
    }
  }

  // 2) cssVars 精细覆盖（优先级更高）
  if (theme.cssVars) {
    for (const [name, value] of Object.entries(theme.cssVars)) {
      const varName = name.startsWith('--') ? name : `--${name}`
      lines.push(`  ${varName}: ${value};`)
    }
  }

  lines.push('}')
  styleEl.textContent = lines.join('\n')
}
