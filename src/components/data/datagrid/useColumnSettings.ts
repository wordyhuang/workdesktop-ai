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

/** 判定 vnode 是否为 el-table-column（type 显式声明或组件 name 匹配） */
function isColumnVNode(vnode: VNode): boolean {
  const props = (vnode.props || {}) as Record<string, any>
  const typeName =
    (vnode.type as any)?.name ||
    (vnode.type as any)?.__name ||
    ''
  return (
    String(typeName).includes('TableColumn') ||
    (vnode.type as any) === Symbol.for('el-table-column') ||
    // 全局注册组件时 type 为对象带 name
    typeName === 'ElTableColumn' ||
    !!(props.prop || props.label || props.type)
  )
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

      if (isColumnVNode(vnode)) {
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

/**
 * 按列设置中的 order 重排业务列 vnode。
 * key 解析规则必须与 extractColumns 完全一致（含自动编号计数），
 * 未匹配到列设置的 vnode 保持原相对顺序排在末尾。
 */
export function orderColumnVnodes(vnodes: VNode[], orderMap: Map<string, number>): VNode[] {
  let auto = 0
  const keyOf = (vnode: VNode): string => {
    const props = (vnode.props || {}) as Record<string, any>
    if (isColumnVNode(vnode)) {
      auto += 1
      return String(props.prop || props.columnKey || `col-${auto}`)
    }
    return ''
  }
  return vnodes
    .map((vnode, index) => ({ vnode, index, order: orderMap.get(keyOf(vnode)) }))
    .sort((a, b) => {
      if (a.order == null && b.order == null) return a.index - b.index
      if (a.order == null) return 1
      if (b.order == null) return -1
      return a.order - b.order
    })
    .map((item) => item.vnode)
}

export function useColumnSettings(storageKey?: string) {
  const columns = ref<ColumnMeta[]>([])
  /** 初始列定义快照（插槽声明顺序），供「恢复默认」还原 */
  let initialColumns: ColumnMeta[] = []
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

  /** 合并本地存储的显隐/排序后写入列状态 */
  function applyParsed(parsed: ColumnMeta[]) {
    initialColumns = parsed.map((col) => ({ ...col }))
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

  function init(vnodes: VNode[]) {
    applyParsed(extractColumns(vnodes))
  }

  /** 直接以列元信息初始化（columns 配置驱动的组件用，如 EditableGrid） */
  function initMetas(metas: Array<{ key: string; label: string; controllable?: boolean; visible?: boolean }>) {
    applyParsed(
      metas.map((m, i) => ({
        key: m.key,
        label: m.label,
        controllable: m.controllable !== false,
        visible: m.visible !== false,
        order: i
      }))
    )
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

  /**
   * 拖拽重排：把 fromKey 拖到 toKey 的前面（before）或后面（after）。
   * 仅允许在可控列之间拖拽，selection/index 等内置列不参与。
   */
  function reorder(fromKey: string, toKey: string, position: 'before' | 'after' = 'before') {
    if (!fromKey || !toKey || fromKey === toKey) return
    const arr = columns.value.slice()
    const fromIdx = arr.findIndex((c) => c.key === fromKey)
    if (fromIdx < 0) return
    if (!arr[fromIdx].controllable) return
    const [item] = arr.splice(fromIdx, 1)
    let insertIdx = arr.findIndex((c) => c.key === toKey)
    if (insertIdx < 0 || !arr[insertIdx].controllable) return
    if (position === 'after') insertIdx += 1
    arr.splice(insertIdx, 0, item)
    arr.forEach((c, i) => (c.order = i))
    columns.value = arr
    persist()
  }

  /** 恢复到插槽声明时的原始顺序与显隐状态 */
  function reset() {
    columns.value = initialColumns.map((col, i) => ({ ...col, visible: true, order: i }))
    if (storageKeyName && typeof localStorage !== 'undefined') {
      localStorage.removeItem(storageKeyName)
    }
  }

  /** 隐藏列的 key 集合，供模板过滤插槽 vnode */
  const hiddenKeys = computed(() => new Set(columns.value.filter((c) => !c.visible).map((c) => c.key)))

  /** 列 key → 当前排序位置，供插槽 vnode 重排 */
  const columnOrderMap = computed(() => new Map(columns.value.map((c, i) => [c.key, i])))

  const controllableColumns = computed(() => columns.value.filter((c) => c.controllable))

  return {
    columns,
    controllableColumns,
    hiddenKeys,
    columnOrderMap,
    settingVisible,
    init,
    initMetas,
    setVisible,
    move,
    reorder,
    reset,
    nextTick
  }
}
