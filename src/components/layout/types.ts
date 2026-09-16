/**
 * WdStation 类型定义
 */

/** 菜单项（统一模型：分组 Group → 菜单树，建议两层） */
export interface StationMenuItem {
  /** 菜单标题 */
  title: string
  /** 图标（@element-plus/icons-vue 名称字符串，或直接传组件） */
  icon?: string | object
  /** 路由路径（router 模式点击 push；html 模式仅作标识） */
  path?: string
  /** 路由名称（可选，key 兜底优先级高于 path） */
  name?: string
  /** 角标 */
  badge?: string | number
  /** 禁用 */
  disabled?: boolean
  /** tabs 模式下固定标签（自动开启、不可关闭） */
  affix?: boolean
  /** 扁平喂法：所属分组标题 */
  group?: string
  /** 扁平喂法：所属分组 key（缺省取 group） */
  groupKey?: string
  /** 扁平喂法：所属分组图标 */
  groupIcon?: string | object
  /** 子菜单（递归，建议不超过两层） */
  children?: StationMenuItem[]
  [key: string]: any
}

/** 菜单分组（分导台条目） */
export interface StationMenuGroup {
  /** 分组唯一标识 */
  key: string
  /** 分组标题 */
  title: string
  /** 分组图标 */
  icon?: string | object
  /** 组内菜单树 */
  menus: StationMenuItem[]
}

/** 已开启标签 */
export interface StationTab {
  key: string
  title: string
  path?: string
  affix?: boolean
}

/** 工具栏点位配置：refresh/settings/user/login 各自可放 left / right / none */
export interface StationToolbarConfig {
  refresh?: 'left' | 'right' | 'none'
  settings?: 'left' | 'right' | 'none'
  user?: 'left' | 'right' | 'none'
  login?: 'left' | 'right' | 'none'
}
