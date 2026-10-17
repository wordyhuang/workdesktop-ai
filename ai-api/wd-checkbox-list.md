> 本文件由脚本自动生成，请勿手工编辑。全部组件索引、阅读约定与 Element Plus 透传规则见 [README.md](./README.md)。数据源 `docs/src/api-meta/`，重生成：`npm run gen:ai-api`。

# WdCheckboxList CheckboxList 多选列表

基于 el-checkbox-group：API 自动加载选项、按钮样式切换、前插/后追加固定项

### 概述

WdCheckboxList 基于 el-checkbox-group 封装，以平铺复选框（或按钮组）形式呈现多选项：支持 api 自动加载选项与 dataSource 静态数组，textProp / valueProp / tipsProp 字段映射，addData / appendData 前后固定项，buttonStyle 一键切换按钮样式；v-model 绑定选中值数组，加载期间自动显示 loading。

### 何时使用

- 选项较少（建议 2-8 个）、希望用户一眼看全并直接勾选的多选场景，如角色分配、标签选择、状态筛选。
- 需要按钮组形态（buttonStyle）做多选筛选，如列表页快捷过滤条。
- 不建议：选项很多或需要搜索时，使用 WdSelect 的 multiple 模式更节省空间；只允许单选时使用 WdRadioList。

### 注意事项

- modelValue 是数组，请始终用数组初始化（`ref([])`），不要绑定单个值。
- 数据项的 tips 字段非空时，鼠标悬停该选项文本弹出 tooltip；可用 tips-prop 自定义解包字段名（默认 'tips'），无 tips 字段的选项不显示提示。
- 自定义解包字段名示例：后端返回 `{ id, name, remark }` 时，设置 `value-prop="id" text-prop="name" tips-prop="remark"` 即可，无需手工转换数据。
- dataSource 与 api 同时存在时 dataSource 优先，不会发起请求；active=false 仅关闭挂载自动加载，api/dataSource 变化时仍会重新加载。
- addData / appendData 固定项同样经过字段映射解析，需与 textProp / valueProp 的字段名保持一致。
- el-checkbox-group 原生属性（如 min、max、disabled、size）经 $attrs 透传，可直接用于限制最少/最多勾选数。

### 常见问题

**问：选项显示与取值字段不是 text / value 怎么办？**

用 text-prop / value-prop 指定字段名；提示字段用 tips-prop。

**问：如何限制最多可选数量？**

el-checkbox-group 的 max / min 属性经 $attrs 透传，直接写 `:max="2"` 即可。

**问：按钮样式下提示还生效吗？**

生效。button-style 仅切换 el-checkbox 为 el-checkbox-button，tips 悬停提示在两种形态下都可用。

**问：如何监听选项加载失败？**

监听 api-fail 事件（回调参数 `{ code, message }`）；完整请求生命周期为 apiBefore → apiSuccess / apiFail → apiAfter。

### Element Plus 透传

- 透传目标：`el-checkbox-group`
- 截获事件：`change`——组件 `defineEmits` 已声明同名事件，监听器不进入 `$attrs`，由组件内部处理后重新 emit，事件载荷以本文档 Events 为准（不要直接套用 Element Plus 原生载荷）。
- 说明：未声明的属性与事件经 $attrs 全量透传给 el-checkbox-group（内部 el-checkbox 按 options 生成，不接受外部透传）；change 被组件接管重发，载荷以本文档为准。

### Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| modelValue | `array` | [] | 选中值数组（v-model） |
| buttonStyle | `boolean` | false | 按钮样式 |
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
