<template>
  <Teleport :to="teleportTarget" :disabled="teleportTarget === 'none'">
    <Transition name="wd-guide-fade">
      <div
        v-if="active"
        class="wd-guide"
        @click="onMaskClick"
        @keydown="onKeydown"
        tabindex="-1"
      >
        <svg class="wd-guide__mask" :width="viewport.w" :height="viewport.h">
          <defs>
            <mask :id="maskId">
              <rect x="0" y="0" :width="viewport.w" :height="viewport.h" fill="#fff" />
              <rect
                v-if="target && currentStep && currentStep.highlight !== 'none'"
                :x="rect.x"
                :y="rect.y"
                :width="rect.w"
                :height="rect.h"
                :rx="holeRx"
                :ry="holeRx"
                fill="#000"
              />
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            :width="viewport.w"
            :height="viewport.h"
            :fill="maskColor"
            :mask="`url(#${maskId})`"
          />
        </svg>

        <div
          v-if="target && currentStep && currentStep.highlight !== 'none'"
          class="wd-guide__spot"
          :class="[`is-${currentStep.highlight}`, `is-${spotPlacement}`]"
          :style="spotStyle"
        />

        <div
          v-if="currentStep && showPanel"
          ref="panelRef"
          class="wd-guide__panel"
          :class="[`is-${panelPlacement}`, { 'is-centered': panelPlacement === 'center' }]"
          :style="panelStyle"
          @click.stop
        >
          <el-icon v-if="showClose" class="wd-guide__close" @click="finish('close')">
            <Close />
          </el-icon>

          <slot
            name="panel"
            :step="currentStep"
            :index="current"
            :total="total"
            :current="current"
            :prev="prev"
            :next="next"
            :close="finish"
          >
            <div v-if="currentStep.title" class="wd-guide__title">{{ currentStep.title }}</div>
            <div v-if="currentStep.description" class="wd-guide__desc">
              {{ currentStep.description }}
            </div>

            <div class="wd-guide__footer">
              <el-button
                v-if="showSkip && current < total - 1"
                link
                type="info"
                class="wd-guide__skip"
                @click="finish('skip')"
              >
                {{ skipText }}
              </el-button>
              <span v-else class="wd-guide__skip-placeholder" />

              <div v-if="showDots" class="wd-guide__dots">
                <button
                  v-for="(s, i) in steps"
                  :key="i"
                  type="button"
                  class="wd-guide__dot"
                  :class="{ 'is-active': i === current }"
                  :aria-label="`第 ${i + 1} 步`"
                  @click="goTo(i)"
                />
              </div>

              <div class="wd-guide__actions">
                <el-button v-if="current > 0" size="small" @click="prev()">
                  {{ prevText }}
                </el-button>
                <el-button type="primary" size="small" @click="next()">
                  {{ current < total - 1 ? nextText : finishText }}
                </el-button>
              </div>
            </div>
          </slot>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Close } from '@element-plus/icons-vue'

defineOptions({ name: 'WdGuide' })

type Placement = 'top' | 'bottom' | 'left' | 'right' | 'center'
type GuideResult = 'finish' | 'skip' | 'close'

/** 单步指引配置 */
export interface GuideStep {
  /** 目标元素：CSS 选择器或元素引用 */
  target: string | HTMLElement
  /** 标题 */
  title?: string
  /** 描述文字 */
  description?: string
  /** 面板优先位置（空间不足自动翻转） */
  placement?: Placement
  /** 高亮样式：rect 矩形（默认）/ circle 圆形 / none 不挖洞 */
  highlight?: 'rect' | 'circle' | 'none'
  /** 高亮区域外扩 px */
  padding?: number
  /** 激活时是否滚动目标到可视区 */
  scrollIntoView?: boolean
}

