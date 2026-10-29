<template>
  <el-drawer
    v-if="mode === 'drawer'"
    v-model="visible"
    append-to-body
    :title="title"
    :size="resolvedSize"
    :direction="direction"
    :before-close="handleBeforeClose"
    v-bind="$attrs"
    :class="drawerClass"
    @closed="onClosed"
  >
    <iframe
      v-if="url"
      ref="iframeRef"
      :key="iframeKey"
      :src="resolvedUrl"
      class="wd-container__iframe wd-container__iframe--drawer"
      frameborder="0"
    />
    <div v-else :key="contentKey" class="wd-container__content">
      <slot />
    </div>
    <template v-if="$slots.footer" #footer>
      <slot name="footer" :close="requestClose" />
    </template>
  </el-drawer>

  <el-dialog
    v-else
    v-model="visible"
    append-to-body
    :title="title"
    :width="resolvedSize"
    :before-close="handleBeforeClose"
    v-bind="$attrs"
    @closed="onClosed"
  >
    <iframe
      v-if="url"
      ref="iframeRef"
      :key="iframeKey"
      :src="resolvedUrl"
      class="wd-container__iframe wd-container__iframe--dialog"
      frameborder="0"
    />
    <div v-else :key="contentKey" class="wd-container__content">
      <slot />
    </div>
    <template v-if="$slots.footer" #footer>
      <slot name="footer" :close="requestClose" />
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onBeforeUnmount, type PropType } from 'vue'
import { useContainerController } from './useContainerController'
import { filterProp, headRefreshDatagridProp } from '../common/props'
import { registerDrawer } from '../../lib/core/drawer-linkage'

defineOptions({ name: 'WdDrawer', inheritAttrs: false })

const props = defineProps({
  ...filterProp,
  ...headRefreshDatagridProp,
  modelValue: { type: Boolean, default: undefined },
  title: { type: String, default: '' },
  /** iframe 地址（设置后容器内以 iframe 加载） */
  url: { type: String, default: '' },
  /** 安全校验：允许的消息来源 origin */
  origin: { type: String, default: '' },
  /** 弹出形式：drawer 抽屉（默认）/ dialog 对话框 */
  mode: { type: String as PropType<'drawer' | 'dialog'>, default: 'drawer' },
  /** 尺寸（抽屉宽度/高度，对话框宽度；数字按 px） */
  size: { type: [String, Number], default: '50%' },
  /** 抽屉弹出方向 rtl/ltr/ttb/btt（仅 mode=drawer 生效） */
  direction: { type: String as PropType<'rtl' | 'ltr' | 'ttb' | 'btt'>, default: 'rtl' },
  /** 关闭前确认文案（设置后关闭弹确认） */
  confirmMessage: { type: String, default: '' },
  /** 容器携带数据（传给内部表单） */
  data: { type: Object as PropType<Record<string, any>>, default: undefined },
  /** 每次打开时重新加载 iframe 内容（url 模式生效；默认 false 保留上次内容） */
  reloadOnOpen: { type: Boolean, default: false }
})

const emit = defineEmits([
  'update:modelValue',
  'open',
  'close',
  'confirm',
  // iframe 联动事件（子页面 postMessage 透传）
  'iframe-message',
  'iframe-ready',
  'iframe-dirty',
  'iframe-submit-success'
])

const {
  visible,
  requestClose,
  handleBeforeClose,
  onClosed,
  refreshContent,
  setIframeRef,
  sendToIframe,
  targetOrigin
} = useContainerController({ props, emit })

const iframeRef = ref<HTMLIFrameElement | null>(null)

/** iframe 重建 key：reloadOnOpen 时每次打开自增，强制重新加载 iframe */
const iframeKey = ref(0)
watch(
  () => visible.value,
  (val) => {
    if (val && props.reloadOnOpen && props.url) {
      iframeKey.value += 1
    }
  }
)

/** 非 iframe 内容重挂载 key：内容组件未注册自身 refresh 时，refresh() 回退强制重挂载 */
const contentKey = ref(0)

/**
 * 刷新抽屉内容（Station 顶部刷新按钮 / 外部 ref 调用）：
 * - iframe 模式：iframeKey++ 重建 iframe（src 重载）
 * - 非 iframe 模式：优先调用内容组件注册的 refresh（只重拉数据，不销毁组件）；
 *   无注册时回退 contentKey++ 强制重挂载插槽内容
 */
function refresh() {
  if (props.url) {
    iframeKey.value += 1
    return
  }
  if (!refreshContent()) {
    contentKey.value += 1
  }
}

// 注册到 drawer-linkage：Station 顶部刷新按钮优先刷新可见抽屉
let unregisterLinkage: (() => void) | null = null
onMounted(() => {
  unregisterLinkage = registerDrawer({
    filter: props.filter,
    isVisible: () => visible.value,
    refresh
  })
})
onBeforeUnmount(() => {
  unregisterLinkage?.()
  unregisterLinkage = null
})

// 同步 ref 到 controller
watch(iframeRef, (newRef) => {
  setIframeRef(newRef)
})

const resolvedSize = computed(() => (typeof props.size === 'number' ? `${props.size}px` : props.size))

/** 抽屉样式类：有标题时套用标题区样式；iframe 模式让内容占满 body */
const drawerClass = computed(() => ({
  'wd-drawer--titled': props.title.trim().length > 0,
  'wd-drawer--iframe': !!props.url
}))

/** iframe 地址：data 作为 query 追加（保持兼容现有实现） */
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

defineExpose({
  open: () => (visible.value = true),
  /** 刷新抽屉内容：iframe 重载 / 内容组件 refresh 优先 / key 重挂载 */
  refresh,
  /** 向 iframe 内发送指令（如 wd-container:submit 触发表单提交） */
  sendToIframe
})
</script>

<style scoped>
.wd-container__iframe {
  width: 100%;
  border: 0;
  display: block;
}
.wd-container__iframe--drawer {
  height: 100%;
}
.wd-container__iframe--dialog {
  height: 60vh;
}
</style>

<!-- el-drawer 内容 append-to-body，scoped 无法作用，故标题区用全局样式 -->
<style>
.wd-drawer--titled .el-drawer__header {
  box-sizing: border-box;
  height: auto;
  margin-bottom: 0;
  padding-top: 12px;
  padding-bottom: 12px;
  align-items: center;
}
.wd-drawer--titled .el-drawer__header > :first-child {
  margin: 0;
  display: flex;
  align-items: center;
}
/* iframe 模式：清空 body 内边距，让 iframe 占满标题以下的剩余空间 */
.wd-drawer--iframe .el-drawer__body {
  padding: 0;
}
</style>
