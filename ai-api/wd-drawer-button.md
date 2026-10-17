> 本文件由脚本自动生成，请勿手工编辑。全部组件索引、阅读约定与 Element Plus 透传规则见 [README.md](./README.md)。数据源 `docs/src/api-meta/`，重生成：`npm run gen:ai-api`。

# WdDrawerButton DrawerButton 弹层按钮

点击打开弹层，通过 mode 切换抽屉（drawer）/ 对话框（dialog）；支持 iframe 嵌入或内部插槽表单，关闭后声明式联动刷新

### 概述

WdDrawerButton 点击打开弹层，通过 `mode` 切换弹出形式：`drawer` 抽屉（默认）/ `dialog` 对话框。弹层内容支持两种方式：配置 `url` 后以 iframe 内嵌页面，或通过默认插槽放置任意内容（通常为 DataForm 表单）；弹层关闭后可按 `headRefreshDatagrid` 声明式刷新目标 DataGrid。组件内部组合 WdDrawer，弹层内容懒挂载——首次点击打开才渲染，避免内部 DataForm 提前发起请求。组件同时继承 TipsButton 的悬停提示能力与 el-button 的全部属性（经 `$attrs` 透传）。

### 何时使用

- 「新增 / 编辑」入口：点击按钮打开抽屉表单，内部 DataForm 提交成功后自动关闭并刷新表格。
- 需要 iframe 内嵌页面（外部系统、独立页面）的弹层场景。
- 轻量内容用 `mode="dialog"` 对话框，表单类内容用默认的 `mode="drawer"` 抽屉。
- 对比：单字段 / 极简输入用 WdPromptButton 更轻；字段多、需要完整表单空间时用本组件。

### 注意事项

- **两个尺寸各管各的**：`size` 是触发按钮的尺寸（el-button 原生：`'large' | 'default' | 'small'`）；弹层宽高用 `drawerSize`（默认 `50%`，数字按 px 处理），两者不再冲突。
- **弹层内容懒挂载**：首次点击打开才渲染弹层内容（`v-if="rendered"`），避免内部 DataForm 在页面加载时提前发起请求。
- **`url` 模式**：设置 `url` 后弹层内以 iframe 加载，`data` 会拼为 iframe 地址的 query；此时默认插槽内容不再渲染。
- **关闭后联动刷新**：`headRefreshDatagrid` 在弹层关闭后触发刷新（`true` = 同 `filter` 组 / 字符串 = 定向 filter 组）。
- **插槽参数**：默认插槽参数为 `{ data, close }`，可在弹层内容内调用 `close()` 主动关闭；`footer` 插槽参数（footerProps）内含 `close`，可用于自定义底部按钮。
- `confirm` 事件为内部 confirm 透传，在弹层完成关闭后触发，回调参数携带关闭相关信息。

### 常见问题

**问：怎么分别控制按钮大小和抽屉宽度？**

按钮大小用 `size`（el-button 原生 large/default/small）；抽屉宽高用 `drawer-size`（默认 50%，可传像素数字或 CSS 长度）。

**问：如何在弹层内容里主动关闭弹层？**

默认插槽参数提供 `close`，例如 `<template #default="{ data, close }">` 中调用 `close()`；`footer` 插槽参数同样内含 `close`。

**问：`direction` 在 `mode="dialog"` 时生效吗？**

不生效。`direction` 仅 `mode="drawer"` 时控制抽屉弹出方向。

**问：iframe 模式每次打开都会重新加载吗？**

默认保留上次内容；组件提供 `reload-on-open` 属性，开启后每次打开弹层都会重新加载 iframe 内容（仅 `url` 模式生效）。

### Element Plus 透传

- 透传目标：`el-button`
- 说明：$attrs 只透传给触发按钮（内部按 { ...$attrs, size } 合并，size 为组件显式 prop）；内部 wd-drawer 弹层不接收外部属性/事件，弹层行为通过组件 props 与 open/close/confirm 事件控制。

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
| mode | `'drawer' \| 'dialog'` | 'drawer' | 弹出形式：抽屉 / 对话框 |
| title | `string` | '' | 弹层标题 |
| url | `string` | '' | iframe 地址（设置后弹层内以 iframe 加载） |
| data | `object` | {} | 传给内部表单/iframe 的数据 |
| drawerSize | `string \| number` | '50%' | 弹层尺寸（抽屉宽/高，对话框宽度；数字按 px）。按钮尺寸用 size |
| direction | `'rtl' \| 'ltr' \| 'ttb' \| 'btt'` | 'rtl' | 抽屉弹出方向（仅 mode=drawer 生效） |
| headRefreshDatagrid | `boolean \| string` | false | 关闭后刷新目标 DataGrid |
| filter | `string` | '' | 联动分组标识 |

### Events

| 事件名 | 回调参数 | 说明 |
| --- | --- | --- |
| open | — | 弹层打开 |
| close | — | 弹层关闭 |
| confirm | payload | 内部 confirm 透传 |

### Slots

| 插槽 | 插槽参数 | 说明 |
| --- | --- | --- |
| button | — | 触发按钮内容（未设 label 时） |
| default | { data, close } | 弹层内容（通常为 DataForm） |
| footer | footerProps | 弹层底部 |
