# HTTP 请求（Request）详细指引

> **创建时间**：2026-10-16\
> **最后修改时间**：2026-10-16\
> **当前版本**：V\_1.0\
> **适用对象**：需要手动发起 HTTP 请求、对接后端接口、自定义请求行为的开发者 / AI 编码助手\
> **核心目标**：讲清 RequestAPI 的完整生命周期、配置项全景、代码示例与排错手册\
> **文档简略描述**：本文件是 ai-api/use-request.md 的手写详细版。自动生成的 [use-request.md](./use-request.md) 只列 API 表格与 FAQ；本文件补充：执行流程图、全局配置逐项说明、ReqOptions 全部字段示例、useRequest 声明式写法、token 注入与分页封装、业务失败 vs 网络异常的判定、常见排错对照表。

***

## 目录

1. [核心概念](#1-核心概念)
2. [请求执行全流程](#2-请求执行全流程)
3. [三种调用方式](#3-三种调用方式)
4. [全局配置全景（request / response）](#4-全局配置全景request--response)
5. [ReqOptions 逐字段示例](#5-reqoptions-逐字段示例)
6. [useRequest 声明式封装](#6-userequest-声明式封装)
7. [业务失败 vs 网络异常：什么时候进 catch](#7-业务失败-vs-网络异常什么时候进-catch)
8. [典型场景代码片段](#8-典型场景代码片段)
9. [排错对照表](#9-排错对照表)

---

## 1. 核心概念

| 概念 | 说明 |
| --- | --- |
| **RequestAPI** | 请求核心类（`src/lib/core/http.ts`），所有 Wd 请求类组件（WdDataGrid / WdDataForm / WdApiButton / WdRequester / WdViewer 等）均基于它开发。 |
| **`request` 全局单例** | 库内置导出的共享实例（`export const request = new RequestAPI()`），组件外手动调用时直接 import 即可。 |
| **`useRequest`** | 声明式组合式函数（`src/lib/composables/useRequest.ts`），在组件内返回 `{ data, loading, error, run, refresh, abort }`。 |
| **`ApiResult<T>`** | 统一返回结构：`{ success, data, code?, message?, raw? }`。业务失败不 reject，只有网络异常才 reject。 |
| **`ReqOptions`** | 单次请求级覆盖项（loading / 提示 / 去重 / signal / axiosConfig）。 |
| **全局配置** | 通过 `createWorkDesktop(config)` 注入，运行时从 `getGlobalConfig()` 读取。 |

**两个层级，不要混淆**：
- **全局配置**（`request` / `response` 配置块）：一次注入、全局生效。
- **单次请求覆盖**（`ReqOptions`）：只影响当前这一次调用。

---

## 2. 请求执行全流程

一次 `request.post(url, data, reqOptions)` 的内部执行顺序：

```
request(url, method, config)
  │
  ├─ 1. 拼接 urlPrefix（相对路径自动加全局前缀）
  ├─ 2. 去重判定（dedup=true 时：method+url+序列化body 相同的并发请求合并为一次网络调用）
  │
  ▼ executeRequest()
  ├─ 3. emit('apiBefore')                        ← 全局监听器可收到
  ├─ 4. 打开全局 ElLoading（loadingCount++）
  ├─ 5. 合并 axios 配置（全局 axiosConfig + 单次 config + signal）
  ├─ 6. 执行请求拦截器 requestInterceptor（加 token / 改 header）
  ├─ 7. axios 发起真实 HTTP 请求
  │
  ├─ 成功（HTTP 2xx）：
  │   ├─ 8. 执行响应拦截器 responseInterceptor
  │   ├─ 9. unpack() 解封响应体：
  │   │     - body 非对象 / 数组 / null → 直接视为成功，data = body
  │   │     - body 为对象 → 取 body[codeName] / body[messageName] / body[dataName]
  │   │     - Number(code) >= response.successCode → success=true
  │   │     - Number(code) < successCode          → success=false（业务失败，不 reject）
  │   ├─ 10. 触发对应提示（success / fail 的 TipsConfig）
  │   ├─ 11. emit('apiSuccess' 或 'apiFail')
  │   ├─ 12. emit('apiAfter')
  │   └─ 13. 返回 ApiResult { success, data, code, message, raw }
  │
  └─ 异常（网络错误 / 超时 / abort）：
      ├─ 8. 触发 exception 提示（TipsConfig）
      ├─ 9. emit('apiException')
      ├─ 10. emit('apiAfter')
      └─ 11. reject（返回带 success=false 的 Error）
  │
  ▼ finally
  └─ closeLoading()（loadingCount--，归零才关 loading）
```

---

## 3. 三种调用方式

### 3.1 全局单例（最常用）

```ts
import { request } from 'workdesktop-ai'

// 便捷方法
const res = await request.post('/api/user/list', { page: 1 })
if (res.success) {
  console.log(res.data)   // 已解封的业务数据
} else {
  console.warn(res.message) // 业务失败原因
}
```

### 3.2 自建实例（对接第二后端）

```ts
import { RequestAPI } from 'workdesktop-ai'

// 独立 baseURL / timeout，不影响全局单例
const otherApi = new RequestAPI({
  baseURL: '/other-api',
  timeout: 10000
})

const res = await otherApi.get('/info')
```

### 3.3 useRequest 声明式（组件内推荐）

```ts
import { useRequest } from 'workdesktop-ai'

const { data, loading, run, refresh } = useRequest('/api/user/list', {
  method: 'post',
  immediate: true,
  initialParams: { page: 1, pageSize: 20 }
})

// 模板里直接用 <div v-if="loading">加载中</div>
// 翻页时 run({ page: 2 }) 或 refresh()
```

---

## 4. 全局配置全景（request / response）

通过 `createWorkDesktop({ request: {...}, response: {...} })` 注入。

### 4.1 request 配置块

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `urlPrefix` | string | `''` | 接口前缀，相对 URL 自动拼接（`/api` + `/user` → `/api/user`） |
| `throwException` | boolean | `false` | 网络异常是否向上 throw（默认 false，reject 即可） |
| `dedup` | boolean | `true` | 并发相同请求合并去重（method+url+body 一致只发一次） |
| `loading.enable` | boolean | `true` | 请求期间自动显示全局 ElLoading |
| `loading.props` | Record | `{ lock: true, text: '加载中...', background: 'rgba(255,255,255,0.7)' }` | ElLoading.service 透传 |
| `axiosConfig` | Record | `{ timeout: 30000 }` | 全局 axios 默认配置（headers / withCredentials 等） |
| `pageParam.pageField` | string | `'currentPage'` | 分页请求时当前页字段名 |
| `pageParam.sizeField` | string | `'pageSize'` | 分页请求时每页条数字段名 |
| `pageParam.searchField` | string | `'param'` | 搜索条件外层字段名 |
| `transform.requestInterceptor` | (config) => config | — | 请求拦截器（加 token 等） |
| `transform.responseInterceptor` | (response) => response | — | 响应拦截器（统一改数据结构等） |

### 4.2 response 配置块

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `props.codeName` | string | `'code'` | 业务状态码字段名 |
| `props.messageName` | string | `'message'` | 业务消息字段名 |
| `props.dataName` | string | `'data'` | 业务数据字段名 |
| `successCode` | number | `0` | `Number(code) >= successCode` 视为成功 |
| `list.listName` | string | `'list'` | 列表数据字段名 |
| `list.totalName` | string | `'total'` | 总数字段名 |
| `list.pageSizeName` | string | `'pageSize'` | 每页条数字段名 |
| `list.currentPageName` | string | `'currentPage'` | 当前页字段名 |
| `success` | TipsConfig | `{ tipsMode: 'message', tipsType: 'success', showTips: false }` | 成功结果提示（默认不弹） |
| `fail` | TipsConfig | `{ tipsMode: 'messagebox', tipsType: 'error', showTips: true, title: '操作失败' }` | 业务失败提示（默认弹模态框） |
| `exception` | TipsConfig | `{ tipsMode: 'messagebox', tipsType: 'error', showTips: true, title: '网络异常' }` | 网络异常提示 |

### 4.3 TipsConfig 三种模式

```ts
interface TipsConfig {
  tipsMode: 'message' | 'notify' | 'messagebox' | 'none'
  tipsType: 'success' | 'warning' | 'error' | 'info'
  showTips?: boolean    // 总开关
  title?: string        // 仅 messagebox 有效
  props?: Record<string, any>  // 透传给 ElMessage / ElNotification / ElMessageBox
}
```

---

## 5. ReqOptions 逐字段示例

```ts
// 单次请求级覆盖，只影响当前这一次调用
interface ReqOptions {
  showLoading?: boolean       // false：本次请求不显示全局 loading
  showTips?: boolean          // false：本次请求不弹任何提示
  tipsConfig?: {              // 按结果类型分别覆盖
    success?: TipsConfig
    fail?: TipsConfig
    exception?: TipsConfig
  }
  axiosConfig?: Record<string, any>  // 透传给 axios（headers / responseType 等）
  signal?: AbortSignal        // 外部中断信号
  dedup?: boolean             // false：本次请求跳过并发去重
}
```

**典型用法**：

```ts
// 静默请求（无 loading、无提示）
await request.get('/api/config', null, { showLoading: false, showTips: false })

// 自定义 header
await request.post('/api/upload', formData, {
  axiosConfig: { headers: { 'Content-Type': 'multipart/form-data' } }
})

// 跳过全局去重（轮询场景）
await request.get('/api/heartbeat', null, { dedup: false })
```

---

## 6. useRequest 声明式封装

```ts
const {
  data,      // ShallowRef<T | null>，解封后的业务数据
  loading,   // Ref<boolean>，加载态
  error,     // ShallowRef<Error | null>，网络异常
  run,       // (params?) => Promise<ApiResult | null>，手动触发请求
  refresh,   // () => 用上一次 params 重发
  abort      // () => void，中断当前请求
} = useRequest(api, options)
```

**Options 字段**：

| 字段 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `method` | `'get' \| 'post' \| 'put' \| 'delete'` | `'post'` | 请求方法 |
| `immediate` | boolean | `true` | 是否立即自动请求 |
| `initialParams` | any | — | 自动请求时的初始参数 |
| `reqOptions` | ReqOptions | — | 透传给 http 的单次覆盖 |
| `onSuccess` | `(data, result) => void` | — | 成功回调 |
| `onFail` | `(result) => void` | — | 业务失败回调 |
| `onError` | `(error) => void` | — | 网络异常回调 |

**注意**：组件卸载时自动 `abort()`，无需手动清理。

---

## 7. 业务失败 vs 网络异常：什么时候进 catch

| 场景 | Promise 行为 | 是否进 catch |
| --- | --- | --- |
| HTTP 2xx 且 code >= successCode | resolve `{ success: true, data }` | 否 |
| HTTP 2xx 且 code < successCode（业务失败） | resolve `{ success: false, message }` | **否**，必须判断 `result.success` |
| 网络断开 / 超时 / CORS / abort | reject（带 Error 对象，含 `success: false, data: null`） | **是**，用 try/catch |

**正确写法**：

```ts
try {
  const res = await request.post('/api/save', form)
  if (res.success) {
    // 业务成功
  } else {
    // 业务失败：res.message 已自动弹过提示，这里只做业务跳转
    router.back()
  }
} catch (e) {
  // 只有网络异常才会进来，提示已自动弹过
}
```

---

## 8. 典型场景代码片段

### 8.1 注入 Token（请求拦截器）

```ts
createWorkDesktop({
  request: {
    urlPrefix: '/api',
    transform: {
      requestInterceptor: (config) => {
        const token = localStorage.getItem('token')
        if (token) {
          config.headers = { ...config.headers, Authorization: `Bearer ${token}` }
        }
        return config
      }
    }
  }
})
```

### 8.2 全局监听所有请求（埋点 / 日志）

```ts
import { request } from 'workdesktop-ai'

const off = request.on((payload) => {
  if (payload.type === 'apiException') {
    console.error('[全局异常]', payload.url, payload.error)
    // 上报监控平台
  }
})

// 组件卸载时记得取消
onUnmounted(() => off())
```

### 8.3 手动分页请求（配合 DataGrid 或普通表格）

```ts
const { data, loading, run } = useRequest('/api/user/list', {
  method: 'post',
  immediate: true,
  initialParams: { currentPage: 1, pageSize: 20, param: {} }
})

function onPageChange(page: number) {
  run({ currentPage: page, pageSize: 20, param: searchForm.value })
}
```

### 8.4 文件上传（multipart/form-data）

```ts
const formData = new FormData()
formData.append('file', file)

const res = await request.post('/api/upload', formData, {
  showLoading: true,
  axiosConfig: {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000
  }
})
```

### 8.5 对接非标准响应（后端直接返回数组）

```ts
// unpack() 已内置兼容：body 非对象 / 数组 / null → 直接成功，data = body
const res = await request.get('/api/list-all')
// res.data 就是数组本身
```

---

## 9. 排错对照表

| 现象 | 可能原因 | 排查方向 |
| --- | --- | --- |
| 每次请求都带 `/api` 前缀，但我只想用相对路径 | 全局 `urlPrefix` 配置未清空 | 检查 `createWorkDesktop({ request: { urlPrefix: '' } })` |
| 业务失败时页面不弹窗，也无 console 输出 | `fail.showTips` 被全局或单次覆盖为 false | 检查 `response.fail` 配置与本次 `ReqOptions.showTips` |
| 点击按钮后 loading 一直不消失 | 请求被 abort 但未走 finally | 确认是否手动调用了 `controller.abort()` 但未走 `run` 的完整流程 |
| 并发 3 个相同请求，只打了 1 次网络 | 全局去重 `dedup=true` 生效 | 预期行为；需绕过用 `reqOptions.dedup=false` |
| `res.data` 是整个 body 而不是 body.data | 后端响应不是 `{ code, message, data }` 结构 | 要么改后端，要么在 `requestInterceptor` / `responseInterceptor` 里统一转换 |
| `res.code` 是 string `"200"` 但 `success=false` | `successCode` 默认 0，Number("200")=200 >= 0 应该成功 | 若后端 code 是 `"0000"` / `"OK"` 等非数字，需要在 unpack 前转换或自定义 successCode |
| token 没带上 | 请求拦截器未配置或未返回 config | 检查 `transform.requestInterceptor` 是否正确 `return config` |
| 上传文件 30s 超时被中断 | 全局 `timeout: 30000` | 单次 `ReqOptions.axiosConfig.timeout = 60000` |
| 组件卸载后还在发请求 | `useRequest` 未在组件内调用，或手动 `request` 未 abort | `useRequest` 自动 abort；手动 `request` 需传 `signal` |

---

**关联文档**：
- 自动生成 API 表格：[use-request.md](./use-request.md)
- 全局配置项：[use-config.md](./use-config.md)
- 主路由（组件索引）：[README.md](./README.md)
- AI 编码总入口：[../ai-router.md](../ai-router.md)
