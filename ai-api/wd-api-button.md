> 本文件由脚本自动生成，请勿手工编辑。全部组件索引、阅读约定与 Element Plus 透传规则见 [README.md](./README.md)。数据源 `docs/src/api-meta/`，重生成：`npm run gen:ai-api`。

# WdApiButton ApiButton 请求按钮

点击发起 API 请求，自动 loading、成功提示与声明式联动刷新

### 概述

WdApiButton 是按钮组中最基础的请求类按钮：点击后按 `api` / `apiMethod` / `apiParam` 发起 API 请求，请求期间按钮自动进入 loading，响应按统一协议 `{ code, data, message }` 解封后给出成功 / 失败提示，并将结果通过 `apiSuccess` / `apiFail` / `apiException` 等事件完整抛出。请求成功后还可通过 `headRefreshDatagrid` 声明式刷新目标 DataGrid，无需手写联动代码。组件同时继承 TipsButton 的悬停提示能力与 el-button 的全部属性（经 `$attrs` 透传）。

### 何时使用

- 「保存」「提交」「导出」「同步」等点击即发请求的操作按钮。
- 请求成功后需要自动刷新页面表格的场景（配合 `filter` / `headRefreshDatagrid`）。
- 需要完整请求生命周期事件做埋点、二次处理或自定义结果处理的场景。
- 不建议：删除等需要二次确认的危险操作，请使用 WdConfirmButton / WdPopconfirmButton；纯页面跳转请使用 WdRouteButton。

### 注意事项

- **loading 图标只替换原有 icon 位**：请求中的旋转图标只出现在按钮自身配置的图标位置（el-button `icon` 属性或 `#icon` 插槽），原图标被 Loading 动画替换、结束后恢复；**按钮没有配置 icon 时，请求中不显示任何 loading 图标**，仅自动禁用按钮防止重复点击。
- **外部 `loading` 透传不生效**：组件内部自行管理 loading（由 `buttonLoading` 控制），透传 el-button 的 `loading` 不会生效；想关闭按钮 loading 反馈请用 `:button-loading="false"`。
- `api` 为空时不发起请求，仅触发 `click`，可直接当普通按钮使用。
- 请求参数提交位置随方法变化：`get` / `delete` 拼到 query，`post` / `put` 放入请求体。
- 统一请求协议：响应按 `{ code, data, message }` 解封（字段名可在全局配置修改）；默认 `code >= successCode`（默认 0）视为成功。业务失败走 `apiFail`（Promise 正常 resolve，不抛异常），网络异常走 `apiException`。
- 成功 / 失败提示的文案来自后端返回的 `message`，提示方式由全局 `response` 配置控制；`pageLoading` 会开启全局 ElLoading 遮罩，适合耗时请求。
- 事件触发顺序：`click` → `apiBefore` → `apiSuccess` / `apiFail` / `apiException` → `apiAfter`。

### 常见问题

**问：如何拿到后端返回的业务数据？**

监听 `api-success`，回调参数为 `{ data, code, message }`，其中 `data` 即后端返回的业务数据本体，组件不对其做字段提取。

**问：为什么点击后看不到 loading 图标？**

loading 图标只渲染在按钮原有的 icon 位。若按钮没有配置 `icon`（或 `#icon` 插槽），请求中不会出现 loading 图标，但按钮仍会自动禁用防重复提交；给按钮配上 `icon` 即可看到图标旋转。

**问：不想让按钮出现 loading 反馈？**

设 `:button-loading="false"`；如需全局遮罩，改用 `:page-loading="true"`。

**问：业务失败会抛异常吗？**

不会。业务失败（code 未达成功码）触发 `api-fail` 并正常结束，只有网络异常才触发 `api-exception`。

**问：点击后自动刷新了页面上的表格，是什么原因？**

检查 `head-refresh-datagrid`：`true` 会刷新同 `filter` 组的全部 DataGrid；字符串值会定向刷新对应 filter 组。

### Element Plus 透传

- 透传目标：`el-button`
- 截获事件：`click`——组件 `defineEmits` 已声明同名事件，监听器不进入 `$attrs`，由组件内部处理后重新 emit，事件载荷以本文档 Events 为准（不要直接套用 Element Plus 原生载荷）。
- 说明：过滤版透传：icon、disabled、loading 被组件接管（$attrs 解构剔除后再绑定），外部传入无效；loading 由 buttonLoading/pageLoading 内部控制，disabled 与 loading 联动。其余 el-button 属性正常透传。

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

### Slots

| 插槽 | 容器 id | 插槽参数 | 说明 |
| --- | --- | --- | --- |
| default | — | — | 按钮内容（未设 label 时） |
