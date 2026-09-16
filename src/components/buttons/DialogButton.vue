<template>
  <el-tooltip
    v-if="tips"
    :content="tips"
    :effect="tipsType"
    :placement="placement"
  >
    <el-button :type="type" :size="buttonSize" :disabled="disabled" v-bind="$attrs" @click="openDialog">
      <slot name="button">{{ label }}</slot>
    </el-button>
  </el-tooltip>
  <el-button v-else :type="type" :size="buttonSize" :disabled="disabled" v-bind="$attrs" @click="openDialog">
    <slot name="button">{{ label }}</slot>
  </el-button>

  <wd-drawer
    v-if="rendered"
    v-model="dialogVisible"
    mode="dialog"
    :title="title"
    :size="size"
    :url="url"
    :data="data"
    :filter="filter"
    :head-refresh-datagrid="headRefreshDatagrid"
    @close="onClose"
    @confirm="onConfirm"
  >
    <slot :data="data" :close="closeDialog" />
    <template v-if="$slots.footer" #footer="footerProps">
      <slot name="footer" v-bind="footerProps" />
    </template>
  </wd-drawer>
</template>

<script setup lang="ts">
import { ref, nextTick, type PropType } from 'vue'
import WdDrawer from '../containers/Drawer.vue'
import { filterProp, headRefreshDatagridProp, tipsProp } from '../common/props'

defineOptions({ name: 'WdDialogButton', inheritAttrs: false })

defineProps({
  ...filterProp,
  ...headRefreshDatagridProp,
  ...tipsProp,
  /** 按钮文案（也可用 #button 插槽；el-button 原生 text 走 $attrs 透传） */
  label: { type: String, default: '' },
  /** 弹出层标题 */
  title: { type: String, default: '' },
  /** iframe 地址（设置后弹层内以 iframe 加载，否则渲染默认插槽） */
  url: { type: String, default: '' },
  /** 传给内部表单/iframe 的数据 */
  data: { type: Object, default: () => ({}) },
  /** 对话框宽度 */
  size: { type: [String, Number], default: '50%' },
  /** el-button type */
  type: { type: String, default: 'primary' },
  /** el-button size */
  buttonSize: { type: String, default: 'default' },
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['open', 'close', 'confirm'])

/** 内容懒挂载：首次打开才渲染弹层内容，避免内部 DataForm 提前请求 */
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

function onClose() {
  emit('close')
}

function onConfirm(payload: any) {
  emit('confirm', payload)
}
</script>
