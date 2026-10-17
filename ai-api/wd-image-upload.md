> 本文件由脚本自动生成，请勿手工编辑。全部组件索引、阅读约定与 Element Plus 透传规则见 [README.md](./README.md)。数据源 `docs/src/api-meta/`，重生成：`npm run gen:ai-api`。

# WdImageUpload ImageUpload 图片上传

图片上传：缩略图网格、数量上限（超限隐藏加号）、点击缩略图调用 el-image-viewer 大图预览

### 概述

WdImageUpload 是图片专用上传组件：缩略图网格（picture-card）展示，达到 maxCount 上限自动隐藏加号入口；点击缩略图调用内置 el-image-viewer 做大图预览；删除需二次确认，配置 deleteApi 后走后端删除接口；v-model 直接收集所有已上传图片地址组成 `string[]`，开箱即可用于表单提交与回显。

### 何时使用

- 只需要上传图片并需要缩略图预览的场景，如头像、商品图、凭证截图、相册。
- 表单中需要「图片地址数组」字段（v-model 为 `string[]`），提交时直接随表单送出。
- 不建议：上传非图片文件（文档、表格、压缩包等）时使用 WdUpload；WdImageUpload 在上传前会强制校验文件类型为 image/*。

### 注意事项

- v-model 是图片地址数组 `string[]`，不是文件对象数组：回显直接传 URL 数组，提交时直接把数组随表单送出。
- 上传成功后按全局响应约定从 `data` 中提取图片地址：data 为对象时取 `data.url` 或 `data.path`，为字符串时直接把 data 当作图片地址；同时通过 api-success 事件抛出 `{ data, raw }`。
- 上传前强制校验：文件类型必须是 image/*（即使修改 accept 也不会跳过该校验），单图大小不能超过 maxSize（默认 5MB），不满足会提示并阻止上传。
- 上传地址 api 会自动拼接全局 urlPrefix；传完整 http(s):// 地址时不拼接。api 为空时不真正提交（action 为 '#'）。
- 删除流程：点击缩略图删除先二次确认；配置 deleteApi 后按 primaryKey（默认 'id'）从上传返回记录中取主键调用删除接口，删除失败会中止移除；未配置 deleteApi 时仅本地移除。
- 上传业务失败或网络异常的条目会自动从列表移除，不会留下坏图占位。
- 达到 maxCount 上限后加号入口自动隐藏，用户必须先删除才能再传；exceed 事件可用于自定义提示。

### 常见问题

**问：后端返回的图片地址字段不是 url 怎么办？**

组件依次尝试 `data.url`、`data.path`（data 为字符串时直接作为地址）；其他字段名需要在 api-success 事件中自取 data 并手工维护 v-model。

**问：clearFiles() 会调用后端删除接口吗？**

不会。clearFiles 仅清空本地列表；需要后端删除请走缩略图右上角删除按钮的二次确认流程（配置 deleteApi 后生效）。

**问：不想要点击缩略图的大图预览？**

设置 `:preview="false"` 关闭内置 el-image-viewer；preview 事件仍会抛出，可自行接管预览逻辑。

**问：如何调用 el-upload 的原生方法？**

通过 ref 取 uploadRef 属性（内部 el-upload 实例的逃生舱），如 `imgUploadRef.value.uploadRef.abort()`。

### Element Plus 透传

- 透传目标：`el-upload`
- 截获事件：`success`、`error`、`preview`、`exceed`——组件 `defineEmits` 已声明同名事件，监听器不进入 `$attrs`，由组件内部处理后重新 emit，事件载荷以本文档 Events 为准（不要直接套用 Element Plus 原生载荷）。
- 说明：el-upload 固定 list-type=picture-card，图片选择/上传/预览/超限回调由组件接管重发，载荷以本文档为准；预览使用内置 el-image-viewer。其余 el-upload 属性经 $attrs 透传。

### Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| api | `string` | '' | 上传地址 |
| deleteApi | `string` | '' | 后端删除地址 |
| deleteMethod | `'get' \| 'post' \| 'put' \| 'delete'` | 'post' | 删除请求方法 |
| primaryKey | `string` | 'id' | 删除主键字段 |
| maxCount | `number` | 8 | 最大图片数量，超限隐藏加号 |
| thumbnailSize | `number` | 100 | 缩略图尺寸（px） |
| preview | `boolean` | true | 点击缩略图大图预览（内置 el-image-viewer） |
| accept | `string` | '' | 接收类型，默认 image/* |
| maxSize | `number` | 5 | 单图大小限制（MB） |
| tip | `string` | '' | 提示文案 |
| modelValue | `string[]` | [] | 已上传图片地址数组（v-model） |
| headRefreshDatagrid | `boolean \| string` | false | 上传/删除成功后刷新目标 DataGrid |
| filter | `string` | '' | 联动分组标识 |

### Events

| 事件名 | 回调参数 | 说明 |
| --- | --- | --- |
| update:modelValue | urls | 图片地址数组变化 |
| change | urls | 图片地址数组变化 |
| success | { response, file, files } | 上传成功 |
| error | { response, file } | 上传失败 |
| delete-success | { file, data? } | 删除成功 |
| preview | { file } | 点击缩略图 |
| exceed | { maxCount } | 超出数量限制 |
| apiBefore | { url, file } | 请求前 |
| apiSuccess | { data } | 请求成功 |
| apiFail | { code, message } | 业务失败 |
| apiException | { error, message } | 网络异常 |
| apiAfter | — | 请求完成 |

### 暴露方法（通过 ref 调用）

| 方法 | 参数 | 返回值 | 说明 |
| --- | --- | --- | --- |
| clearFiles() | — | void | 清空全部图片（已上传图片的后端删除请走缩略图右上角删除的二次确认流程） |
| uploadRef | — | ElUpload 实例（属性） | 内部 el-upload 引用，逃生舱：可调用 el-upload 原生方法 |
