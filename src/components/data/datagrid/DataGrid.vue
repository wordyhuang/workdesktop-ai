<template>
  <div class="wd-datagrid" :class="{ 'wd-datagrid--auto-height': autoHeight }">
    <!-- 工具栏：左 toolbar 插槽，右 tools 功能按钮 -->
    <div v-if="hasToolbar || hasTools" class="wd-datagrid__toolbar">
      <div class="wd-datagrid__toolbar-left">
        <slot name="toolbar" :selection="selection" :list="list" />
      </div>
      <div class="wd-datagrid__toolbar-right">
        <el-tooltip v-if="toolsConf.refresh" content="刷新" placement="top">
          <el-button circle size="small" @click="refresh">
            <el-icon><Refresh /></el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip v-if="toolsConf.size" content="调整大小" placement="top">
          <el-dropdown trigger="click" @command="onSizeChange">
            <el-button circle size="small">
              <el-icon><ScaleToOriginal /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="large" :disabled="tableSize === 'large'">大</el-dropdown-item>
                <el-dropdown-item command="default" :disabled="tableSize === 'default'">默认</el-dropdown-item>
                <el-dropdown-item command="small" :disabled="tableSize === 'small'">小</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </el-tooltip>
        <el-tooltip v-if="toolsConf.modeSwitch || modeSwitch" content="表格/列表切换" placement="top">
          <el-button circle size="small" @click="toggleMode">
            <el-icon><Grid v-if="viewMode === 'card'" /><Menu v-else /></el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip v-if="toolsConf.columnSetting || dynamicColumn" content="列设置" placement="top">
          <el-button circle size="small" @click="colSettingVisible = true">
            <el-icon><Setting /></el-icon>
          </el-button>
        </el-tooltip>
      </div>
    </div>

    <!-- 表格主体 -->
    <el-table
      v-if="viewMode === 'table'"
      ref="tableRef"
      v-loading="loading"
      :data="list"
      :size="innerSize"
      :border="border"
      :stripe="stripe"
      :height="autoHeight ? '100%' : undefined"
      :row-key="rowKey || undefined"
      :tree-props="treeProps"
      :default-expand-all="defaultExpandAll"
      :span-method="rowspanMethod"
      class="wd-datagrid__table"
      @selection-change="onSelectionChange"
    >
      <el-table-column v-if="withSelection" type="selection" width="60" align="center" reserve-selection />
      <el-table-column v-if="withIndex" type="index" label="序号" width="60" align="center" :index="indexMethod" />

      <!-- 业务列：默认插槽内容（el-table-column），过滤隐藏列 -->
      <ColumnRenderer :vnodes="columnVnodes" />

      <!-- 内置操作列（rowActions） -->
      <el-table-column
        v-if="rowActions.length"
        label="操作"
        :width="actionColumnWidth"
        align="center"
        fixed="right"
      >
        <template #default="{ row }">
          <el-button
            v-for="act in rowActions"
            :key="act.command || act.text"
            link
            size="small"
            :type="(act.type as any) || 'primary'"
            @click="onRowAction(row, act)"
          >{{ act.text }}</el-button>
        </template>
      </el-table-column>

      <template #empty>
        <slot name="empty">
          <el-empty :description="loading ? '加载中...' : '暂无数据'" :image-size="80" />
        </slot>
      </template>
    </el-table>

    <!-- 列表（卡片）模式 -->
    <div v-else class="wd-datagrid__cards" v-loading="loading">
      <el-empty v-if="!list.length" description="暂无数据" :image-size="80" />
      <div v-for="(row, idx) in list" :key="row[rowKey || 'id'] ?? idx" class="wd-datagrid__card">
        <slot name="card-item" :row="row" :index="idx">
          <div class="wd-datagrid__card-title">{{ row.name || row.title || `第 ${idx + 1} 项` }}</div>
          <div class="wd-datagrid__card-body">
            <div v-for="(val, k) in row" :key="k" class="wd-datagrid__card-line">
              <span class="wd-datagrid__card-label">{{ k }}</span>
              <span class="wd-datagrid__card-value">{{ val }}</span>
            </div>
          </div>
        </slot>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="withPager && viewMode === 'table'" class="wd-datagrid__pager">
      <el-pagination
        :current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        :page-sizes="pagerPageSizes"
        :layout="pagerLayout"
        :small="pagerStyle === 'simple'"
        :hide-on-single-page="hideOnSinglePage"
        :background="true"
        @current-change="onChangeCurrentpage"
        @size-change="onChangePagesize"
      />
    </div>

    <!-- 列设置弹层 -->
    <el-dialog v-model="colSettingVisible" title="列设置" width="360px" append-to-body>
      <div class="wd-datagrid__col-setting">
        <div v-for="col in controllableColumns" :key="col.key" class="wd-datagrid__col-item">
          <el-checkbox
            :model-value="col.visible"
            @update:model-value="(v: boolean) => setColumnVisible(col.key, v)"
          >
            {{ col.label }}
          </el-checkbox>
          <div class="wd-datagrid__col-actions">
            <el-button link size="small" :disabled="col.order === 0" @click="moveColumn(col.key, -1)">上移</el-button>
            <el-button
              link
              size="small"
              :disabled="col.order === controllableColumns.length - 1"
              @click="moveColumn(col.key, 1)"
            >下移</el-button>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="resetColumns()">恢复默认</el-button>
        <el-button type="primary" @click="colSettingVisible = false">完成</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, useSlots, watch, defineComponent, type VNode, type PropType } from 'vue'
