import type { SkinPreset } from './types'

/** 赛博朋克：暗夜紫霓，品红主色 + 青光辅色 + 2px 硬边纯直角（深色皮肤，含 El 深色联动） */
export const cyberpunkSkin: SkinPreset = {
  key: 'cyberpunk',
  label: '赛博朋克',
  desc: '暗夜紫霓品红硬朗直角，适合大屏 / 潮玩类产品',
  theme: {
    colors: {
      primary: '#d946ef',
      success: '#00ffa3',
      warning: '#ffd600',
      danger: '#ff2a6d',
      info: '#8b7ec8'
    },
    cssVars: {
      '--wd-bg-color': '#120e24',
      '--wd-bg-color-page': '#0a0714',
      '--wd-bg-color-overlay': '#1c1535',
      '--wd-text-color-primary': '#f3e8ff',
      '--wd-text-color-regular': '#c9b8e8',
      '--wd-text-color-secondary': '#9d8cc7',
      '--wd-text-color-placeholder': '#6b5b94',
      '--wd-border-color': '#2d2152',
      '--wd-border-color-light': '#251a46',
      '--wd-border-width': '2px',
      '--wd-radius-base': '0px',
      '--wd-radius-small': '0px',
      '--wd-spacing-base': '10px',
      '--wd-spacing-large': '14px',
      // 组件级：面板 / 表格暗夜紫玻璃底 + 品红霓虹描边辉光，青品渐变标识条撞色，导航区压黑
      '--wd-panel-bg': '#150f2a',
      '--wd-panel-border-color': 'rgba(217, 70, 239, 0.4)',
      '--wd-panel-header-bg': 'rgba(217, 70, 239, 0.08)',
      '--wd-panel-title-color': '#e879f9',
      '--wd-panel-shadow-sm': '0 0 18px rgba(217, 70, 239, 0.16)',
      '--wd-panel-shadow-md': '0 0 28px rgba(217, 70, 239, 0.28)',
      '--wd-panel-title-bar-bg': 'linear-gradient(180deg, #00e5ff, #d946ef)',
      '--wd-datagrid-bg': '#150f2a',
      '--wd-datagrid-border-color': 'rgba(217, 70, 239, 0.4)',
      '--wd-editable-grid-bg': '#150f2a',
      '--wd-editable-grid-border-color': 'rgba(217, 70, 239, 0.4)',
      '--wd-search-bg': '#150f2a',
      '--wd-form-footer-bg': 'rgba(217, 70, 239, 0.05)',
      '--wd-station-aside-bg': '#070412',
      '--wd-station-header-bg': '#070412',
      '--wd-station-tabs-bg': '#070412',
      // 背景素材（纯 CSS 生成零外部资源）：内容容器贴青色 HUD 网格（呼应参考图青辅色连接线），导航区贴品红扫描线（CRT 屏幕感）；低透明度不影响可读性
      '--wd-panel-bg-image': 'repeating-linear-gradient(0deg, rgba(0, 229, 255, 0.05) 0 1px, transparent 1px 24px), repeating-linear-gradient(90deg, rgba(0, 229, 255, 0.05) 0 1px, transparent 1px 24px)',
      '--wd-datagrid-bg-image': 'repeating-linear-gradient(0deg, rgba(0, 229, 255, 0.05) 0 1px, transparent 1px 24px), repeating-linear-gradient(90deg, rgba(0, 229, 255, 0.05) 0 1px, transparent 1px 24px)',
      '--wd-editable-grid-bg-image': 'repeating-linear-gradient(0deg, rgba(0, 229, 255, 0.05) 0 1px, transparent 1px 24px), repeating-linear-gradient(90deg, rgba(0, 229, 255, 0.05) 0 1px, transparent 1px 24px)',
      '--wd-search-bg-image': 'repeating-linear-gradient(0deg, rgba(0, 229, 255, 0.05) 0 1px, transparent 1px 24px), repeating-linear-gradient(90deg, rgba(0, 229, 255, 0.05) 0 1px, transparent 1px 24px)',
      '--wd-station-aside-bg-image': 'repeating-linear-gradient(0deg, rgba(217, 70, 239, 0.06) 0 1px, transparent 1px 4px)',
      '--wd-station-header-bg-image': 'repeating-linear-gradient(0deg, rgba(217, 70, 239, 0.06) 0 1px, transparent 1px 4px)',
      '--wd-station-tabs-bg-image': 'repeating-linear-gradient(0deg, rgba(217, 70, 239, 0.06) 0 1px, transparent 1px 4px)',
      // 菜单深色联动：底色贴合导航区压黑；EP 默认 hover 底为主色 light-9（浅粉），紫黑底下会糊成浅色亮块反白，改为品红同源深透底
      '--el-menu-bg-color': '#070412',
      '--el-menu-hover-bg-color': 'rgba(217, 70, 239, 0.14)',
      '--el-menu-item-hover-fill': 'rgba(217, 70, 239, 0.14)',
      // ElementPlus 深色联动（填充 / 遮罩 / 阴影 / 按钮文字色）
      '--el-fill-color-blank': '#120e24',
      '--el-fill-color': '#221740',
      '--el-fill-color-light': '#241a44',
      '--el-fill-color-lighter': '#281c4a',
      '--el-fill-color-extra-light': '#181231',
      '--el-fill-color-dark': '#2d2154',
      '--el-fill-color-darker': '#32255e',
      // 仅作按钮文字色（EP 深色皮肤标准做法）；注意 EP 内凡以 --el-color-white 作背景的场景会同步变深，实测无异常，改动需回归
      '--el-color-white': '#2a0a33',
      '--el-mask-color': 'rgba(10, 5, 24, 0.7)',
      '--el-box-shadow': '0 4px 16px rgba(0, 0, 0, 0.5)',
      '--el-box-shadow-light': '0 2px 8px rgba(0, 0, 0, 0.4)'
    }
  },
  // 皮肤专属 CSS 规则：品红渐变主按钮 + 紫光外发光 + ghost 默认按钮 + 霓虹 primary 标签
  // （EP 变量只能纯色填充，渐变/外发光必须 rule 级覆盖；发光色与面板描边 rgba(217,70,239) 同源）
  cssRules: `
/* 主按钮：品红→紫罗兰渐变 + 紫光外发光（渐变起点跟随 --el-color-primary，用户覆盖主色可联动） */
.el-button--primary {
  background-image: linear-gradient(135deg, var(--el-color-primary), #ad6bf5);
  --el-button-border-color: transparent;
  --el-button-hover-border-color: transparent;
  box-shadow: 0 0 14px rgba(217, 70, 239, 0.45);
}
.el-button--primary:hover {
  background-image: linear-gradient(135deg, var(--el-color-primary-light-3), #b07dfa);
  box-shadow: 0 0 22px rgba(217, 70, 239, 0.6);
}
.el-button--primary.is-disabled,
.el-button--primary.is-disabled:hover {
  background-image: none;
  box-shadow: none;
}
/* 默认按钮：ghost 紫（深紫底 + 紫描边 + 亮紫字）；:not 排除语义色按钮与 text/link 形态 */
.el-button:not([class*='el-button--']):not(.is-text):not(.is-link) {
  --el-button-bg-color: rgba(217, 70, 239, 0.1);
  --el-button-border-color: rgba(217, 70, 239, 0.45);
  --el-button-text-color: #e9d5ff;
  --el-button-hover-bg-color: rgba(217, 70, 239, 0.22);
  --el-button-hover-border-color: rgba(232, 121, 249, 0.7);
  --el-button-hover-text-color: #f5e8ff;
}
/* primary 标签：深紫底 + 亮紫字（success 等语义标签不动） */
.el-tag.el-tag--primary {
  --el-tag-bg-color: rgba(217, 70, 239, 0.16);
  --el-tag-border-color: rgba(217, 70, 239, 0.38);
  --el-tag-text-color: #e9d5ff;
  --el-tag-hover-color: #e879f9;
}
/* 菜单选中项：品红 tint 底 + 左侧 2px 霓虹条（仅垂直菜单，横向菜单走 EP 底部指示条） */
.el-menu--vertical .el-menu-item.is-active {
  background-color: rgba(217, 70, 239, 0.14);
  box-shadow: inset 2px 0 0 var(--el-color-primary);
}
`
}
