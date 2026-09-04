import type { ComponentMeta } from './types'
import { buttonApiProps, buttonApiEmits } from './types'

/** 按钮组（7 个） */
export const buttonData: ComponentMeta[] = [
  {
    path: 'api-button',
    name: 'WdApiButton',
    title: 'ApiButton 请求按钮',
    desc: '点击发起 API 请求，自动 loading、成功提示与声明式联动刷新',
    group: '按钮',
    props: buttonApiProps,
    emits: buttonApiEmits,
    slots: [{ name: 'default', params: '—', desc: '按钮内容' }]
  },
  {
    path: 'confirm-button',
    name: 'WdConfirmButton',
    title: 'ConfirmButton 确认按钮',
    desc: '点击弹出二次确认，确认后才发起请求；文案可配',
    group: '按钮',
    props: [
      { name: 'confirmText', type: 'string', default: "'确认执行该操作？'", desc: '确认文案' },
      { name: 'cancelText', type: 'string', default: "'取消'", desc: '取消按钮文案' },
      { name: 'confirmTitle', type: 'string', default: "'提示'", desc: '确认框标题' },
      ...buttonApiProps
    ],
    emits: [...buttonApiEmits, { name: 'confirm', payload: '—', desc: '确认后' }, { name: 'cancel', payload: '—', desc: '取消' }],
    slots: [{ name: 'default', params: '—', desc: '按钮内容' }]
  },
  {
    path: 'prompt-button',
    name: 'WdPromptButton',
    title: 'PromptButton 输入按钮',
    desc: '点击弹出输入框，输入值并入请求参数后发起请求',
    group: '按钮',
    props: [
      { name: 'promptTitle', type: 'string', default: "'请输入'", desc: '输入框标题' },
      { name: 'promptPlaceholder', type: 'string', default: "'请输入内容'", desc: '占位文本' },
      { name: 'paramKey', type: 'string', default: "'value'", desc: '输入值并入 apiParam 的字段名' },
      { name: 'promptDefault', type: 'string', default: "''", desc: '输入框默认值' },
      ...buttonApiProps
    ],
    emits: [...buttonApiEmits, { name: 'prompt', payload: 'value', desc: '确认输入' }, { name: 'cancel', payload: '—', desc: '取消' }],
    slots: [{ name: 'default', params: '—', desc: '按钮内容' }]
  },
  {
    path: 'route-button',
    name: 'WdRouteButton',
    title: 'RouteButton 路由按钮',
    desc: '基于 el-button 的路由跳转，支持 name/path、params/query 与 target=_blank 新窗口',
    group: '按钮',
    props: [
      { name: 'routeName', type: 'string', default: "''", desc: '路由 name（与 routePath 二选一）' },
      { name: 'routePath', type: 'string', default: "''", desc: '路由 path' },
      { name: 'params', type: 'object', default: '{}', desc: '路由 params' },
      { name: 'query', type: 'object', default: '{}', desc: '路由 query' },
      { name: 'target', type: "'_self' | '_blank'", default: "'_self'", desc: '打开方式' },
      { name: 'filter', type: 'string', default: "''", desc: '联动分组标识' }
    ],
    emits: [{ name: 'click', payload: 'event', desc: '按钮点击' }],
    slots: [{ name: 'default', params: '—', desc: '按钮内容' }]
  },
  {
    path: 'tips-button',
    name: 'WdTipsButton',
    title: 'TipsButton 提示按钮',
    desc: '基于 el-tooltip 的悬停提示按钮，主题与位置可配',
    group: '按钮',
    props: [
      { name: 'tips', type: 'string', default: "''", desc: '悬停提示内容' },
      { name: 'tipsType', type: "'dark' | 'light'", default: "'dark'", desc: 'tooltip 主题' },
      { name: 'placement', type: "'top' | 'bottom' | 'left' | 'right'", default: "'top'", desc: '弹出位置' },
      { name: 'filter', type: 'string', default: "''", desc: '联动分组标识' }
    ],
    emits: [{ name: 'click', payload: 'event', desc: '按钮点击' }],
    slots: [{ name: 'default', params: '—', desc: '按钮内容' }]
  },
  {
    path: 'drawer-button',
    name: 'WdDrawerButton',
    title: 'DrawerButton 抽屉按钮',
    desc: '点击打开 Drawer 抽屉，支持 iframe 嵌入或内部插槽表单，关闭后声明式联动刷新',
    group: '按钮',
    props: [
      { name: 'text', type: 'string', default: "''", desc: '按钮文案（也可用 #button 插槽）' },
      { name: 'drawerTitle', type: 'string', default: "''", desc: '抽屉标题' },
      { name: 'drawerUrl', type: 'string', default: "''", desc: 'iframe 地址（设置后抽屉内以 iframe 加载）' },
      { name: 'drawerData', type: 'object', default: '{}', desc: '传给内部表单/iframe 的数据' },
      { name: 'size', type: 'string | number', default: "'50%'", desc: '抽屉尺寸' },
      { name: 'direction', type: "'rtl' | 'ltr' | 'ttb' | 'btt'", default: "'rtl'", desc: '弹出方向' },
      { name: 'headRefreshDatagrid', type: 'boolean | string', default: 'false', desc: '关闭后刷新目标 DataGrid' },
      { name: 'filter', type: 'string', default: "''", desc: '联动分组标识' }
    ],
    emits: [
      { name: 'open', payload: '—', desc: '抽屉打开' },
      { name: 'close', payload: '—', desc: '抽屉关闭' },
      { name: 'confirm', payload: 'payload', desc: '内部 confirm 透传' }
    ],
    slots: [
      { name: 'button', params: '—', desc: '触发按钮' },
      { name: 'default', params: '{ data, close }', desc: '抽屉内容（通常为 DataForm）' },
      { name: 'footer', params: 'footerProps', desc: '抽屉底部' }
    ]
  },
  {
    path: 'dialog-button',
    name: 'WdDialogButton',
    title: 'DialogButton 对话框按钮',
    desc: '点击打开 Dialog 对话框，支持 iframe 嵌入或内部插槽表单，关闭后声明式联动刷新',
    group: '按钮',
    props: [
      { name: 'text', type: 'string', default: "''", desc: '按钮文案（也可用 #button 插槽）' },
      { name: 'dialogTitle', type: 'string', default: "''", desc: '对话框标题' },
      { name: 'dialogUrl', type: 'string', default: "''", desc: 'iframe 地址' },
      { name: 'dialogData', type: 'object', default: '{}', desc: '传给内部内容/iframe 的数据' },
      { name: 'size', type: 'string | number', default: "'50%'", desc: '对话框宽度' },
      { name: 'headRefreshDatagrid', type: 'boolean | string', default: 'false', desc: '关闭后刷新目标 DataGrid' },
      { name: 'filter', type: 'string', default: "''", desc: '联动分组标识' }
    ],
    emits: [
      { name: 'open', payload: '—', desc: '对话框打开' },
      { name: 'close', payload: '—', desc: '对话框关闭' },
      { name: 'confirm', payload: 'payload', desc: '内部 confirm 透传' }
    ],
    slots: [
      { name: 'button', params: '—', desc: '触发按钮' },
      { name: 'default', params: '{ data, close }', desc: '对话框内容（通常为 DataForm）' },
      { name: 'footer', params: 'footerProps', desc: '对话框底部' }
    ]
  }
]