const props = withDefaults(
  defineProps<{
    /** 显隐（v-model） */
    modelValue?: boolean
    /** 指引步骤 */
    steps: GuideStep[]
    /** 蒙版颜色（任意 CSS 颜色，支持 rgba） */
    maskColor?: string
    /** 高亮区域与目标元素的外扩间距 px */
    padding?: number
    /** 点击蒙版是否关闭 */
    closeOnClickModal?: boolean
    /** 是否显示右上角关闭按钮 */
    showClose?: boolean
    /** 是否显示「跳过」按钮 */
    showSkip?: boolean
    /** 是否显示步骤圆点 */
    showDots?: boolean
    /** 是否显示面板（false 时仅高亮，可用于纯聚焦场景） */
    showPanel?: boolean
    /** 是否支持 ESC 关闭、方向键切换 */
    keyboard?: boolean
    /** 激活时自动滚动目标元素到可视区 */
    scrollIntoView?: boolean
    /** 挂载位置：body / 选择器 / none（不 teleport） */
    appendTo?: string
    skipText?: string
    prevText?: string
    nextText?: string
    finishText?: string
  }>(),
  {
    modelValue: false,
    maskColor: 'rgba(0, 0, 0, 0.6)',
    padding: 8,
    showClose: true,
    closeOnClickModal: false,
    showSkip: true,
    showDots: true,
    showPanel: true,
    keyboard: true,
    scrollIntoView: true,
    appendTo: 'body',
    skipText: '跳过',
    prevText: '上一步',
    nextText: '下一步',
    finishText: '完成'
  }
)

const emit = defineEmits([
  'update:modelValue',
  'change',
  'finish',
  'skip',
  'close'
])

/* ---------- 内部状态 ---------- */

const active = ref(false)
const current = ref(0)
const targetEl = ref<HTMLElement | null>(null)
const viewport = ref({ w: 0, h: 0 })
const rect = ref({ x: 0, y: 0, w: 0, h: 0 })
const panelStyle = ref<Record<string, string>>({})
const panelPlacement = ref<Placement>('bottom')
const spotPlacement = ref<Placement>('bottom')

const panelRef = ref<HTMLElement | null>(null)
const maskId = `wd-guide-mask-${Math.random().toString(36).slice(2, 9)}`

const GAP = 12
const MARGIN = 8

const total = computed(() => props.steps.length)
const currentStep = computed(() => props.steps[current.value])
const target = computed(() => targetEl.value)

const teleportTarget = computed(() => (props.appendTo === 'none' ? 'none' : props.appendTo))

/** 挖洞圆角：circle 取半宽形成圆（宽高一致时为正圆），否则取元素自身圆角 */
const holeRx = computed(() => {
  if (!currentStep.value || currentStep.value.highlight === 'circle') {
    return Math.max(rect.value.w, rect.value.h) / 2
  }
  return 6
})

const spotStyle = computed(() => ({
  left: `${rect.value.x}px`,
  top: `${rect.value.y}px`,
  width: `${rect.value.w}px`,
  height: `${rect.value.h}px`,
  borderRadius:
    currentStep.value?.highlight === 'circle'
      ? '50%'
      : `${holeRx.value}px`
}))

/* ---------- 元素定位 ---------- */

function resolveTarget(step: GuideStep | undefined): HTMLElement | null {
  if (!step) return null
  if (typeof step.target !== 'string') return step.target
  try {
    return document.querySelector(step.target)
  } catch {
    return null
  }
}

function getViewport() {
  return {
    w: document.documentElement.clientWidth || window.innerWidth,
    h: document.documentElement.clientHeight || window.innerHeight
  }
}

/** 面板四边是否都放得下，放不下则翻转/居中 */
function resolvePlacement(stepPadding: number, r: typeof rect.value, vp: { w: number; h: number }): Placement {
  const preferred = currentStep.value?.placement || 'bottom'
  if (preferred === 'center') return 'center'

  const panelW = panelRef.value?.offsetWidth || 320
  const panelH = panelRef.value?.offsetHeight || 160

  const fitTop = r.y - GAP - panelH >= MARGIN
  const fitBottom = r.y + r.h + GAP + panelH <= vp.h - MARGIN
  const fitLeft = r.x - GAP - panelW >= MARGIN
  const fitRight = r.x + r.w + GAP + panelW <= vp.w - MARGIN

  switch (preferred) {
    case 'top':
      if (fitTop) return 'top'
      if (fitBottom) return 'bottom'
      break
    case 'left':
      if (fitLeft) return 'left'
      if (fitRight) return 'right'
      break
    case 'right':
      if (fitRight) return 'right'
      if (fitLeft) return 'left'
      break
    case 'bottom':
    default:
      if (fitBottom) return 'bottom'
      if (fitTop) return 'top'
      break
  }

  // 上下都放不下时尝试左右
  if (fitRight) return 'right'
  if (fitLeft) return 'left'
  return 'center'
}

