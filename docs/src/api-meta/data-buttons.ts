import type { ComponentMeta } from './types'
import {
  buttonApiProps,
  buttonApiEmits,
  buttonLabelProp,
  elButtonProps,
  elButtonPropsNoLoading,
  popconfirmProps,
  tipsProp
} from './types'

/** 按钮组（文档条目）：全部继承自 TipsButton，均支持悬停提示 tips/tipsType/placement；全部继承自 el-button 属性（经 $attrs 透传），Props 表已列明继承属性 */
export const buttonData: ComponentMeta[] = [
  {
    path: 'api-button',
    name: 'WdApiButton',
    title: 'ApiButton 请求按钮',
    desc: '点击发起 API 请求，自动 loading、成功提示与声明式联动刷新',
    group: '按钮',
    intro: {
      overview: 'WdApiButton 是按钮组中最基础的请求类按钮：点击后按 `api` / `apiMethod` / `apiParam` 发起 API 请求，请求期间按钮自动进入 loading，响应按统一协议 `{ code, data, message }` 解封后给出成功 / 失败提示，并将结果通过 `apiSuccess` / `apiFail` / `apiException` 等事件完整抛出。请求成功后还可通过 `headRefreshDatagrid` 声明式刷新目标 DataGrid，无需手写联动代码。组件同时继承 TipsButton 的悬停提示能力与 el-button 的全部属性（经 `$attrs` 透传）。',
      whenToUse: [
        '「保存」「提交」「导出」「同步」等点击即发请求的操作按钮。',
        '请求成功后需要自动刷新页面表格的场景（配合 `filter` / `headRefreshDatagrid`）。',
        '需要完整请求生命周期事件做埋点、二次处理或自定义结果处理的场景。',
        '不建议：删除等需要二次确认的危险操作，请使用 WdConfirmButton / WdPopconfirmButton；纯页面跳转请使用 WdRouteButton。'
      ],
      notes: [
        '**外部 `loading` 透传会被覆盖**：组件内部已显式绑定 `:loading`（由 `buttonLoading` 控制），因此 Props 表未列出 el-button 的 `loading`，透传也不会生效；想关闭按钮转圈请用 `:button-loading="false"`。',
        '`api` 为空时不发起请求，仅触发 `click`，可直接当普通按钮使用。',
        '请求参数提交位置随方法变化：`get` / `delete` 拼到 query，`post` / `put` 放入请求体。',
        '统一请求协议：响应按 `{ code, data, message }` 解封（字段名可在全局配置修改）；默认 `code >= successCode`（默认 0）视为成功。业务失败走 `apiFail`（Promise 正常 resolve，不抛异常），网络异常走 `apiException`。',
        '成功 / 失败提示的文案来自后端返回的 `message`，提示方式由全局 `response` 配置控制；`pageLoading` 会开启全局 ElLoading 遮罩，适合耗时请求。',
        '事件触发顺序：`click` → `apiBefore` → `apiSuccess` / `apiFail` / `apiException` → `apiAfter`。'
      ],
      faq: [
        { q: '如何拿到后端返回的业务数据？', a: '监听 `api-success`，回调参数为 `{ data, code, message }`，其中 `data` 即后端返回的业务数据本体，组件不对其做字段提取。' },
        { q: '不想让按钮转圈？', a: '设 `:button-loading="false"`；如需全局遮罩，改用 `:page-loading="true"`。' },
        { q: '业务失败会抛异常吗？', a: '不会。业务失败（code 未达成功码）触发 `api-fail` 并正常结束，只有网络异常才触发 `api-exception`。' },
        { q: '点击后自动刷新了页面上的表格，是什么原因？', a: '检查 `head-refresh-datagrid`：`true` 会刷新同 `filter` 组的全部 DataGrid；字符串值会定向刷新对应 filter 组。' }
      ]
    },
    props: [buttonLabelProp, ...elButtonPropsNoLoading, ...tipsProp, ...buttonApiProps],
    emits: buttonApiEmits,
    slots: [{ name: 'default', params: '—', desc: '按钮内容（未设 label 时）' }]
  },
  {
    path: 'confirm-button',
    name: 'WdConfirmButton',
    title: 'ConfirmButton 确认按钮',
    desc: '点击弹出二次确认，确认后才发起请求；文案可配',
    group: '按钮',
    intro: {
      overview: 'WdConfirmButton 在 ApiButton 的请求能力之前加了一道模态确认：点击按钮先弹出 ElMessageBox 确认框，用户点「确定」后才发起 API 请求，点「取消」或关闭弹窗则中断操作并触发 `cancel` 事件。确认文案、确认框标题、取消按钮文案均可配置；请求成功 / 失败提示与声明式联动刷新能力与 ApiButton 一致。',
      whenToUse: [
        '删除、停用、驳回等需要「三思而后行」的危险或不可逆操作。',
        '需要强警示的确认场景：模态确认框居中打断，比气泡确认更正式、更醒目。',
        '对比选型：操作不可逆、确认文案较长或需要标题时用 WdConfirmButton；表格行内等轻量快速确认用 WdPopconfirmButton。',
        '不建议：高频轻量操作（模态弹窗打断感强）；无需确认的请求直接用 WdApiButton。'
      ],
      notes: [
        '**先确认后请求**：用户点「确定」才发请求；点「取消」或关闭弹窗触发 `cancel`，不会发请求。',
        '确认框基于 `ElMessageBox.confirm`，类型固定为 `warning`；「确定」按钮文案当前固定为「确定」，可配置项为 `confirmText`（内容）、`confirmTitle`（标题）、`cancelText`（取消按钮文案）。',
        '源码注释注明：`cancelText` 置空则不显示取消按钮。',
        '`confirm` 事件在请求发出前触发，仅代表「用户已确认」；请求结果请监听 `apiSuccess` / `apiFail` / `apiException`。',
        'loading 覆盖规则同 ApiButton：内部已显式绑定 `:loading`，外部透传 `loading` 不生效；请用 `buttonLoading` / `pageLoading` 控制。',
        '事件触发顺序：`click` →（确认弹窗）→ `confirm` → `apiBefore` → `apiSuccess` / `apiFail` / `apiException` → `apiAfter`。'
      ],
      faq: [
        { q: '`confirm` 和 `api-success` 有什么区别？', a: '`confirm` 表示用户点了「确定」，随后才发出请求；`api-success` 表示请求已成功返回。需要处理请求结果请用后者。' },
        { q: '如何修改确认框「确定」按钮的文案？', a: '当前版本固定为「确定」，不可配置；可配的是确认内容、标题与取消按钮文案。' },
        { q: '确认时需要用户顺带录入原因怎么办？', a: '改用 WdPromptButton（弹出输入框）或 WdDrawerButton（弹层内放表单）。' },
        { q: '与 WdPopconfirmButton 怎么选？', a: '不可逆、高风险操作用本组件（模态更醒目、打断更强）；表格行内等轻量确认用 WdPopconfirmButton（气泡就地确认、不遮挡页面）。' }
      ]
    },
    props: [
      buttonLabelProp,
      ...elButtonPropsNoLoading,
      ...tipsProp,
      { name: 'confirmText', type: 'string', default: "'确认执行该操作？'", desc: '确认文案' },
      { name: 'cancelText', type: 'string', default: "'取消'", desc: '取消按钮文案' },
      { name: 'confirmTitle', type: 'string', default: "'提示'", desc: '确认框标题' },
      ...buttonApiProps
    ],
    emits: [...buttonApiEmits, { name: 'confirm', payload: '—', desc: '确认后' }, { name: 'cancel', payload: '—', desc: '取消' }],
    slots: [{ name: 'default', params: '—', desc: '按钮内容（未设 label 时）' }]
  },
  {
    path: 'popconfirm-button',
    name: 'WdPopconfirmButton',
    title: 'PopconfirmButton 气泡确认按钮',
    desc: '基于 ApiButton 与 el-popconfirm：点击弹出气泡确认，用户确认后自动请求 API；同时支持悬停提示（el-tooltip）——hover 显示提示、click 弹出确认，两者互不冲突',
    group: '按钮',
    intro: {
      overview: 'WdPopconfirmButton 基于 ApiButton 与 el-popconfirm：点击按钮先就地弹出气泡确认层，用户点击「确定」后才自动发起 API 请求，请求期间按钮自动 loading，响应按统一协议 `{ code, data, message }` 解封并给出成功 / 失败提示，请求结果通过 `apiSuccess` / `apiFail` / `apiException` 等事件完整抛出。组件同时支持悬停提示（el-tooltip）——tooltip 与 popconfirm 平级、通过 virtual-ref 指向同一按钮，hover 显示提示、click 弹出确认，两者互不嵌套、互不冲突。请求成功后还可通过 `headRefreshDatagrid` 声明式刷新目标 DataGrid。',
      whenToUse: [
        '删除、禁用、发布等需要二次确认的危险操作，且希望确认层轻量、就地弹出（不遮挡页面）。',
        '表格操作列、工具栏等密集操作区的确认类按钮。',
        '确认后要发起请求并自动刷新表格的场景（配合 `filter` / `headRefreshDatagrid`）。',
        '对比：WdConfirmButton 弹出居中模态确认框（ElMessageBox），阻断感更强；WdPopconfirmButton 是贴着按钮的气泡，更轻量。',
        '不建议：无需确认的请求直接用 WdApiButton；需要用户输入内容的操作用 WdPromptButton。'
      ],
      notes: [
        '**`popIcon` / `popDisabled` 改名原因**：el-popconfirm 的 `icon` / `disabled` 与经 `$attrs` 透传给 el-button 的同名属性冲突，因此组件将其改名为 `popIcon` / `popDisabled`；el-button 的 `icon` / `disabled` 仍可正常透传使用。',
        '**`placement` 一处配置两处生效**：弹出位置复用 TipsButton 的 `placement` 属性，同时作用于悬停提示（tooltip）与确认弹层（popconfirm）。',
        '**外部 `loading` 透传会被覆盖**：组件内部已显式绑定 `:loading`（由 `buttonLoading` 控制），因此 Props 表未列出 el-button 的 `loading`；想关闭按钮转圈请用 `:button-loading="false"`。',
        '**确认才发请求**：事件顺序为 `click` →（弹层确认）→ `confirm` → `apiBefore` → `apiSuccess` / `apiFail` / `apiException` → `apiAfter`；点击「取消」仅触发 `cancel`，不会发起请求。',
        '统一请求协议：响应按 `{ code, data, message }` 解封；业务失败走 `apiFail`（Promise 正常 resolve，不抛异常），网络异常走 `apiException`。',
        '`api` 为空时，用户确认后不会发起请求，仅触发 `confirm` 事件，可直接当纯确认按钮使用。'
      ],
      faq: [
        { q: 'hover 悬停提示和 click 气泡确认会冲突吗？', a: '不会。el-tooltip 与 el-popconfirm 平级、通过 virtual-ref 指向同一按钮，互不嵌套：hover 显示提示、click 弹出确认。' },
        { q: '如何只禁用确认弹层、不禁用按钮本身？', a: '用 `pop-disabled`（对应 el-popconfirm 的 disabled）；`disabled` 禁用的是按钮本身。' },
        { q: '确认弹层的图标怎么换？', a: '用 `pop-icon` / `pop-icon-color`。命名带 pop 前缀是为了避开 el-button 的 `icon` 透传冲突。' },
        { q: '确认后请求失败会怎样？', a: '弹层已关闭，按钮 loading 结束，触发 `api-fail` 并按全局配置给出失败提示；可监听 `api-fail` 做二次处理。' }
      ]
    },
    props: [
      buttonLabelProp,
      ...elButtonPropsNoLoading,
      ...tipsProp,
      ...popconfirmProps,
      ...buttonApiProps
    ],
    emits: [
      ...buttonApiEmits,
      { name: 'confirm', payload: '—', desc: '用户点击「确定」（随后自动请求 API）' },
      { name: 'cancel', payload: '—', desc: '用户点击「取消」' },
      { name: 'show', payload: '—', desc: '弹层显示' },
      { name: 'hide', payload: '—', desc: '弹层隐藏' }
    ],
    slots: [{ name: 'default', params: '—', desc: '按钮内容（未设 label 时）' }]
  },
  {
    path: 'prompt-button',
    name: 'WdPromptButton',
    title: 'PromptButton 输入按钮',
    desc: '点击弹出输入框/自定义表单，输入值并入请求参数后发起请求；API 成功自动关闭弹窗，失败保留弹窗允许修改',
    group: '按钮',
    intro: {
      overview: 'WdPromptButton 点击弹出输入框 / 自定义表单，输入值并入请求参数后发起请求。组件有两种模式：无 `#content` 插槽时走默认单输入框模式（基于 ElMessageBox.prompt），输入值以 `paramKey` 为字段名并入 `apiParam`；配置了 `#content` 插槽时走自定义内容模式，可在弹窗内放置 DataForm 等多字段表单，点击确认后发起请求。两种模式下均为 API 成功自动关闭弹窗、失败保留弹窗允许修改后重新提交，请求生命周期事件与 ApiButton 完全一致。',
      whenToUse: [
        '重命名、添加备注、填写数量 / 理由等单字段快速录入场景（默认输入框模式）。',
        '新增用户等需要多字段表单、但不想打开抽屉的轻量录入场景（`#content` 插槽模式）。',
        '提交成功后需要自动刷新表格的场景（配合 `filter` / `headRefreshDatagrid`）。',
        '对比：仅确认不输入用 WdConfirmButton / WdPopconfirmButton；表单字段多、需要更大编辑空间时用 WdDrawerButton。'
      ],
      notes: [
        '**模式由 `#content` 插槽决定**：配置了 `#content` 走自定义内容模式（确认触发 `confirm` 事件），未配置走默认单输入框模式（确认触发 `prompt` 事件并携带输入值）。',
        '**参数合并规则**：默认模式下输入值以 `paramKey` 为字段名并入 `apiParam`（浅合并，`apiParam` 中的同名字段会被输入值覆盖）。',
        '**弹窗关闭规则**：API 请求成功自动关闭弹窗；业务失败不关闭，允许用户修改后重新提交——这是组件的设计意图，失败反馈通过 `api-fail` 事件与全局提示给出。',
        '`promptTitle` / `promptPlaceholder` / `paramKey` / `promptDefault` 仅默认输入框模式有效。',
        '**外部 `loading` 透传会被覆盖**：组件内部已显式绑定 `:loading`（由 `buttonLoading` 控制）；想关闭按钮转圈请用 `:button-loading="false"`，需要全局遮罩改用 `:page-loading="true"`。',
        '统一请求协议：响应按 `{ code, data, message }` 解封；业务失败走 `apiFail`（不抛异常），网络异常走 `apiException`。'
      ],
      faq: [
        { q: '如何拿到用户输入的值做二次处理？', a: '默认模式监听 `prompt` 事件，回调参数即输入值；自定义内容模式监听 `confirm` 事件。' },
        { q: '请求失败后弹窗为什么不关闭？', a: '设计如此——请求返回失败时不调用关闭逻辑，让用户修正输入后重新提交；成功才自动关闭。' },
        { q: '自定义内容模式下，表单数据会自动并入请求参数吗？', a: '不会。自定义内容模式点击确认后按 `apiParam` 发起请求，插槽内表单数据需自行同步到 `apiParam`。' },
        { q: '弹窗的确认 / 取消按钮文案能改吗？', a: '不能。弹窗基于 ElMessageBox.prompt，按钮文案在组件内固定为「确定 / 取消」，未暴露配置项。' }
      ]
    },
    props: [
      buttonLabelProp,
      ...elButtonPropsNoLoading,
      ...tipsProp,
      { name: 'promptTitle', type: 'string', default: "'请输入'", desc: '输入框/弹窗标题' },
      { name: 'promptPlaceholder', type: 'string', default: "'请输入内容'", desc: '占位文本（默认输入框模式）' },
      { name: 'paramKey', type: 'string', default: "'value'", desc: '输入值并入 apiParam 的字段名（默认输入框模式）' },
      { name: 'promptDefault', type: 'string', default: "''", desc: '输入框默认值（默认输入框模式）' },
      ...buttonApiProps
    ],
    emits: [...buttonApiEmits, { name: 'prompt', payload: 'value', desc: '默认模式：确认输入' }, { name: 'confirm', payload: '—', desc: '自定义内容模式：点击确认' }, { name: 'cancel', payload: '—', desc: '取消' }],
    slots: [
      { name: 'default', params: '—', desc: '触发按钮内容（未设 label 时）' },
      { name: 'content', params: '—', desc: '弹窗自定义内容（可放 DataForm 等表单，自定义多字段输入）' }
    ]
  },
  {
    path: 'route-button',
    name: 'WdRouteButton',
    title: 'RouteButton 路由按钮',
    desc: '基于 el-button 的路由跳转，支持 name/path、params/query 与 target=_blank 新窗口',
    group: '按钮',
    intro: {
      overview: 'WdRouteButton 是基于 el-button 的路由跳转按钮，支持 `routeName` / `routePath` 两种定位方式、`params` / `query` 传参与 `target="_blank"` 新窗口打开。当前窗口跳转优先走 vue-router（`router.push`）；无 vue-router 环境时自动退化到 `location.href`，在无路由体系的项目里也能直接使用。组件同时继承 TipsButton 的悬停提示能力与 el-button 的全部属性（经 `$attrs` 透传）。',
      whenToUse: [
        '「查看」「编辑」「详情」等纯页面跳转的操作按钮。',
        '需要携带 query 参数新窗口打开页面的场景（如报表、打印页）。',
        '无 vue-router 环境也需要跳转能力的场景（自动退化为 location 跳转）。',
        '不建议：点击后要发 API 请求的操作用 WdApiButton 系列；需要二次确认或输入的操作用 WdPopconfirmButton / WdPromptButton。'
      ],
      notes: [
        '**`routeName` 优先**：两者同时配置时走 `routeName`（`router.push({ name, params, query })`）；只配 `routePath` 时走 `router.push({ path, query })`。',
        '**`target="_blank"` 仅支持 `routePath`**：新窗口模式通过拼 URL 后 `window.open` 实现，`routeName` 与 `params` 在新窗口模式下不生效。',
        '**无 router 环境自动退化**：当前窗口跳转取不到 `$router` 时，退化为 `window.location.href = routePath + query`（需配置 `routePath`）。',
        '`routeName` 与 `routePath` 都不配置时仅触发 `click` 事件，可当普通按钮使用。',
        '`click` 事件先于跳转触发，可在 `click` 中做埋点或跳转前拦截处理。',
        '`filter` 为按钮组统一的联动分组标识；本组件不发请求，不参与 `headRefreshDatagrid` 刷新联动。'
      ],
      faq: [
        { q: '`routeName` 和 `routePath` 都配置了走哪个？', a: '`routeName` 优先；`routeName` 为空时才使用 `routePath`。' },
        { q: '新窗口打开时参数怎么带？', a: '`query` 会以 URLSearchParams 拼接到 `routePath` 之后，如 `/user/detail?id=2`。' },
        { q: '项目没有接 vue-router 能用吗？', a: '可以。当前窗口跳转自动退化为 `location.href` 跳转（需配置 `routePath`）。' },
        { q: '想要链接 / 文字样式的跳转按钮？', a: '直接传 `link` 或 `text`（继承自 el-button），配合 `route-path` 即可。' }
      ]
    },
    props: [
      buttonLabelProp,
      ...elButtonProps,
      ...tipsProp,
      { name: 'routeName', type: 'string', default: "''", desc: '路由 name（与 routePath 二选一）' },
      { name: 'routePath', type: 'string', default: "''", desc: '路由 path' },
      { name: 'params', type: 'object', default: '{}', desc: '路由 params' },
      { name: 'query', type: 'object', default: '{}', desc: '路由 query' },
      { name: 'target', type: "'_self' | '_blank'", default: "'_self'", desc: '打开方式' },
      { name: 'filter', type: 'string', default: "''", desc: '联动分组标识' }
    ],
    emits: [{ name: 'click', payload: 'event', desc: '按钮点击' }],
    slots: [{ name: 'default', params: '—', desc: '按钮内容（未设 label 时）' }]
  },
  {
    path: 'tips-button',
    name: 'WdTipsButton',
    title: 'TipsButton 提示按钮',
    desc: '基于 el-tooltip 的悬停提示按钮，所有按钮均已集成本组件提示能力；若仅需要悬停提示，直接用本组件',
    group: '按钮',
    intro: {
      overview: 'WdTipsButton 是基于 el-tooltip 的悬停提示按钮：`tips` 属性非空时自动用 el-tooltip 包裹按钮，鼠标悬停显示提示内容，主题（`tipsType`）与弹出位置（`placement`）可配。它是整个按钮组的提示能力基座——Api / Confirm / Popconfirm / Prompt / Route / Drawer 等按钮均已集成本组件的提示能力；若仅需要悬停提示、不需要请求 / 确认 / 路由 / 弹层，直接使用本组件即可。无提示内容时不包裹 tooltip，减少 DOM 层级。',
      whenToUse: [
        '图标按钮、工具栏按钮等缺少文字说明、需要悬停补充解释的场景。',
        '操作含义不直观、需要引导性提示的按钮。',
        '只需要「按钮 + 悬停提示」、无任何附加行为的场景。',
        '不建议：需要发请求 / 二次确认 / 路由跳转 / 打开弹层时，直接使用对应按钮并配置它们的 `tips` 属性，无需再用本组件包裹。'
      ],
      notes: [
        '**按需包裹**：`tips` 非空时才渲染 el-tooltip 包裹层；无提示内容时直接渲染 el-button，不增加 DOM 层级。',
        '`tipsType` 对应 el-tooltip 的 `effect`（`dark` / `light`）；`placement` 支持 `top` / `bottom` / `left` / `right`，默认 `top`。',
        '**不要重复包裹**：按钮组其他组件均已内置本组件的提示能力，直接用它们的 `tips` / `tipsType` / `placement` 属性即可，无需在外层再包一个 TipsButton。',
        '本组件自身无内部 loading 逻辑，`loading` 属性经 `$attrs` 透传给 el-button，为 el-button 原生行为。',
        '`filter` 为按钮组统一的联动分组标识；本组件不发请求，不参与 `headRefreshDatagrid` 刷新联动。'
      ],
      faq: [
        { q: '`tips` 和 `label` 能同时用吗？', a: '可以。`label` 是按钮上的文案，`tips` 是鼠标悬停时气泡里的提示内容，互不影响。' },
        { q: '提示内容支持 HTML 或插槽吗？', a: '不支持。`tips` 为字符串，经 el-tooltip 的 `content` 属性展示，组件未暴露 tooltip 的内容插槽。' },
        { q: '按钮组其他组件的提示能力和本组件是什么关系？', a: '按钮组全部继承自 TipsButton，`tips` / `tipsType` / `placement` 三个属性在所有按钮上行为一致；TipsButton 是只含提示能力的最简形态。' }
      ]
    },
    props: [
      buttonLabelProp,
      ...elButtonProps,
      ...tipsProp,
      { name: 'filter', type: 'string', default: "''", desc: '联动分组标识' }
    ],
    emits: [{ name: 'click', payload: 'event', desc: '按钮点击' }],
    slots: [{ name: 'default', params: '—', desc: '按钮内容（未设 label 时）' }]
  },
  {
    path: 'drawer-button',
    name: 'WdDrawerButton',
    title: 'DrawerButton 弹层按钮',
    desc: '点击打开弹层，通过 mode 切换抽屉（drawer）/ 对话框（dialog）；支持 iframe 嵌入或内部插槽表单，关闭后声明式联动刷新',
    group: '按钮',
    intro: {
      overview: 'WdDrawerButton 点击打开弹层，通过 `mode` 切换弹出形式：`drawer` 抽屉（默认）/ `dialog` 对话框。弹层内容支持两种方式：配置 `url` 后以 iframe 内嵌页面，或通过默认插槽放置任意内容（通常为 DataForm 表单）；弹层关闭后可按 `headRefreshDatagrid` 声明式刷新目标 DataGrid。组件内部组合 WdDrawer，弹层内容懒挂载——首次点击打开才渲染，避免内部 DataForm 提前发起请求。组件同时继承 TipsButton 的悬停提示能力与 el-button 的全部属性（经 `$attrs` 透传）。',
      whenToUse: [
        '「新增 / 编辑」入口：点击按钮打开抽屉表单，内部 DataForm 提交成功后自动关闭并刷新表格。',
        '需要 iframe 内嵌页面（外部系统、独立页面）的弹层场景。',
        '轻量内容用 `mode="dialog"` 对话框，表单类内容用默认的 `mode="drawer"` 抽屉。',
        '对比：单字段 / 极简输入用 WdPromptButton 更轻；字段多、需要完整表单空间时用本组件。'
      ],
      notes: [
        '**`size` 属性冲突**：本组件的 `size` 被「弹层尺寸」占用，el-button 的按钮尺寸请改用 `buttonSize`（`\'large\' | \'default\' | \'small\'`），否则两属性冲突。',
        '**弹层内容懒挂载**：首次点击打开才渲染弹层内容（`v-if="rendered"`），避免内部 DataForm 在页面加载时提前发起请求。',
        '**`url` 模式**：设置 `url` 后弹层内以 iframe 加载，`data` 会拼为 iframe 地址的 query；此时默认插槽内容不再渲染。',
        '**关闭后联动刷新**：`headRefreshDatagrid` 在弹层关闭后触发刷新（`true` = 同 `filter` 组 / 字符串 = 定向 filter 组）。',
        '**插槽参数**：默认插槽参数为 `{ data, close }`，可在弹层内容内调用 `close()` 主动关闭；`footer` 插槽参数（footerProps）内含 `close`，可用于自定义底部按钮。',
        '`confirm` 事件为内部 confirm 透传，在弹层完成关闭后触发，回调参数携带关闭相关信息。'
      ],
      faq: [
        { q: '给按钮设置 `size` 为什么不生效？', a: '`size` 被「弹层尺寸」占用；调整按钮尺寸请用 `button-size`，调整弹层尺寸才用 `size`。' },
        { q: '如何在弹层内容里主动关闭弹层？', a: '默认插槽参数提供 `close`，例如 `<template #default="{ data, close }">` 中调用 `close()`；`footer` 插槽参数同样内含 `close`。' },
        { q: '`direction` 在 `mode="dialog"` 时生效吗？', a: '不生效。`direction` 仅 `mode="drawer"` 时控制抽屉弹出方向。' },
        { q: 'iframe 模式每次打开都会重新加载吗？', a: '默认保留上次内容；组件提供 `reload-on-open` 属性，开启后每次打开弹层都会重新加载 iframe 内容（仅 `url` 模式生效）。' }
      ]
    },
    props: [
      buttonLabelProp,
      ...elButtonProps,
      ...tipsProp,
      { name: 'mode', type: "'drawer' | 'dialog'", default: "'drawer'", desc: '弹出形式：抽屉 / 对话框' },
      { name: 'title', type: 'string', default: "''", desc: '弹层标题' },
      { name: 'url', type: 'string', default: "''", desc: 'iframe 地址（设置后弹层内以 iframe 加载）' },
      { name: 'data', type: 'object', default: '{}', desc: '传给内部表单/iframe 的数据' },
      { name: 'size', type: 'string | number', default: "'50%'", desc: '弹层尺寸（抽屉宽/高，对话框宽度）' },
      { name: 'direction', type: "'rtl' | 'ltr' | 'ttb' | 'btt'", default: "'rtl'", desc: '抽屉弹出方向（仅 mode=drawer 生效）' },
      { name: 'headRefreshDatagrid', type: 'boolean | string', default: 'false', desc: '关闭后刷新目标 DataGrid' },
      { name: 'filter', type: 'string', default: "''", desc: '联动分组标识' }
    ],
    emits: [
      { name: 'open', payload: '—', desc: '弹层打开' },
      { name: 'close', payload: '—', desc: '弹层关闭' },
      { name: 'confirm', payload: 'payload', desc: '内部 confirm 透传' }
    ],
    slots: [
      { name: 'button', params: '—', desc: '触发按钮内容（未设 label 时）' },
      { name: 'default', params: '{ data, close }', desc: '弹层内容（通常为 DataForm）' },
      { name: 'footer', params: 'footerProps', desc: '弹层底部' }
    ]
  }
]
