<template>
  <div
    ref="wrapperRef"
    class="wd-iframe-wrapper"
    :style="wrapperStyle"
    v-loading="loadingVisible"
    v-bind="loadingBindings"
  >
    <iframe
      ref="iframeRef"
      :key="renderKey"
      :src="src"
      class="wd-iframe"
      frameborder="0"
      @load="onLoad"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { getGlobalConfig } from '../../lib/core/config'
import { useConfig } from '../../lib/composables/useConfig'

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
  refreshKey: { type: [Number, String], default: 0 },
  /**
   * 是否显示加载遮罩：
   * - 不传（undefined）：跟随全局配置 request.loading.enable；
   * - true：强制显示（子页加载完成前）；
   * - false：关闭 loading，加载过程不出现遮罩。
   */
  loading: { type: Boolean, default: undefined },
  /**
   * 加载超时时间（毫秒）：超时后自动关闭遮罩并触发 timeout 事件；
   * 不传时取组件默认配置，默认 0 表示不限制（不超时）。
   */
  timeout: { type: Number, default: undefined }
})

const emit = defineEmits(['load', 'message', 'complete', 'timeout'])

const iframeRef = ref<HTMLIFrameElement | null>(null)
const wrapperRef = ref<HTMLElement | null>(null)
const autoHeightValue = ref<number | null>(null)

/** 合并全局组件默认配置（page.componentDefault.WdIframe）→ 本地 props */
const cfg = useConfig<{ loading?: boolean; timeout?: number }>('WdIframe', {
  loading: props.loading,
  timeout: props.timeout
})

/** 内部刷新计数：refreshKey 变化 或 调用 refresh() 时自增，驱动 iframe 重建（强制重新加载） */
const renderTick = ref(0)
watch(
  () => props.refreshKey,
  () => {
    renderTick.value += 1
  }
)
const renderKey = computed(() => `${props.refreshKey}:${renderTick.value}`)

/** 容器高度（iframe 填满容器，loading 遮罩按容器定位） */
const wrapperStyle = computed(() => {
  if (props.autoHeight && autoHeightValue.value) {
    return { height: `${autoHeightValue.value}px` }
  }
  return { height: typeof props.height === 'number' ? `${props.height}px` : props.height }
})

/* ---------------- loading 遮罩 ---------------- */

const loadingVisible = ref(false)
let timeoutTimer: ReturnType<typeof setTimeout> | null = null

/** 是否启用 loading：本地 props / 组件默认（useConfig 已合并）→ 全局 request.loading.enable */
function loadingEnabled(): boolean {
  return cfg.value.loading ?? getGlobalConfig().request.loading.enable
}

/** 超时毫秒：0 表示不限制 */
function timeoutMs(): number {
  return cfg.value.timeout ?? 0
}

/** 遮罩外观跟随全局 request.loading.props（映射到 v-loading 支持的属性） */
const loadingBindings = computed<Record<string, any>>(() => {
  const p = getGlobalConfig().request.loading.props || {}
  return {
    elementLoadingText: p.text,
    elementLoadingBackground: p.background,
    elementLoadingSpinner: p.spinner,
    elementLoadingSvg: p.svg,
    elementLoadingSvgViewBox: p.svgViewBox
  }
})

function clearTimer() {
  if (timeoutTimer) {
    clearTimeout(timeoutTimer)
    timeoutTimer = null
  }
}

/** 开始一次加载：显示遮罩并启动超时计时 */
function startLoading() {
  clearTimer()
  if (!props.src || !loadingEnabled()) {
    loadingVisible.value = false
    return
  }
  loadingVisible.value = true
  const ms = timeoutMs()
  if (ms > 0) {
    timeoutTimer = setTimeout(() => {
      loadingVisible.value = false
      timeoutTimer = null
      emit('timeout', { timeout: ms })
    }, ms)
  }
}

function onLoad() {
  clearTimer()
  loadingVisible.value = false
  // 保留 load（原生语义，向后兼容），complete 表示「加载完成、loading 结束」
  emit('load')
  emit('complete')
}

/* 地址变化或 iframe 重建（刷新）时，重新进入 loading */
watch(
  [() => props.src, renderKey],
  () => startLoading()
)

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
  startLoading()
})
onBeforeUnmount(() => {
  clearTimer()
  window.removeEventListener('message', onMessage)
})

defineExpose({ send, refresh })
</script>

<style scoped>
.wd-iframe-wrapper {
  position: relative;
  width: 100%;
}
.wd-iframe {
  width: 100%;
  height: 100%;
  border: 0;
  display: block;
}
</style>
