> 本文件由脚本自动生成，请勿手工编辑。全部组件索引、阅读约定与 Element Plus 透传规则见 [README.md](./README.md)。数据源 `docs/src/api-meta/`，重生成：`npm run gen:ai-api`。

# WdConfirmButton ConfirmButton 确认按钮

点击弹出二次确认，确认后才发起请求；文案可配

### 概述

WdConfirmButton 在 ApiButton 的请求能力之前加了一道模态确认：点击按钮先弹出 ElMessageBox 确认框，用户点「确定」后才发起 API 请求，点「取消」或关闭弹窗则中断操作并触发 `cancel` 事件。确认文案、确认框标题、取消按钮文案均可配置；请求成功 / 失败提示与声明式联动刷新能力与 ApiButton 一致。

### 何时使用

- 删除、停用、驳回等需要「三思而后行」的危险或不可逆操作。
- 需要强警示的确认场景：模态确认框居中打断，比气泡确认更正式、更醒目。
- 对比选型：操作不可逆、确认文案较长或需要标题时用 WdConfirmButton；表格行内等轻量快速确认用 WdPopconfirmButton。
- 不建议：高频轻量操作（模态弹窗打断感强）；无需确认的请求直接用 WdApiButton。

### 注意事项

- **先确认后请求**：用户点「确定」才发请求；点「取消」或关闭弹窗触发 `cancel`，不会发请求。
- 确认框基于 `ElMessageBox.confirm`，类型固定为 `warning`；「确定」按钮文案当前固定为「确定」，可配置项为 `confirmText`（内容）、`confirmTitle`（标题）、`cancelText`（取消按钮文案）。
- 源码注释注明：`cancelText` 置空则不显示取消按钮。
- `confirm` 事件在请求发出前触发，仅代表「用户已确认」；请求结果请监听 `apiSuccess` / `apiFail` / `apiException`。
- loading 覆盖规则同 ApiButton：内部已显式绑定 `:loading`，外部透传 `loading` 不生效；请用 `buttonLoading` / `pageLoading` 控制。
- 事件触发顺序：`click` →（确认弹窗）→ `confirm` → `apiBefore` → `apiSuccess` / `apiFail` / `apiException` → `apiAfter`。

### 常见问题

**问：`confirm` 和 `api-success` 有什么区别？**

`confirm` 表示用户点了「确定」，随后才发出请求；`api-success` 表示请求已成功返回。需要处理请求结果请用后者。

**问：如何修改确认框「确定」按钮的文案？**

当前版本固定为「确定」，不可配置；可配的是确认内容、标题与取消按钮文案。

**问：确认时需要用户顺带录入原因怎么办？**

改用 WdPromptButton（弹出输入框）或 WdDrawerButton（弹层内放表单）。

**问：与 WdPopconfirmButton 怎么选？**

不可逆、高风险操作用本组件（模态更醒目、打断更强）；表格行内等轻量确认用 WdPopconfirmButton（气泡就地确认、不遮挡页面）。

### Element Plus 透传

- 透传目标：`el-button`
- 截获事件：`click`——组件 `defineEmits` 已声明同名事件，监听器不进入 `$attrs`，由组件内部处理后重新 emit，事件载荷以本文档 Events 为准（不要直接套用 Element Plus 原生载荷）。
- 说明：$attrs 全部透传给触发按钮；点击事件被组件接管（先弹确认框），确认/取消后的载荷以本文档 Events 为准，ElMessageBox 的属性不经过此处透传。

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
| confirmText | `string` | '确认执行该操作？' | 确认文案 |
| cancelText | `string` | '取消' | 取消按钮文案 |
| confirmTitle | `string` | '提示' | 确认框标题 |
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
| confirm | — | 确认后 |
| cancel | — | 取消 |

### Slots

| 插槽 | 插槽参数 | 说明 |
| --- | --- | --- |
| default | — | 按钮内容（未设 label 时） |
