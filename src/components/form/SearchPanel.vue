<template>
  <div class="wd-search-panel" v-loading="loading">
    <!-- 搜索表单：整体一个 el-form，显示项和隐藏项分两行布局，都在同一个表单作用域中 -->
    <el-form
      ref="formRef"
      :model="searchModel"
      :inline="true"
      :label-width="labelWidth"
      v-bind="$attrs"
      @submit.prevent
    >
      <!-- 第一行：默认搜索项 + 右侧操作按钮，布局不随隐藏项变化 -->
      <div class="wd-search-panel__row wd-search-panel__row--primary">
        <div class="wd-search-panel__fields">
          <div ref="primaryRef" class="wd-search-panel__primary" :class="{ 'is-collapsed': collapsePrimary }">
            <slot v-bind="{ model: searchModel }" />
          </div>
        </div>

        <!-- 右侧操作列（搜索 / 重置 / 展开），固定宽度、按钮横排一行不折行 -->
        <div v-if="withActions" class="wd-search-panel__actions" :style="actionStyle">
          <slot name="actions" :search="onSearch" :reset="onReset">
            <el-button type="primary" :loading="loading" @click="onSearch">{{ searchText }}</el-button>
            <el-button @click="onReset">{{ resetText }}</el-button>
            <el-button v-if="canCollapse" link type="primary" @click="toggleExpand">
              {{ expanded ? collapseText : expandText }}
            </el-button>
          </slot>
        </div>
      </div>

      <!-- 第二行：隐藏搜索条件区，整行平顺滑出/收起，仍然在同一个 el-form 内 -->
      <div
        v-if="hasMore"
        class="wd-search-panel__more-wrap"
        :class="{ 'is-open': expanded }"
        :aria-hidden="!expanded ? 'true' : undefined"
      >
        <div class="wd-search-panel__more">
          <slot name="more" v-bind="{ model: searchModel }" />
        </div>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount, getCurrentInstance, useSlots, nextTick } from 'vue'
import { searchDataGrid, resetSearchDataGrid } from '../../lib/core/linkage'
import { filterProp, headRefreshDatagridProp } from '../common/props'

defineOptions({ name: 'WdSearchPanel', inheritAttrs: false })

const props = defineProps({
  ...filterProp,
  ...headRefreshDatagridProp,
  /** 是否可折叠（默认 true：面板自带 展开/收起 按钮；有 more 插槽时折叠 more 区，无 more 插槽时折叠默认区整体） */
  collapsible: { type: Boolean, default: true },
  /** 是否展开（v-model:expand） */
  expand: { type: Boolean, default: undefined },
  /** 默认是否展开 */
  defaultExpand: { type: Boolean, default: false },
  /** 是否内置查询/重置按钮 */
  withActions: { type: Boolean, default: true },
  searchText: { type: String, default: '搜索' },
  resetText: { type: String, default: '重置' },
  expandText: { type: String, default: '展开' },
  collapseText: { type: String, default: '收起' },
  labelWidth: { type: [String, Number], default: '80px' },
  /** 操作列宽度：默认 'auto' 随按钮内容自适应；数字按 px；也可传 CSS 长度（如 '120px'） */
  actionWidth: { type: [String, Number], default: 'auto' }
})

const emit = defineEmits(['search', 'reset', 'expand-change', 'update:expand'])

const formRef = ref<any>(null)
const primaryRef = ref<HTMLElement | null>(null)
const loading = ref(false)
const searchModel = reactive<Record<string, any>>({})
const slots = useSlots()

// 是否提供了 more 插槽（隐藏搜索项目）
const hasMore = computed(() => !!slots.more)

// 折叠行高（与 .wd-search-panel__primary.is-collapsed 的 max-height 保持一致）
const COLLAPSE_MAX_HEIGHT = 40
// 无 more 插槽时：默认区完整内容是否超出折叠行高（超出才存在被隐藏的搜索条件）
const primaryOverflow = ref(false)

// 是否存在可隐藏的搜索条件：有 more 插槽恒有；无 more 插槽时默认区超出折叠行高才有
const hasHidden = computed(() => hasMore.value || primaryOverflow.value)
// 折叠能力：允许折叠且确实存在隐藏条件时，才显示 展开/收起 按钮
const canCollapse = computed(() => props.collapsible && hasHidden.value)

// 展开状态（canCollapse 时生效）
const innerExpanded = ref(props.defaultExpand)
const expanded = computed(() =>
  canCollapse.value ? (props.expand !== undefined ? !!props.expand : innerExpanded.value) : true
)
const collapsed = computed(() => canCollapse.value && !expanded.value)
// 无 more 插槽时走旧行为：折叠默认区整体；有 more 插槽时默认区始终完整展示
const collapsePrimary = computed(() => collapsed.value && !hasMore.value)

/** 测量默认区内容是否超出折叠行高（scrollHeight 包含因 overflow 隐藏的内容，折叠态下也能测到完整高度） */
function measurePrimary() {
  const el = primaryRef.value
  if (!el) return
  primaryOverflow.value = el.scrollHeight > COLLAPSE_MAX_HEIGHT + 1
}

