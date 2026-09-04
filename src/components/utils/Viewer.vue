<template>
  <div class="wd-viewer" v-show="visible">
    <div class="wd-viewer__mask" @click.self="close"></div>
    <div class="wd-viewer__wrapper">
      <!-- 顶部工具栏 -->
      <div class="wd-viewer__toolbar">
        <el-button-group>
          <el-button :icon="ZoomOut" circle @click="zoomOut" title="缩小" />
          <el-button class="wd-viewer__zoom-text" @click="resetZoom">{{ Math.round(zoom * 100) }}%</el-button>
          <el-button :icon="ZoomIn" circle @click="zoomIn" title="放大" />
        </el-button-group>
        <el-button-group v-if="resolvedType === 'image'">
          <el-button :icon="RefreshLeft" circle @click="rotateLeft" title="左转" />
          <el-button :icon="RefreshRight" circle @click="rotateRight" title="右转" />
        </el-button-group>
        <el-button-group v-if="resolvedType === 'image' && sources.length > 1">
          <el-button :icon="ArrowLeft" circle :disabled="page <= 1" @click="prevPage" title="上一张" />
          <el-button class="wd-viewer__page-text" @click="resetPage">{{ page }} / {{ sources.length }}</el-button>
          <el-button :icon="ArrowRight" circle :disabled="page >= sources.length" @click="nextPage" title="下一张" />
        </el-button-group>
        <el-button :icon="Close" circle type="danger" @click="close" title="关闭" />
      </div>

      <!-- 内容区 -->
      <div class="wd-viewer__body" @click.self="close">
        <!-- 图片 -->
        <img
          v-if="resolvedType === 'image'"
          :src="currentSrc"
          class="wd-viewer__img"
          :style="imgStyle"
          @load="onImgLoad"
        />
        <!-- PDF：iframe 内嵌浏览器原生阅读器（自带页码/缩放） -->
        <iframe
          v-else-if="resolvedType === 'pdf'"
          :src="pdfSrc"
          class="wd-viewer__pdf"
          frameborder="0"
        ></iframe>
        <!-- 文档/其他：新窗口全屏阅读 -->
        <div v-else class="wd-viewer__doc">
          <el-icon :size="64"><Document /></el-icon>
          <p class="wd-viewer__doc-name">{{ currentSrc }}</p>
          <el-button type="primary" @click="openDocFullscreen">全屏阅读</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import {
  ArrowLeft,
  ArrowRight,
  Close,
  Document,
  RefreshLeft,
  RefreshRight,
  ZoomIn,
  ZoomOut
} from '@element-plus/icons-vue'
import type { PropType } from 'vue'

defineOptions({ name: 'WdViewer' })

const props = defineProps({
  /** 预览源：单个地址或地址数组（图片数组支持轮播） */
  src: {
    type: [String, Array] as PropType<string | string[]>,
    default: ''
  },
  /** 内容类型；缺省按 src 后缀推断 */
  type: {
    type: String as PropType<'image' | 'pdf' | 'doc'>,
    default: undefined
  },
  /** 是否显示（v-model） */
  modelValue: { type: Boolean, default: false },
  /** 初始缩放比例 */
  zoom: { type: Number, default: 1 },
  /** 初始旋转角度 */
  rotate: { type: Number, default: 0 },
  /** 初始页码/图片索引（从 1 开始） */
  page: { type: Number, default: 1 },
  /** 缩放步长 */
  zoomStep: { type: Number, default: 0.2 },
  /** 最小/最大缩放 */
  minZoom: { type: Number, default: 0.2 },
  maxZoom: { type: Number, default: 5 }
})

const emit = defineEmits(['update:modelValue', 'zoom-change', 'rotate-change', 'page-change', 'close', 'open'])

const sources = computed<string[]>(() => {
  if (Array.isArray(props.src)) return props.src.filter(Boolean)
  return props.src ? [props.src] : []
})

/** 按后缀推断类型 */
const resolvedType = computed<'image' | 'pdf' | 'doc'>(() => {
  if (props.type) return props.type
  const url = sources.value[0] || ''
  const ext = url.split('?')[0].split('.').pop()?.toLowerCase() || ''
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext)) return 'image'
  if (ext === 'pdf') return 'pdf'
  return 'doc'
})

const visible = ref(props.modelValue)
const innerZoom = ref(props.zoom)
const innerRotate = ref(props.rotate)
const innerPage = ref(props.page)
const imgLoaded = ref(false)

