/**
 * 组件通用 props 与工具（PRD 4.5 通用设计约定）
 */
import type { PropType } from 'vue'

/** 所有参与联动的组件共有：filter 分组标识（默认 ''） */
export const filterProp = {
  filter: {
    type: String,
    default: ''
  }
}

/** 声明式联动：动作完成后刷新目标 DataGrid（true=同 filter 组 / 字符串=定向） */
export const headRefreshDatagridProp = {
  headRefreshDatagrid: {
    type: [Boolean, String] as PropType<boolean | string>,
    default: false
  }
}

/**
 * 按钮文字属性（属性式写法，也可用默认插槽覆盖）。
 * 命名用 label 而非 text：el-button 的 text 是「文字按钮」布尔开关，通过 $attrs 透传支持，
 * 组件不再截获该名，避免同名冲突（文字按钮样式直接写 text 属性即可）。
 */
export const buttonTextProp = {
  label: { type: String, default: '' }
}

/**
 * 悬停提示共享 props，所有按钮都支持基于 el-tooltip 的悬停提示。
 * 仅当设置非空 tips 时显示 tooltip。
 */
export const tipsProp = {
  /** 悬停提示内容 */
  tips: { type: String, default: '' },
  /** tooltip 主题：dark/light */
  tipsType: { type: String as PropType<'dark' | 'light'>, default: 'dark' },
  /** 弹出位置 */
  placement: {
    type: String as PropType<'top' | 'bottom' | 'left' | 'right' | string>,
    default: 'top'
  }
}

/** API 类共享 props（按钮组 / 输入选择组 / 上传组等能力组件） */
export const apiProps = {
  /** 请求地址（无则不请求） */
  api: { type: String, default: '' },
  /** 请求方法 get/post/put/delete */
  apiMethod: {
    type: String as PropType<'get' | 'post' | 'put' | 'delete'>,
    default: 'post'
  },
  /** 请求参数 */
  apiParam: {
    type: Object as PropType<Record<string, any>>,
    default: () => ({})
  }
}

/** 输入选择组共享 props（PRD 4.4） */
export const optionsProps = {
  ...apiProps,
  apiMethod: {
    type: String as PropType<'get' | 'post'>,
    default: 'get'
  },
  /** 是否自动加载选项（默认 true） */
  active: { type: Boolean, default: true },
  /** 静态选项数组（与 api 二选一） */
  dataSource: { type: Array as PropType<any[]>, default: undefined },
  /** 显示文本字段 */
  textProp: { type: String, default: 'text' },
  /** 值字段 */
  valueProp: { type: String, default: 'value' },
  /** 选项悬停提示字段：数据项该字段非空时，鼠标悬停选项显示 tooltip（默认 tips） */
  tipsProp: { type: String, default: 'tips' },
  /** 选项前插固定项 */
  addData: { type: Array as PropType<any[]>, default: undefined },
  /** 选项后追加固定项 */
  appendData: { type: Array as PropType<any[]>, default: undefined }
}

/** 组件 name 工具：统一 wd- 前缀 */
export function componentName(pascal: string): string {
  return `Wd${pascal}`
}
