> 本文件由脚本自动生成，请勿手工编辑。全部组件索引、阅读约定与 Element Plus 透传规则见 [README.md](./README.md)。数据源 `docs/src/api-meta/`，重生成：`npm run gen:ai-api`。

# WdUpload Upload 文件上传

基于 el-upload：上传 + 后端删除（二次确认）+ 预览确认 + 尺寸限制，auto-upload=false 时手动提交

### 概述

WdUpload 基于 el-upload 封装，提供通用文件上传能力：选择即上传（auto-upload=false 时手动提交）、文件大小与数量限制、删除前二次确认并支持后端删除接口、点击文件预览、上传/删除成功后联动刷新 DataGrid；v-model 绑定已上传文件列表，配合 addFile 方法可回显外部文件记录，是表单附件场景的默认选择。

### 何时使用

- 上传任意类型文件（文档、表格、图片、压缩包等）并以文件列表管理，如合同附件、导入模板、证明材料。
- 删除已上传文件需要同步调用后端删除接口（deleteApi）并二次确认。
- 需要先选多个文件、再一次手动提交（auto-upload=false + submitUpload）。
- 不建议：只传图片且需要缩略图网格与大图预览时，使用 WdImageUpload 体验更好。

### 注意事项

- 上传地址 api 自动拼接全局 urlPrefix（传完整 http(s):// 地址时不拼接）；api 为空时 el-upload 不真正提交（action 为 '#'），由外部接管上传逻辑。
- el-upload 原生 XHR 不走 axios 实例：组件会自动拼接 urlPrefix 并透传全局配置的静态 token 请求头（`Authorization: Bearer <token>`）。
- 上传成败按全局响应约定判断（`{ code, data, message }`）：成功后整个 data 挂在文件对象的 `biz` 上，并取 `data.url` 或 `data.path` 作为文件回显地址；api-success 事件抛出 `{ data, raw }`。
- 删除流程：先弹二次确认；配置 deleteApi 后按 primaryKey（默认 'id'）从文件记录取主键调用删除接口（删除参数为 `{ ...data, [primaryKey]: 主键值 }`），删除失败或接口异常会中止移除；未配置 deleteApi 时仅本地移除。
- maxSize（MB）在上传前校验，超限提示并阻止该文件上传；0 表示不限制。
- auto-upload=false 时，tip 插槽区域会出现「开始上传」按钮（submitButtonText 可改文案），也可通过 ref 调 submitUpload()；clearFiles() 只清空本地列表，不会调用后端删除。
- limit 超限触发 exceed 事件并提示「最多上传 N 个文件」；需要多选时同时设置 multiple，否则一次只能选一个文件。

### 常见问题

**问：clearFiles() 会把服务器上的文件也删掉吗？**

不会。clearFiles 仅清空本地文件列表；已上传文件的后端删除请走列表删除按钮的二次确认流程（配置 deleteApi 后生效）。

**问：如何在编辑表单中回显已有附件？**

两种方式：直接给 v-model 传文件对象数组（含 name/url 等字段），或通过 ref 调 `addFile({ name: 'a.pdf', url: '...' })` 追加记录；删除时按 primaryKey 取主键，建议回显记录中带上该字段。

**问：上传请求需要携带额外业务参数？**

使用 data 属性传附加表单数据（如 `:data="{ bizId: 123 }"`），会随上传请求一起提交；删除接口请求同样会合并 data。

**问：如何调用 el-upload 的原生方法（如中断上传）？**

通过 ref 取 uploadRef 属性（内部 el-upload 实例的逃生舱），如 `uploadRef.value.uploadRef.abort()`、`uploadRef.value.uploadRef.submit()`。

### Element Plus 透传

- 透传目标：`el-upload`
- 截获事件：`success`、`error`、`preview`、`exceed`——组件 `defineEmits` 已声明同名事件，监听器不进入 `$attrs`，由组件内部处理后重新 emit，事件载荷以本文档 Events 为准（不要直接套用 Element Plus 原生载荷）。
- 说明：与声明事件同名的 el-upload 回调（on-success/on-error/on-preview/on-exceed）被组件接管重发，外部监听器不生效，载荷以本文档为准；文件选择变化的 change 由组件内部逻辑发出，载荷为文件列表。其余 el-upload 属性经 $attrs 透传。

### Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| api | `string` | '' | 上传地址（自动拼接全局 urlPrefix） |
| deleteApi | `string` | '' | 后端删除地址（配置后删除走接口） |
| deleteMethod | `'get' \| 'post' \| 'put' \| 'delete'` | 'post' | 删除请求方法 |
| primaryKey | `string` | 'id' | 删除时取文件记录的主键字段名 |
| submitButtonText | `string` | '开始上传' | 手动提交按钮文案（auto-upload=false） |
| buttonText | `string` | '点击上传' | 选择按钮文案 |
| accept | `string` | '' | 接收类型 |
| limit | `number` | — | 最大文件数 |
| multiple | `boolean` | false | 多选 |
| autoUpload | `boolean` | true | 选择后自动上传 |
| name | `string` | 'file' | 上传字段名 |
| data | `object` | {} | 附加表单数据 |
| disabled | `boolean` | false | 禁用 |
| showFileList | `boolean` | true | 显示文件列表 |
| maxSize | `number` | 0 | 大小限制（MB），0 不限制 |
| modelValue | `array` | [] | 已上传文件列表（v-model） |
| headRefreshDatagrid | `boolean \| string` | false | 上传/删除成功后刷新目标 DataGrid |
| filter | `string` | '' | 联动分组标识 |

### Events

| 事件名 | 回调参数 | 说明 |
| --- | --- | --- |
| update:modelValue | files | 文件列表变化 |
| change | files | 文件列表变化 |
| success | { response, file, files } | 上传成功 |
| error | { response, file } | 上传失败 |
| delete-success | { file, data? } | 删除成功 |
| preview | { file } | 点击文件预览 |
| exceed | { selectedFiles, files } | 超出数量限制 |
| apiBefore | { url, file } | 上传/删除请求前 |
| apiSuccess | { data } | 请求成功 |
| apiFail | { code, message } | 业务失败 |
| apiException | { error, message } | 网络异常 |
| apiAfter | — | 请求完成 |

### Slots

| 插槽 | 插槽参数 | 说明 |
| --- | --- | --- |
| default | — | 触发按钮（默认 el-button） |
| tip | — | 提示区（auto-upload=false 时含提交按钮） |

### 暴露方法（通过 ref 调用）

| 方法 | 参数 | 返回值 | 说明 |
| --- | --- | --- | --- |
| submitUpload() | — | void | 手动触发上传（auto-upload=false 时使用，等同点击「开始上传」） |
| clearFiles() | — | void | 清空文件列表（已上传文件的后端删除请走列表删除按钮的二次确认流程） |
| addFile(file) | file: UploadUserFile | void | 向文件列表追加一个文件记录（不走选择器，常用于回显外部文件） |
| uploadRef | — | ElUpload 实例（属性） | 内部 el-upload 引用，逃生舱：可调用 el-upload 原生方法（如 abort、submit） |

### 数据类型

#### UploadFileRecord（文件记录）

引用：`modelValue` prop（v-model 文件列表的数组元素）、`addFile()` 追加的记录、`success` / `preview` 等事件回调中的 `file`

| 字段 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| name | string | 是 | — | 文件显示名 |
| url | string | 是 | — | 文件访问地址（预览 / 下载用） |
| 主键字段 | any | 删除时必需 | — | 字段名由 primaryKey prop 指定（默认 'id'），删除请求时从该字段取值 |
| 其他任意字段 | any | 否 | — | 后端返回的业务字段（如 biz）原样保留，随事件抛回 |

#### UploadUserFile（el-upload 文件对象）

引用：`addFile(file)` 方法参数

el-upload 的外部类型（element-plus 导出），常用字段：

| 字段 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| name | string | 是 | — | 文件名 |
| url | string | 否 | — | 已上传文件的访问地址（回显时传入） |
| uid | number | 否 | 自动生成 | 唯一标识 |
| status | 'ready' \| 'uploading' \| 'success' \| 'fail' | 否 | 'success' | 文件状态 |
| response | any | 否 | — | 上传接口的原始响应 |

完整定义见 element-plus 文档的 Upload 组件类型声明。
