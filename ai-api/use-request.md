> 本文件由脚本自动生成，请勿手工编辑。全部组件索引、阅读约定与 Element Plus 透传规则见 [README.md](./README.md)。数据源 `docs/src/api-meta/`，重生成：`npm run gen:ai-api`。

# HTTP 请求（RequestAPI / request 单例 / useRequest）

请求核心 RequestAPI 公开可手动调用：类方法 get/post/put/delete/request，自动 urlPrefix、loading、提示、解封响应，返回 ApiResult；库内置全局单例 request（所有请求类组件均基于它开发），可 new RequestAPI() 自建实例；useRequest 为声明式封装（data/loading/run）

### 概述

请求核心 RequestAPI 公开可手动调用：类方法 get/post/put/delete/request，自动完成 urlPrefix 拼接、loading、提示、响应解封，返回 ApiResult。库内置全局单例 `request`，所有请求类组件（WdRequester、WdViewer、WdDataGrid 等）均基于它开发；也可以 `new RequestAPI()` 自建独立实例（独立 baseURL / 超时等）。`useRequest` 是其声明式封装，返回 `{ data, loading, error, run, refresh, abort }`，适合在组件内管理请求状态。

### 何时使用

- 需要在事件回调、工具函数中手动发起一次性请求（用全局单例 `request`）。
- 需要对接另一个独立后端（不同 baseURL / 超时）且不想影响全局配置（用 `new RequestAPI(axiosConfig)` 自建实例）。
- 需要在组件内声明式管理「数据 / 加载态 / 错误 / 重发 / 中断」（用 `useRequest`）。
- 需要全局监听所有请求的生命周期事件做日志或埋点（用 `request.on(handler)`）。
- 不建议：标准的「点击按钮发请求」「弹窗加载详情」场景——优先使用 WdRequester、WdViewer 等封装组件，少写命令式代码。

### 注意事项

- **业务失败不抛异常**：`success=false` 时 Promise 正常 resolve，务必判断 `result.success` 再走业务逻辑；只有网络异常（含请求被中断）才会 reject，建议 try/finally 管理自定义 loading。
- **响应自动解封**：库自动从 `{ code, message, data }` 提取字段并判定 success；`result.raw` 保留后端原始响应体，便于排查。
- **字段名与后端不一致无需改后端**：通过全局配置改名——`response.props`（code/message/data）、`response.list`（list/total/pageSize/currentPage）、`request.pageParam`（请求分页字段）。
- **自建实例与全局单例方法完全一致**：`new RequestAPI({ baseURL: '/other-api', timeout: 20000 })` 适合对接第二后端，互不影响。
- **全局事件订阅记得取消**：`request.on()` 返回取消订阅函数，组件内使用时务必 `onUnmounted(off)`，避免泄漏与重复日志。
- **相同并发请求默认去重**：全局配置 `request.dedup` 默认 true（method+url+params 一致只发一次网络）；单次请求可用 `reqOptions.dedup=false` 跳过。

### 常见问题

**问：await request.post() 业务失败会进 catch 吗？**

不会。业务失败（code < successCode）是正常 resolve，`result.success === false`；只有网络异常 / 请求被中断才 reject。

**问：如何在请求头注入 token？**

配置全局请求拦截器 `request.transform.requestInterceptor: (config) => config`，或单次请求通过 `reqOptions.axiosConfig` 透传 axios 配置。

**问：useRequest 的 immediate 默认会自动请求吗？**

示例中显式传了 `immediate: false` 表示不自动请求、点击后 `run()`；需要自动请求时不传或传 true 即可。

**问：request.on 能收到组件（如 WdDataGrid）发的请求事件吗？**

可以。所有请求类组件均基于同一请求核心开发，事件订阅是全局的。

### API（import 调用）

| 方法 | 参数 | 返回值 | 说明 |
| --- | --- | --- | --- |
| RequestAPI(axiosConfig?) | AxiosRequestConfig? | RequestAPI 实例 | 公开请求核心类：new RequestAPI({ baseURL }) 自建独立实例，所有组件均基于同一套请求逻辑开发 |
| request.get(url, params?, reqOptions?) | string, any, ReqOptions | Promise<ApiResult> | GET 请求，params 并入 query |
| request.post(url, data?, reqOptions?) | string, any, ReqOptions | Promise<ApiResult> | POST 请求，data 为请求体 |
| request.put(url, data?, reqOptions?) | string, any, ReqOptions | Promise<ApiResult> | PUT 请求，data 为请求体 |
| request.delete(url, params?, reqOptions?) | string, any, ReqOptions | Promise<ApiResult> | DELETE 请求，params 并入 query |
| request.request(config, reqOptions?) | AxiosRequestConfig, ReqOptions | Promise<ApiResult> | 核心请求方法，手动指定完整 axios 配置 |
| request.create(componentReqConfig?) | DeepPartialConfig | RequestAPI | 创建绑定组件级配置的请求实例 |
| request.on(handler) | (payload: ApiEventPayload) => void | () => void | 订阅 apiBefore/apiSuccess/apiFail/apiException/apiAfter 事件，返回取消订阅函数 |
| useRequest(api, options?) | string \| (() => string), UseRequestOptions | { data, loading, error, run, refresh, abort } | 声明式请求：绑定接口与策略，返回响应式状态与方法 |

### 数据类型

#### UseRequestOptions（useRequest 第二参）

引用：`useRequest(api, options)` 的 `options` 参数

| 字段 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| method | 'get' \| 'post' \| 'put' \| 'delete' | 否 | 'post' | 请求方法 |
| immediate | boolean | 否 | true | 是否立即自动请求 |
| initialParams | any | 否 | — | 自动请求时的初始参数 |
| reqOptions | ReqOptions | 否 | — | 请求级覆盖项（透传给 http，结构见下表） |
| onSuccess | (data: any, result: ApiResult) => void | 否 | — | 成功回调（data 为解封后的业务数据） |
| onFail | (result: ApiResult) => void | 否 | — | 业务失败回调 |
| onError | (error: any) => void | 否 | — | 异常回调 |

#### ApiResult（请求结果）

引用：`run()` / `refresh()` 返回的 Promise 结果、`onSuccess` / `onFail` 回调参数

字段结构见上文「参数 / 配置项」章节的 ApiResult 表（`success` / `data` / `code` / `message` / `raw`）。

#### ReqOptions（请求选项）

引用：`UseRequestOptions.reqOptions`；`request.get / post / put / delete` 第三参

| 字段 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| showLoading | boolean | 否 | 全局配置 request.loading.enable（true） | 请求期间是否显示全局 loading |
| showTips | boolean | 否 | 按 response.success / fail / exception 各自配置 | 结果提示总开关 |
| tipsConfig | Partial<Record<'success' \| 'fail' \| 'exception', TipsConfig>> | 否 | — | 按结果类型覆盖提示配置 |
| axiosConfig | AxiosRequestConfig | 否 | — | 透传给 axios 的请求级配置 |
| signal | AbortSignal | 否 | — | 外部中断信号 |
| dedup | boolean | 否 | 全局配置 request.dedup（true） | 置 false 可让本次请求跳过并发去重 |
| [key: string] | any | 否 | — | 扩展字段，透传给请求拦截器 |