function computePanelStyle(placement: Placement, r: typeof rect.value, vp: { w: number; h: number }) {
  if (placement === 'center') {
    panelStyle.value = {
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)'
    }
    return
  }

  const panelW = panelRef.value?.offsetWidth || 320
  const panelH = panelRef.value?.offsetHeight || 160
  const cx = r.x + r.w / 2
  const cy = r.y + r.h / 2

  let left = 0
  let top = 0

  switch (placement) {
    case 'bottom':
      left = cx - panelW / 2
      top = r.y + r.h + GAP
      break
    case 'top':
      left = cx - panelW / 2
      top = r.y - GAP - panelH
      break
    case 'right':
      left = r.x + r.w + GAP
      top = cy - panelH / 2
      break
    case 'left':
      left = r.x - GAP - panelW
      top = cy - panelH / 2
      break
  }

  // 防止横向溢出（纵向交由 placement 翻转保证）
  left = Math.min(Math.max(left, MARGIN), Math.max(MARGIN, vp.w - panelW - MARGIN))
  top = Math.min(Math.max(top, MARGIN), Math.max(MARGIN, vp.h - panelH - MARGIN))

  panelStyle.value = { left: `${left}px`, top: `${top}px` }
}

let rafId = 0

function updatePosition() {
  cancelAnimationFrame(rafId)
  rafId = requestAnimationFrame(() => {
    const vp = getViewport()
    viewport.value = vp

    const step = currentStep.value
    targetEl.value = resolveTarget(step)

    if (!targetEl.value || !step || step.highlight === 'none') {
      rect.value = { x: 0, y: 0, w: 0, h: 0 }
      panelPlacement.value = step?.placement === 'center' ? 'center' : 'center'
      spotPlacement.value = 'bottom'
      if (panelRef.value) computePanelStyle('center', rect.value, vp)
      return
    }

    const elRect = targetEl.value.getBoundingClientRect()
    const pad = step.padding ?? props.padding
    const r = {
      x: elRect.left - pad,
      y: elRect.top - pad,
      w: elRect.width + pad * 2,
      h: elRect.height + pad * 2
    }
    rect.value = r

    panelPlacement.value = resolvePlacement(pad, r, vp)
    spotPlacement.value = panelPlacement.value === 'center' ? 'bottom' : panelPlacement.value
    computePanelStyle(panelPlacement.value, r, vp)
  })
}

/* ---------- 步骤导航 ---------- */

function scrollTargetIntoView() {
  const step = currentStep.value
  if (!step || step.scrollIntoView === false) return
  if ((step.scrollIntoView ?? props.scrollIntoView) === false) return
  targetEl.value?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
}

function activateStep() {
  targetEl.value = resolveTarget(currentStep.value)
  nextTick(() => {
    updatePosition()
    scrollTargetIntoView()
  })
}

function goTo(index: number) {
  if (index < 0 || index >= total.value || index === current.value) return
  current.value = index
  emit('change', index)
  activateStep()
}

function next() {
  if (current.value >= total.value - 1) {
    finish('finish')
    return
  }
  goTo(current.value + 1)
}

function prev() {
  goTo(current.value - 1)
}

function finish(result: GuideResult) {
  active.value = false
  emit('update:modelValue', false)
  if (result === 'finish') emit('finish', current.value)
  else if (result === 'skip') emit('skip', current.value)
  else emit('close')
}

/* ---------- 事件 ---------- */

function onMaskClick() {
  if (props.closeOnClickModal) finish('close')
}

function onKeydown(e: KeyboardEvent) {
  if (!props.keyboard) return
  if (e.key === 'Escape') {
    finish(props.showClose ? 'close' : 'skip')
  } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
    e.preventDefault()
    next()
  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    e.preventDefault()
    prev()
  }
}

function onWindowEvent() {
  updatePosition()
}

/* ---------- 显隐联动 ---------- */

function open() {
  if (total.value === 0) return
  active.value = true
  current.value = 0
  nextTick(() => activateStep())
}

watch(
  () => props.modelValue,
  (val) => {
    if (val) open()
    else active.value = false
  },
  { immediate: true }
)

watch(() => props.steps, () => updatePosition(), { deep: false })

onMounted(() => {
  window.addEventListener('resize', onWindowEvent)
  window.addEventListener('scroll', onWindowEvent, true)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)
  window.removeEventListener('resize', onWindowEvent)
  window.removeEventListener('scroll', onWindowEvent, true)
})

