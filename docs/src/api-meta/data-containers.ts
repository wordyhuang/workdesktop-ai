import type { ComponentMeta } from './types'
import { containerProps, optionsProps, optionsEmits } from './types'

/** 容器组（4 个） */
export const containerData: ComponentMeta[] = [
  {
    path: 'dialog',
    name: 'WdDialog',
    title: 'Dialog 对话框容器',
    desc: '基于 el-dialog：iframe 嵌入、关闭前确认、内容守卫（未保存拦截）、关闭后联动刷新',
    group: '容器',
    props: containerProps,
    emits: [
      { name: 'update:modelValue', payload: 'boolean', desc: '显隐变化' },
      { name: 'open', payload: '—', desc: '打开' },
      { name: 'close', payload: '—', desc: '关闭完成' },
      { name: 'confirm', payload: '{ reason }', desc: '关闭流程完成' }
    ],
    slots: [
      { name: 'default', params: '—', desc: '内容（url 未设置时）' },
      { name: 'footer', params: '{ close }', desc: '底部' }
    ],
    expose: ['open']
  },
  {
    path: 'drawer',
    name: 'WdDrawer',
    title: 'Drawer 抽屉容器',
    desc: '基于 el-drawer：iframe 嵌入、返回按钮、关闭前确认、内容守卫、关闭后联动刷新',
    group: '容器',
    props: [
      { name: 'direction', type: "'rtl' | 'ltr' | 'ttb' | 'btt'", default: "'rtl'", desc: '弹出方向' },
      ...containerProps
    ],
    emits: [
      { name: 'update:modelValue', payload: 'boolean', desc: '显隐变化' },
      { name: 'open', payload: '—', desc: '打开' },
      { name: 'close', payload: '—', desc: '关闭完成' },
      { name: 'confirm', payload: '{ reason }', desc: '关闭流程完成' }
    ],
    slots: [
      { name: 'default', params: '—', desc: '内容（url 未设置时）' },
      { name: 'footer', params: '{ close }', desc: '底部' }
    ],
    expose: ['open']
  },
  {
    path: 'iframe',
    name: 'WdIframe',
    title: 'Iframe 内嵌框架',
    desc: '内嵌 iframe：固定/自适应高度，与子页面 postMessage 消息通信（约定 { type:"wd-iframe-height", height }）',
    group: '容器',
    props: [
      { name: 'src', type: 'string', default: "''", desc: 'iframe 地址' },
      { name: 'height', type: 'string | number', default: "'480px'", desc: '固定高度（数字按 px）' },
      { name: 'autoHeight', type: 'boolean', default: 'false', desc: '高度自适应（子页面上报高度）' }
    ],
    emits: [
      { name: 'load', payload: '—', desc: '加载完成' },
      { name: 'message', payload: 'data', desc: '收到 postMessage' }
    ]
  },
  {
    path: 'search-panel',
    name: 'WdSearchPanel',
    title: 'SearchPanel 搜索面板',
    desc: '可折叠搜索区：内置查询/重置按钮，声明式联动同 filter 组 DataGrid（查询重置到第一页、异组不刷新）',
    group: '容器',
    props: [
      { name: 'collapsible', type: 'boolean', default: 'false', desc: '是否可折叠' },
      { name: 'expand', type: 'boolean', default: '—', desc: '展开状态（v-model:expand）' },
      { name: 'defaultExpand', type: 'boolean', default: 'true', desc: '默认是否展开' },
      { name: 'withActions', type: 'boolean', default: 'true', desc: '内置查询/重置按钮' },
      { name: 'searchText', type: 'string', default: "'搜索'", desc: '查询按钮文案' },
      { name: 'resetText', type: 'string', default: "'重置'", desc: '重置按钮文案' },
      { name: 'expandText', type: 'string', default: "'展开'", desc: '展开按钮文案' },
      { name: 'collapseText', type: 'string', default: "'收起'", desc: '收起按钮文案' },
      { name: 'labelWidth', type: 'string | number', default: "'80px'", desc: '标签宽度' },
      { name: 'headRefreshDatagrid', type: 'boolean | string', default: 'false', desc: '查询/重置联动目标 DataGrid' },
      { name: 'filter', type: 'string', default: "''", desc: '联动分组标识' }
    ],
    emits: [
      { name: 'search', payload: 'params', desc: '点击查询' },
      { name: 'reset', payload: '—', desc: '点击重置' },
      { name: 'expand-change', payload: 'boolean', desc: '折叠状态变化' },
      { name: 'update:expand', payload: 'boolean', desc: '折叠状态（v-model）' }
    ],
    slots: [
      { name: 'default', params: '{ model }', desc: '搜索字段（el-form-item + v-model="model.xxx"）' },
      { name: 'actions', params: '{ search, reset }', desc: '操作区' }
    ],
    expose: ['expand', 'collapse', 'resetForm', 'getSearchParams']
  }
]

