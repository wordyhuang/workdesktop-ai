<template>
  <el-drawer
    v-model="visible"
    :title="title"
    :size="resolvedSize"
    :direction="direction"
    :before-close="handleBeforeClose"
    v-bind="$attrs"
    @closed="onClosed"
  >
    <iframe v-if="url" :src="resolvedUrl" class="wd-container__iframe" frameborder="0" />
    <slot v-else />
    <template v-if="$slots.footer" #footer>
      <slot name="footer" :close="requestClose" />
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue'
import { useContainerController } from './useContainerController'
import { filterProp, headRefreshDatagridProp } from '../common/props'

defineOptions({ name: 'WdDrawer', inheritAttrs: false })

const props = defineProps({
  ...filterProp,
  ...headRefreshDatagridProp,
  modelValue: { type: Boolean, default: undefined },
  title: { type: String, default: '' },
  /** iframe 地址 */
  url: { type: String, default: '' },
  /** 抽屉尺寸（宽度/高度） */
  size: { type: [String, Number], default: '50%' },
  /** 弹出方向 rtl/ltr/ttb/btt */
  direction: { type: String as PropType<'rtl' | 'ltr' | 'ttb' | 'btt'>, default: 'rtl' },
  confirmMessage: { type: String, default: '' },
  data: { type: Object as PropType<Record<string, any>>, default: undefined }
})

const emit = defineEmits(['update:modelValue', 'open', 'close', 'confirm'])

const { visible, requestClose, handleBeforeClose, onClosed } = useContainerController({ props, emit })

const resolvedSize = computed(() => (typeof props.size === 'number' ? `${props.size}px` : props.size))

const resolvedUrl = computed(() => {
  if (!props.url) return ''
  if (!props.data) return props.url
  const qs = new URLSearchParams(
    Object.entries(props.data).reduce((acc, [k, v]) => {
      if (v !== undefined && v !== null) acc[k] = String(v)
      return acc
    }, {} as Record<string, string>)
  ).toString()
  if (!qs) return props.url
  return props.url + (props.url.includes('?') ? '&' : '?') + qs
})

defineExpose({ open: () => (visible.value = true) })
</script>

<style scoped>
.wd-container__iframe {
  width: 100%;
  height: 100%;
  min-height: 400px;
  border: 0;
  display: block;
}
</style>
