import type { SkinPreset } from './types'

/** 党政风：中国红 + 暖米白 + 金色点缀，2px 描边庄重温暖 */
export const governanceSkin: SkinPreset = {
  key: 'governance',
  label: '党政风',
  desc: '中国红暖米白粗描边，适合政务 / 党建类产品',
  theme: {
    colors: {
      primary: '#c7000b',
      success: '#2e7d4f',
      warning: '#c9973f',
      danger: '#a8071a',
      info: '#8b8378'
    },
    cssVars: {
      '--wd-bg-color-page': '#fdf9f3',
      '--wd-text-color-primary': '#33261a',
      '--wd-text-color-regular': '#5c4f3d',
      '--wd-border-color': '#e8d9c4',
      '--wd-border-color-light': '#f2e7d5',
      '--wd-border-width': '2px',
      '--wd-radius-base': '4px',
      '--wd-radius-small': '2px',
      '--wd-spacing-base': '14px',
      '--wd-spacing-large': '18px',
      // 组件级：Panel 红头白字标题栏，面板 / 卡片暖米底
      '--wd-panel-bg': '#fffaf0',
      '--wd-panel-header-bg': '#c7000b',
      '--wd-panel-title-color': '#ffffff',
      '--wd-datagrid-bg': '#fffaf0',
      '--wd-editable-grid-bg': '#fffaf0',
      '--wd-search-bg': '#fffaf0',
      '--wd-form-footer-bg': '#faf2e6'
    }
  }
}
