> 本文件由脚本自动生成，请勿手工编辑。全部组件索引、阅读约定与 Element Plus 透传规则见 [README.md](./README.md)。数据源 `docs/src/api-meta/`，重生成：`npm run gen:ai-api`。

# WdEditableGrid EditableGrid 可编辑数据表格

DataGrid 的可编辑版本：完整继承 DataGrid 全部能力（API/静态双数据源、分页、工具栏、卡片模式、动态列、行合并、树形、多选、SearchPanel 联动），并增加 columns 配置驱动的单元格/行双编辑模式、脏行与已修改单元格样式、ElForm 风格 rules 单元格校验与保存中断、批量保存、新增/删除行

### 概述

WdEditableGrid 是 DataGrid 的可编辑版本：完整继承 DataGrid 全部能力（API/静态双数据源、分页、工具栏、卡片模式、动态列、行合并、树形、多选、SearchPanel 联动），并在此基础上增加由 `columns` 配置驱动的单元格/行双编辑模式。它内置脏行与已修改单元格样式标记、与 ElForm 完全一致的 rules 单元格校验（保存时中断并提示）、批量保存、新增/删除行，适合需要在表格内直接维护多行数据的场景。

### 何时使用

- 多行数据的批量录入/编辑（如任务清单、明细行、台账维护）。
- 需要单元格级校验（必填、长度、数值范围、自定义规则）并在保存时拦截。
- 编辑结果需要批量提交（`saveApi` 一次提交所有脏行）。
- 接口分页列表同时要求行内编辑（继承 DataGrid 的 api/分页/联动能力）。
- 不建议：纯只读列表展示：请使用 WdDataGrid（更轻量）。
- 不建议：单条数据的表单式新增/编辑：请使用 WdDataForm。

### 注意事项

- **静态数据推荐 `v-model` + 关闭分页**：本地静态数据不参与分页，建议 `:with-pager="false"`，否则分页条会对静态数据产生误导。
- **静态数据为深拷贝同步**：组件内部对静态数据做深拷贝，编辑过程不直接污染外部数据，仅在保存/同步时回写 `v-model`。因此外部在编辑中途读取 `v-model` 拿到的仍是旧值，需要实时值请用 `getDirtyRows()` 或监听 `change`。
- **脏行机制要点**：新增行始终算脏行，即使把值改回基线也仍为脏；已有行改回原值会自动取消该单元格的脏标记；`validate()` 与 `saveAll()` 只针对脏行执行校验与提交，未修改的行不会被校验也不会被提交。
- **翻页会清空编辑态**：接口模式下翻页（`onChangeCurrentpage` / `onChangePagesize`）会丢弃当前页未保存的编辑内容。如需保留，请先调用 `saveAll()` 或 `getDirtyRows()` 取出脏行暂存。
- **editor 编辑器类型**：`EditableColumn.editor` 支持 `input` / `number` / `select` / `date`，缺省为 `input`；`select` 需配 `options`，`number` 可配 `min` / `max` / `precision`。内置编辑器不满足时用 `edit-{prop}` 插槽自定义。
- **校验三层优先级**：`rules`（async-validator 规则，与 ElForm 完全一致）、`required`、`validator`（自定义函数）可叠加使用；校验失败的单元格会显示约束样式，保存/行内保存会中断并通过 `ElMessage` 提示，同时抛出 `validate-fail` 事件（`column` 为失败单元格所在列的 prop）。
- **接口模式保存成功后刷新当前页**：配了 `saveApi` 的批量保存成功后，组件会自动重新请求当前页数据，保证服务端计算字段（如更新时间）回显一致。
- **`EditableColumn` 完整字段**：`prop` / `label` / `width` / `minWidth` / `align` / `fixed` / `editor` / `editable` / `placeholder` / `options` / `min` / `max` / `precision` / `required` / `validator` / `rules` / `formatter`。其中 `editable: false` 可将某列降级为只读展示列，配合 `formatter` 格式化显示。

### 常见问题

**问：点击「批量保存」提示没有需要保存的数据？**

`saveAll()` 只提交脏行（被修改过的行 + 新增行）。如果没有编辑任何单元格，或修改后又改回原值（已有行会自动取消脏标记），脏行集合为空，组件会提示并直接返回，不会发起请求。

**问：为什么编辑过程中外部 `v-model` 的数据没有变化？**

静态数据模式下组件内部持有深拷贝，编辑不直接污染外部数据，只有保存/同步时才回写 `v-model`。需要拿到编辑中的实时数据，请调用 `getDirtyRows()` 或监听 `change` 事件。

**问：行内（row）模式和单元格（cell）模式怎么选？**

`edit-mode="cell"`（默认）点击单个单元格即进入编辑，适合零星修改；`edit-mode="row"` 通过操作列的「编辑/保存/取消」整行切换编辑态，适合一次改一行的多个字段。新增行在 row 模式下会直接进入编辑状态。

