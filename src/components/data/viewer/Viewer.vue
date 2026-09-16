<template>
  <div class="wd-viewer" v-loading="loading">
    <!-- 描述列表模式：items 配置驱动，自带大小/字段工具 -->
    <el-descriptions
      v-if="!useContentSlot && (hasData || loading)"
      :title="title"
      :column="column"
      :border="border"
      :size="innerSize"
      :label-style="labelStyle"
      :content-style="contentStyle"
      v-bind="$attrs"
    >
      <!-- 标题右侧工具：文字大小切换 + 显示字段选择（自动启用，无需配置） -->
      <template #extra>
        <div class="wd-viewer__tools" @click.stop>
          <el-tooltip content="调整大小" placement="top">
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
          <el-tooltip content="显示字段" placement="top">
            <el-button circle @click="fieldSettingVisible = true">
              <el-icon><Setting /></el-icon>
            </el-button>
          </el-tooltip>
        </div>
      </template>

      <el-descriptions-item
        v-for="item in displayedItems"
        :key="item.prop"
        :label="item.label"
        :span="item.span || 1"
        :width="item.width"
        :align="item.align"
        :label-align="item.labelAlign"
      >
        <template v-if="item.slot && $slots[item.slot]">
          <component :is="$slots[item.slot]" :row="viewData" :value="viewData[item.prop]" />
        </template>
        <component
          :is="item.render"
          v-else-if="item.render"
          :row="viewData"
          :value="viewData[item.prop]"
          :item="item"
        />
        <template v-else>
          <slot :name="`${item.prop}-cell`" :row="viewData" :value="viewData[item.prop]">
            {{ formatValue(item) }}
          </slot>
        </template>
      </el-descriptions-item>

      <slot />
    </el-descriptions>

    <!-- 整体内容插槽模式：透传当前数据，完全接管内容布局（脱离描述列表栅格） -->
    <div v-if="useContentSlot && hasData" class="wd-viewer__content">
      <slot name="content" :row="viewData" :data="viewData" />
    </div>
    <div v-else-if="useContentSlot && !loading" class="wd-viewer__empty">
      <slot name="empty">
        <el-empty :description="emptyText" />
      </slot>
    </div>

    <div v-if="!useContentSlot && !hasData && !loading" class="wd-viewer__empty">
      <slot name="empty">
        <el-empty :description="emptyText" :image-size="60" />
      </slot>
    </div>

    <!-- 显示字段设置弹层 -->
    <el-dialog v-if="!useContentSlot" v-model="fieldSettingVisible" title="显示字段" width="360px" append-to-body>
      <div class="wd-viewer__field-tip">勾选控制字段的显示 / 隐藏，拖拽手柄可调整字段顺序</div>
      <div class="wd-viewer__field-setting">
        <div
          v-for="item in controllableItems"
          :key="item.prop"
          class="wd-viewer__field-item"
          :class="{
            'is-dragging': draggingProp === item.prop,
            'drag-over--before': dragOverProp === item.prop && dragOverPosition === 'before',
            'drag-over--after': dragOverProp === item.prop && dragOverPosition === 'after'
          }"
          @dragover.prevent="onFieldDragOver($event, item.prop)"
          @dragleave="onFieldDragLeave(item.prop)"
          @drop.prevent="onFieldDrop(item.prop)"
        >
          <el-checkbox
            class="wd-viewer__field-checkbox"
            :model-value="visibleProps.has(item.prop)"
            @update:model-value="(v: boolean) => setFieldVisible(item.prop, v)"
          >
            {{ item.label }}
          </el-checkbox>
          <span
            class="wd-viewer__field-handle"
            draggable="true"
            title="拖拽调整顺序"
            @dragstart="onFieldDragStart($event, item.prop)"
            @dragend="onFieldDragEnd"
          >
            <el-icon><Rank /></el-icon>
          </span>
        </div>
      </div>
      <template #footer>
        <el-button @click="resetFields()">恢复默认</el-button>
        <el-button type="primary" @click="fieldSettingVisible = false">完成</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, useSlots, watch, type PropType } from 'vue'
import { Setting, ScaleToOriginal, Rank } from '@element-plus/icons-vue'
import { request } from '../../../lib/core/http'

defineOptions({ name: 'WdViewer', inheritAttrs: false })

const slots = useSlots()
/** 是否使用整体内容插槽：存在 #content 时完全接管内容布局，不再渲染描述列表及其工具 */
const useContentSlot = computed(() => !!slots.content)

