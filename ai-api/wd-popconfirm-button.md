> 本文件由脚本自动生成，请勿手工编辑。全部组件索引、阅读约定与 Element Plus 透传规则见 [README.md](./README.md)。数据源 `docs/src/api-meta/`，重生成：`npm run gen:ai-api`。

# WdPopconfirmButton PopconfirmButton 气泡确认按钮

基于 ApiButton 与 el-popconfirm：点击弹出气泡确认，用户确认后自动请求 API；同时支持悬停提示（el-tooltip）——hover 显示提示、click 弹出确认，两者互不冲突

### 概述

WdPopconfirmButton 基于 ApiButton 与 el-popconfirm：点击按钮先就地弹出气泡确认层，用户点击「确定」后才自动发起 API 请求，请求期间按钮自动 loading，响应按统一协议 `{ code, data, message }` 解封并给出成功 / 失败提示，请求结果通过 `apiSuccess` / `apiFail` / `apiException` 等事件完整抛出。组件同时支持悬停提示（el-tooltip）——tooltip 与 popconfirm 平级、通过 virtual-ref 指向同一按钮，hover 显示提示、click 弹出确认，两者互不嵌套、互不冲突。请求成功后还可通过 `headRefreshDatagrid` 声明式刷新目标 DataGrid。

### 何时使用

- 删除、禁用、发布等需要二次确认的危险操作，且希望确认层轻量、就地弹出（不遮挡页面）。
- 表格操作列、工具栏等密集操作区的确认类按钮。
- 确认后要发起请求并自动刷新表格的场景（配合 `filter` / `headRefreshDatagrid`）。
- 对比：WdConfirmButton 弹出居中模态确认框（ElMessageBox），阻断感更强；WdPopconfirmButton 是贴着按钮的气泡，更轻量。
- 不建议：无需确认的请求直接用 WdApiButton；需要用户输入内容的操作用 WdPromptButton。

### 注意事项

- **`popIcon` / `popDisabled` 改名原因**：el-popconfirm 的 `icon` / `disabled` 与经 `$attrs` 透传给 el-button 的同名属性冲突，因此组件将其改名为 `popIcon` / `popDisabled`；el-button 的 `icon` / `disabled` 仍可正常透传使用。
- **`placement` 一处配置两处生效**：弹出位置复用 TipsButton 的 `placement` 属性，同时作用于悬停提示（tooltip）与确认弹层（popconfirm）。
- **外部 `loading` 透传会被覆盖**：组件内部已显式绑定 `:loading`（由 `buttonLoading` 控制），因此 Props 表未列出 el-button 的 `loading`；想关闭按钮转圈请用 `:button-loading="false"`。
- **确认才发请求**：事件顺序为 `click` →（弹层确认）→ `confirm` → `apiBefore` → `apiSuccess` / `apiFail` / `apiException` → `apiAfter`；点击「取消」仅触发 `cancel`，不会发起请求。
- 统一请求协议：响应按 `{ code, data, message }` 解封；业务失败走 `apiFail`（Promise 正常 resolve，不抛异常），网络异常走 `apiException`。
- `api` 为空时，用户确认后不会发起请求，仅触发 `confirm` 事件，可直接当纯确认按钮使用。

### 常见问题

**问：hover 悬停提示和 click 气泡确认会冲突吗？**

不会。el-tooltip 与 el-popconfirm 平级、通过 virtual-ref 指向同一按钮，互不嵌套：hover 显示提示、click 弹出确认。

**问：如何只禁用确认弹层、不禁用按钮本身？**

用 `pop-disabled`（对应 el-popconfirm 的 disabled）；`disabled` 禁用的是按钮本身。

**问：确认弹层的图标怎么换？**

用 `pop-icon` / `pop-icon-color`。命名带 pop 前缀是为了避开 el-button 的 `icon` 透传冲突。

**问：确认后请求失败会怎样？**

弹层已关闭，按钮 loading 结束，触发 `api-fail` 并按全局配置给出失败提示；可监听 `api-fail` 做二次处理。

### Element Plus 透传

