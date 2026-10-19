<template>
  <nav
    class="wd-anchor"
    :data-position="position"
    :data-placement="placement"
    :data-dot="dot ? 'true' : 'false'"
    :data-expanded="expanded ? 'true' : 'false'"
  >
    <!-- 触发按钮：默认渲染圆形按钮，可用 #toggle 插槽自定义内容（按钮点击行为仍由组件接管） -->
    <button
      type="button"
      class="wd-anchor__toggle"
      :aria-expanded="expanded"
      @click="toggleExpanded"
    >
      <slot name="toggle">
        <span
          v-if="props.toggleText"
          class="wd-anchor__toggle-text"
          :data-direction="props.toggleTextDirection"
        >{{ props.toggleText }}</span>
        <span v-else class="wd-anchor__toggle-icon" aria-hidden="true">
          <i /><i /><i />
        </span>
      </slot>
    </button>
    <ul v-if="listItems.length && expanded" class="wd-anchor__list">
      <li
        v-for="(item, i) in listItems"
        :key="`${item.level}:${i}:${item.title}`"
        class="wd-anchor__item"
        :class="{ 'is-active': i === activeIndex }"
        :data-level="item.level"
        :data-title="item.title"
        @click="onItemClick(item, i)"
      >
        <span class="wd-anchor__dot" />
        <span v-if="!dot" class="wd-anchor__text">{{ item.title }}</span>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, onMounted, onUnmounted, ref, watch, type PropType } from 'vue'
import { registerAnchorInstance, type AnchorItemLike } from '../../lib/core/anchor-linkage'

defineOptions({ name: 'WdAnchor' })

interface AnchorItem {
  title: string
  level: number
}

const props = defineProps({
  /** 标题扫描范围：CSS 选择器或元素；默认最近的 Station 内容区（.wd-station__content），无则整页 */
  container: { type: [String, Object] as PropType<string | HTMLElement>, default: undefined },
  /** 悬浮定位：fixed=视口悬浮（不随页面滚动） / absolute=相对最近的定位祖先容器 */
  position: { type: String as PropType<'fixed' | 'absolute'>, default: 'fixed' },
  /** 最大标题层级（1~4），超出层级的标题不进入列表 */
  maxLevel: { type: Number, default: 4 },
  /** 点击跳转时距离视口顶部的留白偏移（px） */
  offset: { type: Number, default: 16 },
  /** 手动指定菜单内容（数组或 JSON 字符串）；传入后跳过容器标题扫描 */
  items: { type: [Array, String] as PropType<AnchorItemLike[] | string>, default: undefined },
  /** 联动分组标识：同 filter 的多个 Anchor 实例可被 setAnchorItems / notifyAnchorChange 跨组件驱动 */
  filter: { type: String, default: '' },
  /** 菜单位置：right=右侧 / left=左侧 / top=顶部 / bottom=底部 */
  placement: { type: String as PropType<'right' | 'left' | 'top' | 'bottom'>, default: 'right' },
  /** 圆点模式：默认只显示圆点，鼠标悬停时圆点展开为文字（默认开启） */
  dot: { type: Boolean, default: true },
  /** v-model:expanded 受控展开态：true=展开列表 / false=仅显示触发按钮（默认收起） */
  expanded: { type: Boolean, default: false },
  /** 触发按钮文字；传入后覆盖默认的多点列表图标（slot 优先级最高） */
  toggleText: { type: String, default: '' },
  /** 触发按钮文字方向：horizontal=横排 / vertical=竖排（适合窄侧边） */
  toggleTextDirection: { type: String as PropType<'horizontal' | 'vertical'>, default: 'horizontal' }
})

const emit = defineEmits<{
  (e: 'change', item: AnchorItem | null): void
  (e: 'item-click', item: AnchorItem): void
  (e: 'update:expanded', value: boolean): void
}>()

const instance = getCurrentInstance()

/* ---------- 手动 items 模式 ---------- */
/** 联动 API 或 props.items 直接写入的手动列表 */
const manualItems = ref<AnchorItemLike[]>([])

