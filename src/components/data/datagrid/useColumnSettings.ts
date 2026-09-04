import { ref, computed, nextTick } from 'vue'
import type { VNode } from 'vue'
import { safeJsonParse } from '../../../lib/core/utils'

/**
 * 动态列：从默认插槽的 el-table-column vnode 中提取列元信息，
 * 支持显示/隐藏/排序，状态可持久化到 localStorage（PRD 4.2）。
 */

export interface ColumnMeta {
  /** el-table-column 的 key（prop 或自动 id） */
  key: string
  label: string
  /** 用户可控制的业务列（selection/index 等内置列不可控） */
  controllable: boolean
  visible: boolean
  order: number
}

/**
 * 从插槽 vnode 数组中解析列
 */
export function extractColumns(vnodes: VNode[]): ColumnMeta[] {
  const columns: ColumnMeta[] = []
  let auto = 0
  const walk = (nodes: VNode[]) => {
    nodes.forEach((vnode) => {
      if (!vnode || typeof vnode !== 'object') return
      const props = (vnode.props || {}) as Record<string, any>
      // el-table-column 判定：type 显示声明或组件 name
      const typeName =
        (vnode.type as any)?.name ||
        (vnode.type as any)?.__name ||
        ''
      const isColumn =
        String(typeName).includes('TableColumn') ||
        (vnode.type as any) === Symbol.for('el-table-column') ||
        // 全局注册组件时 type 为对象带 name
        typeName === 'ElTableColumn'

      if (isColumn || props.prop || props.label || props.type) {
        auto += 1
        const colType = props.type // selection / index / expand
        const key = String(props.prop || props.columnKey || `col-${auto}`)
        columns.push({
          key,
          label: props.label || key,
          controllable: !colType,
          visible: props.hidden !== true,
          order: columns.length
        })
      }
      // 递归子节点（fragment）
      const children = (vnode as any).children
      if (Array.isArray(children)) {
        walk(children.filter((c: any) => c && typeof c === 'object') as VNode[])
      }
    })
  }
  walk(vnodes)
  return columns
}

export function useColumnSettings(storageKey?: string) {
  const columns = ref<ColumnMeta[]>([])
  const settingVisible = ref(false)

  const storageKeyName = storageKey ? `wd:columns:${storageKey}` : ''

  function loadStored(): Record<string, { visible?: boolean; order?: number }> {
    if (!storageKeyName || typeof localStorage === 'undefined') return {}
    return safeJsonParse(localStorage.getItem(storageKeyName), {})
  }

  function persist() {
    if (!storageKeyName || typeof localStorage === 'undefined') return
    const data: Record<string, any> = {}
    columns.value.forEach((c, i) => {
      data[c.key] = { visible: c.visible, order: i }
    })
    localStorage.setItem(storageKeyName, JSON.stringify(data))
  }

  function init(vnodes: VNode[]) {
    const parsed = extractColumns(vnodes)
    const stored = loadStored()
    columns.value = parsed.map((col) => {
      const s = stored[col.key]
      if (s) {
        return { ...col, visible: s.visible ?? col.visible, order: s.order ?? col.order }
      }
      return col
    })
    columns.value.sort((a, b) => a.order - b.order)
  }

  function setVisible(key: string, visible: boolean) {
    const col = columns.value.find((c) => c.key === key)
    if (col) {
      col.visible = visible
      persist()
    }
  }

  function move(key: string, direction: -1 | 1) {
    const idx = columns.value.findIndex((c) => c.key === key)
    const target = idx + direction
    if (idx < 0 || target < 0 || target >= columns.value.length) return
    const arr = columns.value.slice()
    const [item] = arr.splice(idx, 1)
    arr.splice(target, 0, item)
    arr.forEach((c, i) => (c.order = i))
    columns.value = arr
    persist()
  }

  function reset() {
    columns.value.forEach((c) => (c.visible = true))
    columns.value.sort((a, b) => a.order - b.order)
    if (storageKeyName && typeof localStorage !== 'undefined') {
      localStorage.removeItem(storageKeyName)
    }
  }

  /** 隐藏列的 key 集合，供模板过滤插槽 vnode */
  const hiddenKeys = computed(() => new Set(columns.value.filter((c) => !c.visible).map((c) => c.key)))

  const controllableColumns = computed(() => columns.value.filter((c) => c.controllable))

  return {
    columns,
    controllableColumns,
    hiddenKeys,
    settingVisible,
    init,
    setVisible,
    move,
    reset,
    nextTick
  }
}
