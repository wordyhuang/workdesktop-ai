/** 组件 API 元数据：文档页 Props/Emits/Slots 表格数据源（T6.1） */

export interface PropMeta {
  name: string
  type: string
  default: string
  desc: string
}

export interface EventMeta {
  name: string
  payload: string
  desc: string
}

export interface SlotMeta {
  name: string
  params: string
  desc: string
}

export interface MethodMeta {
  /** 方法名（含调用签名，如 search(params?: object)） */
  name: string
  /** 参数说明 */
  params: string
  /** 返回值 */
  returns: string
  /** 方法说明 */
  desc: string
}

/** 组件介绍内容：摘自 document/components/{path}_v1.0.md 的介绍性章节（文本中的 `code` 反引号由 DocPage 渲染为行内代码） */
export interface ComponentIntro {
  /** 概述（整段文字） */
  overview?: string
  /** 何时使用（列表项，含“不建议”项） */
  whenToUse?: string[]
  /** 最佳实践与注意事项（列表项） */
  notes?: string[]
  /** 常见问题 */
  faq?: { q: string; a: string }[]
}

/** 数据类型字段表行（五列，与组件文档「数据类型」章节一致；纯文本，不含 markdown 标记） */
export interface TypeFieldMeta {
  name: string
  type: string
  required: string
  default: string
  desc: string
}

/** 自定义数据类型定义：摘自 document/components/{path}_v1.1.md 的「数据类型」章节 */
export interface DataTypeMeta {
  /** 类型名（含括号副标题，如「tools（工具栏开关对象）」） */
  name: string
  /** 引用位置（支持行内 `code`，如「`columns` prop（EditableColumn[]）」） */
  ref: string
  /** 字段表前的说明段落（支持行内 `code` / **bold**） */
  desc?: string[]
  /** 字段表（纯说明型条目可省略） */
  fields?: TypeFieldMeta[]
  /** 代码块（类型定义 / 结构示例，按 ts 高亮） */
  code?: string
  /** 字段表 / 代码块后的补充说明 */
  after?: string[]
}

export interface ComponentMeta {
  /** 路由/示例文件键（examples/{path}.vue） */
  path: string
  /** 组件 name（Wd 前缀） */
  name: string
  /** 中文名 */
  title: string
  /** 一句话简介 */
  desc: string
  /** 分类分组 label */
  group: string
  /** 组件介绍（概述/何时使用/注意事项/FAQ） */
  intro?: ComponentIntro
  /** 数据类型（Props/Methods/Events 中出现的自定义类型定义） */
  dataTypes?: DataTypeMeta[]
  props: PropMeta[]
  emits?: EventMeta[]
  slots?: SlotMeta[]
  /** 通过 ref 暴露的方法（defineExpose） */
  methods?: MethodMeta[]
}

export interface NavGroup {
  label: string
  items: ComponentMeta[]
}

/** 共享：按钮文字属性（label；默认插槽可覆盖） */
export const buttonLabelProp: PropMeta = {
  name: 'label',
  type: 'string',
  default: "''",
  desc: '按钮文案（未用默认插槽 / #button 插槽时显示）'
}

/**
 * 集成自 el-button 的通用属性（源码未声明，经 $attrs 透传仍全部生效）。
 * 文档列明以便调用方直观使用；其余 el-button 原生属性（事件、原生 button attrs、class/style 等）同样透传。
 * 注意：本库把组件自身的「按钮文案」命名为 label，因此 el-button 的 text（文字按钮开关）不再被截获，可正常透传使用。
 */
const elButtonCommonProps: PropMeta[] = [
  { name: 'type', type: "'primary' | 'success' | 'warning' | 'info' | 'danger'", default: "''", desc: '按钮类型（继承自 el-button）' },
  { name: 'size', type: "'large' | 'default' | 'small'", default: "'default'", desc: '按钮尺寸（继承自 el-button）' },
  { name: 'plain', type: 'boolean', default: 'false', desc: '朴素按钮（继承自 el-button）' },
  { name: 'round', type: 'boolean', default: 'false', desc: '圆角按钮（继承自 el-button）' },
  { name: 'circle', type: 'boolean', default: 'false', desc: '圆形按钮（继承自 el-button）' },
  { name: 'link', type: 'boolean', default: 'false', desc: '链接按钮（继承自 el-button）' },
  { name: 'text', type: 'boolean', default: 'false', desc: '文字按钮样式（继承自 el-button；与按钮文案 label 相互独立）' },
  { name: 'bg', type: 'boolean', default: 'false', desc: '文字按钮背景色（与 text 搭配，继承自 el-button）' },
  { name: 'disabled', type: 'boolean', default: 'false', desc: '禁用（继承自 el-button）' },
  { name: 'icon', type: 'string | Component', default: '—', desc: '图标组件（继承自 el-button）' },
  { name: 'native-type', type: "'button' | 'submit' | 'reset'", default: "'button'", desc: '原生 button 类型（继承自 el-button）' },
  { name: 'autofocus', type: 'boolean', default: 'false', desc: '自动聚焦（继承自 el-button）' },
  { name: 'tag', type: 'string', default: "'button'", desc: '渲染标签（继承自 el-button）' },
  { name: 'color', type: 'string', default: '—', desc: '自定义按钮颜色（继承自 el-button）' },
  { name: 'dark', type: 'boolean', default: 'false', desc: '暗色模式（继承自 el-button）' }
]

