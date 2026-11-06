import type { SkinPreset } from './types'

/**
 * Soft UI：Creative Tim Soft UI Dashboard 风格（官方色板主色品红 #cb0c9f 白字 ≈5.1 达 AA；
 * 招牌蓝灰黑文字 #344767、白卡大圆角 + 柔影 0 20px 27px 0 rgba(0,0,0,.05)、白侧栏 +
 * 品紫渐变胶囊选中 linear-gradient(310deg,#cb0c9f,#7928ca)；placeholder 官方 0.6 透明
 * ≈#868c97 仅 ≈3.5 不达标，压深至 #66708a ≈4.8）
 */
export const softSkin: SkinPreset = {
  key: 'soft',
  label: 'Soft UI',
  desc: 'Soft UI 柔和拟物风：品红主色 + 蓝灰黑文字 + 白卡大圆角柔影 + 品紫渐变胶囊选中 + 胶囊徽章',
  theme: {
    colors: {
      primary: '#cb0c9f',
      success: '#82d616',
      warning: '#fbcf33',
      danger: '#ea0606',
      info: '#17c1e8'
    },
    cssVars: {
      // 蓝灰黑文字体系：官方 text-primary #344767（Soft UI 招牌）、text-secondary #67748e 达 4.7:1；
      // placeholder 官方 0.6 透明太浅压至 #66708a ≈4.8:1
      '--wd-bg-color-page': '#f4f6fa',
      '--wd-text-color-primary': '#344767',
      '--wd-text-color-regular': '#425475',
      '--wd-text-color-secondary': '#67748e',
      '--wd-text-color-placeholder': '#66708a',
      // 蓝灰调边框（区别于 Ant 暖灰 / 字节冷灰）
      '--wd-border-color': '#d5dbe3',
      '--wd-border-color-light': '#e9edf3',
      // Soft UI 大圆角：控件 8px（经 --el-border-radius-base 映射传导 EP 按钮/控件）
      '--wd-radius-base': '8px',
      '--wd-radius-small': '6px',
      // 组件级：白卡 12px 大圆角 + Soft UI 招牌柔影 + 浅边，标识条归零
      '--wd-panel-radius': '12px',
      '--wd-panel-border-color': '#e9edf3',
      '--wd-panel-shadow-sm': '0 20px 27px 0 rgba(0, 0, 0, 0.05)',
      '--wd-panel-title-bar-width': '0',
      '--wd-datagrid-radius': '12px',
      '--wd-datagrid-border-color': '#e9edf3',
      '--wd-editable-grid-border-color': '#e9edf3',
      // 导航区：Soft UI 官方 sidenav 纯白侧栏（选中态为品紫渐变胶囊，见 cssRules）
      '--wd-station-aside-bg': '#ffffff',
      // Station tabs 滑块样式（tabsStyle=slider）：品红激活色 + 浅品红激活底，与 Soft 品红主色一体
      '--wd-station-tabs-active-color': '#cb0c9f',
      '--wd-station-tabs-active-bg': '#fbeaf9'
    }
  },
  cssRules: `
/* 主按钮：Soft UI 官方 hover 变深（#ad0a87 ≈ dark-2 档）+ 招牌品色柔影；色阶由主色推导随用户覆盖联动 */
.el-button--primary {
  --el-button-hover-bg-color: var(--el-color-primary-dark-2);
  --el-button-hover-border-color: var(--el-color-primary-dark-2);
  --el-button-active-bg-color: var(--el-color-primary-dark-2);
  --el-button-active-border-color: var(--el-color-primary-dark-2);
  box-shadow: 0 4px 6px -1px rgba(203, 12, 159, 0.2), 0 2px 4px -1px rgba(203, 12, 159, 0.06);
}
/* 默认按钮：白底 + 蓝灰描边 + 蓝灰黑字，hover 边框/文字变主色（:not 排除语义色与 text/link 形态） */
.el-button:not([class*='el-button--']):not(.is-text):not(.is-link) {
  --el-button-bg-color: #fff;
  --el-button-border-color: #d5dbe3;
  --el-button-text-color: #344767;
  --el-button-hover-bg-color: #fff;
  --el-button-hover-border-color: var(--el-color-primary);
  --el-button-hover-text-color: var(--el-color-primary);
}
/* 徽章胶囊化（Soft UI pill 徽标）；primary 浅品底品字无边框（底色取 light-9 随覆盖联动） */
.el-tag {
  border-radius: 999px;
}
.el-tag.el-tag--primary {
  --el-tag-bg-color: var(--el-color-primary-light-9);
  --el-tag-border-color: transparent;
  --el-tag-text-color: var(--el-color-primary);
}
/* 输入框聚焦：主色描边 + 柔光晕（color-mix 随主色覆盖联动），柔和焦点态 */
.el-input__wrapper.is-focus {
  box-shadow: 0 0 0 1px var(--el-color-primary) inset, 0 0 0 4px color-mix(in srgb, var(--el-color-primary) 12%, transparent);
}
/* 顶栏菜单：浅色——hover 浅灰，选中浅品底品字（作用域限定 Station，防 :root 注入被 EP 元素规则盖住） */
.wd-station__top-menu .el-menu {
  --el-menu-hover-bg-color: #f8f9fa;
}
.wd-station__top-menu .el-menu-item.is-active {
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  font-weight: 500;
}
/* 白侧栏：Soft UI 官方 sidenav 无边框浮起（scoped 特异性需 .wd-station 前缀压过属性选择器） */
.wd-station .wd-station__aside {
  border-right: none;
}
/* 侧栏菜单：蓝灰黑字 + 浅品 hover 晕染 + 菜单项圆角化营造胶囊（变量须同选择器级覆盖） */
.wd-station__menu {
  --el-menu-bg-color: transparent;
  --el-menu-text-color: #344767;
  --el-menu-icon-color: #344767;
  --el-menu-hover-text-color: #344767;
  --el-menu-hover-bg-color: rgba(203, 12, 159, 0.06);
  --el-menu-active-text-color: #fff;
}
.wd-station__menu .el-menu-item {
  margin: 2px 8px;
  border-radius: 8px;
}
.wd-station__menu .el-sub-menu__title {
  margin: 2px 8px;
  border-radius: 8px;
}
/* 选中态：Soft UI 招牌品紫渐变胶囊白字 */
.wd-station__menu .el-menu-item.is-active {
  background: linear-gradient(310deg, #cb0c9f, #7928ca);
  color: #fff;
  font-weight: 600;
}
.wd-station__menu .el-sub-menu.is-active > .el-sub-menu__title {
  color: var(--el-color-primary);
}
/* 表格：表头浅灰底 + 蓝灰黑字 + 浅边（EP 在 .el-table 元素规则上声明，须同选择器级覆盖） */
.el-table {
  --el-table-header-bg-color: #f8f9fa;
  --el-table-header-text-color: #344767;
  --el-table-border-color: #e9edf3;
  --el-table-row-hover-bg-color: #f8f9fa;
}
`
}
