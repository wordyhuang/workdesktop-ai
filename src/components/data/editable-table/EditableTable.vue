<template>
  <div class="wd-editable-table">
    <!-- 工具栏 -->
    <div v-if="withToolbar" class="wd-editable-table__toolbar">
      <div class="wd-editable-table__toolbar-left">
        <slot name="toolbar" :dirty-rows="dirtyRows" :rows="rows">
          <el-button v-if="withAdd" type="primary" :icon="Plus" @click="addRow">{{ addButtonText }}</el-button>
        </slot>
      </div>
      <div class="wd-editable-table__toolbar-right">
        <el-button
          v-if="withSave"
          type="success"
          :loading="saving"
          :disabled="!dirtyRows.length"
          @click="saveAll"
        >
          {{ saveButtonText }}<span v-if="dirtyRows.length">（{{ dirtyRows.length }}）</span>
        </el-button>
        <slot name="actions" :dirty-rows="dirtyRows" :rows="rows" />
      </div>
    </div>

    <el-table
      ref="tableRef"
      :data="rows"
      :border="border"
      :stripe="stripe"
      :size="size"
      :row-key="rowKey"
      @cell-click="onCellClick"
    >
      <el-table-column v-if="withIndex" type="index" label="序号" width="60" align="center" />

      <!-- 可编辑列 -->
      <el-table-column
        v-for="col in columns"
        :key="col.prop"
        :prop="col.prop"
        :label="col.label"
        :width="col.width"
        :min-width="col.minWidth"
        :align="col.align || 'left'"
        :fixed="col.fixed"
      >
        <template #default="{ row, $index }">
          <!-- 行编辑模式：行处于编辑态才显示控件 -->
          <template v-if="editMode === 'row'">
            <el-input
              v-if="isRowEditing($index) && col.editor === 'input'"
              v-model="row[col.prop]"
              :placeholder="col.placeholder"
              @change="markDirty($index)"
            />
            <el-input-number
              v-else-if="isRowEditing($index) && col.editor === 'number'"
              v-model="row[col.prop]"
              :min="col.min"
              :max="col.max"
              :precision="col.precision"
              @change="markDirty($index)"
            />
            <el-select
              v-else-if="isRowEditing($index) && col.editor === 'select'"
              v-model="row[col.prop]"
              :placeholder="col.placeholder"
              @change="markDirty($index)"
            >
              <el-option v-for="opt in col.options || []" :key="opt.value" :label="opt.text" :value="opt.value" />
            </el-select>
            <el-date-picker
              v-else-if="isRowEditing($index) && col.editor === 'date'"
              v-model="row[col.prop]"
              type="date"
              value-format="YYYY-MM-DD"
              :placeholder="col.placeholder"
              @change="markDirty($index)"
            />
            <slot v-else-if="isRowEditing($index)" :name="`edit-${col.prop}`" :row="row" :index="$index" :column="col">
              <el-input v-model="row[col.prop]" :placeholder="col.placeholder" @change="markDirty($index)" />
            </slot>
            <span v-else>{{ formatCell(row, col) }}</span>
          </template>

          <!-- 单元格编辑模式：点击单元格切换控件 -->
          <template v-else>
            <el-input
              v-if="activeCell === cellKey($index, col.prop) && col.editor === 'input'"
              v-model="row[col.prop]"
              :ref="focusCell"
              :placeholder="col.placeholder"
              @change="markDirty($index)"
              @blur="deactivateCell"
            />
            <el-input-number
              v-else-if="activeCell === cellKey($index, col.prop) && col.editor === 'number'"
              v-model="row[col.prop]"
              :ref="focusCell"
              :min="col.min"
              :max="col.max"
              :precision="col.precision"
              @change="markDirty($index)"
              @blur="deactivateCell"
            />
            <el-select
              v-else-if="activeCell === cellKey($index, col.prop) && col.editor === 'select'"
              v-model="row[col.prop]"
              :ref="focusCell"
              :placeholder="col.placeholder"
              @change="onSelectChange($index)"
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
              @change="onDateChange($index)"
            />
            <slot
              v-else-if="activeCell === cellKey($index, col.prop)"
              :name="`edit-${col.prop}`"
              :row="row"
              :index="$index"
              :column="col"
            >
              <el-input v-model="row[col.prop]" :placeholder="col.placeholder" @change="markDirty($index)" />
            </slot>
            <span v-else class="wd-editable-table__cell" :class="{ 'is-editable': col.editable !== false }">
              {{ formatCell(row, col) }}
            </span>
          </template>
        </template>
      </el-table-column>

      <!-- 操作列 -->
      <el-table-column v-if="withActions" label="操作" :width="actionWidth" align="center" fixed="right">
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
          <el-empty description="暂无数据" :image-size="80" />
        </slot>
      </template>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { request } from '../../../lib/core/http'
