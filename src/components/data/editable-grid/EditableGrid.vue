<template>
  <div
    ref="rootRef"
    class="wd-editable-grid"
    :class="{ 'wd-editable-grid--auto-height': autoHeight }"
    :style="rootStyle"
  >
    <!-- 工具栏：左 toolbar 插槽 + 新增按钮，右 批量保存 + actions + tools 功能按钮 -->
    <div v-if="withToolbar && (hasToolbar || hasTools)" class="wd-editable-grid__toolbar">
      <div class="wd-editable-grid__toolbar-left">
        <slot name="toolbar" :dirty-rows="dirtyRows" :rows="rows" :selection="selection">
          <el-button v-if="withAdd" type="primary" :icon="Plus" @click="addRow">{{ addButtonText }}</el-button>
        </slot>
      </div>
      <div class="wd-editable-grid__toolbar-right">
        <el-button
          v-if="withSave"
          type="success"
          :loading="saving"
          :disabled="!dirtyRows.length"
          @click="saveAll"
        >
          {{ saveButtonText }}<span v-if="dirtyRows.length">（{{ dirtyRows.length }}）</span>
        </el-button>
        <slot name="actions" :dirty-rows="dirtyRows" :rows="rows" :selection="selection" />
        <el-tooltip v-if="toolsConf.refresh" content="刷新" placement="top">
          <el-button circle @click="refresh">
            <el-icon><Refresh /></el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip v-if="toolsConf.size" content="调整大小" placement="top">
          <el-dropdown trigger="click" @command="onSizeChange">
            <el-button circle>
              <el-icon><ScaleToOriginal /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="large" :disabled="innerSize === 'large'">大</el-dropdown-item>
                <el-dropdown-item command="default" :disabled="innerSize === 'default'">默认</el-dropdown-item>
                <el-dropdown-item command="small" :disabled="innerSize === 'small'">小</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </el-tooltip>
        <el-tooltip v-if="toolsConf.modeSwitch || modeSwitch" content="表格/列表切换" placement="top">
          <el-button circle @click="toggleMode">
            <el-icon><Grid v-if="viewMode === 'card'" /><Menu v-else /></el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip v-if="toolsConf.columnSetting || dynamicColumn" content="列设置" placement="top">
          <el-button circle @click="colSettingVisible = true">
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
      :data="rows"
      :size="innerSize"
      :border="border"
      :stripe="stripe"
      :height="tableHeight"
      :row-key="rowKey || undefined"
      :tree-props="treeProps"
      :default-expand-all="defaultExpandAll"
      :span-method="rowspanMethod"
      class="wd-editable-grid__table"
      @selection-change="onSelectionChange"
      @cell-click="onCellClick"
    >
      <el-table-column v-if="withSelection" type="selection" width="60" align="center" reserve-selection />
      <el-table-column v-if="withIndex" type="index" label="序号" width="60" align="center" :index="indexMethod" />

      <!-- 可编辑列（columns 配置驱动） -->
      <el-table-column
        v-for="col in visibleColumns"
        :key="col.prop"
        :prop="col.prop"
        :label="col.label"
        :width="col.width"
        :min-width="col.minWidth"
        :align="col.align || 'left'"
        :fixed="col.fixed"
      >
        <template #default="{ row, $index }">
          <!-- 行编辑模式 -->
          <template v-if="editMode === 'row'">
            <div class="wd-editable-grid__cell" :class="cellState($index, col)" :title="cellErrorText($index, col) || undefined">
              <el-input
                v-if="isRowEditing($index) && col.editor === 'input'"
                v-model="row[col.prop]"
                :placeholder="col.placeholder"
                @change="markCellChanged($index, col)"
              />
              <el-input-number
                v-else-if="isRowEditing($index) && col.editor === 'number'"
                v-model="row[col.prop]"
                :min="col.min"
                :max="col.max"
                :precision="col.precision"
                @change="markCellChanged($index, col)"
              />
              <el-select
                v-else-if="isRowEditing($index) && col.editor === 'select'"
                v-model="row[col.prop]"
                :placeholder="col.placeholder"
                @change="markCellChanged($index, col)"
              >
                <el-option v-for="opt in col.options || []" :key="opt.value" :label="opt.text" :value="opt.value" />
              </el-select>
              <el-date-picker
                v-else-if="isRowEditing($index) && col.editor === 'date'"
                v-model="row[col.prop]"
                type="date"
                value-format="YYYY-MM-DD"
                :placeholder="col.placeholder"
                @change="markCellChanged($index, col)"
              />
              <slot v-else-if="isRowEditing($index)" :name="`edit-${col.prop}`" :row="row" :index="$index" :column="col">
                <el-input v-model="row[col.prop]" :placeholder="col.placeholder" @change="markCellChanged($index, col)" />
              </slot>
              <span v-else>{{ formatCell(row, col) }}</span>
              <template v-if="cellState($index, col)['is-dirty']">
                <el-tooltip content="已修改" placement="top">
                  <slot name="dirty-tip-{{ col.prop }}" :row="row" :column="col" :index="$index">
                    <el-icon class="wd-editable-grid__cell-dirty-icon">
                      <WarningFilled />
                    </el-icon>
                  </slot>
                </el-tooltip>
              </template>
            </div>
          </template>

          <!-- 单元格编辑模式 -->
          <template v-else>
            <div class="wd-editable-grid__cell" :class="cellState($index, col)" :title="cellErrorText($index, col) || undefined">
              <el-input
                v-if="activeCell === cellKey($index, col.prop) && col.editor === 'input'"
                v-model="row[col.prop]"
                :ref="focusCell"
                :placeholder="col.placeholder"
                @change="markCellChanged($index, col)"
                @blur="deactivateCell"
              />
              <el-input-number
                v-else-if="activeCell === cellKey($index, col.prop) && col.editor === 'number'"
                v-model="row[col.prop]"
                :ref="focusCell"
                :min="col.min"
                :max="col.max"
                :precision="col.precision"
                @change="markCellChanged($index, col)"
                @blur="deactivateCell"
              />
              <el-select
                v-else-if="activeCell === cellKey($index, col.prop) && col.editor === 'select'"
                v-model="row[col.prop]"
                :ref="focusCell"
                :placeholder="col.placeholder"
                @change="onSelectChange($index, col)"
                @blur="deactivateCell"
              >
                <el-option v-for="opt in col.options || []" :key="opt.value" :label="opt.text" :value="opt.value" />
              </el-select>
              <el-date-picker
                v-else-if="activeCell === cellKey($index, col.prop) && col.editor === 'date'"
                v-model="row[col.prop]"
                type="date"
                value-format="YYYY-MM-DD"
                :placeholder="col.placeholder"
                @change="onDateChange($index, col)"
              />
              <slot
                v-else-if="activeCell === cellKey($index, col.prop)"
                :name="`edit-${col.prop}`"
                :row="row"
                :index="$index"
                :column="col"
              >
                <el-input v-model="row[col.prop]" :placeholder="col.placeholder" @change="markCellChanged($index, col)" />
              </slot>
              <span v-else>{{ formatCell(row, col) }}</span>
              <template v-if="cellState($index, col)['is-dirty']">
                <el-tooltip content="已修改" placement="top">
                  <slot name="dirty-tip-{{ col.prop }}" :row="row" :column="col" :index="$index">
                    <el-icon class="wd-editable-grid__cell-dirty-icon">
                      <WarningFilled />
                    </el-icon>
                  </slot>
                </el-tooltip>
              </template>
            </div>
          </template>
        </template>
      </el-table-column>

      <!-- 额外业务列：默认插槽内容（el-table-column），过滤隐藏列 -->
      <ColumnRenderer :vnodes="slotColumnVnodes" />

      <!-- 内置操作列（rowActions 配置） -->
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

      <!-- 可编辑操作列 -->
      <el-table-column
        v-if="withActions"
        label="操作"
        :width="actionWidth"
        align="center"
        fixed="right"
      >
        <template #default="{ row, $index }">
          <template v-if="editMode === 'row'">
            <template v-if="isRowEditing($index)">
              <el-button link type="primary" @click="saveRow($index)">保存</el-button>
              <el-button link @click="cancelRow($index)">取消</el-button>
            </template>
            <el-button v-else link type="primary" @click="startEditRow($index)">编辑</el-button>
          </template>
          <el-button v-if="withDelete" link type="danger" @click="removeRow($index)">删除</el-button>
          <slot name="row-actions" :row="row" :index="$index" />
        </template>
      </el-table-column>

      <template #empty>
        <slot name="empty">
          <el-empty :description="loading ? '加载中...' : '暂无数据'" :image-size="80" />
        </slot>
      </template>
    </el-table>

    <!-- 列表（卡片）模式 -->
    <div v-else class="wd-editable-grid__cards" v-loading="loading">
      <el-empty v-if="!rows.length" description="暂无数据" :image-size="80" />
      <div v-for="(row, idx) in rows" :key="row[rowKey || 'id'] ?? idx" class="wd-editable-grid__card">
        <slot name="card-item" :row="row" :index="idx">
          <div class="wd-editable-grid__card-title">{{ row.name || row.title || `第 ${idx + 1} 项` }}</div>
          <div class="wd-editable-grid__card-body">
            <div v-for="(val, k) in row" :key="k" class="wd-editable-grid__card-line">
              <span class="wd-editable-grid__card-label">{{ k }}</span>
              <span class="wd-editable-grid__card-value">{{ val }}</span>
            </div>
          </div>
        </slot>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="withPager && viewMode === 'table'" class="wd-editable-grid__pager">
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
      <div class="wd-editable-grid__col-setting">
        <div v-for="col in controllableColumns" :key="col.key" class="wd-editable-grid__col-item">
          <el-checkbox
            :model-value="col.visible"
            @update:model-value="(v: boolean) => setColumnVisible(col.key, v)"
          >
            {{ col.label }}
          </el-checkbox>
          <div class="wd-editable-grid__col-actions">
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
import {
  ref,
  reactive,
  computed,
  onMounted,
  onBeforeUnmount,
  useSlots,
  watch,
  nextTick,
  defineComponent,
  type VNode,
  type PropType
} from 'vue'
import { Plus, Refresh, Setting, ScaleToOriginal, Grid, Menu, WarningFilled } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import Schema from 'async-validator'
import { useDataGrid } from '../../../lib/composables/useDataGrid'
import { registerDataGrid, refreshDataGrid } from '../../../lib/core/linkage'
import { getGlobalConfig } from '../../../lib/core/config'
import { safeJsonParse } from '../../../lib/core/utils'
import { request } from '../../../lib/core/http'
import { filterProp, headRefreshDatagridProp } from '../../common/props'
import { useColumnSettings, extractColumns } from '../datagrid/useColumnSettings'

