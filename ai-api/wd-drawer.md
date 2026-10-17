> 本文件由脚本自动生成，请勿手工编辑。全部组件索引、阅读约定与 Element Plus 透传规则见 [README.md](./README.md)。数据源 `docs/src/api-meta/`，重生成：`npm run gen:ai-api`。

# WdDrawer Drawer 抽屉 / 对话框容器

基于 el-drawer / el-dialog：通过 mode 切换抽屉（drawer，默认）与对话框（dialog）；iframe 嵌入、关闭前确认、内容守卫（未保存拦截）、关闭后联动刷新；跨 iframe 联动：url 模式下自动与 iframe 内页面建立 postMessage 桥接，子页面上报事件透传为 iframe-* emit，可驱动关闭+刷新

### 概述

WdDrawer 基于 `el-drawer` / `el-dialog` 封装，通过 `mode` 切换抽屉（`drawer`，默认）与对话框（`dialog`）两种弹出形式。除承载任意插槽内容外，设置 `url` 后容器内部自动渲染填满的 iframe 加载子页面，并自动建立 postMessage 桥接：子页面上报的协议事件透传为 `iframe-*` 事件，子页提交成功可驱动抽屉自动关闭并联动刷新同组 DataGrid。组件内置关闭前确认（`confirmMessage`）与未保存内容守卫（`wd-container:dirty` 协议），适合详情查看、表单编辑等弹层场景。

### 何时使用

- 从列表页打开详情或编辑表单，希望以抽屉/对话框弹层承载，不跳转页面时。
- 弹层内容是一个独立页面（已有路由页或第三方页），希望通过 `url` 以 iframe 嵌入并与父页联动时。
- 关闭弹层前需要确认（有未保存内容），或关闭后需要自动刷新列表数据时。
- 不建议：简单的提示、二次确认，使用 `ElMessageBox` 更直接。
- 不建议：内容长期固定在页面内展示，不需要弹层形态时，使用 WdPanel 等内联容器。

### 注意事项

- 弹层渲染到 `body`（append-to-body），不受父级布局裁剪影响；`size` 传数字时按 px 处理，抽屉模式可传百分比（如 `40%`）。
- `url` 模式下 `data` 会拼为 iframe 地址的 query 参数，同时在子页上报 `ready` 后通过 `wd-container:init` 再次下发完整 `data`，子页以协议接收为准。
- `url` 模式下 iframe 高度由组件接管：抽屉模式为容器高度的 100%（最小 400px），对话框模式为 60vh；默认插槽内容在 `url` 设置时不渲染。
- `reloadOnOpen` 默认 `false`，iframe 在关闭后保留上次内容；需要每次打开都是全新状态时显式开启。
- `origin` 缺省时取 `url` 的 origin（无 `url` 时用当前页 origin）；示例中的 `origin="*"` 仅用于演示，生产环境请指定具体子页面 origin。
- `confirmMessage` 与脏状态守卫可叠加：子页未上报脏状态时走 `confirmMessage` 确认；已上报脏状态时优先走 `wd-container:dirty-confirm` 子页确认流程。
- 抽屉模式提供非空 `title` 后，标题区高度自适应，上下 padding 为 12px，标题文字与关闭按钮垂直居中（左右内边距保留默认）；不提供 `title` 时保持原生标题区样式。dialog 模式不受影响。

### 常见问题

**问：`confirm` 事件和 `close` 事件有什么区别？**

`close` 表示弹层关闭完成；`confirm` 在关闭流程完成后触发并携带 `{ reason }`（如 `submit`、`close` 等关闭原因），适合做「关闭后处理」的统一入口。

**问：子页提交了 `wd-container:submit-success`，但表格没有刷新？**

请确认 WdDrawer 设置了 `head-refresh-datagrid`，且其 `filter` 与目标 DataGrid 的 `filter` 一致（或用字符串形式定向指定目标 `filter`）。

**问：为什么每次打开抽屉，iframe 还显示上次的内容？**

`reloadOnOpen` 默认为 `false`，iframe 内容在关闭后保留；需要每次打开重新加载时请设置 `reload-on-open`。

**问：不用 `v-model`，能从按钮以外的逻辑打开抽屉吗？**

可以。给组件加 `ref` 后调用 `open()` 方法，效果等同将 `v-model` 置为 `true`。

### Element Plus 透传

- 透传目标：`el-drawer / el-dialog（按 mode 切换）`
- 截获事件：`close`——组件 `defineEmits` 已声明同名事件，监听器不进入 `$attrs`，由组件内部处理后重新 emit，事件载荷以本文档 Events 为准（不要直接套用 Element Plus 原生载荷）。
- 说明：两种模式的内部弹层均绑定 $attrs；append-to-body、before-close 由组件显式接管。组件重新 emit 的 close 在弹层关闭动画结束后触发，外部监听 el 原生事件时以本文档 Events 为准。

### Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| mode | `'drawer' \| 'dialog'` | 'drawer' | 弹出形式：抽屉 / 对话框 |
| direction | `'rtl' \| 'ltr' \| 'ttb' \| 'btt'` | 'rtl' | 抽屉弹出方向（仅 mode=drawer 生效） |
| origin | `string` | '' | iframe 消息安全校验来源（默认取 url 的 origin；留空且无 url 时用当前页 origin） |
| reloadOnOpen | `boolean` | false | 每次打开时重新加载 iframe 内容（url 模式生效；true 强制刷新，false 保留上次内容） |
| modelValue | `boolean` | false | 显隐（v-model） |
| title | `string` | '' | 标题（drawer 模式提供后，标题区高度自适应、上下 padding 12px、垂直居中） |
| url | `string` | '' | iframe 地址（设置后容器内以 iframe 加载） |
| size | `string \| number` | '50%' | 尺寸（数字按 px） |
| confirmMessage | `string` | '' | 关闭前确认文案（设置后关闭弹确认） |
| data | `object` | — | 容器携带数据（传给内部表单，url 模式拼为 query） |
| headRefreshDatagrid | `boolean \| string` | false | 关闭后刷新目标 DataGrid |
| filter | `string` | '' | 联动分组标识 |

### Events

| 事件名 | 回调参数 | 说明 |
| --- | --- | --- |
| update:modelValue | boolean | 显隐变化 |
| open | — | 打开 |
| close | — | 关闭完成 |
| confirm | { reason } | 关闭流程完成 |
| iframe-message | { type, payload } | iframe 发来的任意协议消息（原始透传） |
| iframe-ready | — | iframe 就绪，请求下发数据 |
| iframe-dirty | { dirty } | iframe 上报脏状态（未保存守卫自动注册） |
| iframe-submit-success | any | iframe 提交成功（默认自动关闭+刷新） |

### Slots

| 插槽 | 容器 id | 插槽参数 | 说明 |
| --- | --- | --- | --- |
| default | — | — | 内容（url 未设置时） |
| footer | — | { close } | 底部 |

### 暴露方法（通过 ref 调用）

| 方法 | 参数 | 返回值 | 说明 |
| --- | --- | --- | --- |
| open() | — | void | 编程式打开弹层（等同 v-model 置 true，供自定义触发使用） |
| sendToIframe(type, payload?) | type: string, payload?: any | void | 向 iframe 内发送指令（如 wd-container:submit 触发子页表单提交） |