**问：如何让某一列只能看不能改？**

在该列的 `EditableColumn` 配置中设置 `editable: false`，该列即降级为只读展示列；需要格式化显示可配合 `formatter`。

### Element Plus 透传

- 透传目标：`—（不透传）`
- 说明：厚封装组件：内部 el-table / el-pagination / 编辑控件均未绑定 $attrs，el-table 的属性与事件不可直接使用，请改用本文档的 columns（含 editConfig）配置与 Events。

### Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| columns | `EditableColumn[]` | [] | 可编辑列配置（prop/label/editor/options/min/max/required/validator/rules/formatter 等；rules 为与 ElForm 完全一致的 async-validator 规则，配合单元格约束样式与保存中断） |
| modelValue | `object[]` | [] | 行数据（v-model，静态数据推荐用法） |
| editMode | `'cell' \| 'row'` | 'cell' | 编辑模式：cell 点击单元格编辑；row 行内编辑/保存/取消 |
| saveApi | `string` | '' | 批量保存地址；为空仅本地提交并 emit save |
| saveMethod | `'post' \| 'put'` | 'post' | 保存请求方法 |
| defaultRow | `object \| () => object` | — | 新增行默认值（对象或工厂函数） |
| withToolbar | `boolean` | true | 显示工具栏（新增/批量保存/工具按钮） |
| withAdd | `boolean` | true | 新增按钮 |
| withSave | `boolean` | true | 批量保存按钮 |
| withDelete | `boolean` | true | 行内删除按钮 |
| withActions | `boolean` | true | 可编辑操作列（编辑/保存/取消/删除） |
| addButtonText | `string` | '新增一行' | 新增按钮文案 |
| saveButtonText | `string` | '批量保存' | 保存按钮文案 |
| actionWidth | `string \| number` | 150 | 可编辑操作列宽度 |
| api | `string` | '' | 列表接口地址（与 dataSource/modelValue 二选一） |
| apiMethod | `'get' \| 'post' \| 'put' \| 'delete'` | 'post' | 列表请求方法 |
| apiParam | `object` | {} | 固定请求参数（并入搜索条件 param） |
| active | `boolean` | false | 挂载后自动请求第一页 |
| dataSource | `array` | — | 静态数据数组；不传时回退 modelValue |
| withPager | `boolean` | true | 显示分页（本地静态数据不分页，建议关闭） |
| pagerStyle | `'simple' \| 'normal' \| 'full'` | 'normal' | 分页档位 |
| withSearch | `boolean` | false | 参与 SearchPanel 联动搜索（filter 分组） |
| modeSwitch | `boolean` | false | 启用表格/卡片模式切换 |
| dynamicColumn | `boolean` | false | 启用列设置（隐藏/排序/持久化，覆盖配置列与插槽列） |
| columnStorageKey | `string` | '' | 列设置与尺寸持久化 key（localStorage） |
| border | `boolean` | true | 表格边框 |
| stripe | `boolean` | true | 斑马纹 |
| autoHeight | `boolean` | false | 高度自适应撑满容器 |
| height | `'fix' \| string \| number` | — | 高度模式：缺省内容自适应；'fix' 贴合最近定高/可滚动祖先容器；数字/CSS 长度作固定表格高度 |
| rowKey | `string` | 'id' | 行主键（树形/多选必备） |
| tableSize | `'large' \| 'default' \| 'small'` | 'default' | 表格尺寸（可被工具栏尺寸切换覆盖并持久化） |
| withIndex | `boolean` | false | 序号列（翻页连续） |
| withSelection | `boolean` | false | 多选列 |
| rowspanKey | `string` | '' | 行合并分组字段 |
| rowspanColumn | `string[]` | [] | 参与合并的列 prop |
| treeProps | `object` | { children:'children' } | 树形数据字段映射 |
| defaultExpandAll | `boolean` | false | 树默认展开全部 |
| tools | `object` | {} | 工具栏开关 { refresh（默认 true）, size, columnSetting, modeSwitch } |
| rowActions | `array` | [] | 内置只读操作列：[{ text, command?, type? }]，点击 emit row-action（与可编辑操作列并存） |
| headRefreshDatagrid | `boolean \| string` | false | 保存成功后刷新目标 DataGrid（联动） |
| filter | `string` | '' | 联动分组标识（SearchPanel / refreshDataGrid） |

### Events