defineOptions({ name: 'WdEditableGrid' })

/** 可编辑列配置 */
export interface EditableColumn {
  prop: string
  label: string
  width?: string | number
  minWidth?: string | number
  align?: 'left' | 'center' | 'right'
  fixed?: boolean | 'left' | 'right'
  /** 编辑器类型：input/number/select/date；默认 input */
  editor?: 'input' | 'number' | 'select' | 'date'
  editable?: boolean
  placeholder?: string
  /** select 选项 */
  options?: { text: string; value: any }[]
  /** number 约束 */
  min?: number
  max?: number
  precision?: number
  /** 必填校验 */
  required?: boolean
  /** 自定义校验：返回错误文案，空串/undefined 为通过 */
  validator?: (value: any, row: Record<string, any>) => string | undefined
  /**
   * 单元格内容校验规则（与 ElForm 的 rules 完全一致，基于 async-validator）。
   * 规则不满足时单元格显示约束样式，并在保存/行内保存时中断并提示。
   */
  rules?: Array<Record<string, any>>
  /** 展示格式化（只读态） */
  formatter?: (row: Record<string, any>, col: EditableColumn) => string
}

/**
 * 列渲染器：把默认插槽里的 el-table-column vnode 渲染进 el-table，
 * 保留插槽上下文（{ row, column, $index }）。
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
  ...filterProp,
  ...headRefreshDatagridProp,
  // ---- 可编辑列与数据 ----
  /** 可编辑列配置 */
  columns: {
    type: Array as PropType<EditableColumn[]>,
    default: () => []
  },
  /** 行数据（v-model，静态数据推荐用法） */
  modelValue: {
    type: Array as PropType<Record<string, any>[]>,
    default: () => []
  },
  /** 编辑模式：cell=单元格点击编辑（默认）；row=行编辑 */
  editMode: {
    type: String as PropType<'cell' | 'row'>,
    default: 'cell'
  },
  /** 批量保存地址；为空时仅本地保存并 emit save */
  saveApi: { type: String, default: '' },
  saveMethod: {
    type: String as PropType<'post' | 'put'>,
    default: 'post'
  },
  /** 新增行默认值（对象或工厂函数） */
  defaultRow: {
    type: [Object, Function] as PropType<Record<string, any> | (() => Record<string, any>)>,
    default: undefined
  },
  // ---- 数据源（继承 DataGrid：API / 静态） ----
  api: { type: String, default: '' },
  apiMethod: { type: String as PropType<'get' | 'post' | 'put' | 'delete'>, default: 'post' },
  apiParam: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
  active: { type: Boolean, default: false },
  /** 静态数据（数组）；不传时回退到 modelValue */
  dataSource: { type: [Array, Object] as PropType<any[] | any>, default: undefined },
  // ---- 分页 / 搜索 / 模式（继承 DataGrid） ----
  withPager: { type: Boolean, default: true },
  withSearch: { type: Boolean, default: false },
  modeSwitch: { type: Boolean, default: false },
  dynamicColumn: { type: Boolean, default: false },
  columnStorageKey: { type: String, default: '' },
  // ---- 表格展示（继承 DataGrid） ----
  fix: { type: Boolean, default: true },
  border: { type: Boolean, default: true },
  stripe: { type: Boolean, default: true },
  height: { type: [String, Number] as PropType<string | number>, default: undefined },
  autoHeight: { type: Boolean, default: false },
  rowKey: { type: String, default: 'id' },
  tableSize: { type: String as PropType<'large' | 'default' | 'small'>, default: 'default' },
  pagerStyle: { type: String as PropType<'simple' | 'normal' | 'full'>, default: 'normal' },
  withIndex: { type: Boolean, default: false },
  withSelection: { type: Boolean, default: false },
  // 行合并
  rowspanKey: { type: String, default: '' },
  rowspanColumn: { type: Array as PropType<string[]>, default: () => [] },
  // 树形
  treeProps: { type: Object, default: () => ({ children: 'children', hasChildren: 'hasChildren' }) },
  defaultExpandAll: { type: Boolean, default: false },
  // tools（继承 DataGrid）
  tools: {
    type: Object as PropType<{
      refresh?: boolean
      columnSetting?: boolean
      modeSwitch?: boolean
      size?: boolean
    }>,
    default: () => ({})
  },
  /** 内置只读操作列配置（渲染行操作按钮，点击 emit row-action） */
  rowActions: {
    type: Array as PropType<Array<{ text: string; command?: string; type?: string }>>,
    default: () => []
  },
  // ---- 可编辑能力开关 ----
  withToolbar: { type: Boolean, default: true },
  withAdd: { type: Boolean, default: true },
  withSave: { type: Boolean, default: true },
  withDelete: { type: Boolean, default: true },
  withActions: { type: Boolean, default: true },
  // ---- 文案 ----
  addButtonText: { type: String, default: '新增一行' },
  saveButtonText: { type: String, default: '批量保存' },
  actionWidth: { type: [String, Number], default: 150 }
})

