/**
 * 文档站：站点级主题皮肤（跨页面单例）
 * 切换 = 在 :root(html) 内联覆盖 --wd-* 令牌；theme.css 中 --el-* 惰性引用 --wd-*，
 * 因此 ElementPlus 组件随令牌全站联动。默认皮肤会清空全部注入，回到 tokens.css 出厂值。
 */
import { ref } from 'vue'

export interface SiteSkin {
  key: string
  label: string
  desc: string
  /** 相对默认令牌的覆盖项（--wd-*） */
  overrides: Record<string, string>
}

/** 皮肤样本：抽屉内色板与代码展示的回退默认值（与 tokens.css 品牌出厂值一致） */
export const TOKEN_DEFAULTS: Record<string, string> = {
  '--wd-color-primary': '#1677ff',
  '--wd-color-success': '#67c23a',
  '--wd-color-warning': '#e6a23c',
  '--wd-color-danger': '#f56c6c',
  '--wd-border-color': '#d8dde5',
  '--wd-bg-color-page': '#f4f6fa'
}

/** 注入时与 --wd-* 一起写入 :root 的 El 变量键（Element 侧不再需要显式设置，见 theme.css 惰性引用） */
export const WD_TO_EL: Record<string, string> = {
  '--wd-color-primary': '--el-color-primary',
  '--wd-color-success': '--el-color-success',
  '--wd-color-warning': '--el-color-warning',
  '--wd-color-danger': '--el-color-danger'
}

/** 皮肤样式库（默认 + 6 组示例） */
export const SITE_SKINS: SiteSkin[] = [
  {
    key: 'default',
    label: '默认 · 品牌蓝',
    desc: 'WorkDesktop 品牌蓝，源自产品 Logo 的 V 形主色',
    overrides: {}
  },
  {
    key: 'jade',
    label: '翡翠绿',
    desc: '清新生长感，适合健康 / 金融类后台',
    overrides: {
      '--wd-color-primary': '#12a866',
      '--wd-color-success': '#12a866',
      '--wd-bg-color-page': '#edf7f1',
      '--wd-border-color': '#a8d6ba',
      '--wd-border-color-light': '#cbe7d5'
    }
  },
  {
    key: 'indigo',
    label: '星空靛',
    desc: '沉静科技感，适合数据 / 研发类后台',
    overrides: {
      '--wd-color-primary': '#5b5bd6',
      '--wd-color-success': '#1f9d71',
      '--wd-color-warning': '#d6a52e',
      '--wd-color-danger': '#e5484d',
      '--wd-bg-color-page': '#eef0fb',
      '--wd-border-color': '#c3c0ee',
      '--wd-border-color-light': '#d9d6f5'
    }
  },
  {
    key: 'sunset',
    label: '暖阳橙',
    desc: '亲和活力感，适合电商 / 运营类后台',
    overrides: {
      '--wd-color-primary': '#e0702a',
      '--wd-color-success': '#4a9b5b',
      '--wd-color-warning': '#d99a1e',
      '--wd-color-danger': '#d64545',
      '--wd-bg-color-page': '#fbf2e8',
      '--wd-border-color': '#eccdb2',
      '--wd-border-color-light': '#f4e0ca'
    }
  },
  {
    key: 'rose',
    label: '蔷薇粉',
    desc: '温柔精致感，适合美妆 / 会员类后台',
    overrides: {
      '--wd-color-primary': '#cf4777',
      '--wd-color-success': '#40966a',
      '--wd-color-warning': '#d19a2a',
      '--wd-color-danger': '#c2404e',
      '--wd-bg-color-page': '#fbf0f4',
      '--wd-border-color': '#ebc3cf',
      '--wd-border-color-light': '#f3d6de'
    }
  },
  {
    key: 'ocean',
    label: '海洋青',
    desc: '冷静通透感，适合物流 / 服务类后台',
    overrides: {
      '--wd-color-primary': '#0e8ca3',
      '--wd-color-success': '#2b9d78',
      '--wd-color-warning': '#d69a20',
      '--wd-color-danger': '#d94646',
      '--wd-bg-color-page': '#e8f4f6',
      '--wd-border-color': '#bfe0e5',
      '--wd-border-color-light': '#d2eaee'
    }
  },
  {
    key: 'graphite',
    label: '石墨灰',
    desc: '中性商务感，低调不抢内容',
    overrides: {
      '--wd-color-primary': '#4a5b7d',
      '--wd-color-success': '#4b8a63',
      '--wd-color-warning': '#bf9a3a',
      '--wd-color-danger': '#c04b4b',
      '--wd-bg-color-page': '#eef1f5',
      '--wd-border-color': '#c6cdd7',
      '--wd-border-color-light': '#d5dbe3'
    }
  }
]

