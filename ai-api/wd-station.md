> 本文件由脚本自动生成，请勿手工编辑。全部组件索引、阅读约定与 Element Plus 透传规则见 [README.md](./README.md)。数据源 `docs/src/api-meta/`，重生成：`npm run gen:ai-api`。

# WdStation Station 中后台外框架

一站式中后台外框架：分导台按域分组菜单（适配 100+ 菜单）、左侧/顶部导航、page/tabs 内容、工具栏、底部信息栏，router 与 html 双模式

### 概述

WdStation 是一站式中后台外框架组件：顶部「分导台」按业务域分组组织菜单（适配 100+ 菜单规模），配合左侧/顶部导航、page（单页）或 tabs（多标签页）内容区、顶栏工具点位（刷新/设置/用户/登录）与底部信息栏，一个组件即可搭起完整的管理系统外壳。路由上支持 `router`（对接 vue-router，点菜单 push + RouterView 渲染）与 `html`（仅抛事件 + 默认插槽自渲染）双模式，`auto` 模式下检测到 vue-router 自动启用 router 模式。

### 何时使用

- 搭建中后台/一站式管理系统的整体外壳（logo、菜单、顶栏工具、内容区、底栏一次到位）。
- 菜单数量多、需要按业务域分组，通过分导台在分组间切换的场景。
- 需要多标签页（tabs）工作区，支持固定标签（affix）、批量关闭的场景。
- 菜单少且不需要分组时可把 `headerMode` 设为 `title`，侧边平铺全部分组菜单。
- 不建议：单页营销/展示类页面，无需菜单框架。
- 不建议：已有自己的整体布局，只需要局部容器（用 WdPanel、WdDrawer 等即可）。

### 注意事项

- `menuGroups` 与 `menus` 二选一，`menuGroups` 优先；两者均可传 JSON 字符串（UMD 属性式写法），JSON 解析失败会在控制台报错并回退默认值。
- 菜单层级建议不超过两层；超过两层时控制台会给出警告（仍按原样渲染）。
- 分导台（顶部中央分组切换条）在 `headerMode=nav` 或 `both` 且分组数大于 1 时显示；只有一个分组时顶部自动退化为系统标题。`both` 模式下顶部分导台负责切换激活分组，左侧联动显示该分组的一级菜单：一级菜单作为分组 title 展示，其二级菜单平铺全量显示，仅当二级菜单下再含三级时该二级才折叠为子菜单；一级为叶子菜单时直接显示为可点击菜单项。点击分导台中的分组，左侧即切换为该分组的一级菜单。
- 菜单 key 规则为 ``分组key:name||path||title``（内部统一分配 `_key`），受控 `activeMenu` / `openTabs` 的 key 需按此规则书写；`menu-select` 事件的 `item` 上带有 `_key` 可直接使用。
- tabs 模式：`affix: true` 的菜单为固定标签，挂载时自动开启、不可关闭；关闭当前激活标签后自动跳转相邻标签（先右后左）；标签栏右侧下拉支持关闭当前/左侧/其他/全部的批量操作。传入 `openTabs` 即为受控模式，需自行维护标签列表。
- `group-change`（切分组）不触发路由跳转，路由跳转只发生在菜单选中（`menu-select`）时。
- `userName` 非空时顶栏显示用户下拉（含退出登录），为空时显示登录按钮；`userAvatar` 为空时头像显示用户名首字。
- `toolbarConfig` 中 `refresh` / `fullscreen` / `user` / `login` 默认在右侧（right），`settings` 默认 `none`（不渲染）；各点位均可设为 left / right / none。`user` 与 `login` 按 `userName` 是否为空二选一出现。刷新与全屏图标带原生 `title` 悬浮提示（全屏态下自动切换为「退出全屏」）。
- Station 自身高度为 100%，父容器必须提供确定高度（示例中用 `height: 440px` 的舞台 div），否则布局会塌陷。
- `refresh()` / `refreshStationView` 通过自增 key 强制重挂载内容区，适用于「保存后整页重取数据」类场景；局部刷新请走 DataGrid 等组件自身的刷新机制。

### 常见问题

**问：html 模式和 router 模式怎么选？**

项目已用 vue-router 管理页面时用 `auto`/`router`，菜单 `path` 直接对接路由；静态站点、多页嵌入或想完全自管内容时用 `html`，通过 `menu-select` 事件自行切换默认插槽内容。

**问：只有一个分组，为什么顶部不显示分导台？**

分导台的显示条件是 `headerMode=nav`（或 `both`）且分组数大于 1，单分组时顶部显示系统标题，属预期行为。

**问：`both` 模式侧边菜单会随顶部分导台切换分组而变化吗？**

会。`both` 模式下顶部分导台负责切换激活分组，左侧跟随激活分组联动显示该分组的一级菜单：一级菜单作 title 分组，二级菜单平铺全量展示，仅当二级含三级时才折叠为子菜单，一级为叶子菜单时直接显示为菜单项。点击分导台中的哪个分组，左侧就显示该分组的一级菜单；菜单相对少、想一眼看全所有一级菜单时用 `title` 模式即可。

