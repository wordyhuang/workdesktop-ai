<template>
  <iframe
    ref="iframeRef"
    :src="src"
    class="wd-iframe"
    :style="iframeStyle"
    frameborder="0"
    @load="onLoad"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, type PropType } from 'vue'

defineOptions({ name: 'WdIframe' })

const props = defineProps({
  /** iframe 地址 */
  src: { type: String, default: '' },
  /** 固定高度（数字按 px） */
  height: { type: [String, Number], default: '480px' },
  /** 高度自适应（通过子页面 postMessage 上报高度） */
  autoHeight: { type: Boolean, default: false }
})

const emit = defineEmits(['load', 'message'])

const iframeRef = ref<HTMLIFrameElement | null>(null)
const autoHeightValue = ref<number | null>(null)

const iframeStyle = computed(() => {
  if (props.autoHeight && autoHeightValue.value) {
    return { height: `${autoHeightValue.value}px` }
  }
  return { height: typeof props.height === 'number' ? `${props.height}px` : props.height }
})

function onLoad() {
  emit('load')
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
</script>

<style scoped>
.wd-iframe {
  width: 100%;
  border: 0;
  display: block;
}
</style>
