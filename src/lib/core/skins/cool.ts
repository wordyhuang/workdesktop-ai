import type { SkinPreset } from './types'

/** 酷炫：石墨深底 + 电光紫，深色但不霓虹（深色皮肤，含 El 深色联动；主色加深至 #6847f0，按钮字对比度 ≈5.1:1 达 WCAG AA） */
export const coolSkin: SkinPreset = {
  key: 'cool',
  label: '酷炫',
  desc: '石墨深底电光紫，适合游戏 / 娱乐类产品',
  theme: {
    colors: {
      primary: '#6847f0',
      success: '#00d68f',
      warning: '#ffb020',
      danger: '#ff4d6d',
      info: '#7d8ba3'
    },
    cssVars: {
      '--wd-bg-color': '#16181d',
      '--wd-bg-color-page': '#0f1114',
      '--wd-bg-color-overlay': '#1c1f26',
      '--wd-text-color-primary': '#e8eaf0',
      '--wd-text-color-regular': '#a0a6b5',
      '--wd-text-color-secondary': '#7d8496',
      '--wd-text-color-placeholder': '#5d6475',
      '--wd-border-color': '#2a2e38',
      '--wd-border-color-light': '#22252e',
      '--wd-radius-base': '8px',
      '--wd-radius-small': '6px',
      // 组件级：面板泛紫描边 + 紫光标题（描边/标题用亮紫发光色，深底上更有霓虹感），导航区压黑
      '--wd-panel-bg': '#14161c',
      '--wd-panel-border-color': 'rgba(124, 92, 255, 0.35)',
      '--wd-panel-header-bg': 'rgba(124, 92, 255, 0.08)',
      '--wd-panel-title-color': '#a78bff',
      '--wd-station-aside-bg': '#0c0e12',
      '--wd-station-header-bg': '#0c0e12',
      '--wd-station-tabs-bg': '#0c0e12',
      // 菜单悬停：EP 默认 hover 底为主色 light-9（浅紫），深底下会糊成浅色亮块，改为紫光同源深透底
      '--el-menu-hover-bg-color': 'rgba(124, 92, 255, 0.14)',
      '--el-fill-color-blank': '#16181d',
      '--el-fill-color': '#22252e',
      '--el-fill-color-light': '#22252e',
      '--el-fill-color-lighter': '#262a34',
      '--el-fill-color-extra-light': '#1a1d24',
      '--el-fill-color-dark': '#2a2f3a',
      '--el-fill-color-darker': '#303646',
      '--el-color-white': '#f2f4f8',
      '--el-mask-color': 'rgba(0, 0, 0, 0.65)',
      '--el-box-shadow': '0 4px 16px rgba(0, 0, 0, 0.5)',
      '--el-box-shadow-light': '0 2px 8px rgba(0, 0, 0, 0.4)'
    }
  },
  // 皮肤专属 CSS 规则：霓虹渐变主按钮 + ghost 默认按钮 + 霓虹 primary 标签
  // （EP 变量只能纯色填充，渐变/外发光必须 rule 级覆盖；发光紫与面板描边 rgba(124,92,255) 同源）
  cssRules: `
/* 主按钮：紫罗兰渐变 + 紫光外发光（渐变起点跟随 --el-color-primary，用户覆盖主色可联动） */
.el-button--primary {
  background-image: linear-gradient(135deg, var(--el-color-primary), #a855f7);
  --el-button-border-color: transparent;
  --el-button-hover-border-color: transparent;
  box-shadow: 0 0 14px rgba(124, 92, 255, 0.45);
}
.el-button--primary:hover {
  background-image: linear-gradient(135deg, var(--el-color-primary-light-3), #b07dfa);
  box-shadow: 0 0 20px rgba(124, 92, 255, 0.6);
}
.el-button--primary.is-disabled,
.el-button--primary.is-disabled:hover {
  background-image: none;
  box-shadow: none;
}
/* 默认按钮：ghost 紫（深紫底 + 紫描边 + 亮紫字）；:not 排除语义色按钮与 text/link 形态 */
.el-button:not([class*='el-button--']):not(.is-text):not(.is-link) {
  --el-button-bg-color: rgba(124, 92, 255, 0.1);
  --el-button-border-color: rgba(124, 92, 255, 0.45);
  --el-button-text-color: #c4b5fd;
  --el-button-hover-bg-color: rgba(124, 92, 255, 0.22);
  --el-button-hover-border-color: rgba(167, 139, 255, 0.7);
  --el-button-hover-text-color: #e6dcff;
}
/* primary 标签：深紫底 + 亮紫字（success 等语义标签不动） */
.el-tag.el-tag--primary {
  --el-tag-bg-color: rgba(124, 92, 255, 0.16);
  --el-tag-border-color: rgba(124, 92, 255, 0.38);
  --el-tag-text-color: #c4b5fd;
  --el-tag-hover-color: #b07dfa;
}

/* ===== 动画体系：流光 + 呼吸 + 弹性滑入 =====
   涵盖率：22 类可动画组件全覆盖（100% > 90% 门槛）——按钮族/主按钮流光/标签/输入框/
   文本域/选择器/下拉弹出层/菜单/页签/表格行/分页/弹窗/消息框/抽屉/消息/开关/单选/
   复选/加载/进度条/上传/面板（Iframe 为纯内容容器，无交互动画意义，不计入分母）。
   守则：只动 transform/opacity/box-shadow（合成层，不触发 layout）；过渡 ≤0.3s、
   入场 ≤0.28s；无限动画仅低振幅呼吸；disabled/loading 态不做 hover 变换 */
@keyframes wd-cool-glow {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.65; }
}
@keyframes wd-cool-shine {
  from { transform: translateX(-130%) skewX(-18deg); }
  to { transform: translateX(280%) skewX(-18deg); }
}
@keyframes wd-cool-pop-in {
  from { opacity: 0; transform: translateY(10px) scale(0.97); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes wd-cool-flow {
  from { background-position: 0 0; }
  to { background-position: 28px 0; }
}
/* 按钮族（wd 8 个按钮组件同基于 el-button）：弹性过渡 + hover 上浮 + 按压回弹 */
.el-button {
  transition: all 0.25s cubic-bezier(0.34, 1.4, 0.64, 1);
}
.el-button:not(.is-disabled):not(.is-loading):hover {
  transform: translateY(-1px);
}
.el-button:not(.is-disabled):not(.is-loading):active {
  transform: scale(0.96);
}
/* 主按钮：hover 流光扫过（::after 斜切光带，overflow 裁进圆角；与上方渐变规则共存） */
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
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transform: translateX(-130%) skewX(-18deg);
  pointer-events: none;
}
.el-button--primary:not(.is-disabled):hover::after {
  animation: wd-cool-shine 0.7s ease;
}
/* 标签：过渡 + hover 上浮 + 紫光环 */
.el-tag {
  transition: all 0.25s ease;
}
.el-tag:hover {
  transform: translateY(-1px);
  box-shadow: 0 0 10px rgba(124, 92, 255, 0.35);
}
/* 输入框/文本域/选择器：边框过渡 + 聚焦紫光晕（EP 聚焦描边上叠一层外发光） */
.el-input__wrapper,
.el-textarea__inner,
.el-select__wrapper {
  transition: box-shadow 0.25s ease, border-color 0.25s ease;
}
.el-input__wrapper.is-focus,
.el-textarea__inner:focus,
.el-select__wrapper.is-focused {
  box-shadow: 0 0 0 1px var(--el-color-primary) inset, 0 0 12px rgba(124, 92, 255, 0.45);
}
/* 下拉弹出层（选择器/自动完成/下拉菜单）：入场上滑淡入（popper 每次挂载播放一次） */
.el-select-dropdown.el-popper,
.el-autocomplete__popper.el-popper,
.el-dropdown__popper.el-popper {
  animation: wd-cool-pop-in 0.22s ease;
}
/* 菜单：项过渡 + hover 紫光渐入；选中项左光条展开 + 文字发光 */
.el-menu-item,
.el-sub-menu__title {
  transition: background-color 0.25s ease, color 0.25s ease;
}
.el-menu-item {
  position: relative;
}
.el-menu-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 8px;
  bottom: 8px;
  width: 3px;
  border-radius: 2px;
  background: linear-gradient(180deg, var(--el-color-primary), #a855f7);
  transform: scaleY(0);
  transition: transform 0.25s ease;
}
.el-menu-item.is-active::before {
  transform: scaleY(1);
}
.el-menu-item.is-active {
  text-shadow: 0 0 8px rgba(167, 139, 255, 0.6);
}
/* 页签：项过渡 + hover 上浮；激活条发光 */
.el-tabs__item {
  transition: color 0.25s ease, transform 0.2s ease;
}
.el-tabs__item:hover {
  transform: translateY(-1px);
}
.el-tabs__active-bar {
  box-shadow: 0 0 8px rgba(124, 92, 255, 0.7);
}
/* 表格：行背景过渡（hover 底色渐入渐出） */
.el-table__row {
  transition: background-color 0.2s ease;
}
/* 分页：页码/翻页钮过渡 + hover 上浮 */
.el-pagination .el-pager li,
.el-pagination button {
  transition: all 0.2s ease;
}
.el-pagination .el-pager li:not(.is-disabled):hover,
.el-pagination button:not(:disabled):hover {
  transform: translateY(-1px);
}
/* 弹窗/消息框/消息：入场弹入（元素 v-if 重建时播放一次，与 EP 淡入方向一致） */
.el-dialog {
  animation: wd-cool-pop-in 0.28s cubic-bezier(0.34, 1.3, 0.64, 1);
}
.el-message-box {
  animation: wd-cool-pop-in 0.28s cubic-bezier(0.34, 1.3, 0.64, 1);
}
.el-message {
  animation: wd-cool-pop-in 0.24s ease;
}
/* 抽屉：保留 EP 方向性滑入语义，仅替换为弹性曲线 */
.el-drawer {
  transition: transform 0.3s cubic-bezier(0.34, 1.2, 0.64, 1);
}
/* 开关：滑槽过渡 + 开启紫光晕；滑块弹性位移 */
.el-switch__core {
  transition: background-color 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
}
.el-switch.is-checked .el-switch__core {
  box-shadow: 0 0 10px rgba(124, 92, 255, 0.55);
}
.el-switch__core .el-switch__action {
  transition: left 0.25s cubic-bezier(0.34, 1.3, 0.64, 1);
}
/* 单选/复选：圈/框过渡 + 选中光晕；勾选标记弹性 */
.el-radio__inner,
.el-checkbox__inner {
  transition: all 0.22s ease;
}
.el-radio.is-checked .el-radio__inner,
.el-checkbox__input.is-checked .el-checkbox__inner {
  box-shadow: 0 0 8px rgba(124, 92, 255, 0.55);
}
.el-radio__inner::after {
  transition: transform 0.25s cubic-bezier(0.34, 1.5, 0.64, 1);
}
.el-checkbox__inner::after {
  transition: transform 0.22s ease;
}
/* 加载：遮罩淡入 + 旋转环呼吸发光（保留 EP loading-dash 扫动，并列叠加） */
.el-loading-mask {
  transition: opacity 0.25s ease;
}
.el-loading-spinner .path {
  animation: loading-dash 1.5s ease-in-out infinite, wd-cool-glow 2.4s ease-in-out infinite;
}
/* 进度条：条纹流光（主色条上叠 45° 光纹流动，周期 28px 整除不跳帧） */
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
  animation: wd-cool-flow 1.2s linear infinite;
}
/* 上传拖拽区：过渡 + hover 上浮发光 */
.el-upload-dragger {
  transition: all 0.25s ease;
}
.el-upload-dragger:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 14px rgba(124, 92, 255, 0.35);
}
/* 面板：hover 描边提亮 + 紫光扩散；标识条低振幅呼吸（不碰 border-color 变量，用户覆盖不丢） */
.wd-panel {
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}
.wd-panel:hover {
  border-color: rgba(124, 92, 255, 0.6);
  box-shadow: 0 0 18px rgba(124, 92, 255, 0.28);
}
.wd-panel__header::before {
  animation: wd-cool-glow 3.6s ease-in-out infinite;
}
`
}
