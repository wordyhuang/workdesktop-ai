> 本文件由脚本自动生成，请勿手工编辑。全部组件索引、阅读约定与 Element Plus 透传规则见 [README.md](./README.md)。数据源 `docs/src/api-meta/`，重生成：`npm run gen:ai-api`。

# WdDataGrid DataGrid 数据表格

旗舰组件：内部封装 el-table + el-pagination，支持 API/静态双数据源、分页搜索、工具栏、卡片模式切换、动态列、行合并、树形、多选

### 概述

WdDataGrid 是 WorkDesktop 组件库的旗舰组件，内部封装 el-table + el-pagination，面向中后台列表页提供开箱即用的完整能力。它支持 API / 静态双数据源、分页搜索、工具栏（刷新/尺寸/列设置/新增/导出）、表格与卡片模式切换、动态列（隐藏/排序/持久化）、行合并、树形数据与多选（含跨页选择「购物车」）。通过统一的 `filter` 联动分组标识，可与 SearchPanel、ApiButton 等组件零代码联动，是列表页的核心载体。

### 何时使用

- 标准列表页：接口分页加载 + 顶部搜索 + 工具栏操作（新增/导出/刷新）。
- 静态台账/报表：本地数组直接渲染，需要卡片模式切换或列设置持久化。
- 需要跨页累计多选的场景（跨页选择「购物车」）。
- 树形数据、行合并（rowspan）等复杂表格展示。
- 不建议：需要直接在表格内编辑单元格/行数据：请使用 WdEditableGrid。
- 不建议：单条数据的只读详情展示：请使用 WdViewer。

### 注意事项

- **数据源二选一**：`api`（接口分页）与 `dataSource`（静态数组）二选一；接口模式下组件自动对响应 `data` 解包分页对象 `{ list, total, pageSize, currentPage }`。
- **响应字段名可全局配置**：若后端返回的字段名不是 `list` / `total` / `pageSize` / `currentPage`，可通过全局配置 `response.list` 的 `listName` / `totalName` / `pageSizeName` / `currentPageName` 自定义。
- **`active` 默认 `false`**：仅设置 `api` 不会自动加载，需 `:active="true"`、SearchPanel 联动触发，或手动调用 `requestApi()` / `refresh()` / `search()`。
- **`rowKey` 必备场景**：树形数据、多选回显、跨页购物车都依赖 `rowKey`，建议接口模式始终配置。
- **跨页选择用「购物车」**：普通多选翻页后丢失，需要跨页累计勾选时开启 `withSelectionCart`，并配置 `cartRowKey`（缺省复用 `rowKey`）。
- **列设置持久化**：`dynamicColumn` 开启后，列显隐/排序与表格尺寸通过 `columnStorageKey` 写入 localStorage，多页面务必使用不同的 key 避免串数据。
- **`height="fix"` 的边界**：贴合最近一个有确定高度/可滚动的祖先容器（body 与 html 不视作边界），祖先无定高/滚动约束时退化为内容自适应；传数字或 CSS 长度则为固定表格高度。

### 常见问题

**问：设置了 `api` 但表格没有发起请求？**

`active` 默认为 `false`。设置 `:active="true"` 挂载后自动请求第一页，或由 SearchPanel 联动/手动调用 `requestApi()` 触发。

**问：后端返回的分页字段名不是 `list` / `total` 怎么办？**

无需改后端，通过全局配置 `response.list` 的 `listName` / `totalName` / `pageSizeName` / `currentPageName` 映射实际字段名。

**问：如何读取/回显多选选中项？**

使用 `v-model:model-value` 双向绑定；配合 `selectionKey`（如 `selection-key="id"`）时绑定值、selection-change、getSelection() 均返回该字段值数组，传值自动勾选、置空清空勾选。

**问：点击内置「新增」「导出」按钮没有反应？**

这两个按钮只 emit `add` / `export` 事件，不携带业务逻辑；请在事件回调中自行实现打开新增弹窗、发起文件下载等操作。

### Element Plus 透传

- 透传目标：`—（不透传）`
- 说明：厚封装组件：根节点为自研 div.wd-datagrid，内部 el-table / el-pagination 均未绑定 $attrs，el-table 的属性与事件（如 row-click、highlight-current-row）不可直接使用，请改用本文档的 columns/rowActions 配置与 Events。

### Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| api | `string` | '' | 列表接口地址 |
| apiMethod | `'get' \| 'post' \| 'put' \| 'delete'` | 'post' | 请求方法 |
| apiParam | `object` | {} | 固定请求参数（并入搜索条件 param） |
| active | `boolean` | false | 挂载后自动请求第一页 |
| dataSource | `array` | — | 静态数据数组（与 api 二选一） |
| withPager | `boolean` | true | 显示分页 |
| pagerStyle | `'simple' \| 'normal' \| 'full'` | 'normal' | 分页档位 |
| pagerPosition | `'left' \| 'center' \| 'right'` | 全局配置 page.pager.position（'right'） | 分页在底栏的水平位置；缺省走全局配置，prop 优先 |
| modeSwitch | `boolean` | false | 启用表格/列表清单（卡片）模式切换；切换按钮需配合 card-item 插槽才渲染 |
| modeSwitchType | `'icon' \| 'tab'` | 'icon' | 模式切换控件形态：icon 图标按钮（默认）/ tab 分段按钮（点击直切对应视图） |
| tableText | `string` | '表格' | tab 形态下「表格」段文字 |
| cardText | `string` | '列表' | tab 形态下「列表」段文字 |
| dynamicColumn | `boolean` | false | 启用列设置（隐藏/排序/持久化） |
| columnStorageKey | `string` | '' | 列设置与尺寸持久化 key（localStorage） |
| border | `boolean` | false | 表格边框 |
| stripe | `boolean` | false | 斑马纹 |
| autoHeight | `boolean` | false | 高度自适应撑满容器 |
| height | `'fix' \| string \| number` | — | 高度模式：缺省内容自适应；'fix' 贴合最近一个有确定高度/可滚动的祖先容器（顶部取自身位置、底部贴容器内容区底，数据超出在行区内滚动、表头固定；祖先无定高/滚动约束时退化为内容自适应）；数字/CSS 长度（如 520、'480px'）作固定表格高度 |
| rowKey | `string` | '' | 行主键（树形/多选必备） |
| tableSize | `'large' \| 'default' \| 'small'` | 'default' | 表格尺寸 |
| withIndex | `boolean` | true | 序号列（翻页连续） |
| withSelection | `boolean` | false | 多选列 |
| batchBar | `boolean` | false | 批量操作条：开启后，勾选任意行即在表格底部浮出一条悬浮操作条，未勾选时自动隐藏；插槽 #batch-bar 暴露 selectedRows（当前选中行）与 clearSelection（清空选中），用于「先勾选、再批量通过/驳回/删除」的轻量批量场景 |
| modelValue | `array` | [] | 选中项 v-model 双向绑定：读取当前勾选行（withSelection 开启时）；设置（传值）自动勾选对应行、置空清空勾选（与 selectionKey 配合返回该字段值数组） |
| selectionKey | `string` | '' | 选中项取值字段：默认返回完整行对象数组；设置后 modelValue/selection-change/getSelection() 返回该字段值数组（如 selectionKey="id" → [1,2]） |
| withSelectionCart | `boolean` | false | 跨页选择「购物车」：表格右上方出现收集按钮（实时显示暂存数量），勾选行跨页累计、翻页/搜索/刷新不清空、翻回所在页自动回勾；点击按钮弹出查看面板 |
| cartRowKey | `string` | '' | 购物车去重/自动回勾唯一键字段，缺省复用 rowKey，均未配置时退化为按行对象引用比较 |
| cartConfig | `object` | { type:'dialog', title:'已选数据', buttonText:'', size:560, showClear:true, showRemove:true } | 购物车按钮与查看面板配置：type（dialog/drawer）、title（支持 {count} 占位）、buttonText（非空时按钮显示文案）、size（面板宽）、showClear/showRemove |
| rowspanKey | `string` | '' | 行合并分组字段 |
| rowspanColumn | `string[]` | [] | 参与合并的列 prop |
| treeProps | `object` | { children:'children' } | 树形数据字段映射 |
| defaultExpandAll | `boolean` | false | 树默认展开全部 |
| tools | `object` | {} | 工具栏开关 { refresh, size, columnSetting, modeSwitch, add, export, mode, buttonSize }；add/export 开启内置「新增/导出」业务按钮（点击 emit add / export）；mode 为工具按钮形态：'round' 圆角（默认）/ 'square' 方角 / 'group' 按钮组；buttonSize 为按钮尺寸：'large' / 'default'（默认）/ 'small'，与 el-button 一致 |
| toolsPosition | `'left' \| 'right' \| 'bottom'` | 'right' | 内置工具按钮组（刷新/大小/模式切换/列设置/购物车）位置；bottom 时渲染到底部，与分页同一行 |
| toolbarPosition | `'left' \| 'right' \| 'bottom'` | 'left' | 自定义工具栏（toolbar 插槽 + 新增/导出按钮）位置；bottom 时渲染到底部，与分页同一行 |
| rowActions | `array` | [] | 内置操作列：[{ text, command?, type? }]，点击 emit row-action |
| filter | `string` | '' | 联动分组标识 |

### Events