/** 操作列样式：默认随内容自适应；显式传宽度时固定宽度 */
const actionStyle = computed(() => {
  const w = props.actionWidth
  if (w === 'auto' || w === '' || w == null) return undefined
  const width = typeof w === 'number' ? `${w}px` : w
  return { width, flex: '0 0 auto' }
})

function toggleExpand() {
  const next = !expanded.value
  innerExpanded.value = next
  emit('update:expand', next)
  emit('expand-change', next)
}

function getSearchParams() {
  return { ...searchModel }
}

function onSearch() {
  const params = getSearchParams()
  emit('search', params)
  // 声明式联动：刷新同 filter 组 DataGrid（重置到第一页）
  if (props.headRefreshDatagrid) {
    searchDataGrid(params, props.headRefreshDatagrid, props.filter)
  }
}

function onReset() {
  // 清空表单字段
  Object.keys(searchModel).forEach((k) => delete searchModel[k])
  formRef.value?.clearValidate?.()
  emit('reset')
  if (props.headRefreshDatagrid) {
    resetSearchDataGrid(props.headRefreshDatagrid, props.filter)
  }
}

function expand() {
  innerExpanded.value = true
  emit('update:expand', true)
}
function collapse() {
  innerExpanded.value = false
  emit('update:expand', false)
}
function resetForm() {
  onReset()
}

// HTML 场景：插槽 v-model="q.xxx" 需要根模板作用域可见 q
const instance = getCurrentInstance()
let resizeObserver: ResizeObserver | null = null
onMounted(() => {
  const appContext = instance?.appContext
  if (appContext) {
    appContext.config.globalProperties.q = searchModel
  }
  // 初始测量 + 监听默认区尺寸/窗口宽度变化：无 more 插槽时据此判断是否存在隐藏条件
  nextTick(measurePrimary)
  if (typeof ResizeObserver !== 'undefined' && primaryRef.value) {
    resizeObserver = new ResizeObserver(() => measurePrimary())
    resizeObserver.observe(primaryRef.value)
  }
  window.addEventListener('resize', measurePrimary)
})
onBeforeUnmount(() => {
  const appContext = instance?.appContext
  if (appContext?.config?.globalProperties?.q === searchModel) {
    delete appContext.config.globalProperties.q
  }
  resizeObserver?.disconnect()
  window.removeEventListener('resize', measurePrimary)
})

defineExpose({ expand, collapse, resetForm, getSearchParams })
</script>

<style scoped>
.wd-search-panel {
  width: 100%;
  background: var(--wd-bg-color, #fff);
  padding: var(--wd-spacing-base, 8px) var(--wd-spacing-base, 12px) 0;
  box-sizing: border-box;
}
/* 第一行：默认搜索项（fields）+ 右侧操作列（actions），grid 三列布局锁定空间，布局稳定不受第二行影响
 * grid-template-columns: 1fr auto; —— 左侧搜索区自动占满剩余空间，右侧操作列宽度固定（随内容自适应或显式指定）
 * 避免 flex 压缩挤压导致最后一项换行不自然，结尾总是整齐
 */
.wd-search-panel__row {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: flex-start;
  column-gap: var(--wd-spacing-base, 12px);
  padding-bottom: var(--wd-spacing-base, 4px);
}
.wd-search-panel__fields {
  min-width: 0;
}
/* 旧折叠模式（无 more 插槽）：默认区超出一行隐藏 */
.wd-search-panel__primary.is-collapsed {
  max-height: 40px;
  overflow: hidden;
}
/* 第二行：隐藏搜索条件区（独立容器 + 独立 el-form 作用域）。
   外层 grid 行高 0fr→1fr 动画实现平顺滑出/收起；visibility 延迟隐藏，收起后不占位、不可聚焦 */
.wd-search-panel__more-wrap {
  display: grid;
  grid-template-rows: 0fr;
  visibility: hidden;
  transition: grid-template-rows 0.25s ease, visibility 0s linear 0.25s;
}
.wd-search-panel__more-wrap.is-open {
  grid-template-rows: 1fr;
  visibility: visible;
  transition: grid-template-rows 0.25s ease;
}
.wd-search-panel__more {
  overflow: hidden;
  min-height: 0;
  box-sizing: border-box;
  padding-top: var(--wd-spacing-base, 6px);
  border-top: 1px dashed var(--wd-border-color-light, #e4e7ed);
}
/* 右侧操作列：按钮横排一行、不换行/不折行（宽度默认随内容，可经 actionWidth 显式固定） */
.wd-search-panel__actions {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  gap: 0px;
  white-space: nowrap;
}
.wd-search-panel__actions :deep(.el-button) {
  white-space: nowrap;
}

/* SearchPanel 内让表单项更紧凑 */
:deep(.el-form--inline .el-form-item) {
  margin-bottom: 4px;
  margin-right: 12px;
}
:deep(.el-form-item) {
  margin-bottom: 4px;
}
:deep(.el-form-item__label) {
  line-height: 30px;
}
:deep(.el-form-item__content) {
  line-height: 30px;
}
</style>
