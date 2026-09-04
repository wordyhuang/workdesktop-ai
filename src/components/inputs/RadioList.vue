<template>
  <el-radio-group
    v-model="inner"
    v-loading="loading"
    v-bind="$attrs"
    @change="onChange"
  >
    <template v-for="opt in options" :key="String(opt.value)">
      <el-radio-button v-if="buttonStyle" :value="opt.value">
        <slot :option="opt.raw" :text="opt.text" :value="opt.value">{{ opt.text }}</slot>
      </el-radio-button>
      <el-radio v-else :value="opt.value">
        <slot :option="opt.raw" :text="opt.text" :value="opt.value">{{ opt.text }}</slot>
      </el-radio>
    </template>
  </el-radio-group>
</template>

<script setup lang="ts">
import { computed, toRefs, type PropType } from 'vue'
import { useOptionsLoader } from './useOptionsLoader'
import { optionsProps } from '../common/props'

defineOptions({ name: 'WdRadioList', inheritAttrs: false })

const props = defineProps({
  ...optionsProps,
  modelValue: { type: [String, Number, Boolean] as PropType<any>, default: undefined },
  /** 按钮样式 */
  buttonStyle: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'change', 'apiBefore', 'apiSuccess', 'apiFail', 'apiAfter'])

const refs = toRefs(props)
const { options, loading } = useOptionsLoader({
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
</script>
