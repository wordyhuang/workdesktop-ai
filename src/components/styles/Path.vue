<template>
  <div class="wd-path" :data-animation="animation">
    <el-breadcrumb :separator="separator">
      <!-- 内容变动动画：fade/slide 时以 TransitionGroup 包裹路径段，段增删替换播放过渡 -->
      <TransitionGroup
        v-if="animation !== 'none'"
        :name="`wd-path-anim--${animation}`"
        tag="span"
        class="wd-path__anim"
        :data-animation="animation"
      >
        <el-breadcrumb-item
          v-for="seg in segmentViews"
          :key="seg.key"
          :class="{ 'is-heading': seg.source === 'heading', 'is-active': seg.source === 'heading' || seg.source === 'home' }"
          :to="seg.path && hasRouter ? { path: seg.path } : undefined"
          @click="onSegmentClick(seg)"
        >
          <el-icon v-if="resolveIcon(seg.icon)" class="wd-path__icon">
            <component :is="resolveIcon(seg.icon)" />
          </el-icon>
          {{ seg.title }}
        </el-breadcrumb-item>
      </TransitionGroup>
      <template v-else>
        <el-breadcrumb-item
          v-for="seg in segmentViews"
          :key="seg.key"
          :class="{ 'is-heading': seg.source === 'heading', 'is-active': seg.source === 'heading' || seg.source === 'home' }"
          :to="seg.path && hasRouter ? { path: seg.path } : undefined"
          @click="onSegmentClick(seg)"
        >
          <el-icon v-if="resolveIcon(seg.icon)" class="wd-path__icon">
            <component :is="resolveIcon(seg.icon)" />
          </el-icon>
          {{ seg.title }}
        </el-breadcrumb-item>
      </template>
    </el-breadcrumb>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  getCurrentInstance,
  onMounted,
  onUnmounted,
  ref,
  watch,
  type PropType
} from 'vue'
import * as ElIcons from '@element-plus/icons-vue'
import { filterProp } from '../common/props'
import { getStationMenuChain, subscribeStationChange } from '../../lib/core/station-linkage'
import type { PathItem } from '../layout/types'

defineOptions({ name: 'WdPath' })

const props = defineProps({
  ...filterProp,
  /** 模式：manual=手动填写路径 / auto=自动联动（Station 菜单链 + 页面标题） */
  mode: { type: String as PropType<'manual' | 'auto'>, default: 'manual' },
  /** 手动模式路径节点（PathItem[]，支持 JSON 字符串） */
  items: { type: [Array, String] as PropType<PathItem[] | string>, default: undefined },
  /** 自动模式：首页节点标题 */
  home: { type: String, default: '首页' },
  /** 自动模式：是否显示首页节点 */
  showHome: { type: Boolean, default: true },
  /** 分隔符 */
  separator: { type: String, default: '/' },
  /** 路径内容（路径段）变动时的动画：none=无 / fade=淡入淡出 / slide=横向滑移+淡入 */
  animation: { type: String as PropType<'none' | 'fade' | 'slide'>, default: 'none' },
  /** 标题扫描范围：CSS 选择器或元素；默认最近的 Station 内容区（.wd-station__content），无则整页 */
  container: { type: [String, Object] as PropType<string | HTMLElement>, default: undefined }
})

const emit = defineEmits<{
  (e: 'change', segments: PathItem[]): void
  (e: 'item-click', item: PathItem): void
}>()

const instance = getCurrentInstance()
const hasRouter = computed(() => {
  const root = instance?.appContext?.config?.globalProperties as any
  return !!(root?.$router)
})

/* ---------- 手动模式：路径解析 ---------- */
function parseItems(): PathItem[] {
  if (!props.items) return []
  if (typeof props.items === 'string') {
    try {
      return JSON.parse(props.items)
    } catch (e) {
      console.error('[WorkDesktop] WdPath items JSON 解析失败，已回退空路径:', e)
      return []
    }
  }
  return props.items
}

/* ---------- 自动模式：标题扫描 ---------- */
interface HeadingNode {
  el: HTMLElement
  level: number
  title: string
}

const containerEl = ref<HTMLElement | null>(null)
const menuChain = ref<PathItem[]>([])
const headings = ref<HeadingNode[]>([])
const activeIndex = ref(-1)

function resolveContainer(): HTMLElement {
  const root = instance?.proxy?.$el as HTMLElement | undefined
  if (props.container) {
    if (typeof props.container === 'string') {
      const el = document.querySelector(props.container)
      if (el) return el as HTMLElement
    } else if ((props.container as HTMLElement).nodeType === 1) {
      return props.container as HTMLElement
    }
  }
  // 默认：最近的 Station 内容区；无则整页
  const content = root?.closest('.wd-station__content') as HTMLElement | null
  return content || document.body
}

