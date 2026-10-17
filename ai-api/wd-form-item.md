> 本文件由脚本自动生成，请勿手工编辑。全部组件索引、阅读约定与 Element Plus 透传规则见 [README.md](./README.md)。数据源 `docs/src/api-meta/`，重生成：`npm run gen:ai-api`。

# WdFormItem FormItem 通用表单项

集成 el-form-item，支持 tip 帮助提示：提供 tip 属性时 label 右侧自动出现问号图标，鼠标悬停显示解释说明；不传 tip 和普通 el-form-item 一致

### 概述

WdFormItem 在 `el-form-item` 的基础上集成了 `tip` 帮助提示能力：提供 `tip` 属性时，label 右侧自动出现问号图标，鼠标悬停显示解释说明；不传 `tip` 时与普通 `el-form-item` 完全一致。用法与 `el-form-item` 保持一致，通过 `label` 设置标签、`prop` 绑定字段（用于校验），未声明的属性透传给内部 `el-form-item`。

### 何时使用

- 在 `el-form` 表单中包裹输入、选择、开关等任意表单控件，需要标签、校验等标准表单项能力时。
- 字段含义不直观，希望在 label 旁提供悬停式帮助说明，而不占用额外版面时。
- 不建议：纯展示内容（非表单录入）不需要表单项容器，直接排版即可。
- 不建议：在 WdSearchPanel 中编写搜索条件时，推荐使用语义更明确的 WdSearchItem（二者能力一致）。

### 注意事项

- 未声明的属性与事件通过 `$attrs` 透传给内部 `el-form-item`，`required`、`rules`、`error` 等 `el-form-item` 支持的属性均可直接使用，行为与原生一致。
- 校验依赖外层 `el-form`：设置 `prop` 后，在 `el-form` 上配置 `rules` 即可生效；单独使用 `required` 属性仅显示红色星号。
- 只要提供了 `tip` 或 `label` 插槽，即使不传 `label` 属性也会渲染标签区；`label` 插槽优先于 `label` 属性展示自定义内容。
- 帮助气泡为深色主题，悬停约 100ms 后显示，问号图标可聚焦（键盘可访问）。
- `tipPlacement` 可选值：`top`、`top-start`、`top-end`、`bottom`、`bottom-start`、`bottom-end`、`left`、`right`（同 el-tooltip 的 placement）。

### 常见问题

**问：WdFormItem 与 el-form-item 有什么区别？**

用法完全一致，WdFormItem 仅在其上增加了 `tip` / `tipPlacement` 帮助提示能力；不传 `tip` 时两者表现相同，可以平滑替换。

**问：设置了 `tip` 但没有出现问号图标？**

请确认 `tip` 为非空字符串；问号图标只在 `tip` 有内容时渲染。

**问：如何自定义标签内容（例如加图标或链接）？**

使用 `label` 插槽自定义标签区内容；插槽内容优先于 `label` 属性显示。

**问：在 WdSearchPanel 里应该用 WdFormItem 还是 WdSearchItem？**

二者能力一致（WdSearchItem 继承 WdFormItem 全部能力）。搜索场景建议使用语义更明确的 WdSearchItem，普通表单使用 WdFormItem。

### Element Plus 透传

- 透传目标：`el-form-item`
- 说明：组件未声明自定义 emits，未声明的属性与事件经 $attrs 全量透传给 el-form-item。

### Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| label | `string` | '' | 字段标签文字 |
| prop | `string` | '' | 绑定字段名（对应表单 model 的 key） |
| tip | `string` | '' | 帮助说明：提供时 label 右侧自动出现带问号的图标，鼠标悬停显示说明；不传则不显示图标 |
| tipPlacement | `Placement` | 'top' | 帮助气泡的弹出位置 |

### Slots

| 插槽 | 插槽参数 | 说明 |
| --- | --- | --- |
| default | — | 表单控件内容区域（el-input / el-select 等） |
| label | — | 自定义 label 文字 |
