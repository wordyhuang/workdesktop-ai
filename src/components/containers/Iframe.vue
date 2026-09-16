<template>
  <iframe
    ref="iframeRef"
    :key="renderKey"
    :src="src"
    class="wd-iframe"
    :style="iframeStyle"
    frameborder="0"
    @load="onLoad"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, type PropType } from 'vue'

defineOptions({ name: 'WdIframe' })

const props = defineProps({
  /** iframe 地址 */
  src: { type: String, default: '' },
  /** 固定高度（数字按 px） */
  height: { type: [String, Number], default: '480px' },
  /** 高度自适应（通过子页面 postMessage 上报高度） */
  autoHeight: { type: Boolean, default: false },
  /** 发送消息时使用的 targetOrigin（默认同源；跨域时需显式指定子页面 origin） */
  origin: { type: String, default: '' },
  /**
   * 刷新信号：值变化时强制重新加载 iframe 内容。
   * 常用于「每次显示时刷新」：父级在显示时机自增该值即可（例如 v-if 重建时不需此 prop，仅当 iframe 常驻 DOM 时才需要）。
   */
  refreshKey: { type: [Number, String], default: 0 }
})

const emit = defineEmits(['load', 'message'])

const iframeRef = ref<HTMLIFrameElement | null>(null)
const autoHeightValue = ref<number | null>(null)

/** 内部刷新计数：refreshKey 变化 或 调用 refresh() 时自增，驱动 iframe 重建（强制重新加载） */
const renderTick = ref(0)
watch(
  () => props.refreshKey,
  () => {
    renderTick.value += 1
  }
)
const renderKey = computed(() => `${props.refreshKey}:${renderTick.value}`)

const iframeStyle = computed(() => {
  if (props.autoHeight && autoHeightValue.value) {
    return { height: `${autoHeightValue.value}px` }
  }
  return { height: typeof props.height === 'number' ? `${props.height}px` : props.height }
})

function onLoad() {
  emit('load')
}

/**
 * 父 → 子：向 iframe 内页面发送消息（子页通过 window.addEventListener('message') 接收）
 */
function send(message: any) {
  const targetOrigin = props.origin || window.location.origin
  iframeRef.value?.contentWindow?.postMessage(message, targetOrigin)
}

/** 强制重新加载 iframe 内容（重建 iframe 元素） */
function refresh() {
  renderTick.value += 1
}

/** 子页面 postMessage 透传：约定 { type:'wd-iframe-height', height } 或任意消息 */
function onMessage(event: MessageEvent) {
  const data = event.data
  if (props.autoHeight && data && typeof data === 'object' && data.type === 'wd-iframe-height') {
    autoHeightValue.value = Number(data.height) || null
  }
  emit('message', data)
}

onMounted(() => {
  window.addEventListener('message', onMessage)
})
onBeforeUnmount(() => {
  window.removeEventListener('message', onMessage)
})

defineExpose({ send, refresh })
</script>

<style scoped>
.wd-iframe {
  width: 100%;
  border: 0;
  display: block;
}
</style>