/** 通用按钮集成 el-button 属性（Route/Tips/Drawer 等无内部 loading 的按钮） */
export const elButtonProps: PropMeta[] = [
  ...elButtonCommonProps,
  { name: 'loading', type: 'boolean', default: 'false', desc: '加载中（继承自 el-button）' }
]

/**
 * 悬停提示共享 props：所有按钮组件均支持基于 el-tooltip 的悬停提示，
 * tips 属性非空时自动包裹 tooltip；无提示时不包裹，减少层级。
 */
export const tipsProp: PropMeta[] = [
  { name: 'tips', type: 'string', default: "''", desc: '悬停提示内容（非空时自动显示 tooltip）' },
  { name: 'tipsType', type: "'dark' | 'light'", default: "'dark'", desc: 'tooltip 主题（继承自 TipsButton）' },
  { name: 'placement', type: "'top' | 'bottom' | 'left' | 'right'", default: "'top'", desc: '弹出位置（继承自 TipsButton）' }
]

/**
 * API 请求类按钮（Api/Confirm/Prompt）的集成属性：
 * 内部已显式绑定 :loading（由 buttonLoading 控制），外部 loading 透传会被覆盖，故不列出。
 */
export const elButtonPropsNoLoading: PropMeta[] = elButtonCommonProps

/**
 * 集成自 el-popconfirm 的属性（PopconfirmButton 专用）：
 * 其中 icon 命名为 popIcon、disabled 命名为 popDisabled，避免与 el-button 透传的同名属性冲突；
 * placement 复用 TipsButton 的弹出位置属性，同时作用于悬停提示与确认弹层。
 */
export const popconfirmProps: PropMeta[] = [
  { name: 'title', type: 'string', default: "''", desc: '确认提示标题（继承自 el-popconfirm）' },
  { name: 'confirmButtonText', type: 'string', default: "'确定'", desc: '确定按钮文案（继承自 el-popconfirm）' },
  { name: 'cancelButtonText', type: 'string', default: "'取消'", desc: '取消按钮文案（继承自 el-popconfirm）' },
  { name: 'confirmButtonType', type: "'primary' | 'success' | 'warning' | 'danger' | 'info' | 'text'", default: "'primary'", desc: '确定按钮类型（继承自 el-popconfirm）' },
  { name: 'cancelButtonType', type: "'primary' | 'success' | 'warning' | 'danger' | 'info' | 'text'", default: "'text'", desc: '取消按钮类型（继承自 el-popconfirm）' },
  { name: 'popIcon', type: 'string | Component', default: '—', desc: '弹层图标（对应 el-popconfirm 的 icon，改名避免与 el-button icon 冲突）' },
  { name: 'popIconColor', type: 'string', default: "'#f90'", desc: '弹层图标颜色' },
  { name: 'hideAfter', type: 'number', default: '200', desc: '关闭动画时长 ms（继承自 el-popconfirm）' },
  { name: 'popDisabled', type: 'boolean', default: 'false', desc: '禁用确认弹层（对应 el-popconfirm 的 disabled，改名避免冲突）' },
  { name: 'width', type: 'string | number', default: '150', desc: '弹层宽度（继承自 el-popconfirm）' },
  { name: 'trigger', type: "'click' | 'hover' | 'focus' | 'contextmenu'", default: "'click'", desc: '触发方式（继承自 el-popconfirm）' },
  { name: 'popperClass', type: 'string', default: "''", desc: '弹层自定义类名（继承自 el-popconfirm）' },
  { name: 'popperOptions', type: 'object', default: '—', desc: 'popper 配置（继承自 el-popconfirm）' },
  { name: 'showAfter', type: 'number', default: '0', desc: '显示延迟 ms（继承自 el-popconfirm）' },
  { name: 'teleported', type: 'boolean', default: 'true', desc: '是否挂载到 body（继承自 el-popconfirm）' },
  { name: 'persistent', type: 'boolean', default: 'false', desc: '关闭时是否保留内容（继承自 el-popconfirm）' }
]

