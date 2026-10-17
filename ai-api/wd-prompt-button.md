> 本文件由脚本自动生成，请勿手工编辑。全部组件索引、阅读约定与 Element Plus 透传规则见 [README.md](./README.md)。数据源 `docs/src/api-meta/`，重生成：`npm run gen:ai-api`。

# WdPromptButton PromptButton 输入按钮

点击弹出输入框/自定义表单，输入值并入请求参数后发起请求；API 成功自动关闭弹窗，失败保留弹窗允许修改

### 概述

WdPromptButton 点击弹出输入框 / 自定义表单，输入值并入请求参数后发起请求。组件有两种模式：无 `#content` 插槽时走默认单输入框模式（基于 ElMessageBox.prompt），输入值以 `paramKey` 为字段名并入 `apiParam`；配置了 `#content` 插槽时走自定义内容模式，可在弹窗内放置 DataForm 等多字段表单，点击确认后发起请求。两种模式下均为 API 成功自动关闭弹窗、失败保留弹窗允许修改后重新提交，请求生命周期事件与 ApiButton 完全一致。

### 何时使用

- 重命名、添加备注、填写数量 / 理由等单字段快速录入场景（默认输入框模式）。
- 新增用户等需要多字段表单、但不想打开抽屉的轻量录入场景（`#content` 插槽模式）。
- 提交成功后需要自动刷新表格的场景（配合 `filter` / `headRefreshDatagrid`）。
- 对比：仅确认不输入用 WdConfirmButton / WdPopconfirmButton；表单字段多、需要更大编辑空间时用 WdDrawerButton。

### 注意事项

- **模式由 `#content` 插槽决定**：配置了 `#content` 走自定义内容模式（确认触发 `confirm` 事件），未配置走默认单输入框模式（确认触发 `prompt` 事件并携带输入值）。
- **参数合并规则**：默认模式下输入值以 `paramKey` 为字段名并入 `apiParam`（浅合并，`apiParam` 中的同名字段会被输入值覆盖）。
- **弹窗关闭规则**：API 请求成功自动关闭弹窗；业务失败不关闭，允许用户修改后重新提交——这是组件的设计意图，失败反馈通过 `api-fail` 事件与全局提示给出。
- `promptTitle` / `promptPlaceholder` / `paramKey` / `promptDefault` 仅默认输入框模式有效。
- **外部 `loading` 透传会被覆盖**：组件内部已显式绑定 `:loading`（由 `buttonLoading` 控制）；想关闭按钮转圈请用 `:button-loading="false"`，需要全局遮罩改用 `:page-loading="true"`。
- 统一请求协议：响应按 `{ code, data, message }` 解封；业务失败走 `apiFail`（不抛异常），网络异常走 `apiException`。

### 常见问题

**问：如何拿到用户输入的值做二次处理？**

默认模式监听 `prompt` 事件，回调参数即输入值；自定义内容模式监听 `confirm` 事件。

**问：请求失败后弹窗为什么不关闭？**

设计如此——请求返回失败时不调用关闭逻辑，让用户修正输入后重新提交；成功才自动关闭。

**问：自定义内容模式下，表单数据会自动并入请求参数吗？**

不会。自定义内容模式点击确认后按 `apiParam` 发起请求，插槽内表单数据需自行同步到 `apiParam`。

**问：弹窗的确认 / 取消按钮文案能改吗？**

不能。弹窗基于 ElMessageBox.prompt，按钮文案在组件内固定为「确定 / 取消」，未暴露配置项。

### Element Plus 透传

- 透传目标：`el-button`
- 截获事件：`click`——组件 `defineEmits` 已声明同名事件，监听器不进入 `$attrs`，由组件内部处理后重新 emit，事件载荷以本文档 Events 为准（不要直接套用 Element Plus 原生载荷）。
- 说明：$attrs 全部透传给触发按钮；点击事件被组件接管（先弹输入框），prompt/cancel/confirm 的载荷以本文档 Events 为准，ElMessageBox 的属性不经过此处透传。

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
| promptTitle | `string` | '请输入' | 输入框/弹窗标题 |
| promptPlaceholder | `string` | '请输入内容' | 占位文本（默认输入框模式） |
| paramKey | `string` | 'value' | 输入值并入 apiParam 的字段名（默认输入框模式） |
| promptDefault | `string` | '' | 输入框默认值（默认输入框模式） |
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
| prompt | value | 默认模式：确认输入 |
| confirm | — | 自定义内容模式：点击确认 |
| cancel | — | 取消 |

### Slots

| 插槽 | 容器 id | 插槽参数 | 说明 |
| --- | --- | --- | --- |
| default | — | — | 触发按钮内容（未设 label 时） |
| content | — | — | 弹窗自定义内容（可放 DataForm 等表单，自定义多字段输入） |
