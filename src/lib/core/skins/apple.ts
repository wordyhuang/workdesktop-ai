import type { SkinPreset } from './types'

/** 苹果：iOS/macOS 浅色风（主色 #006ee6 为 iOS 蓝 #007aff 加深版，白字对比度 ≈4.8 达 WCAG AA） */
export const appleSkin: SkinPreset = {
  key: 'apple',
  label: '苹果',
  desc: 'iOS/macOS 浅色风：苹果蓝 + 灰白底白卡大圆角 + 胶囊控件 + 蓝底白字菜单 + 毛玻璃顶栏',
  theme: {
    colors: {
      primary: '#006ee6',
      success: '#34c759',
      warning: '#ff9500',
      danger: '#ff3b30',
      info: '#8e8e93'
    },
    cssVars: {
      '--wd-bg-color-page': '#f5f5f7',
      '--wd-text-color-primary': '#1d1d1f',
      '--wd-text-color-regular': '#3a3a3c',
      '--wd-text-color-secondary': '#6e6e73',
      '--wd-text-color-placeholder': '#aeaeb2',
      '--wd-border-color': '#d2d2d7',
      '--wd-border-color-light': '#e5e5ea',
      '--wd-radius-base': '10px',
      '--wd-radius-small': '6px',
      // 组件级：白卡大圆角 + 苹果柔影（弱化边框、阴影分层），标识条归零
      '--wd-panel-radius': '16px',
      '--wd-panel-border-color': '#e5e5ea',
      '--wd-panel-shadow-sm': '0 2px 4px rgba(0, 0, 0, 0.04), 0 12px 32px rgba(0, 0, 0, 0.08)',
      '--wd-panel-title-bar-width': '0',
      '--wd-datagrid-radius': '16px',
      // 导航区：侧栏纯白，顶栏半透明（毛玻璃见 cssRules）
      '--wd-station-aside-bg': '#ffffff',
      '--wd-station-header-bg': 'rgba(251, 251, 253, 0.72)',
      // 菜单 hover 浅灰底（选中态为蓝色实心，见 cssRules）
      '--el-menu-hover-bg-color': 'rgba(0, 0, 0, 0.04)',
      // 表格表头灰色小字（iOS 列表区隔感）
      '--el-table-header-text-color': '#6e6e73'
    }
  },
  cssRules: `
/* 胶囊按钮：苹果标志性 pill 形态；按钮组回落直角相连、两端胶囊 */
.el-button { border-radius: 999px; }
.el-button-group .el-button { border-radius: 0; }
.el-button-group .el-button:first-child { border-radius: 999px 0 0 999px; }
.el-button-group .el-button:last-child { border-radius: 0 999px 999px 0; }
/* 主按钮 hover/active 加深（苹果惯例悬停变深；dark-2 由主色推导随用户覆盖联动） */
.el-button--primary {
  --el-button-hover-bg-color: var(--el-color-primary-dark-2);
  --el-button-hover-border-color: var(--el-color-primary-dark-2);
  --el-button-active-bg-color: var(--el-color-primary-dark-2);
  --el-button-active-border-color: var(--el-color-primary-dark-2);
}
/* 默认按钮：iOS 浅灰底 + 无边框 + 近黑字（:not 排除语义色与 text/link 形态） */
.el-button:not([class*='el-button--']):not(.is-text):not(.is-link) {
  --el-button-bg-color: #e8e8ed;
  --el-button-border-color: transparent;
  --el-button-text-color: #1d1d1f;
  --el-button-hover-bg-color: #dedee3;
  --el-button-hover-border-color: transparent;
  --el-button-hover-text-color: #1d1d1f;
}
/* 标签：胶囊徽章；primary 实心蓝白字（iOS 徽章惯例；success 等语义标签仅胶囊化） */
.el-tag { border-radius: 999px; }
.el-tag.el-tag--primary {
  --el-tag-bg-color: var(--el-color-primary);
  --el-tag-border-color: transparent;
  --el-tag-text-color: #fff;
}
/* info 标签：白底灰边中性胶囊 */
.el-tag.el-tag--info {
  --el-tag-bg-color: #fff;
  --el-tag-border-color: var(--el-border-color);
  --el-tag-text-color: var(--el-text-color-regular);
}
/* 输入框聚焦：iOS 主色描边 + 同色光晕（color-mix 随主色覆盖联动；不支持时回落整组规则前的 EP 默认描边） */
.el-input__wrapper.is-focus {
  box-shadow: 0 0 0 1px var(--el-color-primary) inset, 0 0 0 4px color-mix(in srgb, var(--el-color-primary) 12%, transparent);
}
/* 顶栏毛玻璃：macOS 标志特性（配合半透明 --wd-station-header-bg） */
.wd-station__header {
  backdrop-filter: saturate(180%) blur(16px);
  -webkit-backdrop-filter: saturate(180%) blur(16px);
}
/* 侧栏菜单：iOS 蓝色实心选中态（蓝底白字加粗），hover 浅灰由 --el-menu-hover-bg-color 控制 */
.wd-station__menu .el-menu-item,
.wd-station__menu .el-sub-menu__title {
  margin: 2px 8px;
  border-radius: 8px;
}
.wd-station__menu .el-menu-item.is-active {
  background: var(--el-color-primary);
  color: #fff;
  font-weight: 600;
}
.wd-station__menu .el-menu-item.is-active:hover {
  background: var(--el-color-primary-dark-2);
}
`
}
