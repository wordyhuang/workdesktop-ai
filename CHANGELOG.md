# Changelog

本项目遵循 [Semantic Versioning](https://semver.org/lang/zh-CN/)。

## [Unreleased]

### Changed

- `WdDialog` 合并进 `WdDrawer`：容器组件统一为一个，通过 `mode="drawer" | "dialog"` 切换（默认 `drawer`）；`size` 同时作用于抽屉尺寸与对话框宽度，`direction` 仅抽屉模式生效，`filter` / `headRefreshDatagrid` / 事件 / 插槽保持不变。容器组件由 `WdDialog` / `WdDrawer` 两个合并为一个 `WdDrawer`（组件总数 -1）。
- `WdEditableTable`（`<wd-editable-table>`）重命名为 `WdEditableGrid`（`<wd-editable-grid>`），目录 `data/editable-table` → `data/editable-grid`。
- `WdDialogButton`（`<wd-dialog-button>`）合并进 `WdDrawerButton`（`<wd-drawer-button>`）：二者仅弹层形式不同，现统一为一个按钮组件，通过 `mode="drawer" | "dialog"` 切换（默认 `drawer`），属性同步统一命名——`drawerTitle`/`dialogTitle` → `title`，`drawerUrl`/`dialogUrl` → `url`，`drawerData`/`dialogData` → `data`；`size`、`direction`（仅抽屉生效）、`filter`、`headRefreshDatagrid`、事件与插槽保持不变。组件总数由 25 调整为 24，按钮组由 7 个调整为 6 个。
- 按钮组文案属性 `text` 改名为 `label`（破坏性）：六个按钮组件（`WdApiButton` / `WdConfirmButton` / `WdPromptButton` / `WdRouteButton` / `WdTipsButton` / `WdDrawerButton`）的「按钮文案」属性由 `text` 统一改为 `label`，释放 `text` 给 el-button 原生「文字按钮」布尔语义（经 `$attrs` 透传，原声明截获已移除，`text` 不再作为 String 文案）。调用方需将 `text="文案"` 迁移为 `label="文案"`；el-button 的其它原生属性（`type` / `size` / `plain` / `round` / `circle` / `link` / `disabled` / `icon` / `native-type` 等）继续经 `$attrs` 透传支持，并在各按钮组件文档 Props 表中按「继承自 el-button」逐条列明（API 请求类按钮因内部已绑定 `:loading` 由 `buttonLoading` 控制，不列 `loading`；Route/Tips/Drawer 类含 `loading`）。
- **所有按钮组件均已集成语悬停提示**：和 TipsButton 一样，每个按钮组件都支持 `tips`（提示内容）、`tipsType`（主题）、`placement`（位置）三个属性；当 `tips` 非空时自动用 `el-tooltip` 包裹，无提示则不包裹；现在所有按钮都可按需添加悬停提示，无需额外套一层 tooltip。
- **PromptButton 自定义内容插槽**：新增 `#content` 插槽允许开发者自定义弹窗内容（示例中展示了嵌入 `WdDataForm` 实现多字段输入表单）；点击确认后默认发起 API 请求，仅当 API 返回包 `success=true` 时自动关闭弹窗，API 请求失败时不关闭弹窗，允许开发者修改错误后重试。新增 `confirm` 事件（自定义内容模式点击确认触发）。
- **文档站 mock 改为 HTTP 层（请求真实可见）**：`docs/src/mock` 新增 `createMockHttpHandler`，由 `docs/vite.config.ts` 新增 `wd-mock-server` 插件在 dev server 中间件层拦截 `/mock/*` 返回假数据。开发模式下 `/mock/xxx` 请求**真实发出**（浏览器 Network 面板可见请求 URL、方法、参数与响应），示例数据不受影响；`docs/src/main.ts` 移除 axios adapter 短路（生产构建 `import.meta.env.PROD` 时回退 `createMockAdapter`，保证静态部署后示例仍可演示）。

### Removed

- 移除 `WdDialog` 容器组件及其导出，请改用 `WdDrawer` 并设置 `mode="dialog"`。
- 移除 `WdDialogButton` 组件及其导出，请改用 `WdDrawerButton` 并设置 `mode="dialog"`。

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
- **`WdPopconfirmButton`（`<wd-popconfirm-button>`）新增组件**：基于 ApiButton 请求逻辑与 el-popconfirm 气泡确认封装——点击按钮弹出气泡确认，用户点击「确定」后自动请求 API（loading、成功/失败提示、`apiSuccess` 事件与声明式 DataGrid 刷新均复用按钮组请求链路）。集成属性：el-button 全属性（`$attrs` 透传，文档列明）、TipsButton 悬停提示（`tips`/`tipsType`/`placement`）、el-popconfirm 常用属性（`title`、`confirmButtonText`、`cancelButtonText`、`confirmButtonType`、`cancelButtonType`、`width`、`trigger`、`popperClass`、`teleported` 等；其中 `icon`→`popIcon`、`disabled`→`popDisabled` 以避免与 el-button 同名透传冲突）。事件：`click`/`confirm`/`cancel`/`show`/`hide` + 请求事件 `apiBefore`/`apiSuccess`/`apiFail`/`apiException`/`apiAfter`。**同时支持悬停提示**：el-tooltip 与 el-popconfirm 采用平级 `virtual-ref` 方案（均以 `virtual-ref` 指向同一按钮，互不嵌套），hover 显示提示、click 弹出确认，两者互不冲突、控制台零警告（嵌套方案会触发 EP `[ElOnlyChild]` / runtime directive 警告且外层弹层事件失效）。组件总数 26→27，按钮组 7→8（文档新增 popconfirm-button 页与示例）。

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
- **`WdStation`（`<wd-station>`）新增组件**：中后台外框架组件，一个组件产出「logo + 分导台 + 菜单 + 内容区 + 工具栏 + 底部信息栏」完整骨架。顶栏中央二选一（`headerMode`）：流式块状菜单分组切换条（分导台，点击后左侧菜单整体更换）或标题文案；统一菜单模型——优先 `menuGroups`（分组+菜单树），也接受扁平 `menus` 按 `groupKey||group` 自动聚合归一（无组归「默认」组、分导台自动隐藏），数组/对象属性均接受 JSON 字符串入参（UMD/HTML 场景降级）；菜单三态 `menuMode`（side 左侧多层建议两层 / top 顶部 / none 不启用），折叠按钮固定分导台最左侧、侧栏收缩 logo 跟随收窄；内容区 `contentMode`（page 单页 / tabs 标签页，affix 固定标签、关闭跳相邻、`v-model:open-tabs` 受控）× `routerMode`（auto 检测 `$router` 自动走 router push + RouterView，否则降级 HTML 仅抛事件）；工具栏 refresh/settings/user/login 四点位经 `toolbarConfig` 各自调 left/right/none；底部 `copyright` + `footerInfo`（`v-model:footer-info`）动态信息。新增 `lib/core/station-linkage` 注册中心，命令式导出 `registerStation` / `setStationFooter(target, info)` / `refreshStationView(target)`（target 语义复用联动心智：true 同 filter 组、字符串定向组）。暴露 `refresh()` / `openTab(item)` / `closeTab(key)`。组件总数 27→28（新增 layout 布局组），ESM 按需子入口 26→27（`workdesktop-ai/station`），文档站新增「布局组件」分组与 6 个示例，集成测试 21 用例。
- `WdStation` 顶栏中央区由居中改为**左对齐**：左位/右位按内容宽度收缩，中央区 `flex:1` 占满剩余空间，分导台块状项 / 标题文案从左侧起排。
- `WdStation` tabs 条样式与交互增强：tabs 条整宽撑满内容列（el-tabs `flex:1`），消除 nav 左/上边框与 header 底线（底线由外层容器统一承担），tab 间保留分隔线；条最右侧新增下拉按钮，内置「关闭当前标签 / 关闭左侧标签 / 关闭其他标签 / 关闭所有标签」批量操作——`affix` 标签永不关闭，无可关对象时对应菜单项禁用，批量关闭逐个触发 `tab-close`，激活标签被关闭后跳转原位置相邻标签。集成测试扩为 22 用例。

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

[Unreleased]: https://github.com/wordyhuang/workdesktop-ai/compare/v1.0.2...HEAD
[1.0.2]: https://github.com/wordyhuang/workdesktop-ai/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/wordyhuang/workdesktop-ai/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/wordyhuang/workdesktop-ai/releases/tag/v1.0.0
