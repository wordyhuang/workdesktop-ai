<template>
  <el-dialog
    v-model="visible"
    :title="title"
    :width="width"
    :before-close="handleBeforeClose"
    v-bind="$attrs"
    @closed="onClosed"
  >
    <iframe v-if="url" :src="resolvedUrl" class="wd-container__iframe" frameborder="0" />
    <slot v-else />
    <template v-if="$slots.footer" #footer>
      <slot name="footer" :close="requestClose" />
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue'
import { useContainerController } from './useContainerController'
import { filterProp, headRefreshDatagridProp } from '../common/props'

defineOptions({ name: 'WdDialog', inheritAttrs: false })

const props = defineProps({
  ...filterProp,
  ...headRefreshDatagridProp,
  modelValue: { type: Boolean, default: undefined },
  title: { type: String, default: '' },
  /** iframe 地址（设置后容器内以 iframe 加载） */
  url: { type: String, default: '' },
  /** 宽度 */
  size: { type: [String, Number], default: '50%' },
  /** 关闭前确认文案（设置后关闭弹确认） */
  confirmMessage: { type: String, default: '' },
  /** 容器携带数据（传给内部表单） */
  data: { type: Object as PropType<Record<string, any>>, default: undefined }
})

const emit = defineEmits(['update:modelValue', 'open', 'close', 'confirm'])

const { visible, requestClose, handleBeforeClose, onClosed } = useContainerController({ props, emit })

const width = computed(() => (typeof props.size === 'number' ? `${props.size}px` : props.size))

/** iframe 地址：data 作为 query 追加 */
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
  height: 60vh;
  border: 0;
  display: block;
}
</style>
