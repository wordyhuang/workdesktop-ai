> 本文件由脚本自动生成，请勿手工编辑。全部组件索引、阅读约定与 Element Plus 透传规则见 [README.md](./README.md)。数据源 `docs/src/api-meta/`，重生成：`npm run gen:ai-api`。

# WdViewer Viewer 数据详情

el-descriptions 的二次封装：以只读描述列表展示一条数据的详情，支持配置 items 自动渲染字段；可直接配置 api + apiParam 自动请求详情数据并装载，也可通过 data 传入静态数据，支持插槽/render/formatter 自定义字段渲染。标题右侧自带「调整大小」（大/默认/小）与「显示字段」（勾选显隐、拖拽手柄排序、恢复默认，与 DataGrid 列设置一致）两个工具，自动启用无需配置

### 概述

WdViewer 是 el-descriptions 的二次封装：以只读描述列表展示一条数据的详情，支持配置 `items` 自动渲染字段；可直接配置 `api` + `apiParam` 自动请求详情数据并装载，也可通过 `data` 传入静态数据，支持插槽 / render / formatter 自定义字段渲染。标题右侧自带「调整大小」（大/默认/小）与「显示字段」（勾选显隐、拖拽手柄排序、恢复默认，与 DataGrid 列设置一致）两个工具，自动启用无需配置。

### 何时使用

- 详情页 / 抽屉 / 弹窗中展示单条记录（用户详情、订单详情、审批详情等）。
- 字段较多、需要声明式 `items` 配置驱动渲染的场景。
- 需要用户自行调整字段显隐、顺序、文字大小的只读查看场景。
- 提供 `#content` 插槽后也可做名片、档案卡等自由排版（脱离描述列表栅格）。
- 不建议：需要编辑数据——请使用 WdDataForm；WdViewer 是只读组件。
- 不建议：需要展示多条记录的列表——请使用 WdDataGrid。

### 注意事项

- **响应自动解包**：组件自动对 API 返回数据中的 `data` 解包，按 `items` 中各项的 `prop` 从 `data` 取值渲染，空值（null / undefined / 空字符串）显示 `-`。
- **data 优先于 api**：传入 `data` 后不再请求接口；`active` 仅在未传 `data` 时生效（源码 onMounted 与 apiParam watch 均带此判断）。
- **apiParam 变化自动重拉**：`active` 模式下 apiParam 变化（JSON 序列化对比）会自动重新请求，切换 id 类场景无需手动调用。
- **大小/字段工具自动启用**：无需配置；「调整大小」仅当前实例生效、不持久化；「显示字段」支持勾选显隐与拖拽排序，items 配置变化时保留用户已调整的显隐与顺序、新增字段自动追加。
- **#content 插槽是「全接管」模式**：提供后不再渲染描述列表与大小/字段工具，但仍自动装载 data/api 数据并以 `{ row, data }` 透传，无数据显示空态。
- **字段自定义渲染三种方式**：`{prop}-cell` 插槽（模板内最直观）、items 的 `slot`（指定插槽名）、`render` / `formatter`（纯配置）。

### 常见问题

**问：同时传了 data 和 api，会用哪个？**

用 `data`。data 优先级高于 api，传入后不再请求接口；active 自动请求也被抑制。

**问：字段值想格式化（如时间戳转日期）怎么办？**

在 items 该项配置 `formatter: (val, row) => string`；需要复杂渲染（标签、进度条）用 `# {prop}-cell` 插槽或 `render`。

**问：为什么配了 active 却不发请求？**

active 自动请求有两个前提：配置了 `api` 且未传 `data`。二者缺一不会发请求；也可以直接调用 `requestApi()` 手动请求。

**问：「显示字段」的调整会保存吗？刷新页面后还在吗？**

不会持久化。字段显隐/排序与文字大小均仅当前实例生效，组件重建后恢复 items 配置顺序。

### Element Plus 透传

- 透传目标：`el-descriptions（部分透传）`
- 说明：仅 items 配置驱动的描述列表模式把 $attrs 透传给 el-descriptions；使用 content 默认插槽的自定义模式不透传。el-descriptions-item 由组件按 items 生成，不接受外部透传。

### Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| title | `string` | '' | 标题（透传 el-descriptions title）；标题栏右侧自带大小/字段工具按钮 |
| column | `number \| object` | 3 | 一行展示的字段数量（透传 el-descriptions column，支持响应式对象） |
| border | `boolean` | true | 是否显示边框 |
| size | `'large' \| 'default' \| 'small'` | 'default' | 初始尺寸；用户可通过标题栏「调整大小」切换（仅当前实例生效，不持久化） |
| labelStyle | `object` | { width:'100px', textAlign:'right' } | 标签单元格自定义样式 |
| contentStyle | `object` | — | 内容单元格自定义样式 |
| api | `string` | '' | 详情数据接口地址 |
| apiMethod | `'get' \| 'post' \| 'put' \| 'delete'` | 'get' | 详情请求方法 |
| apiParam | `object` | {} | 详情请求参数（如 { id }），变化时 active 模式自动重新请求 |
| active | `boolean` | false | 挂载后自动请求详情（未传 data 时生效） |
| data | `object` | — | 静态数据对象，优先级高于 api（传入后不再请求接口） |
| items | `ViewerItem[]` | [] | 字段配置：{ prop, label, span, width, align, labelAlign, slot, render, formatter } |
| emptyText | `string` | '暂无数据' | 无数据时的空状态文案 |

### Events

| 事件名 | 回调参数 | 说明 |
| --- | --- | --- |
| load-success | { data } | 详情加载成功 |
| load-fail | { code, message } | 详情业务失败 |
| apiBefore | { url, param } | 请求前 |
| apiSuccess | { data, raw } | 请求成功 |
| apiFail | { code, message } | 业务失败 |
| apiException | { error, message } | 网络异常 |
| apiAfter | { url } | 请求完成 |

### Slots

| 插槽 | 容器 id | 插槽参数 | 说明 |
| --- | --- | --- | --- |
| default | — | — | 追加额外的 el-descriptions-item（与 items 配置并存） |
| content | — | { row, data } | 整体内容插槽：提供后完全接管内容布局（脱离描述列表栅格，自由排版），不再渲染描述列表与大小/字段工具；仍自动装载 data/api 数据并透传，无数据显示空态 |
| {prop}-cell | — | { row, value } | 自定义某个字段的内容渲染（如 #status-cell="{ row }"，描述列表模式） |
| empty | — | — | 无数据时的空状态内容 |

### 暴露方法（通过 ref 调用）

| 方法 | 参数 | 返回值 | 说明 |
| --- | --- | --- | --- |
| requestApi(extraParam?) | object? | Promise | 手动请求详情数据（可合并临时参数），成功后自动装载 |
| getData() | — | object | 获取当前装载的详情数据 |
| resetData() | — | void | 清空当前数据 |

### 数据类型

#### ViewerItem（字段配置项）

引用：`items` prop（`ViewerItem[]`）

| 字段 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| prop | string | 是 | — | 取值字段名（无 prop 的项会被过滤） |
| label | string | 是 | — | 字段标签 |
| span | number | 否 | — | 占据列数（透传 el-descriptions-item span） |
| width | string \| number | 否 | — | 单元格宽度 |
| align | 'left' \| 'center' \| 'right' | 否 | — | 内容对齐 |
| labelAlign | 'left' \| 'center' \| 'right' | 否 | — | 标签对齐 |
| slot | string | 否 | — | 自定义渲染插槽名 |
| render | any | 否 | — | 自定义渲染（渲染函数 / 组件） |
| formatter | (val: any, row: any) => string | 否 | — | 展示格式化 |
| type | 'text' \| 'tag' \| 'time' \| 'status' \| 'image' \| 'copy' | 否 | 'text' | 渲染类型：文本 / 标签 / 时间 / 状态标签 / 图片 / 可复制文本 |
| tagColors | Record<string, string> | 否 | — | type='tag' / 'status' 时「值 → el-tag 类型 / 颜色」映射 |
| timeFormat | string | 否 | — | type='time' 时的时间格式字符串 |
| imageSize | number | 否 | — | type='image' 时的图片边长（像素） |