watch(
  () => props.modelValue,
  (val) => {
    visible.value = val
    if (val) {
      // 打开时重置到初始状态
      innerZoom.value = props.zoom
      innerRotate.value = props.rotate
      innerPage.value = Math.min(Math.max(1, props.page), Math.max(1, sources.value.length))
      imgLoaded.value = false
      bindKeyboard()
      emit('open')
    } else {
      unbindKeyboard()
    }
  }
)

watch(visible, (val) => emit('update:modelValue', val))

const currentSrc = computed(() => sources.value[innerPage.value - 1] || '')

/** PDF 附加浏览器阅读器参数 */
const pdfSrc = computed(() => {
  const src = currentSrc.value
  if (!src) return ''
  return src
})

const imgStyle = computed(() => ({
  transform: `scale(${innerZoom.value}) rotate(${innerRotate.value}deg)`,
  opacity: imgLoaded.value ? 1 : 0
}))

function onImgLoad() {
  imgLoaded.value = true
}

function zoomIn() {
  const next = Math.min(props.maxZoom, Number((innerZoom.value + props.zoomStep).toFixed(2)))
  innerZoom.value = next
  emit('zoom-change', next)
}

function zoomOut() {
  const next = Math.max(props.minZoom, Number((innerZoom.value - props.zoomStep).toFixed(2)))
  innerZoom.value = next
  emit('zoom-change', next)
}

function resetZoom() {
  innerZoom.value = 1
  emit('zoom-change', 1)
}

function rotateLeft() {
  const next = innerRotate.value - 90
  innerRotate.value = next
  emit('rotate-change', next)
}

function rotateRight() {
  const next = innerRotate.value + 90
  innerRotate.value = next
  emit('rotate-change', next)
}

function prevPage() {
  if (innerPage.value <= 1) return
  innerPage.value -= 1
  imgLoaded.value = false
  emit('page-change', innerPage.value)
}

function nextPage() {
  if (innerPage.value >= sources.value.length) return
  innerPage.value += 1
  imgLoaded.value = false
  emit('page-change', innerPage.value)
}

function resetPage() {
  innerPage.value = 1
  emit('page-change', 1)
}

function openDocFullscreen() {
  if (currentSrc.value) window.open(currentSrc.value, '_blank')
}

function close() {
  visible.value = false
  emit('close')
}

/** 键盘方向键：← → 翻页/旋转，↑ ↓ 缩放，Esc 关闭 */
function onKeydown(e: KeyboardEvent) {
  if (!visible.value) return
  switch (e.key) {
    case 'ArrowLeft':
      if (resolvedType.value === 'image' && sources.value.length > 1) prevPage()
      break
    case 'ArrowRight':
      if (resolvedType.value === 'image' && sources.value.length > 1) nextPage()
      break
    case 'ArrowUp':
      e.preventDefault()
      zoomIn()
      break
    case 'ArrowDown':
      e.preventDefault()
      zoomOut()
      break
    case 'Escape':
      close()
      break
  }
}

function bindKeyboard() {
  nextTick(() => window.addEventListener('keydown', onKeydown))
}

function unbindKeyboard() {
  window.removeEventListener('keydown', onKeydown)
}

/** 外部打开（与 v-model 等价的命令式入口） */
function open(src?: string | string[]) {
  if (src !== undefined) {
    // src 由外部响应式数据控制，这里仅打开
  }
  visible.value = true
}

defineExpose({ open, close, zoomIn, zoomOut, rotateLeft, rotateRight })
</script>

<style scoped>
.wd-viewer {
  position: fixed;
  inset: 0;
  z-index: 3000;
}
.wd-viewer__mask {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
}
.wd-viewer__wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
}
.wd-viewer__toolbar {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 12px;
}
.wd-viewer__zoom-text,
.wd-viewer__page-text {
  min-width: 72px;
  pointer-events: none;
}
.wd-viewer__body {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 0 24px 24px;
}
.wd-viewer__img {
  max-width: 90vw;
  max-height: 80vh;
  transition: transform 0.2s ease, opacity 0.2s ease;
  user-select: none;
}
.wd-viewer__pdf {
  width: 90vw;
  height: 82vh;
  border: none;
  background: #fff;
}
.wd-viewer__doc {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: #fff;
}
.wd-viewer__doc-name {
  max-width: 60vw;
  word-break: break-all;
  font-size: 14px;
}
</style>
