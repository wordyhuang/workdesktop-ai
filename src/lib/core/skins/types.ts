import type { SkinName, ThemeConfig } from '../../../types/config'

/** 预设皮肤结构：每套皮肤一个文件（skins/ 目录），由 skins/index.ts 聚合注册 */
export interface SkinPreset {
  /** 皮肤唯一标识（theme.skin 取值） */
  key: SkinName
  /** 中文名 */
  label: string
  /** 风格描述 */
  desc: string
  /** 皮肤携带的主题配置（colors/cssVars，结构与 ThemeConfig 一致） */
  theme: ThemeConfig
  /**
   * 皮肤专属 CSS 规则（可选）：applyTheme 时原样追加在 :root 变量块之后。
   * 用于 EP 变量做不到的 rule 级定制（如渐变背景、外发光）；仅当 theme.skin
   * 命中该预设时注入，切换皮肤随 styleEl 重建自动移除。规则内引用 var(--el-x/--wd-x)
   * 可保持与用户 colors/cssVars 覆盖联动。
   */
  cssRules?: string
}
