<template>
  <el-tooltip
    v-if="tips"
    :content="tips"
    :effect="tipsType"
    :placement="placement"
  >
    <el-button v-bind="$attrs" :size="buttonSize || undefined" @click="openPanel">
      <slot name="button">{{ label }}</slot>
    </el-button>
  </el-tooltip>
  <el-button v-else v-bind="$attrs" :size="buttonSize || undefined" @click="openPanel">
    <slot name="button">{{ label }}</slot>
  </el-button>

  <wd-drawer
    v-if="rendered"
    v-model="panelVisible"
    :mode="mode"
    :title="title"
    :size="size"
    :direction="direction"
    :url="url"
    :data="data"
    :filter="filter"
    :head-refresh-datagrid="headRefreshDatagrid"
    :reload-on-open="reloadOnOpen"
    @close="onClose"
    @confirm="onConfirm"
  >
    <slot :data="data" :close="closePanel" />
    <template v-if="$slots.footer" #footer="footerProps">
      <slot name="footer" v-bind="footerProps" />
    </template>
  </wd-drawer>
</template>

<script setup lang="ts">
import { ref, nextTick, type PropType } from 'vue'
import WdDrawer from '../containers/Drawer.vue'
import { filterProp, headRefreshDatagridProp, tipsProp } from '../common/props'

defineOptions({ name: 'WdDrawerButton', inheritAttrs: false })

defineProps({
  ...filterProp,
  ...headRefreshDatagridProp,
  ...tipsProp,
  /** 按钮文案（也可用 #button 插槽；el-button 原生 text 走 $attrs 透传） */
  label: { type: String, default: '' },
  /**
   * 按钮尺寸（el-button size）。
   * 注意：DrawerButton 的 size 被「弹层尺寸」占用，按钮尺寸请用 buttonSize，否则两属性冲突。
   */
  buttonSize: {
    type: String as PropType<'large' | 'default' | 'small' | ''>,
    default: ''
  },
  /** 弹出层形式：drawer 抽屉 / dialog 对话框 */
  mode: { type: String as PropType<'drawer' | 'dialog'>, default: 'drawer' },
  /** 弹出层标题 */
  title: { type: String, default: '' },
  /** iframe 地址（设置后弹层内以 iframe 加载，否则渲染默认插槽） */
  url: { type: String, default: '' },
  /** 传给内部表单/iframe 的数据 */
  data: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
  /** 弹出层尺寸（抽屉宽度/高度，对话框宽度） */
  size: { type: [String, Number], default: '50%' },
  /** 抽屉弹出方向（仅 mode=drawer 生效） */
  direction: { type: String as PropType<'rtl' | 'ltr' | 'ttb' | 'btt'>, default: 'rtl' },
  /** 每次打开弹层时重新加载 iframe 内容（url 模式生效） */
  reloadOnOpen: { type: Boolean, default: false }
})

const emit = defineEmits(['open', 'close', 'confirm'])

/** 内容懒挂载：首次打开才渲染弹层内容，避免内部 DataForm 提前请求 */
const rendered = ref(false)
const panelVisible = ref(false)

async function openPanel() {
  rendered.value = true
  await nextTick()
  panelVisible.value = true
  emit('open')
}

function closePanel() {
  panelVisible.value = false
}

function onClose() {
  emit('close')
}

function onConfirm(payload: any) {
  emit('confirm', payload)
}
</script>