function parseItems(raw: unknown): AnchorItemLike[] {
  if (Array.isArray(raw)) return raw.map((i) => ({ title: String((i as any).title ?? ''), level: Number((i as any).level ?? 1) }))
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        return parsed.map((i: any) => ({ title: String(i?.title ?? ''), level: Number(i?.level ?? 1) }))
      }
    } catch (e) {
      console.warn('[WorkDesktop] Anchor items JSON 解析失败:', e)
    }
  }
  return []
}

// props.items 变化 → 更新手动列表
watch(
  () => props.items,
  (val) => {
    manualItems.value = parseItems(val)
  },
  { immediate: true }
)
// 手动模式（props.items 或联动 setItems 注入）
const isManual = computed(() => manualItems.value.length > 0)

/* ---------- 标题扫描（自动模式） ---------- */
interface HeadingNode {
  el: HTMLElement
  level: number
  title: string
}

const containerEl = ref<HTMLElement | null>(null)
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

function isPageContainer(el: HTMLElement): boolean {
  return el === document.body || el === document.documentElement
}

/** 当前可视范围内的第一个标题：滚动跟随 */
function computeActiveIndex(): number {
  if (isManual.value) return activeIndex.value
  const list = headings.value
  if (!list.length) return -1
  const container = containerEl.value || document.body
  const cRect = container.getBoundingClientRect()
  const scrollTop = isPageContainer(container)
    ? window.scrollY || document.documentElement.scrollTop
    : container.scrollTop
  let active = list.length - 1
  for (let i = 0; i < list.length; i++) {
    const hRect = list[i].el.getBoundingClientRect()
    const top = hRect.top - cRect.top + scrollTop
    if (top >= scrollTop - 1) { active = i; break }
  }
  return active
}

/** 列表项：手动模式用 manualItems，自动模式按 maxLevel 过滤标题 */
const listItems = computed<AnchorItem[]>(() => {
  if (isManual.value) return manualItems.value.map((i) => ({ title: i.title, level: i.level }))
  return headings.value
    .filter((h) => h.level <= props.maxLevel)
    .map((h) => ({ title: h.title, level: h.level }))
})

/* ---------- 数据刷新 ---------- */
function refreshHeadings() {
  if (isManual.value) return
  const all = collectHeadings()
  // 标题结构未变（仅非标题节点变动）时不重建列表，避免无意义的全链重算
  if (headingsSignature(all) !== headingsSignature(headings.value)) {
    headings.value = all.filter((h) => h.level <= props.maxLevel)
  }
  const idx = computeActiveIndex()
  if (idx !== activeIndex.value) setActive(idx)
}

let lastSig = ''
function setActive(idx: number) {
  activeIndex.value = idx
}

// 激活项变化 → 抛出 change（watch 驱动，覆盖滚动/手动/refresh 所有入口）
watch(activeIndex, (idx) => {
  const item = idx >= 0 ? listItems.value[idx] : null
  const sig = item ? `${item.level}:${item.title}` : ''
  if (sig === lastSig) return
  lastSig = sig
  emit('change', item)
})

function refresh() {
  refreshHeadings()
}

/* ---------- 事件绑定（滚动跟随 + DOM 变动重扫） ---------- */
let scrollTicking = false
function onScroll() {
  if (scrollTicking || isManual.value) return
  scrollTicking = true
  requestAnimationFrame(() => {
    scrollTicking = false
    setActive(computeActiveIndex())
  })
}

