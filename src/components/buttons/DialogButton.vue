<template>
  <el-button v-bind="$attrs" @click="openDialog">
    <slot name="button">{{ text }}</slot>
  </el-button>

  <wd-dialog
    v-if="rendered"
    v-model="dialogVisible"
    :title="dialogTitle"
    :size="size"
    :url="dialogUrl"
    :data="dialogData"
    :filter="filter"
    :head-refresh-datagrid="headRefreshDatagrid"
    @close="onDialogClose"
    @confirm="onConfirm"
  >
    <slot :data="dialogData" :close="closeDialog" />
    <template v-if="$slots.footer" #footer="footerProps">
      <slot name="footer" v-bind="footerProps" />
    </template>
  </wd-dialog>
</template>

<script setup lang="ts">
import { ref, nextTick, type PropType } from 'vue'
import WdDialog from '../containers/Dialog.vue'
import { filterProp, headRefreshDatagridProp } from '../common/props'

defineOptions({ name: 'WdDialogButton', inheritAttrs: false })

const props = defineProps({
  ...filterProp,
  ...headRefreshDatagridProp,
  /** 按钮文案（也可用 #button 插槽） */
  text: { type: String, default: '' },
  /** 对话框标题 */
  dialogTitle: { type: String, default: '' },
  /** iframe 地址 */
  dialogUrl: { type: String, default: '' },
  /** 传给内部内容/iframe 的数据 */
  dialogData: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
  /** 对话框宽度 */
  size: { type: [String, Number], default: '50%' }
})

const emit = defineEmits(['open', 'close', 'confirm'])

const rendered = ref(false)
const dialogVisible = ref(false)

async function openDialog() {
  rendered.value = true
  await nextTick()
  dialogVisible.value = true
  emit('open')
}

function closeDialog() {
  dialogVisible.value = false
}

function onDialogClose() {
  emit('close')
}

function onConfirm(payload: any) {
  emit('confirm', payload)
}
</script>