import { refreshDataGrid } from '../../../lib/core/linkage'
import { filterProp, headRefreshDatagridProp } from '../../common/props'
import type { PropType } from 'vue'

defineOptions({ name: 'WdEditableTable' })

/** 列配置 */
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
  /** 展示格式化（只读态） */
  formatter?: (row: Record<string, any>, col: EditableColumn) => string
}

const props = defineProps({
  ...filterProp,
  ...headRefreshDatagridProp,
  /** 列配置 */
  columns: {
    type: Array as PropType<EditableColumn[]>,
    default: () => []
  },
  /** 表格数据（v-model） */
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
  rowKey: { type: String, default: 'id' },
  // ---- 能力开关（withXxx） ----
  withToolbar: { type: Boolean, default: true },
  withAdd: { type: Boolean, default: true },
  withSave: { type: Boolean, default: true },
  withDelete: { type: Boolean, default: true },
  withIndex: { type: Boolean, default: false },
  withActions: { type: Boolean, default: true },
  // ---- 文案 ----
  addButtonText: { type: String, default: '新增一行' },
  saveButtonText: { type: String, default: '批量保存' },
  actionWidth: { type: [String, Number], default: 150 },
  // ---- el-table 透传 ----
  border: { type: Boolean, default: true },
  stripe: { type: Boolean, default: true },
  size: { type: String as PropType<'large' | 'default' | 'small'>, default: 'default' }
})

const emit = defineEmits([
  'update:modelValue',
  'change',
  'save',
  'row-add',
  'row-remove',
  'validate-fail',
  'apiBefore',
  'apiSuccess',
  'apiFail',
  'apiException',
  'apiAfter'
])

const tableRef = ref()
const saving = ref(false)

/** 内部数据（深拷贝外部传入，编辑过程不直接污染；保存/取消时同步） */
const rows = ref<Record<string, any>[]>(props.modelValue.map((r) => ({ ...r })))
/** 脏行索引集合 */
const dirtySet = reactive(new Set<number>())
/** 行编辑模式：正在编辑的行索引 */
const editingRows = reactive(new Set<number>())
/** 行编辑模式：进入编辑前的快照（取消时还原） */
const rowSnapshots = new Map<number, Record<string, any>>()
/** 单元格编辑模式：当前激活单元格 */
const activeCell = ref('')

function deactivateCell() {
  activeCell.value = ''
}

watch(
  () => props.modelValue,
  (val: Record<string, any>[]) => {
    rows.value = val.map((r: Record<string, any>) => ({ ...r }))
    dirtySet.clear()
    editingRows.clear()
  },
  { deep: false }
)

const dirtyRows = computed(() => [...dirtySet].map((i) => rows.value[i]).filter(Boolean))

function cellKey(index: number, prop: string) {
  return `${index}-${prop}`
}

function isRowEditing(index: number) {
  return editingRows.has(index)
}

