> 本文件由脚本自动生成，请勿手工编辑。全部组件索引、阅读约定与 Element Plus 透传规则见 [README.md](./README.md)。数据源 `docs/src/api-meta/`，重生成：`npm run gen:ai-api`。

# WdRadioList RadioList 单选列表

基于 el-radio-group：API 自动加载选项、按钮样式切换、前插/后追加固定项

### 概述

WdRadioList 基于 el-radio-group 封装，以平铺单选框（或按钮组）形式呈现互斥选项：支持 api 自动加载选项与 dataSource 静态数组，textProp / valueProp / tipsProp 字段映射，addData / appendData 前后固定项，buttonStyle 一键切换按钮样式；v-model 绑定选中值，加载期间自动显示 loading。

### 何时使用

- 选项较少（建议 2-5 个）、希望平铺展示减少一次点击的单选场景，如状态筛选（启用/停用/归档）、性别、类型选择。
- 需要「不限 / 全部」类占位项时，用 addData 前插固定项即可，无需后端配合。
- 不建议：选项很多或需要搜索时使用 WdSelect；仅开/关两个互斥状态且语义是「启停」时，WdSwitch 更贴切。

### 注意事项

- 数据项的 tips 字段非空时，鼠标悬停该选项文本弹出 tooltip；可用 tips-prop 自定义解包字段名（默认 'tips'），适合做选项含义解释（如「停用：账号保留数据，但暂时无法登录」）。
- 自定义解包字段名示例：后端返回 `{ id, name, remark }` 时，设置 `value-prop="id" text-prop="name" tips-prop="remark"` 即可，无需手工转换数据。
- 「不限 / 全部」类占位项推荐用 add-data 前插（如 `{ value: 0, text: '不限' }`），而不是混入业务选项数据。
- dataSource 与 api 同时存在时 dataSource 优先，不会发起请求；active=false 仅关闭挂载自动加载，api/dataSource 变化时仍会重新加载。
- addData / appendData 固定项同样经过字段映射解析，需与 textProp / valueProp 的字段名保持一致。
- el-radio-group 原生属性（如 disabled、size、text-color）经 $attrs 透传，可直接使用。

### 常见问题

**问：WdRadioList 和 WdSelect 怎么选？**

选项少（2-5 个）且希望平铺直选时用 WdRadioList；选项多、需要搜索或节省空间时用 WdSelect。

**问：选中值可以是非数字类型吗？**

可以。modelValue 类型为 any，字符串、数字、布尔等均可，与选项 valueProp 字段值类型保持一致即可。

**问：如何让默认选中「不限」？**

把 v-model 初始值设为 add-data 中占位项的值，如 `ref(0)` 对应 `{ value: 0, text: '不限' }`。

**问：如何监听选项加载失败？**

监听 api-fail 事件（回调参数 `{ code, message }`）；完整请求生命周期为 apiBefore → apiSuccess / apiFail → apiAfter。

### Element Plus 透传

- 透传目标：`el-radio-group`
- 截获事件：`change`——组件 `defineEmits` 已声明同名事件，监听器不进入 `$attrs`，由组件内部处理后重新 emit，事件载荷以本文档 Events 为准（不要直接套用 Element Plus 原生载荷）。
- 说明：未声明的属性与事件经 $attrs 全量透传给 el-radio-group（内部 el-radio 按 options 生成，不接受外部透传）；change 被组件接管重发，载荷以本文档为准。

### Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| modelValue | `any` | — | 选中值（v-model） |
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

| 插槽 | 容器 id | 插槽参数 | 说明 |
| --- | --- | --- | --- |
| default | — | { option, text, value } | 选项内容 |

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
