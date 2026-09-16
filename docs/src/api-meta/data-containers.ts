import type { ComponentMeta } from './types'
import { containerProps, optionsProps, optionsEmits } from './types'

/** 容器组（4 个） */
export const containerData: ComponentMeta[] = [
  {
    path: 'drawer',
    name: 'WdDrawer',
    title: 'Drawer 抽屉 / 对话框容器',
    desc: '基于 el-drawer / el-dialog：通过 mode 切换抽屉（drawer，默认）与对话框（dialog）；iframe 嵌入、关闭前确认、内容守卫（未保存拦截）、关闭后联动刷新；跨 iframe 联动：url 模式下自动与 iframe 内页面建立 postMessage 桥接，子页面上报事件透传为 iframe-* emit，可驱动关闭+刷新',
    group: '容器',
    intro: {
      overview: 'WdDrawer 基于 `el-drawer` / `el-dialog` 封装，通过 `mode` 切换抽屉（`drawer`，默认）与对话框（`dialog`）两种弹出形式。除承载任意插槽内容外，设置 `url` 后容器内部自动渲染填满的 iframe 加载子页面，并自动建立 postMessage 桥接：子页面上报的协议事件透传为 `iframe-*` 事件，子页提交成功可驱动抽屉自动关闭并联动刷新同组 DataGrid。组件内置关闭前确认（`confirmMessage`）与未保存内容守卫（`wd-container:dirty` 协议），适合详情查看、表单编辑等弹层场景。',
      whenToUse: [
        '从列表页打开详情或编辑表单，希望以抽屉/对话框弹层承载，不跳转页面时。',
        '弹层内容是一个独立页面（已有路由页或第三方页），希望通过 `url` 以 iframe 嵌入并与父页联动时。',
        '关闭弹层前需要确认（有未保存内容），或关闭后需要自动刷新列表数据时。',
        '不建议：简单的提示、二次确认，使用 `ElMessageBox` 更直接。',
        '不建议：内容长期固定在页面内展示，不需要弹层形态时，使用 WdPanel 等内联容器。'
      ],
      notes: [
        '弹层渲染到 `body`（append-to-body），不受父级布局裁剪影响；`size` 传数字时按 px 处理，抽屉模式可传百分比（如 `40%`）。',
        '`url` 模式下 `data` 会拼为 iframe 地址的 query 参数，同时在子页上报 `ready` 后通过 `wd-container:init` 再次下发完整 `data`，子页以协议接收为准。',
        '`url` 模式下 iframe 高度由组件接管：抽屉模式为容器高度的 100%（最小 400px），对话框模式为 60vh；默认插槽内容在 `url` 设置时不渲染。',
        '`reloadOnOpen` 默认 `false`，iframe 在关闭后保留上次内容；需要每次打开都是全新状态时显式开启。',
        '`origin` 缺省时取 `url` 的 origin（无 `url` 时用当前页 origin）；示例中的 `origin="*"` 仅用于演示，生产环境请指定具体子页面 origin。',
        '`confirmMessage` 与脏状态守卫可叠加：子页未上报脏状态时走 `confirmMessage` 确认；已上报脏状态时优先走 `wd-container:dirty-confirm` 子页确认流程。'
      ],
      faq: [
        { q: '`confirm` 事件和 `close` 事件有什么区别？', a: '`close` 表示弹层关闭完成；`confirm` 在关闭流程完成后触发并携带 `{ reason }`（如 `submit`、`close` 等关闭原因），适合做「关闭后处理」的统一入口。' },
        { q: '子页提交了 `wd-container:submit-success`，但表格没有刷新？', a: '请确认 WdDrawer 设置了 `head-refresh-datagrid`，且其 `filter` 与目标 DataGrid 的 `filter` 一致（或用字符串形式定向指定目标 `filter`）。' },
        { q: '为什么每次打开抽屉，iframe 还显示上次的内容？', a: '`reloadOnOpen` 默认为 `false`，iframe 内容在关闭后保留；需要每次打开重新加载时请设置 `reload-on-open`。' },
        { q: '不用 `v-model`，能从按钮以外的逻辑打开抽屉吗？', a: '可以。给组件加 `ref` 后调用 `open()` 方法，效果等同将 `v-model` 置为 `true`。' }
      ]
    },
    props: [
      { name: 'mode', type: "'drawer' | 'dialog'", default: "'drawer'", desc: '弹出形式：抽屉 / 对话框' },
      { name: 'direction', type: "'rtl' | 'ltr' | 'ttb' | 'btt'", default: "'rtl'", desc: '抽屉弹出方向（仅 mode=drawer 生效）' },
      { name: 'origin', type: 'string', default: "''", desc: 'iframe 消息安全校验来源（默认取 url 的 origin；留空且无 url 时用当前页 origin）' },
      { name: 'reloadOnOpen', type: 'boolean', default: 'false', desc: '每次打开时重新加载 iframe 内容（url 模式生效；true 强制刷新，false 保留上次内容）' },
      ...containerProps
    ],
    emits: [
      { name: 'update:modelValue', payload: 'boolean', desc: '显隐变化' },
      { name: 'open', payload: '—', desc: '打开' },
      { name: 'close', payload: '—', desc: '关闭完成' },
      { name: 'confirm', payload: '{ reason }', desc: '关闭流程完成' },
      { name: 'iframe-message', payload: '{ type, payload }', desc: 'iframe 发来的任意协议消息（原始透传）' },
      { name: 'iframe-ready', payload: '—', desc: 'iframe 就绪，请求下发数据' },
      { name: 'iframe-dirty', payload: '{ dirty }', desc: 'iframe 上报脏状态（未保存守卫自动注册）' },
      { name: 'iframe-submit-success', payload: 'any', desc: 'iframe 提交成功（默认自动关闭+刷新）' }
    ],
    slots: [
      { name: 'default', params: '—', desc: '内容（url 未设置时）' },
      { name: 'footer', params: '{ close }', desc: '底部' }
    ],
    methods: [
      { name: 'open()', params: '—', returns: 'void', desc: '编程式打开弹层（等同 v-model 置 true，供自定义触发使用）' },
      { name: 'sendToIframe(type, payload?)', params: 'type: string, payload?: any', returns: 'void', desc: '向 iframe 内发送指令（如 wd-container:submit 触发子页表单提交）' }
    ]
  },
  {
    path: 'iframe',
    name: 'WdIframe',
    title: 'Iframe 内嵌框架',
    desc: '内嵌 iframe 子页面：固定/自适应高度，与子页面基于 postMessage 双向通信。通信约定：子页面通过 parent.postMessage 上报，父组件经 message 事件透传；内置约定 { type:"wd-iframe-height", height } 可驱动高度自适应；如需与弹层容器（WdDrawer）深度联动，参见 WdDrawer 的跨 iframe 联动',
    group: '容器',
    intro: {
      overview: 'WdIframe 在页面内嵌 iframe 子页面，宽度占满父容器，高度支持固定值或按约定自适应。组件与子页面基于 postMessage 双向通信：子页面通过 `parent.postMessage` 上报，父组件经 `message` 事件透传；父组件通过 `send()` 方法主动下发，子页面用 `window.addEventListener(\'message\')` 接收。内置约定 `{ type: "wd-iframe-height", height }` 可驱动高度自适应；`refreshKey` 或 `refresh()` 可强制重新加载 iframe 内容。如需与弹层容器（WdDrawer）深度联动（提交成功自动关闭、未保存守卫等），请参见 WdDrawer 的跨 iframe 联动。',
      whenToUse: [
        '需要在当前页面内嵌一个独立子页面（报表页、第三方页、遗留系统页面）时。',
        '需要父子页面之间做轻量双向通信（下发数据、接收子页状态）时。',
        '子页面内容高度不固定，希望容器随内容自动伸缩时。',
        '不建议：弹层形式的内嵌页（抽屉/对话框 + iframe），直接使用 WdDrawer 的 `url` 模式，可获得关闭守卫、提交联动等完整能力。',
        '不建议：同源且可组件化的内容，优先用 Vue 组件而非 iframe，避免通信与样式隔离成本。'
      ],
      notes: [
        'iframe 宽度固定占满父容器（100%）；`height` 传数字时按 px 处理，也可传任意 CSS 长度。',
        '`autoHeight` 依赖子页面主动上报 `{ type: \'wd-iframe-height\', height }`；`height` 会转为数字，无法解析时不调整高度。子页内容高度变化后需再次上报。',
        '`send()` 的 targetOrigin 取 `origin` 属性，缺省为当前页 origin；跨域子页面必须显式设置 `origin`（如 `https://child.example.com`），演示场景才使用 `\'*`。',
        '刷新有两种等价方式：`refreshKey` 值变化（声明式，适合「每次显示时自增」）与 `ref.refresh()`（命令式）。二者都是重建 iframe 元素，子页状态不会保留。',
        '`refreshKey` 仅在 iframe 常驻 DOM 时才需要；若 iframe 随条件渲染（如弹层每次打开重建），天然就是全新加载，无需配置。',
        '消息监听挂在 `window` 上并在组件卸载时移除，不会泄漏；`message` 事件对子页所有 postMessage 原始透传，建议子页消息统一带 `type` 字段以便父级分拣。'
      ],
      faq: [
        { q: '子页面发了消息，父组件 `@message` 没收到？', a: '请确认子页面使用的是 `parent.postMessage(...)` 且 iframe 未嵌套多层；跨域场景下子页面 postMessage 的 targetOrigin 需与父页 origin 匹配（或按演示方式用 `\'*`）。' },
        { q: '调用了 `send()`，子页面没反应？', a: '先确认 iframe 已加载完成（`load` 事件后再发送）；跨域时检查 `origin` 是否配置为子页面的真实 origin；子页面需用 `window.addEventListener(\'message\', ...)` 接收。' },
        { q: '开启了 `autoHeight`，但高度不变化？', a: '确认子页面按约定上报了 `{ type: \'wd-iframe-height\', height }`，且 `height` 为可解析的数字；内容后续变化时需要子页再次上报新高度。' },
        { q: '想让弹层里的 iframe 提交后自动关闭并刷新表格，用 WdIframe 怎么做？', a: 'WdIframe 本身只做内嵌与通信透传；该场景请使用 WdDrawer 的 `url` 模式，配合 `wd-container:*` 协议与 `head-refresh-datagrid` 实现完整联动，详见《Drawer 抽屉 / 对话框容器》文档。' }
      ]
    },
    props: [
      { name: 'src', type: 'string', default: "''", desc: 'iframe 地址' },
      { name: 'height', type: 'string | number', default: "'480px'", desc: '固定高度（数字按 px）' },
      { name: 'autoHeight', type: 'boolean', default: 'false', desc: '高度自适应：子页面上报 { type:"wd-iframe-height", height } 后自动调整' },
      { name: 'origin', type: 'string', default: "''", desc: 'send 发送时的 targetOrigin（默认同源；跨域时显式指定子页面 origin）' },
      { name: 'refreshKey', type: 'string | number', default: '0', desc: '刷新信号：值变化时强制重新加载 iframe 内容（适合每次显示时自增触发刷新）' }
    ],
    emits: [
      { name: 'load', payload: '—', desc: 'iframe 加载完成' },
      { name: 'message', payload: 'data', desc: '收到子页面 postMessage（任意消息透传）' }
    ],
    methods: [
      { name: 'send(message)', params: 'message: any', returns: 'void', desc: '父 → 子：向 iframe 内页面发送消息（子页用 window.addEventListener("message") 接收）' },
      { name: 'refresh()', params: '—', returns: 'void', desc: '强制重新加载 iframe 内容（重建 iframe 元素）' }
    ]
  },
  {
    path: 'panel',
    name: 'WdPanel',
    title: 'Panel 面板',
    desc: '带标题/描述的内容面板，作为表单分组与详情分区容器；支持折叠、标题右侧操作区与阴影策略',
    group: '容器',
    intro: {
      overview: 'WdPanel 是一个带标题/描述的内容面板，用作表单分组与详情分区的容器。标题左侧带品牌色标识条，支持点击标题区折叠/展开主体内容、在标题右侧放置操作区（extra 插槽），并提供 always / hover / never 三种阴影策略以适应不同层级的视觉分区需求。',
      whenToUse: [
        '详情页需要按「基本信息 / 联系信息 / 其他」等分区组织内容时。',
        '表单较长，需要分组展示并允许用户收起暂不关注的分组时（`collapsible`）。',
        '分区标题旁需要放置「刷新 / 更多」等轻量操作入口时（`extra` 插槽）。',
        '不建议：需要弹出式承载内容（应使用 WdDrawer 抽屉/对话框容器）。',
        '不建议：页面最外层整体布局（应使用 WdStation 中后台外框架）。'
      ],
      notes: [
        '标题区仅在传了 `title` 或使用了 `title` 插槽时才渲染；两者都不传时整个头部（含 description、extra）不显示。`description` 需配合 `title` 属性使用——使用 `title` 插槽自定义标题时，`description` 不再渲染，请把描述写进插槽内容里。',
        '`opened` 只在 `collapsible` 开启后生效；未开启折叠时面板始终展开。',
        '`extra` 插槽区域的点击事件已被拦截（`@click.stop`），点击里面的按钮不会误触面板的折叠/展开。',
        '折叠时主体（default）与底部（footer）会一并收起，展开带高度过渡动画；不要把需要常驻的操作只放在 footer 里。',
        '阴影选择建议：`hover`（默认）适合常规分区；`always` 适合需要突出的核心分区；`never` 仅保留描边，适合密集排列的次级分区。',
        '标题区支持键盘操作（Enter / Space 切换折叠），并带有 `aria-expanded` 等无障碍属性。'
      ],
      faq: [
        { q: '不传 `title` 只传 `description` 为什么不显示？', a: '标题区（header）的渲染条件是 `title` 或 `title` 插槽存在，`description` 是标题的附属内容，不能单独触发标题区渲染。' },
        { q: '`change` 和 `update:opened` 有什么区别？', a: '两者都在折叠状态切换时触发且参数相同。`update:opened` 用于配合 `v-model:opened` 做双向绑定；`change` 用于业务侧监听（如收起时暂存草稿、展开时懒加载数据）。' },
        { q: 'extra 插槽里的按钮点击会把面板折叠了？', a: '不会。extra 区域的点击事件已做 `.stop` 处理，不会冒泡到标题区的折叠切换逻辑。' },
        { q: '想让面板默认收起怎么写？', a: '设置 `collapsible` 并传 `:opened="false"`（或 `v-model:opened` 绑定初始为 `false` 的变量）即可。' }
      ]
    },
    props: [
      { name: 'title', type: 'string', default: "''", desc: '面板标题' },
      { name: 'description', type: 'string', default: "''", desc: '描述' },
      { name: 'collapsible', type: 'boolean', default: 'false', desc: '是否可折叠（点击标题区收起/展开主体与底部）' },
      { name: 'opened', type: 'boolean', default: 'true', desc: '展开状态（配合 collapsible，支持 v-model:opened）' },
      { name: 'shadow', type: "'always' | 'hover' | 'never'", default: "'hover'", desc: '阴影策略：常驻 / 悬停显示 / 无阴影' }
    ],
    emits: [
      { name: 'update:opened', payload: 'value: boolean', desc: '展开状态变化（v-model:opened）' },
      { name: 'change', payload: 'value: boolean', desc: '折叠/展开切换时触发' }
    ],
    slots: [
      { name: 'title', params: '—', desc: '自定义标题区' },
      { name: 'extra', params: '—', desc: '标题右侧操作区' },
      { name: 'default', params: '—', desc: '主体内容' },
      { name: 'footer', params: '—', desc: '底部' }
    ]
  }
]

