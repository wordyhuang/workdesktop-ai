import type { SkinPreset } from './types'

/** 扁平：经典扁平配色，零圆角零层次（主色加深至 #2470a8，白字按钮对比度 ≈5.3:1 达 WCAG AA） */
export const flatSkin: SkinPreset = {
  key: 'flat',
  label: '扁平',
  desc: '经典扁平配色零圆角，轻量直给',
  theme: {
    colors: {
      primary: '#2470a8',
      success: '#2ecc71',
      warning: '#f39c12',
      danger: '#e74c3c',
      info: '#95a5a6'
    },
    cssVars: {
      '--wd-bg-color-page': '#f2f4f6',
      '--wd-border-color': '#dfe4ea',
      '--wd-border-color-light': '#e8ecf1',
      '--wd-radius-base': '0px',
      '--wd-radius-small': '0px'
    }
  }
}
