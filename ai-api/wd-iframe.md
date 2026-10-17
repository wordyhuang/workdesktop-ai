> 本文件由脚本自动生成，请勿手工编辑。全部组件索引、阅读约定与 Element Plus 透传规则见 [README.md](./README.md)。数据源 `docs/src/api-meta/`，重生成：`npm run gen:ai-api`。

# WdIframe Iframe 内嵌框架

内嵌 iframe 子页面：固定/自适应高度，与子页面基于 postMessage 双向通信。自动检测子页面加载：加载完成前在容器内显示 loading 遮罩（文案/背景跟随全局配置 request.loading），加载完成触发 complete 事件；支持超时自动关闭遮罩（timeout），开发人员可用 loading=false 关闭遮罩。通信约定：子页面通过 parent.postMessage 上报，父组件经 message 事件透传；内置约定 { type:"wd-iframe-height", height } 可驱动高度自适应；如需与弹层容器（WdDrawer）深度联动，参见 WdDrawer 的跨 iframe 联动

### 概述

WdIframe 在页面内嵌 iframe 子页面，宽度占满父容器，高度支持固定值或按约定自适应。组件自动检测子页面加载状态：从开始加载（或 src 变化、刷新）到子页面 `load` 完成之前，在容器内显示 loading 遮罩；遮罩的启用与否、文案与背景外观跟随全局配置 `request.loading`，加载完成后触发 `complete` 事件。可通过 `timeout` 设置超时，超时后自动关闭遮罩并触发 `timeout`；开发人员传 `loading=false` 可彻底关闭遮罩。组件与子页面基于 postMessage 双向通信：子页面通过 `parent.postMessage` 上报，父组件经 `message` 事件透传；父组件通过 `send()` 方法主动下发。内置约定 `{ type: "wd-iframe-height", height }` 可驱动高度自适应；`refreshKey` 或 `refresh()` 可强制重新加载 iframe 内容。如需与弹层容器（WdDrawer）深度联动（提交成功自动关闭、未保存守卫等），请参见 WdDrawer 的跨 iframe 联动。

### 何时使用

- 需要在当前页面内嵌一个独立子页面（报表页、第三方页、遗留系统页面）时。
- 需要父子页面之间做轻量双向通信（下发数据、接收子页状态）时。
- 子页面内容高度不固定，希望容器随内容自动伸缩时。
- 不建议：弹层形式的内嵌页（抽屉/对话框 + iframe），直接使用 WdDrawer 的 `url` 模式，可获得关闭守卫、提交联动等完整能力。
- 不建议：同源且可组件化的内容，优先用 Vue 组件而非 iframe，避免通信与样式隔离成本。

### 注意事项

- iframe 宽度固定占满父容器（100%）；`height` 传数字时按 px 处理，也可传任意 CSS 长度。
- loading 遮罩显示在 iframe 容器内部（不是全屏），覆盖在 iframe 之上；是否显示的默认值取全局 `request.loading.enable`，文案/背景/spinner 取全局 `request.loading.props`，因此改一处全局配置即可统一所有 iframe 的加载外观。
- `loading` 三态：不传跟随全局；`true` 强制显示；`false` 关闭遮罩（开发人员自主接管加载呈现）。
- `timeout` 为毫秒数，超时后自动关闭遮罩并触发 `timeout` 事件（回调 `{ timeout }`）；默认 `0` 表示永不超时。子页面在超时前正常加载完成则不会触发。
- `complete` 在子页面 `load` 完成、遮罩关闭时触发；`load` 事件保留原生语义，两者同时触发，可按需选用。
- `src` 变化、`refreshKey` 变化或调用 `refresh()` 都会重新进入 loading；组件卸载时会清理超时计时器，不会残留。
- `autoHeight` 依赖子页面主动上报 `{ type: 'wd-iframe-height', height }`；`height` 会转为数字，无法解析时不调整高度。子页内容高度变化后需再次上报。
- `send()` 的 targetOrigin 取 `origin` 属性，缺省为当前页 origin；跨域子页面必须显式设置 `origin`（如 `https://child.example.com`），演示场景才使用 `'*`。
- 刷新有两种等价方式：`refreshKey` 值变化（声明式，适合「每次显示时自增」）与 `ref.refresh()`（命令式）。二者都是重建 iframe 元素，子页状态不会保留。
- `refreshKey` 仅在 iframe 常驻 DOM 时才需要；若 iframe 随条件渲染（如弹层每次打开重建），天然就是全新加载，无需配置。
- 消息监听挂在 `window` 上并在组件卸载时移除，不会泄漏；`message` 事件对子页所有 postMessage 原始透传，建议子页消息统一带 `type` 字段以便父级分拣。

