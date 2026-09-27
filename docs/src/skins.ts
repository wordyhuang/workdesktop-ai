/**
 * 文档站：全站换肤（组件库系统预设皮肤）
 * 数据源 = 组件库 listSkins() 的 10 套 SKIN_PRESETS；切换经 theme.skin 通道：
 *   setGlobalConfig({ theme: { skin } }) → resolveTheme 皮肤打底 → applyTheme
 *   整体重写 <style data-workdesktop-theme> 的 :root 块，Element 组件随令牌联动。
 * default 皮肤 theme 为空 → 写空 :root，回落 tokens.css 出厂值（刷新亦恢复默认）。
 */
import { ref } from 'vue'
import { listSkins, getSkinPreset, setGlobalConfig, resetConfig } from '../../src'
import type { SkinPreset, SkinName } from '../../src'
import { siteBaseConfig } from './site-config'

/** 全部系统预设皮肤（10 套，default 为首） */
export const SITE_SKINS: SkinPreset[] = listSkins()

/* —— 全站皮肤状态（模块单例，路由切换不丢） —— */
export const currentSkinKey = ref('default')

export function activeSkin(): SkinPreset {
  return SITE_SKINS.find((s) => s.key === currentSkinKey.value) || SITE_SKINS[0]
}

/** 抽屉色板的出厂回退值（与 tokens.css 品牌出厂一致；预设缺该色时取用） */
const FALLBACK = {
  primary: '#1677ff',
  success: '#67c23a',
  warning: '#e6a23c',
  danger: '#f56c6c',
  border: '#d8dde5',
  page: '#f4f6fa'
}

/** 抽屉内每行色板：主色/成功/警告/危险/描边/页面底（取自皮肤 theme.colors/cssVars，缺省回退出厂） */
export function swatchesOf(skin: SkinPreset) {
  const c = skin.theme.colors || {}
  const v = skin.theme.cssVars || {}
  return [
    { key: '主色', value: c.primary || FALLBACK.primary },
    { key: '成功', value: c.success || FALLBACK.success },
    { key: '警告', value: c.warning || FALLBACK.warning },
    { key: '危险', value: c.danger || FALLBACK.danger },
    { key: '描边', value: v['--wd-border-color'] || FALLBACK.border },
    { key: '页面底', value: v['--wd-bg-color-page'] || FALLBACK.page }
  ]
}

/**
 * 应用系统预设皮肤到全站（theme.skin 一键套用）。
 * setGlobalConfig 为深合并（不丢 request.urlPrefix 等既有配置），
 * 且内部 applyTheme 整体重写 :root 主题块；default 清空注入回落出厂。
 */
export function applySkin(key: string): void {
  currentSkinKey.value = key
  setGlobalConfig({ theme: { skin: key as SkinName } })
}

/**
 * 示例页「恢复现场」专用：清掉本页 demo 的全部临时覆盖，但保住站点基础配置与全站皮肤。
 * 裸 resetConfig() 会连 urlPrefix/pageSize/theme.skin 一起清回出厂（跨页换肤被还原的根因），
 * 因此这里重置后必须补回 siteBaseConfig，并按 currentSkinKey 补回全站皮肤（default 为空皮肤无需补）。
 * 之后调用方若还有本页特有的 componentDefault 等补设，自行再 setGlobalConfig 追加。
 */
export function restoreSiteConfig(): void {
  resetConfig()
  setGlobalConfig(siteBaseConfig)
  if (currentSkinKey.value !== 'default') {
    setGlobalConfig({ theme: { skin: currentSkinKey.value as SkinName } })
  }
}

/** 生成该皮肤的接入演示代码（custom-skin 示例页「全站换肤演示」右侧展示） */
export function skinCodeOf(key: string): string {
  const skin = getSkinPreset(key)
  if (!skin || key === 'default') {
    return `// 默认皮肤：无需任何配置，回落 tokens.css 出厂令牌\ncreateApp(App).use(WorkDesktop)`
  }
  return `// ${skin.label}：${skin.desc}\ncreateApp(App).use(WorkDesktop, {\n  theme: { skin: '${key}' }\n})`
}
