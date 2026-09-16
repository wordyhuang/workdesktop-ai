import type { ComponentMeta } from './types'

/** 核心基础设施：Config、HTTP 请求、数据表格、数据表单 */
export const coreData: ComponentMeta[] = [
  {
    path: 'requester',
    name: 'WdRequester',
    title: 'WdRequester 请求触发组件',
    desc: '完全封装请求核心 RequestAPI；通过 v-model 一次性触发请求（true 发起 → 完成后自动回 false）；支持在 apiBefore 手动中断请求；新请求自动中断旧请求。method/reqOptions 默认值可通过全局配置 page.componentDefault.WdRequester 覆盖（app.use 或 window.workDesktopConfig）',
    group: '数据',
    intro: {
      overview: 'WdRequester 完全封装请求核心 RequestAPI：通过 v-model 一次性触发请求（true 发起 → 完成后自动回 false）；支持在 apiBefore 手动中断请求；新请求自动中断旧请求。组件无视觉渲染（模板仅透传默认插槽），专注请求编排。method / reqOptions 默认值可通过全局配置 `page.componentDefault.WdRequester` 覆盖（app.use 或 window.workDesktopConfig）。',
      whenToUse: [
        '「点击按钮发一次请求」的场景：提交、审批、同步、导出触发等，不想手写命令式请求代码。',
        '需要请求前二次确认 / 权限拦截：在 `api-before` 中调用 `abort()` 即可中断。',
        '需要以声明式方式管理「触发 → 成功/失败/异常 → 复位」的完整请求生命周期。',
        '不建议：需要持续加载态、数据绑定、自动重发的场景——请使用 useRequest composable。',
        '不建议：详情数据的加载与展示——请使用 WdViewer（自带装载与渲染）。'
      ],
      notes: [
        '**一次性开关语义**：v-model 置 true 发起请求，完成（成功/失败/异常）后自动回 false，无需手动复位；再次提交只需再次置 true。',
        '**url / params 实时读取**：url 与 params 属业务参数，发起请求时实时读 props；method / reqOptions 属配置类，走三级合并结果（本地 props > 全局 componentDefault > 内置默认）。',
        '**中断语义分两种**：在 `api-before` 中调 `abort()` 中断，仍会走收尾（触发 `api-after` 并复位开关）；而「新请求替换旧请求」「外部把开关置回 false」「组件卸载」属于静默中断，不触发任何事件。',
        '**新请求自动中断旧请求**：同一实例连续触发时，旧请求被 AbortController 静默中断，不会重复回调事件。',
        '**业务失败走 api-fail 而非异常**：组件不解析 data 内部结构，把整个 ApiResult（含 success / data / code / message）原样抛出；只有网络异常 / 请求被中断才触发 `api-exception`。',
        '**全局默认在挂载时读取一次**：method / reqOptions 的全局默认在组件挂载时读取并缓存，运行中修改只影响之后新挂载的组件。'
      ],
      faq: [
        { q: '请求结束后还需要手动把 v-model 置回 false 吗？', a: '不需要。请求完成（成功/失败/异常/被 abort）后组件自动 emit `update:modelValue` 为 false，可直接再次触发。' },
        { q: '如何在请求发出前做二次确认？', a: '监听 `api-before`，其回调参数是 `abort` 函数；用户取消时调用 `abort()` 即中断本次请求，中断后仍触发 `api-after` 并复位开关。' },
        { q: '连续快速点击会发两次请求吗？', a: '不会重复回调。新请求触发时旧请求被自动静默中断（不触发任何事件），只有最后一次请求会走完事件流。' },
        { q: '事件时序是怎样的？', a: '正常：`api-before` → `api-success` / `api-fail` → `api-after`（开关复位 false）；中断：`api-before`（调 abort）→ `api-after`（开关复位 false）；替换：旧请求被静默中断，不触发任何事件。' }
      ]
    },
    dataTypes: [
      {
        name: 'ReqOptions（请求选项）',
        ref: '`reqOptions` prop（透传给 RequestAPI，对本次请求生效）',
        fields: [
          { name: 'showLoading', type: 'boolean', required: '否', default: '全局配置 request.loading.enable（true）', desc: '请求期间是否显示全局 loading' },
          { name: 'showTips', type: 'boolean', required: '否', default: '按 response.success / fail / exception 各自配置', desc: '结果提示总开关' },
          { name: 'tipsConfig', type: "Partial<Record<'success' | 'fail' | 'exception', TipsConfig>>", required: '否', default: '—', desc: '按结果类型覆盖提示配置（tipsMode / tipsType / title / props / showTips）' },
          { name: 'axiosConfig', type: 'AxiosRequestConfig', required: '否', default: '—', desc: '透传给 axios 的请求级配置（如 headers、timeout）' },
          { name: 'signal', type: 'AbortSignal', required: '否', default: '—', desc: '外部中断信号' },
          { name: 'dedup', type: 'boolean', required: '否', default: '全局配置 request.dedup（true）', desc: '置 false 可让本次请求跳过并发去重' },
          { name: '[key: string]', type: 'any', required: '否', default: '—', desc: '扩展字段，透传给请求拦截器' },
        ],
      },
      {
        name: 'ApiResult（请求结果）',
        ref: '`api-success` / `api-fail` 事件回调参数',
        fields: [
          { name: 'success', type: 'boolean', required: '是', default: '—', desc: '业务是否成功（业务失败也 resolve，success=false，不 reject）' },
          { name: 'data', type: 'any | null', required: '是', default: '—', desc: '解封后的业务数据' },
          { name: 'code', type: 'number | string', required: '否', default: '—', desc: '响应状态码' },
          { name: 'message', type: 'string', required: '否', default: '—', desc: '响应消息' },
          { name: 'raw', type: 'any', required: '否', default: '—', desc: '原始响应体' },
        ],
      },
    ],
    props: [
      { name: 'modelValue', type: 'boolean', default: 'false', desc: '触发开关：true 发起请求，请求完成后自动变为 false' },
      { name: 'url', type: 'string', default: "''", desc: '请求 URL' },
      { name: 'method', type: "'get' | 'post' | 'put' | 'delete'", default: "'post'（可全局配置覆盖）", desc: '请求方法；可在 page.componentDefault.WdRequester.method 中设全局默认值' },
      { name: 'params', type: 'any', default: '—', desc: '请求参数（get/delete 放 query，post/put 放 body）' },
      { name: 'reqOptions', type: 'ReqOptions', default: '{}', desc: '请求选项：透传给 RequestAPI { showLoading?, showTips?, tipsConfig?, dedup?, axiosConfig? }；可在 page.componentDefault.WdRequester.reqOptions 中设全局默认值' },
    ],
    emits: [
      { name: 'update:modelValue', payload: 'value: boolean', desc: '更新触发开关，请求完成后会 emit false' },
      { name: 'api-before', payload: 'abort: () => void', desc: '请求发起前触发，允许开发者手动调用 abort() 中断本次请求' },
      { name: 'api-success', payload: 'result: ApiResult', desc: '请求成功（业务码判断成功）' },
      { name: 'api-fail', payload: 'result: ApiResult', desc: '业务失败（业务码判断失败）' },
      { name: 'api-exception', payload: 'error: any', desc: '网络异常/请求被中断' },
      { name: 'api-after', payload: '—', desc: '请求完成（无论成功失败异常）' },
    ],
    slots: [],
    methods: [],
  },
  {
    path: 'use-config',
    name: 'Config',
    title: 'Config 全局配置',
    desc: '三级配置覆盖（默认层 → 全局层 → 组件 Props）；读取用 useGlobalConfig()/getGlobalConfig()，运行中修改用 setGlobalConfig()/mergeConfig()，组件内合并用 useConfig()',
    group: '核心',
    intro: {
      overview: 'Config 是 WorkDesktop 的全局配置体系，采用三级配置覆盖：默认层（库内置 defaultConfig）→ 全局层（app.use 或 window.workDesktopConfig 注入）→ 组件 Props。读取用 `useGlobalConfig()` / `getGlobalConfig()`，运行中修改用 `setGlobalConfig()` / `mergeConfig()`，组件内合并用 `useConfig()`。通过它可以在不改业务代码的前提下，统一调整请求前缀、分页字段、响应字段名、主题色乃至单个组件类型的 props 默认值。',
      whenToUse: [
        '项目初始化时统一注入请求前缀、分页字段名、响应字段名等全局约定（如后端返回结构不是 `{ code, message, data }`）。',
        '需要按组件类型批量设置 props 默认值（如全站 WdRequester 默认用 GET、WdDataGrid 默认 withPager）。',
        '运行中需要动态调整全局配置（如切换租户后修改 pageSize、主题色）。',
        '封装业务组件时，需要合并「组件全局默认」与「调用方 props」。',
        '不建议：只想调整单个组件的一次行为——直接传 props 即可，无需走全局配置。',
        '不建议：需要在已挂载组件上立即生效的动态响应式配置——配置在组件挂载时读取一次并缓存，运行中修改只影响之后新挂载的组件。'
      ],
      notes: [
        '**三级覆盖优先级**：默认层 < 全局层 < 组件 Props。单个组件的临时调整直接传 props，不要动全局配置。',
        '**运行中修改只对「之后挂载」的组件生效**：已挂载组件在 onMounted 时读取一次并缓存。需要立即生效时可用 `:key` 强制重建组件（官方示例即采用此方式演示 WdRequester 默认 method 切换）。',
        '**setGlobalConfig 是增量合并**：只需传入要改的分支，如 `setGlobalConfig({ page: { pager: { pageSize: 15 } } })`，不会影响其他配置项。',
        '**componentDefault 的 key 是组件 name**：如 `WdRequester`、`WdDataGrid`，写错名字不会生效。',
        '**示例页面离开时应恢复现场**：动态修改全局配置的页面建议在 onUnmounted 中恢复默认值，避免影响其他页面（官方示例做法）。',
        '**响应字段名不一致无需改后端**：通过 `response.props`（code/message/data）与 `response.list`（list/total/pageSize/currentPage）全局改名即可。'
      ],
      faq: [
        { q: 'useGlobalConfig() 和 getGlobalConfig() 有什么区别？', a: '`useGlobalConfig()` 读取「默认层 + 全局层」merge 后的最终生效配置；`getGlobalConfig()` 只读取当前全局层配置（非响应式），即用户实际注入/修改过的那一层。' },
        { q: '运行中用 setGlobalConfig 改了配置，为什么页面上的组件没变化？', a: '组件在 onMounted 时读取一次配置并缓存，运行中修改只影响之后新挂载的组件。如需验证新配置，可通过 `:key` 变化强制组件重建。' },
        { q: 'script 引入（非 npm）项目如何注入全局配置？', a: '在加载组件库前设置 `window.workDesktopConfig`，结构与 app.use 第二参完全一致。' },
        { q: '如何恢复出厂配置？', a: '调用 `resetConfig()` 即可恢复为库内置默认配置。' }
      ]
    },
    dataTypes: [
      {
        name: 'WorkDesktopConfig（全局配置）',
        ref: '`useGlobalConfig()` / `setGlobalConfig()` / `mergeConfig()` 等方法的参数与返回值；`app.use(WorkDesktop, config)` 第二参',
        fields: [
          { name: 'page', type: 'PageConfig', required: '否', default: '内置默认', desc: '页面级配置：global.size（组件默认尺寸）、componentDefault（按组件名覆盖 props 默认值）、pager（分页默认，见 PagerConfig）' },
          { name: 'request', type: 'RequestConfig', required: '否', default: '内置默认', desc: '请求配置：urlPrefix / throwException / dedup / loading / axiosConfig / pageParam / transform' },
          { name: 'response', type: 'ResponseConfig', required: '否', default: '内置默认', desc: '响应解封与提示配置，见下方补充说明' },
          { name: 'theme', type: 'ThemeConfig', required: '否', default: '内置默认', desc: '主题配置：colors（主题色令牌）、cssVars（CSS 变量覆盖，优先级高于 colors）' },
        ],
        after: [
          '**PagerConfig**：`{ size, pageSizes, pageSize, layout, hideOnSinglePage, position }`，对应 DataGrid 分页器默认值（position 为 left / center / right）。',
          '**PageParamConfig**：`{ pageField, sizeField, searchField }`，分页与搜索参数的字段名映射（默认 currentPage / pageSize / param）。',
          '**ResponseConfig**：`props`（响应体中 code / message / data 的字段名映射）、`successCode`（判定成功的状态码）、`list`（列表响应的字段名映射 listName / totalName / pageSizeName / currentPageName）、`success / fail / exception`（成功 / 业务失败 / 网络异常三类 TipsConfig）、`complete`（请求完成时的提示语义类型）。',
          "**TipsConfig**：`{ tipsMode: 'message' | 'notify' | 'messagebox' | 'none', tipsType, showTips?, title?, props? }`。",
          '各配置路径的内置默认值见上文「参数 / 配置项」章节的对照表。',
        ],
      },
      {
        name: 'DeepPartial<T>（递归可选）',
        ref: '`setGlobalConfig(partial)` / `mergeConfig(local?)` 的参数类型',
        desc: ['将 T 的所有字段（含嵌套对象）递归变为可选，用于「只传要覆盖的字段」的增量配置：'],
        code: 'type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] }',
      },
    ],
    props: [],
    emits: [],
    slots: [],
    methods: [
      { name: 'useGlobalConfig()', params: '—', returns: 'WorkDesktopConfig', desc: '读取当前生效的全局配置（默认层 + 全局层 merge 结果）' },
      { name: 'setGlobalConfig(partial)', params: 'DeepPartial<WorkDesktopConfig>', returns: 'WorkDesktopConfig', desc: '增量合并到全局层并返回新配置；影响新挂载组件' },
      { name: 'mergeConfig(local?)', params: 'local?: DeepPartial | Record<string,any>', returns: 'WorkDesktopConfig', desc: '本地层合并（local > global > default），产出最终配置' },
      { name: 'getGlobalConfig()', params: '—', returns: 'WorkDesktopConfig', desc: '读取当前全局层配置（非响应式）' },
      { name: 'resetConfig()', params: '—', returns: 'WorkDesktopConfig', desc: '恢复为库内置默认配置' },
      { name: 'useConfig(componentName?, props?)', params: 'string, Record<string,any>', returns: 'ShallowRef<T>', desc: '组件封装者用：合并 componentDefault 与本地 props（props 非 undefined 覆盖默认）' }
    ]
  },
  {
    path: 'use-request',
    name: 'HTTP 请求',
    title: 'HTTP 请求（RequestAPI / request 单例 / useRequest）',
    desc: '请求核心 RequestAPI 公开可手动调用：类方法 get/post/put/delete/request，自动 urlPrefix、loading、提示、解封响应，返回 ApiResult；库内置全局单例 request（所有请求类组件均基于它开发），可 new RequestAPI() 自建实例；useRequest 为声明式封装（data/loading/run）',
    group: '核心',
    intro: {
      overview: '请求核心 RequestAPI 公开可手动调用：类方法 get/post/put/delete/request，自动完成 urlPrefix 拼接、loading、提示、响应解封，返回 ApiResult。库内置全局单例 `request`，所有请求类组件（WdRequester、WdViewer、WdDataGrid 等）均基于它开发；也可以 `new RequestAPI()` 自建独立实例（独立 baseURL / 超时等）。`useRequest` 是其声明式封装，返回 `{ data, loading, error, run, refresh, abort }`，适合在组件内管理请求状态。',
      whenToUse: [
        '需要在事件回调、工具函数中手动发起一次性请求（用全局单例 `request`）。',
        '需要对接另一个独立后端（不同 baseURL / 超时）且不想影响全局配置（用 `new RequestAPI(axiosConfig)` 自建实例）。',
        '需要在组件内声明式管理「数据 / 加载态 / 错误 / 重发 / 中断」（用 `useRequest`）。',
        '需要全局监听所有请求的生命周期事件做日志或埋点（用 `request.on(handler)`）。',
        '不建议：标准的「点击按钮发请求」「弹窗加载详情」场景——优先使用 WdRequester、WdViewer 等封装组件，少写命令式代码。'
      ],
      notes: [
        '**业务失败不抛异常**：`success=false` 时 Promise 正常 resolve，务必判断 `result.success` 再走业务逻辑；只有网络异常（含请求被中断）才会 reject，建议 try/finally 管理自定义 loading。',
        '**响应自动解封**：库自动从 `{ code, message, data }` 提取字段并判定 success；`result.raw` 保留后端原始响应体，便于排查。',
        '**字段名与后端不一致无需改后端**：通过全局配置改名——`response.props`（code/message/data）、`response.list`（list/total/pageSize/currentPage）、`request.pageParam`（请求分页字段）。',
        '**自建实例与全局单例方法完全一致**：`new RequestAPI({ baseURL: \'/other-api\', timeout: 20000 })` 适合对接第二后端，互不影响。',
        '**全局事件订阅记得取消**：`request.on()` 返回取消订阅函数，组件内使用时务必 `onUnmounted(off)`，避免泄漏与重复日志。',
        '**相同并发请求默认去重**：全局配置 `request.dedup` 默认 true（method+url+params 一致只发一次网络）；单次请求可用 `reqOptions.dedup=false` 跳过。'
      ],
      faq: [
        { q: 'await request.post() 业务失败会进 catch 吗？', a: '不会。业务失败（code < successCode）是正常 resolve，`result.success === false`；只有网络异常 / 请求被中断才 reject。' },
        { q: '如何在请求头注入 token？', a: '配置全局请求拦截器 `request.transform.requestInterceptor: (config) => config`，或单次请求通过 `reqOptions.axiosConfig` 透传 axios 配置。' },
        { q: 'useRequest 的 immediate 默认会自动请求吗？', a: '示例中显式传了 `immediate: false` 表示不自动请求、点击后 `run()`；需要自动请求时不传或传 true 即可。' },
        { q: 'request.on 能收到组件（如 WdDataGrid）发的请求事件吗？', a: '可以。所有请求类组件均基于同一请求核心开发，事件订阅是全局的。' }
      ]
    },
    dataTypes: [
      {
        name: 'UseRequestOptions（useRequest 第二参）',
        ref: '`useRequest(api, options)` 的 `options` 参数',
        fields: [
          { name: 'method', type: "'get' | 'post' | 'put' | 'delete'", required: '否', default: "'post'", desc: '请求方法' },
          { name: 'immediate', type: 'boolean', required: '否', default: 'true', desc: '是否立即自动请求' },
          { name: 'initialParams', type: 'any', required: '否', default: '—', desc: '自动请求时的初始参数' },
          { name: 'reqOptions', type: 'ReqOptions', required: '否', default: '—', desc: '请求级覆盖项（透传给 http，结构见下表）' },
          { name: 'onSuccess', type: '(data: any, result: ApiResult) => void', required: '否', default: '—', desc: '成功回调（data 为解封后的业务数据）' },
          { name: 'onFail', type: '(result: ApiResult) => void', required: '否', default: '—', desc: '业务失败回调' },
          { name: 'onError', type: '(error: any) => void', required: '否', default: '—', desc: '异常回调' },
        ],
      },
      {
        name: 'ApiResult（请求结果）',
        ref: '`run()` / `refresh()` 返回的 Promise 结果、`onSuccess` / `onFail` 回调参数',
        desc: ['字段结构见上文「参数 / 配置项」章节的 ApiResult 表（`success` / `data` / `code` / `message` / `raw`）。'],
      },
      {
        name: 'ReqOptions（请求选项）',
        ref: '`UseRequestOptions.reqOptions`；`request.get / post / put / delete` 第三参',
        fields: [
          { name: 'showLoading', type: 'boolean', required: '否', default: '全局配置 request.loading.enable（true）', desc: '请求期间是否显示全局 loading' },
          { name: 'showTips', type: 'boolean', required: '否', default: '按 response.success / fail / exception 各自配置', desc: '结果提示总开关' },
          { name: 'tipsConfig', type: "Partial<Record<'success' | 'fail' | 'exception', TipsConfig>>", required: '否', default: '—', desc: '按结果类型覆盖提示配置' },
          { name: 'axiosConfig', type: 'AxiosRequestConfig', required: '否', default: '—', desc: '透传给 axios 的请求级配置' },
          { name: 'signal', type: 'AbortSignal', required: '否', default: '—', desc: '外部中断信号' },
          { name: 'dedup', type: 'boolean', required: '否', default: '全局配置 request.dedup（true）', desc: '置 false 可让本次请求跳过并发去重' },
          { name: '[key: string]', type: 'any', required: '否', default: '—', desc: '扩展字段，透传给请求拦截器' },
        ],
      },
    ],
    props: [],
    emits: [],
    slots: [],
    methods: [
      { name: 'RequestAPI(axiosConfig?)', params: 'AxiosRequestConfig?', returns: 'RequestAPI 实例', desc: '公开请求核心类：new RequestAPI({ baseURL }) 自建独立实例，所有组件均基于同一套请求逻辑开发' },
      { name: 'request.get(url, params?, reqOptions?)', params: 'string, any, ReqOptions', returns: 'Promise<ApiResult>', desc: 'GET 请求，params 并入 query' },
      { name: 'request.post(url, data?, reqOptions?)', params: 'string, any, ReqOptions', returns: 'Promise<ApiResult>', desc: 'POST 请求，data 为请求体' },
      { name: 'request.put(url, data?, reqOptions?)', params: 'string, any, ReqOptions', returns: 'Promise<ApiResult>', desc: 'PUT 请求，data 为请求体' },
      { name: 'request.delete(url, params?, reqOptions?)', params: 'string, any, ReqOptions', returns: 'Promise<ApiResult>', desc: 'DELETE 请求，params 并入 query' },
      { name: 'request.request(config, reqOptions?)', params: 'AxiosRequestConfig, ReqOptions', returns: 'Promise<ApiResult>', desc: '核心请求方法，手动指定完整 axios 配置' },
      { name: 'request.create(componentReqConfig?)', params: 'DeepPartialConfig', returns: 'RequestAPI', desc: '创建绑定组件级配置的请求实例' },
      { name: 'request.on(handler)', params: '(payload: ApiEventPayload) => void', returns: '() => void', desc: '订阅 apiBefore/apiSuccess/apiFail/apiException/apiAfter 事件，返回取消订阅函数' },
      { name: 'useRequest(api, options?)', params: 'string | (() => string), UseRequestOptions', returns: '{ data, loading, error, run, refresh, abort }', desc: '声明式请求：绑定接口与策略，返回响应式状态与方法' }
    ]
  },
  {
    path: 'datagrid',
    name: 'WdDataGrid',
    title: 'DataGrid 数据表格',
    desc: '旗舰组件：内部封装 el-table + el-pagination，支持 API/静态双数据源、分页搜索、工具栏、卡片模式切换、动态列、行合并、树形、多选',
    group: '数据',
    intro: {
      overview: 'WdDataGrid 是 WorkDesktop 组件库的旗舰组件，内部封装 el-table + el-pagination，面向中后台列表页提供开箱即用的完整能力。它支持 API / 静态双数据源、分页搜索、工具栏（刷新/尺寸/列设置/新增/导出）、表格与卡片模式切换、动态列（隐藏/排序/持久化）、行合并、树形数据与多选（含跨页选择「购物车」）。通过统一的 `filter` 联动分组标识，可与 SearchPanel、ApiButton 等组件零代码联动，是列表页的核心载体。',
      whenToUse: [
        '标准列表页：接口分页加载 + 顶部搜索 + 工具栏操作（新增/导出/刷新）。',
        '静态台账/报表：本地数组直接渲染，需要卡片模式切换或列设置持久化。',
        '需要跨页累计多选的场景（跨页选择「购物车」）。',
        '树形数据、行合并（rowspan）等复杂表格展示。',
        '不建议：需要直接在表格内编辑单元格/行数据：请使用 WdEditableGrid。',
        '不建议：单条数据的只读详情展示：请使用 WdViewer。'
      ],
      notes: [
        '**数据源二选一**：`api`（接口分页）与 `dataSource`（静态数组）二选一；接口模式下组件自动对响应 `data` 解包分页对象 `{ list, total, pageSize, currentPage }`。',
        '**响应字段名可全局配置**：若后端返回的字段名不是 `list` / `total` / `pageSize` / `currentPage`，可通过全局配置 `response.list` 的 `listName` / `totalName` / `pageSizeName` / `currentPageName` 自定义。',
        '**`active` 默认 `false`**：仅设置 `api` 不会自动加载，需 `:active="true"`、SearchPanel 联动触发，或手动调用 `requestApi()` / `refresh()` / `search()`。',
        '**`rowKey` 必备场景**：树形数据、多选回显、跨页购物车都依赖 `rowKey`，建议接口模式始终配置。',
        '**跨页选择用「购物车」**：普通多选翻页后丢失，需要跨页累计勾选时开启 `withSelectionCart`，并配置 `cartRowKey`（缺省复用 `rowKey`）。',
        '**列设置持久化**：`dynamicColumn` 开启后，列显隐/排序与表格尺寸通过 `columnStorageKey` 写入 localStorage，多页面务必使用不同的 key 避免串数据。',
        '**`height="fix"` 的边界**：贴合最近一个有确定高度/可滚动的祖先容器（body 与 html 不视作边界），祖先无定高/滚动约束时退化为内容自适应；传数字或 CSS 长度则为固定表格高度。'
      ],
      faq: [
        { q: '设置了 `api` 但表格没有发起请求？', a: '`active` 默认为 `false`。设置 `:active="true"` 挂载后自动请求第一页，或由 SearchPanel 联动/手动调用 `requestApi()` 触发。' },
        { q: '后端返回的分页字段名不是 `list` / `total` 怎么办？', a: '无需改后端，通过全局配置 `response.list` 的 `listName` / `totalName` / `pageSizeName` / `currentPageName` 映射实际字段名。' },
        { q: '如何读取/回显多选选中项？', a: '使用 `v-model:model-value` 双向绑定；配合 `selectionKey`（如 `selection-key="id"`）时绑定值、selection-change、getSelection() 均返回该字段值数组，传值自动勾选、置空清空勾选。' },
        { q: '点击内置「新增」「导出」按钮没有反应？', a: '这两个按钮只 emit `add` / `export` 事件，不携带业务逻辑；请在事件回调中自行实现打开新增弹窗、发起文件下载等操作。' }
      ]
    },
    dataTypes: [
      {
        name: 'tools（工具栏开关对象）',
        ref: '`tools` prop',
        fields: [
          { name: 'refresh', type: 'boolean', required: '否', default: 'false', desc: '显示「刷新」按钮' },
          { name: 'columnSetting', type: 'boolean', required: '否', default: 'false', desc: '显示「列设置」按钮（需配合 dynamicColumn）' },
          { name: 'modeSwitch', type: 'boolean', required: '否', default: 'false', desc: '显示「表格 / 卡片切换」按钮（需配合 modeSwitch prop）' },
          { name: 'size', type: 'boolean', required: '否', default: 'false', desc: '显示「尺寸切换」按钮' },
          { name: 'add', type: 'boolean', required: '否', default: 'false', desc: '显示内置「新增」按钮（点击 emit add）' },
          { name: 'export', type: 'boolean', required: '否', default: 'false', desc: '显示内置「导出」按钮（点击 emit export）' },
          { name: 'mode', type: "'round' | 'square' | 'group'", required: '否', default: "'round'", desc: '工具按钮形态：圆角 / 方角 / 按钮组' },
          { name: 'buttonSize', type: "'large' | 'default' | 'small'", required: '否', default: "'default'", desc: '工具按钮尺寸，与 el-button 一致' },
        ],
      },
      {
        name: 'cartConfig（购物车配置对象）',
        ref: '`cartConfig` prop（`withSelectionCart` 开启时生效）',
        fields: [
          { name: 'type', type: "'dialog' | 'drawer'", required: '否', default: "'dialog'", desc: '查看面板呈现方式' },
          { name: 'title', type: 'string', required: '否', default: "'已选数据'", desc: '面板标题（支持 {count} 占位）' },
          { name: 'buttonText', type: 'string', required: '否', default: "''", desc: '非空时购物车按钮显示文案' },
          { name: 'size', type: 'number | string', required: '否', default: '560', desc: '面板宽度（像素或 CSS 长度）' },
          { name: 'showClear', type: 'boolean', required: '否', default: 'true', desc: '显示「一键清空」' },
          { name: 'showRemove', type: 'boolean', required: '否', default: 'true', desc: '显示逐条「移除」' },
        ],
      },
      {
        name: 'RowAction（rowActions 数组元素）',
        ref: '`rowActions` prop（内置操作列配置）',
        fields: [
          { name: 'text', type: 'string', required: '是', default: '—', desc: '按钮文案' },
          { name: 'command', type: 'string', required: '否', default: '—', desc: '点击时随 row-action 事件抛出的命令标识' },
          { name: 'type', type: 'string', required: '否', default: '—', desc: 'el-button 类型（如 primary / danger）' },
        ],
      },
      {
        name: 'treeProps（树形字段映射）',
        ref: '`treeProps` prop',
        fields: [
          { name: 'children', type: 'string', required: '否', default: "'children'", desc: '子节点字段名' },
          { name: 'hasChildren', type: 'string', required: '否', default: "'hasChildren'", desc: '「是否含子节点」字段名（懒加载场景）' },
        ],
      },
    ],
    props: [
      { name: 'api', type: 'string', default: "''", desc: '列表接口地址' },
      { name: 'apiMethod', type: "'get' | 'post' | 'put' | 'delete'", default: "'post'", desc: '请求方法' },
      { name: 'apiParam', type: 'object', default: '{}', desc: '固定请求参数（并入搜索条件 param）' },
      { name: 'active', type: 'boolean', default: 'false', desc: '挂载后自动请求第一页' },
      { name: 'dataSource', type: 'array', default: '—', desc: '静态数据数组（与 api 二选一）' },
      { name: 'withPager', type: 'boolean', default: 'true', desc: '显示分页' },
      { name: 'pagerStyle', type: "'simple' | 'normal' | 'full'", default: "'normal'", desc: '分页档位' },
      { name: 'pagerPosition', type: "'left' | 'center' | 'right'", default: "全局配置 page.pager.position（'right'）", desc: '分页在底栏的水平位置；缺省走全局配置，prop 优先' },
      { name: 'modeSwitch', type: 'boolean', default: 'false', desc: '启用表格/列表清单（卡片）模式切换；切换按钮需配合 card-item 插槽才渲染' },
      { name: 'dynamicColumn', type: 'boolean', default: 'false', desc: '启用列设置（隐藏/排序/持久化）' },
      { name: 'columnStorageKey', type: 'string', default: "''", desc: '列设置与尺寸持久化 key（localStorage）' },
      { name: 'border', type: 'boolean', default: 'false', desc: '表格边框' },
      { name: 'stripe', type: 'boolean', default: 'false', desc: '斑马纹' },
      { name: 'autoHeight', type: 'boolean', default: 'false', desc: '高度自适应撑满容器' },
      { name: 'height', type: "'fix' | string | number", default: "—", desc: "高度模式：缺省内容自适应；'fix' 贴合最近一个有确定高度/可滚动的祖先容器（顶部取自身位置、底部贴容器内容区底，数据超出在行区内滚动、表头固定；祖先无定高/滚动约束时退化为内容自适应）；数字/CSS 长度（如 520、'480px'）作固定表格高度" },
      { name: 'rowKey', type: 'string', default: "''", desc: '行主键（树形/多选必备）' },
      { name: 'tableSize', type: "'large' | 'default' | 'small'", default: "'default'", desc: '表格尺寸' },
      { name: 'withIndex', type: 'boolean', default: 'true', desc: '序号列（翻页连续）' },
      { name: 'withSelection', type: 'boolean', default: 'false', desc: '多选列' },
      { name: 'modelValue', type: 'array', default: '[]', desc: '选中项 v-model 双向绑定：读取当前勾选行（withSelection 开启时）；设置（传值）自动勾选对应行、置空清空勾选（与 selectionKey 配合返回该字段值数组）' },
      { name: 'selectionKey', type: 'string', default: "''", desc: '选中项取值字段：默认返回完整行对象数组；设置后 modelValue/selection-change/getSelection() 返回该字段值数组（如 selectionKey="id" → [1,2]）' },
      { name: 'withSelectionCart', type: 'boolean', default: 'false', desc: '跨页选择「购物车」：表格右上方出现收集按钮（实时显示暂存数量），勾选行跨页累计、翻页/搜索/刷新不清空、翻回所在页自动回勾；点击按钮弹出查看面板' },
      { name: 'cartRowKey', type: 'string', default: "''", desc: '购物车去重/自动回勾唯一键字段，缺省复用 rowKey，均未配置时退化为按行对象引用比较' },
      { name: 'cartConfig', type: 'object', default: "{ type:'dialog', title:'已选数据', buttonText:'', size:560, showClear:true, showRemove:true }", desc: '购物车按钮与查看面板配置：type（dialog/drawer）、title（支持 {count} 占位）、buttonText（非空时按钮显示文案）、size（面板宽）、showClear/showRemove' },
      { name: 'rowspanKey', type: 'string', default: "''", desc: '行合并分组字段' },
      { name: 'rowspanColumn', type: 'string[]', default: '[]', desc: '参与合并的列 prop' },
      { name: 'treeProps', type: 'object', default: "{ children:'children' }", desc: '树形数据字段映射' },
      { name: 'defaultExpandAll', type: 'boolean', default: 'false', desc: '树默认展开全部' },
      { name: 'tools', type: 'object', default: '{}', desc: "工具栏开关 { refresh, size, columnSetting, modeSwitch, add, export, mode, buttonSize }；add/export 开启内置「新增/导出」业务按钮（点击 emit add / export）；mode 为工具按钮形态：'round' 圆角（默认）/ 'square' 方角 / 'group' 按钮组；buttonSize 为按钮尺寸：'large' / 'default'（默认）/ 'small'，与 el-button 一致" },
      { name: 'toolsPosition', type: "'left' | 'right' | 'bottom'", default: "'right'", desc: '内置工具按钮组（刷新/大小/模式切换/列设置/购物车）位置；bottom 时渲染到底部，与分页同一行' },
      { name: 'toolbarPosition', type: "'left' | 'right' | 'bottom'", default: "'left'", desc: '自定义工具栏（toolbar 插槽 + 新增/导出按钮）位置；bottom 时渲染到底部，与分页同一行' },
      { name: 'rowActions', type: 'array', default: '[]', desc: '内置操作列：[{ text, command?, type? }]，点击 emit row-action' },
      { name: 'filter', type: 'string', default: "''", desc: '联动分组标识' }
    ],
    emits: [
      { name: 'add', payload: '—', desc: '点击内置「新增」按钮' },
      { name: 'export', payload: '—', desc: '点击内置「导出」按钮' },
      { name: 'row-action', payload: '{ row, command }', desc: '行内操作触发' },
      { name: 'page-change', payload: '{ currentPage, pageSize }', desc: '分页变化' },
      { name: 'selection-change', payload: 'rows', desc: '多选变化（设置 selectionKey 时返回该字段值数组）' },
      { name: 'mode-change', payload: "'table' | 'card'", desc: '视图模式切换' },
      { name: 'loaded', payload: '{ list, total }', desc: '数据加载完成' },
      { name: 'apiBefore', payload: '{ url, method, params }', desc: '请求前' },
      { name: 'apiAfter', payload: '—', desc: '请求完成' },
      { name: 'cart-change', payload: 'cartList: any[]', desc: '购物车暂存变化（参数为跨页累计、已去重的数组）' },
      { name: 'update:modelValue', payload: 'rows | keys', desc: '选中项双向绑定更新（v-model:model-value）' }
    ],
    slots: [
      { name: 'default', params: '—', desc: 'el-table-column 集合（业务列）' },
      { name: 'toolbar', params: '{ selection, list }', desc: '左区补充按钮：渲染在内置「新增/导出」的最左侧' },
      { name: 'empty', params: '—', desc: '空数据插槽' },
      { name: 'card-item', params: '{ row, index }', desc: '卡片模式单项' },
      { name: 'cart-content', params: '{ list, remove, clear }', desc: '购物车面板主体自定义（list 为暂存数组；remove(row)/clear() 逐条移除/一键清空），默认内容为逐条列表 + 移除按钮' }
    ],
    methods: [
      { name: 'requestApi(options?)', params: '{ apiParam?: object }', returns: 'Promise', desc: '按（可选）临时参数请求数据；不传则按当前条件加载' },
      { name: 'refresh()', params: '—', returns: 'Promise', desc: '刷新当前页（沿用上次查询条件与页码）' },
      { name: 'search(params?)', params: 'params?: object', returns: 'Promise', desc: '带搜索条件查询：合并参数、重置到第一页（SearchPanel 联动底层方法，也可手动调用）' },
      { name: 'resetSearch()', params: '—', returns: 'Promise', desc: '清空搜索条件、回到第一页并重新加载' },
      { name: 'getSelection()', params: '—', returns: 'rows: any[]', desc: '获取当前多选选中的行（设置 selectionKey 时返回该字段值数组）' },
      { name: 'clearSelection()', params: '—', returns: 'void', desc: '清空多选选中状态' },
      { name: 'getCartList()', params: '—', returns: 'cartList: any[]', desc: '获取购物车暂存数组（跨页累计、已去重）' },
      { name: 'clearCart()', params: '—', returns: 'void', desc: '清空购物车暂存（计数归零、面板同步、当前页勾选一并清空）' },
      { name: 'onChangeCurrentpage(page)', params: 'page: number', returns: 'void', desc: '跳转到指定页（通常由分页器自动触发）' },
      { name: 'onChangePagesize(size)', params: 'size: number', returns: 'void', desc: '改变每页条数并回到第一页（通常由分页器自动触发）' },
      { name: 'tableRef', params: '—', returns: 'ElTable 实例（属性）', desc: '内部 el-table 引用，逃生舱：可调用 el-table 原生方法（如 toggleRowSelection）' }
    ]
  },
  {
    path: 'editable-grid',
    name: 'WdEditableGrid',
    title: 'EditableGrid 可编辑数据表格',
    desc: 'DataGrid 的可编辑版本：完整继承 DataGrid 全部能力（API/静态双数据源、分页、工具栏、卡片模式、动态列、行合并、树形、多选、SearchPanel 联动），并增加 columns 配置驱动的单元格/行双编辑模式、脏行与已修改单元格样式、ElForm 风格 rules 单元格校验与保存中断、批量保存、新增/删除行',
    group: '数据',
    intro: {
      overview: 'WdEditableGrid 是 DataGrid 的可编辑版本：完整继承 DataGrid 全部能力（API/静态双数据源、分页、工具栏、卡片模式、动态列、行合并、树形、多选、SearchPanel 联动），并在此基础上增加由 `columns` 配置驱动的单元格/行双编辑模式。它内置脏行与已修改单元格样式标记、与 ElForm 完全一致的 rules 单元格校验（保存时中断并提示）、批量保存、新增/删除行，适合需要在表格内直接维护多行数据的场景。',
      whenToUse: [
        '多行数据的批量录入/编辑（如任务清单、明细行、台账维护）。',
        '需要单元格级校验（必填、长度、数值范围、自定义规则）并在保存时拦截。',
        '编辑结果需要批量提交（`saveApi` 一次提交所有脏行）。',
        '接口分页列表同时要求行内编辑（继承 DataGrid 的 api/分页/联动能力）。',
        '不建议：纯只读列表展示：请使用 WdDataGrid（更轻量）。',
        '不建议：单条数据的表单式新增/编辑：请使用 WdDataForm。'
      ],
      notes: [
        '**静态数据推荐 `v-model` + 关闭分页**：本地静态数据不参与分页，建议 `:with-pager="false"`，否则分页条会对静态数据产生误导。',
        '**静态数据为深拷贝同步**：组件内部对静态数据做深拷贝，编辑过程不直接污染外部数据，仅在保存/同步时回写 `v-model`。因此外部在编辑中途读取 `v-model` 拿到的仍是旧值，需要实时值请用 `getDirtyRows()` 或监听 `change`。',
        '**脏行机制要点**：新增行始终算脏行，即使把值改回基线也仍为脏；已有行改回原值会自动取消该单元格的脏标记；`validate()` 与 `saveAll()` 只针对脏行执行校验与提交，未修改的行不会被校验也不会被提交。',
        '**翻页会清空编辑态**：接口模式下翻页（`onChangeCurrentpage` / `onChangePagesize`）会丢弃当前页未保存的编辑内容。如需保留，请先调用 `saveAll()` 或 `getDirtyRows()` 取出脏行暂存。',
        '**editor 编辑器类型**：`EditableColumn.editor` 支持 `input` / `number` / `select` / `date`，缺省为 `input`；`select` 需配 `options`，`number` 可配 `min` / `max` / `precision`。内置编辑器不满足时用 `edit-{prop}` 插槽自定义。',
        '**校验三层优先级**：`rules`（async-validator 规则，与 ElForm 完全一致）、`required`、`validator`（自定义函数）可叠加使用；校验失败的单元格会显示约束样式，保存/行内保存会中断并通过 `ElMessage` 提示，同时抛出 `validate-fail` 事件（`column` 为失败单元格所在列的 prop）。',
        '**接口模式保存成功后刷新当前页**：配了 `saveApi` 的批量保存成功后，组件会自动重新请求当前页数据，保证服务端计算字段（如更新时间）回显一致。',
        '**`EditableColumn` 完整字段**：`prop` / `label` / `width` / `minWidth` / `align` / `fixed` / `editor` / `editable` / `placeholder` / `options` / `min` / `max` / `precision` / `required` / `validator` / `rules` / `formatter`。其中 `editable: false` 可将某列降级为只读展示列，配合 `formatter` 格式化显示。'
      ],
      faq: [
        { q: '点击「批量保存」提示没有需要保存的数据？', a: '`saveAll()` 只提交脏行（被修改过的行 + 新增行）。如果没有编辑任何单元格，或修改后又改回原值（已有行会自动取消脏标记），脏行集合为空，组件会提示并直接返回，不会发起请求。' },
        { q: '为什么编辑过程中外部 `v-model` 的数据没有变化？', a: '静态数据模式下组件内部持有深拷贝，编辑不直接污染外部数据，只有保存/同步时才回写 `v-model`。需要拿到编辑中的实时数据，请调用 `getDirtyRows()` 或监听 `change` 事件。' },
        { q: '行内（row）模式和单元格（cell）模式怎么选？', a: '`edit-mode="cell"`（默认）点击单个单元格即进入编辑，适合零星修改；`edit-mode="row"` 通过操作列的「编辑/保存/取消」整行切换编辑态，适合一次改一行的多个字段。新增行在 row 模式下会直接进入编辑状态。' },
        { q: '如何让某一列只能看不能改？', a: '在该列的 `EditableColumn` 配置中设置 `editable: false`，该列即降级为只读展示列；需要格式化显示可配合 `formatter`。' }
      ]
    },
    dataTypes: [
      {
        name: 'EditableColumn（可编辑列配置）',
        ref: '`columns` prop（`EditableColumn[]`）',
        fields: [
          { name: 'prop', type: 'string', required: '是', default: '—', desc: '字段名' },
          { name: 'label', type: 'string', required: '是', default: '—', desc: '列标题' },
          { name: 'width', type: 'string | number', required: '否', default: '—', desc: '列宽' },
          { name: 'minWidth', type: 'string | number', required: '否', default: '—', desc: '最小列宽' },
          { name: 'align', type: "'left' | 'center' | 'right'", required: '否', default: '—', desc: '对齐方式' },
          { name: 'fixed', type: "boolean | 'left' | 'right'", required: '否', default: '—', desc: '固定列' },
          { name: 'editor', type: "'input' | 'number' | 'select' | 'date'", required: '否', default: "'input'", desc: '编辑器类型' },
          { name: 'editable', type: 'boolean', required: '否', default: 'true', desc: '该列是否可编辑' },
          { name: 'placeholder', type: 'string', required: '否', default: '—', desc: '编辑器占位文案' },
          { name: 'options', type: '{ text: string; value: any }[]', required: '否', default: '—', desc: "editor='select' 时的选项" },
          { name: 'min', type: 'number', required: '否', default: '—', desc: "editor='number' 时的最小值" },
          { name: 'max', type: 'number', required: '否', default: '—', desc: "editor='number' 时的最大值" },
          { name: 'precision', type: 'number', required: '否', default: '—', desc: "editor='number' 时的数值精度" },
          { name: 'required', type: 'boolean', required: '否', default: 'false', desc: '必填校验' },
          { name: 'validator', type: '(value: any, row: Record<string, any>) => string | undefined', required: '否', default: '—', desc: '自定义校验：返回错误文案，空串 / undefined 为通过' },
          { name: 'rules', type: 'Array<Record<string, any>>', required: '否', default: '—', desc: '单元格校验规则（与 ElForm 的 rules 完全一致，基于 async-validator）；不满足时显示约束样式，保存 / 行内保存时中断并提示' },
          { name: 'formatter', type: '(row: Record<string, any>, col: EditableColumn) => string', required: '否', default: '—', desc: '只读态展示格式化' },
        ],
      },
      {
        name: 'tools / rowActions / treeProps',
        ref: '`tools` / `rowActions` / `treeProps` props',
        desc: ['三个 prop 的对象结构与 WdDataGrid 完全一致（`tools` 工具栏开关、`rowActions` 只读操作列、`treeProps` 树形字段映射），字段说明见 DataGrid 组件页的「数据类型」章节。'],
      },
    ],
    props: [
      // ---- 可编辑能力 ----
      { name: 'columns', type: 'EditableColumn[]', default: '[]', desc: '可编辑列配置（prop/label/editor/options/min/max/required/validator/rules/formatter 等；rules 为与 ElForm 完全一致的 async-validator 规则，配合单元格约束样式与保存中断）' },
      { name: 'modelValue', type: 'object[]', default: '[]', desc: '行数据（v-model，静态数据推荐用法）' },
      { name: 'editMode', type: "'cell' | 'row'", default: "'cell'", desc: '编辑模式：cell 点击单元格编辑；row 行内编辑/保存/取消' },
      { name: 'saveApi', type: 'string', default: "''", desc: '批量保存地址；为空仅本地提交并 emit save' },
      { name: 'saveMethod', type: "'post' | 'put'", default: "'post'", desc: '保存请求方法' },
      { name: 'defaultRow', type: 'object | () => object', default: '—', desc: '新增行默认值（对象或工厂函数）' },
      { name: 'withToolbar', type: 'boolean', default: 'true', desc: '显示工具栏（新增/批量保存/工具按钮）' },
      { name: 'withAdd', type: 'boolean', default: 'true', desc: '新增按钮' },
      { name: 'withSave', type: 'boolean', default: 'true', desc: '批量保存按钮' },
      { name: 'withDelete', type: 'boolean', default: 'true', desc: '行内删除按钮' },
      { name: 'withActions', type: 'boolean', default: 'true', desc: '可编辑操作列（编辑/保存/取消/删除）' },
      { name: 'addButtonText', type: 'string', default: "'新增一行'", desc: '新增按钮文案' },
      { name: 'saveButtonText', type: 'string', default: "'批量保存'", desc: '保存按钮文案' },
      { name: 'actionWidth', type: 'string | number', default: '150', desc: '可编辑操作列宽度' },
      // ---- 数据源（继承 DataGrid） ----
      { name: 'api', type: 'string', default: "''", desc: '列表接口地址（与 dataSource/modelValue 二选一）' },
      { name: 'apiMethod', type: "'get' | 'post' | 'put' | 'delete'", default: "'post'", desc: '列表请求方法' },
      { name: 'apiParam', type: 'object', default: '{}', desc: '固定请求参数（并入搜索条件 param）' },
      { name: 'active', type: 'boolean', default: 'false', desc: '挂载后自动请求第一页' },
      { name: 'dataSource', type: 'array', default: '—', desc: '静态数据数组；不传时回退 modelValue' },
      // ---- 分页 / 模式（继承 DataGrid） ----
      { name: 'withPager', type: 'boolean', default: 'true', desc: '显示分页（本地静态数据不分页，建议关闭）' },
      { name: 'pagerStyle', type: "'simple' | 'normal' | 'full'", default: "'normal'", desc: '分页档位' },
      { name: 'withSearch', type: 'boolean', default: 'false', desc: '参与 SearchPanel 联动搜索（filter 分组）' },
      { name: 'modeSwitch', type: 'boolean', default: 'false', desc: '启用表格/卡片模式切换' },
      { name: 'dynamicColumn', type: 'boolean', default: 'false', desc: '启用列设置（隐藏/排序/持久化，覆盖配置列与插槽列）' },
      { name: 'columnStorageKey', type: 'string', default: "''", desc: '列设置与尺寸持久化 key（localStorage）' },
      // ---- 表格展示（继承 DataGrid） ----
      { name: 'border', type: 'boolean', default: 'true', desc: '表格边框' },
      { name: 'stripe', type: 'boolean', default: 'true', desc: '斑马纹' },
      { name: 'autoHeight', type: 'boolean', default: 'false', desc: '高度自适应撑满容器' },
      { name: 'height', type: "'fix' | string | number", default: '—', desc: "高度模式：缺省内容自适应；'fix' 贴合最近定高/可滚动祖先容器；数字/CSS 长度作固定表格高度" },
      { name: 'rowKey', type: 'string', default: "'id'", desc: '行主键（树形/多选必备）' },
      { name: 'tableSize', type: "'large' | 'default' | 'small'", default: "'default'", desc: '表格尺寸（可被工具栏尺寸切换覆盖并持久化）' },
      { name: 'withIndex', type: 'boolean', default: 'false', desc: '序号列（翻页连续）' },
      { name: 'withSelection', type: 'boolean', default: 'false', desc: '多选列' },
      { name: 'rowspanKey', type: 'string', default: "''", desc: '行合并分组字段' },
      { name: 'rowspanColumn', type: 'string[]', default: '[]', desc: '参与合并的列 prop' },
      { name: 'treeProps', type: 'object', default: "{ children:'children' }", desc: '树形数据字段映射' },
      { name: 'defaultExpandAll', type: 'boolean', default: 'false', desc: '树默认展开全部' },
      { name: 'tools', type: 'object', default: '{}', desc: '工具栏开关 { refresh（默认 true）, size, columnSetting, modeSwitch }' },
      { name: 'rowActions', type: 'array', default: '[]', desc: '内置只读操作列：[{ text, command?, type? }]，点击 emit row-action（与可编辑操作列并存）' },
      { name: 'headRefreshDatagrid', type: 'boolean | string', default: 'false', desc: '保存成功后刷新目标 DataGrid（联动）' },
      { name: 'filter', type: 'string', default: "''", desc: '联动分组标识（SearchPanel / refreshDataGrid）' }
    ],
    emits: [
      // 可编辑
      { name: 'update:modelValue', payload: 'rows', desc: '行数据变化（新增/删除/保存时同步）' },
      { name: 'change', payload: 'rows', desc: '任意编辑触发' },
      { name: 'save', payload: '{ rows, all, data? }', desc: '批量保存成功' },
      { name: 'row-add', payload: 'row', desc: '新增行' },
      { name: 'row-remove', payload: 'index', desc: '删除行' },
      { name: 'validate-fail', payload: '{ index, row, column, error }', desc: '校验失败（column 为所在列 prop；保存/行内保存会中断并 ElMessage 提示）' },
      // DataGrid 继承
      { name: 'row-action', payload: '{ row, command, text }', desc: '只读操作列按钮触发' },
      { name: 'page-change', payload: '{ currentPage, pageSize }', desc: '分页变化' },
      { name: 'selection-change', payload: 'rows', desc: '多选变化' },
      { name: 'mode-change', payload: "'table' | 'card'", desc: '视图模式切换' },
      { name: 'loaded', payload: '{ list, total }', desc: '数据加载完成' },
      { name: 'apiBefore', payload: '{ url, rows }', desc: '保存/请求前' },
      { name: 'apiSuccess', payload: '{ data }', desc: '保存成功' },
      { name: 'apiFail', payload: '{ code, message }', desc: '保存失败' },
      { name: 'apiException', payload: '{ error, message }', desc: '请求异常' },
      { name: 'apiAfter', payload: '—', desc: '请求完成' }
    ],
    slots: [
      { name: 'default', params: '—', desc: '额外 el-table-column 业务列（与 columns 配置列并存，受动态列设置控制）' },
      { name: 'toolbar', params: '{ dirtyRows, rows, selection }', desc: '工具栏左侧（覆盖内置新增按钮）' },
      { name: 'actions', params: '{ dirtyRows, rows, selection }', desc: '工具栏右侧（批量保存按钮之后）' },
      { name: 'edit-{prop}', params: '{ row, index, column }', desc: '自定义某列编辑器' },
      { name: 'row-actions', params: '{ row, index }', desc: '可编辑操作列追加按钮' },
      { name: 'empty', params: '—', desc: '空数据' },
      { name: 'card-item', params: '{ row, index }', desc: '卡片模式单项' }
    ],
    methods: [
      // 可编辑
      { name: 'saveAll()', params: '—', returns: 'Promise', desc: '校验全部脏行并批量保存（配 saveApi 走请求，否则仅 emit save）；无脏行时提示并返回' },
      { name: 'validate()', params: '—', returns: 'Promise<boolean>', desc: '校验所有脏行的 rules / required / validator，全部通过返回 true（失败行 emit validate-fail，单元格显示约束样式）' },
      { name: 'addRow()', params: '—', returns: 'void', desc: '末尾新增一行（取 defaultRow 初值，自动进入脏行集合；row 模式直接进入编辑）' },
      { name: 'getDirtyRows()', params: '—', returns: 'rows: object[]', desc: '获取当前所有被修改、未保存的脏行数据' },
      // DataGrid 数据能力
      { name: 'requestApi(options?)', params: '{ apiParam?: object }', returns: 'Promise', desc: '按（可选）临时参数请求数据；静态模式直接返回' },
      { name: 'refresh()', params: '—', returns: 'Promise', desc: '刷新：接口模式重新请求当前页；静态模式重置为外部数据并清空编辑态' },
      { name: 'search(params?)', params: 'params?: object', returns: 'Promise', desc: '带搜索条件查询：合并参数、重置到第一页（SearchPanel 联动底层方法）' },
      { name: 'resetSearch()', params: '—', returns: 'Promise', desc: '清空搜索条件、回到第一页并重新加载' },
      { name: 'getSelection()', params: '—', returns: 'rows: any[]', desc: '获取当前多选选中的行' },
      { name: 'clearSelection()', params: '—', returns: 'void', desc: '清空多选选中状态' },
      { name: 'onChangeCurrentpage(page)', params: 'page: number', returns: 'void', desc: '跳转到指定页（翻页会清空编辑态）' },
      { name: 'onChangePagesize(size)', params: 'size: number', returns: 'void', desc: '改变每页条数并回到第一页' },
      { name: 'tableRef', params: '—', returns: 'ElTable 实例（属性）', desc: '内部 el-table 引用，逃生舱：可调用 el-table 原生方法（如 toggleRowSelection）' }
    ]
  },
  {
    path: 'viewer',
    name: 'WdViewer',
    title: 'Viewer 数据详情',
    desc: 'el-descriptions 的二次封装：以只读描述列表展示一条数据的详情，支持配置 items 自动渲染字段；可直接配置 api + apiParam 自动请求详情数据并装载，也可通过 data 传入静态数据，支持插槽/render/formatter 自定义字段渲染。标题右侧自带「调整大小」（大/默认/小）与「显示字段」（勾选显隐、拖拽手柄排序、恢复默认，与 DataGrid 列设置一致）两个工具，自动启用无需配置',
    group: '数据',
    intro: {
      overview: 'WdViewer 是 el-descriptions 的二次封装：以只读描述列表展示一条数据的详情，支持配置 `items` 自动渲染字段；可直接配置 `api` + `apiParam` 自动请求详情数据并装载，也可通过 `data` 传入静态数据，支持插槽 / render / formatter 自定义字段渲染。标题右侧自带「调整大小」（大/默认/小）与「显示字段」（勾选显隐、拖拽手柄排序、恢复默认，与 DataGrid 列设置一致）两个工具，自动启用无需配置。',
      whenToUse: [
        '详情页 / 抽屉 / 弹窗中展示单条记录（用户详情、订单详情、审批详情等）。',
        '字段较多、需要声明式 `items` 配置驱动渲染的场景。',
        '需要用户自行调整字段显隐、顺序、文字大小的只读查看场景。',
        '提供 `#content` 插槽后也可做名片、档案卡等自由排版（脱离描述列表栅格）。',
        '不建议：需要编辑数据——请使用 WdDataForm；WdViewer 是只读组件。',
        '不建议：需要展示多条记录的列表——请使用 WdDataGrid。'
      ],
      notes: [
        '**响应自动解包**：组件自动对 API 返回数据中的 `data` 解包，按 `items` 中各项的 `prop` 从 `data` 取值渲染，空值（null / undefined / 空字符串）显示 `-`。',
        '**data 优先于 api**：传入 `data` 后不再请求接口；`active` 仅在未传 `data` 时生效（源码 onMounted 与 apiParam watch 均带此判断）。',
        '**apiParam 变化自动重拉**：`active` 模式下 apiParam 变化（JSON 序列化对比）会自动重新请求，切换 id 类场景无需手动调用。',
        '**大小/字段工具自动启用**：无需配置；「调整大小」仅当前实例生效、不持久化；「显示字段」支持勾选显隐与拖拽排序，items 配置变化时保留用户已调整的显隐与顺序、新增字段自动追加。',
        '**#content 插槽是「全接管」模式**：提供后不再渲染描述列表与大小/字段工具，但仍自动装载 data/api 数据并以 `{ row, data }` 透传，无数据显示空态。',
        '**字段自定义渲染三种方式**：`{prop}-cell` 插槽（模板内最直观）、items 的 `slot`（指定插槽名）、`render` / `formatter`（纯配置）。'
      ],
      faq: [
        { q: '同时传了 data 和 api，会用哪个？', a: '用 `data`。data 优先级高于 api，传入后不再请求接口；active 自动请求也被抑制。' },
        { q: '字段值想格式化（如时间戳转日期）怎么办？', a: '在 items 该项配置 `formatter: (val, row) => string`；需要复杂渲染（标签、进度条）用 `# {prop}-cell` 插槽或 `render`。' },
        { q: '为什么配了 active 却不发请求？', a: 'active 自动请求有两个前提：配置了 `api` 且未传 `data`。二者缺一不会发请求；也可以直接调用 `requestApi()` 手动请求。' },
        { q: '「显示字段」的调整会保存吗？刷新页面后还在吗？', a: '不会持久化。字段显隐/排序与文字大小均仅当前实例生效，组件重建后恢复 items 配置顺序。' }
      ]
    },
    dataTypes: [
      {
        name: 'ViewerItem（字段配置项）',
        ref: '`items` prop（`ViewerItem[]`）',
        fields: [
          { name: 'prop', type: 'string', required: '是', default: '—', desc: '取值字段名（无 prop 的项会被过滤）' },
          { name: 'label', type: 'string', required: '是', default: '—', desc: '字段标签' },
          { name: 'span', type: 'number', required: '否', default: '—', desc: '占据列数（透传 el-descriptions-item span）' },
          { name: 'width', type: 'string | number', required: '否', default: '—', desc: '单元格宽度' },
          { name: 'align', type: "'left' | 'center' | 'right'", required: '否', default: '—', desc: '内容对齐' },
          { name: 'labelAlign', type: "'left' | 'center' | 'right'", required: '否', default: '—', desc: '标签对齐' },
          { name: 'slot', type: 'string', required: '否', default: '—', desc: '自定义渲染插槽名' },
          { name: 'render', type: 'any', required: '否', default: '—', desc: '自定义渲染（渲染函数 / 组件）' },
          { name: 'formatter', type: '(val: any, row: any) => string', required: '否', default: '—', desc: '展示格式化' },
          { name: 'type', type: "'text' | 'tag' | 'time' | 'status' | 'image' | 'copy'", required: '否', default: "'text'", desc: '渲染类型：文本 / 标签 / 时间 / 状态标签 / 图片 / 可复制文本' },
          { name: 'tagColors', type: 'Record<string, string>', required: '否', default: '—', desc: "type='tag' / 'status' 时「值 → el-tag 类型 / 颜色」映射" },
          { name: 'timeFormat', type: 'string', required: '否', default: '—', desc: "type='time' 时的时间格式字符串" },
          { name: 'imageSize', type: 'number', required: '否', default: '—', desc: "type='image' 时的图片边长（像素）" },
        ],
      },
    ],
    props: [
      { name: 'title', type: 'string', default: "''", desc: '标题（透传 el-descriptions title）；标题栏右侧自带大小/字段工具按钮' },
      { name: 'column', type: 'number | object', default: '3', desc: '一行展示的字段数量（透传 el-descriptions column，支持响应式对象）' },
      { name: 'border', type: 'boolean', default: 'true', desc: '是否显示边框' },
      { name: 'size', type: "'large' | 'default' | 'small'", default: "'default'", desc: '初始尺寸；用户可通过标题栏「调整大小」切换（仅当前实例生效，不持久化）' },
      { name: 'labelStyle', type: 'object', default: "{ width:'100px', textAlign:'right' }", desc: '标签单元格自定义样式' },
      { name: 'contentStyle', type: 'object', default: '—', desc: '内容单元格自定义样式' },
      { name: 'api', type: 'string', default: "''", desc: '详情数据接口地址' },
      { name: 'apiMethod', type: "'get' | 'post' | 'put' | 'delete'", default: "'get'", desc: '详情请求方法' },
      { name: 'apiParam', type: 'object', default: '{}', desc: '详情请求参数（如 { id }），变化时 active 模式自动重新请求' },
      { name: 'active', type: 'boolean', default: 'false', desc: '挂载后自动请求详情（未传 data 时生效）' },
      { name: 'data', type: 'object', default: '—', desc: '静态数据对象，优先级高于 api（传入后不再请求接口）' },
      { name: 'items', type: 'ViewerItem[]', default: '[]', desc: '字段配置：{ prop, label, span, width, align, labelAlign, slot, render, formatter }' },
      { name: 'emptyText', type: 'string', default: "'暂无数据'", desc: '无数据时的空状态文案' }
    ],
    emits: [
      { name: 'load-success', payload: '{ data }', desc: '详情加载成功' },
      { name: 'load-fail', payload: '{ code, message }', desc: '详情业务失败' },
      { name: 'apiBefore', payload: '{ url, param }', desc: '请求前' },
      { name: 'apiSuccess', payload: '{ data, raw }', desc: '请求成功' },
      { name: 'apiFail', payload: '{ code, message }', desc: '业务失败' },
      { name: 'apiException', payload: '{ error, message }', desc: '网络异常' },
      { name: 'apiAfter', payload: '{ url }', desc: '请求完成' }
    ],
    slots: [
      { name: 'default', params: '—', desc: '追加额外的 el-descriptions-item（与 items 配置并存）' },
      { name: 'content', params: '{ row, data }', desc: '整体内容插槽：提供后完全接管内容布局（脱离描述列表栅格，自由排版），不再渲染描述列表与大小/字段工具；仍自动装载 data/api 数据并透传，无数据显示空态' },
      { name: '{prop}-cell', params: '{ row, value }', desc: '自定义某个字段的内容渲染（如 #status-cell="{ row }"，描述列表模式）' },
      { name: 'empty', params: '—', desc: '无数据时的空状态内容' }
    ],
    methods: [
      { name: 'requestApi(extraParam?)', params: 'object?', returns: 'Promise', desc: '手动请求详情数据（可合并临时参数），成功后自动装载' },
      { name: 'getData()', params: '—', returns: 'object', desc: '获取当前装载的详情数据' },
      { name: 'resetData()', params: '—', returns: 'void', desc: '清空当前数据' }
    ]
  },
  {
    path: 'dataform',
    name: 'WdDataForm',
    title: 'DataForm 数据表单',
    desc: '自动表单：mode(create/edit) + 详情回填 + 校验 + 修改检测 + 提交联动关抽屉/刷新表格/连续操作，适合弹窗内维护数据',
    group: '表单',
    intro: {
      overview: 'WdDataForm 是一个基于 el-form 的自动表单组件：通过 `mode`（create/edit）区分新增与编辑，edit 模式支持详情接口自动回填，内置校验、修改检测（脏检查）与离开确认。提交成功后可联动关闭所在抽屉/对话框、刷新目标 DataGrid，create 模式还支持「保存并继续」的连续录入。它非常适合放在 WdDrawer 等弹层容器内维护单条业务数据。',
      whenToUse: [
        '在抽屉/对话框中新增或编辑一条业务数据（列表页「新增/编辑」弹层）。',
        '编辑场景需要通过详情接口（`api`）自动回填表单。',
        '提交成功后需要自动关闭弹层、刷新列表页表格。',
        '需要连续新增多条数据（保存并继续，不清空上下文）。',
        '不建议：列表页顶部的查询条件表单：请使用 WdSearchPanel。',
        '不建议：多行数据的批量编辑：请使用 WdEditableGrid。'
      ],
      notes: [
        '**底部「关闭」「保存并继续」按钮仅在宿主环境显示**：被 WdDrawer（含 dialog 模式）承载或处于 iframe 内时才渲染（源码 `inHost` 判断）；独立页面使用时自动隐藏。独立使用时建议将 `head-close-drawer` 置为 false，提交成功后只会 emit `close` 事件。',
        '**API 返回数据的解包分两处**：加载详情（`api` 拉取）把 `data` 整体作为表单对象回填（按字段名浅合并），并通过 `load-success` 抛出 `data`；提交表单（`submitApi`）后从返回中解出 `data`，成功时经 `submit-success` 抛出 `data`，失败时经 `submit-fail` 抛出完整结果。',
        '**resetForm 的行为因模式而异**：edit 模式恢复为详情快照，create 模式（或 `resetForm(true)`）清空全部字段与校验态。',
        '**提交字段可裁剪**：`submitKeys` / `submitExcludeKeys` 同时支持数组与逗号分隔字符串（如 `"id,name"`），用于控制提交到接口的字段集合。',
        '**离开确认只走一处**：`confirmLeave` 默认开启，有未保存修改时关闭会弹确认；在容器内由容器统一执行守卫，避免与表单自身重复弹窗。提交成功触发的关闭（reason=\'submit\'）不再做离开确认。',
        '**rules 透传 el-form**：校验不通过时提交会被中断并提示「请完善表单必填项」；请求进行中整个表单处于 disabled/loading 状态。'
      ],
      faq: [
        { q: '不配置 submitApi 会怎样？', a: '校验通过后不发请求，仅以 `submit-success` 事件抛出当前表单数据（getFormData 结果），提交逻辑完全交给父组件处理。' },
        { q: 'edit 模式如何自动加载详情？', a: '配置 `api` + `active`（挂载后自动请求）；或随时通过 ref 调用 `requestApi()` 手动请求并回填。未配置 `api` 时回退为使用 `data` 属性回填。' },
        { q: '如何只提交部分字段？', a: '用 `submitKeys` 指定白名单，或用 `submitExcludeKeys` 指定黑名单；二者均可传数组或逗号分隔字符串。' },
        { q: '需要调用 el-form 的原生方法怎么办？', a: '通过 ref 上的 `formRef` 属性拿到内部 ElForm 实例（逃生舱），可调用 validateField、clearValidate 等原生方法。' }
      ]
    },
    dataTypes: [
      {
        name: 'actionConfig（操作区按钮配置）',
        ref: '`actionConfig` prop（`withActions` 开启时生效）',
        fields: [
          { name: 'resetText', type: 'string', required: '否', default: '内置文案', desc: '「重置」按钮文案' },
          { name: 'submitText', type: 'string', required: '否', default: '内置文案', desc: '「提交」按钮文案' },
          { name: 'continueText', type: 'string', required: '否', default: '内置文案', desc: '「保存并继续」按钮文案（create 模式且 keepFormButton 开启时显示）' },
          { name: 'closeText', type: 'string', required: '否', default: '内置文案', desc: '「关闭」按钮文案' },
          { name: 'showReset', type: 'boolean', required: '否', default: 'true', desc: '是否显示「重置」按钮' },
          { name: 'showContinue', type: 'boolean', required: '否', default: 'true', desc: '是否显示「保存并继续」按钮' },
        ],
      },
      {
        name: 'rules（表单校验规则，FormRules）',
        ref: '`rules` prop',
        desc: ['el-form 的标准校验规则（外部类型 `FormRules`，基于 async-validator），结构为 `{ 字段prop: 规则数组 }`：'],
        code: "{\n  name: [\n    { required: true, message: '姓名必填', trigger: 'blur' },\n    { min: 2, max: 20, message: '长度 2-20', trigger: 'blur' }\n  ]\n}",
        after: ['常用规则键：`required` / `message` / `trigger`（`blur` | `change`）/ `type` / `min` / `max` / `len` / `pattern` / `validator` / `enum` / `whitespace`。完整规则定义见 element-plus 与 async-validator 文档。'],
      },
    ],
    props: [
      { name: 'mode', type: "'create' | 'edit'", default: "'create'", desc: '新增/编辑模式' },
      { name: 'api', type: 'string', default: "''", desc: '详情接口（edit 模式回填）' },
      { name: 'apiMethod', type: "'get' | 'post'", default: "'get'", desc: '详情接口方法' },
      { name: 'apiParam', type: 'object', default: '{}', desc: '详情接口参数' },
      { name: 'submitApi', type: 'string', default: "''", desc: '提交接口' },
      { name: 'submitMethod', type: "'post' | 'put'", default: "'post'", desc: '提交方法' },
      { name: 'submitKeys', type: 'string | string[]', default: '—', desc: '提交字段白名单' },
      { name: 'submitExcludeKeys', type: 'string | string[]', default: '—', desc: '提交字段黑名单' },
      { name: 'active', type: 'boolean', default: 'false', desc: 'edit 模式自动请求详情' },
      { name: 'confirmLeave', type: 'boolean', default: 'true', desc: '有未保存修改时离开确认' },
      { name: 'withActions', type: 'boolean', default: 'true', desc: '显示底部操作区' },
      { name: 'actionConfig', type: 'object', default: '{}', desc: '按钮文案 { resetText, submitText, continueText, closeText, showReset, showContinue }' },
      { name: 'headCloseDrawer', type: 'boolean | string', default: 'true', desc: '提交成功后关闭容器' },
      { name: 'headRefreshDatagrid', type: 'boolean | string', default: 'false', desc: '提交成功后刷新目标 DataGrid' },
      { name: 'keepFormButton', type: 'boolean', default: 'true', desc: 'create 模式显示"保存并继续"' },
      { name: 'rules', type: 'object', default: '{}', desc: 'el-form 校验规则' },
      { name: 'labelWidth', type: 'string | number', default: "'100px'", desc: '标签宽度' },
      { name: 'labelPosition', type: "'left' | 'right' | 'top'", default: "'right'", desc: '标签位置' },
      { name: 'inline', type: 'boolean', default: 'false', desc: '行内模式' },
      { name: 'data', type: 'object', default: '—', desc: '外部初始数据（DrawerButton data 等）' },
      { name: 'filter', type: 'string', default: "''", desc: '联动分组标识' }
    ],
    emits: [
      { name: 'submit-success', payload: 'data', desc: '提交成功' },
      { name: 'submit-fail', payload: 'result', desc: '提交失败' },
      { name: 'load-success', payload: 'data', desc: '详情加载成功' },
      { name: 'change', payload: 'formData', desc: '表单值变化' },
      { name: 'close', payload: '{ reason }', desc: '请求关闭' },
      { name: 'apiBefore', payload: '{ type }', desc: '请求前' },
      { name: 'apiAfter', payload: '{ type }', desc: '请求完成' }
    ],
    slots: [
      { name: 'default', params: '{ model, form }', desc: '表单字段（el-form-item + v-model="model.xxx"）' },
      { name: 'footer', params: '{ submit, reset, loading }', desc: '底部操作区' }
    ],
    methods: [
      { name: 'submitForm(continueNext?)', params: 'continueNext?: boolean', returns: 'Promise', desc: '校验通过后提交表单；continueNext=true 为「保存并继续」（不关容器、清空表单）' },
      { name: 'validate()', params: '—', returns: 'Promise<boolean>', desc: '触发 el-form 校验，全部通过 resolve(true)，否则 resolve(false)' },
      { name: 'resetForm(clearOnly?)', params: 'clearOnly?: boolean', returns: 'void', desc: '重置表单：edit 模式恢复为详情快照；create 模式或 clearOnly=true 清空全部字段与校验态' },
      { name: 'getFormData()', params: '—', returns: 'object', desc: '获取当前表单数据的副本' },
      { name: 'fillForm(data)', params: 'data: object | null', returns: 'void', desc: '用指定数据回填表单（先清空旧值，深拷贝合并；容器传入 data 时自动调用）' },
      { name: 'requestApi(options?)', params: '{ apiParam?: object }', returns: 'Promise', desc: 'edit 模式手动请求详情并回填（未配 api 时回填 props.data）' },
      { name: 'isDirty()', params: '—', returns: 'boolean', desc: '表单相对快照是否有未保存修改' },
      { name: 'beforeLeave()', params: '—', returns: 'Promise<boolean>', desc: '离开守卫：有未保存修改时弹确认框，确认离开 resolve(true)、继续编辑 resolve(false)' },
      { name: 'formRef', params: '—', returns: 'ElForm 实例（属性）', desc: '内部 el-form 引用，逃生舱：可调用 el-form 原生方法（如 validateField）' }
    ]
  }
]