### 常见问题

**问：`complete` 和 `load` 有什么区别？**

两者在同一时机（子页面 load 完成）触发，参数都为空。`load` 保留原生语义与向后兼容，`complete` 语义上明确表示「加载完成、loading 已关闭」，新代码监听 `complete` 即可。

**问：不想显示 iframe 的 loading 遮罩怎么办？**

设置 `:loading="false"` 可关闭该 iframe 的遮罩；想全局统一关闭可配置全局 `request.loading.enable=false`。

**问：子页面一直打不开，遮罩会一直转吗？**

默认不超时（timeout=0）。建议给慢页面设置 `:timeout="5000"`，到时自动关闭遮罩并触发 `timeout` 事件，便于兜底提示。

**问：子页面发了消息，父组件 `@message` 没收到？**

请确认子页面使用的是 `parent.postMessage(...)` 且 iframe 未嵌套多层；跨域场景下子页面 postMessage 的 targetOrigin 需与父页 origin 匹配（或按演示方式用 `'*`）。

**问：调用了 `send()`，子页面没反应？**

先确认 iframe 已加载完成（`load` 事件后再发送）；跨域时检查 `origin` 是否配置为子页面的真实 origin；子页面需用 `window.addEventListener('message', ...)` 接收。

**问：开启了 `autoHeight`，但高度不变化？**

确认子页面按约定上报了 `{ type: 'wd-iframe-height', height }`，且 `height` 为可解析的数字；内容后续变化时需要子页再次上报新高度。

**问：想让弹层里的 iframe 提交后自动关闭并刷新表格，用 WdIframe 怎么做？**

WdIframe 本身只做内嵌与通信透传；该场景请使用 WdDrawer 的 `url` 模式，配合 `wd-container:*` 协议与 `head-refresh-datagrid` 实现完整联动，详见《Drawer 抽屉 / 对话框容器》文档。

### Element Plus 透传

- 透传目标：`—（不透传）`
- 说明：内部为原生 iframe（非 Element Plus 组件）；根节点上的 loading 相关绑定来自 v-loading 指令而非 $attrs，外部属性/事件不会透传。

### Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| src | `string` | '' | iframe 地址 |
| height | `string \| number` | '480px' | 固定高度（数字按 px） |
| autoHeight | `boolean` | false | 高度自适应：子页面上报 { type:"wd-iframe-height", height } 后自动调整 |
| origin | `string` | '' | send 发送时的 targetOrigin（默认同源；跨域时显式指定子页面 origin） |
| refreshKey | `string \| number` | 0 | 刷新信号：值变化时强制重新加载 iframe 内容（适合每次显示时自增触发刷新） |
| loading | `boolean` | undefined | 是否显示加载遮罩：不传跟随全局 request.loading.enable；true 强制显示；false 关闭 loading |
| timeout | `number` | 0 | 加载超时（毫秒），超时自动关闭遮罩并触发 timeout；0 表示不限制 |

### Events

| 事件名 | 回调参数 | 说明 |
| --- | --- | --- |
| load | — | iframe 原生 load 完成 |
| complete | — | 子页面加载完成、loading 关闭时触发 |
| timeout | { timeout } | 加载超时（遮罩已自动关闭） |
| message | data | 收到子页面 postMessage（任意消息透传） |

### 暴露方法（通过 ref 调用）

| 方法 | 参数 | 返回值 | 说明 |
| --- | --- | --- | --- |
| send(message) | message: any | void | 父 → 子：向 iframe 内页面发送消息（子页用 window.addEventListener("message") 接收） |
| refresh() | — | void | 强制重新加载 iframe 内容（重建 iframe 元素） |