/** 抽屉内色板键（含默认回退值） */
const SWATCH_KEYS = [
  { key: '主色', css: '--wd-color-primary' },
  { key: '成功', css: '--wd-color-success' },
  { key: '警告', css: '--wd-color-warning' },
  { key: '危险', css: '--wd-color-danger' },
  { key: '描边', css: '--wd-border-color' },
  { key: '页面底', css: '--wd-bg-color-page' }
]

export function mergedOf(skin: SiteSkin): Record<string, string> {
  return { ...TOKEN_DEFAULTS, ...skin.overrides }
}

/** 抽屉内每行色板 */
export function swatchesOf(skin: SiteSkin) {
  const merged = mergedOf(skin)
  return SWATCH_KEYS.map((s) => ({ key: s.key, value: merged[s.css] }))
}

/** ElementPlus 主色派生色阶键（EP 混色公式：light-N 混白 N/10、dark-2 混黑 20%） */
export const EL_PRIMARY_STEP_KEYS = [
  '--el-color-primary-light-3',
  '--el-color-primary-light-5',
  '--el-color-primary-light-7',
  '--el-color-primary-light-8',
  '--el-color-primary-light-9',
  '--el-color-primary-dark-2'
] as const

/** #rrggbb → [r, g, b]；非法输入回退品牌蓝 */
function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return [0x16, 0x77, 0xff]
  const n = parseInt(m[1], 16)
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff]
}

/** 按 EP 公式把主色与目标色按比例混合，返回 #rrggbb */
function mixWith(hex: string, target: [number, number, number], ratio: number): string {
  const [r, g, b] = hexToRgb(hex)
  const ch = (c: number, t: number) => Math.round(c + (t - c) * ratio)
  const to2 = (v: number) => v.toString(16).padStart(2, '0')
  return `#${to2(ch(r, target[0]))}${to2(ch(g, target[1]))}${to2(ch(b, target[2]))}`
}

/** 由主色推导 El 派生色阶（与 theme.css 品牌出厂值同公式，换肤时保持色阶不断层） */
export function primaryStepsOf(primary: string): Record<string, string> {
  return {
    '--el-color-primary-light-3': mixWith(primary, [255, 255, 255], 0.3),
    '--el-color-primary-light-5': mixWith(primary, [255, 255, 255], 0.5),
    '--el-color-primary-light-7': mixWith(primary, [255, 255, 255], 0.7),
    '--el-color-primary-light-8': mixWith(primary, [255, 255, 255], 0.8),
    '--el-color-primary-light-9': mixWith(primary, [255, 255, 255], 0.9),
    '--el-color-primary-dark-2': mixWith(primary, [0, 0, 0], 0.2)
  }
}

/** 需要清理的注入键全集：所有皮肤可能写入的 --wd-* 与对应 El 镜像键、El 主色色阶 */
const ALL_CSS_KEYS = Array.from(
  new Set(
    SITE_SKINS.flatMap((s) => Object.keys(s.overrides)).concat(
      Object.values(WD_TO_EL),
      [...EL_PRIMARY_STEP_KEYS],
      ['--wd-border-color-light']
    )
  )
)

/* —— 站点级状态（模块单例，路由切换不丢） —— */
export const currentSkinKey = ref('default')

export function activeSkin(): SiteSkin {
  return SITE_SKINS.find((s) => s.key === currentSkinKey.value) || SITE_SKINS[0]
}

/** 生成与注入同源的 :root CSS 片段（复制即可全局生效 / 接入方式演示） */
export function skinCssOf(key: string): string {
  const skin = SITE_SKINS.find((s) => s.key === key) || SITE_SKINS[0]
  const lines = Object.entries(skin.overrides)
  if (!lines.length) return `/* 默认主题：直接使用 tokens.css 内置令牌，无需覆盖 */`
  return `/* ${skin.label}：${skin.desc} */\n:root {\n${lines
    .map(([k, v]) => `  ${k}: ${v};`)
    .join('\n')}\n}`
}

/** 应用皮肤到整个站点（:root）。默认皮肤清空全部注入，恢复出厂样式 */
export function applySkin(key: string): void {
  currentSkinKey.value = key
  const skin = SITE_SKINS.find((s) => s.key === key) || SITE_SKINS[0]
  const root = document.documentElement
  // 先清空全部旧注入（含 El 镜像），再写入本次覆盖
  for (const k of ALL_CSS_KEYS) root.style.removeProperty(k)
  for (const [k, v] of Object.entries(skin.overrides)) root.style.setProperty(k, v)
  // Element 变量由 theme.css 惰性引用 --wd-* 自动联动；此处镜像仅作冗余兜底
  for (const [wd, el] of Object.entries(WD_TO_EL)) {
    if (skin.overrides[wd]) root.style.setProperty(el, skin.overrides[wd])
  }
  // 皮肤自定义主色时，按 EP 公式同步注入派生色阶（默认皮肤不注入，回落 theme.css 品牌色阶）
  const primary = skin.overrides['--wd-color-primary']
  if (primary) {
    for (const [k, v] of Object.entries(primaryStepsOf(primary))) root.style.setProperty(k, v)
  }
}