defineExpose({
  /** 打开指引（默认从第 0 步开始） */
  open,
  /** 关闭指引 */
  close: () => finish('close'),
  /** 下一步（最后一步时完成） */
  next,
  /** 上一步 */
  prev,
  /** 跳转到指定步骤 */
  goTo,
  /** 重新计算目标位置（目标元素移动/尺寸变化后调用） */
  refresh: updatePosition
})
</script>

<style scoped>
.wd-guide {
  position: fixed;
  inset: 0;
  z-index: 2050;
  outline: none;
}

.wd-guide__mask {
  position: absolute;
  inset: 0;
}

.wd-guide__spot {
  position: absolute;
  box-sizing: border-box;
  border: 1px solid var(--wd-color-primary, #1677ff);
  box-shadow: 0 0 0 1px rgba(22, 119, 255, 0.25);
  transition: left 0.3s ease, top 0.3s ease, width 0.3s ease, height 0.3s ease,
    border-radius 0.3s ease;
  pointer-events: none;
  animation: wd-guide-pulse 2s ease-in-out infinite;
}
.wd-guide__spot.is-circle {
  border-style: solid;
}

@keyframes wd-guide-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 1px rgba(22, 119, 255, 0.25),
      0 0 0 4px rgba(22, 119, 255, 0.08);
  }
  50% {
    box-shadow: 0 0 0 1px rgba(22, 119, 255, 0.45),
      0 0 0 10px rgba(22, 119, 255, 0);
  }
}

/* ---------- 指引面板 ---------- */

.wd-guide__panel {
  position: absolute;
  width: 320px;
  max-width: calc(100vw - 32px);
  padding: 18px 18px 14px;
  background: var(--wd-bg-color-overlay, #fff);
  border-radius: 10px;
  box-shadow: 0 12px 40px rgba(16, 21, 31, 0.22);
  box-sizing: border-box;
  transition: left 0.3s ease, top 0.3s ease;
}

.wd-guide__close {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 15px;
  color: var(--wd-text-color-secondary, #909399);
  cursor: pointer;
  padding: 3px;
  border-radius: 4px;
  transition: color 0.18s ease, background-color 0.18s ease;
}
.wd-guide__close:hover {
  color: var(--wd-text-color-regular, #555b63);
  background: var(--wd-bg-color-page, #f4f6fa);
}

.wd-guide__title {
  font-size: 15px;
  font-weight: 600;
  color: var(--wd-text-color-primary, #24272c);
  padding-right: 20px;
}
.wd-guide__desc {
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.7;
  color: var(--wd-text-color-regular, #555b63);
}

.wd-guide__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 16px;
}
.wd-guide__skip-placeholder {
  width: 40px;
  flex: none;
}

.wd-guide__dots {
  display: flex;
  gap: 6px;
  align-items: center;
}
.wd-guide__dot {
  width: 7px;
  height: 7px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: var(--wd-border-color, #d8dde5);
  cursor: pointer;
  transition: background-color 0.18s ease, transform 0.18s ease;
}
.wd-guide__dot:hover {
  transform: scale(1.2);
}
.wd-guide__dot.is-active {
  background: var(--wd-color-primary, #1677ff);
}

.wd-guide__actions {
  display: flex;
  gap: 8px;
}

/* ---------- 指向箭头 ---------- */

.wd-guide__panel::before {
  content: '';
  position: absolute;
  width: 12px;
  height: 12px;
  background: var(--wd-bg-color-overlay, #fff);
  transform: rotate(45deg);
}
.wd-guide__panel.is-top::before {
  left: 50%;
  bottom: -6px;
  margin-left: -6px;
}
.wd-guide__panel.is-bottom::before {
  left: 50%;
  top: -6px;
  margin-left: -6px;
}
.wd-guide__panel.is-left::before {
  right: -6px;
  top: 50%;
  margin-top: -6px;
}
.wd-guide__panel.is-right::before {
  left: -6px;
  top: 50%;
  margin-top: -6px;
}
.wd-guide__panel.is-centered::before {
  display: none;
}

/* ---------- 过渡 ---------- */

.wd-guide-fade-enter-active,
.wd-guide-fade-leave-active {
  transition: opacity 0.25s ease;
}
.wd-guide-fade-enter-from,
.wd-guide-fade-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .wd-guide__spot,
  .wd-guide__panel,
  .wd-guide-fade-enter-active,
  .wd-guide-fade-leave-active {
    transition: none;
    animation: none;
  }
}
</style>
