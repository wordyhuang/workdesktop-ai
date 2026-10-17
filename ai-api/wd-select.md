> 本文件由脚本自动生成，请勿手工编辑。全部组件索引、阅读约定与 Element Plus 透传规则见 [README.md](./README.md)。数据源 `docs/src/api-meta/`，重生成：`npm run gen:ai-api`。

# WdSelect Select 下拉选择

基于 el-select：API 自动加载选项、远程搜索、前插/后追加固定项，自定义选项模板

### 概述

WdSelect 基于 el-select 封装，在保留原生能力的基础上内置了选项加载统一协议：既可通过 api 自动加载远程选项，也可直接传入 dataSource 静态数组；支持 textProp / valueProp / tipsProp 字段映射、addData / appendData 前后固定项，以及 remote 远程搜索。选项支持悬停提示图标与自定义模板，是表单和搜索面板中最常用的单选/多选下拉控件。

### 何时使用

- 选项较多（5 个以上）或需要从接口动态加载的单选/多选场景，如角色、部门、字典项选择。
- 需要输入关键字过滤选项：本地过滤（filterable，默认开启）或远程搜索（remote）。
- 选项需要附加说明（tips 悬停提示图标）或自定义显示内容（默认插槽）。
- 不建议：选项仅 2-5 个且希望平铺展示、减少一次点击时，优先使用 WdRadioList（单选）或 WdCheckboxList（多选），操作更直观。

### 注意事项

- filterable 默认值为 true（本地可搜索），与 el-select 原生默认值 false 不同；remote=true 时组件强制开启 filterable（源码中 `:filterable="remote || filterable"`）。
- 远程搜索仅在配置了 api 时生效；关键字以 keywordKey（默认 'keyword'）为字段名并入 apiParam 提交，字段名需与后端约定一致。
- dataSource 与 api 同时存在时 dataSource 优先，不会发起请求；二者都为空时选项仅剩 addData / appendData 固定项。
- active=false 可关闭挂载时的自动加载；此后 api 或 dataSource 发生变化时会重新加载（dataSource 变化恒触发）。
- 接口返回按统一响应协议 `{ code, data, message }` 自动解包：data 为选项数组，若为 `{ list }` 结构则取 list；dataSource 也支持基本类型数组（如 `[1, 2, 3]`），自动映射为 text/value。
- el-select 原生属性（clearable、collapse-tags、placeholder、size 等）经 $attrs 透传可直接使用，示例中的 `multiple collapse-tags collapse-tags-tooltip clearable` 组合即为此用法。
- 数据项的 tips 字段非空时，选项右侧显示问号图标，悬停弹出 tooltip；图标已做 `@click.stop` 处理，不会误触发选中。

### 常见问题

**问：后端返回的字段不是 text / value 怎么办？**

用 text-prop / value-prop 指定显示与取值字段名；悬停提示字段用 tips-prop 指定（默认 'tips'）。

**问：如何在选项最前面加一个「全部」？**

使用 add-data 前插固定项，如 `:add-data="[{ value: 0, text: '全部角色' }]"`；append-data 则是在末尾追加。

**问：远程搜索不触发请求？**

确认同时设置了 api 与 remote；keyword-key 需与后端接收关键字的参数名一致；active=false 不影响远程搜索，仅控制挂载自动加载。

**问：如何监听选项加载失败？**

监听 api-fail 事件（回调参数 `{ code, message }`）；完整请求生命周期为 apiBefore → apiSuccess / apiFail → apiAfter。

### Element Plus 透传

- 透传目标：`el-select`
- 截获事件：`change`——组件 `defineEmits` 已声明同名事件，监听器不进入 `$attrs`，由组件内部处理后重新 emit，事件载荷以本文档 Events 为准（不要直接套用 Element Plus 原生载荷）。
- 说明：未声明的 el-select 属性与事件经 $attrs 全量透传；change 被组件接管重发（完成选项标准化后触发，载荷以本文档为准）。注意 filterable 默认为 true，与 Element Plus 默认值不同。

### Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| modelValue | `any` | — | 选中值（v-model） |
| multiple | `boolean` | false | 多选 |
| remote | `boolean` | false | 远程搜索 |
| filterable | `boolean` | true | 本地可搜索 |
| keywordKey | `string` | 'keyword' | 远程搜索关键字字段名 |
| api | `string` | '' | 选项接口地址 |
| apiMethod | `'get' \| 'post'` | 'get' | 选项接口方法 |
| apiParam | `object` | {} | 接口固定参数 |
| active | `boolean` | true | 挂载后自动加载选项 |
| dataSource | `array` | — | 静态选项数组（与 api 二选一） |
| textProp | `string` | 'text' | 选项显示文本字段 |
| valueProp | `string` | 'value' | 选项值字段 |
| tipsProp | `string` | 'tips' | 选项悬停提示字段：数据项该字段非空时，鼠标悬停该选项显示 tooltip |
| addData | `array` | — | 选项前插固定项 |
| appendData | `array` | — | 选项后追加固定项 |

### Events

| 事件名 | 回调参数 | 说明 |
| --- | --- | --- |
| update:modelValue | value | 选中值变化 |
| change | value | 选中值变化（用户操作） |
| apiBefore | { url } | 选项请求前 |
| apiSuccess | { data } | 选项请求成功 |
| apiFail | { code, message } | 选项请求失败 |
| apiAfter | — | 选项请求完成 |

### Slots

| 插槽 | 插槽参数 | 说明 |
| --- | --- | --- |
| default | { option, text, value } | 选项内容 |

### 数据类型

#### OptionItem（选项数据项）

引用：`dataSource` / `addData` / `appendData` props 的数组元素；`api` 接口返回的选项列表元素

选项支持两种形态：**对象**——按 `textProp` / `valueProp` / `tipsProp` 配置的字段名取显示文本、值与悬停提示，其余字段原样保留（可在默认插槽中通过 `option.raw` 访问）；**基本类型**（string / number 等）——自动映射为 `{ text: String(item), value: item }`。

| 字段 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| text（字段名由 textProp 决定） | string | 是 | — | 选项显示文本 |
| value（字段名由 valueProp 决定） | any | 是 | — | 选项值 |
| tips（字段名由 tipsProp 决定） | string | 否 | '' | 悬停提示，非空时鼠标悬停该选项显示 tooltip |
| 其他任意字段 | any | 否 | — | 原样保留在标准化结果的 raw 中 |

接口返回约定：`api` 返回的 `data` 为选项数组，或 `{ list: 选项数组 }` 结构（字段名可由全局配置 `response.list.listName` 覆盖）。

#### NormalizedOption（标准化选项）

引用：默认插槽作用域参数 `option`

组件内部将所有选项标准化为以下结构后渲染：

| 字段 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| text | string | 是 | — | 显示文本 |
| value | any | 是 | — | 选项值 |
| tips | string | 是 | '' | 悬停提示（无则为空串） |
| raw | Record<string, any> | 是 | — | 原始数据项（基本类型选项为映射后的对象） |
