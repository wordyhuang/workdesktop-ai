import type { ComponentMeta } from './types'

/** 页面元素组（2 个）：路径导航 / 提示 */
export const pageElementData: ComponentMeta[] = [
  {
    path: 'path',
    name: 'WdPath',
    title: 'Path 路径（面包屑）',
    desc: '导航路径（面包屑）：手动填写路径，或自动模式联动 WdStation 读取菜单所在路径、补充页面 H1~H4 标题链；标题段始终跟随当前可视范围内第一个标题',
    group: '页面元素',
    intro: {
      overview: 'WdPath 是导航路径（面包屑）组件，基于 el-breadcrumb 封装，支持手动与自动双模式。手动模式通过 `items` 直接填写路径节点（title / icon / path）；自动模式与 `WdStation` 按 `filter` 联动——自动读取当前激活菜单所在路径（分组 → 菜单 → 子菜单），并在其后补充内容区 H1~H4 的标题链，标题段**始终跟随当前可视范围内第一个标题**（滚动页面/容器时，新进入可视区顶部的标题会成为当前路径）。',
      whenToUse: [
        '中后台页面需要展示当前页面位置的导航路径。',
        '与 `WdStation` 搭配：希望路径自动跟随菜单与内容区标题变化，无需手动维护。',
        '需要举证当前章节位置的场景（如文档型长页面：滚动时路径自动跟随可视范围内的章节，明确当前位置）。',
        '不建议：单页营销/展示类页面，无多级导航语义。'
      ],
      notes: [
        '自动模式的菜单段来源：与 `WdStation` 设置相同的 `filter` 分组即自动联动（同 `setStationFooter` 的 filter 心智）。',
        '标题段扫描范围：`container` 指定（CSS 选择器或元素引用）；默认取最近祖先 `.wd-station__content`（组件放在 Station 内容区时自动生效），无则扫描整页。',
        '标题链按 h1→h2→h3→h4 大纲收敛，始终跟随**当前可视范围内的第一个标题**；页面级滚动（container 缺省为整页）与元素级滚动（如 Station 内容区）均支持。',
        '自动模式的标题定位完全由滚动位置决定，无悬停状态：滚动到哪个章节，路径标题段即收敛为该章节的 H1→H2→H3→H4 大纲链。',
        '组件放在 Station 内容区时，Station 的 `refresh()` 会连同组件一起重挂载，自动重新扫描标题。',
        'router 模式下带 `path` 的段自动以 el-breadcrumb-item 的 `to` 跳转；html 模式（无 router）仅抛 `item-click`，由调用方决定导航行为。'
      ],
      faq: [
        { q: '自动模式如何与 WdStation 联动？', a: '组件与 Station 设置相同的 `filter` 即可：菜单选中/分组切换/路由反查时，Station 会通知同组组件重新读取菜单链；读取 API 为 `getStationMenuChain(filter)`，也可在业务代码中主动调用。' },
        { q: '为什么自动模式只显示了「首页」？', a: '说明当前 filter 组没有可读取菜单链的 Station，或容器内没有 h1~h4 标题。检查：1) 组件与 Station 的 filter 是否一致；2) 内容区是否真的渲染了标题标签；3) `container` 作用域是否覆盖到了内容区。' },
        { q: '标题链什么时候更新？', a: '挂载、路由变化、容器 DOM 变更（MutationObserver）、菜单链变化（Station 通知）、容器滚动时都会重新扫描/定位。也可用 ref 调用 `refresh()` 手动刷新。' },
        { q: '标题段是什么时候更新的？', a: '完全由滚动位置决定——始终指向当前可视范围内的第一个标题；滚动页面/容器时，新进入可视区顶部的标题会成为当前路径（标题段按 H1→H2→H3→H4 大纲链收敛）。' },
        { q: 'tabs 内容模式下组件放哪？', a: 'tabs 模式内容区由 RouterView 渲染，组件建议放在 Station 的 `#header-left` / `#header-center` 插槽，并用 `container` 指向各页面内容容器（或整页扫描）。' }
      ]
    },
    dataTypes: [
      {
        name: 'PathItem（路径节点）',
        ref: '`items` prop（`PathItem[]`）与 `change` / `item-click` 事件回调',
        fields: [
          { name: 'title', type: 'string', required: '是', default: '—', desc: '标题' },
          { name: 'path', type: 'string', required: '否', default: '—', desc: '路由路径（router 模式下自动以 el-breadcrumb-item 的 to 跳转）' },
          { name: 'icon', type: 'string | Component', required: '否', default: '—', desc: '图标（ElementPlus 图标名或组件）' },
          { name: 'source', type: "'menu' | 'heading' | 'home' | 'manual'", required: '否', default: '—', desc: '段来源（自动模式内部标记，手动模式可省略）' },
          { name: 'level', type: 'number', required: '否', default: '—', desc: 'heading 段：标题级别 1-4' },
        ],
      },
    ],
    props: [
      { name: 'filter', type: 'string', default: "''", desc: '联动分组标识（自动模式与同组 WdStation 联动）' },
      { name: 'mode', type: "'manual' | 'auto'", default: "'manual'", desc: '模式：manual=手动填写路径 / auto=自动联动（Station 菜单链 + 页面标题）' },
      { name: 'items', type: 'array | string', default: '—', desc: '手动模式路径节点（PathItem[]；支持 JSON 字符串）' },
      { name: 'home', type: 'string', default: "'首页'", desc: '自动模式：首页节点标题' },
      { name: 'showHome', type: 'boolean', default: 'true', desc: '自动模式：是否显示首页节点' },
      { name: 'separator', type: 'string', default: "'/'", desc: '分隔符' },
      { name: 'animation', type: "'none' | 'fade' | 'slide'", default: "'none'", desc: '路径内容（段）变动时的动画：none=无 / fade=淡入淡出 / slide=横向滑移+淡入' },
      { name: 'container', type: 'string | HTMLElement', default: '—', desc: '标题扫描范围：CSS 选择器或元素；默认最近 Station 内容区（.wd-station__content），无则整页' }
    ],
    emits: [
      { name: 'change', payload: 'segments', desc: '路径变化（完整段数组 PathItem[]，含菜单段与标题段）' },
      { name: 'item-click', payload: 'item', desc: '点击任意段' }
    ],
    slots: [],
    methods: [
      { name: 'refresh()', params: '—', returns: 'void', desc: '手动刷新：重读菜单链并重新扫描标题与当前章节' }
    ]
  },
  {
    path: 'tips',
    name: 'WdTips',
    title: 'Tips 提示',
    desc: '文字/响应式提示：word=悬停图标模式，box=行内文字模式，颜色图标可配',
    group: '页面元素',
    intro: {
      overview: 'WdTips 是一个轻量的文字/响应式提示组件，提供两种展示模式：`word` 模式渲染一个可悬停的图标，鼠标移入后通过 tooltip 显示提示内容；`box` 模式则把提示文字（可带图标）直接内联展示在页面中。图标与颜色均可配置，适合在表单、表头、字段旁补充说明性文字。',
      whenToUse: [
        '表头或字段标签旁需要「名词解释」类说明，又不想占用版面：用 `word` 模式，悬停图标出提示。',
        '表单分组、操作区附近需要一行简短的行内提示文字：用 `box` 模式。',
        '需要通过颜色/图标区分提示级别（普通信息、警告、疑问）时。',
        '不建议：需要用户确认或交互的提示（应使用 WdConfirmButton、WdPopconfirmButton 等）。',
        '不建议：大段富文本说明（WdTips 只渲染纯文字，不解析 HTML）。'
      ],
      notes: [
        '`word` 模式的 tooltip 固定为 dark 主题、`top` 弹出位置（内部直接使用 el-tooltip 的默认封装，未暴露配置项）。',
        '`icon` 只支持 `InfoFilled` / `WarningFilled` / `QuestionFilled` 三个内置图标；传入其他名字会回退为 `InfoFilled`。',
        '默认插槽仅在 `box` 模式下生效，用于覆盖 `tips` 文字；`word` 模式的提示内容只能来自 `tips` 属性。',
        '`color` 同时作用于图标与文字：word 模式染色图标，box 模式染色整行（图标 + 文字）。',
        'box 模式文字使用小号字号（`--wd-font-size-sm`，默认 12px），适合作为辅助说明而非正文。',
        '表头中使用时建议加 `margin-left` 小间距（如示例中的 `style="margin-left: 6px"`），避免图标紧贴文字。',
        '`bg` 仅对 box 模式生效：默认 `none` 不带背景；传 `primary` 使用主题色 10% 浅底、文字取主题色；传任意 CSS 颜色值（如 `#FEFEFE`、`rgba(...)`）时以其为底色，文字颜色仍由 `color` 控制。',
        '带背景时会自动增加内边距与圆角，使其成为一个可点击区域样式的标签块。'
      ],
      faq: [
        { q: '传了 `icon="SuccessFilled"` 为什么显示的还是 InfoFilled？', a: '组件内置图标映射表只包含 InfoFilled / WarningFilled / QuestionFilled 三个，未命中的名称会回退到 InfoFilled。' },
        { q: '默认插槽在 word 模式下为什么没效果？', a: '插槽只在 box 模式渲染。word 模式的提示文字只能通过 `tips` 属性传入。' },
        { q: 'tooltip 的弹出位置能改成 bottom 吗？', a: '当前版本 word 模式的 placement 固定为 top，未暴露配置。如需自定义弹出位置，可直接使用 el-tooltip 或按钮类组件的 `tips` / `placement` 属性。' },
        { q: 'tips 内容支持 HTML 吗？', a: '不支持，组件按纯文字渲染。' }
      ]
    },
    props: [
      { name: 'tips', type: 'string', default: "''", desc: '提示内容' },
      { name: 'type', type: "'word' | 'box'", default: "'word'", desc: '展示模式' },
      { name: 'icon', type: "'InfoFilled' | 'WarningFilled' | 'QuestionFilled'", default: "'InfoFilled'", desc: '图标名' },
      { name: 'color', type: 'string', default: "'#909399'", desc: '图标/文字颜色' },
      { name: 'bg', type: 'string', default: "'none'", desc: "box 模式背景：none=无背景；primary=主题色浅底（文字取主题色）；也可传任意 CSS 颜色值（如 '#FEFEFE'）" }
    ],
    slots: [{ name: 'default', params: '—', desc: 'box 模式文字（覆盖 tips）' }]
  }
]
