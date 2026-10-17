> 本文件由脚本自动生成，请勿手工编辑。全部组件索引、阅读约定与 Element Plus 透传规则见 [README.md](./README.md)。数据源 `docs/src/api-meta/`，重生成：`npm run gen:ai-api`。

# WdSearchItem SearchItem 搜索面板专用表单项

专为 SearchPanel 定制的表单项，继承 WdFormItem 全部能力，后续可添加搜索场景专属特性

### 概述

WdSearchItem 是专为 WdSearchPanel 定制的表单项容器，继承 WdFormItem 的全部能力（label 标签、prop 字段绑定、tip 悬停帮助提示），用法与 WdFormItem 一致。在 WdSearchPanel 的 `default` 或 `more` 插槽中使用，通过插槽作用域参数 `model` 绑定查询字段（`v-model="model.xxx"`）；多个子项在第一行流式排列，右侧为查询/重置按钮。作为搜索场景语义化组件，后续版本可在此之上添加搜索场景专属特性。

### 何时使用

- 在 WdSearchPanel 中编写搜索条件项，需要标签 + 控件的标准布局时。
- 搜索字段含义不直观，希望通过 `tip` 在 label 旁提供悬停说明时。
- 不建议：新增/编辑表单场景，请使用 WdFormItem（或 WdDataForm）而非 WdSearchItem。
- 不建议：无标签、无帮助提示诉求的极简搜索项，也可以直接在插槽内使用 `el-form-item`。

### 注意事项

- 字段绑定必须走 WdSearchPanel 插槽作用域参数 `model`，即 `v-model="model.xxx"`；`default` 与 `more` 插槽共享同一查询模型，字段名不要重复。
- `prop` 与查询模型的 key 保持一致，便于重置、参数收集等面板级能力按字段工作。
- 未声明的属性与事件通过 `$attrs` 透传给内部 `el-form-item`，控件宽度建议通过行内 `style` 显式指定（示例中各控件均带宽度），保证第一行流式排列整齐。
- 帮助气泡为深色主题，悬停约 100ms 后显示；`tipPlacement` 可选值：`top`、`top-start`、`top-end`、`bottom`、`bottom-start`、`bottom-end`、`left`、`right`。
- WdSearchItem 与 WdFormItem 当前能力一致；在搜索面板内优先使用 WdSearchItem，以便未来平滑获得搜索场景专属特性。

### 常见问题

**问：WdSearchItem 可以脱离 WdSearchPanel 单独使用吗？**

它是为 SearchPanel 场景设计的语义化组件，通常在 `default` / `more` 插槽中使用；脱离面板时行为与 WdFormItem 相同，但普通表单建议直接使用 WdFormItem。

**问：`default` 插槽和 `more` 插槽里的字段是同一个模型吗？**

是。两个插槽通过作用域参数暴露的是同一个查询模型，点击「重置」会一并清空两个区域的字段。

**问：为什么控件显示得挤在一起或换行异常？**

请为每个控件显式设置宽度（如 `style="width: 180px"`），并让标签宽度与面板 `label-width` 协调（示例常用 `label-width="auto"` 自适应）。

**问：tip 的问号图标可以换成别的图标或位置吗？**

问号图标为组件内置（悬停显示 `tip` 内容），不支持替换图标；气泡弹出方向可通过 `tipPlacement` 调整。

### Element Plus 透传

- 透传目标：`el-form-item`
- 说明：组件未声明自定义 emits，未声明的属性与事件经 $attrs 全量透传给 el-form-item；展开/收起由父级 WdSearchPanel 控制。

### Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| label | `string` | '' | 字段标签文字 |
| prop | `string` | '' | 绑定字段名（对应查询 model 的 key） |
| tip | `string` | '' | 帮助说明：提供时 label 右侧自动出现带问号的图标，鼠标悬停显示说明；不传则不显示图标 |
| tipPlacement | `Placement` | 'top' | 帮助气泡的弹出位置 |

### Slots

| 插槽 | 容器 id | 插槽参数 | 说明 |
| --- | --- | --- | --- |
| default | — | — | 表单控件内容区域（el-input / el-select 等） |
| label | — | — | 自定义 label 文字 |
