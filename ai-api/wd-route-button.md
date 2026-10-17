> 本文件由脚本自动生成，请勿手工编辑。全部组件索引、阅读约定与 Element Plus 透传规则见 [README.md](./README.md)。数据源 `docs/src/api-meta/`，重生成：`npm run gen:ai-api`。

# WdRouteButton RouteButton 路由按钮

基于 el-button 的路由跳转，支持 name/path、params/query 与 target=_blank 新窗口

### 概述

WdRouteButton 是基于 el-button 的路由跳转按钮，支持 `routeName` / `routePath` 两种定位方式、`params` / `query` 传参与 `target="_blank"` 新窗口打开。当前窗口跳转优先走 vue-router（`router.push`）；无 vue-router 环境时自动退化到 `location.href`，在无路由体系的项目里也能直接使用。组件同时继承 TipsButton 的悬停提示能力与 el-button 的全部属性（经 `$attrs` 透传）。

### 何时使用

- 「查看」「编辑」「详情」等纯页面跳转的操作按钮。
- 需要携带 query 参数新窗口打开页面的场景（如报表、打印页）。
- 无 vue-router 环境也需要跳转能力的场景（自动退化为 location 跳转）。
- 不建议：点击后要发 API 请求的操作用 WdApiButton 系列；需要二次确认或输入的操作用 WdPopconfirmButton / WdPromptButton。

### 注意事项

- **`routeName` 优先**：两者同时配置时走 `routeName`（`router.push({ name, params, query })`）；只配 `routePath` 时走 `router.push({ path, query })`。
- **`target="_blank"` 仅支持 `routePath`**：新窗口模式通过拼 URL 后 `window.open` 实现，`routeName` 与 `params` 在新窗口模式下不生效。
- **无 router 环境自动退化**：当前窗口跳转取不到 `$router` 时，退化为 `window.location.href = routePath + query`（需配置 `routePath`）。
- `routeName` 与 `routePath` 都不配置时仅触发 `click` 事件，可当普通按钮使用。
- `click` 事件先于跳转触发，可在 `click` 中做埋点或跳转前拦截处理。
- `filter` 为按钮组统一的联动分组标识；本组件不发请求，不参与 `headRefreshDatagrid` 刷新联动。

### 常见问题

**问：`routeName` 和 `routePath` 都配置了走哪个？**

`routeName` 优先；`routeName` 为空时才使用 `routePath`。

**问：新窗口打开时参数怎么带？**

`query` 会以 URLSearchParams 拼接到 `routePath` 之后，如 `/user/detail?id=2`。

**问：项目没有接 vue-router 能用吗？**

可以。当前窗口跳转自动退化为 `location.href` 跳转（需配置 `routePath`）。

**问：想要链接 / 文字样式的跳转按钮？**

直接传 `link` 或 `text`（继承自 el-button），配合 `route-path` 即可。

### Element Plus 透传

- 透传目标：`el-button`
- 截获事件：`click`——组件 `defineEmits` 已声明同名事件，监听器不进入 `$attrs`，由组件内部处理后重新 emit，事件载荷以本文档 Events 为准（不要直接套用 Element Plus 原生载荷）。
- 说明：$attrs 全部透传给 el-button；点击事件被组件接管执行路由跳转，跳转目标由 to/replace 等组件 props 决定，不要同时用 el-button 的原生跳转行为。

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
| routeName | `string` | '' | 路由 name（与 routePath 二选一） |
| routePath | `string` | '' | 路由 path |
| params | `object` | {} | 路由 params |
| query | `object` | {} | 路由 query |
| target | `'_self' \| '_blank'` | '_self' | 打开方式 |
| filter | `string` | '' | 联动分组标识 |

### Events

| 事件名 | 回调参数 | 说明 |
| --- | --- | --- |
| click | event | 按钮点击 |

### Slots

| 插槽 | 容器 id | 插槽参数 | 说明 |
| --- | --- | --- | --- |
| default | — | — | 按钮内容（未设 label 时） |