function collectHeadings(): HeadingNode[] {
  const container = containerEl.value || document.body
  const nodes: HeadingNode[] = []
  container.querySelectorAll('h1,h2,h3,h4').forEach((el) => {
    const title = (el.textContent || '').trim()
    if (!title) return
    nodes.push({ el: el as HTMLElement, level: Number(el.tagName.charAt(1)), title })
  })
  return nodes
}

/** 标题结构签名：层级+标题有序列表，用于判断容器变化是否真的影响标题集合 */
function headingsSignature(list: HeadingNode[]): string {
  return list.map((h) => `${h.level}:${h.title}`).join('|')
}

/** 大纲链：以 end 位置的标题为终点，逐级收敛（h1→h2→h3→h4） */
function buildChain(list: HeadingNode[], end: number): PathItem[] {
  const stack: HeadingNode[] = []
  for (let i = 0; i <= end; i++) {
    const h = list[i]
    while (stack.length && stack[stack.length - 1].level >= h.level) stack.pop()
    stack.push(h)
  }
  return stack.map((h) => ({ title: h.title, source: 'heading', level: h.level } as PathItem))
}

function isPageContainer(el: HTMLElement): boolean {
  return el === document.body || el === document.documentElement
}

/** 当前可视范围内的第一个标题：容器滚动位置处最先映入视口/容器顶部的 H1~H4（滚动跟随） */
function computeActiveIndex(): number {
  const list = headings.value
  if (!list.length) return -1
  const container = containerEl.value || document.body
  const cRect = container.getBoundingClientRect()
  const scrollTop = isPageContainer(container)
    ? window.scrollY || document.documentElement.scrollTop
    : container.scrollTop
  // 默认取最后一个（全部标题均已滚出顶部时，锚定末尾章节）
  let active = list.length - 1
  for (let i = 0; i < list.length; i++) {
    const hRect = list[i].el.getBoundingClientRect()
    const top = hRect.top - cRect.top + scrollTop
    // 容器滚动内容中，位置位于可视区起点（scrollTop）之下的第一个标题即当前章节
    if (top >= scrollTop - 1) { active = i; break }
  }
  return active
}

/* ---------- 自动模式：数据刷新 ---------- */
function refreshMenuChain() {
  menuChain.value = getStationMenuChain(true, props.filter).map((c) => ({
    ...c,
    source: 'menu'
  }) as PathItem)
}

function refreshHeadings() {
  const next = collectHeadings()
  // 标题结构未变（仅非标题节点变动）时不重建列表，避免无意义的全链重算
  if (headingsSignature(next) !== headingsSignature(headings.value)) {
    headings.value = next
  }
  const idx = computeActiveIndex()
  if (idx !== activeIndex.value) activeIndex.value = idx
}

/** 完整刷新（手动模式仅触发 change 事件；自动模式重读菜单链与标题） */
function refresh() {
  if (props.mode !== 'auto') {
    emitChange()
    return
  }
  refreshMenuChain()
  refreshHeadings()
  emitChange()
}

/* ---------- 段组装 ---------- */
const displayHeadings = computed<PathItem[]>(() => {
  const list = headings.value
  if (!list.length) return []
  return activeIndex.value >= 0 ? buildChain(list, activeIndex.value) : []
})

const segments = computed<PathItem[]>(() => {
  if (props.mode === 'auto') {
    const head: PathItem[] = props.showHome ? [{ title: props.home, source: 'home' }] : []
    return [...head, ...menuChain.value, ...displayHeadings.value]
  }
  return parseItems().map((it) => ({ ...it, source: it.source || 'manual' }))
})

const segmentViews = computed(() =>
  segments.value.map((s, i) => ({ ...s, key: `${s.source || 'seg'}:${i}:${s.title}` }))
)

let lastSig = ''
function emitChange() {
  const sig = segments.value.map((s) => `${s.level ?? ''}:${s.title}`).join('|')
  if (sig === lastSig) return
  lastSig = sig
  emit('change', segments.value)
}

watch(segments, () => emitChange())

/* ---------- 容器事件绑定（标题扫描 + 滚动跟随当前可视范围内第一个标题） ---------- */
let scrollTicking = false
function onScroll() {
  if (props.mode !== 'auto' || scrollTicking) return
  scrollTicking = true
  requestAnimationFrame(() => {
    scrollTicking = false
    if (props.mode === 'auto') {
      activeIndex.value = computeActiveIndex()
    }
  })
}

