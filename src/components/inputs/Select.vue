<template>
  <el-select
    v-model="inner"
    v-loading="loading"
    :multiple="multiple"
    :filterable="remote || filterable"
    :remote="remote"
    :remote-method="onRemote"
    v-bind="$attrs"
    @change="onChange"
  >
    <el-option
      v-for="opt in options"
      :key="String(opt.value)"
      :label="opt.text"
      :value="opt.value"
    >
      <slot :option="opt.raw" :text="opt.text" :value="opt.value">
        <span>{{ opt.text }}</span>
      </slot>
    </el-option>
  </el-select>
</template>

<script setup lang="ts">
import { computed, toRefs, type PropType } from 'vue'
import { useOptionsLoader } from './useOptionsLoader'
import { optionsProps } from '../common/props'

defineOptions({ name: 'WdSelect', inheritAttrs: false })

const props = defineProps({
  ...optionsProps,
  modelValue: { type: [String, Number, Boolean, Array] as PropType<any>, default: undefined },
  multiple: { type: Boolean, default: false },
  /** 远程搜索 */
  remote: { type: Boolean, default: false },
  /** 本地可搜索 */
  filterable: { type: Boolean, default: true },
  /** 远程搜索关键字字段名 */
  keywordKey: { type: String, default: 'keyword' }
})

const emit = defineEmits(['update:modelValue', 'change', 'apiBefore', 'apiSuccess', 'apiFail', 'apiAfter'])

const refs = toRefs(props)
const { options, loading, remoteSearch } = useOptionsLoader({
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

function onChange(val: any) {
  emit('change', val)
}

function onRemote(query: string) {
  if (props.remote) remoteSearch(query, props.keywordKey)
}
</script>
