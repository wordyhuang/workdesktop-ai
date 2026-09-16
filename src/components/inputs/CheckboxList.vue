<template>
  <el-checkbox-group
    v-model="inner"
    v-loading="loading"
    v-bind="$attrs"
    @change="onChange"
  >
    <template v-for="opt in options" :key="String(opt.value)">
      <el-checkbox-button v-if="buttonStyle" :value="opt.value">
        <el-tooltip
          v-if="opt.tips"
          :content="opt.tips"
          placement="top"
          effect="dark"
          :show-after="200"
        >
          <span class="wd-option-text">
            <slot :option="opt.raw" :text="opt.text" :value="opt.value" :tips="opt.tips">{{ opt.text }}</slot>
          </span>
        </el-tooltip>
        <slot v-else :option="opt.raw" :text="opt.text" :value="opt.value" :tips="opt.tips">{{ opt.text }}</slot>
      </el-checkbox-button>
      <el-checkbox v-else :value="opt.value">
        <el-tooltip
          v-if="opt.tips"
          :content="opt.tips"
          placement="top"
          effect="dark"
          :show-after="200"
        >
          <span class="wd-option-text">
            <slot :option="opt.raw" :text="opt.text" :value="opt.value" :tips="opt.tips">{{ opt.text }}</slot>
          </span>
        </el-tooltip>
        <slot v-else :option="opt.raw" :text="opt.text" :value="opt.value" :tips="opt.tips">{{ opt.text }}</slot>
      </el-checkbox>
    </template>
  </el-checkbox-group>
</template>

<script setup lang="ts">
import { computed, toRefs, type PropType } from 'vue'
import { useOptionsLoader } from './useOptionsLoader'
import { optionsProps } from '../common/props'

defineOptions({ name: 'WdCheckboxList', inheritAttrs: false })

const props = defineProps({
  ...optionsProps,
  modelValue: { type: Array as PropType<any[]>, default: () => [] },
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
  tipsProp: refs.tipsProp,
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

<style scoped>
.wd-option-text {
  display: inline-block;
}
</style>