import { Refresh, Setting, ScaleToOriginal, Grid, Menu } from '@element-plus/icons-vue'
import { useDataGrid } from '../../../lib/composables/useDataGrid'
import { registerDataGrid } from '../../../lib/core/linkage'
import { getGlobalConfig } from '../../../lib/core/config'
import { safeJsonParse } from '../../../lib/core/utils'
import { useColumnSettings } from './useColumnSettings'

defineOptions({ name: 'WdDataGrid' })

/**
 * 列渲染器：把默认插槽里的 el-table-column vnode 渲染进 el-table。
 * 用函数式组件透传 vnode，保留插槽上下文（{ row, column, $index }）。
 */
const ColumnRenderer = defineComponent({
  name: 'WdColumnRenderer',
  props: {
    vnodes: { type: Array as PropType<VNode[]>, default: () => [] }
  },
  render() {
    return this.vnodes
  }
})

const props = defineProps({
  // 数据源
  api: { type: String, default: '' },
  apiMethod: { type: String as PropType<'get' | 'post' | 'put' | 'delete'>, default: 'post' },
  apiParam: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
  active: { type: Boolean, default: false },
  /** 静态数据（数组） */
  dataSource: { type: [Array, Object] as PropType<any[] | any>, default: undefined },
  // 分页 / 搜索 / 模式
  withPager: { type: Boolean, default: true },
  withSearch: { type: Boolean, default: false },
  modeSwitch: { type: Boolean, default: false },
  dynamicColumn: { type: Boolean, default: false },
  columnStorageKey: { type: String, default: '' },
  // 表格展示
  fix: { type: Boolean, default: true },
  border: { type: Boolean, default: false },
  stripe: { type: Boolean, default: false },
  autoHeight: { type: Boolean, default: false },
  rowKey: { type: String, default: '' },
  tableSize: { type: String as PropType<'large' | 'default' | 'small'>, default: 'default' },
  pagerStyle: { type: String as PropType<'simple' | 'normal' | 'full'>, default: 'normal' },
  withIndex: { type: Boolean, default: true },
  withSelection: { type: Boolean, default: false },
  // 行合并
  rowspanKey: { type: String, default: '' },
  rowspanColumn: { type: Array as PropType<string[]>, default: () => [] },
  // 树形
  treeProps: { type: Object, default: () => ({ children: 'children', hasChildren: 'hasChildren' }) },
  defaultExpandAll: { type: Boolean, default: false },
  // tools
  tools: {
    type: Object as PropType<{ refresh?: boolean; columnSetting?: boolean; modeSwitch?: boolean; size?: boolean }>,
    default: () => ({})
  },
  /** 内置操作列配置（渲染行操作按钮，点击 emit row-action） */
  rowActions: {
    type: Array as PropType<Array<{ text: string; command?: string; type?: string }>>,
    default: () => []
  },
  // 联动
  filter: { type: String, default: '' }
})

const emit = defineEmits(['row-action', 'page-change', 'selection-change', 'mode-change', 'loaded', 'apiBefore', 'apiAfter'])

const slots = useSlots()
const tableRef = ref<any>(null)
const viewMode = ref<'table' | 'card'>('table')

// tools 配置合并默认值
const toolsConf = computed(() => ({
  refresh: props.tools.refresh !== false, // 默认 true
  columnSetting: props.tools.columnSetting === true,
  modeSwitch: props.tools.modeSwitch === true,
  size: props.tools.size === true
}))

