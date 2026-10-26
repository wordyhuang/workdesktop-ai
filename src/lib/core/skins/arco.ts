import type { SkinPreset } from './types'

/** 字节：Arco Design 风格（Arcoblue 主色 #165dff，白字对比度 ≈5.14 达 WCAG AA；灰阶按 AA 压深，官方 #86909c 仅 ≈3.2） */
export const arcoSkin: SkinPreset = {
  key: 'arco',
  label: '字节',
  desc: 'Arco Design 字节风：Arcoblue 蓝 + 字节灰阶 + 2px 小圆角 + 白卡细边浅灰底',
  theme: {
    colors: {
      primary: '#165dff',
      success: '#00b42a',
      warning: '#ff7d00',
      danger: '#f53f3f',
      info: '#86909c'
    },
    cssVars: {
      '--wd-bg-color-page': '#f7f8fa',
      '--wd-text-color-primary': '#1d2129',
      '--wd-text-color-regular': '#272e3b',
      '--wd-text-color-secondary': '#5c6b7a',
      '--wd-text-color-placeholder': '#65707f',
      '--wd-border-color': '#e5e6eb',
      '--wd-border-color-light': '#f2f3f5',
      // 小圆角是 Arco 识别特征：按钮/控件 2px（卡片按 Arco 惯例 4px，见组件级）
      '--wd-radius-base': '2px',
      '--wd-radius-small': '2px',
      // 组件级：白卡 + 1px 灰细边 + 极轻阴影，标识条归零纯文字标题
      '--wd-panel-radius': '4px',
      '--wd-panel-border-color': '#e5e6eb',
      '--wd-panel-shadow-sm': '0 1px 2px rgba(29, 33, 41, 0.06)',
      '--wd-panel-title-bar-width': '0',
      '--wd-datagrid-radius': '4px',
      '--wd-datagrid-border-color': '#e5e6eb',
      '--wd-editable-grid-border-color': '#e5e6eb'
    }
  },
  cssRules: `
/* 主按钮：Arco 悬停变浅（light-3）、按下更深（dark-2），与苹果相反；色阶由主色推导随用户覆盖联动 */
.el-button--primary {
  --el-button-hover-bg-color: var(--el-color-primary-light-3);
  --el-button-hover-border-color: var(--el-color-primary-light-3);
  --el-button-active-bg-color: var(--el-color-primary-dark-2);
  --el-button-active-border-color: var(--el-color-primary-dark-2);
}
/* 默认按钮（Arco secondary）：灰底无边框，hover 加深一级灰（:not 排除语义色与 text/link 形态） */
.el-button:not([class*='el-button--']):not(.is-text):not(.is-link) {
  --el-button-bg-color: #f2f3f5;
  --el-button-border-color: transparent;
  --el-button-text-color: #1d2129;
  --el-button-hover-bg-color: #e5e6eb;
  --el-button-hover-border-color: transparent;
  --el-button-hover-text-color: #1d2129;
}
/* primary 标签：Arco 浅蓝底蓝字无边框（常态标签，非实心徽章；底色取主色 light-9 随覆盖联动） */
.el-tag.el-tag--primary {
  --el-tag-bg-color: var(--el-color-primary-light-9);
  --el-tag-border-color: transparent;
  --el-tag-text-color: var(--el-color-primary);
}
/* 菜单变量限定 Station 作用域（EP 在 .el-menu 元素规则上声明，:root 注入会被盖住）：
   hover 浅灰，选中浅蓝底蓝字、无左侧标识条 */
.wd-station__menu,
.wd-station__top-menu .el-menu {
  --el-menu-hover-bg-color: #f2f3f5;
}
.wd-station__menu .el-menu-item.is-active {
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  font-weight: 500;
}
.wd-station__menu .el-sub-menu.is-active > .el-sub-menu__title {
  color: var(--el-color-primary);
}
/* 表格：Arco 表头浅灰底 + 中灰字 + 灰细边（EP 在 .el-table 元素规则上声明，须同选择器级覆盖） */
.el-table {
  --el-table-header-bg-color: #f7f8fa;
  --el-table-header-text-color: #4e5969;
  --el-table-border-color: #e5e6eb;
  --el-table-row-hover-bg-color: #f2f3f5;
}
`
}