let observer: MutationObserver | null = null
let scrollTarget: HTMLElement | Window | null = null
function bindContainer(el: HTMLElement) {
  unbindContainer()
  containerEl.value = el
  // 页面级容器（body/documentElement）滚动事件挂在 window；元素级挂在自身
  scrollTarget = isPageContainer(el) ? window : el
  scrollTarget.addEventListener('scroll', onScroll, { passive: true })
  if (typeof MutationObserver !== 'undefined') {
    observer = new MutationObserver((records) => {
      if (props.mode !== 'auto') return
      // 路径自身（TransitionGroup 动画导致的段节点增删）位于观察容器内部，
      // 忽略全部落在 .wd-path 子树内的变动，避免「动画改 DOM → 触发重扫 → 重渲染 → 再触发动画」的自激循环
      const fromContent = records.some((r) => {
        const target = r.target as HTMLElement | null
        return !(target && typeof target.closest === 'function' && target.closest('.wd-path'))
      })
      if (fromContent) refreshHeadings()
    })
    observer.observe(el, { childList: true, subtree: true })
  }
}

function unbindContainer() {
  containerEl.value = null
  scrollTarget?.removeEventListener('scroll', onScroll)
  scrollTarget = null
  observer?.disconnect()
  observer = null
}

/* ---------- 事件 ---------- */
function onSegmentClick(seg: PathItem) {
  emit('item-click', seg)
}

function resolveIcon(icon: any) {
  if (!icon) return null
  if (typeof icon === 'string') return (ElIcons as any)[icon] || null
  return icon
}

/* ---------- 生命周期：自动模式联动（Station 菜单链 + 路由 + 标题） ---------- */
let unsub: (() => void) | null = null
function bindAuto() {
  if (props.mode !== 'auto') return
  unsub = subscribeStationChange(props.filter, refreshMenuChain)
  bindContainer(resolveContainer())
  refresh()
}

function unbindAuto() {
  unbindContainer()
  unsub?.()
  unsub = null
}

onMounted(() => {
  bindAuto()
  refresh()
})

watch(
  () => props.mode,
  (mode) => {
    if (mode === 'auto') {
      bindAuto()
    } else {
      unbindAuto()
      refresh()
    }
  }
)

watch(
  () => props.filter,
  () => {
    if (props.mode !== 'auto') return
    unsub?.()
    unsub = subscribeStationChange(props.filter, refreshMenuChain)
    refreshMenuChain()
  }
)

// 容器变化（如 :container="ref" 延迟就绪）→ 重绑并重扫
watch(
  () => props.container,
  () => {
    if (props.mode === 'auto') bindContainer(resolveContainer())
    refresh()
  }
)

// router 模式：路由变化 → 重读菜单链与标题
const routePath = computed(() => (instance?.proxy as any)?.$route?.path)
watch(routePath, () => {
  if (props.mode === 'auto') refresh()
})

onUnmounted(() => unbindAuto())

defineExpose({ refresh })
</script>

<style scoped>
.wd-path {
  display: inline-flex;
  align-items: center;
  min-width: 0;
}
.wd-path :deep(.el-breadcrumb__item) {
  /* 不限制单个路径段宽度（长标题如“HTTP 请求（RequestAPI / request 单例 / useRequest）”
     按内容自然撑开，不被截断）；整体宽度由容器（如顶栏）约束 */
  overflow: hidden;
  white-space: nowrap;
}
.wd-path :deep(.el-breadcrumb__inner) {
  display: inline-flex;
  align-items: center;
  color: var(--wd-text-color-secondary, #909399);
  white-space: nowrap;
  text-overflow: ellipsis;
}
.wd-path :deep(.el-breadcrumb__inner.is-link) {
  color: var(--wd-color-primary, #409eff);
  font-weight: 400;
}
.wd-path :deep(.el-breadcrumb__inner.is-link:hover) {
  color: var(--wd-color-primary-light-3, #79bbff);
}
/* 首页与标题段：主色加粗，标识当前位置 */
.wd-path :deep(.el-breadcrumb__item.is-active .el-breadcrumb__inner) {
  color: var(--wd-text-color-primary, #303133);
  font-weight: 600;
}
.wd-path__icon {
  margin-right: 4px;
  vertical-align: -2px;
}

/* —— 内容变动动画（TransitionGroup 过渡类作用于各路径段根节点） —— */
.wd-path__anim {
  position: relative;
  display: inline-flex;
  align-items: center;
}
/* fade：纯淡入淡出 */
.wd-path-anim--fade-enter-active,
.wd-path-anim--fade-leave-active {
  transition: opacity 0.2s ease;
}
.wd-path-anim--fade-enter-from,
.wd-path-anim--fade-leave-to {
  opacity: 0;
}
/* slide：新段自左滑入、旧段向右滑出，留存段 FLIP 位移 */
.wd-path-anim--slide-enter-active,
.wd-path-anim--slide-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.wd-path-anim--slide-enter-from {
  opacity: 0;
  transform: translateX(-8px);
}
.wd-path-anim--slide-leave-to {
  opacity: 0;
  transform: translateX(8px);
}
.wd-path-anim--slide-leave-active {
  position: absolute;
}
.wd-path-anim--slide-move {
  transition: transform 0.2s ease;
}
</style>
