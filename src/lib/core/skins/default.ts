import type { SkinPreset } from './types'

/** 默认：品牌蓝（不注入任何覆盖，回落 tokens.css / theme.css 出厂值） */
export const defaultSkin: SkinPreset = {
  key: 'default',
  label: '默认',
  desc: 'WorkDesktop 品牌蓝，源自产品 Logo 的 V 形主色',
  theme: {}
}
