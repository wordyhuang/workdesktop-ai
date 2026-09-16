import type { ComponentMeta } from './types'

/** 表单元素组-上传（2 个）：导航合并进「表单元素」分组 */
export const uploadData: ComponentMeta[] = [
  {
    path: 'upload',
    name: 'WdUpload',
    title: 'Upload 文件上传',
    desc: '基于 el-upload：上传 + 后端删除（二次确认）+ 预览确认 + 尺寸限制，auto-upload=false 时手动提交',
    group: '表单元素',
    intro: {
      overview: 'WdUpload 基于 el-upload 封装，提供通用文件上传能力：选择即上传（auto-upload=false 时手动提交）、文件大小与数量限制、删除前二次确认并支持后端删除接口、点击文件预览、上传/删除成功后联动刷新 DataGrid；v-model 绑定已上传文件列表，配合 addFile 方法可回显外部文件记录，是表单附件场景的默认选择。',
      whenToUse: [
        '上传任意类型文件（文档、表格、图片、压缩包等）并以文件列表管理，如合同附件、导入模板、证明材料。',
        '删除已上传文件需要同步调用后端删除接口（deleteApi）并二次确认。',
        '需要先选多个文件、再一次手动提交（auto-upload=false + submitUpload）。',
        '不建议：只传图片且需要缩略图网格与大图预览时，使用 WdImageUpload 体验更好。'
      ],
      notes: [
        '上传地址 api 自动拼接全局 urlPrefix（传完整 http(s):// 地址时不拼接）；api 为空时 el-upload 不真正提交（action 为 \'#\'），由外部接管上传逻辑。',
        'el-upload 原生 XHR 不走 axios 实例：组件会自动拼接 urlPrefix 并透传全局配置的静态 token 请求头（`Authorization: Bearer <token>`）。',
        '上传成败按全局响应约定判断（`{ code, data, message }`）：成功后整个 data 挂在文件对象的 `biz` 上，并取 `data.url` 或 `data.path` 作为文件回显地址；api-success 事件抛出 `{ data, raw }`。',
        '删除流程：先弹二次确认；配置 deleteApi 后按 primaryKey（默认 \'id\'）从文件记录取主键调用删除接口（删除参数为 `{ ...data, [primaryKey]: 主键值 }`），删除失败或接口异常会中止移除；未配置 deleteApi 时仅本地移除。',
        'maxSize（MB）在上传前校验，超限提示并阻止该文件上传；0 表示不限制。',
        'auto-upload=false 时，tip 插槽区域会出现「开始上传」按钮（submitButtonText 可改文案），也可通过 ref 调 submitUpload()；clearFiles() 只清空本地列表，不会调用后端删除。',
        'limit 超限触发 exceed 事件并提示「最多上传 N 个文件」；需要多选时同时设置 multiple，否则一次只能选一个文件。'
      ],
      faq: [
        { q: 'clearFiles() 会把服务器上的文件也删掉吗？', a: '不会。clearFiles 仅清空本地文件列表；已上传文件的后端删除请走列表删除按钮的二次确认流程（配置 deleteApi 后生效）。' },
        { q: '如何在编辑表单中回显已有附件？', a: '两种方式：直接给 v-model 传文件对象数组（含 name/url 等字段），或通过 ref 调 `addFile({ name: \'a.pdf\', url: \'...\' })` 追加记录；删除时按 primaryKey 取主键，建议回显记录中带上该字段。' },
        { q: '上传请求需要携带额外业务参数？', a: '使用 data 属性传附加表单数据（如 `:data="{ bizId: 123 }"`），会随上传请求一起提交；删除接口请求同样会合并 data。' },
        { q: '如何调用 el-upload 的原生方法（如中断上传）？', a: '通过 ref 取 uploadRef 属性（内部 el-upload 实例的逃生舱），如 `uploadRef.value.uploadRef.abort()`、`uploadRef.value.uploadRef.submit()`。' }
      ]
    },
    dataTypes: [
      {
        name: 'UploadFileRecord（文件记录）',
        ref: '`modelValue` prop（v-model 文件列表的数组元素）、`addFile()` 追加的记录、`success` / `preview` 等事件回调中的 `file`',
        fields: [
          { name: 'name', type: 'string', required: '是', default: '—', desc: '文件显示名' },
          { name: 'url', type: 'string', required: '是', default: '—', desc: '文件访问地址（预览 / 下载用）' },
          { name: '主键字段', type: 'any', required: '删除时必需', default: '—', desc: "字段名由 primaryKey prop 指定（默认 'id'），删除请求时从该字段取值" },
          { name: '其他任意字段', type: 'any', required: '否', default: '—', desc: '后端返回的业务字段（如 biz）原样保留，随事件抛回' },
        ],
      },
      {
        name: 'UploadUserFile（el-upload 文件对象）',
        ref: '`addFile(file)` 方法参数',
        desc: ['el-upload 的外部类型（element-plus 导出），常用字段：'],
        fields: [
          { name: 'name', type: 'string', required: '是', default: '—', desc: '文件名' },
          { name: 'url', type: 'string', required: '否', default: '—', desc: '已上传文件的访问地址（回显时传入）' },
          { name: 'uid', type: 'number', required: '否', default: '自动生成', desc: '唯一标识' },
          { name: 'status', type: "'ready' | 'uploading' | 'success' | 'fail'", required: '否', default: "'success'", desc: '文件状态' },
          { name: 'response', type: 'any', required: '否', default: '—', desc: '上传接口的原始响应' },
        ],
        after: ['完整定义见 element-plus 文档的 Upload 组件类型声明。'],
      },
    ],
    props: [
      { name: 'api', type: 'string', default: "''", desc: '上传地址（自动拼接全局 urlPrefix）' },
      { name: 'deleteApi', type: 'string', default: "''", desc: '后端删除地址（配置后删除走接口）' },
      { name: 'deleteMethod', type: "'get' | 'post' | 'put' | 'delete'", default: "'post'", desc: '删除请求方法' },
      { name: 'primaryKey', type: 'string', default: "'id'", desc: '删除时取文件记录的主键字段名' },
      { name: 'submitButtonText', type: 'string', default: "'开始上传'", desc: '手动提交按钮文案（auto-upload=false）' },
      { name: 'buttonText', type: 'string', default: "'点击上传'", desc: '选择按钮文案' },
      { name: 'accept', type: 'string', default: "''", desc: '接收类型' },
      { name: 'limit', type: 'number', default: '—', desc: '最大文件数' },
      { name: 'multiple', type: 'boolean', default: 'false', desc: '多选' },
      { name: 'autoUpload', type: 'boolean', default: 'true', desc: '选择后自动上传' },
      { name: 'name', type: 'string', default: "'file'", desc: '上传字段名' },
      { name: 'data', type: 'object', default: '{}', desc: '附加表单数据' },
      { name: 'disabled', type: 'boolean', default: 'false', desc: '禁用' },
      { name: 'showFileList', type: 'boolean', default: 'true', desc: '显示文件列表' },
      { name: 'maxSize', type: 'number', default: '0', desc: '大小限制（MB），0 不限制' },
      { name: 'modelValue', type: 'array', default: '[]', desc: '已上传文件列表（v-model）' },
      { name: 'headRefreshDatagrid', type: 'boolean | string', default: 'false', desc: '上传/删除成功后刷新目标 DataGrid' },
      { name: 'filter', type: 'string', default: "''", desc: '联动分组标识' }
    ],
    emits: [
      { name: 'update:modelValue', payload: 'files', desc: '文件列表变化' },
      { name: 'change', payload: 'files', desc: '文件列表变化' },
      { name: 'success', payload: '{ response, file, files }', desc: '上传成功' },
      { name: 'error', payload: '{ response, file }', desc: '上传失败' },
      { name: 'delete-success', payload: '{ file, data? }', desc: '删除成功' },
      { name: 'preview', payload: '{ file }', desc: '点击文件预览' },
      { name: 'exceed', payload: '{ selectedFiles, files }', desc: '超出数量限制' },
      { name: 'apiBefore', payload: '{ url, file }', desc: '上传/删除请求前' },
      { name: 'apiSuccess', payload: '{ data }', desc: '请求成功' },
      { name: 'apiFail', payload: '{ code, message }', desc: '业务失败' },
      { name: 'apiException', payload: '{ error, message }', desc: '网络异常' },
      { name: 'apiAfter', payload: '—', desc: '请求完成' }
    ],
    slots: [
      { name: 'default', params: '—', desc: '触发按钮（默认 el-button）' },
      { name: 'tip', params: '—', desc: '提示区（auto-upload=false 时含提交按钮）' }
    ],
    methods: [
      { name: 'submitUpload()', params: '—', returns: 'void', desc: '手动触发上传（auto-upload=false 时使用，等同点击「开始上传」）' },
      { name: 'clearFiles()', params: '—', returns: 'void', desc: '清空文件列表（已上传文件的后端删除请走列表删除按钮的二次确认流程）' },
      { name: 'addFile(file)', params: 'file: UploadUserFile', returns: 'void', desc: '向文件列表追加一个文件记录（不走选择器，常用于回显外部文件）' },
      { name: 'uploadRef', params: '—', returns: 'ElUpload 实例（属性）', desc: '内部 el-upload 引用，逃生舱：可调用 el-upload 原生方法（如 abort、submit）' }
    ]
  },
  {
    path: 'image-upload',
    name: 'WdImageUpload',
    title: 'ImageUpload 图片上传',
    desc: '图片上传：缩略图网格、数量上限（超限隐藏加号）、点击缩略图调用 el-image-viewer 大图预览',
    group: '表单元素',
    intro: {
      overview: 'WdImageUpload 是图片专用上传组件：缩略图网格（picture-card）展示，达到 maxCount 上限自动隐藏加号入口；点击缩略图调用内置 el-image-viewer 做大图预览；删除需二次确认，配置 deleteApi 后走后端删除接口；v-model 直接收集所有已上传图片地址组成 `string[]`，开箱即可用于表单提交与回显。',
      whenToUse: [
        '只需要上传图片并需要缩略图预览的场景，如头像、商品图、凭证截图、相册。',
        '表单中需要「图片地址数组」字段（v-model 为 `string[]`），提交时直接随表单送出。',
        '不建议：上传非图片文件（文档、表格、压缩包等）时使用 WdUpload；WdImageUpload 在上传前会强制校验文件类型为 image/*。'
      ],
      notes: [
        'v-model 是图片地址数组 `string[]`，不是文件对象数组：回显直接传 URL 数组，提交时直接把数组随表单送出。',
        '上传成功后按全局响应约定从 `data` 中提取图片地址：data 为对象时取 `data.url` 或 `data.path`，为字符串时直接把 data 当作图片地址；同时通过 api-success 事件抛出 `{ data, raw }`。',
        '上传前强制校验：文件类型必须是 image/*（即使修改 accept 也不会跳过该校验），单图大小不能超过 maxSize（默认 5MB），不满足会提示并阻止上传。',
        '上传地址 api 会自动拼接全局 urlPrefix；传完整 http(s):// 地址时不拼接。api 为空时不真正提交（action 为 \'#\'）。',
        '删除流程：点击缩略图删除先二次确认；配置 deleteApi 后按 primaryKey（默认 \'id\'）从上传返回记录中取主键调用删除接口，删除失败会中止移除；未配置 deleteApi 时仅本地移除。',
        '上传业务失败或网络异常的条目会自动从列表移除，不会留下坏图占位。',
        '达到 maxCount 上限后加号入口自动隐藏，用户必须先删除才能再传；exceed 事件可用于自定义提示。'
      ],
      faq: [
        { q: '后端返回的图片地址字段不是 url 怎么办？', a: '组件依次尝试 `data.url`、`data.path`（data 为字符串时直接作为地址）；其他字段名需要在 api-success 事件中自取 data 并手工维护 v-model。' },
        { q: 'clearFiles() 会调用后端删除接口吗？', a: '不会。clearFiles 仅清空本地列表；需要后端删除请走缩略图右上角删除按钮的二次确认流程（配置 deleteApi 后生效）。' },
        { q: '不想要点击缩略图的大图预览？', a: '设置 `:preview="false"` 关闭内置 el-image-viewer；preview 事件仍会抛出，可自行接管预览逻辑。' },
        { q: '如何调用 el-upload 的原生方法？', a: '通过 ref 取 uploadRef 属性（内部 el-upload 实例的逃生舱），如 `imgUploadRef.value.uploadRef.abort()`。' }
      ]
    },
    props: [
      { name: 'api', type: 'string', default: "''", desc: '上传地址' },
      { name: 'deleteApi', type: 'string', default: "''", desc: '后端删除地址' },
      { name: 'deleteMethod', type: "'get' | 'post' | 'put' | 'delete'", default: "'post'", desc: '删除请求方法' },
      { name: 'primaryKey', type: 'string', default: "'id'", desc: '删除主键字段' },
      { name: 'maxCount', type: 'number', default: '8', desc: '最大图片数量，超限隐藏加号' },
      { name: 'thumbnailSize', type: 'number', default: '100', desc: '缩略图尺寸（px）' },
      { name: 'preview', type: 'boolean', default: 'true', desc: '点击缩略图大图预览（内置 el-image-viewer）' },
      { name: 'accept', type: 'string', default: "''", desc: '接收类型，默认 image/*' },
      { name: 'maxSize', type: 'number', default: '5', desc: '单图大小限制（MB）' },
      { name: 'tip', type: 'string', default: "''", desc: '提示文案' },
      { name: 'modelValue', type: 'string[]', default: '[]', desc: '已上传图片地址数组（v-model）' },
      { name: 'headRefreshDatagrid', type: 'boolean | string', default: 'false', desc: '上传/删除成功后刷新目标 DataGrid' },
      { name: 'filter', type: 'string', default: "''", desc: '联动分组标识' }
    ],
    emits: [
      { name: 'update:modelValue', payload: 'urls', desc: '图片地址数组变化' },
      { name: 'change', payload: 'urls', desc: '图片地址数组变化' },
      { name: 'success', payload: '{ response, file, files }', desc: '上传成功' },
      { name: 'error', payload: '{ response, file }', desc: '上传失败' },
      { name: 'delete-success', payload: '{ file, data? }', desc: '删除成功' },
      { name: 'preview', payload: '{ file }', desc: '点击缩略图' },
      { name: 'exceed', payload: '{ maxCount }', desc: '超出数量限制' },
      { name: 'apiBefore', payload: '{ url, file }', desc: '请求前' },
      { name: 'apiSuccess', payload: '{ data }', desc: '请求成功' },
      { name: 'apiFail', payload: '{ code, message }', desc: '业务失败' },
      { name: 'apiException', payload: '{ error, message }', desc: '网络异常' },
      { name: 'apiAfter', payload: '—', desc: '请求完成' }
    ],
    methods: [
      { name: 'clearFiles()', params: '—', returns: 'void', desc: '清空全部图片（已上传图片的后端删除请走缩略图右上角删除的二次确认流程）' },
      { name: 'uploadRef', params: '—', returns: 'ElUpload 实例（属性）', desc: '内部 el-upload 引用，逃生舱：可调用 el-upload 原生方法' }
    ]
  }
]