**问：`menus` 扁平菜单里没有写 group 的项去哪了？**

自动归入 key 为 `default`、标题为「默认」的分组。

**问：affix 固定标签为什么关不掉？**

`affix` 是设计行为：固定标签挂载即自动开启、不渲染关闭图标，`closeTab` 与批量关闭也会跳过它。需要可关闭就不要设 `affix`。

**问：受控 `activeMenu` 该传什么值？**

传菜单项的统一标识 `_key`，规则为 ``分组key:name||path||title``（如 `system:/sys/user`）；也可直接消费 `menu-select` 事件回调里 `item._key`。

### Element Plus 透传

- 透传目标：`—（不透传）`
- 说明：厚封装布局组件，内部菜单、标签页等均为自研结构，el-container / el-menu 等 Element Plus 属性事件不可用。

### Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| title | `string` | '' | 系统标题（logo 旁 / 标题模式顶栏中央） |
| logo | `string \| Component` | '' | logo 图标（ElementPlus 图标名字符串或图标组件） |
| menuGroups | `array \| string` | — | 分组菜单（优先）：[{ key, title, icon?, menus: 菜单项[] }]；传字符串按 JSON 解析 |
| menus | `array \| string` | — | 扁平菜单：按 groupKey / group 自动聚合分组，无组项归「默认」组；与 menuGroups 二选一 |
| headerMode | `'nav' \| 'title' \| 'both'` | 'nav' | 顶栏中央：nav=分导台（多分组时显示，左侧随分组切换），title=系统标题（左侧展示全量分组菜单），both=并存（顶部显示分导台 + 左侧联动跟随激活分组，显示该分组一级菜单作 title 分组、二级平铺全量、二级含三级才折叠） |
| menuMode | `'side' \| 'top' \| 'none'` | 'side' | 菜单位置：side=左侧栏，top=顶部横排，none=不启用菜单 |
| contentMode | `'page' \| 'tabs'` | 'page' | 内容方式：page=单页，tabs=多标签页（affix 菜单为固定标签） |
| routerMode | `'auto' \| 'router' \| 'html'` | 'auto' | 路由模式：auto=检测到 vue-router 即用；router=点菜单 push + RouterView；html=仅抛事件 + 默认插槽 |
| collapsible | `boolean` | true | 显示折叠按钮（分导台左侧；side 为左右折叠图标，top 为向上折叠图标） |
| collapsed | `boolean` | false | 菜单折叠状态（v-model:collapsed）；side 收缩时 logo 跟随收缩 |
| activeGroup | `string` | '' | 激活分组 key（v-model:active-group） |
| activeMenu | `string` | '' | 激活菜单 key（v-model:active-menu）；菜单 key 规则 `分组key:name\|\|path\|\|title` |
| openTabs | `array` | — | 标签页列表 [{ key, title, icon?, path?, affix? }]（v-model:open-tabs，传入即受控） |
| tabIcon | `boolean` | true | tabs 标签标题是否显示菜单图标（true 时菜单项 icon 随 tab 显示在标题前） |
| activatePreviousTab | `boolean` | true | 关闭当前激活标签后是否跳回上一次激活的标签（true=按 MRU 激活历史回跳；false=跳相邻标签，先右后左） |
| userName | `string` | '' | 用户名（非空显示用户下拉含退出登录；为空显示登录按钮） |
| userAvatar | `string` | '' | 用户头像 URL（空显示用户名首字） |
| copyright | `string` | '' | 底部版权信息 |
| footerInfo | `string` | '' | 底部动态信息（v-model:footer-info；也可由 setStationFooter 联动更新） |
| keepAlive | `boolean` | false | router 模式下 RouterView 包 keep-alive |
| toolbarConfig | `object \| string` | — | 工具点位 { refresh?, fullscreen?, settings?, user?, login? }，各取 left / right / none；refresh/fullscreen/user/login 默认 right，settings 默认 none（默认不渲染）；传字符串按 JSON 解析 |
| filter | `string` | '' | 联动分组标识（setStationFooter / refreshStationView 定向目标） |

### Events

| 事件名 | 回调参数 | 说明 |
| --- | --- | --- |
| update:collapsed | value | 折叠状态变化 |
| update:active-group | key | 激活分组变化 |
| update:active-menu | key | 激活菜单变化 |
| update:open-tabs | tabs | 标签页列表变化 |
| update:footer-info | info | 底部动态信息变化 |
| group-change | { key, title } | 分导台切换分组（不触发路由跳转） |
| menu-select | item | 菜单选中（html 模式以此驱动内容；item 含 _key 统一标识） |
| tab-click | tab | 标签页点击 |
| tab-close | tab | 标签页关闭（affix 固定标签不可关闭） |
| refresh | — | 内容刷新（工具栏刷新 / refreshStationView 联动，内容区强制重挂载） |
| login | — | 点击登录按钮 |
| logout | — | 点击退出登录 |
| settings | — | 点击系统设置 |

### Slots