const emit = defineEmits([
  'update:modelValue',
  'change',
  'save',
  'row-add',
  'row-remove',
  'validate-fail',
  'row-action',
  'page-change',
  'selection-change',
  'mode-change',
  'loaded',
  'apiBefore',
  'apiSuccess',
  'apiFail',
  'apiException',
  'apiAfter'
])

const slots = useSlots()
const tableRef = ref<any>(null)
const rootRef = ref<HTMLElement | null>(null)
const viewMode = ref<'table' | 'card'>('table')

// ============ 数据源：API（useDataGrid）/ 静态 ============
const globalCfg = getGlobalConfig()
const pagerPageSizes = globalCfg.page.pager.pageSizes
const hideOnSinglePage = globalCfg.page.pager.hideOnSinglePage

const isStatic = computed(() => Array.isArray(props.dataSource) || (!props.api && props.modelValue.length > 0))

const grid = useDataGrid({
  api: isStatic.value ? '' : props.api,
  apiMethod: props.apiMethod,
  apiParam: props.apiParam,
  pageSize: globalCfg.page.pager.pageSize,
  immediate: false
})

const { total, loading, currentPage, pageSize, selection } = grid

/** 当前渲染行数据（可编辑直接作用于此） */
const rows = ref<Record<string, any>[]>([])