const hasToolbar = computed(() => !!slots.toolbar)
const hasTools = computed(
  () => toolsConf.value.refresh || toolsConf.value.columnSetting || toolsConf.value.modeSwitch || toolsConf.value.size || props.modeSwitch || props.dynamicColumn
)

// 表格尺寸持久化
const sizeStorageKey = props.columnStorageKey ? `wd:tablesize:${props.columnStorageKey}` : ''
const storedSize = sizeStorageKey ? safeJsonParse(localStorage.getItem(sizeStorageKey), null) : null
const innerSize = ref<'large' | 'default' | 'small'>(storedSize || props.tableSize)
watch(
  () => props.tableSize,
  (v) => {
    if (!storedSize) innerSize.value = v
  }
)
function onSizeChange(cmd: 'large' | 'default' | 'small') {
  innerSize.value = cmd
  if (sizeStorageKey) localStorage.setItem(sizeStorageKey, JSON.stringify(cmd))
}

// 分页档位
const globalCfg = getGlobalConfig()
const pagerPageSizes = globalCfg.page.pager.pageSizes
const hideOnSinglePage = globalCfg.page.pager.hideOnSinglePage
const pagerLayout = computed(() => {
  if (props.pagerStyle === 'simple') return 'prev, pager, next'
  if (props.pagerStyle === 'full') return 'total, sizes, prev, pager, next, jumper'
  return globalCfg.page.pager.layout
})

// 数据控制
const isStatic = computed(() => Array.isArray(props.dataSource))
const grid = useDataGrid({
  api: isStatic.value ? '' : props.api,
  apiMethod: props.apiMethod,
  apiParam: props.apiParam,
  pageSize: globalCfg.page.pager.pageSize,
  immediate: false
})

const { list, total, loading, currentPage, pageSize, selection } = grid

// 静态数据直接渲染
watch(
  () => props.dataSource,
  (val) => {
    if (isStatic.value) {
      list.value = val as any[]
      total.value = (val as any[]).length
    }
  },
  { immediate: true }
)

// 动态列
const {
  columns: colColumns,
  controllableColumns,
  hiddenKeys,
  settingVisible: colSettingVisible,
  init: initColumns,
  setVisible: setColumnVisible,
  move: moveColumn,
  reset: resetColumns
} = useColumnSettings(props.columnStorageKey || undefined)

const columnVnodes = computed<VNode[]>(() => {
  const defaultSlot = slots.default
  if (!defaultSlot) return []
  const vn = defaultSlot()
  // 首次初始化列元信息
  if (!colColumns.value.length) {
    initColumns(vn)
  }
  return filterColumnVnodes(vn, hiddenKeys.value)
})

/** 根据隐藏列 key 过滤插槽 vnode（隐藏的列不渲染） */
function filterColumnVnodes(vnodes: VNode[], hidden: Set<string>): VNode[] {
  const result: VNode[] = []
  vnodes.forEach((vnode) => {
    if (!vnode || typeof vnode !== 'object') {
      if (vnode) result.push(vnode)
      return
    }
    const p = (vnode.props || {}) as Record<string, any>
    const key = String(p.prop || p.columnKey || '')
    // selection/index 列已由组件自身渲染，跳过插槽里用户重复声明的
    if (p.type === 'selection' || p.type === 'index') return
    if (key && hidden.has(key)) return
    result.push(vnode)
  })
  return result
}

// 序号
function indexMethod(index: number) {
  return (currentPage.value - 1) * pageSize.value + index + 1
}

// 行合并
function rowspanMethod({ row, column, rowIndex, columnIndex }: any) {
  if (!props.rowspanKey || !props.rowspanColumn.length) return { rowspan: 1, colspan: 1 }
  const prop = column.property
  if (!props.rowspanColumn.includes(prop)) return { rowspan: 1, colspan: 1 }
  const data = list.value
  const keyVal = row[props.rowspanKey]
  // 该分组第一行计算 span
  const firstIdx = data.findIndex((r) => r[props.rowspanKey] === keyVal)
  if (rowIndex === firstIdx) {
    const span = data.filter((r) => r[props.rowspanKey] === keyVal).length
    return { rowspan: span, colspan: 1 }
  }
  return { rowspan: 0, colspan: 0 }
}

// 事件
function onSelectionChange(rows: any[]) {
  grid.setSelection(rows)
  emit('selection-change', rows)
}

