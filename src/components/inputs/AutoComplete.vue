<template>
  <div v-loading="loading" class="wd-auto-complete">
    <el-autocomplete
      v-model="inner"
      :fetch-suggestions="fetchSuggestions"
      :value-key="labelKey"
      v-bind="$attrs"
      @select="onSelect"
      @change="onChange"
    >
      <template #default="{ item }">
        <slot :option="item.raw" :text="item[valueKey]" :value="item[valueKey]">
          <span>{{ item[labelKey] }}</span>
        </slot>
      </template>
    </el-autocomplete>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, toRefs, type PropType } from 'vue'
import { useOptionsLoader } from './useOptionsLoader'
import { optionsProps } from '../common/props'

defineOptions({ name: 'WdAutoComplete', inheritAttrs: false })

const props = defineProps({
  ...optionsProps,
  modelValue: { type: String, default: '' },
  /** 选项值字段 */
  valueKey: { type: String, default: 'value' },
  /** 选项显示字段 */
  labelKey: { type: String, default: 'text' },
  keywordKey: { type: String, default: 'keyword' }
})

const emit = defineEmits(['update:modelValue', 'change', 'select', 'apiBefore', 'apiSuccess', 'apiFail', 'apiAfter'])

const refs = toRefs(props)
const { options, loading, remoteSearch, fetchOptions } = useOptionsLoader({
  api: refs.api,
  apiMethod: refs.apiMethod as any,
  apiParam: refs.apiParam,
  active: refs.active,
  dataSource: refs.dataSource as any,
  textProp: refs.textProp,
  valueProp: refs.valueProp,
  addData: refs.addData as any,
  appendData: refs.appendData as any,
  emit
})

const inner = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

/** el-autocomplete 回调式建议加载 */
async function fetchSuggestions(query: string, cb: (results: any[]) => void) {
  if (props.api && props.active) {
    await remoteSearch(query, props.keywordKey)
  } else if (!options.value.length) {
    await fetchOptions()
  }
  // 本地过滤
  const list = options.value.filter((o) =>
    query ? String(o.text).toLowerCase().includes(String(query).toLowerCase()) : true
  )
  cb(list as any)
}

function onSelect(item: any) {
  emit('update:modelValue', item[props.valueKey])
  emit('select', item.raw)
  emit('change', item[props.valueKey])
}

function onChange(val: any) {
  emit('change', val)
}
</script>

<style scoped>
.wd-auto-complete {
  width: 100%;
}
.wd-auto-complete :deep(.el-autocomplete) {
  width: 100%;
}
</style>
