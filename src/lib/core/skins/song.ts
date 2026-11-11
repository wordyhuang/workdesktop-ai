import type { SkinPreset } from './types'

/** 宋体字系：宋刻本衬线优先，回退思源宋体 / 系统宋体（零外部资源） */
const FONT_STACK = `'Songti SC', 'STSong', 'SimSun', '宋体', 'Noto Serif CJK SC', 'Source Han Serif SC', serif`

/**
 * 天青宋韵：汝窑天青 + 宣纸青灰 + 墨色文字 + 宋体衬线 + 细边小圆角（浅色皮肤）。
 * 「雨过天青云破处」取天青深阶 #4a7d78 作主色（白字对比度 ≈4.7 达 AA），
 * 圆角收至 2~4px、阴影极轻、标识条改 2px 细线，整体克制留白，贴合宋代极简审美。
 */
export const songSkin: SkinPreset = {
  key: 'song',
  label: '宋韵',
  desc: '天青宋韵：汝窑天青 + 宣纸青灰 + 墨色文字 + 宋体衬线 + 细边小圆角，克制留白（雨过天青云破处）',
  theme: {
    colors: {
      primary: '#4a7d78',
      success: '#4f8f68',
      warning: '#c0954a',
      danger: '#a85a4f',
      info: '#7e8f8b'
    },
    cssVars: {
      // 宣纸青灰底 + 墨色文字体系（placeholder 压深至 #97a19c 保可读，浅底上 ≈3.4）
      '--wd-bg-color': '#fbfcfb',
      '--wd-bg-color-page': '#eef3f1',
      '--wd-bg-color-overlay': '#fdfefd',
      '--wd-text-color-primary': '#2b3330',
      '--wd-text-color-regular': '#56605c',
      '--wd-text-color-secondary': '#7b8580',
      '--wd-text-color-placeholder': '#97a19c',
      // 青灰细边（带天青色相，区别于出厂冷灰）+ 宋式克制小圆角 + 宽松留白
      '--wd-border-color': '#cfd9d5',
      '--wd-border-color-light': '#e2e9e6',
      '--wd-border-width': '1px',
      '--wd-radius-base': '4px',
      '--wd-radius-small': '2px',
      '--wd-spacing-base': '14px',
      '--wd-spacing-large': '18px',
      // 面板：宣纸白底 + 墨青标题 + 2px 天青渐变细标识条 + 极轻青灰阴影 + 宋式留白间距
      '--wd-panel-bg': '#fbfcfb',
      '--wd-panel-radius': '4px',
      '--wd-panel-border-color': '#d9e3df',
      '--wd-panel-title-color': '#3a6360',
      '--wd-panel-title-bar-width': '2px',
      '--wd-panel-title-bar-bg': 'linear-gradient(180deg, #4a7d78, #8fb9b4)',
      '--wd-panel-header-padding': '14px 18px',
      '--wd-panel-body-padding': '18px',
      '--wd-panel-footer-bg': '#f4f8f6',
      '--wd-panel-margin-bottom': '14px',
      '--wd-panel-shadow-sm': '0 1px 2px rgba(49, 74, 71, 0.04)',
      '--wd-panel-shadow-md': '0 6px 18px rgba(49, 74, 71, 0.08)',
      // 内容容器：表格 / 可编辑表格 / 搜索 / 表单操作条统一青灰细边与小圆角
      '--wd-datagrid-bg': '#fcfdfc',
      '--wd-datagrid-border-color': '#dbe5e1',
      '--wd-datagrid-radius': '4px',
      '--wd-datagrid-padding': '16px',
      '--wd-editable-grid-bg': '#fcfdfc',
      '--wd-editable-grid-border-color': '#dbe5e1',
      '--wd-editable-grid-radius': '4px',
      '--wd-search-bg': '#f4f8f6',
      '--wd-search-padding': '16px',
      '--wd-form-footer-bg': '#f4f8f6',
      '--wd-form-footer-padding': '12px 18px',
      '--wd-form-footer-radius': '4px',
      // 导航区：青瓷淡底侧栏 + 近白页头 / 页签条 + 天青激活态 + 灰青分组标题
      '--wd-station-aside-bg': '#e9f0ed',
      '--wd-station-header-bg': '#f7faf8',
      '--wd-station-tabs-bg': '#f1f6f4',
      '--wd-station-tabs-active-color': '#4a7d78',
      '--wd-station-tabs-active-bg': '#dce9e5',
      '--wd-station-menu-group-color': '#849b95',
      // 背景素材（内联 SVG data URI 零外部资源）：
      // 面板铺汝窑冰裂纹开片（260x170 平铺）：38 条裂纹大折角随机跨区，
      // 三档墨色浓淡（0.032 主脉 / 0.02 细纹 / 0.042 深裂）模拟开片层次；
      // 四边裂纹首尾同坐标，平铺无接缝；透明度压得很低，只作隐约开片底纹不干扰阅读
      '--wd-panel-bg-image': `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='260' height='170' viewBox='0 0 260 170'><g fill='none' stroke='%234a7d78' stroke-width='0.9' stroke-opacity='0.032' stroke-linejoin='round'><path d='M0 26 L23 57 L46 32 L70 74 L93 43 L117 80 L140 50 L164 90 L188 58 L212 95 L236 68 L260 26'/><path d='M0 112 L20 92 L44 126 L67 104 L91 138 L114 111 L138 146 L161 119 L185 150 L208 123 L232 155 L260 112'/><path d='M0 150 L25 163 L49 139 L73 162 L97 143 L121 165 L145 147 L169 164 L193 142 L217 160 L241 138 L260 150'/><path d='M54 0 L78 24 L50 46 L82 70 L44 95 L76 118 L48 142 L80 164 L54 170'/><path d='M148 0 L172 22 L144 45 L176 68 L140 92 L170 114 L146 138 L178 160 L148 170'/><path d='M214 0 L238 26 L210 48 L242 72 L208 96 L240 118 L212 142 L244 164 L214 170'/><path d='M34 58 L52 96 L38 118'/><path d='M88 20 L104 52 L92 82'/><path d='M126 60 L116 104 L130 126'/><path d='M160 28 L178 66 L168 104'/><path d='M12 76 L30 104 L16 134'/><path d='M196 40 L184 84 L200 112'/><path d='M232 20 L222 54 L238 88'/><path d='M60 122 L80 132 L72 160'/><path d='M146 96 L136 140 L150 166'/><path d='M206 96 L226 130 L210 158'/><path d='M244 100 L252 128 L244 152'/></g><g fill='none' stroke='%234a7d78' stroke-width='0.7' stroke-opacity='0.02' stroke-linejoin='round'><path d='M18 36 L28 48 L22 62'/><path d='M74 46 L64 62 L78 70'/><path d='M108 36 L118 50 L110 62'/><path d='M140 82 L152 92 L144 108'/><path d='M26 122 L38 132'/><path d='M66 86 L56 100'/><path d='M96 108 L108 118 L100 132'/><path d='M172 120 L184 132 L176 148'/><path d='M206 44 L218 56'/><path d='M238 74 L246 88'/><path d='M40 74 L46 88 L36 96'/><path d='M190 8 L198 18 L192 30'/><path d='M120 146 L128 158'/><path d='M226 140 L236 152'/></g><g fill='none' stroke='%234a7d78' stroke-width='1.1' stroke-opacity='0.042' stroke-linejoin='round'><path d='M46 32 L70 74'/><path d='M67 104 L91 138'/><path d='M50 46 L82 70'/><path d='M144 45 L176 68'/><path d='M210 48 L242 72'/><path d='M196 40 L184 84'/><path d='M54 0 L78 24'/></g></svg>")`,
      '--wd-station-aside-bg-image': `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='480' height='110' viewBox='0 0 480 110'><path d='M0 78 Q44 46 84 62 T156 54 Q196 28 232 50 T306 56 Q346 36 386 54 T480 60 V110 H0 Z' fill='%234a7d78' fill-opacity='0.07'/><path d='M0 94 Q54 70 108 84 T212 78 Q266 60 320 78 T480 86 V110 H0 Z' fill='%234a7d78' fill-opacity='0.1'/><path d='M0 78 Q44 46 84 62 T156 54 Q196 28 232 50 T306 56 Q346 36 386 54 T480 60' fill='none' stroke='%234a7d78' stroke-opacity='0.14' stroke-width='1'/></svg>")`,
      // 宋体衬线字体：EP 组件字体走 --el-font-family（:root 定义，cssVars 同层覆盖生效）
      '--el-font-family': FONT_STACK
    }
  },
  // 皮肤专属 CSS 规则：宋体字系 + 平涂天青主按钮 + 宣纸白默认按钮 + 小圆角标签 + 侧栏左墨线选中 + 表头浅天青
  cssRules: `
/* 正文 / 非 EP 组件继承体：应用宋体衬线（宋刻本气质） */
body {
  font-family: ${FONT_STACK};
}
/* 主按钮：天青平涂（宋式克制不做渐变），hover 取深阶 + 极轻投影（色阶随主色覆盖联动） */
.el-button--primary {
  --el-button-hover-bg-color: var(--el-color-primary-dark-2);
  --el-button-hover-border-color: var(--el-color-primary-dark-2);
  --el-button-active-bg-color: var(--el-color-primary-dark-2);
  --el-button-active-border-color: var(--el-color-primary-dark-2);
  box-shadow: 0 1px 2px rgba(49, 74, 71, 0.12);
}
/* 默认按钮：宣纸白底 + 青灰细边 + 墨色字，hover 边与字转天青（:not 排除语义色与 text/link 形态） */
.el-button:not([class*='el-button--']):not(.is-text):not(.is-link) {
  --el-button-bg-color: #fbfcfb;
  --el-button-border-color: #cfd9d5;
  --el-button-text-color: #2b3330;
  --el-button-hover-bg-color: #f4f8f6;
  --el-button-hover-border-color: var(--el-color-primary);
  --el-button-hover-text-color: var(--el-color-primary);
}
/* 标签：宋式 2px 小圆角 + 极细青边；primary 取浅天青底（light-9 随主色覆盖联动） */
.el-tag {
  border-radius: 2px;
}
.el-tag.el-tag--primary {
  --el-tag-bg-color: var(--el-color-primary-light-9);
  --el-tag-border-color: rgba(74, 125, 120, 0.34);
  --el-tag-text-color: var(--el-color-primary);
}
/* 输入框聚焦：1px 内描边 + 3px 极淡外晕（比 Soft 更收敛，克制焦点态） */
.el-input__wrapper.is-focus {
  box-shadow: 0 0 0 1px var(--el-color-primary) inset, 0 0 0 3px color-mix(in srgb, var(--el-color-primary) 10%, transparent);
}
/* 顶栏菜单：浅青灰 hover + 浅天青底青字选中（作用域限定 Station，防 :root 注入被 EP 元素规则盖住） */
.wd-station__top-menu .el-menu {
  --el-menu-hover-bg-color: rgba(74, 125, 120, 0.06);
}
.wd-station__top-menu .el-menu-item.is-active {
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  font-weight: 500;
}
/* 青瓷侧栏：青灰细分割线 + 贴底淡远山（scoped 特异性需 .wd-station 前缀压过属性选择器） */
.wd-station .wd-station__aside {
  border-right: 1px solid #dbe5e1;
  background-repeat: no-repeat;
  background-position: bottom center;
  background-size: auto;
}
/* 侧栏菜单：墨色文字 + 天青 hover 晕染；选中项以左侧 2px 墨线作宋式留白标记 */
.wd-station__menu {
  --el-menu-bg-color: transparent;
  --el-menu-text-color: #2b3330;
  --el-menu-icon-color: #2b3330;
  --el-menu-hover-text-color: #2b3330;
  --el-menu-hover-bg-color: rgba(74, 125, 120, 0.08);
  --el-menu-active-text-color: var(--el-color-primary);
}
.wd-station__menu .el-menu-item {
  margin: 2px 8px;
  border-radius: 2px;
}
.wd-station__menu .el-sub-menu__title {
  margin: 2px 8px;
  border-radius: 2px;
}
.wd-station__menu .el-menu-item.is-active {
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  box-shadow: inset 2px 0 0 var(--el-color-primary);
  font-weight: 500;
}
.wd-station__menu .el-sub-menu.is-active > .el-sub-menu__title {
  color: var(--el-color-primary);
}
/* 表格：表头浅天青底 + 墨青字 + 青灰细线（EP 在 .el-table 元素规则上声明，须同选择器级覆盖） */
.el-table {
  --el-table-header-bg-color: #f3f8f6;
  --el-table-header-text-color: #3a6360;
  --el-table-border-color: #e0e8e4;
  --el-table-row-hover-bg-color: #f6faf8;
}
/* 面板冰裂纹：按 SVG 固有尺寸 260x170 平铺（显式尺寸避免大面板拉伸失真） */
div.wd-panel.wd-panel {
  background-repeat: repeat;
  background-size: 260px 170px;
}
`
}
