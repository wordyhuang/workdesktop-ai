import type { ComponentMeta } from './types'

/** 上传组（2 个） */
export const uploadData: ComponentMeta[] = [
  {
    path: 'upload',
    name: 'WdUpload',
    title: 'Upload 文件上传',
    desc: '基于 el-upload：上传 + 后端删除（二次确认）+ 预览确认 + 尺寸限制，auto-upload=false 时手动提交',
    group: '上传',
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
    expose: ['submitUpload', 'clearFiles', 'addFile', 'uploadRef']
  },
  {
    path: 'image-upload',
    name: 'WdImageUpload',
    title: 'ImageUpload 图片上传',
    desc: '图片上传：缩略图网格、数量上限（超限隐藏加号）、点击缩略图集成 Viewer 大图预览',
    group: '上传',
    props: [
      { name: 'api', type: 'string', default: "''", desc: '上传地址' },
      { name: 'deleteApi', type: 'string', default: "''", desc: '后端删除地址' },
      { name: 'deleteMethod', type: "'get' | 'post' | 'put' | 'delete'", default: "'post'", desc: '删除请求方法' },
      { name: 'primaryKey', type: 'string', default: "'id'", desc: '删除主键字段' },
      { name: 'maxCount', type: 'number', default: '8', desc: '最大图片数量，超限隐藏加号' },
      { name: 'thumbnailSize', type: 'number', default: '100', desc: '缩略图尺寸（px）' },
      { name: 'preview', type: 'boolean', default: 'true', desc: '点击缩略图大图预览（集成 Viewer）' },
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
    expose: ['clearFiles', 'uploadRef']
  }
]

/** 样式/工具组（3 个） */
export const miscData: ComponentMeta[] = [
  {
    path: 'panel',
    name: 'WdPanel',
    title: 'Panel 面板',
    desc: '带标题/描述的内容面板，作为表单分组与详情分区容器',
    group: '样式',
    props: [
      { name: 'title', type: 'string', default: "''", desc: '面板标题' },
      { name: 'description', type: 'string', default: "''", desc: '标题旁描述' }
    ],
    slots: [
      { name: 'title', params: '—', desc: '自定义标题区' },
      { name: 'default', params: '—', desc: '主体内容' },
      { name: 'footer', params: '—', desc: '底部' }
    ]
  },
  {
    path: 'tips',
    name: 'WdTips',
    title: 'Tips 提示',
    desc: '文字/响应式提示：word=悬停图标模式，box=行内文字模式，颜色图标可配',
    group: '样式',
    props: [
      { name: 'tips', type: 'string', default: "''", desc: '提示内容' },
      { name: 'type', type: "'word' | 'box'", default: "'word'", desc: '展示模式' },
      { name: 'icon', type: "'InfoFilled' | 'WarningFilled' | 'QuestionFilled'", default: "'InfoFilled'", desc: '图标名' },
      { name: 'color', type: 'string', default: "'#909399'", desc: '图标/文字颜色' }
    ],
    slots: [{ name: 'default', params: '—', desc: 'box 模式文字（覆盖 tips）' }]
  },
  {
    path: 'viewer',
    name: 'WdViewer',
    title: 'Viewer 内容查看器',
    desc: '全屏查看器：图片/PDF/文档预览，缩放/旋转/翻页，键盘方向键控制，图片支持数组轮播',
    group: '工具',
    props: [
      { name: 'modelValue', type: 'boolean', default: 'false', desc: '显隐（v-model）' },
      { name: 'src', type: 'string | string[]', default: "''", desc: '预览地址（数组则轮播）' },
      { name: 'type', type: "'image' | 'pdf' | 'doc'", default: '按后缀推断', desc: '预览类型；缺省按 src 后缀推断' },
      { name: 'zoom', type: 'number', default: '1', desc: '缩放倍率' },
      { name: 'rotate', type: 'number', default: '0', desc: '旋转角度' },
      { name: 'page', type: 'number', default: '1', desc: '当前页（轮播索引）' },
      { name: 'zoomStep', type: 'number', default: '0.2', desc: '缩放步长' },
      { name: 'minZoom', type: 'number', default: '0.2', desc: '最小缩放' },
      { name: 'maxZoom', type: 'number', default: '5', desc: '最大缩放' }
    ],
    emits: [
      { name: 'update:modelValue', payload: 'boolean', desc: '显隐变化' },
      { name: 'zoom-change', payload: 'zoom', desc: '缩放变化' },
      { name: 'rotate-change', payload: 'rotate', desc: '旋转变化' },
      { name: 'page-change', payload: 'page', desc: '翻页' },
      { name: 'open', payload: '—', desc: '打开' },
      { name: 'close', payload: '—', desc: '关闭' }
    ],
    expose: ['open', 'close', 'zoomIn', 'zoomOut', 'rotateLeft', 'rotateRight']
  }
]
