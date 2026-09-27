import type { SkinPreset } from './types'

/** 商务：藏青边栏框架 + 白卡浅灰内容区 + 商务金点缀，克制的企业级管理后台（参考商务组件总览台） */
export const businessSkin: SkinPreset = {
  key: 'business',
  label: '商务',
  desc: '藏青边栏配白卡浅灰内容区，商务金点缀，适合企业级管理后台',
  theme: {
    colors: {
      primary: '#1e2c4f',
      success: '#2e7d5d',
      warning: '#c9a24b',
      danger: '#b0413e',
      info: '#7a8699'
    },
    cssVars: {
      '--wd-bg-color-page': '#f4f5f7',
      '--wd-text-color-primary': '#1f2d3d',
      '--wd-text-color-regular': '#4e5a6e',
      '--wd-border-color': '#d4dae3',
      '--wd-border-color-light': '#e6e9ef',
      '--wd-radius-base': '6px',
      '--wd-radius-small': '4px',
      // 组件级：白卡 + 金色标题标识条（呼应参考图标题金线点缀），面板轻微浮起
      '--wd-panel-title-bar-bg': '#c9a24b',
      '--wd-panel-shadow-sm': '0 1px 3px rgba(30, 44, 79, 0.06), 0 6px 16px rgba(30, 44, 79, 0.06)',
      // 导航区：侧栏 / 顶栏 / 底栏统一深藏青边栏框架（文字浅化与菜单金色选中见 cssRules）
      '--wd-station-aside-bg': '#1e2c4f',
      '--wd-station-header-bg': '#1e2c4f',
      '--wd-station-footer-bg': '#1e2c4f'
    }
  },
  cssRules: `
/* 表格表头浅灰底（参考图客户列表）：EP 在 .el-table 元素规则上自定义 --el-table-header-bg-color，
   :root 注入会被元素自身规则盖住（自定义属性继承恒弱于元素声明），须同选择器级覆盖 */
.el-table {
  --el-table-header-bg-color: #f7f8fa;
}
/* ===== 藏青边栏框架配套 =====
   混合模式：边栏深藏青、内容区保持白卡浅灰；菜单变量限定 Station 作用域，不影响内容区。
   EP 默认菜单 hover 底为主色 light-9（浅灰蓝），藏青底上会糊成浅色亮块，改半透明白同源 */
.wd-station__menu,
.wd-station__top-menu .el-menu {
  --el-menu-bg-color: transparent;
  --el-menu-text-color: #b8c2d4;
  --el-menu-hover-bg-color: rgba(255, 255, 255, 0.08);
}
/* 侧栏菜单：商务金实心选中态（藏青字加粗，金底藏青字对比度 ≈8:1），与顶栏金下划线呼应 */
.wd-station__menu .el-menu-item,
.wd-station__menu .el-sub-menu__title {
  margin: 2px 8px;
  border-radius: 6px;
}
.wd-station__menu .el-menu-item.is-active {
  background: var(--wd-color-warning);
  color: #1e2c4f;
  font-weight: 600;
}
.wd-station__menu .el-menu-item.is-active:hover {
  background: var(--wd-color-warning);
  color: #1e2c4f;
}
/* 含激活子项的分组标题：藏青主色字在藏青底上不可读，转商务金 */
.wd-station__menu .el-sub-menu.is-active > .el-sub-menu__title {
  color: var(--wd-color-warning);
}
/* 顶栏：文字基色浅化供插槽内容继承，标题纯白，折叠钮 hover 转金，底部分隔线同色淡化。
   Station 样式为 scoped（编译后选择器自带 [data-v] 属性、优先级高一级），
   皮肤规则统一用两级选择器追平优先级，靠 <style data-workdesktop-theme> 后注入胜出 */
.wd-station .wd-station__header {
  color: #e8ecf3;
  border-bottom-color: rgba(255, 255, 255, 0.1);
}
.wd-station__header .wd-station__logo-title,
.wd-station__header .wd-station__header-title {
  color: #ffffff;
}
.wd-station .wd-station__collapse { color: #b8c2d4; }
.wd-station .wd-station__collapse:hover { color: var(--wd-color-warning); }
/* 分导台：未选项浅灰白，激活项商务金文字 + 金色下划线（下划线随 warning 色联动） */
.wd-station__header .wd-station__nav-item { color: #b8c2d4; }
.wd-station__header .wd-station__nav-item:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.08);
}
.wd-station__header .wd-station__nav-item.is-active {
  color: var(--wd-color-warning);
  background: transparent;
  box-shadow: inset 0 -2px 0 var(--wd-color-warning);
}
/* 顶部水平菜单：激活下划线同步商务金 */
.wd-station__top-menu .el-menu--horizontal > .el-menu-item.is-active,
.wd-station__top-menu .el-menu--horizontal > .el-sub-menu.is-active .el-sub-menu__title {
  border-bottom-color: var(--wd-color-warning);
  color: var(--wd-color-warning);
}
/* 侧栏：logo 白字 + 分隔线同色淡化，右边框在藏青底上转透明系 */
.wd-station .wd-station__aside { border-right-color: rgba(255, 255, 255, 0.06); }
.wd-station__aside .wd-station__logo { border-bottom-color: rgba(255, 255, 255, 0.1); }
.wd-station__aside .wd-station__logo-title { color: #ffffff; }
/* 底栏：藏青底文字浅化 + 分隔线同色淡化 */
.wd-station .wd-station__footer {
  border-top-color: rgba(255, 255, 255, 0.1);
  color: #8fa0b8;
}
.wd-station .wd-station__footer-info { color: #b8c2d4; }
/* 分页：当前页藏青方块白字（主色联动，覆盖主色随动） */
.el-pagination .el-pager li.is-active {
  background: var(--el-color-primary);
  color: #fff;
  border-radius: 4px;
}
.el-pagination .el-pager li.is-active:hover {
  background: var(--el-color-primary-dark-2);
}
`
}