| 插槽 | 容器 id | 插槽参数 | 说明 |
| --- | --- | --- | --- |
| default | wd-station__content | — | 内容区（html 模式渲染；router 模式渲染 RouterView） |
| logo | wd-station__logo | { collapsed } | 品牌区（side 模式在侧栏顶部 id=wd-station__logo，top/none 模式在顶栏左侧 id=wd-station__logo-header，两处共用同一插槽）；传入后替换默认图标+标题 |
| menu-top | wd-station__menu-top | { collapsed } | 侧栏菜单滚动区上方扩展位（仅 side 模式） |
| menu-bottom | wd-station__menu-bottom | { collapsed } | 侧栏菜单滚动区下方扩展位（仅 side 模式） |
| header-left | wd-station__header-left | — | 顶栏左侧扩展位（工具栏左侧点位之后） |
| header-center | wd-station__header-center | — | 顶栏中部扩展位（标题/分导台之后） |
| header-right | wd-station__header-right | — | 顶栏右侧扩展位（位于工具栏右侧点位之前）；建议放置 el-icon 类轻量图标（如通知铃铛、画刷入口），不建议放置 el-button 类按钮组件 |
| top-menu-left | wd-station__top-menu-left | — | 顶部菜单行左侧扩展位（仅 top 模式） |
| top-menu-right | wd-station__top-menu-right | — | 顶部菜单行右侧扩展位（仅 top 模式） |
| tabs-left | wd-station__tabs-left | — | tabs 条左侧扩展位（el-tabs 之前，仅 tabs 内容模式） |
| tabs-right | wd-station__tabs-right | — | tabs 条右侧扩展位（批量关闭按钮之后，仅 tabs 内容模式） |
| footer | wd-station__footer | — | 底栏整区；传入后替换默认 footer-info / copyright |

### 暴露方法（通过 ref 调用）

| 方法 | 参数 | 返回值 | 说明 |
| --- | --- | --- | --- |
| refresh() | — | void | 刷新内容区（强制重挂载） |
| openTab(tab) | tab: { key, title, path?, affix? } | void | 打开标签页（tabs 模式，同 key 去重并激活） |
| closeTab(key) | key: string | void | 关闭标签页（affix 拦截；关激活标签跳相邻） |

### 数据类型

#### StationMenuGroup（菜单分组）

引用：`menuGroups` prop（`StationMenuGroup[]`，分组喂法，优先于 `menus`）

| 字段 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| key | string | 是 | — | 分组唯一标识 |
| title | string | 是 | — | 分组名称（分导台 / 侧栏组标题） |
| icon | string \| Component | 否 | — | 分组图标（ElementPlus 图标名或组件） |
| menus | StationMenuItem[] | 是 | — | 组内菜单项 |

#### StationMenuItem（菜单项）

引用：`menus` prop（`StationMenuItem[]`，扁平喂法）与 `StationMenuGroup.menus`

| 字段 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| title | string | 是 | — | 菜单名称 |
| icon | string \| Component | 否 | — | 菜单图标 |
| path | string | 否 | — | 路由路径（router 模式点击 push；与 name 二选一） |
| name | string | 否 | — | 菜单唯一名（无 path 时作为 key 的一部分） |
| badge | string \| number | 否 | — | 角标内容 |
| disabled | boolean | 否 | false | 禁用 |
| affix | boolean | 否 | false | tabs 模式下固定标签（不可关闭，初始即打开） |
| group | string | 否 | — | 扁平喂法：所属分组标题（与 groupKey 配合） |
| groupKey | string | 否 | — | 扁平喂法：所属分组 key（与 group 配合自动聚合） |
| groupIcon | string \| Component | 否 | — | 扁平喂法：所属分组图标 |
| children | StationMenuItem[] | 否 | — | 子菜单（建议最多两层） |
| [key: string] | any | 否 | — | 扩展字段，menu-select 事件原样抛回 |

#### StationTab（标签页）

引用：`openTabs` prop（`StationTab[]`）、`openTab(tab)` 方法参数、`tab-click` / `tab-close` 事件回调

| 字段 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| key | string | 是 | — | 标签唯一标识（openTab 按 key 去重并激活） |
| title | string | 是 | — | 标签标题 |
| icon | string \| Component | 否 | — | 标签图标（菜单项打开时自动携带；tab-icon=false 可关闭渲染） |
| path | string | 否 | — | 关联路由路径 |
| affix | boolean | 否 | false | 固定标签（不可关闭） |

#### StationToolbarConfig（工具点位配置）

引用：`toolbarConfig` prop

| 字段 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| refresh | 'left' \| 'right' \| 'none' | 否 | 'right' | 「刷新内容」图标（带 title 悬浮提示）位置，none 为不显示 |
| fullscreen | 'left' \| 'right' \| 'none' | 否 | 'right' | 「全屏显示」图标（带 title 悬浮提示，Fullscreen API 切换整页全屏）位置 |
| settings | 'left' \| 'right' \| 'none' | 否 | 'none' | 「系统设置」工具位置；默认不渲染，需显式开启 |
| user | 'left' \| 'right' \| 'none' | 否 | 'right' | 用户区（用户名 / 头像 / 退出）位置 |
| login | 'left' \| 'right' \| 'none' | 否 | 'right' | 「登录」按钮位置（userName 为空时显示） |
