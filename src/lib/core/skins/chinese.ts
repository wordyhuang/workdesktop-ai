import type { SkinPreset } from './types'

/** 中文字体栈：行楷优先，依次回退楷体 / 宋体类系统书法字体（零外部资源，随系统字体库可用性取最优） */
const FONT_STACK = `'STXingkai', '华文行楷', 'KaiTi', '楷体', 'STKaiti', 'Kaiti SC', 'Kaiti', 'Noto Serif CJK SC', 'Source Han Serif SC', 'Songti SC', 'SimSun', serif`

/** 中式：墨绿山水 + 金箔描边，暗夜国风（深色皮肤，含 El 深色联动；金底按钮配深绿字对比度 ≈8:1 达 WCAG AAA） */
export const chineseSkin: SkinPreset = {
  key: 'chinese',
  label: '中式',
  desc: '墨绿山水金箔描边，适合文化 / 国风类产品',
  theme: {
    colors: {
      primary: '#c9a24b',
      success: '#3e9e86',
      warning: '#d98e2b',
      danger: '#c0453c',
      info: '#7f8f80'
    },
    cssVars: {
      '--wd-bg-color': '#123128',
      '--wd-bg-color-page': '#0a211c',
      '--wd-bg-color-overlay': '#163a2f',
      '--wd-text-color-primary': '#ece3c8',
      '--wd-text-color-regular': '#b3bda8',
      '--wd-text-color-secondary': '#8a9a86',
      '--wd-text-color-placeholder': '#758a79',
      '--wd-border-color': 'rgba(201, 162, 75, 0.38)',
      '--wd-border-color-light': 'rgba(201, 162, 75, 0.2)',
      '--wd-radius-base': '6px',
      '--wd-radius-small': '4px',
      '--wd-spacing-base': '14px',
      '--wd-spacing-large': '18px',
      // 组件级：面板 / 卡片深墨绿底 + 金箔描边与标题，导航区压深
      '--wd-panel-bg': '#102c23',
      '--wd-panel-border-color': 'rgba(201, 162, 75, 0.42)',
      '--wd-panel-header-bg': 'rgba(201, 162, 75, 0.1)',
      '--wd-panel-title-color': '#dec07a',
      '--wd-datagrid-bg': '#102c23',
      // 表格边框烫金：外框实色金箔（同源金不透明，烫印实心感）
      '--wd-datagrid-border-color': '#c9a24b',
      '--wd-editable-grid-bg': '#102c23',
      '--wd-editable-grid-border-color': '#c9a24b',
      '--wd-search-bg': '#102c23',
      '--wd-form-footer-bg': 'rgba(201, 162, 75, 0.06)',
      '--wd-station-aside-bg': '#071a15',
      '--wd-station-header-bg': '#071a15',
      '--wd-station-tabs-bg': '#071a15',
      // 背景素材（内联 SVG data URI 零外部资源，定位规则见 cssRules）：
      // 侧栏贴底山水纹（青峦 + 金脊线 + 朱砂日，菜单未占满时在下方留白露出，呼应参考图侧栏山水）；
      // 页头右侧祥云纹；面板贴底淡山水（装表格时被 DataGrid 不透明底自然遮住，统计卡类内容透出，与参考图一致）
      '--wd-station-aside-bg-image': `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='480' height='110' viewBox='0 0 480 110'><circle cx='312' cy='24' r='11' fill='%23c0453c' fill-opacity='0.5'/><path d='M0 74 Q40 40 78 58 T150 50 Q190 20 226 46 T300 52 Q340 30 380 50 T480 58 V110 H0 Z' fill='%233e9e86' fill-opacity='0.16'/><path d='M0 90 Q52 64 104 78 T208 72 Q262 52 316 72 T480 80 V110 H0 Z' fill='%232a5a4a' fill-opacity='0.55'/><path d='M0 74 Q40 40 78 58 T150 50 Q190 20 226 46 T300 52 Q340 30 380 50 T480 58' fill='none' stroke='%23c9a24b' stroke-opacity='0.3' stroke-width='1.2'/><path d='M60 98 h56 M330 96 h52' stroke='%23c9a24b' stroke-opacity='0.18' stroke-width='1' fill='none'/></svg>")`,
      '--wd-station-header-bg-image': `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='132' height='36' viewBox='0 0 132 36'><g fill='none' stroke='%23c9a24b' stroke-opacity='0.3' stroke-width='1.2' stroke-linecap='round'><path d='M6 26c-1-7 6-12 13-10 2-6 11-8 16-3 5-3 12 0 12 6 5-1 10 3 9 7'/><path d='M4 30h58'/><path d='M74 27c0-4 5-7 9-5 2-4 9-4 11 0 4-1 8 2 8 5'/><path d='M72 30h36'/><path d='M114 13c2-3 7-3 9 0 3-2 7 0 7 3'/></g></svg>")`,
      '--wd-panel-bg-image': `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='480' height='110' viewBox='0 0 480 110'><circle cx='312' cy='24' r='11' fill='%23c0453c' fill-opacity='0.35'/><path d='M0 74 Q40 40 78 58 T150 50 Q190 20 226 46 T300 52 Q340 30 380 50 T480 58 V110 H0 Z' fill='%233e9e86' fill-opacity='0.1'/><path d='M0 90 Q52 64 104 78 T208 72 Q262 52 316 72 T480 80 V110 H0 Z' fill='%232a5a4a' fill-opacity='0.34'/><path d='M0 74 Q40 40 78 58 T150 50 Q190 20 226 46 T300 52 Q340 30 380 50 T480 58' fill='none' stroke='%23c9a24b' stroke-opacity='0.2' stroke-width='1.2'/><path d='M60 98 h56 M330 96 h52' stroke='%23c9a24b' stroke-opacity='0.12' stroke-width='1' fill='none'/></svg>")`,
      // 菜单悬停：EP 默认 hover 底为主色 light-9（浅米金），深底下会糊成浅色亮块，改为金箔同源深透底
      '--el-menu-hover-bg-color': 'rgba(201, 162, 75, 0.14)',
      // ElementPlus 深色联动（填充 / 遮罩 / 阴影 / 按钮文字色）
      // 注：el-table 内部线烫金不放此处——EP 在 .el-table 元素规则上自定义 --el-table-border-color，
      // :root 注入会被元素自身规则盖住（自定义属性继承恒弱于元素声明），见下方 cssRules
      '--el-fill-color-blank': '#123128',
      '--el-fill-color': '#1a3d31',
      '--el-fill-color-light': '#1a3d31',
      '--el-fill-color-lighter': '#1e4436',
      '--el-fill-color-extra-light': '#16352b',
      '--el-fill-color-dark': '#20473a',
      '--el-fill-color-darker': '#265040',
      // 仅作按钮文字色（EP 深色皮肤标准做法）；注意 EP 内凡以 --el-color-white 作背景的场景会同步变深，实测无异常，改动需回归
      '--el-color-white': '#0d231c',
      // 中文书法字体：行楷优先（EP 组件字体走 --el-font-family，:root 定义，cssVars 同层覆盖生效）
      '--el-font-family': FONT_STACK,
      '--el-mask-color': 'rgba(4, 12, 9, 0.72)',
      '--el-box-shadow': '0 4px 16px rgba(0, 0, 0, 0.5)',
      '--el-box-shadow-light': '0 2px 8px rgba(0, 0, 0, 0.4)'
    }
  },
  // 皮肤专属 CSS 规则：金箔渐变主按钮 + ghost 金默认按钮 + 深金 primary 标签 + 表格烫金线
  // （EP 变量只能纯色填充，渐变/外发光必须 rule 级覆盖；描边金与面板描边 rgba(201,162,75) 同源）
  cssRules: `
/* 正文 / 非 EP 组件继承体：应用中文书法字体（wd 组件未单独设字体，继承 body） */
body {
  font-family: ${FONT_STACK};
}
/* 表格边框烫金：el-table 外框/竖线/单元格横线统一同源金 0.45（弱于卡片实色外框拉开层次）。
   EP 在 .el-table 元素规则上自定义 --el-table-border-color，cssVars :root 注入会被盖住，
   必须同选择器级覆盖——本规则与 EP .el-table 规则同 specificity (0,1,0)，皮肤样式注入在后胜出 */
.el-table {
  --el-table-border-color: rgba(201, 162, 75, 0.45);
}
/* 主按钮：金箔渐变 + 淡金外发光（渐变起点跟随 --el-color-primary，用户覆盖主色可联动；文字取已压深的 --el-color-white） */
.el-button--primary {
  background-image: linear-gradient(135deg, var(--el-color-primary), #e0be6e);
  --el-button-border-color: transparent;
  --el-button-hover-border-color: transparent;
  box-shadow: 0 0 12px rgba(201, 162, 75, 0.4);
}
.el-button--primary:hover {
  background-image: linear-gradient(135deg, var(--el-color-primary-light-3), #eed18c);
  box-shadow: 0 0 18px rgba(201, 162, 75, 0.55);
}
.el-button--primary.is-disabled,
.el-button--primary.is-disabled:hover {
  background-image: none;
  box-shadow: none;
}
/* 默认按钮：ghost 金（深金底 + 金描边 + 亮金字）；:not 排除语义色按钮与 text/link 形态 */
.el-button:not([class*='el-button--']):not(.is-text):not(.is-link) {
  --el-button-bg-color: rgba(201, 162, 75, 0.1);
  --el-button-border-color: rgba(201, 162, 75, 0.45);
  --el-button-text-color: #dec07a;
  --el-button-hover-bg-color: rgba(201, 162, 75, 0.2);
  --el-button-hover-border-color: rgba(222, 192, 122, 0.7);
  --el-button-hover-text-color: #f0dcaa;
}
/* primary 标签：深金底 + 亮金字（success 等语义标签不动） */
.el-tag.el-tag--primary {
  --el-tag-bg-color: rgba(201, 162, 75, 0.16);
  --el-tag-border-color: rgba(201, 162, 75, 0.38);
  --el-tag-text-color: #dec07a;
  --el-tag-hover-color: #eed18c;
}
/* 背景素材定位（cssVars 只挂 background-image，repeat/position/size 在此补）；
   选择器提权至 (0,2,1)：压过组件 scoped background 简写（0,2,0）中的定位初始值 */
/* 侧栏山水：贴底居中；SVG 固有 480px 宽，窄于 480 的侧栏居中裁剪保主峰与红日 */
div.wd-station .wd-station__aside {
  background-repeat: no-repeat;
  background-position: bottom center;
  background-size: auto;
}
/* 页头祥云：右端垂直居中，高约 26px */
div.wd-station .wd-station__header {
  background-repeat: no-repeat;
  background-position: right 16px center;
  background-size: auto 26px;
}
/* 面板山水：贴底居中（同名叠类提权）；宽面板呈 480px 中央山带，呼应参考图统计卡 */
div.wd-panel.wd-panel {
  background-repeat: no-repeat;
  background-position: bottom center;
  background-size: auto;
}
/* 面板头右侧小祥云（组件未预留 header 背景令牌，image 在此挂；背景层天然在标题文字之下） */
div.wd-panel .wd-panel__header {
  background-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='132' height='36' viewBox='0 0 132 36'><g fill='none' stroke='%23c9a24b' stroke-opacity='0.3' stroke-width='1.2' stroke-linecap='round'><path d='M6 26c-1-7 6-12 13-10 2-6 11-8 16-3 5-3 12 0 12 6 5-1 10 3 9 7'/><path d='M4 30h58'/><path d='M74 27c0-4 5-7 9-5 2-4 9-4 11 0 4-1 8 2 8 5'/><path d='M72 30h36'/><path d='M114 13c2-3 7-3 9 0 3-2 7 0 7 3'/></g></svg>");
  background-repeat: no-repeat;
  background-position: right 14px center;
  background-size: auto 18px;
}
`
}
