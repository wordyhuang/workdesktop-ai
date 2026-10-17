> 本文件由脚本自动生成，请勿手工编辑。全部组件索引、阅读约定与 Element Plus 透传规则见 [README.md](./README.md)。数据源 `docs/src/api-meta/`，重生成：`npm run gen:ai-api`。

# WdSwitch Switch 状态开关

基于 el-switch：切换即请求、自定义开/关值、失败自动回滚、悬停提示、联动刷新

### 概述

WdSwitch 基于 el-switch 封装，核心能力是「切换即请求」：用户拨动开关后自动把新状态提交到 api，请求期间开关显示 loading，业务失败或网络异常时自动回滚到切换前的值；支持 activeValue / inactiveValue 自定义开/关值、tips 悬停提示，以及切换成功后经 headRefreshDatagrid 联动刷新目标 DataGrid。

### 何时使用

- 列表/详情页中对单条记录做二值状态切换并立即落库，如启用/禁用账号、开启/关闭配置。
- 状态值不是布尔而是 1/0、'Y'/'N' 等自定义值（activeValue / inactiveValue）。
- 不建议：仅表达「是/否」且不需要立即提交服务器的场景，可用但不需配置 api（本地模式）；超过两个互斥状态时使用 WdRadioList 或 WdSelect。

### 注意事项

- 失败自动回滚：业务失败（apiFail）与网络异常（apiException）都会把 v-model 回滚到切换前的值，无需手动恢复；UI 上表现为开关弹回原位。
- 提交参数为 `{ ...apiParam, [paramKey]: 当前值 }`：固定参数放 apiParam，状态字段名由 paramKey 决定（默认 'status'）。
- 组件对返回的 data 不做字段提取（开关状态由 v-model 维护），请求结果通过 apiSuccess / apiAfter 事件携带 data 抛出，需要后端返回内容时在事件中取。
- 请求期间开关自动进入 loading 状态，防止重复点击；因此不要在外部再加重复的状态锁。
- tips 非空时组件自动包裹 el-tooltip（顶部弹出），无提示则不包裹，减少层级。
- 未配置 api 时组件退化为普通开关：只触发 change / update:modelValue，不产生任何请求事件。
- el-switch 原生属性（active-text、inactive-text、inline-prompt、disabled 等）经 $attrs 透传，可直接使用。

### 常见问题

**问：切换失败了还需要自己把值改回去吗？**

不需要。业务失败和网络异常都会自动回滚 v-model；可监听 api-fail / api-exception 做提示。

**问：状态值是 1/0 而不是 true/false？**

设置 `:active-value="1" :inactive-value="0"`，v-model 与提交值都会使用该自定义值。

**问：提交时除了状态还要带记录的 id？**

把固定参数放进 api-param，如 `:api-param="{ id: row.id }"`，最终提交 `{ id: row.id, status: 当前值 }`。

**问：如何让切换成功后刷新所在表格？**

设置 head-refresh-datagrid（true=同组，字符串=定向），并用 filter 与目标 DataGrid 对齐分组标识。

### Element Plus 透传

- 透传目标：`el-switch`
- 截获事件：`change`——组件 `defineEmits` 已声明同名事件，监听器不进入 `$attrs`，由组件内部处理后重新 emit，事件载荷以本文档 Events 为准（不要直接套用 Element Plus 原生载荷）。
- 说明：带/不带 tooltip 的两个渲染分支均把 $attrs 透传给 el-switch；change 被组件接管（API 请求成功后才提交值，失败回滚），载荷以本文档为准。

### Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| modelValue | `any` | false | 开关值（v-model） |
| api | `string` | '' | 切换请求地址 |
| apiMethod | `'get' \| 'post'` | 'post' | 请求方法 |
| apiParam | `object` | {} | 固定参数 |
| paramKey | `string` | 'status' | 提交参数的字段名 |
| activeValue | `any` | true | 开启值 |
| inactiveValue | `any` | false | 关闭值 |
| tips | `string` | '' | 悬停提示 |
| headRefreshDatagrid | `boolean \| string` | false | 成功后刷新目标 DataGrid |
| filter | `string` | '' | 联动分组标识 |

### Events

| 事件名 | 回调参数 | 说明 |
| --- | --- | --- |
| update:modelValue | value | 开关值变化 |
| change | value | 切换 |
| apiBefore | { url } | 请求前 |
| apiSuccess | { data } | 请求成功 |
| apiFail | { code, message } | 业务失败（回滚） |
| apiException | { error, message } | 网络异常（回滚） |
| apiAfter | — | 请求完成 |
