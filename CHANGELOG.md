# Changelog

本项目遵循 [Semantic Versioning](https://semver.org/lang/zh-CN/)。

## [Unreleased]

新增 `WdPath` 导航路径（面包屑）组件（组件总数 28 → 29）与 Station 菜单链联动能力；并将 `WdPath` 与 `WdTips` 一并归入「页面元素」分组（原「辅助组件」分组移除）。

### Added

- **`WdPath` 导航路径组件**：基于 el-breadcrumb 封装，支持手动与自动双模式。手动模式通过 `items` 填写路径节点（`title` / `icon` / `path`，支持 JSON 字符串）；自动模式与 `WdStation` 按 `filter` 分组联动——自动读取当前激活菜单所在路径（分组 → 菜单 → 子菜单），并扫描内容区 `h1~h4` 标题按大纲收敛为当前章节链，标题段**始终跟随当前可视范围内第一个标题**（滚动跟随）。`container` 限定标题扫描范围（默认最近 `.wd-station__content`，无则整页），`show-home` / `home` / `separator` 可配。新增 `docs/src/examples/path.vue` 3 个示例与 `document/components/path_v1.0.md` 文档。
- **Station 菜单链联动 API**：`station-linkage.ts` 扩展——`WdStation` 新增 `getActiveMenuChain`（激活菜单路径链：分组 → 菜单 → 子菜单），并新增导出 `getStationMenuChain(target, selfFilter?)`（读取目标组 Station 菜单链）、`subscribeStationChange(filter, cb)` / `notifyStationChange(filter)`（菜单/分组切换时通知同组订阅者，供路径自动刷新）。`src/index.ts` 同步导出并补充类型 `MenuChainItem`。
- **按需入口**：新增 `workdesktop-ai/path` 子路径入口与 `path/style.css`，`package.json` exports 与 vite 多入口/CSS 归档同步。
- **分组调整**：原 `WdBreadcrumb` 改名为 `WdPath`，与原 `WdTips` 一并归入「页面元素」分组（docs 侧边栏 / Playground 同步）；`BreadcrumbItem` 类型更名为 `PathItem`。
- **`WdStation` 新增 `header-mode="both"`**：顶栏中央形态由 `nav` / `title` 扩为 `nav` / `title` / `both`。`both` = 顶部显示分导台 + 左侧**跟随激活分组联动**：点击分导台切换激活分组，左侧联动显示该分组的一级菜单作 title 分组，二级菜单平铺全量展示（仅当二级含三级时才折叠为子菜单），一级为叶子菜单时直接显示为可点击菜单项，适合分组多且需在顶部切分组、侧边同步联动展示该组一级菜单的系统；单分组时分导台自动隐藏退化为普通侧栏。`showNav` 条件由 `headerMode==='nav'` 改为 `headerMode!=='title'`。新增集成用例（both 顶部分导台 + 左侧跟随激活分组 / 二级平铺 / 二级含三级折叠 / 点击分导台联动切换分组 / 单分组退化），全量 vitest 279 用例全绿；Playwright 实测联动语义 19 项断言全过；文档站新增「分导台 + 系统标题并存」demo（第 8 个），api-meta / FAQ / 设计文档 / 组件文档同步。
- **`WdPath` 新增 `animation` 属性**：设置路径段（内容）变动时的过渡动画——`none`（默认，零视觉变化）/ `fade`（淡入淡出）/ `slide`（横向滑移+淡入，留存段 FLIP 位移），基于 Vue `TransitionGroup` 实现，时长 0.2s，适用于自动模式滚动跟随章节、菜单链切换与手动 `items` 更新。同步修复自动模式下的自激刷新隐患：Path 位于自身标题观察容器内时，MutationObserver 会把动画产生的段节点增删误判为内容变化触发重扫——现过滤全部落在 `.wd-path` 子树内的变动，并对标题扫描结果做结构签名比对（层级+标题未变则不重建列表），彻底切断「动画改 DOM → 重扫 → 重渲染」循环。新增 6 个用例（动画渲染/切换 3 个 + 自激防护 3 个），全量 vitest 278 用例全绿；文档站自动模式示例增加 none/fade/slide 实时切换演示，api-meta 与 `document/components/path_v1.1.md` 同步。
- **`WdStation` 新增 `show-header-title` 属性**（Boolean，默认 `true`）：控制 `headerMode` 非 `nav` 时顶栏中央的系统标题 fallback 是否渲染；需要完全自绘 `#header-center`（如文档站改用 `WdPath` 承载吸顶路径）时传 `false` 关闭，组件默认行为与既有 DOM 结构不变。新增 1 个集成用例；文档站框架已启用（去除顶栏中央重复的「WorkDesktop」标题）。
- **`WdStation` tabs 标签支持显示菜单图标**：菜单项打开 tab 时自动携带其 `icon`，标签标题前渲染该图标（与菜单一致的图标）；新增 `tabIcon` prop（Boolean，默认 `true`）可关闭此渲染，无 icon 的菜单项标签不显示图标。`StationTab` 类型新增 `icon` 字段（受控 `openTabs` 也可直接携带）。新增 2 个集成用例（带 icon 渲染与 open-tabs 回传 / tab-icon=false 关闭渲染），全量 vitest 306 用例全绿；Playwright 实测 7 项断言全过，截图 `temp/station_tab_icon.png`；api-meta 与组件文档同步。
- **`WdStation` 关闭当前标签默认跳回上一次激活的标签（MRU）**：tabs 模式下关闭当前激活标签时，由原「固定跳相邻（先右后左）」改为按内部 MRU 激活历史栈跳回**上一次激活且仍打开**的标签（开标签 `openTab`、含 affix 自动开启，与点击已开标签切换都会记录激活顺序；历史无可用项时回退相邻策略）。新增 `activatePreviousTab` prop（Boolean，默认 `true`），设为 `false` 恢复原相邻跳转；右侧下拉的批量关闭（当前/左侧/其他/全部）不受影响。新增 2 个集成用例（默认 MRU 回跳 / prop=false 回退相邻），全量 vitest 308 用例全绿；Playwright MRU 实测 10 项断言全过；api-meta 与组件文档 V_1.7 同步。
- **`WdStation` 工具栏点位默认渲染调整**：「设置」图标默认关闭（`toolbarConfig.settings` 默认值由 `right` 改为 `none`，需显式配置才渲染）；新增「全屏」图标（`toolbarConfig.fullscreen`，默认 `right`），点击调用浏览器 Fullscreen API 切换整页全屏，通过监听 `fullscreenchange` 自动同步状态；刷新与全屏图标均加原生 `title` 悬浮提示（刷新「刷新内容」；全屏未全屏「全屏显示」、已全屏「退出全屏」）。`StationToolbarConfig` 类型新增 `fullscreen` 字段；`settings` 事件保留（由显式开启的设置图标触发）。同步更新 api-meta、文档站示例 desc、组件文档 V_1.11、设计文档 V_1.5；全量 vitest 311 用例全绿。
- **`WdAnchor` 快速导航（锚点）组件**：悬浮跟随式多级目录（组件总数 30 → 31，归入「页面元素」分组）。自动解析容器内 `H1 ~ H4` 多级标题，垂直列表按层级缩进展示全部文字（默认不折叠）；滚动时跟随可视区第一个标题自动高亮（`change` 事件抛出当前项），点击列表项平滑滚动到对应章节（`item-click` 事件抛出点击项）。`container` 限定扫描范围（默认最近 `.wd-station__content`，无则整页），`position` 支持 `fixed`（默认，右侧中部悬浮卡片）/ `absolute`（嵌入容器内定位），`max-level` 过滤最深层级（默认 4），`offset` 控制跳转留白（默认 16）。复用 WdPath 已验证的自激防护模式：MutationObserver 过滤 `.wd-anchor` 子树内变动 + 标题结构签名比对，避免组件渲染物触发重扫死循环；`refresh()` 方法支持手动重扫。新增 `docs/src/examples/anchor.vue` 2 个示例与 `document/components/anchor_v1.0.md` 文档；11 个新用例（标题解析与列表渲染 4 / 滚动高亮 2 / 点击跳转 1 / 自激防护 2 / 悬浮定位与方法 2），全量 vitest 322 用例全绿；typecheck 0 错误；docs:build 成功；Playwright 实测 8 项断言全过。
- **`WdAnchor` V_1.1.1 默认形态重塑（默认收起 + 圆点 + v-model:expanded + #toggle 插槽）**：根据用户指令「WdAnchor默认是缩在右侧，并且只提供一些导航圆点，并且设置一个v-model值来指定当前是否展开。（提供一个点击按钮可以展开，并且有slot更改他。）」，调整默认形态：①`dot` 默认由 `false` 改为 `true`（圆点模式，隐藏文字，只显示圆点）；②新增 `v-model:expanded` 受控展开态（`expanded` prop 默认 `false` = 收起，emit `update:expanded`），替代原 `collapsible` prop（已移除——组件默认就是收起形态，不再需要开关）；③`#toggle` 插槽可自定义触发按钮内容（按钮点击行为仍由组件接管）；④触发按钮 `__toggle` 始终渲染（不再随 `collapsible` 条件出现）；⑤列表项新增 `data-title` 属性便于测试/外部读取标题。文档站示例同步更新：demo1 用 `expanded :dot="false"` 展示文字列表，demo4 改为 v-model:expanded + #toggle 插槽「≡」图标 + 外部按钮受控切换，demo5 改为文字模式（dot=false）。Anchor.test.ts 21 用例全绿（含新增「默认收起 / 默认 dot=true / v-model:expanded 切换 / #toggle 插槽」4 个默认形态用例）；全量 vitest 349/349 全绿、vue-tsc 0 错误、docs:build 成功；Playwright 实测 9/9 PASS（demo 块数 6 / DocLayout .doc-anchor 接入且默认收起 / 默认 dot=true / demo4 插槽渲染 / 点击 toggle 列表展开 / console 无错误）。
- **`WdAnchor` V_1.1.2 圆点模式悬停 tooltip**：根据用户指令「dot模式下，鼠标放置在dot下需要显示出该文本」，为圆点模式（dot=true）补齐悬停气泡——鼠标悬停圆点列表项时以纯 CSS 气泡显示该项标题文字。实现方式：列表项 `<li>` 的 `::after` 伪元素读取 `content: attr(data-title)`（复用 V_1.1.1 已加的 data-title 属性），hover 时通过 `opacity + transform` 展开；零 JS、零额外 DOM。仅 hover 时显示（用户指令原文：「点击之后显示的固定Tooltips可以不用」），激活项不再常驻。tooltip 样式跟随主题令牌（`--wd-bg-color` / `--wd-border-color-light` / `--wd-text-color-primary`），换肤自动联动。**修复两个实际生效问题**：①li 默认 `overflow: hidden`（原为文字省略号）会把 `::after` 裁剪掉——dot=true 时覆盖为 `overflow: visible`；②tooltip 永远朝向内容区展开（anchor 贴右时 tooltip 向左、贴左时向右），避免跑出视口（用户指令原文：「我知道了，如果Anchor面板在右侧，tooltips也在右侧出现，结果在窗口外面」）。
- **`WdAnchor` V_1.1.2 toggle 按钮图标改为多点列表样式**（用户指令原文：「收缩的dot图标改一下，改成一个多点列表图标」）：原先单个 6px 圆点改为三条短横线 + 每端小圆点（示意"可展开的目录"），尺寸 12x2px、颜色跟随 `--wd-color-primary`，仍可通过 `#toggle` 插槽完全自定义。
- **`WdAnchor` V_1.1.2 新增 `toggleText` / `toggleTextDirection`**：允许用户为收缩按钮传入文字及文字方向（用户指令原文：「增加一个属性允许用户输入收缩按钮的文字以及文字方向属性」）。`toggleText`（默认 `''`）传入后覆盖默认多点列表图标；`toggleTextDirection`（`'horizontal' | 'vertical'`，默认 `'horizontal'`）用 `writing-mode: vertical-rl` 实现竖排，适合窄侧边。优先级：`#toggle` 插槽 > `toggleText` > 默认图标。新增 2 个用例（toggleText 覆盖图标 / vertical data-direction），Anchor.test.ts 24 用例全绿。
- **`WdPanel` 新增 `descriptionExpandable`**：控制描述展示模式（用户指令原文：「WdPanel组件增加一个属性：可以设置description（描述）是否显示展示。显示的展示就是当前状态不变。如果不是显示展示，则会在title下出现一条虚线，当鼠标放置标题之上的时候才显示出Description」）。默认 `false`=显示展示（描述直接显示在标题旁，保持原有表现不变）；`true`=折叠展示（标题下出现虚线，鼠标悬停标题时才显示描述，移开隐藏）。纯 CSS `:hover` 实现零 JS：`.wd-panel__description.is-folding` 默认 `display:none`，`.wd-panel__header:hover .is-folding` 显示；title 加 `.is-dashed` 虚线下划线。新建 Panel.test.ts 3 用例（默认显示不带折叠态类 / true 时 desc.is-folding + title.is-dashed / 空描述不渲染），全绿；docs 加「描述折叠展示」demo（code6）并接入 api-meta；Playwright 实测 8/8 PASS（默认 display=block 常驻、折叠 display=none、hover 标题后 block、移开恢复 none、console 无错误），截图 [panel_description_expandable.png](file:///e:/ai project/workdesktop AI/temp/panel_description_expandable.png)。
- **`WdPanel` 新增 `collapseHeight` 内容超限自动折叠**：指定内容高度阈值（px，默认 `0`=不折叠、完全撑开）；开启 `collapsible` 且内容实际高度（`scrollHeight`）超过阈值时，组件在挂载渲染完成后测量一次并自动收起，正常触发 `update:opened` / `change`，用户可点击标题重新展开（自动折叠只在挂载时判断一次，后续内容变化不重复触发，避免用户展开后被强制收起）。未开启 `collapsible` 时即使超限也不折叠（用户无法再展开）。Panel.test.ts 扩到 8 用例（默认 0 不折叠 / 超限自动折叠并触发事件 / 未超限保持展开 / 未开 collapsible 不折叠 / 初始 opened=false 不重复触发），全绿；docs 新增「内容超限自动折叠」demo（code7，超限 vs 未超限对比）并接入 api-meta；Playwright 实测 9/9 PASS（超限面板初始收起 height=0px、点击展开 height=164px、再点收起、未超限面板保持展开、未设 collapseHeight 面板不受影响、console 无错误），截图 [panel_collapse_height.png](file:///e:/ai project/workdesktop AI/temp/panel_collapse_height.png)；组件文档 `document/components/panel_v1.1.md` 同步（V_1.0 存档保留）。
- **`WdPanel` 新增 `descriptionAlign` 描述对齐方式**：控制 description 在标题右侧空白区的对齐（用户指令原文：「我想要增加的是在标题右侧的空白位，居左对齐或者居右侧对齐」）。`'left'`（默认）=紧跟标题（保持原有表现）；`'right'`=描述吸收剩余空白（`margin-left: auto`）贴到面板头部右端，与 extra 操作区同侧呼应；与 `descriptionExpandable` 可叠加（悬停显示的描述同样靠右）。DOM 顺序不变（description 始终在 title 之后），单行 ellipsis 截断行为不变。Panel.test.ts 扩到 11 用例（默认 left 无 is-right / right 标记 is-right 且 DOM 顺序不变 / right 与 descriptionExpandable 组合互不影响），全绿；docs 新增「描述对齐方式」demo（code8，居左 vs 居右对比）并接入 api-meta（props 表 + notes）；Playwright 实测 7/7 PASS（居左 gap=8px 紧跟标题且右缘留白 964px；居右 right-space=16px 贴头部右端且中间留白 988px；视觉顺序不变；console 无错误），截图 [panel_description_align.png](file:///e:/ai project/workdesktop AI/temp/panel_description_align.png)；组件文档 `document/components/panel_v1.2.md` 同步（V_1.1 存档保留）。
- **`WdPanel` 动态 description 悬停出现增加入场动效**：`descriptionExpandable=true` 时描述由「瞬间显示」改为 0.24s 淡入（`opacity 0 → 1`）+ 4px 轻微滑入（`translateX`）的入场动画；`descriptionAlign="right"` 时改为从右侧滑入（位移方向与对齐方向一致）。纯 CSS `@keyframes` 实现，无新增 prop、DOM 结构与折叠逻辑不变，默认常驻展示的描述不受影响。验证：Panel 单测 11/11 全绿、`vue-tsc --noEmit` 0 错误、docs 构建通过；Playwright 实测 14/14 PASS（未悬停 display=none 且无动画、悬停后 animationName 绑定 + duration=0.24s、关键帧 opacity 0→1 与位移归位、动画中采样 opacity=0.52 证明渐入、结束后 opacity=1、移开恢复隐藏、默认展示态无动画、console 无错误），截图 [panel_description_animation.png](file:///e:/ai project/workdesktop AI/temp/panel_description_animation.png)；组件文档 `document/components/panel_v1.3.md` 同步（V_1.2 存档保留）、api-meta props 与 notes 更新。
- **`WdAnchor` V_1.1 增强（手动 items / 跨组件联动 / 位置可调 / 可收缩 / 圆点模式）**：新增 5 个 props——`items`（数组或 JSON 字符串，传入后跳过容器标题扫描进入手动模式，点击只抛 `item-click` 不自动滚动）、`filter`（分组 key，配合联动 API 跨组件/跨页面驱动菜单内容）、`placement`（`right` / `left` / `top` / `bottom`，默认 `right`，由组件自身控制方位）、`collapsible`（默认收起只显示圆形触发按钮，点击展开列表）、`dot`（只显示圆点、隐藏文字，悬停圆点展开为文字）。新增联动注册中心 `src/lib/core/anchor-linkage.ts`：`registerAnchorInstance`（组件挂载时注册、卸载时注销）、`setAnchorItems(filter, items)`（向同组全部实例注入菜单，返回注入数量）、`notifyAnchorChange(filter)`（通知同组列表变更）、`getAnchorItems(filter)`（读取当前菜单快照）、`clearAnchorRegistry()`（测试清理），`src/index.ts` 同步导出。手动模式与联动注入后自动脱离容器扫描（`unbindContainer`），不再走 MutationObserver。文档站 `examples/anchor.vue` 由 2 demo 扩到 6 demo（新增手动 items+filter 联动 / collapsible / dot / placement=left）；`DocLayout` 框架已接入 `<wd-anchor class="doc-anchor" container=".wd-station__content" position="fixed" :offset="64" />` 作为文档站右侧悬浮快速导航（注：Station router 模式下默认插槽只渲染 RouterView，故挂到 Station 外层并改用 `fixed` 定位）。新增 8 个单测用例（手动 items 解析 / JSON 字符串 / 手动模式跳过扫描 / placement 数据属性 / collapsible toggle / dot 数据属性 / setAnchorItems 注入 / getAnchorItems 读取），全量 vitest 330 用例全绿；Playwright 实测 8 项断言全过（demo 块数 6 / 实例数 7 / 注入后出现「跨组注入-1」/ toggle 按钮 / data-dot=true / data-placement=left / DocLayout .doc-anchor 接入 / console 无错误）；api-meta 新增 5 props 与 4 条 FAQ，`document/components/anchor_v1.1.md` 同步。
- **`WdStation` 新增 `menuAccordion` 属性（Boolean，默认 `false`）**：左侧菜单手风琴——`true` 时左侧栏同时只展开一个子菜单（透传 el-menu `unique-opened`），`false`（默认）保持子菜单可多开的既有行为；仅 side 模式生效，顶部横排菜单（horizontal）不透传。新增 1 个集成用例（默认不透传 true / 开启后透传 / top 模式不受影响），全量 vitest 357 用例全绿；api-meta、组件文档 V_1.13、设计文档 V_1.7 同步。
- **`WdStation` 左侧菜单 title 分组标题样式优化**：`headerMode='title'` / `'both'` 下 `el-menu-item-group` 分组标题由 EP 默认的 12px/400 与菜单项融合样式，改为小型章节标题风格——font-weight 600、letter-spacing 0.5px、非首组 margin-top 12px 拉开组间距（首组归零）、行高 1.5；颜色走 `var(--wd-station-menu-group-color, var(--el-text-color-secondary))` 令牌回退链，antd 暗蓝侧栏皮肤在该变量注入 `rgba(255,255,255,0.45)` 半透明白（变量继承，规避 scoped 特异性冲突）。折叠态自动隐藏分组标题（EP collapse 不处理 group title，避免 64px 窄栏溢出）。Playwright 实测 7 项断言全过（含折叠隐藏）；skins 单测补 antd 变量断言；全量 vitest 357 用例全绿、typecheck/build 通过；组件文档 V_1.14、设计文档 V_1.8 同步。
- **`WdStation` 修复 headerMode='title'/'both' 折叠后菜单项文字残留**：EP 的 collapse 文字/icon 隐藏规则（`.el-menu--collapse>.el-menu-item>span` 等）只命中折叠菜单的直接子级菜单项，title/both 模式下菜单项位于 `el-menu-item-group` 内层不被命中——64px 窄栏下分组内菜单项文字残留溢出（EP 自身覆盖了 group 里的 el-sub-menu 却漏了 group 里的 el-menu-item）。Station.vue scoped 补齐两条规则：group 内菜单项 `> span` 折叠时隐藏（visibility/width/height/overflow）+ icon 归一（margin 0、宽度对齐 `--el-menu-icon-width`）。Playwright 复现断言红 2 FAIL（title「工作台」span 42px / both「任务列表」56px 残留）→ 修复后 ALL PASS，上轮分组标题 7 项断言无回归；全量 vitest 357 用例全绿、typecheck/build 通过；组件文档 V_1.15、设计文档 V_1.9 同步。
- **文档站 `WdStation` 示例菜单数据抽离为独立 JSON**：`docs/src/examples/station.vue` 中三份内联菜单演示数据（`menuGroups` / `menuGroupsDeep` / `flatMenus`）抽离到同目录 `station-data.json`，示例改为 `import stationData from './station-data.json'` + 三个 const 别名取用，模板绑定与展示代码零改动；便于直接查看/复用各左侧菜单的数据内容。数据等价重构：Playwright 回归（分组标题样式 7 项 + 折叠修复 2 项）全 PASS，typecheck、docs:build 通过。
- **文档站 `WdStation` 示例「查看代码」展示内容包含左侧菜单 JSON**：8 个 demo 的 code 展示字符串统一追加 `<script setup>` 数据块，菜单数据用 `JSON.stringify(stationData.xxx, null, 2)` 从 `station-data.json` 动态生成（单一数据源，json 改动展示代码自动同步），经 DemoBlock `splitCode` 拆分后在「JavaScript」标签页展示完整 JSON（模板片段仍归「HTML」页）；`<\/script>` 转义规避 SFC 解析截断（code6 已有先例）。Playwright 断言 8/8 demo 的 JS 页含对应菜单 JSON 特征（含 flatMenus 完整 5 项、menuGroupsDeep 三级路径），分组标题/折叠修复回归 9/9 PASS，typecheck、docs:build 通过。
- **`WdStation` 图标支持 Font Awesome 等图标字体（额外安装形式）**：新增共享图标解析工具 `src/lib/core/station-icon.ts`（`isIconFontClass` + `resolveStationIcon`，TDD 单测 7 例）——`fa-`（Font Awesome）/ `bi-`（Bootstrap Icons）/ `ri-`（Remix Icon）/ `iconfont`（阿里）前缀或含空格多 class 的 icon 字符串按 `<i :class>` 渲染（颜色字号继承所在位置），其余字符串仍按 ElementPlus 图标名查表、组件对象直接渲染；Station（logo×2 / 分导台组图标 / both 菜单项 / tab 标签）、StationMenuNode（sub-menu 标题 / 菜单项）、Path（面包屑两分支）共 11 处渲染点接入并消除三处重复 resolveIcon。**组件库零新增依赖**：图标字体 CSS 由使用方自行引入（`npm i @fortawesome/fontawesome-free` 后 `import '@fortawesome/fontawesome-free/css/all.min.css'`），不用 FA 的项目零包体零感知；icon 传 FA SVG 包装组件（`@fortawesome/vue-fontawesome`）照常直接渲染。docs 新增「Font Awesome 图标」demo（logo=fa-brands fa-vuejs、`menuGroupsFa` 数据、查看代码含完整 JSON）。验证：全量 vitest 364 用例全绿（新增 7）、typecheck 0 错误、docs:build 通过、Playwright FA 断言 8/8 PASS（含 computed font-family 为 Font Awesome 6 Free/Brands、badge 共存）+ 查看代码 JSON 9/9 + 分组标题/折叠修复回归全过。

### Fixed

- **`WdStation` `headerMode='both'` 左侧菜单徽章位置错误**：both 模式的一级叶子菜单项由 Station.vue 模板内联渲染（不经 StationMenuNode），而徽章对齐样式（inline-flex / margin-left:auto / 垂直居中）只存在于 StationMenuNode.vue 的 scoped 样式——scoped 互不渗透导致 both 模式 badge 无样式可用，被 el-menu-item 的 56px line-height 撑成整行 block，红点沉到下半行（实测 sup 中心偏离菜单项中心 18px）。Station.vue scoped 补齐同款两条规则（徽章对齐 + 折叠隐藏，与 StationMenuNode 保持一致）；Playwright 实测红→绿：sup 中心与菜单项中心重合、右对齐生效、折叠后隐藏，nav/title/top 模式回归无变化。

- **`WdApiButton` 请求期间按钮 loading 态未生效**：模板两处 `el-button` 只绑定了 `:disabled`，内部 `loading`（已受 `buttonLoading` 开关控制）从未作为 `loading` prop 传入，导致请求期间按钮仅禁用、不转圈。现补齐 `:loading="loading"` 绑定，恢复与既有回归用例 `ApiButton.loading.test.ts` 约定一致的加载表现；`buttonLoading=false` 时仍不转圈。
- **`WdStation` router 模式下关闭标签回跳不同步路由**：关闭当前激活标签回跳时只更新激活态（`update:active-menu`），未重新 `router.push`（点击标签切换会同步、关闭回跳不会），导致由路由驱动的内容区不跟随切换、仍显示被关页内容。现 `closeTab` 与批量关闭导致当前标签被关时，回跳均同步 `router.push` 到回跳标签的 `path`。新增 2 个集成用例（closeTab MRU 回跳 push / 批量关闭回跳 push），全量 vitest 310 用例全绿；组件文档 V_1.8 同步。

## [1.1.1] - 2026-09-24

预设皮肤系统与主题能力增强：`theme.skin` 一键套用 11 套预设皮肤，Element Plus 派生色阶自动生成，组件级 CSS 变量回退链全面打通。

### Added

- **预设皮肤系统（`theme.skin` 一键套用）**：新增 11 套预设皮肤——`default` / `fashion` / `business` / `tech` / `cyberpunk` / `chinese` / `flat` / `neumorphism` / `gradient` / `cool` / `governance`；通过 `app.use(WorkDesktop, { theme: { skin: 'tech' } })` 或 `setGlobalConfig({ theme: { skin: 'cyberpunk' } })` 一键切换，每套皮肤 = 语义色 + 组件级 CSS 变量整套预设。覆盖优先级 `theme.cssVars > theme.colors > theme.skin`；未传或传入未知皮肤名时 `console.warn` 并回退默认皮肤。主入口新增导出 `SKIN_PRESETS` / `getSkinPreset(key?)` / `listSkins()` 与类型 `SkinPreset` / `SkinName`（`listSkins()` 供设置面板遍历全部预设）。新增 `skins.test.ts` 单测。
- **Element Plus 派生色阶自动生成**：`resolveTheme` / `applyTheme` 重构——皮肤预设打底，`colors` / `cssVars` 依次覆盖；按 Element Plus 混色公式由语义主色自动推导 `--el-color-{key}-light-3/5/7/8/9` 与 `dark-2` 色阶（`error` 归一为 `danger`），换肤后 EP 组件的 hover / disabled 等派生态同步更新。写入 `:root` 顺序：colors 语义键 → El 派生色阶 → cssVars 精细覆盖。
- **组件级令牌回退链**：`WdDataGrid` / `WdEditableGrid`（卡片模式）、`WdSearchPanel`、`WdDataForm`（footer）、`WdStation`（aside / header / tabs）、`WdPanel` 等组件样式全部接入组件级 CSS 变量回退链（形如 `var(--wd-panel-bg, var(--wd-bg-color, #fff))`），皮肤可单独定制某个组件而不影响全局；可用令牌见 `src/styles/tokens.css`。
- **`WdPanel` 新增 `border` prop**（Boolean，默认 `true`）：置于嵌套容器内时可传 `:border="false"` 关闭外边框（加 `wd-panel--no-border` 类），配合内容页多容器布局减少边框堆叠。
- **`ApiButton` 指定 `icon` 时请求期间按钮自动变 loading**：开发人员为按钮设置 `icon`（经 `$attrs` 透传 el-button）后，发起请求期间 el-button 自动进入 loading 加载形式（icon 被 loading 动画替换、按钮加 `is-loading`），严格遵循请求 loading 时机（请求开始置 true、结束置 false）；原有的 `buttonLoading`（按钮转圈开关）、`pageLoading`（全局遮罩）与请求事件链路均不受影响。`api-button` 组件页基础用法示例补充带 `icon`（Edit）的「保存配置」按钮演示；新增 `ApiButton.loading.test.ts` 2 个回归用例（请求挂起时按钮 `is-loading` 出现、`button-loading=false` 时不转圈）。

### Changed

- package.json `files` 新增 `llms.txt`：AI 参考文档随 npm 包一起发布。
- 文档站：新增「自定义皮肤」示例与皮肤切换入口（可遍历 11 套预设皮肤），api-meta 同步组件级令牌说明。

## [1.1.0] - 2026-09-17

组件架构整合与能力扩充：容器组件统一为 `WdDrawer`；新增 5 个组件（`WdPopconfirmButton` / `WdStation` / `WdFormItem` / `WdSearchItem` / `WdRequester`），组件总数 24 → 28；新增 27 个 ESM 按需子路径入口。

### Changed

- `WdDialog` 合并进 `WdDrawer`：容器组件统一为一个，通过 `mode="drawer" | "dialog"` 切换（默认 `drawer`）；`size` 同时作用于抽屉尺寸与对话框宽度，`direction` 仅抽屉模式生效，`filter` / `headRefreshDatagrid` / 事件 / 插槽保持不变。容器组件由 `WdDialog` / `WdDrawer` 两个合并为一个 `WdDrawer`（组件总数 -1）。
- `WdEditableTable`（`<wd-editable-table>`）重命名为 `WdEditableGrid`（`<wd-editable-grid>`），目录 `data/editable-table` → `data/editable-grid`。
- `WdDrawerButton` 新增 `mode="drawer" | "dialog"`（默认 `drawer`）：一个按钮即可打开抽屉或对话框弹层；`WdDialogButton` 保留为 dialog 专用简化版（内部基于 `WdDrawer mode="dialog"`，无 `mode` / `direction`，默认 `type="primary"`，自带 `buttonSize`）。两个按钮属性统一命名（破坏性）：`drawerTitle` / `dialogTitle` → `title`，`drawerUrl` / `dialogUrl` → `url`，`drawerData` / `dialogData` → `data`；`size`（弹层宽度）、`direction`（仅抽屉生效）、`filter`、`headRefreshDatagrid`、事件与插槽保持不变。
- 按钮组文案属性 `text` 改名为 `label`（破坏性）：七个按钮组件（`WdApiButton` / `WdConfirmButton` / `WdDialogButton` / `WdPromptButton` / `WdRouteButton` / `WdTipsButton` / `WdDrawerButton`）的「按钮文案」属性由 `text` 统一改为 `label`，释放 `text` 给 el-button 原生「文字按钮」布尔语义（经 `$attrs` 透传，原声明截获已移除，`text` 不再作为 String 文案）。调用方需将 `text="文案"` 迁移为 `label="文案"`；el-button 的其它原生属性（`type` / `size` / `plain` / `round` / `circle` / `link` / `disabled` / `icon` / `native-type` 等）继续经 `$attrs` 透传支持，并在各按钮组件文档 Props 表中按「继承自 el-button」逐条列明（API 请求类按钮因内部已绑定 `:loading` 由 `buttonLoading` 控制，不列 `loading`；Route/Tips/Drawer 类含 `loading`）。
- **所有按钮组件均已集成语悬停提示**：和 TipsButton 一样，每个按钮组件都支持 `tips`（提示内容）、`tipsType`（主题）、`placement`（位置）三个属性；当 `tips` 非空时自动用 `el-tooltip` 包裹，无提示则不包裹；现在所有按钮都可按需添加悬停提示，无需额外套一层 tooltip。
- **PromptButton 自定义内容插槽**：新增 `#content` 插槽允许开发者自定义弹窗内容（示例中展示了嵌入 `WdDataForm` 实现多字段输入表单）；点击确认后默认发起 API 请求，仅当 API 返回包 `success=true` 时自动关闭弹窗，API 请求失败时不关闭弹窗，允许开发者修改错误后重试。新增 `confirm` 事件（自定义内容模式点击确认触发）。
- **文档站 mock 改为 HTTP 层（请求真实可见）**：`docs/src/mock` 新增 `createMockHttpHandler`，由 `docs/vite.config.ts` 新增 `wd-mock-server` 插件在 dev server 中间件层拦截 `/mock/*` 返回假数据。开发模式下 `/mock/xxx` 请求**真实发出**（浏览器 Network 面板可见请求 URL、方法、参数与响应），示例数据不受影响；`docs/src/main.ts` 移除 axios adapter 短路（生产构建 `import.meta.env.PROD` 时回退 `createMockAdapter`，保证静态部署后示例仍可演示）。

### Removed

- 移除 `WdDialog` 容器组件及其导出，请改用 `WdDrawer` 并设置 `mode="dialog"`。

### Fixed

- 修复 `WdDialog` / `WdDrawer` 容器「外部 `v-model` 置 true 无法打开」：`useContainerController` 原先只在容器挂载时读一次 `modelValue`（`visible = ref(!!props.modelValue)`），不监听后续变化。而 `WdDrawerButton` 采用「先懒挂载容器、`nextTick` 后再置 `panelVisible=true`」的两段式时序，导致打开动作失效——dialog 模式完全不弹层、抽屉/对话框内容无法正确呈现，且关闭后父级状态不回写，二次打开同样失败。现补充双向同步：`watch(modelValue)` 使外部置位即时生效（受控打开），`watch(visible)` 在弹层被 X / 遮罩 / ESC 关闭后回写 `update:modelValue=false`，保证重复开关正常。新增 `useContainerController.test.ts` 4 个回归用例。
- 修复 `WdStation` 菜单徽章（badge）位置错乱：`el-badge` 继承 `el-menu-item` 的 `line-height:56px` 导致行盒撑满整行、圆点垂直沉底，且水平紧贴标题右侧而非菜单项右侧。现徽章转为 `inline-flex`（消除行盒撑高）+ `margin-left:auto` 靠右 + `align-self:center` 垂直居中；菜单折叠成窄条时隐藏徽章避免溢出。Playwright 坐标级断言 6 项全过。
- `WdStation` tabs 标签分隔线由 `border-left`（首个标签无左边框、末个标签右侧开口）改为 `border-right`：每个标签默认带右侧边框（含最后一个），tabs 区右端封闭，与右侧下拉按钮区自然分隔。Playwright 回归 24 项全过。
- 修复 `WdDataGrid` 表格/列表清单模式切换按钮不渲染：按钮渲染条件误用从未渲染的 `$slots.list` 插槽（顶/底工具组及 `hasTools` 判定共 3 处），与文档记载的 `card-item` 插槽不一致，导致开启 `mode-switch` 并提供 `card-item` 后按钮仍不出现、功能按文档契约完全不可达。现统一为 `card-item` 插槽判定。新增 2 个集成回归用例（提供插槽时渲染按钮 + 点击双向切换 + `mode-change` 事件回传；未提供插槽时不渲染按钮）。`WdEditableGrid` 无此问题（其切换按钮无插槽限制）。

### Added

- **`WdStation` 固定点位全面开放插槽（11 个新增）**：`logo`（side 模式在侧栏顶部、top/none 模式在顶栏左侧，两处共用同一插槽）、`menu-top` / `menu-bottom`（侧栏菜单滚动区上/下方，仅 side 模式）、`header-left` / `header-center` / `header-right`（顶栏左/中/右扩展位，`header-right` 位于工具栏右侧点位之前）、`top-menu-left` / `top-menu-right`（顶部菜单行两侧，仅 top 模式）、`tabs-left` / `tabs-right`（tabs 条两侧，仅 tabs 内容模式）、`footer`（底栏整区）。所有插槽内置默认内容 fallback——未传插槽时各点位保持原渲染，完全向后兼容；`logo` 与 `footer` 为替换型（传入后默认图标+标题 / footer-info+copyright 不再渲染），其余为追加型。`logo` / `menu-top` / `menu-bottom` 透传 `collapsed` 作用域参数，折叠时可切换 mini 形态（如 `v-show="!collapsed"` 隐藏文字）。顶部菜单行改 flex 布局（`el-menu` `flex:1` 占满中间）以容纳左右扩展位。新增 3 个集成用例（点位渲染与位置顺序 / top 模式点位与未传点位默认保持 / collapsed 作用域透传），Playwright 实测 25 项断言全过（含折叠/展开切换复核）；文档站新增「固定点位插槽」示例（第 7 个 demo），api-meta slots 表同步补全。

- **`WdDataGrid` 分页支持位置指定 `pagerPosition`**：left / center / right，默认 right（与既有行为一致）。缺省时走全局配置 `page.pager.position`（`PagerConfig` 新增 `position` 项，默认 `'right'`），prop 优先于全局配置；有底部工具组（tools/toolbar 置 bottom）时分页仍按指定位置对齐，组自然排布于剩余空间。新增 2 个集成用例（prop 三档 + 全局配置优先级），Playwright 坐标级实测三档布局。

- **docs 新增 `WdDataGrid`「表格 / 列表清单模式（卡片）」示例**：静态项目台账数据 + 自定义 `card-item` 卡片（项目名称/状态/编号/负责人/截止日期/进度条/优先级标签）+ `mode-change` 事件 ElMessage 提示，演示开启 `mode-switch` 后工具栏切换按钮在表格视图与列表清单（卡片）视图间切换的完整用法；旧「静态数据」示例移除误导性的 `mode-switch` 声明（未提供 `card-item` 插槽时按钮本不渲染），更名「静态数据 + 动态列」。

- **`WdDrawerButton` 新增 `buttonSize`（按钮尺寸）**：DrawerButton 的 `size` 已被「弹层尺寸」占用，el-button 的按钮尺寸无法通过 `size` 透传（被截获）。现新增 `buttonSize` prop 专门控制按钮尺寸（large/default/small），与弹层尺寸解耦；`DialogButton` 已有 `buttonSize`。
- **修复 datagrid 示例操作列 el-button-group 样式错乱**：原示例把 `<el-button>` 放进 DrawerButton 的 `#button` 内容插槽，渲染出「button 嵌套 button」的非法 HTML，导致 group 内按钮尺寸/样式错乱。已改为 `label` + `type` + `button-size` 属性式写法，group 内两个按钮（详情 + 删除）尺寸一致、圆角衔接、边框合并、分割色全部正确（Playwright 实测验证）。

- **全部按钮组件支持 `el-button-group` 连排使用**：8 个 Wd 按钮组件（Api / Confirm / Popconfirm / Prompt / Route / Tips / Drawer / DialogButton）渲染根 DOM 均为 `button.el-button`（含 el-tooltip / el-popconfirm 包裹时 trigger 即按钮），天然命中 Element Plus `.el-button-group > .el-button` 样式——首尾圆角衔接、相邻 `margin-right:-1px` 边框合并、type 分割边框色、hover/active z-index 均与原生 el-button 一致；弹层类按钮（抽屉/对话框/气泡确认/提示）在 group 内点击能力不受影响。`api-button` 组件页新增「按钮组（el-button-group）」示例，混合 5 种按钮演示；`datagrid` 示例的操作列（详情 + 删除）同样使用 group。
- **`WdPopconfirmButton`（`<wd-popconfirm-button>`）新增组件**：基于 ApiButton 请求逻辑与 el-popconfirm 气泡确认封装——点击按钮弹出气泡确认，用户点击「确定」后自动请求 API（loading、成功/失败提示、`apiSuccess` 事件与声明式 DataGrid 刷新均复用按钮组请求链路）。集成属性：el-button 全属性（`$attrs` 透传，文档列明）、TipsButton 悬停提示（`tips`/`tipsType`/`placement`）、el-popconfirm 常用属性（`title`、`confirmButtonText`、`cancelButtonText`、`confirmButtonType`、`cancelButtonType`、`width`、`trigger`、`popperClass`、`teleported` 等；其中 `icon`→`popIcon`、`disabled`→`popDisabled` 以避免与 el-button 同名透传冲突）。事件：`click`/`confirm`/`cancel`/`show`/`hide` + 请求事件 `apiBefore`/`apiSuccess`/`apiFail`/`apiException`/`apiAfter`。**同时支持悬停提示**：el-tooltip 与 el-popconfirm 采用平级 `virtual-ref` 方案（均以 `virtual-ref` 指向同一按钮，互不嵌套），hover 显示提示、click 弹出确认，两者互不冲突、控制台零警告（嵌套方案会触发 EP `[ElOnlyChild]` / runtime directive 警告且外层弹层事件失效）。按钮组 7→8（文档新增 popconfirm-button 页与示例）。

- `WdEditableGrid` 完整集成 DataGrid 全部能力：API/静态双数据源（`api` / `dataSource` / `modelValue`）、分页、工具栏 tools（刷新/尺寸/列设置/模式切换）、高度模式（`height="fix"` / 固定高度 / 自适应）、表格/卡片模式切换、动态列设置（配置列与插槽列合并，localStorage 持久化）、行合并、树形、多选、`rowActions` 只读操作列、SearchPanel / `refreshDataGrid` 联动注册；同时保留可编辑能力：`columns` 配置驱动可编辑列、cell/row 双编辑模式、脏行跟踪、required + 自定义校验、`saveApi` 批量保存、新增/删除行。
- `WdEditableGrid` 新增单元格级「已修改」样式：进入编辑时记录该行基线，单元格当前值若与基线不一致（判定为用户编辑过）即自动标识（默认单元格最右侧显示红色感叹号小图标 `.is-dirty`，可自定义）；改回原值或取消 / 保存成功后样式自动消失。脏状态粒度由整行细化到单元格。标识样式通过 CSS 变量自定义，默认：
  - 显示感叹号图标（`--wd-cell-dirty-show-icon: true`）
  - 图标颜色用警告色 `--wd-cell-dirty-color: var(--el-color-warning)`
  - 单元格底色透明 `--wd-cell-dirty-bg: transparent`
  开发者可覆盖：
  ```css
  /* 恢复底色高亮 + 关闭图标 */
  .wd-editable-grid__cell.is-dirty {
    --wd-cell-dirty-show-icon: false;
    --wd-cell-dirty-decoration: none;
    --wd-cell-dirty-bg: rgba(230,162,60,.12);
  }
  ```
- `WdEditableGrid` 新增与 ElForm 完全一致的 `rules` 单元格校验：`columns[].rules` 基于 `async-validator`（与 `el-form` 的 `:rules` 同源），规则不满足的单元格显示约束样式（`.is-error`），默认浅红底色 + 红色内边框；可通过 CSS 变量自定义：
  - `--wd-cell-error-bg`：单元格背景色
  - `--wd-cell-error-border`：边框阴影
  示例：
  ```css
  /* 自定义深色错误背景 */
  .wd-editable-grid__cell.is-error {
    --wd-cell-error-bg: rgba(245, 108, 108, 0.3);
  }
  ```
  批量保存与行内保存前先校验，失败即中断并 `ElMessage.warning` 提示 + 触发 `validate-fail` 事件（携带 `{ index, row, column, error }`），不发起保存请求。`required` / 自定义 `validator` 兼容沿用。
- `useColumnSettings` 新增 `initMetas(metas)`，支持以列元信息（而非插槽 vnode）初始化动态列设置，供 columns 配置驱动的组件复用。
- **`WdStation`（`<wd-station>`）新增组件**：中后台外框架组件，一个组件产出「logo + 分导台 + 菜单 + 内容区 + 工具栏 + 底部信息栏」完整骨架。顶栏中央二选一（`headerMode`）：流式块状菜单分组切换条（分导台，点击后左侧菜单整体更换）或标题文案；统一菜单模型——优先 `menuGroups`（分组+菜单树），也接受扁平 `menus` 按 `groupKey||group` 自动聚合归一（无组归「默认」组、分导台自动隐藏），数组/对象属性均接受 JSON 字符串入参（UMD/HTML 场景降级）；菜单三态 `menuMode`（side 左侧多层建议两层 / top 顶部 / none 不启用），折叠按钮固定分导台最左侧、侧栏收缩 logo 跟随收窄；内容区 `contentMode`（page 单页 / tabs 标签页，affix 固定标签、关闭跳相邻、`v-model:open-tabs` 受控）× `routerMode`（auto 检测 `$router` 自动走 router push + RouterView，否则降级 HTML 仅抛事件）；工具栏 refresh/settings/user/login 四点位经 `toolbarConfig` 各自调 left/right/none；底部 `copyright` + `footerInfo`（`v-model:footer-info`）动态信息。新增 `lib/core/station-linkage` 注册中心，命令式导出 `registerStation` / `setStationFooter(target, info)` / `refreshStationView(target)`（target 语义复用联动心智：true 同 filter 组、字符串定向组）。暴露 `refresh()` / `openTab(item)` / `closeTab(key)`。组件分组新增 layout 布局组，按需子入口新增 `workdesktop-ai/station`，文档站新增「布局组件」分组与 6 个示例，集成测试 21 用例。
- `WdStation` 顶栏中央区由居中改为**左对齐**：左位/右位按内容宽度收缩，中央区 `flex:1` 占满剩余空间，分导台块状项 / 标题文案从左侧起排。
- `WdStation` tabs 条样式与交互增强：tabs 条整宽撑满内容列（el-tabs `flex:1`），消除 nav 左/上边框与 header 底线（底线由外层容器统一承担），tab 间保留分隔线；条最右侧新增下拉按钮，内置「关闭当前标签 / 关闭左侧标签 / 关闭其他标签 / 关闭所有标签」批量操作——`affix` 标签永不关闭，无可关对象时对应菜单项禁用，批量关闭逐个触发 `tab-close`，激活标签被关闭后跳转原位置相邻标签。集成测试扩为 22 用例。
- **`WdFormItem`（`<wd-form-item>`）与 `WdSearchItem`（`<wd-search-item>`）新增组件**：表单项包装器（`label` / `prop` / `tip` / `tipPlacement = 'top'`），`$attrs` 透传 `el-form-item`；`WdSearchItem` 为 SearchPanel 内的语义化别名。均有按需子入口（`form-item` / `search-item`）。
- **`WdRequester`（`<wd-requester>`）新增组件**：命令式请求器——`v-model` 置 true 触发一次请求后自动回 false（一次性开关语义），新请求自动静默中断旧请求；`method` / `reqOptions` 支持 `page.componentDefault.WdRequester` 全局覆盖；事件 `apiBefore`（可中断）/ `apiSuccess` / `apiFail` / `apiException` / `apiAfter`。
- **ESM 按需子路径入口（27 个）**：每个组件一个子路径 `workdesktop-ai/<subpath>`（含 types + ESM `.mjs`），14 个有独立样式的组件同步产出 `<subpath>/style.css`（按需引入：`base.css` + 对应组件样式）；主入口全量引入方式不变。

## [1.0.2] - 2026-09-06

文档示例告警治理与 HTML 模板渲染友好性修复。基于文档站 24 个组件页 + 7 个场景页的自动化控制台检测，修复 5 类 Vue / Element Plus 警告。

### Fixed

**按钮组 text 属性透传报错（影响 5 个按钮）**

- `WdApiButton`、`WdConfirmButton`、`WdPromptButton`、`WdRouteButton`、`WdTipsButton` 新增 `text` 文字 prop（String），支持 `text="保存配置"` 属性式写法；默认插槽兜底渲染 `{{ text }}`。
- 根因：组件未声明 `text` 时，属性式写法的字符串会经 `$attrs` 透传给 `el-button`，而 el-button 的 `text` 是 Boolean 型「文字按钮」开关，触发类型校验警告。声明 prop 后该属性自动从 `$attrs` 移除。统一对齐 `WdDrawerButton` / `WdDialogButton` 已有的 `text` + 插槽范式。

**WdImageUpload thumbnailSize 类型**

- `thumbnail-size` prop 类型由 `Number` 放宽为 `[Number, String]`，兼容 HTML 属性式字符串写法（如 `thumbnail-size="90"`），`v-bind` CSS 对两种类型均正确产出像素值。

**WdDataForm 编辑态首帧控件告警**

- 同步数据（`props.data` / 容器 `data`）的回填由 `onMounted` 提前到 setup 阶段（首次渲染前），避免插槽内 `el-switch` / `el-radio` 等控件首帧绑定 `undefined` 触发 Element Plus 校验警告；api 异步详情仍在 `onMounted` 拉取并覆盖。

**WdAutoComplete v-loading 指令告警**

- `v-loading` 由根节点 `el-autocomplete`（根为 ElTooltip / fragment 非单一原生元素）移至包裹 `<div>`，修复 "Runtime directive used on component with non-element root node at <ElPopper>" 告警。

**文档示例**

- `select` 远程搜索示例补全 `value-prop="id" text-prop="name"`：mock `/user/list` 返回用户对象主键为 `id`、名称字段为 `name`（非默认 `value` / `text`），缺失映射导致 `el-option` 的 `value` 为 `undefined` 告警。

## [1.0.1] - 2026-09-05

1.0.0 修订发布。

## [1.0.0] - 2026-09-05

首个正式发布。

### Added

**基础设施**

- HTTP 客户端 `request` / `http`：axios 封装，统一 `{ code, message, data }` 解封包、`urlPrefix` 前缀、Loading、成功/失败/异常提示、请求全生命周期监听、`create()` 子实例配置覆盖、请求/响应拦截器。
- 三级配置系统：内置默认配置 → 全局配置（`app.use` 第二参 / `window.workDesktopConfig`）→ 组件 props，deep merge；运行期 API `initConfig / setGlobalConfig / getGlobalConfig / mergeConfig / resetConfig`。
- 主题系统：语义色令牌（primary/success/warning/danger/info）与自定义 CSS 变量，支持配置对象生成 + CSS 变量覆盖。
- 声明式联动注册中心（`registerDataGrid / refreshDataGrid / searchDataGrid / resetSearchDataGrid / getDataGrids`）：属性式联动（`head-refresh-datagrid` / `head-close-drawer` 等）。
- 组合式 Hooks：`useRequest`、`useDataGrid`、`useConfig`、`useGlobalConfig`、`useEventBus`、`useGlobalState`。
- 轻量事件总线 `useEventBus` 支持跨层级事件驱动联动。

**数据组件**

- `WdDataGrid`：API / 静态双数据源、分页、搜索联动、工具栏（刷新 / 表格大小 / 视图切换）、动态列设置与本地持久化、序号列、多选、树形数据、卡片模式、行操作列场景规范。
- `WdEditableTable`：单元格级可编辑表格。
- `WdDataForm`：新增 / 编辑 / 详情回填、校验、提交（含保存并继续）、API 加载、字段白/黑名单、改动检测（`isDirty` / 离开拦截）、提交后联动刷新目标 DataGrid。

**按钮组（7）**

- `WdApiButton`、`WdConfirmButton`、`WdPromptButton`、`WdRouteButton`、`WdTipsButton`、`WdDrawerButton`、`WdDialogButton`。

**容器组（4）**

- `WdDialog`、`WdDrawer`、`WdIframe`、`WdSearchPanel`（含头部刷新/重置声明式联动）。

**输入选择组（5）**

- `WdSelect`、`WdAutoComplete`、`WdCheckboxList`、`WdRadioList`、`WdSwitch`。

**上传组（2）**

- `WdUpload`（单/多文件、模板下载、错误回显）、`WdImageUpload`（图片预览与裁剪配合 Viewer）。

**展示与工具**

- `WdPanel`、`WdTips`（长内容悬停提示）、`WdViewer`（图片 / PDF / 文档预览，缩放旋转翻页）。

**工程与质量**

- Vite 库模式双产物：ESM（`index.esm.js`）+ UMD（`index.umd.js`，全局名 `WorkDesktop`）+ 全量 `.d.ts` + 汇总 `style.css`。
- TypeScript 全类型导出；文档站（组件示例 + 场景演示 + Playground）、Mock 服务。
- 测试体系：vitest + @vue/test-utils，基础设施单测 87 用例 + DataGrid/DataForm 集成 19 用例，基础库行覆盖率 98%。
- 中文内置文案，语义化版本与开源配置（MIT）。

[Unreleased]: https://github.com/wordyhuang/workdesktop-ai/compare/v1.1.1...HEAD
[1.1.1]: https://github.com/wordyhuang/workdesktop-ai/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/wordyhuang/workdesktop-ai/compare/v1.0.2...v1.1.0
[1.0.2]: https://github.com/wordyhuang/workdesktop-ai/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/wordyhuang/workdesktop-ai/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/wordyhuang/workdesktop-ai/releases/tag/v1.0.0