/** 辅助组（1 个）：行内展示元素 */
export const elementData: ComponentMeta[] = [
  {
    path: 'tips',
    name: 'WdTips',
    title: 'Tips 提示',
    desc: '文字/响应式提示：word=悬停图标模式，box=行内文字模式，颜色图标可配',
    group: '辅助',
    intro: {
      overview: 'WdTips 是一个轻量的文字/响应式提示组件，提供两种展示模式：`word` 模式渲染一个可悬停的图标，鼠标移入后通过 tooltip 显示提示内容；`box` 模式则把提示文字（可带图标）直接内联展示在页面中。图标与颜色均可配置，适合在表单、表头、字段旁补充说明性文字。',
      whenToUse: [
        '表头或字段标签旁需要「名词解释」类说明，又不想占用版面：用 `word` 模式，悬停图标出提示。',
        '表单分组、操作区附近需要一行简短的行内提示文字：用 `box` 模式。',
        '需要通过颜色/图标区分提示级别（普通信息、警告、疑问）时。',
        '不建议：需要用户确认或交互的提示（应使用 WdConfirmButton、WdPopconfirmButton 等）。',
        '不建议：大段富文本说明（WdTips 只渲染纯文字，不解析 HTML）。'
      ],
      notes: [
        '`word` 模式的 tooltip 固定为 dark 主题、`top` 弹出位置（内部直接使用 el-tooltip 的默认封装，未暴露配置项）。',
        '`icon` 只支持 `InfoFilled` / `WarningFilled` / `QuestionFilled` 三个内置图标；传入其他名字会回退为 `InfoFilled`。',
        '默认插槽仅在 `box` 模式下生效，用于覆盖 `tips` 文字；`word` 模式的提示内容只能来自 `tips` 属性。',
        '`color` 同时作用于图标与文字：word 模式染色图标，box 模式染色整行（图标 + 文字）。',
        'box 模式文字使用小号字号（`--wd-font-size-sm`，默认 12px），适合作为辅助说明而非正文。',
        '表头中使用时建议加 `margin-left` 小间距（如示例中的 `style="margin-left: 6px"`），避免图标紧贴文字。'
      ],
      faq: [
        { q: '传了 `icon="SuccessFilled"` 为什么显示的还是 InfoFilled？', a: '组件内置图标映射表只包含 InfoFilled / WarningFilled / QuestionFilled 三个，未命中的名称会回退到 InfoFilled。' },
        { q: '默认插槽在 word 模式下为什么没效果？', a: '插槽只在 box 模式渲染。word 模式的提示文字只能通过 `tips` 属性传入。' },
        { q: 'tooltip 的弹出位置能改成 bottom 吗？', a: '当前版本 word 模式的 placement 固定为 top，未暴露配置。如需自定义弹出位置，可直接使用 el-tooltip 或按钮类组件的 `tips` / `placement` 属性。' },
        { q: 'tips 内容支持 HTML 吗？', a: '不支持，组件按纯文字渲染。' }
      ]
    },
    props: [
      { name: 'tips', type: 'string', default: "''", desc: '提示内容' },
      { name: 'type', type: "'word' | 'box'", default: "'word'", desc: '展示模式' },
      { name: 'icon', type: "'InfoFilled' | 'WarningFilled' | 'QuestionFilled'", default: "'InfoFilled'", desc: '图标名' },
      { name: 'color', type: 'string', default: "'#909399'", desc: '图标/文字颜色' }
    ],
    slots: [{ name: 'default', params: '—', desc: 'box 模式文字（覆盖 tips）' }]
  }
]