function onChangeCurrentpage(val: number) {
  grid.onChangeCurrentpage(val)
  emit('page-change', { currentPage: val, pageSize: pageSize.value })
}
function onChangePagesize(val: number) {
  grid.onChangePagesize(val)
  emit('page-change', { currentPage: currentPage.value, pageSize: val })
}

function toggleMode() {
  viewMode.value = viewMode.value === 'table' ? 'card' : 'table'
  emit('mode-change', viewMode.value)
}

/** 操作列宽度：按按钮数量估算 */
const actionColumnWidth = computed(() => {
  const w = props.rowActions.reduce((sum, act) => sum + act.text.length * 14 + 16, 20)
  return Math.max(w, 90)
})

/** 内置操作列点击：emit row-action { row, command, text } */
function onRowAction(row: any, act: { text: string; command?: string; type?: string }) {
  emit('row-action', { row, command: act.command ?? act.text, text: act.text })
}

// 对外方法
function requestApi(options?: { apiParam?: Record<string, any> }) {
  if (isStatic.value) return Promise.resolve()
  return grid.fetchData(options?.apiParam).then((res) => {
    emit('loaded', res)
  })
}
function refresh() {
  if (isStatic.value) return Promise.resolve()
  return grid.fetchData().then((res) => emit('loaded', res))
}
function getSelection() {
  return grid.getSelection()
}
function clearSelection() {
  tableRef.value?.clearSelection?.()
  grid.clearSelection()
}
/** 搜索面板联动：带搜索参数查询（重置到第一页） */
function search(params?: Record<string, any>) {
  if (isStatic.value) return Promise.resolve()
  currentPage.value = 1
  return grid.fetchData(params).then((res) => emit('loaded', res))
}
/** 重置搜索并刷新 */
function resetSearch() {
  return grid.reset()
}

defineExpose({
  requestApi,
  refresh,
  onChangePagesize,
  onChangeCurrentpage,
  getSelection,
  clearSelection,
  search,
  resetSearch,
  tableRef
})

// 注册到联动中心
let unregister: (() => void) | null = null
onMounted(() => {
  unregister = registerDataGrid({
    filter: props.filter,
    refresh: () => refresh(),
    search: (params?: Record<string, any>) => search(params),
    resetSearch: () => resetSearch()
  })
  if (props.active && !isStatic.value) {
    requestApi()
  }
})
onBeforeUnmount(() => {
  unregister?.()
})

// api 变化自动重载
watch(
  () => [props.api, props.apiMethod],
  () => {
    if (props.active && !isStatic.value) requestApi()
  }
)
</script>

<style scoped>
.wd-datagrid {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: var(--wd-bg-color, #fff);
}
.wd-datagrid--auto-height {
  height: 100%;
}
.wd-datagrid__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--wd-spacing-base, 12px);
  padding: 0 0 var(--wd-spacing-base, 12px);
  flex-wrap: wrap;
}
.wd-datagrid__toolbar-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.wd-datagrid__toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}
.wd-datagrid__table {
  flex: 1;
  min-height: 0;
}
.wd-datagrid__pager {
  display: flex;
  justify-content: flex-end;
  padding-top: var(--wd-spacing-base, 12px);
}
.wd-datagrid__cards {
  flex: 1;
  min-height: 0;
  overflow: auto;
}
.wd-datagrid__card {
  border: 1px solid var(--wd-border-color-light, #e4e7ed);
  border-radius: var(--wd-radius-base, 4px);
  padding: var(--wd-spacing-base, 12px);
  margin-bottom: var(--wd-spacing-base, 12px);
}
.wd-datagrid__card-title {
  font-weight: 600;
  font-size: var(--wd-font-size-large, 16px);
  color: var(--wd-text-color-primary, #303133);
  margin-bottom: 8px;
}
.wd-datagrid__card-line {
  display: flex;
  font-size: var(--wd-font-size-base, 14px);
  line-height: 1.8;
}
.wd-datagrid__card-label {
  width: 110px;
  color: var(--wd-text-color-secondary, #909399);
  flex-shrink: 0;
}
.wd-datagrid__card-value {
  color: var(--wd-text-color-regular, #606266);
  word-break: break-all;
}
.wd-datagrid__col-setting {
  max-height: 400px;
  overflow: auto;
}
.wd-datagrid__col-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px solid var(--wd-border-color-light, #f0f0f0);
}
.wd-datagrid__col-actions {
  display: flex;
  gap: 4px;
}
</style>