| 事件名 | 回调参数 | 说明 |
| --- | --- | --- |
| add | — | 点击内置「新增」按钮 |
| export | — | 点击内置「导出」按钮 |
| row-action | { row, command } | 行内操作触发 |
| page-change | { currentPage, pageSize } | 分页变化 |
| selection-change | rows | 多选变化（设置 selectionKey 时返回该字段值数组） |
| mode-change | 'table' \| 'card' | 视图模式切换 |
| loaded | { list, total } | 数据加载完成 |
| apiBefore | { url, method, params } | 请求前 |
| apiAfter | — | 请求完成 |
| cart-change | cartList: any[] | 购物车暂存变化（参数为跨页累计、已去重的数组） |
| update:modelValue | rows \| keys | 选中项双向绑定更新（v-model:model-value） |

### Slots

| 插槽 | 容器 id | 插槽参数 | 说明 |
| --- | --- | --- | --- |
| default | — | — | el-table-column 集合（业务列） |
| toolbar | — | { selection, list } | 左区补充按钮：渲染在内置「新增/导出」的最左侧 |
| batch-bar | — | { selectedRows, clearSelection } | 批量操作条内容：开启 batchBar 且有勾选行时浮出。selectedRows 为当前选中行数组（勾选即更新）；clearSelection() 调用后清空勾选并隐藏操作条 |
| empty | — | — | 空数据插槽 |
| card-item | — | { row, index } | 卡片模式单项 |
| cart-content | — | { list, remove, clear } | 购物车面板主体自定义（list 为暂存数组；remove(row)/clear() 逐条移除/一键清空），默认内容为逐条列表 + 移除按钮 |

### 暴露方法（通过 ref 调用）

| 方法 | 参数 | 返回值 | 说明 |
| --- | --- | --- | --- |
| requestApi(options?) | { apiParam?: object } | Promise | 按（可选）临时参数请求数据；不传则按当前条件加载 |
| refresh() | — | Promise | 刷新当前页（沿用上次查询条件与页码） |
| search(params?) | params?: object | Promise | 带搜索条件查询：合并参数、重置到第一页（SearchPanel 联动底层方法，也可手动调用） |
| resetSearch() | — | Promise | 清空搜索条件、回到第一页并重新加载 |
| getSelection() | — | rows: any[] | 获取当前多选选中的行（设置 selectionKey 时返回该字段值数组） |
| clearSelection() | — | void | 清空多选选中状态 |
| getCartList() | — | cartList: any[] | 获取购物车暂存数组（跨页累计、已去重） |
| clearCart() | — | void | 清空购物车暂存（计数归零、面板同步、当前页勾选一并清空） |
| onChangeCurrentpage(page) | page: number | void | 跳转到指定页（通常由分页器自动触发） |
| onChangePagesize(size) | size: number | void | 改变每页条数并回到第一页（通常由分页器自动触发） |
| tableRef | — | ElTable 实例（属性） | 内部 el-table 引用，逃生舱：可调用 el-table 原生方法（如 toggleRowSelection） |

### 数据类型

#### tools（工具栏开关对象）

引用：`tools` prop

| 字段 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| refresh | boolean | 否 | false | 显示「刷新」按钮 |
| columnSetting | boolean | 否 | false | 显示「列设置」按钮（需配合 dynamicColumn） |
| modeSwitch | boolean | 否 | false | 显示「表格 / 卡片切换」按钮（需配合 modeSwitch prop） |
| size | boolean | 否 | false | 显示「尺寸切换」按钮 |
| add | boolean | 否 | false | 显示内置「新增」按钮（点击 emit add） |
| export | boolean | 否 | false | 显示内置「导出」按钮（点击 emit export） |
| mode | 'round' \| 'square' \| 'group' | 否 | 'round' | 工具按钮形态：圆角 / 方角 / 按钮组 |
| buttonSize | 'large' \| 'default' \| 'small' | 否 | 'default' | 工具按钮尺寸，与 el-button 一致 |

#### cartConfig（购物车配置对象）

引用：`cartConfig` prop（`withSelectionCart` 开启时生效）

| 字段 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| type | 'dialog' \| 'drawer' | 否 | 'dialog' | 查看面板呈现方式 |
| title | string | 否 | '已选数据' | 面板标题（支持 {count} 占位） |
| buttonText | string | 否 | '' | 非空时购物车按钮显示文案 |
| size | number \| string | 否 | 560 | 面板宽度（像素或 CSS 长度） |
| showClear | boolean | 否 | true | 显示「一键清空」 |
| showRemove | boolean | 否 | true | 显示逐条「移除」 |

#### RowAction（rowActions 数组元素）

引用：`rowActions` prop（内置操作列配置）

| 字段 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| text | string | 是 | — | 按钮文案 |
| command | string | 否 | — | 点击时随 row-action 事件抛出的命令标识 |
| type | string | 否 | — | el-button 类型（如 primary / danger） |

#### treeProps（树形字段映射）

引用：`treeProps` prop

| 字段 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| children | string | 否 | 'children' | 子节点字段名 |
| hasChildren | string | 否 | 'hasChildren' | 「是否含子节点」字段名（懒加载场景） |
