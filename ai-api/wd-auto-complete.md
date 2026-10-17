> 本文件由脚本自动生成，请勿手工编辑。全部组件索引、阅读约定与 Element Plus 透传规则见 [README.md](./README.md)。数据源 `docs/src/api-meta/`，重生成：`npm run gen:ai-api`。

# WdAutoComplete AutoComplete 自动完成

基于 el-autocomplete：远程搜索、valueKey/labelKey 字段映射、自定义建议模板

### 概述

WdAutoComplete 基于 el-autocomplete 封装，提供输入即建议的自动补全能力：支持 dataSource 静态数据本地过滤，也支持 api 远程搜索建议；通过 valueKey / labelKey 完成选项字段映射，选中建议项时 v-model 写入选项值字段，select 事件抛出原始数据对象；建议项内容可通过默认插槽自定义。

### 何时使用

- 输入值是自由文本，但希望给出候选建议引导用户快速填写，如姓名、商品名、地址关键字。
- 候选集较大、需要边输入边向服务端检索（远程搜索建议）。
- 不建议：取值必须严格限定在固定选项集合内时，使用 WdSelect（可选可搜但不可自由输入）更合适。

### 注意事项

- 选中建议项时，v-model 写入的是选项的 valueKey 字段值（默认 'value'），select 事件抛出该选项的原始对象 raw，需要整行数据（如部门、邮箱）时在 select 中取。
- 加载策略：api 存在且 active=true 时走「输入即远程搜索」；否则首次输入时加载一次选项（api 一次全量或 dataSource 静态数据）后做本地过滤，本地过滤对 text 字段不区分大小写。
- 接口返回按统一响应协议 `{ code, data, message }` 自动解包：data 为选项数组，若为 `{ list }` 结构则取 list。
- 组件通过 labelKey 指定 el-autocomplete 的 value-key（输入框回显文本），请确保 labelKey 与 valueKey 的字段映射设置正确，否则选中后输入框显示异常。
- addData / appendData 固定项会并入候选列表参与本地过滤；远程搜索模式下每次请求返回后同样合并。
- el-autocomplete 原生属性（placeholder、clearable、debounce 等）经 $attrs 透传，可直接使用。

### 常见问题

**问：v-model 拿到的是显示文本还是选项值？**

选中建议项时写入 valueKey 字段值；手动输入未选中任何建议时，v-model 跟随输入字符串（el-autocomplete 原生行为）。

**问：如何获取选中项的完整数据（不只是值）？**

监听 select 事件，回调参数是该选项的原始对象 raw。

**问：输入后没有发出远程请求？**

远程搜索要求 api 非空且 active=true；若只想首次加载一次后本地过滤，保留 api 但把 active 设为 false 即可。

**问：选项字段名与后端不一致（如 name/dept）怎么办？**

用 label-key 指定显示字段、value-key 指定选中值字段，远程关键字字段名用 keyword-key 指定。

### Element Plus 透传

- 透传目标：`el-autocomplete`
- 截获事件：`change`、`select`——组件 `defineEmits` 已声明同名事件，监听器不进入 `$attrs`，由组件内部处理后重新 emit，事件载荷以本文档 Events 为准（不要直接套用 Element Plus 原生载荷）。
- 说明：根节点为自研 div.wd-auto-complete，$attrs 透传到内部 el-autocomplete；change、select 被组件接管重发（选项标准化后触发，载荷以本文档为准）。

### Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| modelValue | `string` | '' | 输入值（v-model） |
| valueKey | `string` | 'value' | 选项值字段 |
| labelKey | `string` | 'text' | 选项显示字段 |
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
| select | raw | 选中建议项（原始对象） |

### Slots

| 插槽 | 容器 id | 插槽参数 | 说明 |
| --- | --- | --- | --- |
| default | — | { option, text, value } | 建议项内容 |

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
