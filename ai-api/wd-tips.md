> 本文件由脚本自动生成，请勿手工编辑。全部组件索引、阅读约定与 Element Plus 透传规则见 [README.md](./README.md)。数据源 `docs/src/api-meta/`，重生成：`npm run gen:ai-api`。

# WdTips Tips 提示

文字/响应式提示：word=悬停图标模式，box=行内文字模式，颜色图标可配

### 概述

WdTips 是一个轻量的文字/响应式提示组件，提供两种展示模式：`word` 模式渲染一个可悬停的图标，鼠标移入后通过 tooltip 显示提示内容；`box` 模式则把提示文字（可带图标）直接内联展示在页面中。图标与颜色均可配置，适合在表单、表头、字段旁补充说明性文字。

### 何时使用

- 表头或字段标签旁需要「名词解释」类说明，又不想占用版面：用 `word` 模式，悬停图标出提示。
- 表单分组、操作区附近需要一行简短的行内提示文字：用 `box` 模式。
- 需要通过颜色/图标区分提示级别（普通信息、警告、疑问）时。
- 不建议：需要用户确认或交互的提示（应使用 WdConfirmButton、WdPopconfirmButton 等）。
- 不建议：大段富文本说明（WdTips 只渲染纯文字，不解析 HTML）。

### 注意事项

- `word` 模式的 tooltip 固定为 dark 主题、`top` 弹出位置（内部直接使用 el-tooltip 的默认封装，未暴露配置项）。
- `icon` 只支持 `InfoFilled` / `WarningFilled` / `QuestionFilled` 三个内置图标；传入其他名字会回退为 `InfoFilled`。
- 默认插槽仅在 `box` 模式下生效，用于覆盖 `tips` 文字；`word` 模式的提示内容只能来自 `tips` 属性。
- `color` 同时作用于图标与文字：word 模式染色图标，box 模式染色整行（图标 + 文字）。
- box 模式文字使用小号字号（`--wd-font-size-sm`，默认 12px），适合作为辅助说明而非正文。
- 表头中使用时建议加 `margin-left` 小间距（如示例中的 `style="margin-left: 6px"`），避免图标紧贴文字。
- `bg` 仅对 box 模式生效：默认 `none` 不带背景；传 `primary` 使用主题色 10% 浅底、文字取主题色；传任意 CSS 颜色值（如 `#FEFEFE`、`rgba(...)`）时以其为底色，文字颜色仍由 `color` 控制。
- 带背景时会自动增加内边距与圆角，使其成为一个可点击区域样式的标签块。

### 常见问题

**问：传了 `icon="SuccessFilled"` 为什么显示的还是 InfoFilled？**

组件内置图标映射表只包含 InfoFilled / WarningFilled / QuestionFilled 三个，未命中的名称会回退到 InfoFilled。

**问：默认插槽在 word 模式下为什么没效果？**

插槽只在 box 模式渲染。word 模式的提示文字只能通过 `tips` 属性传入。

**问：tooltip 的弹出位置能改成 bottom 吗？**

当前版本 word 模式的 placement 固定为 top，未暴露配置。如需自定义弹出位置，可直接使用 el-tooltip 或按钮类组件的 `tips` / `placement` 属性。

**问：tips 内容支持 HTML 吗？**

不支持，组件按纯文字渲染。

### Element Plus 透传

- 透传目标：`—（不透传）`
- 说明：word 模式内部 el-tooltip 仅显式绑定 content / effect / placement，box 模式为原生 span；未做 $attrs 透传，el-tooltip 其他属性不可用。

### Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| tips | `string` | '' | 提示内容 |
| type | `'word' \| 'box'` | 'word' | 展示模式 |
| icon | `'InfoFilled' \| 'WarningFilled' \| 'QuestionFilled'` | 'InfoFilled' | 图标名 |
| color | `string` | '#909399' | 图标/文字颜色 |
| bg | `string` | 'none' | box 模式背景：none=无背景；primary=主题色浅底（文字取主题色）；也可传任意 CSS 颜色值（如 '#FEFEFE'） |

### Slots

| 插槽 | 容器 id | 插槽参数 | 说明 |
| --- | --- | --- | --- |
| default | — | — | box 模式文字（覆盖 tips） |