/** 输入选择组（5 个） */
export const inputData: ComponentMeta[] = [
  {
    path: 'select',
    name: 'WdSelect',
    title: 'Select 下拉选择',
    desc: '基于 el-select：API 自动加载选项、远程搜索、前插/后追加固定项，自定义选项模板',
    group: '输入',
    props: [
      { name: 'modelValue', type: 'any', default: '—', desc: '选中值（v-model）' },
      { name: 'multiple', type: 'boolean', default: 'false', desc: '多选' },
      { name: 'remote', type: 'boolean', default: 'false', desc: '远程搜索' },
      { name: 'filterable', type: 'boolean', default: 'true', desc: '本地可搜索' },
      { name: 'keywordKey', type: 'string', default: "'keyword'", desc: '远程搜索关键字字段名' },
      ...optionsProps
    ],
    emits: optionsEmits,
    slots: [{ name: 'default', params: '{ option, text, value }', desc: '选项内容' }]
  },
  {
    path: 'auto-complete',
    name: 'WdAutoComplete',
    title: 'AutoComplete 自动完成',
    desc: '基于 el-autocomplete：远程搜索、valueKey/labelKey 字段映射、自定义建议模板',
    group: '输入',
    props: [
      { name: 'modelValue', type: 'string', default: "''", desc: '输入值（v-model）' },
      { name: 'valueKey', type: 'string', default: "'value'", desc: '选项值字段' },
      { name: 'labelKey', type: 'string', default: "'text'", desc: '选项显示字段' },
      { name: 'keywordKey', type: 'string', default: "'keyword'", desc: '远程搜索关键字字段名' },
      ...optionsProps
    ],
    emits: [...optionsEmits, { name: 'select', payload: 'raw', desc: '选中建议项（原始对象）' }],
    slots: [{ name: 'default', params: '{ option, text, value }', desc: '建议项内容' }]
  },
  {
    path: 'checkbox-list',
    name: 'WdCheckboxList',
    title: 'CheckboxList 多选列表',
    desc: '基于 el-checkbox-group：API 自动加载选项、按钮样式切换、前插/后追加固定项',
    group: '输入',
    props: [
      { name: 'modelValue', type: 'array', default: '[]', desc: '选中值数组（v-model）' },
      { name: 'buttonStyle', type: 'boolean', default: 'false', desc: '按钮样式' },
      ...optionsProps
    ],
    emits: optionsEmits,
    slots: [{ name: 'default', params: '{ option, text, value }', desc: '选项内容' }]
  },
  {
    path: 'radio-list',
    name: 'WdRadioList',
    title: 'RadioList 单选列表',
    desc: '基于 el-radio-group：API 自动加载选项、按钮样式切换、前插/后追加固定项',
    group: '输入',
    props: [
      { name: 'modelValue', type: 'any', default: '—', desc: '选中值（v-model）' },
      { name: 'buttonStyle', type: 'boolean', default: 'false', desc: '按钮样式' },
      ...optionsProps
    ],
    emits: optionsEmits,
    slots: [{ name: 'default', params: '{ option, text, value }', desc: '选项内容' }]
  },
  {
    path: 'switch',
    name: 'WdSwitch',
    title: 'Switch 状态开关',
    desc: '基于 el-switch：切换即请求、自定义开/关值、失败自动回滚、悬停提示、联动刷新',
    group: '输入',
    props: [
      { name: 'modelValue', type: 'any', default: 'false', desc: '开关值（v-model）' },
      { name: 'api', type: 'string', default: "''", desc: '切换请求地址' },
      { name: 'apiMethod', type: "'get' | 'post'", default: "'post'", desc: '请求方法' },
      { name: 'apiParam', type: 'object', default: '{}', desc: '固定参数' },
      { name: 'paramKey', type: 'string', default: "'status'", desc: '提交参数的字段名' },
      { name: 'activeValue', type: 'any', default: 'true', desc: '开启值' },
      { name: 'inactiveValue', type: 'any', default: 'false', desc: '关闭值' },
      { name: 'tips', type: 'string', default: "''", desc: '悬停提示' },
      { name: 'headRefreshDatagrid', type: 'boolean | string', default: 'false', desc: '成功后刷新目标 DataGrid' },
      { name: 'filter', type: 'string', default: "''", desc: '联动分组标识' }
    ],
    emits: [
      { name: 'update:modelValue', payload: 'value', desc: '开关值变化' },
      { name: 'change', payload: 'value', desc: '切换' },
      { name: 'apiBefore', payload: '{ url }', desc: '请求前' },
      { name: 'apiSuccess', payload: '{ data }', desc: '请求成功' },
      { name: 'apiFail', payload: '{ code, message }', desc: '业务失败（回滚）' },
      { name: 'apiException', payload: '{ error, message }', desc: '网络异常（回滚）' },
      { name: 'apiAfter', payload: '—', desc: '请求完成' }
    ]
  }
]
