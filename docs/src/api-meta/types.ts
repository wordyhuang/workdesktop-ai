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
  props: PropMeta[]
  emits?: EventMeta[]
  slots?: SlotMeta[]
  expose?: string[]
}

export interface NavGroup {
  label: string
  items: ComponentMeta[]
}

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