- 透传目标：`el-button / el-popconfirm`
- 截获事件：`click`、`confirm`、`cancel`、`show`、`hide`——组件 `defineEmits` 已声明同名事件，监听器不进入 `$attrs`，由组件内部处理后重新 emit，事件载荷以本文档 Events 为准（不要直接套用 Element Plus 原生载荷）。
- 说明：$attrs 全部透传给触发按钮；气泡确认框的属性均为组件显式 props（popIcon、popDisabled 等改名版，见 Props 表），不经 $attrs 透传。show/hide 弹层事件同样被组件原样重发。

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
| tips | `string` | '' | 悬停提示内容（非空时自动显示 tooltip） |
| tipsType | `'dark' \| 'light'` | 'dark' | tooltip 主题（继承自 TipsButton） |
| placement | `'top' \| 'bottom' \| 'left' \| 'right'` | 'top' | 弹出位置（继承自 TipsButton） |
| title | `string` | '' | 确认提示标题（继承自 el-popconfirm） |
| confirmButtonText | `string` | '确定' | 确定按钮文案（继承自 el-popconfirm） |
| cancelButtonText | `string` | '取消' | 取消按钮文案（继承自 el-popconfirm） |
| confirmButtonType | `'primary' \| 'success' \| 'warning' \| 'danger' \| 'info' \| 'text'` | 'primary' | 确定按钮类型（继承自 el-popconfirm） |
| cancelButtonType | `'primary' \| 'success' \| 'warning' \| 'danger' \| 'info' \| 'text'` | 'text' | 取消按钮类型（继承自 el-popconfirm） |
| popIcon | `string \| Component` | — | 弹层图标（对应 el-popconfirm 的 icon，改名避免与 el-button icon 冲突） |
| popIconColor | `string` | '#f90' | 弹层图标颜色 |
| hideAfter | `number` | 200 | 关闭动画时长 ms（继承自 el-popconfirm） |
| popDisabled | `boolean` | false | 禁用确认弹层（对应 el-popconfirm 的 disabled，改名避免冲突） |
| width | `string \| number` | 150 | 弹层宽度（继承自 el-popconfirm） |
| trigger | `'click' \| 'hover' \| 'focus' \| 'contextmenu'` | 'click' | 触发方式（继承自 el-popconfirm） |
| popperClass | `string` | '' | 弹层自定义类名（继承自 el-popconfirm） |
| popperOptions | `object` | — | popper 配置（继承自 el-popconfirm） |
| showAfter | `number` | 0 | 显示延迟 ms（继承自 el-popconfirm） |
| teleported | `boolean` | true | 是否挂载到 body（继承自 el-popconfirm） |
| persistent | `boolean` | false | 关闭时是否保留内容（继承自 el-popconfirm） |
| api | `string` | '' | 请求地址；为空则不请求 |
| apiMethod | `'get' \| 'post' \| 'put' \| 'delete'` | 'post' | 请求方法 |
| apiParam | `object` | {} | 请求参数，点击时提交 |
| buttonLoading | `boolean` | true | 按钮级 loading（false 时按钮不转圈） |
| pageLoading | `boolean` | false | 页面级 loading（全局遮罩 ElLoading） |
| headRefreshDatagrid | `boolean \| string` | false | 成功后刷新目标 DataGrid（true=同组 / 字符串=定向） |
| filter | `string` | '' | 联动分组标识 |

### Events

| 事件名 | 回调参数 | 说明 |
| --- | --- | --- |
| click | event | 按钮点击 |
| apiBefore | { url, method, params } | 请求前 |
| apiSuccess | { data, code, message } | 请求成功 |
| apiFail | { code, message } | 业务失败 |
| apiException | { error, message } | 网络异常 |
| apiAfter | { data?, error? } | 请求完成 |
| confirm | — | 用户点击「确定」（随后自动请求 API） |
| cancel | — | 用户点击「取消」 |
| show | — | 弹层显示 |
| hide | — | 弹层隐藏 |

### Slots

| 插槽 | 容器 id | 插槽参数 | 说明 |
| --- | --- | --- | --- |
| default | — | — | 按钮内容（未设 label 时） |
