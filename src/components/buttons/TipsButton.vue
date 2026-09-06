<template>
  <el-tooltip
    v-if="tips"
    :content="tips"
    :effect="tipsType"
    :placement="placement"
  >
    <el-button v-bind="$attrs" @click="onClick"><slot>{{ text }}</slot></el-button>
  </el-tooltip>
  <el-button v-else v-bind="$attrs" @click="onClick"><slot>{{ text }}</slot></el-button>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import { filterProp, buttonTextProp } from '../common/props'

defineOptions({ name: 'WdTipsButton', inheritAttrs: false })

const props = defineProps({
  ...filterProp,
  ...buttonTextProp,
  /** 悬停提示内容 */
  tips: { type: String, default: '' },
  /** tooltip 主题：dark/light */
  tipsType: { type: String as PropType<'dark' | 'light'>, default: 'dark' },
  /** 弹出位置 */
  placement: {
    type: String as PropType<'top' | 'bottom' | 'left' | 'right' | string>,
    default: 'top'
  }
})

const emit = defineEmits(['click'])

function onClick(event: MouseEvent) {
  emit('click', event)
}
</script>
