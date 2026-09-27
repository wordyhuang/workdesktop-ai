import type { SkinName } from '../../../types/config'
import type { SkinPreset } from './types'
import { defaultSkin } from './default'
import { fashionSkin } from './fashion'
import { businessSkin } from './business'
import { techSkin } from './tech'
import { cyberpunkSkin } from './cyberpunk'
import { chineseSkin } from './chinese'
import { flatSkin } from './flat'
import { coolSkin } from './cool'
import { governanceSkin } from './governance'
import { appleSkin } from './apple'

/**
 * 预设皮肤库（接入全局配置能力）
 * 每套皮肤一个文件（本目录下 <key>.ts），新增皮肤在此聚合注册
 * 使用：app.use(WorkDesktop, { theme: { skin: 'tech' } })
 *      或 setGlobalConfig({ theme: { skin: 'cyberpunk' } })
 * 覆盖优先级：theme.cssVars > theme.colors > 皮肤预设
 */

export type { SkinPreset } from './types'

export const SKIN_PRESETS: Record<SkinName, SkinPreset> = {
  default: defaultSkin,
  fashion: fashionSkin,
  business: businessSkin,
  tech: techSkin,
  cyberpunk: cyberpunkSkin,
  chinese: chineseSkin,
  flat: flatSkin,
  cool: coolSkin,
  governance: governanceSkin,
  apple: appleSkin
}

/** 查询皮肤预设；未传 key 或未知 key 返回 undefined（由调用方回退默认行为） */
export function getSkinPreset(key?: string): SkinPreset | undefined {
  if (!key) return undefined
  return SKIN_PRESETS[key as SkinName]
}

/** 列出全部预设皮肤（供设置面板 / 文档展示遍历） */
export function listSkins(): SkinPreset[] {
  return Object.values(SKIN_PRESETS)
}
