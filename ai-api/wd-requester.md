> 本文件由脚本自动生成，请勿手工编辑。全部组件索引、阅读约定与 Element Plus 透传规则见 [README.md](./README.md)。数据源 `docs/src/api-meta/`，重生成：`npm run gen:ai-api`。

# WdRequester 请求触发组件

完全封装请求核心 RequestAPI；通过 v-model 一次性触发请求（true 发起 → 完成后自动回 false）；支持在 apiBefore 手动中断请求；新请求自动中断旧请求。method/reqOptions 默认值可通过全局配置 page.componentDefault.WdRequester 覆盖（app.use 或 window.workDesktopConfig）

### 概述

WdRequester 完全封装请求核心 RequestAPI：通过 v-model 一次性触发请求（true 发起 → 完成后自动回 false）；支持在 apiBefore 手动中断请求；新请求自动中断旧请求。组件无视觉渲染（模板仅透传默认插槽），专注请求编排。method / reqOptions 默认值可通过全局配置 `page.componentDefault.WdRequester` 覆盖（app.use 或 window.workDesktopConfig）。

### 何时使用

- 「点击按钮发一次请求」的场景：提交、审批、同步、导出触发等，不想手写命令式请求代码。
- 需要请求前二次确认 / 权限拦截：在 `api-before` 中调用 `abort()` 即可中断。
- 需要以声明式方式管理「触发 → 成功/失败/异常 → 复位」的完整请求生命周期。
- 不建议：需要持续加载态、数据绑定、自动重发的场景——请使用 useRequest composable。
- 不建议：详情数据的加载与展示——请使用 WdViewer（自带装载与渲染）。

### 注意事项

- **一次性开关语义**：v-model 置 true 发起请求，完成（成功/失败/异常）后自动回 false，无需手动复位；再次提交只需再次置 true。
- **url / params 实时读取**：url 与 params 属业务参数，发起请求时实时读 props；method / reqOptions 属配置类，走三级合并结果（本地 props > 全局 componentDefault > 内置默认）。
- **中断语义分两种**：在 `api-before` 中调 `abort()` 中断，仍会走收尾（触发 `api-after` 并复位开关）；而「新请求替换旧请求」「外部把开关置回 false」「组件卸载」属于静默中断，不触发任何事件。
- **新请求自动中断旧请求**：同一实例连续触发时，旧请求被 AbortController 静默中断，不会重复回调事件。
- **业务失败走 api-fail 而非异常**：组件不解析 data 内部结构，把整个 ApiResult（含 success / data / code / message）原样抛出；只有网络异常 / 请求被中断才触发 `api-exception`。
- **全局默认在挂载时读取一次**：method / reqOptions 的全局默认在组件挂载时读取并缓存，运行中修改只影响之后新挂载的组件。

### 常见问题

**问：请求结束后还需要手动把 v-model 置回 false 吗？**

不需要。请求完成（成功/失败/异常/被 abort）后组件自动 emit `update:modelValue` 为 false，可直接再次触发。

**问：如何在请求发出前做二次确认？**

监听 `api-before`，其回调参数是 `abort` 函数；用户取消时调用 `abort()` 即中断本次请求，中断后仍触发 `api-after` 并复位开关。

**问：连续快速点击会发两次请求吗？**

不会重复回调。新请求触发时旧请求被自动静默中断（不触发任何事件），只有最后一次请求会走完事件流。

**问：事件时序是怎样的？**

正常：`api-before` → `api-success` / `api-fail` → `api-after`（开关复位 false）；中断：`api-before`（调 abort）→ `api-after`（开关复位 false）；替换：旧请求被静默中断，不触发任何事件。

### Element Plus 透传

- 透传目标：`—（不透传）`
- 说明：无 UI 的行为型组件，模板仅渲染默认插槽（fragment），没有可透传的 Element Plus 组件；属性与事件均以本文档为准。

### Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| modelValue | `boolean` | false | 触发开关：true 发起请求，请求完成后自动变为 false |
| url | `string` | '' | 请求 URL |
| method | `'get' \| 'post' \| 'put' \| 'delete'` | 'post'（可全局配置覆盖） | 请求方法；可在 page.componentDefault.WdRequester.method 中设全局默认值 |
| params | `any` | — | 请求参数（get/delete 放 query，post/put 放 body） |
| reqOptions | `ReqOptions` | {} | 请求选项：透传给 RequestAPI { showLoading?, showTips?, tipsConfig?, dedup?, axiosConfig? }；可在 page.componentDefault.WdRequester.reqOptions 中设全局默认值 |

### Events

| 事件名 | 回调参数 | 说明 |
| --- | --- | --- |
| update:modelValue | value: boolean | 更新触发开关，请求完成后会 emit false |
| api-before | abort: () => void | 请求发起前触发，允许开发者手动调用 abort() 中断本次请求 |
| api-success | result: ApiResult | 请求成功（业务码判断成功） |
| api-fail | result: ApiResult | 业务失败（业务码判断失败） |
| api-exception | error: any | 网络异常/请求被中断 |
| api-after | — | 请求完成（无论成功失败异常） |

### 数据类型

#### ReqOptions（请求选项）

引用：`reqOptions` prop（透传给 RequestAPI，对本次请求生效）

| 字段 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| showLoading | boolean | 否 | 全局配置 request.loading.enable（true） | 请求期间是否显示全局 loading |
| showTips | boolean | 否 | 按 response.success / fail / exception 各自配置 | 结果提示总开关 |
| tipsConfig | Partial<Record<'success' \| 'fail' \| 'exception', TipsConfig>> | 否 | — | 按结果类型覆盖提示配置（tipsMode / tipsType / title / props / showTips） |
| axiosConfig | AxiosRequestConfig | 否 | — | 透传给 axios 的请求级配置（如 headers、timeout） |
| signal | AbortSignal | 否 | — | 外部中断信号 |
| dedup | boolean | 否 | 全局配置 request.dedup（true） | 置 false 可让本次请求跳过并发去重 |
| [key: string] | any | 否 | — | 扩展字段，透传给请求拦截器 |

#### ApiResult（请求结果）

引用：`api-success` / `api-fail` 事件回调参数

| 字段 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| success | boolean | 是 | — | 业务是否成功（业务失败也 resolve，success=false，不 reject） |
| data | any \| null | 是 | — | 解封后的业务数据 |
| code | number \| string | 否 | — | 响应状态码 |
| message | string | 否 | — | 响应消息 |
| raw | any | 否 | — | 原始响应体 |
