<template>
  <el-button v-bind="$attrs" @click="openDrawer">
    <slot name="button">{{ text }}</slot>
  </el-button>

  <wd-drawer
    v-if="rendered"
    v-model="drawerVisible"
    :title="drawerTitle"
    :size="size"
    :direction="direction"
    :url="drawerUrl"
    :data="drawerData"
    :filter="filter"
    :head-refresh-datagrid="headRefreshDatagrid"
    @close="onDrawerClose"
    @confirm="onConfirm"
  >
    <slot :data="drawerData" :close="closeDrawer" />
    <template v-if="$slots.footer" #footer="footerProps">
      <slot name="footer" v-bind="footerProps" />
    </template>
  </wd-drawer>
</template>

<script setup lang="ts">
import { ref, nextTick, type PropType } from 'vue'
import WdDrawer from '../containers/Drawer.vue'
import { filterProp, headRefreshDatagridProp } from '../common/props'

defineOptions({ name: 'WdDrawerButton', inheritAttrs: false })

const props = defineProps({
  ...filterProp,
  ...headRefreshDatagridProp,
  /** 按钮文案（也可用 #button 插槽） */
  text: { type: String, default: '' },
  /** 抽屉标题 */
  drawerTitle: { type: String, default: '' },
  /** iframe 地址（设置后抽屉内以 iframe 加载，否则渲染默认插槽） */
  drawerUrl: { type: String, default: '' },
  /** 传给内部表单/iframe 的数据 */
  drawerData: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
  /** 抽屉尺寸 */
  size: { type: [String, Number], default: '50%' },
  /** 弹出方向 */
  direction: { type: String as PropType<'rtl' | 'ltr' | 'ttb' | 'btt'>, default: 'rtl' }
})

const emit = defineEmits(['open', 'close', 'confirm'])

/** 内容懒挂载：首次打开才渲染抽屉内容，避免内部 DataForm 提前请求 */
const rendered = ref(false)
const drawerVisible = ref(false)

async function openDrawer() {
  rendered.value = true
  await nextTick()
  drawerVisible.value = true
  emit('open')
}

function closeDrawer() {
  drawerVisible.value = false
}

function onDrawerClose() {
  emit('close')
}

function onConfirm(payload: any) {
  emit('confirm', payload)
}
</script>
