import type { SkinPreset } from './types'

/**
 * 蚂蚁：Ant Design 5.x 风格（官方 Seed Token 主色 colorPrimary #1677ff，与品牌主色一致；
 * 侧栏走 Ant Design Pro 招牌暗蓝 #001529 + 主色实心选中；灰阶按 AA 压深，官方 colorTextQuaternary 0.25 黑仅 ≈1.9，placeholder 压至 #707070 ≈4.95）
 */
export const antdSkin: SkinPreset = {
  key: 'antd',
  label: '蚂蚁',
  desc: 'Ant Design 蚂蚁风：暗蓝侧栏 #001529 + 主色实心选中 + Ant 蓝 + 暖黑灰阶 + 白卡浅灰底',
  theme: {
    colors: {
      primary: '#1677ff',
      success: '#52c41a',
      warning: '#faad14',
      danger: '#ff4d4f',
      info: '#1677ff'
    },
    cssVars: {
      // 暖黑灰阶：页面底 colorBgLayout #f0f2f5（Ant 官网实际布局底色）、正文 rgba(0,0,0,0.88) 近似 #1f1f1f；
      // secondary rgba(0,0,0,0.65) ≈ #595959 达 6.2:1，placeholder 官方 0.25 黑太浅压至 #707070 ≈4.95:1
      '--wd-bg-color-page': '#f0f2f5',
      '--wd-text-color-primary': '#1f1f1f',
      '--wd-text-color-regular': '#404040',
      '--wd-text-color-secondary': '#595959',
      '--wd-text-color-placeholder': '#707070',
      // 边框：colorBorder #d9d9d9、colorBorderSecondary #f0f0f0（比默认冷灰更实、更暖）
      '--wd-border-color': '#d9d9d9',
      '--wd-border-color-light': '#f0f0f0',
      // Ant 圆角：基础 6px（Seed borderRadius，经 --el-border-radius-base 映射传导 EP 按钮/控件）
      '--wd-radius-base': '6px',
      '--wd-radius-small': '4px',
      // 组件级：白卡 8px 大圆角（borderRadiusLG）+ colorBorderSecondary 细边 + Ant 官方三段式轻影，标识条归零
      '--wd-panel-radius': '8px',
      '--wd-panel-border-color': '#f0f0f0',
      '--wd-panel-shadow-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
      '--wd-panel-title-bar-width': '0',
      '--wd-datagrid-radius': '8px',
      '--wd-datagrid-border-color': '#f0f0f0',
      '--wd-editable-grid-border-color': '#f0f0f0',
      // 导航区：Ant Design Pro 招牌暗蓝侧栏（#001529），内容区白卡浅灰底衬托
      '--wd-station-aside-bg': '#001529'
    }
  },
  cssRules: `
/* 主按钮：Ant 悬停变浅（colorPrimaryHover #4096ff ≈ light-5）、按下更深（colorPrimaryActive #0958d9 ≈ dark-2）；色阶由主色推导随用户覆盖联动 */
.el-button--primary {
  --el-button-hover-bg-color: var(--el-color-primary-light-5);
  --el-button-hover-border-color: var(--el-color-primary-light-5);
  --el-button-active-bg-color: var(--el-color-primary-dark-2);
  --el-button-active-border-color: var(--el-color-primary-dark-2);
}
/* 默认按钮（Ant default）：白底灰边近黑字，hover 边框/文字变主色（:not 排除语义色与 text/link 形态） */
.el-button:not([class*='el-button--']):not(.is-text):not(.is-link) {
  --el-button-bg-color: #fff;
  --el-button-border-color: #d9d9d9;
  --el-button-text-color: #1f1f1f;
  --el-button-hover-bg-color: #fff;
  --el-button-hover-border-color: var(--el-color-primary);
  --el-button-hover-text-color: var(--el-color-primary);
}
/* primary 标签：Ant 浅蓝底蓝字无边框（常态标签，底色取主色 light-9 随覆盖联动） */
.el-tag.el-tag--primary {
  --el-tag-bg-color: var(--el-color-primary-light-9);
  --el-tag-border-color: transparent;
  --el-tag-text-color: var(--el-color-primary);
}
/* 顶栏菜单：Ant 5 浅色——hover 浅灰，选中浅蓝底蓝字（作用域限定 Station，防 :root 注入被 EP 元素规则盖住） */
.wd-station__top-menu .el-menu {
  --el-menu-hover-bg-color: #f5f5f5;
}
.wd-station__top-menu .el-menu-item.is-active {
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  font-weight: 500;
}
/* 侧栏菜单：Ant Design Pro 招牌暗蓝——#001529 底 + 浅灰字（0.65 白对暗蓝 ≈12:1 达 AA）+ hover 提亮 + 选中主色实心白字 */
.wd-station .wd-station__aside {
  border-right: none;
}
.wd-station__aside .wd-station__logo-title {
  color: #fff;
}
.wd-station__menu {
  --el-menu-bg-color: transparent;
  --el-menu-text-color: rgba(255, 255, 255, 0.65);
  --el-menu-icon-color: rgba(255, 255, 255, 0.65);
  --el-menu-hover-text-color: #fff;
  --el-menu-hover-bg-color: rgba(255, 255, 255, 0.08);
  --el-menu-active-text-color: #fff;
  --wd-station-menu-group-color: rgba(255, 255, 255, 0.45);
}
.wd-station__menu .el-menu-item.is-active {
  background: var(--el-color-primary);
  color: #fff;
  font-weight: 500;
}
.wd-station__menu .el-menu-item.is-active:hover {
  background: var(--el-color-primary-dark-2);
}
.wd-station__menu .el-sub-menu.is-active > .el-sub-menu__title {
  color: #fff;
}
/* 表格：Ant 表头 colorFillAlter 灰底 + 中灰字 + colorBorderSecondary 细边（EP 在 .el-table 元素规则上声明，须同选择器级覆盖） */
.el-table {
  --el-table-header-bg-color: #fafafa;
  --el-table-header-text-color: #595959;
  --el-table-border-color: #f0f0f0;
  --el-table-row-hover-bg-color: #fafafa;
}
`
}
