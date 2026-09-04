<template>
  <el-tooltip v-if="tips" :content="tips" placement="top">
    <el-switch
      v-model="inner"
      :active-value="activeValue"
      :inactive-value="inactiveValue"
      :loading="loading"
      v-bind="$attrs"
      @change="onChange"
    />
  </el-tooltip>
  <el-switch
    v-else
    v-model="inner"
    :active-value="activeValue"
    :inactive-value="inactiveValue"
    :loading="loading"
    v-bind="$attrs"
    @change="onChange"
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { request } from '../../lib/core/http'
import { refreshDataGrid } from '../../lib/core/linkage'
import { filterProp, headRefreshDatagridProp, apiProps } from '../common/props'
import type { PropType } from 'vue'

defineOptions({ name: 'WdSwitch', inheritAttrs: false })

const props = defineProps({
  ...filterProp,
  ...headRefreshDatagridProp,
  ...apiProps,
  modelValue: { type: [String, Number, Boolean] as PropType<any>, default: false },
  /** 悬停提示 */
  tips: { type: String, default: '' },
  /** 提交参数的字段名 */
  paramKey: { type: String, default: 'status' },
  activeValue: { type: [String, Number, Boolean], default: true },
  inactiveValue: { type: [String, Number, Boolean], default: false }
})

const emit = defineEmits(['update:modelValue', 'change', 'apiBefore', 'apiSuccess', 'apiFail', 'apiException', 'apiAfter'])

const loading = ref(false)

const inner = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

async function onChange(val: any) {
  emit('change', val)
  if (!props.api) return

  // 记录旧值，失败回滚
  const oldVal = val === props.activeValue ? props.inactiveValue : props.activeValue
  loading.value = true
  emit('apiBefore', { url: props.api })
  try {
    const param = { ...props.apiParam, [props.paramKey]: val }
    const result =
      props.apiMethod === 'get'
        ? await request.get(props.api, param)
        : await request.post(props.api, param)
    if (result.success) {
      emit('apiSuccess', { data: result.data })
      if (props.headRefreshDatagrid) {
        refreshDataGrid(props.headRefreshDatagrid, props.filter)
      }
      emit('apiAfter', { data: result.data })
    } else {
      // 业务失败：回滚状态
      emit('update:modelValue', oldVal)
      emit('apiFail', { code: result.code, message: result.message })
      emit('apiAfter', { code: result.code })
    }
  } catch (error: any) {
    // 网络异常：回滚状态
    emit('update:modelValue', oldVal)
    emit('apiException', { error, message: error?.message })
    emit('apiAfter', { error })
  } finally {
    loading.value = false
  }
}
</script>
