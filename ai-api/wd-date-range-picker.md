> 本文件由脚本自动生成，请勿手工编辑。全部组件索引、阅读约定与 Element Plus 透传规则见 [README.md](./README.md)。数据源 `docs/src/api-meta/`，重生成：`npm run gen:ai-api`。

# WdDateRangePicker DateRangePicker 日期范围选择器

基于 el-date-picker daterange：v-model 绑定 [开始, 结束] 数组，type 切 date/datetime，内置快捷（今天/近7天/近30天/本月/上月）

### 概述

WdDateRangePicker 固定使用 el-date-picker 的 daterange 模式：v-model 绑定 [开始, 结束] 数组，缺省格式按 type 自动映射（date=YYYY-MM-DD / datetime=YYYY-MM-DD HH:mm:ss）；开启 withShortcut 后面板左侧内置「今天 / 近7天 / 近30天 / 本月 / 上月」五个常用快捷区间。

### 何时使用

- 搜索区按时间区间筛选（如订单时间范围、创建时间范围）。
- 表单中需要填写一段连续起止时间（如项目周期、值班时段）。
- 需要快捷选中「本月」「上月」「近30天」等常用统计区间。
- 不建议：只需要选单个时间点，请直接使用原生 el-date-picker（type="date" 或 type="datetime"）。

### 注意事项

- v-model 输出为字符串数组 [开始, 结束]，格式遵循 valueFormat（缺省按 type 映射）。
- withShortcut 内置五个快捷项：今天、近7天、近30天、本月、上月；type=datetime 时结束时刻取当前时刻，其余类型按天取当天结束。
- startPlaceholder / endPlaceholder 可分别自定义起止占位文案，缺省为「开始日期 / 结束日期」。
- el-date-picker daterange 原生属性（rangeSeparator、unlinkPanels 等）经 $attrs 透传。

### 常见问题

**问：v-model 绑定的是什么结构？**

字符串数组 [start, end]，格式由 valueFormat/type 决定；未选时为 undefined。

**问：datetime 类型绑定值长什么样？**

['2026-10-01 00:00:00', '2026-10-18 23:59:59'] 这样的起止字符串数组。

**问：怎么把「本月」快捷默认带上？**

设置 with-shortcut 并在面板左侧点击「本月」即可；也可直接给 v-model 赋初值数组。

### Element Plus 透传

- 透传目标：`el-date-picker（type="daterange" 固定）`
- 截获事件：`change`——组件 `defineEmits` 已声明同名事件，监听器不进入 `$attrs`，由组件内部处理后重新 emit，事件载荷以本文档 Events 为准（不要直接套用 Element Plus 原生载荷）。
- 说明：组件固定使用 el-date-picker 的 daterange 模式，仅封装 type / valueFormat / startPlaceholder / endPlaceholder / disabled / withShortcut；其余属性经 $attrs 透传。

### Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| modelValue | `string[] \| Date[]` | — | 选中区间（v-model），[开始, 结束]；缺省格式按 type 映射 |
| type | `'date' \| 'datetime'` | 'date' | 选择类型：date 日期范围 / datetime 日期时间范围 |
| valueFormat | `string` | '' | 绑定值格式（dayjs 令牌）；缺省按 type 映射：date=YYYY-MM-DD / datetime=YYYY-MM-DD HH:mm:ss |
| startPlaceholder | `string` | '开始日期' | 起始占位文案 |
| endPlaceholder | `string` | '结束日期' | 结束占位文案 |
| disabled | `boolean` | false | 是否禁用 |
| withShortcut | `boolean` | false | 是否内置快捷选项（今天 / 近7天 / 近30天 / 本月 / 上月） |

### Events

| 事件名 | 回调参数 | 说明 |
| --- | --- | --- |
| update:modelValue | [start, end] | 选中区间变化（v-model） |
| change | [start, end] | 选中变化，载荷与 update:modelValue 一致 |
