> 本文件由脚本自动生成，请勿手工编辑。全部组件索引、阅读约定与 Element Plus 透传规则见 [README.md](./README.md)。数据源 `docs/src/api-meta/`，重生成：`npm run gen:ai-api`。

# WdDataForm DataForm 数据表单

自动表单：mode(create/edit) + 详情回填 + 校验 + 修改检测 + 提交联动关抽屉/刷新表格/连续操作，适合弹窗内维护数据

### 概述

WdDataForm 是一个基于 el-form 的自动表单组件：通过 `mode`（create/edit）区分新增与编辑，edit 模式支持详情接口自动回填，内置校验、修改检测（脏检查）与离开确认。提交成功后可联动关闭所在抽屉/对话框、刷新目标 DataGrid，create 模式还支持「保存并继续」的连续录入。它非常适合放在 WdDrawer 等弹层容器内维护单条业务数据。

### 何时使用

- 在抽屉/对话框中新增或编辑一条业务数据（列表页「新增/编辑」弹层）。
- 编辑场景需要通过详情接口（`api`）自动回填表单。
- 提交成功后需要自动关闭弹层、刷新列表页表格。
- 需要连续新增多条数据（保存并继续，不清空上下文）。
- 不建议：列表页顶部的查询条件表单：请使用 WdSearchPanel。
- 不建议：多行数据的批量编辑：请使用 WdEditableGrid。

### 注意事项

- **底部「关闭」「保存并继续」按钮仅在宿主环境显示**：被 WdDrawer（含 dialog 模式）承载或处于 iframe 内时才渲染（源码 `inHost` 判断）；独立页面使用时自动隐藏。独立使用时建议将 `head-close-drawer` 置为 false，提交成功后只会 emit `close` 事件。
- **API 返回数据的解包分两处**：加载详情（`api` 拉取）把 `data` 整体作为表单对象回填（按字段名浅合并），并通过 `load-success` 抛出 `data`；提交表单（`submitApi`）后从返回中解出 `data`，成功时经 `submit-success` 抛出 `data`，失败时经 `submit-fail` 抛出完整结果。
- **resetForm 的行为因模式而异**：edit 模式恢复为详情快照，create 模式（或 `resetForm(true)`）清空全部字段与校验态。
- **提交字段可裁剪**：`submitKeys` / `submitExcludeKeys` 同时支持数组与逗号分隔字符串（如 `"id,name"`），用于控制提交到接口的字段集合。
- **离开确认只走一处**：`confirmLeave` 默认开启，有未保存修改时关闭会弹确认；在容器内由容器统一执行守卫，避免与表单自身重复弹窗。提交成功触发的关闭（reason='submit'）不再做离开确认。
- **rules 透传 el-form**：校验不通过时提交会被中断并提示「请完善表单必填项」；请求进行中整个表单处于 disabled/loading 状态。

### 常见问题

**问：不配置 submitApi 会怎样？**

校验通过后不发请求，仅以 `submit-success` 事件抛出当前表单数据（getFormData 结果），提交逻辑完全交给父组件处理。

**问：edit 模式如何自动加载详情？**

配置 `api` + `active`（挂载后自动请求）；或随时通过 ref 调用 `requestApi()` 手动请求并回填。未配置 `api` 时回退为使用 `data` 属性回填。

**问：如何只提交部分字段？**

用 `submitKeys` 指定白名单，或用 `submitExcludeKeys` 指定黑名单；二者均可传数组或逗号分隔字符串。

**问：需要调用 el-form 的原生方法怎么办？**

通过 ref 上的 `formRef` 属性拿到内部 ElForm 实例（逃生舱），可调用 validateField、clearValidate 等原生方法。

### Element Plus 透传

- 透传目标：`el-form`
- 说明：$attrs 透传到内部 el-form（根节点为自研 div.wd-data-form）；change、submit-success/submit-fail、load-success、close 等均为组件自有事件（由内部表单状态与提交流程触发，非 el-form 原生事件），载荷以本文档为准。

### Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| mode | `'create' \| 'edit'` | 'create' | 新增/编辑模式 |
| api | `string` | '' | 详情接口（edit 模式回填） |
| apiMethod | `'get' \| 'post'` | 'get' | 详情接口方法 |
| apiParam | `object` | {} | 详情接口参数 |
| submitApi | `string` | '' | 提交接口 |
| submitMethod | `'post' \| 'put'` | 'post' | 提交方法 |
| submitKeys | `string \| string[]` | — | 提交字段白名单 |
| submitExcludeKeys | `string \| string[]` | — | 提交字段黑名单 |
| active | `boolean` | false | edit 模式自动请求详情 |
| confirmLeave | `boolean` | true | 有未保存修改时离开确认 |
| withActions | `boolean` | true | 显示底部操作区 |
| actionConfig | `object` | {} | 按钮文案 { resetText, submitText, continueText, closeText, showReset, showContinue } |
| headCloseDrawer | `boolean \| string` | true | 提交成功后关闭容器 |
| headRefreshDatagrid | `boolean \| string` | false | 提交成功后刷新目标 DataGrid |
| keepFormButton | `boolean` | true | create 模式显示"保存并继续" |
| rules | `object` | {} | el-form 校验规则 |
| labelWidth | `string \| number` | '100px' | 标签宽度 |
| labelPosition | `'left' \| 'right' \| 'top'` | 'right' | 标签位置 |
| inline | `boolean` | false | 行内模式 |
| data | `object` | — | 外部初始数据（DrawerButton data 等） |
| filter | `string` | '' | 联动分组标识 |

### Events

| 事件名 | 回调参数 | 说明 |
| --- | --- | --- |
| submit-success | data | 提交成功 |
| submit-fail | result | 提交失败 |
| load-success | data | 详情加载成功 |
| change | formData | 表单值变化 |
| close | { reason } | 请求关闭 |
| apiBefore | { type } | 请求前 |
| apiAfter | { type } | 请求完成 |

### Slots

| 插槽 | 插槽参数 | 说明 |
| --- | --- | --- |
| default | { model, form } | 表单字段（el-form-item + v-model="model.xxx"） |
| footer | { submit, reset, loading } | 底部操作区 |

### 暴露方法（通过 ref 调用）

| 方法 | 参数 | 返回值 | 说明 |
| --- | --- | --- | --- |
| submitForm(continueNext?) | continueNext?: boolean | Promise | 校验通过后提交表单；continueNext=true 为「保存并继续」（不关容器、清空表单） |
| validate() | — | Promise<boolean> | 触发 el-form 校验，全部通过 resolve(true)，否则 resolve(false) |
| resetForm(clearOnly?) | clearOnly?: boolean | void | 重置表单：edit 模式恢复为详情快照；create 模式或 clearOnly=true 清空全部字段与校验态 |
| getFormData() | — | object | 获取当前表单数据的副本 |
| fillForm(data) | data: object \| null | void | 用指定数据回填表单（先清空旧值，深拷贝合并；容器传入 data 时自动调用） |
| requestApi(options?) | { apiParam?: object } | Promise | edit 模式手动请求详情并回填（未配 api 时回填 props.data） |
| isDirty() | — | boolean | 表单相对快照是否有未保存修改 |
| beforeLeave() | — | Promise<boolean> | 离开守卫：有未保存修改时弹确认框，确认离开 resolve(true)、继续编辑 resolve(false) |
| formRef | — | ElForm 实例（属性） | 内部 el-form 引用，逃生舱：可调用 el-form 原生方法（如 validateField） |

### 数据类型

#### actionConfig（操作区按钮配置）

引用：`actionConfig` prop（`withActions` 开启时生效）

| 字段 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| resetText | string | 否 | 内置文案 | 「重置」按钮文案 |
| submitText | string | 否 | 内置文案 | 「提交」按钮文案 |
| continueText | string | 否 | 内置文案 | 「保存并继续」按钮文案（create 模式且 keepFormButton 开启时显示） |
| closeText | string | 否 | 内置文案 | 「关闭」按钮文案 |
| showReset | boolean | 否 | true | 是否显示「重置」按钮 |
| showContinue | boolean | 否 | true | 是否显示「保存并继续」按钮 |

#### rules（表单校验规则，FormRules）

引用：`rules` prop

el-form 的标准校验规则（外部类型 `FormRules`，基于 async-validator），结构为 `{ 字段prop: 规则数组 }`：

```ts
{
  name: [
    { required: true, message: '姓名必填', trigger: 'blur' },
    { min: 2, max: 20, message: '长度 2-20', trigger: 'blur' }
  ]
}
```

常用规则键：`required` / `message` / `trigger`（`blur` | `change`）/ `type` / `min` / `max` / `len` / `pattern` / `validator` / `enum` / `whitespace`。完整规则定义见 element-plus 与 async-validator 文档。
