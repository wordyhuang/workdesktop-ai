> 本文件由脚本自动生成，请勿手工编辑。全部组件索引、阅读约定与 Element Plus 透传规则见 [README.md](./README.md)。数据源 `docs/src/api-meta/`，重生成：`npm run gen:ai-api`。

# WdSearchPanel SearchPanel 搜索表单面板

本质是一个完整表单，搜索条件分两行布局：第一行默认搜索项 + 右侧操作按钮（横排一行不换行），第二行 more 插槽承载的隐藏项目在「展开」时作为整行平顺滑出/收起；所有搜索项都在同一个 el-form 作用域内；第一行布局不受第二行展开/收起影响；子项可以用 WdSearchItem / WdFormItem / el-form-item；声明式联动同 filter 组 DataGrid（查询重置到第一页、异组不刷新）

### 概述

WdSearchPanel 是列表页顶部的搜索表单容器：内部基于 `el-form`（inline 布局）承载若干搜索项，右侧内置「搜索 / 重置」操作列；当搜索条件较多时，可将不常用条件放入 `more` 插槽，点击「展开」时作为独立第二行整行滑出，不改变默认搜索区布局。组件通过 `filter` 分组标识与 `head-refresh-datagrid` 属性，可在搜索、重置后自动刷新同组的 WdDataGrid，是「搜索 + 表格」列表页的标准组合件。

### 何时使用

- 列表页顶部需要一组查询条件，并配套「搜索 / 重置」按钮时。
- 查询条件较多，希望常用条件默认可见、其余条件折叠到「展开」区域时。
- 需要搜索/重置后自动刷新同页 DataGrid（通过 `filter` 分组联动）时。
- 不建议：页面只有 1 个输入框、无任何操作按钮诉求的简单场景，直接使用 `el-input` 更轻量。
- 不建议：新增/编辑类表单，应使用 WdDataForm 或 `el-form` 而非搜索面板。

### 注意事项

- 插槽通过作用域参数 `{ model }` 暴露内部查询模型，表单项统一使用 `v-model="model.xxx"` 绑定；在 HTML（非 SFC）场景中可使用组件注册的全局属性 `q`，写作 `v-model="q.xxx"`。
- 默认区建议放高频条件（1~3 个），低频条件放入 `more` 插槽；`more` 插槽中也可以混用 `el-form-item` 与 `wd-search-item`。
- 点击「重置」会清空全部查询字段（包括 `more` 区域）并清除校验状态，同时触发 `reset` 事件。
- 组件未声明的属性和事件会通过 `$attrs` 透传到内部 `el-form`，可传入 `el-form` 支持的通用配置；组件已阻止表单原生提交（`@submit.prevent`），在输入框内回车不会刷新页面。
- 未提供 `more` 插槽且开启折叠时，默认区整体折叠为单行（约 40px 高）；提供 `more` 插槽后，默认区始终完整显示，仅 `more` 区域参与展开/收起动画。
- 已知不一致：`defaultExpand` 在 api-meta 中标注默认值为 `true`（默认不折叠），但组件源码中该 prop 的默认值为 `false`；建议使用时始终显式传入 `:default-expand`，避免依赖默认值。

### 常见问题

**问：为什么点了「搜索」表格没有刷新？**

请检查三点：SearchPanel 是否设置了 `head-refresh-datagrid`；SearchPanel 与目标 DataGrid 的 `filter` 是否一致（或 `head-refresh-datagrid` 字符串是否指向目标 `filter`）；DataGrid 是否已设置 `api` 并处于激活状态。

**问：`expand` 与 `default-expand` 有什么区别？**

`default-expand` 只决定初始是否展开；`expand`（配合 `v-model:expand`）是受控属性，父组件可持续接管展开状态。二者选其一即可。

**问：如何自定义「搜索 / 重置」按钮？**

使用 `actions` 插槽，作用域参数提供 `{ search, reset }` 两个方法，可在插槽内放置自定义按钮并调用；也可设置 `:with-actions="false"` 隐藏整个操作列，完全自行触发 `search`/`reset` 相关逻辑。

**问：`label-width` 传 `"auto"` 有什么效果？**

标签宽度随文字自适应，不再固定为 `80px`，适合各搜索项标签字数差异较大的场景。

### Element Plus 透传

- 透传目标：`el-form`
- 说明：$attrs 透传到内部 el-form（含 @submit 被组件 .prevent 接管）；表单提交/重置/展开收起请使用组件的 search、reset、expand-change 事件。

### Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| collapsible | `boolean` | true | 是否允许折叠（存在隐藏搜索条件时才有 展开/收起 按钮；有 more 插槽恒可折叠，无 more 插槽时默认区超出一行才可折叠） |
| expand | `boolean` | — | 展开状态（v-model:expand） |
| defaultExpand | `boolean` | true | 默认是否展开（默认不折叠） |
| withActions | `boolean` | true | 内置查询/重置按钮 |
| searchText | `string` | '搜索' | 查询按钮文案 |
| resetText | `string` | '重置' | 重置按钮文案 |
| expandText | `string` | '展开' | 展开按钮文案 |
| collapseText | `string` | '收起' | 收起按钮文案 |
| labelWidth | `string \| number` | '80px' | 标签宽度（示例常用 auto 自适应） |
| actionWidth | `string \| number` | 'auto' | 操作列宽度：默认随按钮内容自适应；数字按 px；可传 CSS 长度（如 120px） |
| headRefreshDatagrid | `boolean \| string` | false | 查询/重置联动目标 DataGrid |
| filter | `string` | '' | 联动分组标识 |

### Events

| 事件名 | 回调参数 | 说明 |
| --- | --- | --- |
| search | params | 点击查询 |
| reset | — | 点击重置 |
| expand-change | boolean | 折叠状态变化 |
| update:expand | boolean | 折叠状态（v-model） |

### Slots

| 插槽 | 插槽参数 | 说明 |
| --- | --- | --- |
| default | { model } | 默认可见搜索字段（第一行，el-form-item 或 wd-search-item + v-model="model.xxx"） |
| more | { model } | 隐藏搜索项目（第二行，收起时仅视觉隐藏；展开后整行平顺滑出；collapsible=false 恒展开） |
| actions | { search, reset } | 自定义右侧操作列 |

### 暴露方法（通过 ref 调用）

| 方法 | 参数 | 返回值 | 说明 |
| --- | --- | --- | --- |
| resetForm() | — | void | 重置：清空全部搜索字段并触发查询/联动刷新（等同点击「重置」按钮） |
| getSearchParams() | — | object | 获取当前搜索条件对象的副本（默认插槽与 more 插槽字段共享同一表单模型） |
| expand() | — | void | 展开面板（滑出 more 隐藏项），emit update:expand(true) |
| collapse() | — | void | 收起面板（收回 more 隐藏项），emit update:expand(false) |
