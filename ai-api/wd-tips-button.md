> 本文件由脚本自动生成，请勿手工编辑。全部组件索引、阅读约定与 Element Plus 透传规则见 [README.md](./README.md)。数据源 `docs/src/api-meta/`，重生成：`npm run gen:ai-api`。

# WdTipsButton TipsButton 提示按钮

基于 el-tooltip 的悬停提示按钮，所有按钮均已集成本组件提示能力；若仅需要悬停提示，直接用本组件

### 概述

WdTipsButton 是基于 el-tooltip 的悬停提示按钮：`tips` 属性非空时自动用 el-tooltip 包裹按钮，鼠标悬停显示提示内容，主题（`tipsType`）与弹出位置（`placement`）可配。它是整个按钮组的提示能力基座——Api / Confirm / Popconfirm / Prompt / Route / Drawer 等按钮均已集成本组件的提示能力；若仅需要悬停提示、不需要请求 / 确认 / 路由 / 弹层，直接使用本组件即可。无提示内容时不包裹 tooltip，减少 DOM 层级。

### 何时使用

- 图标按钮、工具栏按钮等缺少文字说明、需要悬停补充解释的场景。
- 操作含义不直观、需要引导性提示的按钮。
- 只需要「按钮 + 悬停提示」、无任何附加行为的场景。
- 不建议：需要发请求 / 二次确认 / 路由跳转 / 打开弹层时，直接使用对应按钮并配置它们的 `tips` 属性，无需再用本组件包裹。

### 注意事项

- **按需包裹**：`tips` 非空时才渲染 el-tooltip 包裹层；无提示内容时直接渲染 el-button，不增加 DOM 层级。
- `tipsType` 对应 el-tooltip 的 `effect`（`dark` / `light`）；`placement` 支持 `top` / `bottom` / `left` / `right`，默认 `top`。
- **不要重复包裹**：按钮组其他组件均已内置本组件的提示能力，直接用它们的 `tips` / `tipsType` / `placement` 属性即可，无需在外层再包一个 TipsButton。
- 本组件自身无内部 loading 逻辑，`loading` 属性经 `$attrs` 透传给 el-button，为 el-button 原生行为。
- `filter` 为按钮组统一的联动分组标识；本组件不发请求，不参与 `headRefreshDatagrid` 刷新联动。

### 常见问题

**问：`tips` 和 `label` 能同时用吗？**

可以。`label` 是按钮上的文案，`tips` 是鼠标悬停时气泡里的提示内容，互不影响。

**问：提示内容支持 HTML 或插槽吗？**

不支持。`tips` 为字符串，经 el-tooltip 的 `content` 属性展示，组件未暴露 tooltip 的内容插槽。

**问：按钮组其他组件的提示能力和本组件是什么关系？**

按钮组全部继承自 TipsButton，`tips` / `tipsType` / `placement` 三个属性在所有按钮上行为一致；TipsButton 是只含提示能力的最简形态。

### Element Plus 透传

- 透传目标：`el-button`
- 截获事件：`click`——组件 `defineEmits` 已声明同名事件，监听器不进入 `$attrs`，由组件内部处理后重新 emit，事件载荷以本文档 Events 为准（不要直接套用 Element Plus 原生载荷）。
- 说明：$attrs 全部透传给 el-button；悬停提示由组件内部 el-tooltip 承载（tips 等属性见 Props 表），el-tooltip 其他属性不经过透传。

### Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| label | `string` | '' | 按钮文案（未用默认插槽 / #button 插槽时显示） |
| type | `'primary' \| 'success' \| 'warning' \| 'info' \| 'danger'` | '' | 按钮类型（继承自 el-button） |
| size | `'large' \| 'default' \| 'small'` | 'default' | 按钮尺寸（继承自 el-button） |
| plain | `boolean` | false | 朴素按钮（继承自 el-button） |
| round | `boolean` | false | 圆角按钮（继承自 el-button） |
| circle | `boolean` | false | 圆形按钮（继承自 el-button） |
| link | `boolean` | false | 链接按钮（继承自 el-button） |
| text | `boolean` | false | 文字按钮样式（继承自 el-button；与按钮文案 label 相互独立） |
| bg | `boolean` | false | 文字按钮背景色（与 text 搭配，继承自 el-button） |
| disabled | `boolean` | false | 禁用（继承自 el-button） |
| icon | `string \| Component` | — | 图标组件（继承自 el-button） |
| native-type | `'button' \| 'submit' \| 'reset'` | 'button' | 原生 button 类型（继承自 el-button） |
| autofocus | `boolean` | false | 自动聚焦（继承自 el-button） |
| tag | `string` | 'button' | 渲染标签（继承自 el-button） |
| color | `string` | — | 自定义按钮颜色（继承自 el-button） |
| dark | `boolean` | false | 暗色模式（继承自 el-button） |
| loading | `boolean` | false | 加载中（继承自 el-button） |
| tips | `string` | '' | 悬停提示内容（非空时自动显示 tooltip） |
| tipsType | `'dark' \| 'light'` | 'dark' | tooltip 主题（继承自 TipsButton） |
| placement | `'top' \| 'bottom' \| 'left' \| 'right'` | 'top' | 弹出位置（继承自 TipsButton） |
| filter | `string` | '' | 联动分组标识 |

### Events

| 事件名 | 回调参数 | 说明 |
| --- | --- | --- |
| click | event | 按钮点击 |

### Slots

| 插槽 | 插槽参数 | 说明 |
| --- | --- | --- |
| default | — | 按钮内容（未设 label 时） |