let observer: MutationObserver | null = null
let scrollTarget: HTMLElement | Window | null = null
function bindContainer(el: HTMLElement) {
  unbindContainer()
  containerEl.value = el
  scrollTarget = isPageContainer(el) ? window : el
  scrollTarget.addEventListener('scroll', onScroll, { passive: true })
  if (typeof MutationObserver !== 'undefined') {
    observer = new MutationObserver((records) => {
      // 导航自身的列表渲染位于观察容器内部，忽略全部落在 .wd-anchor 子树内的变动，
      // 避免「渲染改 DOM → 触发重扫 → 重渲染」的自激循环
      const fromContent = records.some((r) => {
        const target = r.target as HTMLElement | null
        return !(target && typeof target.closest === 'function' && target.closest('.wd-anchor'))
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

/* ---------- 点击跳转 ---------- */
function onItemClick(item: AnchorItem, index: number) {
  emit('item-click', item)
  // 手动模式：无对应 DOM 节点，不自动滚动，由调用方处理导航
  if (isManual.value) return
  const node = headings.value[index]
  if (!node) return
  const el = node.el
  const container = containerEl.value || document.body
  if (isPageContainer(container)) {
    const top = el.getBoundingClientRect().top + window.scrollY - props.offset
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
  } else {
    const cTop = el.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop
    container.scrollTo({ top: Math.max(0, cTop - props.offset), behavior: 'smooth' })
  }
}

/* ---------- 展开态（v-model:expanded） ---------- */
/** 本地展开态：默认跟随 props.expanded（收起）；props.expanded 变化时同步；
 *  点击触发按钮时切换本地态并 emit update:expanded，父组件回写后双向对齐 */
const expanded = ref(props.expanded)
watch(
  () => props.expanded,
  (val) => {
    if (expanded.value !== val) expanded.value = val
  }
)
function toggleExpanded() {
  expanded.value = !expanded.value
  emit('update:expanded', expanded.value)
}

/* ---------- 联动注册 ---------- */
let unregister: (() => void) | null = null

/* ---------- 生命周期 ---------- */
onMounted(() => {
  if (!isManual.value) {
    bindContainer(resolveContainer())
    refresh()
  }
  // 注册到联动中心（无论手动/自动模式都可被 notifyAnchorChange 驱动 refresh）
  unregister = registerAnchorInstance({
    filter: props.filter,
    setItems: (list) => {
      manualItems.value = list.map((i) => ({ ...i }))
      // 联动注入后脱离自动扫描模式
      unbindContainer()
    },
    refresh
  })
})

// 容器变化（如 :container="ref" 延迟就绪）→ 重绑并重扫
watch(
  () => props.container,
  () => {
    if (isManual.value) return
    bindContainer(resolveContainer())
    refresh()
  }
)

// 层级变化 → 按新层级重算列表
watch(
  () => props.maxLevel,
  () => {
    refresh()
  }
)

onUnmounted(() => {
  unbindContainer()
  unregister?.()
})

defineExpose({ refresh })
</script>

<style scoped>
.wd-anchor {
  position: fixed;
  top: 50%;
  right: 16px;
  transform: translateY(-50%);
  z-index: 100;
  max-width: 200px;
  padding: 12px 10px;
  background: var(--wd-bg-color, #fff);
  border: 1px solid var(--wd-border-color-light, #e4e7ed);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  font-size: 13px;
}
.wd-anchor[data-position='absolute'] {
  position: absolute;
  top: 16px;
  right: 0;
  transform: none;
}

/* ---------- placement 位置 ---------- */
.wd-anchor[data-placement='right'] { right: 16px; left: auto; top: 50%; transform: translateY(-50%); }
.wd-anchor[data-placement='left'] { left: 16px; right: auto; top: 50%; transform: translateY(-50%); }
.wd-anchor[data-placement='top'] { top: 16px; bottom: auto; left: 50%; right: auto; transform: translateX(-50%); }
.wd-anchor[data-placement='bottom'] { bottom: 16px; top: auto; left: 50%; right: auto; transform: translateX(-50%); }
.wd-anchor[data-position='absolute'][data-placement='right'] { right: 0; left: auto; top: 16px; transform: none; }
.wd-anchor[data-position='absolute'][data-placement='left'] { left: 0; right: auto; top: 16px; transform: none; }
.wd-anchor[data-position='absolute'][data-placement='top'] { top: 0; bottom: auto; left: 50%; transform: translateX(-50%); }
.wd-anchor[data-position='absolute'][data-placement='bottom'] { bottom: 0; top: auto; left: 50%; transform: translateX(-50%); }

.wd-anchor__list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.wd-anchor__item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 6px;
  margin-left: 0;
  border-left: 2px solid transparent;
  color: var(--wd-text-color-secondary, #909399);
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.2s ease, background-color 0.2s ease;
}
/* 层级缩进：h1 不缩进，h2 缩进一级，h3/h4 缩进两级 */
.wd-anchor__item[data-level='2'] { margin-left: 10px; }
.wd-anchor__item[data-level='3'],
.wd-anchor__item[data-level='4'] { margin-left: 20px; }
.wd-anchor__item:hover {
  color: var(--wd-color-primary, #409eff);
  background: var(--wd-color-primary-light-9, #ecf5ff);
}
.wd-anchor__item.is-active {
  color: var(--wd-color-primary, #409eff);
  font-weight: 600;
  border-left-color: var(--wd-color-primary, #409eff);
}
.wd-anchor__dot {
  flex: none;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.4;
}
.wd-anchor__item.is-active .wd-anchor__dot {
  opacity: 1;
}
.wd-anchor__text {
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ---------- dot 圆点模式：默认只显示圆点，悬停显示标题文字（tooltip） ---------- */
.wd-anchor[data-dot='true'] {
  padding: 8px 6px;
  max-width: none;
}
.wd-anchor[data-dot='true'] .wd-anchor__item {
  padding: 3px 4px;
  position: relative;
  /* 覆盖默认的 overflow: hidden（原为文字省略号），否则会把 ::after tooltip 裁剪掉 */
  overflow: visible;
}
.wd-anchor[data-dot='true'] .wd-anchor__dot {
  width: 8px;
  height: 8px;
  opacity: 0.5;
}
.wd-anchor[data-dot='true'] .wd-anchor__item.is-active .wd-anchor__dot {
  opacity: 1;
  box-shadow: 0 0 0 2px var(--wd-color-primary-light-9, #ecf5ff);
}
/* dot 模式悬停 tooltip：纯 CSS ::after + attr(data-title)；
   永远朝向内容区展开（anchor 贴右时 tooltip 向左，贴左时向右），避免超出视口 */
.wd-anchor[data-dot='true'] .wd-anchor__item::after {
  content: attr(data-title);
  position: absolute;
  /* 默认 anchor 在右侧 → tooltip 向左展开 */
  right: calc(100% + 8px);
  top: 50%;
  transform: translateY(-50%) translateX(4px);
  padding: 4px 10px;
  background: var(--wd-bg-color, #fff);
  border: 1px solid var(--wd-border-color-light, #e4e7ed);
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  color: var(--wd-text-color-primary, #303133);
  font-size: 12px;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.18s ease, transform 0.18s ease;
  z-index: 10;
}
.wd-anchor[data-dot='true'] .wd-anchor__item:hover::after {
  opacity: 1;
  transform: translateY(-50%) translateX(0);
}
/* anchor 在左侧（placement=left）→ tooltip 向右展开 */
.wd-anchor[data-dot='true'][data-placement='left'] .wd-anchor__item::after {
  right: auto;
  left: calc(100% + 8px);
  transform: translateY(-50%) translateX(-4px);
}
.wd-anchor[data-dot='true'][data-placement='left'] .wd-anchor__item:hover::after {
  transform: translateY(-50%) translateX(0);
}

/* ---------- collapsible 收缩触发按钮 ---------- */
.wd-anchor__toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: var(--wd-color-primary-light-9, #ecf5ff);
  cursor: pointer;
}
/* 多点列表图标：三条短横线（每端小圆点），示意"可展开的目录" */
.wd-anchor__toggle-icon {
  display: flex;
  flex-direction: column;
  gap: 3px;
  align-items: center;
}
.wd-anchor__toggle-icon i {
  width: 12px;
  height: 2px;
  border-radius: 1px;
  background: var(--wd-color-primary, #409eff);
  position: relative;
}
.wd-anchor__toggle-icon i::before,
.wd-anchor__toggle-icon i::after {
  content: "";
  position: absolute;
  top: 50%;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--wd-color-primary, #409eff);
  transform: translateY(-50%);
}
.wd-anchor__toggle-icon i::before { left: -3px; }
.wd-anchor__toggle-icon i::after { right: -3px; }
.wd-anchor__toggle:hover {
  background: var(--wd-color-primary-light-7, #d9ecff);
}

/* 文字触发按钮（toggleText 传入时覆盖默认图标） */
.wd-anchor__toggle-text {
  font-size: 12px;
  line-height: 1.4;
  color: var(--wd-color-primary, #409eff);
  white-space: nowrap;
  text-align: center;
}
.wd-anchor__toggle-text[data-direction='vertical'] {
  writing-mode: vertical-rl;
  letter-spacing: 2px;
}
</style>