/** 共享：API 类按钮 props */
export const buttonApiProps: PropMeta[] = [
  { name: 'api', type: 'string', default: "''", desc: '请求地址；为空则不请求' },
  { name: 'apiMethod', type: "'get' | 'post' | 'put' | 'delete'", default: "'post'", desc: '请求方法' },
  { name: 'apiParam', type: 'object', default: '{}', desc: '请求参数，点击时提交' },
  { name: 'buttonLoading', type: 'boolean', default: 'true', desc: '按钮级 loading（false 时按钮不转圈）' },
  { name: 'pageLoading', type: 'boolean', default: 'false', desc: '页面级 loading（全局遮罩 ElLoading）' },
  { name: 'headRefreshDatagrid', type: 'boolean | string', default: 'false', desc: '成功后刷新目标 DataGrid（true=同组 / 字符串=定向）' },
  { name: 'filter', type: 'string', default: "''", desc: '联动分组标识' }
]

/** 共享：选项加载 props */
export const optionsProps: PropMeta[] = [
  { name: 'api', type: 'string', default: "''", desc: '选项接口地址' },
  { name: 'apiMethod', type: "'get' | 'post'", default: "'get'", desc: '选项接口方法' },
  { name: 'apiParam', type: 'object', default: '{}', desc: '接口固定参数' },
  { name: 'active', type: 'boolean', default: 'true', desc: '挂载后自动加载选项' },
  { name: 'dataSource', type: 'array', default: '—', desc: '静态选项数组（与 api 二选一）' },
  { name: 'textProp', type: 'string', default: "'text'", desc: '选项显示文本字段' },
  { name: 'valueProp', type: 'string', default: "'value'", desc: '选项值字段' },
  { name: 'tipsProp', type: 'string', default: "'tips'", desc: '选项悬停提示字段：数据项该字段非空时，鼠标悬停该选项显示 tooltip' },
  { name: 'addData', type: 'array', default: '—', desc: '选项前插固定项' },
  { name: 'appendData', type: 'array', default: '—', desc: '选项后追加固定项' }
]

/** 共享：容器 props */
export const containerProps: PropMeta[] = [
  { name: 'modelValue', type: 'boolean', default: 'false', desc: '显隐（v-model）' },
  { name: 'title', type: 'string', default: "''", desc: '标题' },
  { name: 'url', type: 'string', default: "''", desc: 'iframe 地址（设置后容器内以 iframe 加载）' },
  { name: 'size', type: 'string | number', default: "'50%'", desc: '尺寸（数字按 px）' },
  { name: 'confirmMessage', type: 'string', default: "''", desc: '关闭前确认文案（设置后关闭弹确认）' },
  { name: 'data', type: 'object', default: '—', desc: '容器携带数据（传给内部表单，url 模式拼为 query）' },
  { name: 'headRefreshDatagrid', type: 'boolean | string', default: 'false', desc: '关闭后刷新目标 DataGrid' },
  { name: 'filter', type: 'string', default: "''", desc: '联动分组标识' }
]

const optionsEmits = [
  { name: 'update:modelValue', payload: 'value', desc: '选中值变化' },
  { name: 'change', payload: 'value', desc: '选中值变化（用户操作）' },
  { name: 'apiBefore', payload: '{ url }', desc: '选项请求前' },
  { name: 'apiSuccess', payload: '{ data }', desc: '选项请求成功' },
  { name: 'apiFail', payload: '{ code, message }', desc: '选项请求失败' },
  { name: 'apiAfter', payload: '—', desc: '选项请求完成' }
]

const buttonApiEmits = [
  { name: 'click', payload: 'event', desc: '按钮点击' },
  { name: 'apiBefore', payload: '{ url, method, params }', desc: '请求前' },
  { name: 'apiSuccess', payload: '{ data, code, message }', desc: '请求成功' },
  { name: 'apiFail', payload: '{ code, message }', desc: '业务失败' },
  { name: 'apiException', payload: '{ error, message }', desc: '网络异常' },
  { name: 'apiAfter', payload: '{ data?, error? }', desc: '请求完成' }
]

export { optionsEmits, buttonApiEmits }
