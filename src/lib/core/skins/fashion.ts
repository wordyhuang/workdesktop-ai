import type { SkinPreset } from './types'

/** 时尚：珊瑚橙主色 + 奶油暖底柔光斑，白卡片大圆角 + 深墨导航胶囊，温暖杂志风 SaaS */
export const fashionSkin: SkinPreset = {
  key: 'fashion',
  label: '时尚',
  desc: '珊瑚橙主色与奶油暖底柔光斑，白卡片大圆角，适合 SaaS / 运营 / 电商后台',
  theme: {
    colors: {
      // 珊瑚橙加深至 #cd3c1d：原 #f0553a 白字对比度仅 3.46，不达 WCAG AA 4.5 质量门
      primary: '#cd3c1d',
      success: '#22b573',
      warning: '#f5a623',
      danger: '#d92d20',
      info: '#64748b'
    },
    cssVars: {
      '--wd-bg-color-page': '#f6f1ea',
      '--wd-text-color-primary': '#1d2129',
      // 原 #6b7280 对奶油页底对比度 4.30 不达标，加深至 #646b78（≈4.77）
      '--wd-text-color-secondary': '#646b78',
      '--wd-border-color': '#e9e1d6',
      '--wd-border-color-light': '#f2ebe0',
      '--wd-radius-base': '8px',
      '--wd-radius-small': '6px',
      // 杂志风白卡片：14px 大圆角 + 暖调弥散阴影
      '--wd-panel-radius': '14px',
      '--wd-panel-shadow-sm': '0 1px 2px rgba(31, 25, 16, 0.04), 0 10px 24px -6px rgba(31, 25, 16, 0.08)',
      '--wd-datagrid-radius': '14px',
      // 标题回归纯文字：彩色标识条宽度归零（伪元素隐藏，与参考图一致）
      '--wd-panel-title-bar-width': '0',
      // 容器类毛玻璃：面板 / 搜索 / 表格半透白底（配 cssRules 的 backdrop-filter 成磨砂，页面光斑隐约透出），面板亮边模拟玻璃高光
      '--wd-panel-bg': 'rgba(255, 255, 255, 0.62)',
      '--wd-panel-border-color': 'rgba(255, 255, 255, 0.7)',
      '--wd-search-bg': 'rgba(255, 255, 255, 0.5)',
      '--wd-datagrid-bg': 'rgba(255, 255, 255, 0.55)',
      '--wd-editable-grid-bg': 'rgba(255, 255, 255, 0.55)',
      // EP 表格默认不透明白底会盖住容器玻璃底，透明化透出；表头留半透白分层，行 hover 暖色透底（默认浅灰不透明会糊块）
      '--el-table-bg-color': 'transparent',
      '--el-table-tr-bg-color': 'transparent',
      '--el-table-header-bg-color': 'rgba(255, 255, 255, 0.45)',
      '--el-table-row-hover-bg-color': 'rgba(205, 60, 29, 0.05)',
      // 导航区：半透奶油白侧栏 + 半透白顶栏 / tabs 条（配 cssRules 的 backdrop-filter 成毛玻璃，页面光斑隐约透出）
      '--wd-station-aside-bg': 'rgba(251, 247, 240, 0.72)',
      '--wd-station-header-bg': 'rgba(255, 255, 255, 0.65)',
      '--wd-station-tabs-bg': 'rgba(255, 255, 255, 0.55)'
    }
  },
  // 皮肤专属 CSS 规则：页面柔光斑氛围底 + 毛玻璃导航区 + 侧栏深墨胶囊选中态（渐变光晕/背景模糊/选中胶囊为 rule 级定制，EP 变量做不到）
  cssRules: `
/* 页面氛围：奶油底上叠桃橙 / 雾蓝 / 淡紫柔光斑（radial 渐变叠加在 --wd-bg-color-page 之上，用户改底色可联动） */
.wd-station {
  background:
    radial-gradient(620px 480px at -6% -8%, rgba(205, 60, 29, 0.16), transparent 70%),
    radial-gradient(560px 460px at 106% 104%, rgba(94, 132, 220, 0.18), transparent 70%),
    radial-gradient(380px 320px at 4% 98%, rgba(158, 146, 214, 0.12), transparent 70%),
    var(--wd-bg-color-page);
}
/* 毛玻璃导航区：半透底（见 cssVars）+ 背景模糊提亮，光斑透过来形成磨砂质感 */
.wd-station__aside,
.wd-station__header,
.wd-station__tabs-bar {
  backdrop-filter: blur(16px) saturate(1.5);
  -webkit-backdrop-filter: blur(16px) saturate(1.5);
}
/* 容器类毛玻璃：面板 / 搜索 / 表格半透底（见 cssVars）+ 背景模糊提亮，比导航区弱一档保持内容清晰 */
.wd-panel,
.wd-search-panel,
.wd-datagrid,
.wd-editable-grid {
  backdrop-filter: blur(14px) saturate(1.4);
  -webkit-backdrop-filter: blur(14px) saturate(1.4);
}
/* EP 菜单默认不透明白底会盖住侧栏毛玻璃，改透明（含 inline 展开子菜单） */
.wd-station__menu.el-menu,
.wd-station__menu .el-menu--inline {
  background: transparent;
}
/* 侧边菜单：深墨胶囊选中态（参考图侧栏标志性处理），圆角 + 左右内收 */
.wd-station__menu .el-menu-item,
.wd-station__menu .el-sub-menu__title {
  margin: 2px 10px;
  border-radius: 10px;
}
.wd-station__menu .el-menu-item:hover,
.wd-station__menu .el-sub-menu__title:hover {
  background: rgba(31, 37, 50, 0.06);
}
.wd-station__menu .el-menu-item.is-active {
  background: #1f2532;
  color: #fff;
  font-weight: 600;
}
.wd-station__menu .el-menu-item.is-active .el-icon {
  color: #fff;
}
`
}