/** 静态数据来源：dataSource 优先，否则 modelValue */
const staticSource = computed<any[]>(() =>
  Array.isArray(props.dataSource) ? props.dataSource : props.modelValue
)

// 编辑态集合须在下方 immediate watch 触发 resetEditState 之前初始化（避免 TDZ）
/** 脏行索引集合 */
const dirtySet = reactive(new Set<number>())
/** 行编辑模式：正在编辑的行索引 */
const editingRows = reactive(new Set<number>())
/** 行编辑模式：进入编辑前的快照（取消时还原） */
const rowSnapshots = new Map<number, Record<string, any>>()
/** 单元格编辑模式：当前激活单元格 */
const activeCell = ref('')
/** 单元格基线值：行索引 -> 开始编辑时的行快照（用于判断单元格是否被修改） */
const cellBaselines = reactive(new Map<number, Record<string, any>>())
/** 已修改单元格 key（`${index}-${prop}`），当前值与基线不一致 */
const dirtyCells = reactive(new Set<string>())
/** 校验失败单元格：key -> 错误文案 */
const cellErrors = reactive(new Map<string, string>())
/** 通过"新增一行"加入的行索引：即使改回基线仍算脏行（区别于编辑产生的脏） */
const addedRows = reactive(new Set<number>())

// 静态数据同步（深拷贝，编辑过程不直接污染外部；保存时同步）
watch(
  staticSource,
  (val) => {
    if (isStatic.value) {
      rows.value = (val || []).map((r) => ({ ...r }))
      total.value = (val || []).length
      resetEditState()
    }
  },
  { immediate: true, deep: false }
)

// 接口数据同步到可编辑行
watch(
  grid.list,
  (val) => {
    if (!isStatic.value) {
      rows.value = (val || []).map((r) => ({ ...r }))
      resetEditState()
    }
  },
  { immediate: true }
)

// ============ 编辑态 ============
const saving = ref(false)

function resetEditState() {
  dirtySet.clear()
  editingRows.clear()
  rowSnapshots.clear()
  activeCell.value = ''
  addedRows.clear()
  cellBaselines.clear()
  dirtyCells.clear()
  cellErrors.clear()
}

const dirtyRows = computed(() => [...dirtySet].map((i) => rows.value[i]).filter(Boolean))

function cellKey(index: number, prop: string) {
  return `${index}-${prop}`
}

function isRowEditing(index: number) {
  return editingRows.has(index)
}

function deactivateCell() {
  activeCell.value = ''
}

function focusCell(el: any) {
  if (!el) return
  const target = el?.focus ? el : el?.$el?.querySelector?.('input')
  if (target?.focus) target.focus()
  else if (el?.focus) el.focus()
}

function formatCell(row: Record<string, any>, col: EditableColumn): string {
  if (col.formatter) return col.formatter(row, col)
  const val = row[col.prop]
  if (val === undefined || val === null || val === '') return ''
  if (col.editor === 'select') {
    const opt = col.options?.find((o) => o.value === val)
    return opt ? opt.text : String(val)
  }
  return String(val)
}

/** 单元格点击：cell 模式下激活可编辑列，并记录该行基线值 */
function onCellClick(row: Record<string, any>, column: any) {
  if (props.editMode !== 'cell' || viewMode.value !== 'table') return
  const prop = column?.property
  if (!prop) return
  const col = props.columns.find((c) => c.prop === prop)
  if (!col || col.editable === false) return
  const idx = rows.value.indexOf(row)
  if (idx < 0) return
  if (!cellBaselines.has(idx)) cellBaselines.set(idx, { ...row })
  activeCell.value = cellKey(idx, prop)
}

function markDirty(index: number) {
  dirtySet.add(index)
  emit('change', rows.value)
}

/** 编辑提交后的统一处理：标脏 + 刷新单元格脏状态 + 触发该单元格规则校验 */
function markCellChanged(index: number, col: EditableColumn) {
  markDirty(index)
  syncDirtyCells(index)
  void validateCell(index, rows.value[index], col)
}

function onSelectChange(index: number, col: EditableColumn) {
  markCellChanged(index, col)
  activeCell.value = ''
}

function onDateChange(index: number, col: EditableColumn) {
  markCellChanged(index, col)
  activeCell.value = ''
}

function sameValue(a: any, b: any) {
  if (a === b) return true
  if ((a === undefined || a === null || a === '') && (b === undefined || b === null || b === '')) return true
  return false
}

/** 把行内单元格当前值与基线比对，刷新 dirtyCells（改回原值自动移除；新增行始终算脏） */
function syncDirtyCells(index: number) {
  const base = cellBaselines.get(index)
  const row = rows.value[index]
  if (!base || !row) return
  let hasDirty = false
  for (const col of props.columns) {
    if (col.editable === false) continue
    if (!(col.prop in base)) continue
    const key = cellKey(index, col.prop)
    if (sameValue(base[col.prop], row[col.prop])) {
      dirtyCells.delete(key)
    } else {
      dirtyCells.add(key)
      hasDirty = true
    }
  }
  if (hasDirty) dirtySet.add(index)
  else if (!addedRows.has(index)) dirtySet.delete(index)
}