| 事件名 | 回调参数 | 说明 |
| --- | --- | --- |
| update:modelValue | rows | 行数据变化（新增/删除/保存时同步） |
| change | rows | 任意编辑触发 |
| save | { rows, all, data? } | 批量保存成功 |
| row-add | row | 新增行 |
| row-remove | index | 删除行 |
| validate-fail | { index, row, column, error } | 校验失败（column 为所在列 prop；保存/行内保存会中断并 ElMessage 提示） |
| row-action | { row, command, text } | 只读操作列按钮触发 |
| page-change | { currentPage, pageSize } | 分页变化 |
| selection-change | rows | 多选变化 |
| mode-change | 'table' \| 'card' | 视图模式切换 |
| loaded | { list, total } | 数据加载完成 |
| apiBefore | { url, rows } | 保存/请求前 |
| apiSuccess | { data } | 保存成功 |
| apiFail | { code, message } | 保存失败 |
| apiException | { error, message } | 请求异常 |
| apiAfter | — | 请求完成 |

### Slots

| 插槽 | 容器 id | 插槽参数 | 说明 |
| --- | --- | --- | --- |
| default | — | — | 额外 el-table-column 业务列（与 columns 配置列并存，受动态列设置控制） |
| toolbar | — | { dirtyRows, rows, selection } | 工具栏左侧（覆盖内置新增按钮） |
| actions | — | { dirtyRows, rows, selection } | 工具栏右侧（批量保存按钮之后） |
| edit-{prop} | — | { row, index, column } | 自定义某列编辑器 |
| row-actions | — | { row, index } | 可编辑操作列追加按钮 |
| empty | — | — | 空数据 |
| card-item | — | { row, index } | 卡片模式单项 |

### 暴露方法（通过 ref 调用）

| 方法 | 参数 | 返回值 | 说明 |
| --- | --- | --- | --- |
| saveAll() | — | Promise | 校验全部脏行并批量保存（配 saveApi 走请求，否则仅 emit save）；无脏行时提示并返回 |
| validate() | — | Promise<boolean> | 校验所有脏行的 rules / required / validator，全部通过返回 true（失败行 emit validate-fail，单元格显示约束样式） |
| addRow() | — | void | 末尾新增一行（取 defaultRow 初值，自动进入脏行集合；row 模式直接进入编辑） |
| getDirtyRows() | — | rows: object[] | 获取当前所有被修改、未保存的脏行数据 |
| requestApi(options?) | { apiParam?: object } | Promise | 按（可选）临时参数请求数据；静态模式直接返回 |
| refresh() | — | Promise | 刷新：接口模式重新请求当前页；静态模式重置为外部数据并清空编辑态 |
| search(params?) | params?: object | Promise | 带搜索条件查询：合并参数、重置到第一页（SearchPanel 联动底层方法） |
| resetSearch() | — | Promise | 清空搜索条件、回到第一页并重新加载 |
| getSelection() | — | rows: any[] | 获取当前多选选中的行 |
| clearSelection() | — | void | 清空多选选中状态 |
| onChangeCurrentpage(page) | page: number | void | 跳转到指定页（翻页会清空编辑态） |
| onChangePagesize(size) | size: number | void | 改变每页条数并回到第一页 |
| tableRef | — | ElTable 实例（属性） | 内部 el-table 引用，逃生舱：可调用 el-table 原生方法（如 toggleRowSelection） |

### 数据类型

#### EditableColumn（可编辑列配置）

引用：`columns` prop（`EditableColumn[]`）

| 字段 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| prop | string | 是 | — | 字段名 |
| label | string | 是 | — | 列标题 |
| width | string \| number | 否 | — | 列宽 |
| minWidth | string \| number | 否 | — | 最小列宽 |
| align | 'left' \| 'center' \| 'right' | 否 | — | 对齐方式 |
| fixed | boolean \| 'left' \| 'right' | 否 | — | 固定列 |
| editor | 'input' \| 'number' \| 'select' \| 'date' | 否 | 'input' | 编辑器类型 |
| editable | boolean | 否 | true | 该列是否可编辑 |
| placeholder | string | 否 | — | 编辑器占位文案 |
| options | { text: string; value: any }[] | 否 | — | editor='select' 时的选项 |
| min | number | 否 | — | editor='number' 时的最小值 |
| max | number | 否 | — | editor='number' 时的最大值 |
| precision | number | 否 | — | editor='number' 时的数值精度 |
| required | boolean | 否 | false | 必填校验 |
| validator | (value: any, row: Record<string, any>) => string \| undefined | 否 | — | 自定义校验：返回错误文案，空串 / undefined 为通过 |
| rules | Array<Record<string, any>> | 否 | — | 单元格校验规则（与 ElForm 的 rules 完全一致，基于 async-validator）；不满足时显示约束样式，保存 / 行内保存时中断并提示 |
| formatter | (row: Record<string, any>, col: EditableColumn) => string | 否 | — | 只读态展示格式化 |

#### tools / rowActions / treeProps

引用：`tools` / `rowActions` / `treeProps` props

三个 prop 的对象结构与 WdDataGrid 完全一致（`tools` 工具栏开关、`rowActions` 只读操作列、`treeProps` 树形字段映射），字段说明见 DataGrid 组件页的「数据类型」章节。