/** 表单组件（3 个） */
export const formData: ComponentMeta[] = [
  {
    path: 'search-panel',
    name: 'WdSearchPanel',
    title: 'SearchPanel 搜索表单面板',
    desc: '本质是一个完整表单，搜索条件分两行布局：第一行默认搜索项 + 右侧操作按钮（横排一行不换行），第二行 more 插槽承载的隐藏项目在「展开」时作为整行平顺滑出/收起；所有搜索项都在同一个 el-form 作用域内；第一行布局不受第二行展开/收起影响；子项可以用 WdSearchItem / WdFormItem / el-form-item；声明式联动同 filter 组 DataGrid（查询重置到第一页、异组不刷新）',
    group: '表单',
    intro: {
      overview: 'WdSearchPanel 是列表页顶部的搜索表单容器：内部基于 `el-form`（inline 布局）承载若干搜索项，右侧内置「搜索 / 重置」操作列；当搜索条件较多时，可将不常用条件放入 `more` 插槽，点击「展开」时作为独立第二行整行滑出，不改变默认搜索区布局。组件通过 `filter` 分组标识与 `head-refresh-datagrid` 属性，可在搜索、重置后自动刷新同组的 WdDataGrid，是「搜索 + 表格」列表页的标准组合件。',
      whenToUse: [
        '列表页顶部需要一组查询条件，并配套「搜索 / 重置」按钮时。',
        '查询条件较多，希望常用条件默认可见、其余条件折叠到「展开」区域时。',
        '需要搜索/重置后自动刷新同页 DataGrid（通过 `filter` 分组联动）时。',
        '不建议：页面只有 1 个输入框、无任何操作按钮诉求的简单场景，直接使用 `el-input` 更轻量。',
        '不建议：新增/编辑类表单，应使用 WdDataForm 或 `el-form` 而非搜索面板。'
      ],
      notes: [
        '插槽通过作用域参数 `{ model }` 暴露内部查询模型，表单项统一使用 `v-model="model.xxx"` 绑定；在 HTML（非 SFC）场景中可使用组件注册的全局属性 `q`，写作 `v-model="q.xxx"`。',
        '默认区建议放高频条件（1~3 个），低频条件放入 `more` 插槽；`more` 插槽中也可以混用 `el-form-item` 与 `wd-search-item`。',
        '点击「重置」会清空全部查询字段（包括 `more` 区域）并清除校验状态，同时触发 `reset` 事件。',
        '组件未声明的属性和事件会通过 `$attrs` 透传到内部 `el-form`，可传入 `el-form` 支持的通用配置；组件已阻止表单原生提交（`@submit.prevent`），在输入框内回车不会刷新页面。',
        '未提供 `more` 插槽且开启折叠时，默认区整体折叠为单行（约 40px 高）；提供 `more` 插槽后，默认区始终完整显示，仅 `more` 区域参与展开/收起动画。',
        '已知不一致：`defaultExpand` 在 api-meta 中标注默认值为 `true`（默认不折叠），但组件源码中该 prop 的默认值为 `false`；建议使用时始终显式传入 `:default-expand`，避免依赖默认值。'
      ],
      faq: [
        { q: '为什么点了「搜索」表格没有刷新？', a: '请检查三点：SearchPanel 是否设置了 `head-refresh-datagrid`；SearchPanel 与目标 DataGrid 的 `filter` 是否一致（或 `head-refresh-datagrid` 字符串是否指向目标 `filter`）；DataGrid 是否已设置 `api` 并处于激活状态。' },
        { q: '`expand` 与 `default-expand` 有什么区别？', a: '`default-expand` 只决定初始是否展开；`expand`（配合 `v-model:expand`）是受控属性，父组件可持续接管展开状态。二者选其一即可。' },
        { q: '如何自定义「搜索 / 重置」按钮？', a: '使用 `actions` 插槽，作用域参数提供 `{ search, reset }` 两个方法，可在插槽内放置自定义按钮并调用；也可设置 `:with-actions="false"` 隐藏整个操作列，完全自行触发 `search`/`reset` 相关逻辑。' },
        { q: '`label-width` 传 `"auto"` 有什么效果？', a: '标签宽度随文字自适应，不再固定为 `80px`，适合各搜索项标签字数差异较大的场景。' }
      ]
    },
    props: [
      { name: 'collapsible', type: 'boolean', default: 'true', desc: '是否允许折叠（存在隐藏搜索条件时才有 展开/收起 按钮；有 more 插槽恒可折叠，无 more 插槽时默认区超出一行才可折叠）' },
      { name: 'expand', type: 'boolean', default: '—', desc: '展开状态（v-model:expand）' },
      { name: 'defaultExpand', type: 'boolean', default: 'true', desc: '默认是否展开（默认不折叠）' },
      { name: 'withActions', type: 'boolean', default: 'true', desc: '内置查询/重置按钮' },
      { name: 'searchText', type: 'string', default: "'搜索'", desc: '查询按钮文案' },
      { name: 'resetText', type: 'string', default: "'重置'", desc: '重置按钮文案' },
      { name: 'expandText', type: 'string', default: "'展开'", desc: '展开按钮文案' },
      { name: 'collapseText', type: 'string', default: "'收起'", desc: '收起按钮文案' },
      { name: 'labelWidth', type: 'string | number', default: "'80px'", desc: '标签宽度（示例常用 auto 自适应）' },
      { name: 'actionWidth', type: 'string | number', default: "'auto'", desc: '操作列宽度：默认随按钮内容自适应；数字按 px；可传 CSS 长度（如 120px）' },
      { name: 'headRefreshDatagrid', type: 'boolean | string', default: 'false', desc: '查询/重置联动目标 DataGrid' },
      { name: 'filter', type: 'string', default: "''", desc: '联动分组标识' }
    ],
    emits: [
      { name: 'search', payload: 'params', desc: '点击查询' },
      { name: 'reset', payload: '—', desc: '点击重置' },
      { name: 'expand-change', payload: 'boolean', desc: '折叠状态变化' },
      { name: 'update:expand', payload: 'boolean', desc: '折叠状态（v-model）' }
    ],
    slots: [
      { name: 'default', params: '{ model }', desc: '默认可见搜索字段（第一行，el-form-item 或 wd-search-item + v-model="model.xxx"）' },
      { name: 'more', params: '{ model }', desc: '隐藏搜索项目（第二行，收起时仅视觉隐藏；展开后整行平顺滑出；collapsible=false 恒展开）' },
      { name: 'actions', params: '{ search, reset }', desc: '自定义右侧操作列' }
    ],
    methods: [
      { name: 'resetForm()', params: '—', returns: 'void', desc: '重置：清空全部搜索字段并触发查询/联动刷新（等同点击「重置」按钮）' },
      { name: 'getSearchParams()', params: '—', returns: 'object', desc: '获取当前搜索条件对象的副本（默认插槽与 more 插槽字段共享同一表单模型）' },
      { name: 'expand()', params: '—', returns: 'void', desc: '展开面板（滑出 more 隐藏项），emit update:expand(true)' },
      { name: 'collapse()', params: '—', returns: 'void', desc: '收起面板（收回 more 隐藏项），emit update:expand(false)' }
    ]
  },
  {
    path: 'form-item',
    name: 'WdFormItem',
    title: 'FormItem 通用表单项',
    desc: '集成 el-form-item，支持 tip 帮助提示：提供 tip 属性时 label 右侧自动出现问号图标，鼠标悬停显示解释说明；不传 tip 和普通 el-form-item 一致',
    group: '表单',
    intro: {
      overview: 'WdFormItem 在 `el-form-item` 的基础上集成了 `tip` 帮助提示能力：提供 `tip` 属性时，label 右侧自动出现问号图标，鼠标悬停显示解释说明；不传 `tip` 时与普通 `el-form-item` 完全一致。用法与 `el-form-item` 保持一致，通过 `label` 设置标签、`prop` 绑定字段（用于校验），未声明的属性透传给内部 `el-form-item`。',
      whenToUse: [
        '在 `el-form` 表单中包裹输入、选择、开关等任意表单控件，需要标签、校验等标准表单项能力时。',
        '字段含义不直观，希望在 label 旁提供悬停式帮助说明，而不占用额外版面时。',
        '不建议：纯展示内容（非表单录入）不需要表单项容器，直接排版即可。',
        '不建议：在 WdSearchPanel 中编写搜索条件时，推荐使用语义更明确的 WdSearchItem（二者能力一致）。'
      ],
      notes: [
        '未声明的属性与事件通过 `$attrs` 透传给内部 `el-form-item`，`required`、`rules`、`error` 等 `el-form-item` 支持的属性均可直接使用，行为与原生一致。',
        '校验依赖外层 `el-form`：设置 `prop` 后，在 `el-form` 上配置 `rules` 即可生效；单独使用 `required` 属性仅显示红色星号。',
        '只要提供了 `tip` 或 `label` 插槽，即使不传 `label` 属性也会渲染标签区；`label` 插槽优先于 `label` 属性展示自定义内容。',
        '帮助气泡为深色主题，悬停约 100ms 后显示，问号图标可聚焦（键盘可访问）。',
        '`tipPlacement` 可选值：`top`、`top-start`、`top-end`、`bottom`、`bottom-start`、`bottom-end`、`left`、`right`（同 el-tooltip 的 placement）。'
      ],
      faq: [
        { q: 'WdFormItem 与 el-form-item 有什么区别？', a: '用法完全一致，WdFormItem 仅在其上增加了 `tip` / `tipPlacement` 帮助提示能力；不传 `tip` 时两者表现相同，可以平滑替换。' },
        { q: '设置了 `tip` 但没有出现问号图标？', a: '请确认 `tip` 为非空字符串；问号图标只在 `tip` 有内容时渲染。' },
        { q: '如何自定义标签内容（例如加图标或链接）？', a: '使用 `label` 插槽自定义标签区内容；插槽内容优先于 `label` 属性显示。' },
        { q: '在 WdSearchPanel 里应该用 WdFormItem 还是 WdSearchItem？', a: '二者能力一致（WdSearchItem 继承 WdFormItem 全部能力）。搜索场景建议使用语义更明确的 WdSearchItem，普通表单使用 WdFormItem。' }
      ]
    },
    props: [
      { name: 'label', type: 'string', default: "''", desc: '字段标签文字' },
      { name: 'prop', type: 'string', default: "''", desc: '绑定字段名（对应表单 model 的 key）' },
      { name: 'tip', type: 'string', default: "''", desc: '帮助说明：提供时 label 右侧自动出现带问号的图标，鼠标悬停显示说明；不传则不显示图标' },
      { name: 'tipPlacement', type: "Placement", default: "'top'", desc: '帮助气泡的弹出位置' }
    ],
    slots: [
      { name: 'default', params: '—', desc: '表单控件内容区域（el-input / el-select 等）' },
      { name: 'label', params: '—', desc: '自定义 label 文字' }
    ]
  },
  {
    path: 'search-item',
    name: 'WdSearchItem',
    title: 'SearchItem 搜索面板专用表单项',
    desc: '专为 SearchPanel 定制的表单项，继承 WdFormItem 全部能力，后续可添加搜索场景专属特性',
    group: '表单',
    intro: {
      overview: 'WdSearchItem 是专为 WdSearchPanel 定制的表单项容器，继承 WdFormItem 的全部能力（label 标签、prop 字段绑定、tip 悬停帮助提示），用法与 WdFormItem 一致。在 WdSearchPanel 的 `default` 或 `more` 插槽中使用，通过插槽作用域参数 `model` 绑定查询字段（`v-model="model.xxx"`）；多个子项在第一行流式排列，右侧为查询/重置按钮。作为搜索场景语义化组件，后续版本可在此之上添加搜索场景专属特性。',
      whenToUse: [
        '在 WdSearchPanel 中编写搜索条件项，需要标签 + 控件的标准布局时。',
        '搜索字段含义不直观，希望通过 `tip` 在 label 旁提供悬停说明时。',
        '不建议：新增/编辑表单场景，请使用 WdFormItem（或 WdDataForm）而非 WdSearchItem。',
        '不建议：无标签、无帮助提示诉求的极简搜索项，也可以直接在插槽内使用 `el-form-item`。'
      ],
      notes: [
        '字段绑定必须走 WdSearchPanel 插槽作用域参数 `model`，即 `v-model="model.xxx"`；`default` 与 `more` 插槽共享同一查询模型，字段名不要重复。',
        '`prop` 与查询模型的 key 保持一致，便于重置、参数收集等面板级能力按字段工作。',
        '未声明的属性与事件通过 `$attrs` 透传给内部 `el-form-item`，控件宽度建议通过行内 `style` 显式指定（示例中各控件均带宽度），保证第一行流式排列整齐。',
        '帮助气泡为深色主题，悬停约 100ms 后显示；`tipPlacement` 可选值：`top`、`top-start`、`top-end`、`bottom`、`bottom-start`、`bottom-end`、`left`、`right`。',
        'WdSearchItem 与 WdFormItem 当前能力一致；在搜索面板内优先使用 WdSearchItem，以便未来平滑获得搜索场景专属特性。'
      ],
      faq: [
        { q: 'WdSearchItem 可以脱离 WdSearchPanel 单独使用吗？', a: '它是为 SearchPanel 场景设计的语义化组件，通常在 `default` / `more` 插槽中使用；脱离面板时行为与 WdFormItem 相同，但普通表单建议直接使用 WdFormItem。' },
        { q: '`default` 插槽和 `more` 插槽里的字段是同一个模型吗？', a: '是。两个插槽通过作用域参数暴露的是同一个查询模型，点击「重置」会一并清空两个区域的字段。' },
        { q: '为什么控件显示得挤在一起或换行异常？', a: '请为每个控件显式设置宽度（如 `style="width: 180px"`），并让标签宽度与面板 `label-width` 协调（示例常用 `label-width="auto"` 自适应）。' },
        { q: 'tip 的问号图标可以换成别的图标或位置吗？', a: '问号图标为组件内置（悬停显示 `tip` 内容），不支持替换图标；气泡弹出方向可通过 `tipPlacement` 调整。' }
      ]
    },
    props: [
      { name: 'label', type: 'string', default: "''", desc: '字段标签文字' },
      { name: 'prop', type: 'string', default: "''", desc: '绑定字段名（对应查询 model 的 key）' },
      { name: 'tip', type: 'string', default: "''", desc: '帮助说明：提供时 label 右侧自动出现带问号的图标，鼠标悬停显示说明；不传则不显示图标' },
      { name: 'tipPlacement', type: "Placement", default: "'top'", desc: '帮助气泡的弹出位置' }
    ],
    slots: [
      { name: 'default', params: '—', desc: '表单控件内容区域（el-input / el-select 等）' },
      { name: 'label', params: '—', desc: '自定义 label 文字' }
    ]
  }
]