/** 单元格展示状态 class：已修改（is-dirty）/ 约束失败（is-error） */
function cellState(index: number, col: EditableColumn) {
  const key = cellKey(index, col.prop)
  return {
    'is-editable': props.editMode === 'cell' && col.editable !== false,
    'is-dirty': dirtyCells.has(key),
    'is-error': cellErrors.has(key)
  }
}

/** 单元格错误文案（title 悬浮提示） */
function cellErrorText(index: number, col: EditableColumn) {
  return cellErrors.get(cellKey(index, col.prop)) || ''
}

/** 清除某行所有单元格级状态（删除/取消行编辑时） */
function clearCellStates(index: number) {
  const prefix = `${index}-`
  for (const k of [...dirtyCells]) if (k.startsWith(prefix)) dirtyCells.delete(k)
  for (const k of [...cellErrors.keys()]) if (k.startsWith(prefix)) cellErrors.delete(k)
}

/** 单元格规则校验：失败返回错误文案并写入 cellErrors，通过则清除该单元格错误 */
async function validateCell(index: number, row: Record<string, any>, col: EditableColumn): Promise<string | undefined> {
  const key = cellKey(index, col.prop)
  cellErrors.delete(key)
  const val = row[col.prop]
  let error: string | undefined
  if (col.rules && col.rules.length) {
    try {
      // 与 ElForm 一致的 rules（async-validator）：field 规则数组直接按字段校验
      await new Schema({ [col.prop]: col.rules }).validate({ [col.prop]: val }, { suppressWarning: true })
    } catch (e: any) {
      error = e?.errors?.[0]?.message ?? `「${col.label}」校验未通过`
    }
  } else {
    if (col.required && (val === undefined || val === null || val === '')) {
      error = `「${col.label}」不能为空`
    } else if (col.validator) {
      error = col.validator(val, row) || undefined
    }
  }
  if (error) cellErrors.set(key, error)
  return error
}

/** 校验一行内全部列：返回首条错误，同时刷新每个单元格错误状态 */
async function validateRowCells(
  index: number,
  row: Record<string, any>
): Promise<{ error?: string; column?: string }> {
  let first: { error?: string; column?: string } | undefined
  for (const col of props.columns) {
    const err = await validateCell(index, row, col)
    if (err && !first) first = { error: err, column: col.prop }
  }
  return first ?? {}
}

/** 行编辑：进入（记录行快照与单元格基线） */
function startEditRow(index: number) {
  rowSnapshots.set(index, { ...rows.value[index] })
  editingRows.add(index)
  if (!cellBaselines.has(index)) cellBaselines.set(index, { ...rows.value[index] })
}

/** 行内保存：校验单行，通过后退出编辑态（批量保存统一提交） */
async function saveRow(index: number) {
  const row = rows.value[index]
  const res = await validateRowCells(index, row)
  if (res.error) {
    ElMessage.warning(res.error)
    emit('validate-fail', { index, row, column: res.column, error: res.error })
    return
  }
  editingRows.delete(index)
  rowSnapshots.delete(index)
  // 更新基线：保存完成后刷新基线为当前行值，下次编辑以此为准对比
  cellBaselines.set(index, { ...rows.value[index] })
  // 清除该行所有脏单元格与错误状态
  clearCellStates(index)
  dirtySet.add(index)
  emit('change', rows.value)
}

/** 行内取消：还原快照，并清除该行单元格级状态 */
function cancelRow(index: number) {
  const snapshot = rowSnapshots.get(index)
  if (snapshot) rows.value[index] = { ...snapshot }
  rowSnapshots.delete(index)
  editingRows.delete(index)
  dirtySet.delete(index)
  addedRows.delete(index)
  cellBaselines.delete(index)
  clearCellStates(index)
}

function addRow() {
  const base =
    typeof props.defaultRow === 'function'
      ? (props.defaultRow as () => Record<string, any>)()
      : { ...(props.defaultRow || {}) }
  rows.value.push({ ...base })
  const idx = rows.value.length - 1
  addedRows.add(idx)
  cellBaselines.set(idx, { ...rows.value[idx] })
  dirtySet.add(idx)
  if (isStatic.value) total.value = rows.value.length
  if (props.editMode === 'row') {
    rowSnapshots.set(idx, { ...rows.value[idx] })
    editingRows.add(idx)
  }
  emit('row-add', rows.value[idx])
  emit('update:modelValue', rows.value)
  emit('change', rows.value)
}

