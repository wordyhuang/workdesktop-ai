<template>
  <el-tooltip
    v-if="tips"
    :content="tips"
    :effect="tipsType"
    :placement="placement"
  >
    <el-button v-bind="$attrs" @click="onClick"><slot>{{ label }}</slot></el-button>
  </el-tooltip>
  <el-button v-else v-bind="$attrs" @click="onClick"><slot>{{ label }}</slot></el-button>
</template>

<script setup lang="ts">
import { filterProp, buttonTextProp, tipsProp } from '../common/props'

defineOptions({ name: 'WdTipsButton', inheritAttrs: false })

const props = defineProps({
  ...filterProp,
  ...buttonTextProp,
  ...tipsProp
})

const emit = defineEmits(['click'])

function onClick(event: MouseEvent) {
  emit('click', event)
}
</script>