function focusCell(el: any) {
  if (!el) return
  // el-input 实例聚焦
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

/** 单元格点击：cell 模式下激活可编辑列 */
function onCellClick(row: Record<string, any>, column: any) {
  if (props.editMode !== 'cell') return
  const prop = column?.property
  if (!prop) return
  const col = props.columns.find((c) => c.prop === prop)
  if (!col || col.editable === false) return
  activeCell.value = cellKey(rows.value.indexOf(row), prop)
}

function markDirty(index: number) {
  dirtySet.add(index)
  emit('change', rows.value)
}

function onSelectChange(index: number) {
  markDirty(index)
  activeCell.value = ''
}

function onDateChange(index: number) {
  markDirty(index)
  activeCell.value = ''
}

/** 行编辑：进入 */
function startEditRow(index: number) {
  rowSnapshots.set(index, { ...rows.value[index] })
  editingRows.add(index)
}

/** 行内保存：校验单行，通过后退出编辑态（不立即提交后端，批量保存统一提交） */
function saveRow(index: number) {
  const error = validateRow(rows.value[index])
  if (error) {
    ElMessage.warning(error)
    return
  }
  editingRows.delete(index)
  rowSnapshots.delete(index)
  dirtySet.add(index)
  emit('change', rows.value)
}

/** 行内取消：还原快照 */
function cancelRow(index: number) {
  const snapshot = rowSnapshots.get(index)
  if (snapshot) rows.value[index] = { ...snapshot }
  rowSnapshots.delete(index)
  editingRows.delete(index)
  dirtySet.delete(index)
}

function addRow() {
  const base =
    typeof props.defaultRow === 'function'
      ? (props.defaultRow as () => Record<string, any>)()
      : { ...(props.defaultRow || {}) }
  rows.value.push({ ...base })
  const idx = rows.value.length - 1
  dirtySet.add(idx)
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
  // 重建脏行/编辑态索引
  const newDirty = new Set<number>()
  dirtySet.forEach((i) => {
    if (i < index) newDirty.add(i)
    else if (i > index) newDirty.add(i - 1)
  })
  dirtySet.clear()
  newDirty.forEach((i) => dirtySet.add(i))
  editingRows.clear()
  emit('row-remove', index)
  emit('update:modelValue', rows.value)
  emit('change', rows.value)
}

/** 单行校验，返回第一条错误文案 */
function validateRow(row: Record<string, any>): string | undefined {
  for (const col of props.columns) {
    const val = row[col.prop]
    if (col.required && (val === undefined || val === null || val === '')) {
      return `「${col.label}」不能为空`
    }
    if (col.validator) {
      const err = col.validator(val, row)
      if (err) return err
    }
  }
  return undefined
}

/** 校验所有脏行；通过返回 true */
function validateAll(): boolean {
  const indices = [...dirtySet].sort((a, b) => a - b)
  for (const i of indices) {
    const row = rows.value[i]
    if (!row) continue
    const error = validateRow(row)
    if (error) {
      ElMessage.warning(`第 ${i + 1} 行：${error}`)
      emit('validate-fail', { index: i, row, error })
      return false
    }
  }
  return true
}

/** 批量保存：先校验，通过后提交脏行 */
async function saveAll() {
  if (!dirtySet.size) {
    ElMessage.info('没有需要保存的修改')
    return
  }
  if (!validateAll()) return

  const changedRows = [...dirtySet].sort((a, b) => a - b).map((i) => rows.value[i])

  // 无保存接口：仅本地提交
  if (!props.saveApi) {
    dirtySet.clear()
    editingRows.clear()
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
      dirtySet.clear()
      editingRows.clear()
      emit('apiSuccess', { data: result.data })
      emit('save', { rows: changedRows, all: rows.value, data: result.data })
      emit('update:modelValue', rows.value)
      if (props.headRefreshDatagrid) refreshDataGrid(props.headRefreshDatagrid, props.filter)
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

/** 外部命令式入口 */
function validate() {
  return validateAll()
}

function getDirtyRows() {
  return dirtyRows.value
}

defineExpose({ saveAll, validate, addRow, getDirtyRows, tableRef })
</script>

<style scoped>
.wd-editable-table__toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  gap: 8px;
}
.wd-editable-table__toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}
.wd-editable-table__cell {
  display: inline-block;
  min-height: 24px;
  min-width: 40px;
}
.wd-editable-table__cell.is-editable {
  cursor: cell;
}
.wd-editable-table__cell.is-editable:hover {
  color: var(--el-color-primary);
}
</style>
