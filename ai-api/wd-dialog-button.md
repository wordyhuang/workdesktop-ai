> 本文件由脚本自动生成，请勿手工编辑。全部组件索引、阅读约定与 Element Plus 透传规则见 [README.md](./README.md)。数据源 `docs/src/api-meta/`，重生成：`npm run gen:ai-api`。

# WdDialogButton DialogButton 对话框按钮

点击打开对话框（mode=dialog 固定），支持 iframe 嵌入或内部插槽表单，关闭后声明式联动刷新

### 概述

WdDialogButton 点击打开对话框弹层（固定 `mode="dialog"`，即 WdDrawer 的 dialog 模式）。弹层内容支持两种方式：配置 `url` 后以 iframe 内嵌页面，或通过默认插槽放置任意内容（通常为 DataForm 表单）；弹层关闭后可按 `headRefreshDatagrid` 声明式刷新目标 DataGrid。组件内部组合 WdDrawer，弹层内容懒挂载——首次点击打开才渲染，避免内部 DataForm 提前发起请求。组件同时继承 TipsButton 的悬停提示能力与 el-button 的全部属性（经 `$attrs` 透传）。

### 何时使用

- 「新增 / 编辑」入口：点击按钮打开对话框表单，内部 DataForm 提交成功后自动关闭并刷新表格。
- 需要 iframe 内嵌页面（外部系统、独立页面）的对话框弹层场景。
- 弹层内容体量不大、居中弹窗展示比抽屉更合适的场景。
- 对比：内容较长、需要更大编辑空间时用 WdDrawerButton 的 `mode="drawer"` 抽屉；单字段 / 极简输入用 WdPromptButton 更轻。

### 注意事项

- **`size` 属性冲突**：本组件的 `size` 被「弹层尺寸（对话框宽度）」占用，el-button 的按钮尺寸请改用 `buttonSize`（`'large' | 'default' | 'small'`），否则两属性冲突。
- **弹层内容懒挂载**：首次点击打开才渲染弹层内容（`v-if="rendered"`），避免内部 DataForm 在页面加载时提前发起请求。
- **`url` 模式**：设置 `url` 后弹层内以 iframe 加载，`data` 会拼为 iframe 地址的 query；此时默认插槽内容不再渲染。
- **关闭后联动刷新**：`headRefreshDatagrid` 在弹层关闭后触发刷新（`true` = 同 `filter` 组 / 字符串 = 定向 filter 组）。
- **插槽参数**：默认插槽参数为 `{ data, close }`，可在弹层内容内调用 `close()` 主动关闭；`footer` 插槽参数（footerProps）内含 `close`，可用于自定义底部按钮。
- **与 DrawerButton 的差异**：本组件固定对话框形态（无 `mode` / `direction` / `reloadOnOpen`），按钮 `type` 默认 `primary`；需要抽屉形态时使用 WdDrawerButton。
- `confirm` 事件为内部 confirm 透传，在弹层完成关闭后触发，回调参数携带关闭相关信息。

### 常见问题

**问：给按钮设置 `size` 为什么不生效？**

`size` 被「弹层尺寸（对话框宽度）」占用；调整按钮尺寸请用 `button-size`，调整弹层宽度才用 `size`。

**问：如何在弹层内容里主动关闭弹层？**

默认插槽参数提供 `close`，例如 `<template #default="{ data, close }">` 中调用 `close()`；`footer` 插槽参数同样内含 `close`。

**问：与 DrawerButton 怎么选？**

本组件固定弹出对话框（居中）；内容较长、需要更大编辑空间时用 WdDrawerButton 的抽屉模式。

**问：iframe 模式每次打开都会重新加载吗？**

默认保留上次内容。对话框场景如需每次全新加载，可给内部 iframe 地址变化（如拼时间戳）或在父级控制弹层重建。

### Element Plus 透传

- 透传目标：`el-button`
- 说明：$attrs 只透传给触发按钮（外部 @click 仍会在点击时正常触发，组件自身不声明 click）；内部 el-dialog 弹层不接收外部属性/事件，弹层行为通过组件 props 与 open/close/confirm 事件控制。

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
| title | `string` | '' | 弹层标题 |
| url | `string` | '' | iframe 地址（设置后弹层内以 iframe 加载） |
| data | `object` | {} | 传给内部表单/iframe 的数据 |
| size | `string \| number` | '50%' | 弹层尺寸（对话框宽度） |
| buttonSize | `'large' \| 'default' \| 'small'` | 'default' | 按钮尺寸（el-button size；本组件 size 为弹层尺寸，按钮尺寸请用 buttonSize） |
| headRefreshDatagrid | `boolean \| string` | false | 关闭后刷新目标 DataGrid |
| filter | `string` | '' | 联动分组标识 |

### Events

| 事件名 | 回调参数 | 说明 |
| --- | --- | --- |
| open | — | 弹层打开 |
| close | — | 弹层关闭 |
| confirm | payload | 内部 confirm 透传 |

### Slots

| 插槽 | 容器 id | 插槽参数 | 说明 |
| --- | --- | --- | --- |
| button | — | — | 触发按钮内容（未设 label 时） |
| default | — | { data, close } | 弹层内容（通常为 DataForm） |
| footer | — | footerProps | 弹层底部 |