const props = defineProps({
  title: { type: String, default: '' },
  column: { type: [Number, Object], default: 3 },
  border: { type: Boolean, default: true },
  size: { type: String as PropType<'large' | 'default' | 'small'>, default: 'default' },
  labelStyle: { type: Object, default: () => ({ width: '100px', textAlign: 'right' }) },
  contentStyle: { type: Object },
  api: { type: String, default: '' },
  apiMethod: { type: String as PropType<'get' | 'post' | 'put' | 'delete'>, default: 'get' },
  apiParam: { type: Object, default: () => ({}) },
  active: { type: Boolean, default: false },
  data: { type: Object },
  items: { type: Array as PropType<ViewerItem[]>, default: () => [] },
  emptyText: { type: String, default: '暂无数据' }
})

const emit = defineEmits([
  'load-success',
  'load-fail',
  'apiBefore',
  'apiSuccess',
  'apiFail',
  'apiException',
  'apiAfter'
])

interface ViewerItem {
  prop: string
  label: string
  span?: number
  width?: string | number
  align?: 'left' | 'center' | 'right'
  labelAlign?: 'left' | 'center' | 'right'
  /** 自定义渲染插槽名 */
  slot?: string
  render?: any
  formatter?: (val: any, row: any) => string
  type?: 'text' | 'tag' | 'time' | 'status' | 'image' | 'copy'
  tagColors?: Record<string, string>
  timeFormat?: string
  imageSize?: number
}

const viewData = ref<Record<string, any>>({})
const loading = ref(false)

const hasData = computed(() => Object.keys(viewData.value).length > 0)

/** 过滤掉无效项（无 prop） */
const normalizedItems = computed<ViewerItem[]>(() =>
  props.items.filter((item) => item && item.prop)
)

// ---------- 文字大小切换（大 / 默认 / 小），不持久化 ----------
const innerSize = ref<'large' | 'default' | 'small'>(props.size)
watch(
  () => props.size,
  (v) => {
    innerSize.value = v
  }
)
function onSizeChange(cmd: 'large' | 'default' | 'small') {
  innerSize.value = cmd
}

// ---------- 显示字段设置（显隐 + 排序，自动启用） ----------
interface FieldState {
  prop: string
  label: string
  visible: boolean
}

/** 字段状态即按当前展示顺序排列的数组 */
const fieldStates = ref<FieldState[]>([])
const fieldSettingVisible = ref(false)

/** 以 items 配置同步字段状态（新增字段自动追加并默认显示；删除字段移除；保留用户的显隐与排序） */
function syncFieldStates() {
  const merged: FieldState[] = []
  // 先保留用户已调整过顺序的字段
  fieldStates.value.forEach((f) => {
    const item = normalizedItems.value.find((i) => i.prop === f.prop)
    if (item) {
      merged.push({ prop: f.prop, label: item.label, visible: f.visible })
    }
  })
  // 再追加配置中新增的字段（按配置顺序）
  normalizedItems.value.forEach((item) => {
    if (!merged.some((f) => f.prop === item.prop)) {
      merged.push({ prop: item.prop, label: item.label, visible: true })
    }
  })
  fieldStates.value = merged
}

watch(
  () => normalizedItems.value.map((i) => `${i.prop}:${i.label}`).join('|'),
  () => syncFieldStates(),
  { immediate: true }
)

const visibleProps = computed(() => new Set(fieldStates.value.filter((f) => f.visible).map((f) => f.prop)))

/** 按字段状态顺序产出实际渲染的字段 */
const displayedItems = computed(() =>
  fieldStates.value
    .filter((f) => f.visible)
    .map((f) => normalizedItems.value.find((item) => item.prop === f.prop))
    .filter((item): item is ViewerItem => !!item)
)

/** 弹层中可控制的字段（数组顺序即展示顺序） */
const controllableItems = computed(() =>
  fieldStates.value.map((f) => ({ prop: f.prop, label: f.label }))
)

function setFieldVisible(prop: string, visible: boolean) {
  const field = fieldStates.value.find((f) => f.prop === prop)
  if (field) field.visible = visible
}

// ---------- 显示字段：拖拽排序（与 DataGrid 列设置一致） ----------
const draggingProp = ref('')
const dragOverProp = ref('')
const dragOverPosition = ref<'before' | 'after'>('before')

function onFieldDragStart(e: DragEvent, prop: string) {
  draggingProp.value = prop
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    // Firefox 需要 setData 才会触发拖拽
    e.dataTransfer.setData('text/plain', prop)
  }
}

function onFieldDragOver(e: DragEvent, prop: string) {
  if (!draggingProp.value || draggingProp.value === prop) return
  const el = e.currentTarget as HTMLElement
  const rect = el.getBoundingClientRect()
  dragOverProp.value = prop
  dragOverPosition.value = e.clientY - rect.top < rect.height / 2 ? 'before' : 'after'
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
}