async function removeRow(index: number) {
  try {
    await ElMessageBox.confirm('确认删除该行？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
  } catch {
    return
  }
  rows.value.splice(index, 1)
  // 重建删除行之后所有按索引记录的状态（脏行/新增行/单元格基线/脏单元格/错误单元格）
  const shift = (i: number) => (i < index ? i : i > index ? i - 1 : -1)
  const shiftSet = (s: Set<number>) => {
    const next = new Set<number>()
    for (const i of s) {
      const n = shift(i)
      if (n >= 0) next.add(n)
    }
    s.clear()
    next.forEach((i) => s.add(i))
  }
  shiftSet(dirtySet)
  shiftSet(addedRows)
  const baseNext = new Map<number, Record<string, any>>()
  cellBaselines.forEach((v, i) => {
    const n = shift(i)
    if (n >= 0) baseNext.set(n, v)
  })
  cellBaselines.clear()
  baseNext.forEach((v, k) => cellBaselines.set(k, v))
  const shiftKey = (k: string) => {
    const dash = k.indexOf('-')
    const i = Number(k.slice(0, dash))
    const n = shift(i)
    return n >= 0 ? `${n}-${k.slice(dash + 1)}` : null
  }
  for (const k of [...dirtyCells]) {
    const nk = shiftKey(k)
    dirtyCells.delete(k)
    if (nk) dirtyCells.add(nk)
  }
  for (const [k, v] of [...cellErrors.entries()]) {
    const nk = shiftKey(k)
    cellErrors.delete(k)
    if (nk) cellErrors.set(nk, v)
  }
  editingRows.clear()
  activeCell.value = ''
  if (isStatic.value) total.value = rows.value.length
  emit('row-remove', index)
  emit('update:modelValue', rows.value)
  emit('change', rows.value)
}

/** 校验所有脏行；失败中断并返回 false，同时刷新每个单元格错误状态 */
async function validateAll(): Promise<boolean> {
  const indices = [...dirtySet].sort((a, b) => a - b)
  for (const i of indices) {
    const row = rows.value[i]
    if (!row) continue
    const res = await validateRowCells(i, row)
    if (res.error) {
      ElMessage.warning(`第 ${i + 1} 行：${res.error}`)
      emit('validate-fail', { index: i, row, column: res.column, error: res.error })
      return false
    }
  }
  return true
}

/** 批量保存：先校验（rules 不满足中断并提示），通过后提交脏行 */
async function saveAll() {
  if (!dirtySet.size) {
    ElMessage.info('没有需要保存的修改')
    return
  }
  if (!(await validateAll())) return

  const changedRows = [...dirtySet].sort((a, b) => a - b).map((i) => rows.value[i])

  // 无保存接口：仅本地提交
  if (!props.saveApi) {
    resetEditState()
    emit('update:modelValue', rows.value)
    emit('save', { rows: changedRows, all: rows.value })
    ElMessage.success('保存成功')
    return
  }

  saving.value = true
  emit('apiBefore', { url: props.saveApi, rows: changedRows })
  try {
    const result =
      props.saveMethod === 'put'
        ? await request.put(props.saveApi, { rows: changedRows })
        : await request.post(props.saveApi, { rows: changedRows })
    if (result.success) {
      resetEditState()
      emit('apiSuccess', { data: result.data })
      emit('save', { rows: changedRows, all: rows.value, data: result.data })
      emit('update:modelValue', rows.value)
      if (props.headRefreshDatagrid) refreshDataGrid(props.headRefreshDatagrid, props.filter)
      // 接口模式：保存成功后刷新当前页
      if (!isStatic.value) grid.fetchData()
    } else {
      emit('apiFail', { code: result.code, message: result.message })
    }
  } catch (error: any) {
    emit('apiException', { error, message: error?.message })
  } finally {
    emit('apiAfter', { url: props.saveApi })
    saving.value = false
  }
}

// ============ 工具栏 tools（继承 DataGrid） ============
const toolsConf = computed(() => ({
  refresh: props.tools.refresh !== false, // 默认 true
  columnSetting: props.tools.columnSetting === true,
  modeSwitch: props.tools.modeSwitch === true,
  size: props.tools.size === true
}))

const hasToolbar = computed(() => !!slots.toolbar || props.withAdd)
const hasTools = computed(
  () =>
    props.withSave ||
    !!slots.actions ||
    toolsConf.value.refresh ||
    toolsConf.value.columnSetting ||
    toolsConf.value.modeSwitch ||
    toolsConf.value.size ||
    props.modeSwitch ||
    props.dynamicColumn
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

// ============ 高度模式（继承 DataGrid） ============
const availFixHeight = ref(0)
const fixTableHeight = ref(0)
const isFixMode = computed(() => props.height === 'fix')

const rootStyle = computed(() =>
  isFixMode.value ? { height: `${availFixHeight.value}px` } : undefined
)

const tableHeight = computed(() => {
  if (isFixMode.value) return fixTableHeight.value > 0 ? fixTableHeight.value : undefined
  if (props.autoHeight) return '100%'
  const h = props.height
  if (h == null || h === '') return undefined
  return h as string | number
})

function measureFixHeight() {
  const el = rootRef.value
  if (!el || !isFixMode.value) return
  const viewH = window.innerHeight
  const top = el.getBoundingClientRect().top
  const avail = Math.max(120, Math.floor(viewH - top))
  availFixHeight.value = avail
  const toolbar = el.querySelector('.wd-editable-grid__toolbar') as HTMLElement | null
  const pager = el.querySelector('.wd-editable-grid__pager') as HTMLElement | null
  fixTableHeight.value = Math.max(120, avail - (toolbar?.offsetHeight ?? 0) - (pager?.offsetHeight ?? 0))
}
function onViewportResize() {
  measureFixHeight()
}

watch(
  () => props.height,
  (v) => {
    if (v === 'fix') {
      window.addEventListener('resize', onViewportResize)
      nextTick(measureFixHeight)
    } else {
      window.removeEventListener('resize', onViewportResize)
    }
  }
)

// ============ 分页档位 ============
const pagerLayout = computed(() => {
  if (props.pagerStyle === 'simple') return 'prev, pager, next'
  if (props.pagerStyle === 'full') return 'total, sizes, prev, pager, next, jumper'
  return globalCfg.page.pager.layout
})

// ============ 动态列（配置列 + 插槽列） ============
const {
  columns: colColumns,
  controllableColumns,
  hiddenKeys,
  settingVisible: colSettingVisible,
  init: initColumns,
  initMetas: initColumnMetas,
  setVisible: setColumnVisible,
  move: moveColumn,
  reset: resetColumns
} = useColumnSettings(props.columnStorageKey || undefined)

let columnsInited = false

/** 配置列：按列设置显隐（排序以 columns 配置为准） */
const visibleColumns = computed<EditableColumn[]>(() => {
  ensureColumnSettings()
  return props.columns.filter((c) => !hiddenKeys.value.has(c.prop))
})

/** 插槽列 vnode：过滤隐藏列与重复的 selection/index 列 */
const slotColumnVnodes = computed<VNode[]>(() => {
  ensureColumnSettings()
  const defaultSlot = slots.default
  if (!defaultSlot) return []
  return filterColumnVnodes(defaultSlot(), hiddenKeys.value)
})

/** 初始化列设置元信息（配置列 + 插槽列合并，仅一次） */
function ensureColumnSettings() {
  if (columnsInited) return
  const slotVnodes = slots.default ? slots.default() : []
  const metas = [
    ...props.columns.map((c) => ({ key: c.prop, label: c.label, controllable: true, visible: true })),
    ...extractColumns(slotVnodes)
      .filter((c) => c.controllable)
      .map((c) => ({ key: c.key, label: c.label, controllable: true, visible: c.visible }))
  ]
  if (metas.length) {
    initColumnMetas(metas)
  } else {
    initColumns(slotVnodes)
  }
  columnsInited = true
}

/** 根据隐藏列 key 过滤插槽 vnode */
function filterColumnVnodes(vnodes: VNode[], hidden: Set<string>): VNode[] {
  const result: VNode[] = []
  vnodes.forEach((vnode) => {
    if (!vnode || typeof vnode !== 'object') {
      if (vnode) result.push(vnode)
      return
    }
    const p = (vnode.props || {}) as Record<string, any>
    const key = String(p.prop || p.columnKey || '')
    if (p.type === 'selection' || p.type === 'index') return
    if (key && hidden.has(key)) return
    result.push(vnode)
  })
  return result
}

// ============ 序号 / 行合并（继承 DataGrid） ============
function indexMethod(index: number) {
  return (currentPage.value - 1) * pageSize.value + index + 1
}

function rowspanMethod({ row, column, rowIndex, columnIndex }: any) {
  if (!props.rowspanKey || !props.rowspanColumn.length) return { rowspan: 1, colspan: 1 }
  const prop = column.property
  if (!props.rowspanColumn.includes(prop)) return { rowspan: 1, colspan: 1 }
  const data = rows.value
  const keyVal = row[props.rowspanKey]
  const firstIdx = data.findIndex((r) => r[props.rowspanKey] === keyVal)
  if (rowIndex === firstIdx) {
    const span = data.filter((r) => r[props.rowspanKey] === keyVal).length
    return { rowspan: span, colspan: 1 }
  }
  return { rowspan: 0, colspan: 0 }
}

// ============ 选择 / 分页 / 模式 / 行操作 ============
function onSelectionChange(selected: any[]) {
  grid.setSelection(selected)
  emit('selection-change', selected)
}

function onChangeCurrentpage(val: number) {
  resetEditState()
  grid.onChangeCurrentpage(val)
  emit('page-change', { currentPage: val, pageSize: pageSize.value })
}
function onChangePagesize(val: number) {
  resetEditState()
  grid.onChangePagesize(val)
  emit('page-change', { currentPage: currentPage.value, pageSize: val })
}

function toggleMode() {
  viewMode.value = viewMode.value === 'table' ? 'card' : 'table'
  emit('mode-change', viewMode.value)
}

/** 只读操作列宽度：按按钮数量估算 */
const actionColumnWidth = computed(() => {
  const w = props.rowActions.reduce((sum, act) => sum + act.text.length * 14 + 16, 20)
  return Math.max(w, 90)
})

function onRowAction(row: any, act: { text: string; command?: string; type?: string }) {
  emit('row-action', { row, command: act.command ?? act.text, text: act.text })
}

// ============ 对外方法（DataGrid 数据能力 + 可编辑能力） ============
function requestApi(options?: { apiParam?: Record<string, any> }) {
  if (isStatic.value) return Promise.resolve()
  return grid.fetchData(options?.apiParam).then((res) => emit('loaded', res))
}
function refresh() {
  resetEditState()
  if (isStatic.value) {
    rows.value = staticSource.value.map((r) => ({ ...r }))
    return Promise.resolve()
  }
  return grid.fetchData().then((res) => emit('loaded', res))
}
function getSelection() {
  return grid.getSelection()
}
function clearSelection() {
  tableRef.value?.clearSelection?.()
  grid.clearSelection()
}
function search(params?: Record<string, any>) {
  if (isStatic.value) return Promise.resolve()
  resetEditState()
  currentPage.value = 1
  return grid.fetchData(params).then((res) => emit('loaded', res))
}
function resetSearch() {
  resetEditState()
  return grid.reset()
}
/**
 * 全量校验：默认校验所有行所有列；若传入 columns prop 数组，则只校验指定列；不满足则全部显示错误样式，首错提示并返回 false
 */
async function validate(columns?: string[]) {
  // 如果指定了只校验某些列，则只校验这些列；否则校验所有行所有列
  if (columns && columns.length > 0) {
    for (let i = 0; i < rows.value.length; i++) {
      const row = rows.value[i]
      for (const prop of columns) {
        const col = props.columns.find(c => c.prop === prop)
        if (!col) continue
        await validateCell(i, row, col)
      }
    }
    // 检查是否存在任意错误
    if (cellErrors.size > 0) {
      const firstEntry = Array.from(cellErrors.entries())[0]
      const [key, error] = firstEntry
      const [index] = key.split('-')
      ElMessage.warning(error)
      emit('validate-fail', { index: Number(index), error })
      return false
    }
    return true
  }
  // 默认：所有行所有列
  for (let i = 0; i < rows.value.length; i++) {
    const row = rows.value[i]
    for (const col of props.columns) {
      await validateCell(i, row, col)
    }
  }
  if (cellErrors.size > 0) {
    const firstEntry = Array.from(cellErrors.entries())[0]
    const [key, error] = firstEntry
    const [index] = key.split('-')
    ElMessage.warning(error)
    emit('validate-fail', { index: Number(index), error })
    return false
  }
  return true
}
function getDirtyRows() {
  return dirtyRows.value
}

defineExpose({
  // 数据能力
  requestApi,
  refresh,
  search,
  resetSearch,
  onChangePagesize,
  onChangeCurrentpage,
  getSelection,
  clearSelection,
  // 可编辑能力
  saveAll,
  validate,
  addRow,
  getDirtyRows,
  tableRef
})

// ============ 联动注册（继承 DataGrid，可被 SearchPanel / refreshDataGrid 驱动） ============
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
  if (isFixMode.value) {
    window.addEventListener('resize', onViewportResize)
    measureFixHeight()
  }
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', onViewportResize)
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
.wd-editable-grid {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: var(--wd-bg-color, #fff);
}
.wd-editable-grid--auto-height {
  height: 100%;
}
.wd-editable-grid__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--wd-spacing-base, 12px);
  padding: 0 0 var(--wd-spacing-base, 12px);
  flex-wrap: wrap;
}
.wd-editable-grid__toolbar :deep(.el-button + .el-button) {
  margin-left: 0;
}
.wd-editable-grid__toolbar :deep(.el-button .el-icon) {
  font-size: 16px;
}
.wd-editable-grid__toolbar-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.wd-editable-grid__toolbar-right {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
  flex-wrap: wrap;
}
.wd-editable-grid__table {
  flex: 1;
  min-height: 0;
}
.wd-editable-grid__cell {
  width: 100%;
  min-height: 24px;
  border-radius: 2px;
  transition: background-color 0.2s;
}
.wd-editable-grid__cell.is-editable {
  cursor: cell;
}
.wd-editable-grid__cell.is-editable:hover {
  color: var(--el-color-primary);
}
/* 已修改样式：单元格当前值与开始编辑时的值不一致。
   默认为单元格最右侧红色感叹号小图标；开发者可用 CSS 变量覆盖：
   --wd-cell-dirty-decoration  波浪线形态（如 underline wavy / none，仅当图标不显示时生效）
   --wd-cell-dirty-color       图标颜色（默认警告色）
   --wd-cell-dirty-bg          单元格底色（默认透明）
   --wd-cell-dirty-show-icon   是否显示感叹号图标（默认 true，false 不显示）
   例如保留底色高亮效果+关闭图标：--wd-cell-dirty-show-icon:false; --wd-cell-dirty-decoration:none; --wd-cell-dirty-bg:rgba(230,162,60,.12) */
.wd-editable-grid__cell.is-dirty {
  position: relative;
  padding-right: var(--wd-cell-dirty-padding-right, 20px);
  background: var(--wd-cell-dirty-bg, transparent);
}
.wd-editable-grid__cell.is-dirty .wd-editable-grid__cell-dirty-icon {
  display: var(--wd-cell-dirty-show-icon, inline-block);
  position: absolute;
  right: 2px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--wd-cell-dirty-color, var(--el-color-warning, #e6a23c));
  font-size: var(--wd-cell-dirty-icon-size, 14px);
}
/* 约束失败样式：不满足列 rules（与 ElForm 一致）时展示。
   开发者可用 CSS 变量覆盖：
   --wd-cell-error-bg          单元格底色（默认 danger 淡色）
   --wd-cell-error-border      边框阴影（默认 1px danger 边框）
   例如自定义深色覆盖：--wd-cell-error-bg: rgba(245, 108, 108, 0.3); */
.wd-editable-grid__cell.is-error {
  background: var(--wd-cell-error-bg, rgba(245, 108, 108, 0.08));
  box-shadow: inset 0 0 0 1px var(--wd-cell-error-border, var(--el-color-danger, #f56c6c));
}
.wd-editable-grid__pager {
  display: flex;
  justify-content: flex-end;
  padding-top: var(--wd-spacing-base, 12px);
}
.wd-editable-grid__cards {
  flex: 1;
  min-height: 0;
  overflow: auto;
}
.wd-editable-grid__card {
  border: 1px solid var(--wd-border-color-light, #e4e7ed);
  border-radius: var(--wd-radius-base, 4px);
  padding: var(--wd-spacing-base, 12px);
  margin-bottom: var(--wd-spacing-base, 12px);
}
.wd-editable-grid__card-title {
  font-weight: 600;
  font-size: var(--wd-font-size-large, 16px);
  color: var(--wd-text-color-primary, #303133);
  margin-bottom: 8px;
}
.wd-editable-grid__card-line {
  display: flex;
  font-size: var(--wd-font-size-base, 14px);
  line-height: 1.8;
}
.wd-editable-grid__card-label {
  width: 110px;
  color: var(--wd-text-color-secondary, #909399);
  flex-shrink: 0;
}
.wd-editable-grid__card-value {
  color: var(--wd-text-color-regular, #606266);
  word-break: break-all;
}
.wd-editable-grid__col-setting {
  max-height: 400px;
  overflow: auto;
}
.wd-editable-grid__col-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px solid var(--wd-border-color-light, #f0f0f0);
}
.wd-editable-grid__col-actions {
  display: flex;
  gap: 4px;
}
</style>