/** 表单元素组（5 个；另在导航中与上传组 uploadData 合并展示） */
export const inputData: ComponentMeta[] = [
  {
    path: 'select',
    name: 'WdSelect',
    title: 'Select 下拉选择',
    desc: '基于 el-select：API 自动加载选项、远程搜索、前插/后追加固定项，自定义选项模板',
    group: '表单元素',
    intro: {
      overview: 'WdSelect 基于 el-select 封装，在保留原生能力的基础上内置了选项加载统一协议：既可通过 api 自动加载远程选项，也可直接传入 dataSource 静态数组；支持 textProp / valueProp / tipsProp 字段映射、addData / appendData 前后固定项，以及 remote 远程搜索。选项支持悬停提示图标与自定义模板，是表单和搜索面板中最常用的单选/多选下拉控件。',
      whenToUse: [
        '选项较多（5 个以上）或需要从接口动态加载的单选/多选场景，如角色、部门、字典项选择。',
        '需要输入关键字过滤选项：本地过滤（filterable，默认开启）或远程搜索（remote）。',
        '选项需要附加说明（tips 悬停提示图标）或自定义显示内容（默认插槽）。',
        '不建议：选项仅 2-5 个且希望平铺展示、减少一次点击时，优先使用 WdRadioList（单选）或 WdCheckboxList（多选），操作更直观。'
      ],
      notes: [
        'filterable 默认值为 true（本地可搜索），与 el-select 原生默认值 false 不同；remote=true 时组件强制开启 filterable（源码中 `:filterable="remote || filterable"`）。',
        '远程搜索仅在配置了 api 时生效；关键字以 keywordKey（默认 \'keyword\'）为字段名并入 apiParam 提交，字段名需与后端约定一致。',
        'dataSource 与 api 同时存在时 dataSource 优先，不会发起请求；二者都为空时选项仅剩 addData / appendData 固定项。',
        'active=false 可关闭挂载时的自动加载；此后 api 或 dataSource 发生变化时会重新加载（dataSource 变化恒触发）。',
        '接口返回按统一响应协议 `{ code, data, message }` 自动解包：data 为选项数组，若为 `{ list }` 结构则取 list；dataSource 也支持基本类型数组（如 `[1, 2, 3]`），自动映射为 text/value。',
        'el-select 原生属性（clearable、collapse-tags、placeholder、size 等）经 $attrs 透传可直接使用，示例中的 `multiple collapse-tags collapse-tags-tooltip clearable` 组合即为此用法。',
        '数据项的 tips 字段非空时，选项右侧显示问号图标，悬停弹出 tooltip；图标已做 `@click.stop` 处理，不会误触发选中。'
      ],
      faq: [
        { q: '后端返回的字段不是 text / value 怎么办？', a: '用 text-prop / value-prop 指定显示与取值字段名；悬停提示字段用 tips-prop 指定（默认 \'tips\'）。' },
        { q: '如何在选项最前面加一个「全部」？', a: '使用 add-data 前插固定项，如 `:add-data="[{ value: 0, text: \'全部角色\' }]"`；append-data 则是在末尾追加。' },
        { q: '远程搜索不触发请求？', a: '确认同时设置了 api 与 remote；keyword-key 需与后端接收关键字的参数名一致；active=false 不影响远程搜索，仅控制挂载自动加载。' },
        { q: '如何监听选项加载失败？', a: '监听 api-fail 事件（回调参数 `{ code, message }`）；完整请求生命周期为 apiBefore → apiSuccess / apiFail → apiAfter。' }
      ]
    },
    dataTypes: [
      {
        name: 'OptionItem（选项数据项）',
        ref: '`dataSource` / `addData` / `appendData` props 的数组元素；`api` 接口返回的选项列表元素',
        desc: ['选项支持两种形态：**对象**——按 `textProp` / `valueProp` / `tipsProp` 配置的字段名取显示文本、值与悬停提示，其余字段原样保留（可在默认插槽中通过 `option.raw` 访问）；**基本类型**（string / number 等）——自动映射为 `{ text: String(item), value: item }`。'],
        fields: [
          { name: 'text（字段名由 textProp 决定）', type: 'string', required: '是', default: '—', desc: '选项显示文本' },
          { name: 'value（字段名由 valueProp 决定）', type: 'any', required: '是', default: '—', desc: '选项值' },
          { name: 'tips（字段名由 tipsProp 决定）', type: 'string', required: '否', default: "''", desc: '悬停提示，非空时鼠标悬停该选项显示 tooltip' },
          { name: '其他任意字段', type: 'any', required: '否', default: '—', desc: '原样保留在标准化结果的 raw 中' },
        ],
        after: ['接口返回约定：`api` 返回的 `data` 为选项数组，或 `{ list: 选项数组 }` 结构（字段名可由全局配置 `response.list.listName` 覆盖）。'],
      },
      {
        name: 'NormalizedOption（标准化选项）',
        ref: '默认插槽作用域参数 `option`',
        desc: ['组件内部将所有选项标准化为以下结构后渲染：'],
        fields: [
          { name: 'text', type: 'string', required: '是', default: '—', desc: '显示文本' },
          { name: 'value', type: 'any', required: '是', default: '—', desc: '选项值' },
          { name: 'tips', type: 'string', required: '是', default: "''", desc: '悬停提示（无则为空串）' },
          { name: 'raw', type: 'Record<string, any>', required: '是', default: '—', desc: '原始数据项（基本类型选项为映射后的对象）' },
        ],
      },
    ],
    props: [
      { name: 'modelValue', type: 'any', default: '—', desc: '选中值（v-model）' },
      { name: 'multiple', type: 'boolean', default: 'false', desc: '多选' },
      { name: 'remote', type: 'boolean', default: 'false', desc: '远程搜索' },
      { name: 'filterable', type: 'boolean', default: 'true', desc: '本地可搜索' },
      { name: 'keywordKey', type: 'string', default: "'keyword'", desc: '远程搜索关键字字段名' },
      ...optionsProps
    ],
    emits: optionsEmits,
    slots: [{ name: 'default', params: '{ option, text, value }', desc: '选项内容' }]
  },
  {
    path: 'auto-complete',
    name: 'WdAutoComplete',
    title: 'AutoComplete 自动完成',
    desc: '基于 el-autocomplete：远程搜索、valueKey/labelKey 字段映射、自定义建议模板',
    group: '表单元素',
    intro: {
      overview: 'WdAutoComplete 基于 el-autocomplete 封装，提供输入即建议的自动补全能力：支持 dataSource 静态数据本地过滤，也支持 api 远程搜索建议；通过 valueKey / labelKey 完成选项字段映射，选中建议项时 v-model 写入选项值字段，select 事件抛出原始数据对象；建议项内容可通过默认插槽自定义。',
      whenToUse: [
        '输入值是自由文本，但希望给出候选建议引导用户快速填写，如姓名、商品名、地址关键字。',
        '候选集较大、需要边输入边向服务端检索（远程搜索建议）。',
        '不建议：取值必须严格限定在固定选项集合内时，使用 WdSelect（可选可搜但不可自由输入）更合适。'
      ],
      notes: [
        '选中建议项时，v-model 写入的是选项的 valueKey 字段值（默认 \'value\'），select 事件抛出该选项的原始对象 raw，需要整行数据（如部门、邮箱）时在 select 中取。',
        '加载策略：api 存在且 active=true 时走「输入即远程搜索」；否则首次输入时加载一次选项（api 一次全量或 dataSource 静态数据）后做本地过滤，本地过滤对 text 字段不区分大小写。',
        '接口返回按统一响应协议 `{ code, data, message }` 自动解包：data 为选项数组，若为 `{ list }` 结构则取 list。',
        '组件通过 labelKey 指定 el-autocomplete 的 value-key（输入框回显文本），请确保 labelKey 与 valueKey 的字段映射设置正确，否则选中后输入框显示异常。',
        'addData / appendData 固定项会并入候选列表参与本地过滤；远程搜索模式下每次请求返回后同样合并。',
        'el-autocomplete 原生属性（placeholder、clearable、debounce 等）经 $attrs 透传，可直接使用。'
      ],
      faq: [
        { q: 'v-model 拿到的是显示文本还是选项值？', a: '选中建议项时写入 valueKey 字段值；手动输入未选中任何建议时，v-model 跟随输入字符串（el-autocomplete 原生行为）。' },
        { q: '如何获取选中项的完整数据（不只是值）？', a: '监听 select 事件，回调参数是该选项的原始对象 raw。' },
        { q: '输入后没有发出远程请求？', a: '远程搜索要求 api 非空且 active=true；若只想首次加载一次后本地过滤，保留 api 但把 active 设为 false 即可。' },
        { q: '选项字段名与后端不一致（如 name/dept）怎么办？', a: '用 label-key 指定显示字段、value-key 指定选中值字段，远程关键字字段名用 keyword-key 指定。' }
      ]
    },
    dataTypes: [
      {
        name: 'OptionItem（选项数据项）',
        ref: '`dataSource` / `addData` / `appendData` props 的数组元素；`api` 接口返回的选项列表元素',
        desc: ['选项支持两种形态：**对象**——按 `textProp` / `valueProp` / `tipsProp` 配置的字段名取显示文本、值与悬停提示，其余字段原样保留（可在默认插槽中通过 `option.raw` 访问）；**基本类型**（string / number 等）——自动映射为 `{ text: String(item), value: item }`。'],
        fields: [
          { name: 'text（字段名由 textProp 决定）', type: 'string', required: '是', default: '—', desc: '选项显示文本' },
          { name: 'value（字段名由 valueProp 决定）', type: 'any', required: '是', default: '—', desc: '选项值' },
          { name: 'tips（字段名由 tipsProp 决定）', type: 'string', required: '否', default: "''", desc: '悬停提示，非空时鼠标悬停该选项显示 tooltip' },
          { name: '其他任意字段', type: 'any', required: '否', default: '—', desc: '原样保留在标准化结果的 raw 中' },
        ],
        after: ['接口返回约定：`api` 返回的 `data` 为选项数组，或 `{ list: 选项数组 }` 结构（字段名可由全局配置 `response.list.listName` 覆盖）。'],
      },
      {
        name: 'NormalizedOption（标准化选项）',
        ref: '默认插槽作用域参数 `option`',
        desc: ['组件内部将所有选项标准化为以下结构后渲染：'],
        fields: [
          { name: 'text', type: 'string', required: '是', default: '—', desc: '显示文本' },
          { name: 'value', type: 'any', required: '是', default: '—', desc: '选项值' },
          { name: 'tips', type: 'string', required: '是', default: "''", desc: '悬停提示（无则为空串）' },
          { name: 'raw', type: 'Record<string, any>', required: '是', default: '—', desc: '原始数据项（基本类型选项为映射后的对象）' },
        ],
      },
    ],
    props: [
      { name: 'modelValue', type: 'string', default: "''", desc: '输入值（v-model）' },
      { name: 'valueKey', type: 'string', default: "'value'", desc: '选项值字段' },
      { name: 'labelKey', type: 'string', default: "'text'", desc: '选项显示字段' },
      { name: 'keywordKey', type: 'string', default: "'keyword'", desc: '远程搜索关键字字段名' },
      ...optionsProps
    ],
    emits: [...optionsEmits, { name: 'select', payload: 'raw', desc: '选中建议项（原始对象）' }],
    slots: [{ name: 'default', params: '{ option, text, value }', desc: '建议项内容' }]
  },
  {
    path: 'checkbox-list',
    name: 'WdCheckboxList',
    title: 'CheckboxList 多选列表',
    desc: '基于 el-checkbox-group：API 自动加载选项、按钮样式切换、前插/后追加固定项',
    group: '表单元素',
    intro: {
      overview: 'WdCheckboxList 基于 el-checkbox-group 封装，以平铺复选框（或按钮组）形式呈现多选项：支持 api 自动加载选项与 dataSource 静态数组，textProp / valueProp / tipsProp 字段映射，addData / appendData 前后固定项，buttonStyle 一键切换按钮样式；v-model 绑定选中值数组，加载期间自动显示 loading。',
      whenToUse: [
        '选项较少（建议 2-8 个）、希望用户一眼看全并直接勾选的多选场景，如角色分配、标签选择、状态筛选。',
        '需要按钮组形态（buttonStyle）做多选筛选，如列表页快捷过滤条。',
        '不建议：选项很多或需要搜索时，使用 WdSelect 的 multiple 模式更节省空间；只允许单选时使用 WdRadioList。'
      ],
      notes: [
        'modelValue 是数组，请始终用数组初始化（`ref([])`），不要绑定单个值。',
        '数据项的 tips 字段非空时，鼠标悬停该选项文本弹出 tooltip；可用 tips-prop 自定义解包字段名（默认 \'tips\'），无 tips 字段的选项不显示提示。',
        '自定义解包字段名示例：后端返回 `{ id, name, remark }` 时，设置 `value-prop="id" text-prop="name" tips-prop="remark"` 即可，无需手工转换数据。',
        'dataSource 与 api 同时存在时 dataSource 优先，不会发起请求；active=false 仅关闭挂载自动加载，api/dataSource 变化时仍会重新加载。',
        'addData / appendData 固定项同样经过字段映射解析，需与 textProp / valueProp 的字段名保持一致。',
        'el-checkbox-group 原生属性（如 min、max、disabled、size）经 $attrs 透传，可直接用于限制最少/最多勾选数。'
      ],
      faq: [
        { q: '选项显示与取值字段不是 text / value 怎么办？', a: '用 text-prop / value-prop 指定字段名；提示字段用 tips-prop。' },
        { q: '如何限制最多可选数量？', a: 'el-checkbox-group 的 max / min 属性经 $attrs 透传，直接写 `:max="2"` 即可。' },
        { q: '按钮样式下提示还生效吗？', a: '生效。button-style 仅切换 el-checkbox 为 el-checkbox-button，tips 悬停提示在两种形态下都可用。' },
        { q: '如何监听选项加载失败？', a: '监听 api-fail 事件（回调参数 `{ code, message }`）；完整请求生命周期为 apiBefore → apiSuccess / apiFail → apiAfter。' }
      ]
    },
    dataTypes: [
      {
        name: 'OptionItem（选项数据项）',
        ref: '`dataSource` / `addData` / `appendData` props 的数组元素；`api` 接口返回的选项列表元素',
        desc: ['选项支持两种形态：**对象**——按 `textProp` / `valueProp` / `tipsProp` 配置的字段名取显示文本、值与悬停提示，其余字段原样保留（可在默认插槽中通过 `option.raw` 访问）；**基本类型**（string / number 等）——自动映射为 `{ text: String(item), value: item }`。'],
        fields: [
          { name: 'text（字段名由 textProp 决定）', type: 'string', required: '是', default: '—', desc: '选项显示文本' },
          { name: 'value（字段名由 valueProp 决定）', type: 'any', required: '是', default: '—', desc: '选项值' },
          { name: 'tips（字段名由 tipsProp 决定）', type: 'string', required: '否', default: "''", desc: '悬停提示，非空时鼠标悬停该选项显示 tooltip' },
          { name: '其他任意字段', type: 'any', required: '否', default: '—', desc: '原样保留在标准化结果的 raw 中' },
        ],
        after: ['接口返回约定：`api` 返回的 `data` 为选项数组，或 `{ list: 选项数组 }` 结构（字段名可由全局配置 `response.list.listName` 覆盖）。'],
      },
    ],
    props: [
      { name: 'modelValue', type: 'array', default: '[]', desc: '选中值数组（v-model）' },
      { name: 'buttonStyle', type: 'boolean', default: 'false', desc: '按钮样式' },
      ...optionsProps
    ],
    emits: optionsEmits,
    slots: [{ name: 'default', params: '{ option, text, value }', desc: '选项内容' }]
  },
  {
    path: 'radio-list',
    name: 'WdRadioList',
    title: 'RadioList 单选列表',
    desc: '基于 el-radio-group：API 自动加载选项、按钮样式切换、前插/后追加固定项',
    group: '表单元素',
    intro: {
      overview: 'WdRadioList 基于 el-radio-group 封装，以平铺单选框（或按钮组）形式呈现互斥选项：支持 api 自动加载选项与 dataSource 静态数组，textProp / valueProp / tipsProp 字段映射，addData / appendData 前后固定项，buttonStyle 一键切换按钮样式；v-model 绑定选中值，加载期间自动显示 loading。',
      whenToUse: [
        '选项较少（建议 2-5 个）、希望平铺展示减少一次点击的单选场景，如状态筛选（启用/停用/归档）、性别、类型选择。',
        '需要「不限 / 全部」类占位项时，用 addData 前插固定项即可，无需后端配合。',
        '不建议：选项很多或需要搜索时使用 WdSelect；仅开/关两个互斥状态且语义是「启停」时，WdSwitch 更贴切。'
      ],
      notes: [
        '数据项的 tips 字段非空时，鼠标悬停该选项文本弹出 tooltip；可用 tips-prop 自定义解包字段名（默认 \'tips\'），适合做选项含义解释（如「停用：账号保留数据，但暂时无法登录」）。',
        '自定义解包字段名示例：后端返回 `{ id, name, remark }` 时，设置 `value-prop="id" text-prop="name" tips-prop="remark"` 即可，无需手工转换数据。',
        '「不限 / 全部」类占位项推荐用 add-data 前插（如 `{ value: 0, text: \'不限\' }`），而不是混入业务选项数据。',
        'dataSource 与 api 同时存在时 dataSource 优先，不会发起请求；active=false 仅关闭挂载自动加载，api/dataSource 变化时仍会重新加载。',
        'addData / appendData 固定项同样经过字段映射解析，需与 textProp / valueProp 的字段名保持一致。',
        'el-radio-group 原生属性（如 disabled、size、text-color）经 $attrs 透传，可直接使用。'
      ],
      faq: [
        { q: 'WdRadioList 和 WdSelect 怎么选？', a: '选项少（2-5 个）且希望平铺直选时用 WdRadioList；选项多、需要搜索或节省空间时用 WdSelect。' },
        { q: '选中值可以是非数字类型吗？', a: '可以。modelValue 类型为 any，字符串、数字、布尔等均可，与选项 valueProp 字段值类型保持一致即可。' },
        { q: '如何让默认选中「不限」？', a: '把 v-model 初始值设为 add-data 中占位项的值，如 `ref(0)` 对应 `{ value: 0, text: \'不限\' }`。' },
        { q: '如何监听选项加载失败？', a: '监听 api-fail 事件（回调参数 `{ code, message }`）；完整请求生命周期为 apiBefore → apiSuccess / apiFail → apiAfter。' }
      ]
    },
    dataTypes: [
      {
        name: 'OptionItem（选项数据项）',
        ref: '`dataSource` / `addData` / `appendData` props 的数组元素；`api` 接口返回的选项列表元素',
        desc: ['选项支持两种形态：**对象**——按 `textProp` / `valueProp` / `tipsProp` 配置的字段名取显示文本、值与悬停提示，其余字段原样保留（可在默认插槽中通过 `option.raw` 访问）；**基本类型**（string / number 等）——自动映射为 `{ text: String(item), value: item }`。'],
        fields: [
          { name: 'text（字段名由 textProp 决定）', type: 'string', required: '是', default: '—', desc: '选项显示文本' },
          { name: 'value（字段名由 valueProp 决定）', type: 'any', required: '是', default: '—', desc: '选项值' },
          { name: 'tips（字段名由 tipsProp 决定）', type: 'string', required: '否', default: "''", desc: '悬停提示，非空时鼠标悬停该选项显示 tooltip' },
          { name: '其他任意字段', type: 'any', required: '否', default: '—', desc: '原样保留在标准化结果的 raw 中' },
        ],
        after: ['接口返回约定：`api` 返回的 `data` 为选项数组，或 `{ list: 选项数组 }` 结构（字段名可由全局配置 `response.list.listName` 覆盖）。'],
      },
    ],
    props: [
      { name: 'modelValue', type: 'any', default: '—', desc: '选中值（v-model）' },
      { name: 'buttonStyle', type: 'boolean', default: 'false', desc: '按钮样式' },
      ...optionsProps
    ],
    emits: optionsEmits,
    slots: [{ name: 'default', params: '{ option, text, value }', desc: '选项内容' }]
  },
  {
    path: 'switch',
    name: 'WdSwitch',
    title: 'Switch 状态开关',
    desc: '基于 el-switch：切换即请求、自定义开/关值、失败自动回滚、悬停提示、联动刷新',
    group: '表单元素',
    intro: {
      overview: 'WdSwitch 基于 el-switch 封装，核心能力是「切换即请求」：用户拨动开关后自动把新状态提交到 api，请求期间开关显示 loading，业务失败或网络异常时自动回滚到切换前的值；支持 activeValue / inactiveValue 自定义开/关值、tips 悬停提示，以及切换成功后经 headRefreshDatagrid 联动刷新目标 DataGrid。',
      whenToUse: [
        '列表/详情页中对单条记录做二值状态切换并立即落库，如启用/禁用账号、开启/关闭配置。',
        '状态值不是布尔而是 1/0、\'Y\'/\'N\' 等自定义值（activeValue / inactiveValue）。',
        '不建议：仅表达「是/否」且不需要立即提交服务器的场景，可用但不需配置 api（本地模式）；超过两个互斥状态时使用 WdRadioList 或 WdSelect。'
      ],
      notes: [
        '失败自动回滚：业务失败（apiFail）与网络异常（apiException）都会把 v-model 回滚到切换前的值，无需手动恢复；UI 上表现为开关弹回原位。',
        '提交参数为 `{ ...apiParam, [paramKey]: 当前值 }`：固定参数放 apiParam，状态字段名由 paramKey 决定（默认 \'status\'）。',
        '组件对返回的 data 不做字段提取（开关状态由 v-model 维护），请求结果通过 apiSuccess / apiAfter 事件携带 data 抛出，需要后端返回内容时在事件中取。',
        '请求期间开关自动进入 loading 状态，防止重复点击；因此不要在外部再加重复的状态锁。',
        'tips 非空时组件自动包裹 el-tooltip（顶部弹出），无提示则不包裹，减少层级。',
        '未配置 api 时组件退化为普通开关：只触发 change / update:modelValue，不产生任何请求事件。',
        'el-switch 原生属性（active-text、inactive-text、inline-prompt、disabled 等）经 $attrs 透传，可直接使用。'
      ],
      faq: [
        { q: '切换失败了还需要自己把值改回去吗？', a: '不需要。业务失败和网络异常都会自动回滚 v-model；可监听 api-fail / api-exception 做提示。' },
        { q: '状态值是 1/0 而不是 true/false？', a: '设置 `:active-value="1" :inactive-value="0"`，v-model 与提交值都会使用该自定义值。' },
        { q: '提交时除了状态还要带记录的 id？', a: '把固定参数放进 api-param，如 `:api-param="{ id: row.id }"`，最终提交 `{ id: row.id, status: 当前值 }`。' },
        { q: '如何让切换成功后刷新所在表格？', a: '设置 head-refresh-datagrid（true=同组，字符串=定向），并用 filter 与目标 DataGrid 对齐分组标识。' }
      ]
    },
    props: [
      { name: 'modelValue', type: 'any', default: 'false', desc: '开关值（v-model）' },
      { name: 'api', type: 'string', default: "''", desc: '切换请求地址' },
      { name: 'apiMethod', type: "'get' | 'post'", default: "'post'", desc: '请求方法' },
      { name: 'apiParam', type: 'object', default: '{}', desc: '固定参数' },
      { name: 'paramKey', type: 'string', default: "'status'", desc: '提交参数的字段名' },
      { name: 'activeValue', type: 'any', default: 'true', desc: '开启值' },
      { name: 'inactiveValue', type: 'any', default: 'false', desc: '关闭值' },
      { name: 'tips', type: 'string', default: "''", desc: '悬停提示' },
      { name: 'headRefreshDatagrid', type: 'boolean | string', default: 'false', desc: '成功后刷新目标 DataGrid' },
      { name: 'filter', type: 'string', default: "''", desc: '联动分组标识' }
    ],
    emits: [
      { name: 'update:modelValue', payload: 'value', desc: '开关值变化' },
      { name: 'change', payload: 'value', desc: '切换' },
      { name: 'apiBefore', payload: '{ url }', desc: '请求前' },
      { name: 'apiSuccess', payload: '{ data }', desc: '请求成功' },
      { name: 'apiFail', payload: '{ code, message }', desc: '业务失败（回滚）' },
      { name: 'apiException', payload: '{ error, message }', desc: '网络异常（回滚）' },
      { name: 'apiAfter', payload: '—', desc: '请求完成' }
    ]
  }
]
