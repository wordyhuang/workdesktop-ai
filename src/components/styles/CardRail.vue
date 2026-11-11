<template>
  <div
    class="wd-card-rail"
    :class="{ 'has-nav': hasDefaultNav }"
    :style="{ '--wd-rail-per': normalizedPerPage }"
  >
    <div class="wd-card-rail__viewport">
      <ul class="wd-card-rail__track" :style="{ '--wd-rail-page': innerPage }">
        <li
          v-for="(item, index) in items"
          :key="itemKeyOf(item, index)"
          class="wd-card-rail__item"
        >
          <slot :item="item" :index="index" />
        </li>
      </ul>
    </div>
    <slot
      v-if="$slots.nav"
      name="nav"
      :page="innerPage"
      :max-page="maxPage"
      :prev="prev"
      :next="next"
      :can-prev="innerPage > 0 || canLoop"
      :can-next="innerPage < maxPage || canLoop"
    />
    <template v-else-if="showNav">
      <button
        class="wd-card-rail__nav is-prev"
        type="button"
        aria-label="上一页"
        :disabled="innerPage <= 0 && !canLoop"
        @click="prev"
      >
        <el-icon :size="14"><ArrowLeft /></el-icon>
      </button>
      <button
        class="wd-card-rail__nav is-next"
        type="button"
        aria-label="下一页"
        :disabled="innerPage >= maxPage && !canLoop"
        @click="next"
      >
        <el-icon :size="14"><ArrowRight /></el-icon>
      </button>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useSlots, watch } from 'vue'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'

// 起始支持版本：待发布（尚未随 npm 包发布）
defineOptions({ name: 'WdCardRail' })

const props = withDefaults(
  defineProps<{
    /** 数据项数组，逐项交给默认作用域插槽渲染 */
    items?: Record<string, any>[]
    /** 每页显示条数 */
    perPage?: number
    /** 当前页（支持 v-model:page） */
    page?: number
    /** 是否显示左右翻页按钮 */
    showNav?: boolean
    /** 从数据项中取唯一键的字段名，未提供时用索引 */
    itemKey?: string
    /** 是否循环滑动：首屏上一页跳末页、末页下一页回首屏（仅一页时不循环） */
    loop?: boolean
  }>(),
  { items: () => [], perPage: 3, page: 0, showNav: true, itemKey: '', loop: false }
)

const emit = defineEmits<{
  (e: 'update:page', page: number): void
  (e: 'change', page: number): void
}>()

const normalizedPerPage = computed(() => {
  const value = Math.floor(Number(props.perPage))
  return Number.isFinite(value) && value > 0 ? value : 1
})

const maxPage = computed(() =>
  Math.max(0, Math.ceil(props.items.length / normalizedPerPage.value) - 1)
)

/** 可循环：开启 loop 且存在下一页空间（只有一页时不循环，双按钮仍禁用） */
const canLoop = computed(() => props.loop && maxPage.value > 0)

const slots = useSlots()

/** 是否渲染默认翻页按钮：传入 #nav 插槽后由调用方完全接管，不再预留按钮槽位 */
const hasDefaultNav = computed(() => props.showNav && !slots.nav)

const clamp = (page: number) => {
  const value = Math.floor(Number(page))
  const safe = Number.isFinite(value) ? value : 0
  return Math.min(Math.max(0, safe), maxPage.value)
}

const innerPage = ref(clamp(props.page))

watch(
  () => props.page,
  (value) => {
    innerPage.value = clamp(value)
  }
)

watch(maxPage, (value) => {
  if (innerPage.value > value) goTo(value)
})

function goTo(page: number) {
  const target = clamp(page)
  if (target === innerPage.value) return
  innerPage.value = target
  emit('update:page', target)
  emit('change', target)
}

function prev() {
  if (innerPage.value <= 0 && canLoop.value) return goTo(maxPage.value)
  goTo(innerPage.value - 1)
}

function next() {
  if (innerPage.value >= maxPage.value && canLoop.value) return goTo(0)
  goTo(innerPage.value + 1)
}

function itemKeyOf(item: Record<string, any>, index: number) {
  if (!props.itemKey) return index
  const key = item?.[props.itemKey]
  return key === undefined || key === null ? index : key
}

defineExpose({ prev, next, goTo })
</script>

<style scoped>
.wd-card-rail {
  position: relative;
  box-sizing: border-box;
  width: 100%;
}

/* 默认按钮渲染时，左右各预留一条槽位放按钮，避免压住卡片内容 */
.wd-card-rail.has-nav {
  padding-inline: var(--wd-card-rail-nav-gutter, 34px);
}

.wd-card-rail__viewport {
  overflow: hidden;
}

.wd-card-rail__track {
  display: flex;
  gap: var(--wd-card-rail-gap, 10px);
  margin: 0;
  padding: 0;
  list-style: none;
  transform: translateX(calc(var(--wd-rail-page, 0) * (-100% - var(--wd-card-rail-gap, 10px))));
  transition: transform 0.45s cubic-bezier(0.4, 0, 0.2, 1);
}

.wd-card-rail__item {
  box-sizing: border-box;
  min-width: 0;
  flex: 0 0
    calc(
      (100% - (var(--wd-rail-per, 3) - 1) * var(--wd-card-rail-gap, 10px)) /
        var(--wd-rail-per, 3)
    );
  display: flex;
  flex-direction: column;
  gap: var(--wd-card-rail-item-gap, 8px);
  padding: var(--wd-card-rail-item-padding, 10px 12px);
  border: 1px solid
    var(--wd-card-rail-item-border-color, var(--el-border-color-extra-light));
  border-radius: var(--wd-card-rail-item-radius, 8px);
  background: var(--wd-card-rail-item-bg, var(--el-bg-color));
  color: var(--el-text-color-primary);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.wd-card-rail__nav {
  position: absolute;
  top: 50%;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--wd-card-rail-nav-size, 26px);
  height: var(--wd-card-rail-nav-size, 26px);
  padding: 0;
  border: 1px solid var(--wd-card-rail-nav-border-color, var(--el-border-color-light));
  border-radius: 50%;
  background: var(--wd-card-rail-nav-bg, var(--el-bg-color));
  color: var(--wd-card-rail-nav-color, var(--el-text-color-regular));
  cursor: pointer;
  transform: translateY(-50%);
  transition: color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.wd-card-rail__nav.is-prev {
  left: calc(
    (var(--wd-card-rail-nav-gutter, 34px) - var(--wd-card-rail-nav-size, 26px)) / 2 +
      var(--wd-card-rail-nav-offset, 0px)
  );
}

.wd-card-rail__nav.is-next {
  right: calc(
    (var(--wd-card-rail-nav-gutter, 34px) - var(--wd-card-rail-nav-size, 26px)) / 2 +
      var(--wd-card-rail-nav-offset, 0px)
  );
}

.wd-card-rail__nav:hover:not(:disabled) {
  color: var(--el-color-primary);
  border-color: var(--el-color-primary);
  box-shadow: var(--wd-card-rail-nav-shadow, var(--el-box-shadow-light));
}

.wd-card-rail__nav:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.wd-card-rail__nav .el-icon {
  display: inline-flex;
}
</style>
