import type { ComponentMeta } from './types'

/** 布局组件组（1 个）：WdStation 中后台外框架 */
export const layoutData: ComponentMeta[] = [
  {
    path: 'station',
    name: 'WdStation',
    title: 'Station 中后台外框架',
    desc: '一站式中后台外框架：分导台按域分组菜单（适配 100+ 菜单）、左侧/顶部导航、page/tabs 内容、工具栏、底部信息栏，router 与 html 双模式',
    group: '布局组件',
    intro: {
      overview: 'WdStation 是一站式中后台外框架组件：顶部「分导台」按业务域分组组织菜单（适配 100+ 菜单规模），配合左侧/顶部导航、page（单页）或 tabs（多标签页）内容区、顶栏工具点位（刷新/设置/用户/登录）与底部信息栏，一个组件即可搭起完整的管理系统外壳。路由上支持 `router`（对接 vue-router，点菜单 push + RouterView 渲染）与 `html`（仅抛事件 + 默认插槽自渲染）双模式，`auto` 模式下检测到 vue-router 自动启用 router 模式。',
      whenToUse: [
        '搭建中后台/一站式管理系统的整体外壳（logo、菜单、顶栏工具、内容区、底栏一次到位）。',
        '菜单数量多、需要按业务域分组，通过分导台在分组间切换的场景。',
        '需要多标签页（tabs）工作区，支持固定标签（affix）、批量关闭的场景。',
        '菜单少且不需要分组时可把 `headerMode` 设为 `title`，侧边平铺全部分组菜单。',
        '不建议：单页营销/展示类页面，无需菜单框架。',
        '不建议：已有自己的整体布局，只需要局部容器（用 WdPanel、WdDrawer 等即可）。'
      ],
      notes: [
        '`menuGroups` 与 `menus` 二选一，`menuGroups` 优先；两者均可传 JSON 字符串（UMD 属性式写法），JSON 解析失败会在控制台报错并回退默认值。',
        '菜单层级建议不超过两层；超过两层时控制台会给出警告（仍按原样渲染）。',
        '分导台（顶部中央分组切换条）仅在 `headerMode=nav` 且分组数大于 1 时显示；只有一个分组时顶部自动退化为系统标题。',
        '菜单 key 规则为 ``分组key:name||path||title``（内部统一分配 `_key`），受控 `activeMenu` / `openTabs` 的 key 需按此规则书写；`menu-select` 事件的 `item` 上带有 `_key` 可直接使用。',
        'tabs 模式：`affix: true` 的菜单为固定标签，挂载时自动开启、不可关闭；关闭当前激活标签后自动跳转相邻标签（先右后左）；标签栏右侧下拉支持关闭当前/左侧/其他/全部的批量操作。传入 `openTabs` 即为受控模式，需自行维护标签列表。',
        '`group-change`（切分组）不触发路由跳转，路由跳转只发生在菜单选中（`menu-select`）时。',
        '`userName` 非空时顶栏显示用户下拉（含退出登录），为空时显示登录按钮；`userAvatar` 为空时头像显示用户名首字。',
        '`toolbarConfig` 中 `refresh` / `settings` / `user` / `login` 各点位默认全部在右侧（right），可设为 left / none；`user` 与 `login` 按 `userName` 是否为空二选一出现。',
        'Station 自身高度为 100%，父容器必须提供确定高度（示例中用 `height: 440px` 的舞台 div），否则布局会塌陷。',
        '`refresh()` / `refreshStationView` 通过自增 key 强制重挂载内容区，适用于「保存后整页重取数据」类场景；局部刷新请走 DataGrid 等组件自身的刷新机制。'
      ],
      faq: [
        { q: 'html 模式和 router 模式怎么选？', a: '项目已用 vue-router 管理页面时用 `auto`/`router`，菜单 `path` 直接对接路由；静态站点、多页嵌入或想完全自管内容时用 `html`，通过 `menu-select` 事件自行切换默认插槽内容。' },
        { q: '只有一个分组，为什么顶部不显示分导台？', a: '分导台的显示条件是 `headerMode=nav` 且分组数大于 1，单分组时顶部显示系统标题，属预期行为。' },
        { q: '`menus` 扁平菜单里没有写 group 的项去哪了？', a: '自动归入 key 为 `default`、标题为「默认」的分组。' },
        { q: 'affix 固定标签为什么关不掉？', a: '`affix` 是设计行为：固定标签挂载即自动开启、不渲染关闭图标，`closeTab` 与批量关闭也会跳过它。需要可关闭就不要设 `affix`。' },
        { q: '受控 `activeMenu` 该传什么值？', a: '传菜单项的统一标识 `_key`，规则为 ``分组key:name||path||title``（如 `system:/sys/user`）；也可直接消费 `menu-select` 事件回调里 `item._key`。' }
      ]
    },
    dataTypes: [
      {
        name: 'StationMenuGroup（菜单分组）',
        ref: '`menuGroups` prop（`StationMenuGroup[]`，分组喂法，优先于 `menus`）',
        fields: [
          { name: 'key', type: 'string', required: '是', default: '—', desc: '分组唯一标识' },
          { name: 'title', type: 'string', required: '是', default: '—', desc: '分组名称（分导台 / 侧栏组标题）' },
          { name: 'icon', type: 'string | Component', required: '否', default: '—', desc: '分组图标（ElementPlus 图标名或组件）' },
          { name: 'menus', type: 'StationMenuItem[]', required: '是', default: '—', desc: '组内菜单项' },
        ],
      },
      {
        name: 'StationMenuItem（菜单项）',
        ref: '`menus` prop（`StationMenuItem[]`，扁平喂法）与 `StationMenuGroup.menus`',
        fields: [
          { name: 'title', type: 'string', required: '是', default: '—', desc: '菜单名称' },
          { name: 'icon', type: 'string | Component', required: '否', default: '—', desc: '菜单图标' },
          { name: 'path', type: 'string', required: '否', default: '—', desc: '路由路径（router 模式点击 push；与 name 二选一）' },
          { name: 'name', type: 'string', required: '否', default: '—', desc: '菜单唯一名（无 path 时作为 key 的一部分）' },
          { name: 'badge', type: 'string | number', required: '否', default: '—', desc: '角标内容' },
          { name: 'disabled', type: 'boolean', required: '否', default: 'false', desc: '禁用' },
          { name: 'affix', type: 'boolean', required: '否', default: 'false', desc: 'tabs 模式下固定标签（不可关闭，初始即打开）' },
          { name: 'group', type: 'string', required: '否', default: '—', desc: '扁平喂法：所属分组标题（与 groupKey 配合）' },
          { name: 'groupKey', type: 'string', required: '否', default: '—', desc: '扁平喂法：所属分组 key（与 group 配合自动聚合）' },
          { name: 'groupIcon', type: 'string | Component', required: '否', default: '—', desc: '扁平喂法：所属分组图标' },
          { name: 'children', type: 'StationMenuItem[]', required: '否', default: '—', desc: '子菜单（建议最多两层）' },
          { name: '[key: string]', type: 'any', required: '否', default: '—', desc: '扩展字段，menu-select 事件原样抛回' },
        ],
      },
      {
        name: 'StationTab（标签页）',
        ref: '`openTabs` prop（`StationTab[]`）、`openTab(tab)` 方法参数、`tab-click` / `tab-close` 事件回调',
        fields: [
          { name: 'key', type: 'string', required: '是', default: '—', desc: '标签唯一标识（openTab 按 key 去重并激活）' },
          { name: 'title', type: 'string', required: '是', default: '—', desc: '标签标题' },
          { name: 'path', type: 'string', required: '否', default: '—', desc: '关联路由路径' },
          { name: 'affix', type: 'boolean', required: '否', default: 'false', desc: '固定标签（不可关闭）' },
        ],
      },
      {
        name: 'StationToolbarConfig（工具点位配置）',
        ref: '`toolbarConfig` prop',
        fields: [
          { name: 'refresh', type: "'left' | 'right' | 'none'", required: '否', default: "'right'", desc: '「刷新」工具位置，none 为不显示' },
          { name: 'settings', type: "'left' | 'right' | 'none'", required: '否', default: "'right'", desc: '「系统设置」工具位置' },
          { name: 'user', type: "'left' | 'right' | 'none'", required: '否', default: "'right'", desc: '用户区（用户名 / 头像 / 退出）位置' },
          { name: 'login', type: "'left' | 'right' | 'none'", required: '否', default: "'right'", desc: '「登录」按钮位置（userName 为空时显示）' },
        ],
      },
    ],
    props: [
      { name: 'title', type: 'string', default: "''", desc: '系统标题（logo 旁 / 标题模式顶栏中央）' },
      { name: 'logo', type: 'string | Component', default: "''", desc: 'logo 图标（ElementPlus 图标名字符串或图标组件）' },
      { name: 'menuGroups', type: 'array | string', default: '—', desc: '分组菜单（优先）：[{ key, title, icon?, menus: 菜单项[] }]；传字符串按 JSON 解析' },
      { name: 'menus', type: 'array | string', default: '—', desc: '扁平菜单：按 groupKey / group 自动聚合分组，无组项归「默认」组；与 menuGroups 二选一' },
      { name: 'headerMode', type: "'nav' | 'title'", default: "'nav'", desc: '顶栏中央：nav=分导台（多分组时显示），title=系统标题（左侧展示全量分组菜单）' },
      { name: 'menuMode', type: "'side' | 'top' | 'none'", default: "'side'", desc: '菜单位置：side=左侧栏，top=顶部横排，none=不启用菜单' },
      { name: 'contentMode', type: "'page' | 'tabs'", default: "'page'", desc: '内容方式：page=单页，tabs=多标签页（affix 菜单为固定标签）' },
      { name: 'routerMode', type: "'auto' | 'router' | 'html'", default: "'auto'", desc: '路由模式：auto=检测到 vue-router 即用；router=点菜单 push + RouterView；html=仅抛事件 + 默认插槽' },
      { name: 'collapsible', type: 'boolean', default: 'true', desc: '显示折叠按钮（分导台左侧；side 为左右折叠图标，top 为向上折叠图标）' },
      { name: 'collapsed', type: 'boolean', default: 'false', desc: '菜单折叠状态（v-model:collapsed）；side 收缩时 logo 跟随收缩' },
      { name: 'activeGroup', type: 'string', default: "''", desc: '激活分组 key（v-model:active-group）' },
      { name: 'activeMenu', type: 'string', default: "''", desc: '激活菜单 key（v-model:active-menu）；菜单 key 规则 `分组key:name||path||title`' },
      { name: 'openTabs', type: 'array', default: '—', desc: '标签页列表 [{ key, title, path?, affix? }]（v-model:open-tabs，传入即受控）' },
      { name: 'userName', type: 'string', default: "''", desc: '用户名（非空显示用户下拉含退出登录；为空显示登录按钮）' },
      { name: 'userAvatar', type: 'string', default: "''", desc: '用户头像 URL（空显示用户名首字）' },
      { name: 'copyright', type: 'string', default: "''", desc: '底部版权信息' },
      { name: 'footerInfo', type: 'string', default: "''", desc: '底部动态信息（v-model:footer-info；也可由 setStationFooter 联动更新）' },
      { name: 'keepAlive', type: 'boolean', default: 'false', desc: 'router 模式下 RouterView 包 keep-alive' },
      { name: 'toolbarConfig', type: 'object | string', default: '—', desc: '工具点位 { refresh?, settings?, user?, login? }，各取 left / right / none（默认全 right）；传字符串按 JSON 解析' },
      { name: 'filter', type: 'string', default: "''", desc: '联动分组标识（setStationFooter / refreshStationView 定向目标）' }
    ],
    emits: [
      { name: 'update:collapsed', payload: 'value', desc: '折叠状态变化' },
      { name: 'update:active-group', payload: 'key', desc: '激活分组变化' },
      { name: 'update:active-menu', payload: 'key', desc: '激活菜单变化' },
      { name: 'update:open-tabs', payload: 'tabs', desc: '标签页列表变化' },
      { name: 'update:footer-info', payload: 'info', desc: '底部动态信息变化' },
      { name: 'group-change', payload: '{ key, title }', desc: '分导台切换分组（不触发路由跳转）' },
      { name: 'menu-select', payload: 'item', desc: '菜单选中（html 模式以此驱动内容；item 含 _key 统一标识）' },
      { name: 'tab-click', payload: 'tab', desc: '标签页点击' },
      { name: 'tab-close', payload: 'tab', desc: '标签页关闭（affix 固定标签不可关闭）' },
      { name: 'refresh', payload: '—', desc: '内容刷新（工具栏刷新 / refreshStationView 联动，内容区强制重挂载）' },
      { name: 'login', payload: '—', desc: '点击登录按钮' },
      { name: 'logout', payload: '—', desc: '点击退出登录' },
      { name: 'settings', payload: '—', desc: '点击系统设置' }
    ],
    slots: [
      { name: 'default', params: '—', desc: '内容区（html 模式渲染；router 模式渲染 RouterView）' },
      { name: 'logo', params: '{ collapsed }', desc: '品牌区（side 模式在侧栏顶部，top/none 模式在顶栏左侧）；传入后替换默认图标+标题' },
      { name: 'menu-top', params: '{ collapsed }', desc: '侧栏菜单滚动区上方扩展位（仅 side 模式）' },
      { name: 'menu-bottom', params: '{ collapsed }', desc: '侧栏菜单滚动区下方扩展位（仅 side 模式）' },
      { name: 'header-left', params: '—', desc: '顶栏左侧扩展位（工具栏左侧点位之后）' },
      { name: 'header-center', params: '—', desc: '顶栏中部扩展位（标题/分导台之后）' },
      { name: 'header-right', params: '—', desc: '顶栏右侧扩展位（位于工具栏右侧点位之前）' },
      { name: 'top-menu-left', params: '—', desc: '顶部菜单行左侧扩展位（仅 top 模式）' },
      { name: 'top-menu-right', params: '—', desc: '顶部菜单行右侧扩展位（仅 top 模式）' },
      { name: 'tabs-left', params: '—', desc: 'tabs 条左侧扩展位（el-tabs 之前，仅 tabs 内容模式）' },
      { name: 'tabs-right', params: '—', desc: 'tabs 条右侧扩展位（批量关闭按钮之后，仅 tabs 内容模式）' },
      { name: 'footer', params: '—', desc: '底栏整区；传入后替换默认 footer-info / copyright' }
    ],
    methods: [
      { name: 'refresh()', params: '—', returns: 'void', desc: '刷新内容区（强制重挂载）' },
      { name: 'openTab(tab)', params: 'tab: { key, title, path?, affix? }', returns: 'void', desc: '打开标签页（tabs 模式，同 key 去重并激活）' },
      { name: 'closeTab(key)', params: 'key: string', returns: 'void', desc: '关闭标签页（affix 拦截；关激活标签跳相邻）' }
    ]
  }
]