function onFieldDragLeave(prop: string) {
  if (dragOverProp.value === prop) dragOverProp.value = ''
}

function reorderField(fromProp: string, toProp: string, position: 'before' | 'after' = 'before') {
  if (!fromProp || !toProp || fromProp === toProp) return
  const arr = fieldStates.value.slice()
  const fromIdx = arr.findIndex((f) => f.prop === fromProp)
  if (fromIdx < 0) return
  const [item] = arr.splice(fromIdx, 1)
  let insertIdx = arr.findIndex((f) => f.prop === toProp)
  if (insertIdx < 0) return
  if (position === 'after') insertIdx += 1
  arr.splice(insertIdx, 0, item)
  fieldStates.value = arr
}

function onFieldDrop(prop: string) {
  reorderField(draggingProp.value, prop, dragOverPosition.value)
  onFieldDragEnd()
}

function onFieldDragEnd() {
  draggingProp.value = ''
  dragOverProp.value = ''
}

function resetFields() {
  fieldStates.value = normalizedItems.value.map((item) => ({
    prop: item.prop,
    label: item.label,
    visible: true
  }))
}

function formatValue(item: ViewerItem): string {
  const value = viewData.value?.[item.prop]
  if (value === null || value === undefined || value === '') return '-'
  if (item.formatter) return item.formatter(value, viewData.value)
  return String(value)
}

async function requestApi(extraParam?: Record<string, any>) {
  if (!props.api) return
  const param = { ...props.apiParam, ...extraParam }
  loading.value = true
  emit('apiBefore', { url: props.api, param })
  try {
    let result: any
    if (props.apiMethod === 'get') {
      result = await request.get(props.api, param)
    } else if (props.apiMethod === 'post') {
      result = await request.post(props.api, param)
    } else if (props.apiMethod === 'put') {
      result = await request.put(props.api, param)
    } else {
      result = await request.delete(props.api, param)
    }
    if (result.success) {
      viewData.value = result.data || {}
      emit('load-success', { data: result.data })
      emit('apiSuccess', { data: result.data, raw: result })
    } else {
      emit('load-fail', { code: result.code, message: result.message })
      emit('apiFail', { code: result.code, message: result.message })
    }
    return result
  } catch (error: any) {
    emit('apiException', { error, message: error?.message })
  } finally {
    loading.value = false
    emit('apiAfter', { url: props.api })
  }
}

function resetData() {
  viewData.value = {}
}

function getData() {
  return viewData.value
}

defineExpose({ requestApi, resetData, getData, loading })

watch(
  () => props.data,
  (val) => {
    if (val && typeof val === 'object') {
      viewData.value = { ...val }
    }
  },
  { immediate: true }
)

onMounted(() => {
  if (props.active && props.api && !props.data) {
    requestApi()
  }
})

watch(
  () => JSON.stringify(props.apiParam),
  () => {
    if (props.active && props.api && !props.data) {
      requestApi()
    }
  }
)
</script>

<style scoped>
.wd-viewer {
  position: relative;
  width: 100%;
}
.wd-viewer__tools {
  display: flex;
  align-items: center;
  gap: 6px;
}
.wd-viewer__empty {
  padding: 20px 0;
  text-align: center;
}
.wd-viewer__content {
  width: 100%;
}
.wd-viewer__field-tip {
  margin-bottom: 8px;
  font-size: var(--wd-font-size-small, 12px);
  color: var(--wd-text-color-secondary, #909399);
}
.wd-viewer__field-setting {
  max-height: 400px;
  overflow: auto;
}
.wd-viewer__field-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
}
.wd-viewer__field-item:hover {
  background-color: var(--wd-fill-color-light, #f5f7fa);
}
.wd-viewer__field-checkbox {
  flex: 1;
}
.wd-viewer__field-handle {
  display: inline-flex;
  align-items: center;
  cursor: grab;
  color: var(--wd-text-color-placeholder, #a8abb2);
  touch-action: none;
}
.wd-viewer__field-handle:active {
  cursor: grabbing;
}
/* 正在拖拽的源行 */
.wd-viewer__field-item.is-dragging {
  opacity: 0.45;
}
/* 放置位置指示线 */
.wd-viewer__field-item.drag-over--before::before,
.wd-viewer__field-item.drag-over--after::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--wd-color-primary, #409eff);
}
.wd-viewer__field-item.drag-over--before::before {
  top: -1px;
}
.wd-viewer__field-item.drag-over--after::after {
  bottom: -1px;
}
</style>
