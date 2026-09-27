import type { SkinPreset } from './types'

/** 科技：深空霓虹青 + 非连续边框（L 角码 + 断续虚线段），参考科技大屏（深色皮肤，含 El 深色联动；青色主按钮配压深文字对比度 ≈9:1 达 WCAG AAA） */
export const techSkin: SkinPreset = {
  key: 'tech',
  label: '科技',
  desc: '深空霓虹青配非连续边框，适合数据大屏 / AI 类产品',
  theme: {
    colors: {
      primary: '#00e5ff',
      success: '#00ffa3',
      warning: '#ffb020',
      danger: '#ff4d6d',
      info: '#5b7ba6'
    },
    cssVars: {
      '--wd-bg-color': '#0a1828',
      '--wd-bg-color-page': '#050d1a',
      '--wd-bg-color-overlay': '#0d1e33',
      '--wd-text-color-primary': '#dcf4ff',
      '--wd-text-color-regular': '#9cc3e8',
      '--wd-text-color-secondary': '#6b90bb',
      '--wd-text-color-placeholder': '#45638c',
      '--wd-border-color': 'rgba(0, 229, 255, 0.28)',
      '--wd-border-color-light': 'rgba(0, 229, 255, 0.16)',
      '--wd-radius-base': '6px',
      '--wd-radius-small': '4px',
      // 组件级：面板 / 表格深空蓝玻璃底 + 霓虹青描边辉光，青蓝渐变标识条，导航区压黑
      '--wd-panel-bg': '#0a1828',
      // 底边调暗衬非连续边框（角码/虚线段见 cssRules ::before）+ 面板近直角
      '--wd-panel-border-color': 'rgba(0, 229, 255, 0.14)',
      '--wd-panel-radius': '3px',
      '--wd-panel-header-bg': 'rgba(0, 229, 255, 0.06)',
      '--wd-panel-title-color': '#5ee9ff',
      '--wd-panel-shadow-sm': '0 0 18px rgba(0, 229, 255, 0.14)',
      '--wd-panel-shadow-md': '0 0 28px rgba(0, 229, 255, 0.26)',
      '--wd-panel-title-bar-bg': 'linear-gradient(180deg, #00e5ff, #2979ff)',
      '--wd-datagrid-bg': '#0a1828',
      '--wd-datagrid-border-color': 'rgba(0, 229, 255, 0.3)',
      '--wd-editable-grid-bg': '#0a1828',
      '--wd-editable-grid-border-color': 'rgba(0, 229, 255, 0.3)',
      '--wd-search-bg': '#0a1828',
      // DataForm 按钮容器：青蓝渐变 HUD 操作条 + 四周内边距 + 圆角（默认令牌仅顶部留白，给底色必须同步 padding/radius 防按钮贴边）
      '--wd-form-footer-bg': 'linear-gradient(90deg, rgba(0, 229, 255, 0.09), rgba(41, 121, 255, 0.05))',
      '--wd-form-footer-padding': '10px 12px',
      '--wd-form-footer-radius': '6px',
      '--wd-station-aside-bg': '#040b16',
      '--wd-station-header-bg': '#040b16',
      '--wd-station-tabs-bg': '#040b16',
      // 背景素材：面板保持纯深空蓝（装饰收敛到非连续边框，视觉不吵）；
      // 表格 / 搜索贴青色 HUD 网格，导航区贴青色扫描线（CRT 屏幕感），低透明度不影响可读性
      '--wd-datagrid-bg-image':
        'repeating-linear-gradient(0deg, rgba(0, 229, 255, 0.045) 0 1px, transparent 1px 24px), repeating-linear-gradient(90deg, rgba(0, 229, 255, 0.045) 0 1px, transparent 1px 24px)',
      '--wd-editable-grid-bg-image':
        'repeating-linear-gradient(0deg, rgba(0, 229, 255, 0.045) 0 1px, transparent 1px 24px), repeating-linear-gradient(90deg, rgba(0, 229, 255, 0.045) 0 1px, transparent 1px 24px)',
      '--wd-search-bg-image':
        'repeating-linear-gradient(0deg, rgba(0, 229, 255, 0.045) 0 1px, transparent 1px 24px), repeating-linear-gradient(90deg, rgba(0, 229, 255, 0.045) 0 1px, transparent 1px 24px)',
      '--wd-station-aside-bg-image': 'repeating-linear-gradient(0deg, rgba(0, 229, 255, 0.05) 0 1px, transparent 1px 4px)',
      '--wd-station-header-bg-image': 'repeating-linear-gradient(0deg, rgba(0, 229, 255, 0.05) 0 1px, transparent 1px 4px)',
      '--wd-station-tabs-bg-image': 'repeating-linear-gradient(0deg, rgba(0, 229, 255, 0.05) 0 1px, transparent 1px 4px)',
      // 菜单深色联动：底色贴合导航区压黑；EP 默认 hover 底为主色 light-9（浅青），深底下会糊成浅色亮块，改为青色同源深透底
      '--el-menu-bg-color': '#040b16',
      '--el-menu-hover-bg-color': 'rgba(0, 229, 255, 0.1)',
      '--el-menu-item-hover-fill': 'rgba(0, 229, 255, 0.1)',
      // ElementPlus 深色联动（填充 / 遮罩 / 阴影 / 按钮文字色）
      '--el-fill-color-blank': '#0a1828',
      '--el-fill-color': '#10233a',
      '--el-fill-color-light': '#12263e',
      '--el-fill-color-lighter': '#142a44',
      '--el-fill-color-extra-light': '#0c1c30',
      '--el-fill-color-dark': '#16304c',
      '--el-fill-color-darker': '#1a3656',
      // 仅作按钮文字色（EP 深色皮肤标准做法）；注意 EP 内凡以 --el-color-white 作背景的场景会同步变深，实测无异常，改动需回归
      '--el-color-white': '#06121f',
      '--el-mask-color': 'rgba(2, 8, 18, 0.72)',
      '--el-box-shadow': '0 4px 16px rgba(0, 0, 0, 0.5)',
      '--el-box-shadow-light': '0 2px 8px rgba(0, 0, 0, 0.4)'
    }
  },
  // 皮肤专属 CSS 规则：表格内线青色 + 青光渐变主按钮 + ghost 青默认按钮 + 霓虹 primary 标签 +
  // 菜单选中光条 + 面板非连续边框 + 科技动画（面板扫描光 / 标识条呼吸 / 按钮流光 / 聚焦光晕 / 进度条流光 / 加载呼吸）
  // （EP 变量只能纯色填充，渐变/外发光必须 rule 级覆盖；发光色与面板描边 rgba(0,229,255) 同源）
  cssRules: `
/* 表格内线青色：el-table 单元格线统一同源青 0.2（弱于容器外框拉开层次）。
   EP 在 .el-table 元素规则上自定义 --el-table-border-color，cssVars :root 注入会被盖住，
   必须同选择器级覆盖——本规则与 EP .el-table 规则同 specificity (0,1,0)，皮肤样式注入在后胜出 */
.el-table {
  --el-table-border-color: rgba(0, 229, 255, 0.2);
}
/* 主按钮：青→蓝渐变 + 青光外发光（渐变起点跟随 --el-color-primary，用户覆盖主色可联动；文字取已压深的 --el-color-white） */
.el-button--primary {
  background-image: linear-gradient(135deg, var(--el-color-primary), #2979ff);
  --el-button-border-color: transparent;
  --el-button-hover-border-color: transparent;
  box-shadow: 0 0 14px rgba(0, 229, 255, 0.45);
}
.el-button--primary:hover {
  background-image: linear-gradient(135deg, var(--el-color-primary-light-3), #4d94ff);
  box-shadow: 0 0 22px rgba(0, 229, 255, 0.6);
}
.el-button--primary.is-disabled,
.el-button--primary.is-disabled:hover {
  background-image: none;
  box-shadow: none;
}
/* 默认按钮：ghost 青（深青底 + 青描边 + 亮青字）；:not 排除语义色按钮与 text/link 形态 */
.el-button:not([class*='el-button--']):not(.is-text):not(.is-link) {
  --el-button-bg-color: rgba(0, 229, 255, 0.08);
  --el-button-border-color: rgba(0, 229, 255, 0.4);
  --el-button-text-color: #a5f3ff;
  --el-button-hover-bg-color: rgba(0, 229, 255, 0.18);
  --el-button-hover-border-color: rgba(94, 233, 255, 0.65);
  --el-button-hover-text-color: #d6f8ff;
}
/* primary 标签：深青底 + 亮青字（success 等语义标签不动） */
.el-tag.el-tag--primary {
  --el-tag-bg-color: rgba(0, 229, 255, 0.14);
  --el-tag-border-color: rgba(0, 229, 255, 0.36);
  --el-tag-text-color: #a5f3ff;
  --el-tag-hover-color: #5ee9ff;
}
/* 菜单选中项：青色 tint 底 + 左侧 2px 霓虹条 + 文字发光（仅垂直菜单，横向菜单走 EP 底部指示条） */
.el-menu--vertical .el-menu-item.is-active {
  background-color: rgba(0, 229, 255, 0.1);
  box-shadow: inset 2px 0 0 var(--el-color-primary);
  text-shadow: 0 0 8px rgba(0, 229, 255, 0.55);
}
/* 非连续边框（参考 Loss Curve 科技面板）：底边调暗至 0.14 衬断续感，::before 叠
   四角 L 角码（8 层 3px 粗 20px 臂亮青 0.95，视觉主角）+ 四边断续虚线段（16px 亮 /
   12px 间隔、0.42 弱于角码拉开层次，内缩 32px = 20px 角码臂 + 12px 间隙，不横穿角码区，
   角码与虚线分离才读得出层次），drop-shadow 3px 辉光集中在角码；
   ::after 已被扫描光占用故用 ::before；面板 overflow:hidden 负责圆角裁切；
   no-border 变体不画框；pointer-events:none 不拦截交互 */
.wd-panel:not(.wd-panel--no-border)::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(rgba(0, 229, 255, 0.95), rgba(0, 229, 255, 0.95)) left top / 20px 3px,
    linear-gradient(rgba(0, 229, 255, 0.95), rgba(0, 229, 255, 0.95)) left top / 3px 20px,
    linear-gradient(rgba(0, 229, 255, 0.95), rgba(0, 229, 255, 0.95)) right top / 20px 3px,
    linear-gradient(rgba(0, 229, 255, 0.95), rgba(0, 229, 255, 0.95)) right top / 3px 20px,
    linear-gradient(rgba(0, 229, 255, 0.95), rgba(0, 229, 255, 0.95)) left bottom / 20px 3px,
    linear-gradient(rgba(0, 229, 255, 0.95), rgba(0, 229, 255, 0.95)) left bottom / 3px 20px,
    linear-gradient(rgba(0, 229, 255, 0.95), rgba(0, 229, 255, 0.95)) right bottom / 20px 3px,
    linear-gradient(rgba(0, 229, 255, 0.95), rgba(0, 229, 255, 0.95)) right bottom / 3px 20px,
    repeating-linear-gradient(90deg, rgba(0, 229, 255, 0.42) 0 16px, transparent 16px 28px) left 32px top / calc(100% - 64px) 1px,
    repeating-linear-gradient(90deg, rgba(0, 229, 255, 0.42) 0 16px, transparent 16px 28px) left 32px bottom / calc(100% - 64px) 1px,
    repeating-linear-gradient(180deg, rgba(0, 229, 255, 0.42) 0 16px, transparent 16px 28px) left top 32px / 1px calc(100% - 64px),
    repeating-linear-gradient(180deg, rgba(0, 229, 255, 0.42) 0 16px, transparent 16px 28px) right top 32px / 1px calc(100% - 64px);
  background-repeat: no-repeat;
  filter: drop-shadow(0 0 3px rgba(0, 229, 255, 0.55));
}

/* ===== 科技动画体系：扫描光 + 呼吸 + 流光 + 聚焦光晕 =====
   守则：只动 transform/opacity/box-shadow（合成层，不触发 layout）；无限动画仅低透明 /
   低振幅不干扰阅读；disabled/loading 态不做 hover 变换 */
/* 面板扫描光：斜切光带周期性横向扫过面板（呼应参考图数据流扫描线，透明度 0.07 不遮内容） */
@keyframes wd-tech-scan {
  from { transform: translateX(-120%) skewX(-14deg); }
  to { transform: translateX(560%) skewX(-14deg); }
}
.wd-panel {
  position: relative;
}
.wd-panel::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  width: 22%;
  background: linear-gradient(90deg, transparent, rgba(0, 229, 255, 0.07), transparent);
  transform: translateX(-120%) skewX(-14deg);
  animation: wd-tech-scan 6s linear infinite;
  pointer-events: none;
}
/* 标识条呼吸：面板头青蓝渐变条低振幅明暗（与 cool 同款节奏） */
@keyframes wd-tech-glow {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.55; }
}
.wd-panel__header::before {
  animation: wd-tech-glow 3.6s ease-in-out infinite;
}
/* 主按钮流光：hover 时斜切光带扫过一次（与渐变规则共存，overflow 裁进圆角） */
@keyframes wd-tech-shine {
  from { transform: translateX(-130%) skewX(-18deg); }
  to { transform: translateX(280%) skewX(-18deg); }
}
.el-button--primary {
  position: relative;
  overflow: hidden;
}
.el-button--primary::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  width: 45%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.35), transparent);
  transform: translateX(-130%) skewX(-18deg);
  pointer-events: none;
}
.el-button--primary:not(.is-disabled):hover::after {
  animation: wd-tech-shine 0.7s ease;
}
/* 输入框/文本域/选择器：边框过渡 + 聚焦青光环（EP 聚焦描边上叠一层外发光） */
.el-input__wrapper,
.el-textarea__inner,
.el-select__wrapper {
  transition: box-shadow 0.25s ease, border-color 0.25s ease;
}
.el-input__wrapper.is-focus,
.el-textarea__inner:focus,
.el-select__wrapper.is-focused {
  box-shadow: 0 0 0 1px var(--el-color-primary) inset, 0 0 12px rgba(0, 229, 255, 0.45);
}
/* 进度条：条纹流光（主色条上叠 45° 光纹流动，周期 28px 整除不跳帧） */
@keyframes wd-tech-flow {
  from { background-position: 0 0; }
  to { background-position: 28px 0; }
}
.el-progress-bar__inner {
  position: relative;
  overflow: hidden;
  transition: width 0.3s ease;
}
.el-progress-bar__inner::after {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.18) 0 14px, transparent 14px 28px);
  animation: wd-tech-flow 1.2s linear infinite;
}
/* 加载：旋转环呼吸发光（保留 EP loading-dash 扫动，并列叠加） */
.el-loading-spinner .path {
  animation: loading-dash 1.5s ease-in-out infinite, wd-tech-glow 2.4s ease-in-out infinite;
}
/* 面板 hover：描边轻微提亮即可（0.3 以内不盖过非连续边框的断续感；
   阴影走 --wd-panel-shadow-md 青色辉光变量，用户覆盖不丢） */
.wd-panel:hover {
  border-color: rgba(0, 229, 255, 0.3);
}
`
}
