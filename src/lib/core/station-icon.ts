/**
 * WdStation 图标解析工具：统一支撑 Station / StationMenuNode / Path 的图标渲染
 *
 * 支持三种 icon 形态：
 * 1. @element-plus/icons-vue 名称字符串（如 'Setting'）→ 查表解析为组件
 * 2. 图标字体 class 字符串（如 Font Awesome 的 'fa-solid fa-user'）→ 模板按 <i :class> 渲染
 *    （需使用方自行引入对应图标字体 CSS，如 @fortawesome/fontawesome-free，组件库零新增依赖）
 * 3. 组件对象 → 直接渲染
 */
import * as ElIcons from '@element-plus/icons-vue'

/** 图标字体 class 前缀：Font Awesome（fa-）/ Bootstrap Icons（bi-）/ Remix Icon（ri-）/ 阿里 iconfont */
const ICON_FONT_PREFIXES = ['fa-', 'bi-', 'ri-', 'iconfont']

/** 是否图标字体 class（如 'fa-solid fa-user'）：命中已知前缀，或含空格的多 class 字符串 */
export function isIconFontClass(icon: unknown): boolean {
  if (typeof icon !== 'string' || !icon) return false
  if (icon.includes(' ')) return true
  return ICON_FONT_PREFIXES.some((p) => icon.startsWith(p))
}

/** 图标归一：字符串按 @element-plus/icons-vue 名称解析（图标字体 class 返回 null，由模板走 <i> 渲染），组件直接用 */
export function resolveStationIcon(icon: any) {
  if (!icon) return null
  if (typeof icon === 'string') {
    if (isIconFontClass(icon)) return null
    return (ElIcons as any)[icon] || null
  }
  return icon
}
