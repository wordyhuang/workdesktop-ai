> 本文件由脚本自动生成，请勿手工编辑。全部组件索引、阅读约定与 Element Plus 透传规则见 [README.md](./README.md)。数据源 `docs/src/api-meta/`，重生成：`npm run gen:ai-api`。

# WdPath Path 路径（面包屑）

导航路径（面包屑）：手动填写路径，或自动模式联动 WdStation 读取菜单所在路径、补充页面 H1~H4 标题链；标题段始终跟随当前可视范围内第一个标题

### 概述

WdPath 是导航路径（面包屑）组件，基于 el-breadcrumb 封装，支持手动与自动双模式。手动模式通过 `items` 直接填写路径节点（title / icon / path）；自动模式与 `WdStation` 按 `filter` 联动——自动读取当前激活菜单所在路径（分组 → 菜单 → 子菜单），并在其后补充内容区 H1~H4 的标题链，标题段**始终跟随当前可视范围内第一个标题**（滚动页面/容器时，新进入可视区顶部的标题会成为当前路径）。

### 何时使用

- 中后台页面需要展示当前页面位置的导航路径。
- 与 `WdStation` 搭配：希望路径自动跟随菜单与内容区标题变化，无需手动维护。
- 需要举证当前章节位置的场景（如文档型长页面：滚动时路径自动跟随可视范围内的章节，明确当前位置）。
- 不建议：单页营销/展示类页面，无多级导航语义。

### 注意事项

- 自动模式的菜单段来源：与 `WdStation` 设置相同的 `filter` 分组即自动联动（同 `setStationFooter` 的 filter 心智）。
- 标题段扫描范围：`container` 指定（CSS 选择器或元素引用）；默认取最近祖先 `.wd-station__content`（组件放在 Station 内容区时自动生效），无则扫描整页。
- 标题链按 h1→h2→h3→h4 大纲收敛，始终跟随**当前可视范围内的第一个标题**；页面级滚动（container 缺省为整页）与元素级滚动（如 Station 内容区）均支持。
- 自动模式的标题定位完全由滚动位置决定，无悬停状态：滚动到哪个章节，路径标题段即收敛为该章节的 H1→H2→H3→H4 大纲链。
- 组件放在 Station 内容区时，Station 的 `refresh()` 会连同组件一起重挂载，自动重新扫描标题。
- router 模式下带 `path` 的段自动以 el-breadcrumb-item 的 `to` 跳转；html 模式（无 router）仅抛 `item-click`，由调用方决定导航行为。

### 常见问题

**问：自动模式如何与 WdStation 联动？**

组件与 Station 设置相同的 `filter` 即可：菜单选中/分组切换/路由反查时，Station 会通知同组组件重新读取菜单链；读取 API 为 `getStationMenuChain(filter)`，也可在业务代码中主动调用。

**问：为什么自动模式只显示了「首页」？**

说明当前 filter 组没有可读取菜单链的 Station，或容器内没有 h1~h4 标题。检查：1) 组件与 Station 的 filter 是否一致；2) 内容区是否真的渲染了标题标签；3) `container` 作用域是否覆盖到了内容区。

**问：标题链什么时候更新？**

挂载、路由变化、容器 DOM 变更（MutationObserver）、菜单链变化（Station 通知）、容器滚动时都会重新扫描/定位。也可用 ref 调用 `refresh()` 手动刷新。

**问：标题段是什么时候更新的？**

完全由滚动位置决定——始终指向当前可视范围内的第一个标题；滚动页面/容器时，新进入可视区顶部的标题会成为当前路径（标题段按 H1→H2→H3→H4 大纲链收敛）。

**问：tabs 内容模式下组件放哪？**

tabs 模式内容区由 RouterView 渲染，组件建议放在 Station 的 `#header-left` / `#header-center` 插槽，并用 `container` 指向各页面内容容器（或整页扫描）。

### Element Plus 透传

- 透传目标：`—（不透传）`
- 说明：内部 el-breadcrumb / el-breadcrumb-item 均为显式绑定（separator、to、click），外部属性/事件不会透传；节点配置与事件以本文档为准。

### Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| filter | `string` | '' | 联动分组标识（自动模式与同组 WdStation 联动） |
| mode | `'manual' \| 'auto'` | 'manual' | 模式：manual=手动填写路径 / auto=自动联动（Station 菜单链 + 页面标题） |
| items | `array \| string` | — | 手动模式路径节点（PathItem[]；支持 JSON 字符串） |
| home | `string` | '首页' | 自动模式：首页节点标题 |
| showHome | `boolean` | true | 自动模式：是否显示首页节点 |
| separator | `string` | '/' | 分隔符 |
| animation | `'none' \| 'fade' \| 'slide'` | 'none' | 路径内容（段）变动时的动画：none=无 / fade=淡入淡出 / slide=横向滑移+淡入 |
| container | `string \| HTMLElement` | — | 标题扫描范围：CSS 选择器或元素；默认最近 Station 内容区（.wd-station__content），无则整页 |

### Events

| 事件名 | 回调参数 | 说明 |
| --- | --- | --- |
| change | segments | 路径变化（完整段数组 PathItem[]，含菜单段与标题段） |
| item-click | item | 点击任意段 |

### 暴露方法（通过 ref 调用）

| 方法 | 参数 | 返回值 | 说明 |
| --- | --- | --- | --- |
| refresh() | — | void | 手动刷新：重读菜单链并重新扫描标题与当前章节 |

### 数据类型

#### PathItem（路径节点）

引用：`items` prop（`PathItem[]`）与 `change` / `item-click` 事件回调

| 字段 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| title | string | 是 | — | 标题 |
| path | string | 否 | — | 路由路径（router 模式下自动以 el-breadcrumb-item 的 to 跳转） |
| icon | string \| Component | 否 | — | 图标（ElementPlus 图标名或组件） |
| source | 'menu' \| 'heading' \| 'home' \| 'manual' | 否 | — | 段来源（自动模式内部标记，手动模式可省略） |
| level | number | 否 | — | heading 段：标题级别 1-4 |
