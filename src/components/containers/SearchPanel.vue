<template>
  <div class="wd-search-panel">
    <el-form
      ref="formRef"
      v-loading="loading"
      :model="searchModel"
      :inline="true"
      :label-width="labelWidth"
      v-bind="$attrs"
      @submit.prevent
    >
      <div class="wd-search-panel__fields" :class="{ 'is-collapsed': collapsed }">
        <slot v-bind="{ model: searchModel }" />
      </div>

      <div v-if="withActions" class="wd-search-panel__actions">
        <slot name="actions" :search="onSearch" :reset="onReset">
          <el-button type="primary" :loading="loading" @click="onSearch">{{ searchText }}</el-button>
          <el-button @click="onReset">{{ resetText }}</el-button>
          <el-button
            v-if="collapsible"
            link
            type="primary"
            @click="toggleExpand"
          >
            {{ collapsed ? expandText : collapseText }}
          </el-button>
        </slot>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount, getCurrentInstance } from 'vue'
import { searchDataGrid, resetSearchDataGrid } from '../../lib/core/linkage'
import { filterProp, headRefreshDatagridProp } from '../common/props'

defineOptions({ name: 'WdSearchPanel', inheritAttrs: false })

const props = defineProps({
  ...filterProp,
  ...headRefreshDatagridProp,
  /** 是否可折叠 */
  collapsible: { type: Boolean, default: false },
  /** 是否展开（v-model:expand） */
  expand: { type: Boolean, default: undefined },
  /** 默认是否展开 */
  defaultExpand: { type: Boolean, default: true },
  /** 是否内置查询/重置按钮 */
  withActions: { type: Boolean, default: true },
  searchText: { type: String, default: '搜索' },
  resetText: { type: String, default: '重置' },
  expandText: { type: String, default: '展开' },
  collapseText: { type: String, default: '收起' },
  labelWidth: { type: [String, Number], default: '80px' }
})

const emit = defineEmits(['search', 'reset', 'expand-change', 'update:expand'])

const formRef = ref<any>(null)
const loading = ref(false)
const searchModel = reactive<Record<string, any>>({})

// 折叠状态（collapsible 时生效）
const innerExpanded = ref(props.defaultExpand)
const collapsed = computed(() => props.collapsible && !(props.expand !== undefined ? props.expand : innerExpanded.value))

function toggleExpand() {
  const next = collapsed.value
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
onMounted(() => {
  const appContext = instance?.appContext
  if (appContext) {
    appContext.config.globalProperties.q = searchModel
  }
})
onBeforeUnmount(() => {
  const appContext = instance?.appContext
  if (appContext?.config?.globalProperties?.q === searchModel) {
    delete appContext.config.globalProperties.q
  }
})

defineExpose({ expand, collapse, resetForm, getSearchParams })
</script>

<style scoped>
.wd-search-panel {
  width: 100%;
  background: var(--wd-bg-color, #fff);
  padding: var(--wd-spacing-base, 12px) var(--wd-spacing-base, 12px) 0;
  box-sizing: border-box;
}
.wd-search-panel__fields.is-collapsed {
  max-height: 40px;
  overflow: hidden;
}
.wd-search-panel__actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-bottom: var(--wd-spacing-base, 12px);
}
</style>
