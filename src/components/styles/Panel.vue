<template>
  <div class="wd-panel" :class="`wd-panel--shadow-${shadow}`">
    <div
      v-if="title || $slots.title"
      class="wd-panel__header"
      :class="{ 'is-collapsible': collapsible }"
      role="heading"
      :aria-expanded="collapsible ? openedState : undefined"
      @click="onHeaderClick"
      @keydown.enter.prevent="onHeaderClick"
      @keydown.space.prevent="onHeaderClick"
    >
      <div class="wd-panel__header-main">
        <slot name="title">
          <span class="wd-panel__title">{{ title }}</span>
          <span v-if="description" class="wd-panel__description">{{ description }}</span>
        </slot>
      </div>
      <div v-if="$slots.extra || collapsible" class="wd-panel__header-extra" @click.stop>
        <slot name="extra" />
        <el-icon
          v-if="collapsible"
          class="wd-panel__collapse-icon"
          :class="{ 'is-collapsed': !openedState }"
          role="button"
          :aria-label="openedState ? '收起' : '展开'"
          tabindex="0"
          @click="toggle"
          @keydown.enter.prevent="toggle"
          @keydown.space.prevent="toggle"
        >
          <ArrowDown />
        </el-icon>
      </div>
    </div>
    <div class="wd-panel__content" :class="{ 'is-collapsed': collapsible && !openedState }">
      <div class="wd-panel__content-inner">
        <div class="wd-panel__body">
          <slot />
        </div>
        <div v-if="$slots.footer" class="wd-panel__footer">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, type PropType } from 'vue'
import { ArrowDown } from '@element-plus/icons-vue'

defineOptions({ name: 'WdPanel' })

const props = defineProps({
  /** 面板标题 */
  title: { type: String, default: '' },
  /** 标题旁描述 */
  description: { type: String, default: '' },
  /** 是否可折叠（折叠时隐藏主体与底部） */
  collapsible: { type: Boolean, default: false },
  /** 展开状态（配合 collapsible 使用，支持 v-model:opened） */
  opened: { type: Boolean, default: true },
  /** 阴影策略：always=常驻阴影 / hover=悬停时显示 / never=无阴影 */
  shadow: {
    type: String as PropType<'always' | 'hover' | 'never'>,
    default: 'hover'
  }
})

const emit = defineEmits<{
  (e: 'update:opened', value: boolean): void
  (e: 'change', value: boolean): void
}>()

const innerOpened = ref(props.opened)
// 受控（v-model:opened）时跟随外部变化，非受控时使用内部状态
watch(
  () => props.opened,
  (v) => {
    innerOpened.value = v
  }
)
const openedState = computed(() => innerOpened.value)

function toggle() {
  if (!props.collapsible) return
  const next = !openedState.value
  innerOpened.value = next
  emit('update:opened', next)
  emit('change', next)
}

function onHeaderClick() {
  if (props.collapsible) toggle()
}
</script>

<style scoped>
.wd-panel {
  width: 100%;
  margin-bottom: var(--wd-spacing-base, 12px);
  background: var(--wd-bg-color, #fff);
  border: 1px solid var(--wd-border-color-light, #e4e7ed);
  border-radius: var(--wd-radius-base, 4px);
  box-sizing: border-box;
  overflow: hidden;
  transition: box-shadow 0.25s ease, border-color 0.25s ease, transform 0.25s ease;
}

/* 阴影跟随可覆盖变量：在任意祖先/全局定义
   --wd-panel-shadow-sm / --wd-panel-shadow-md 即可换肤 */
.wd-panel--shadow-always {
  box-shadow: var(
    --wd-panel-shadow-sm,
    0 1px 2px rgba(16, 24, 40, 0.04),
    0 1px 6px -1px rgba(16, 24, 40, 0.06)
  );
}
.wd-panel--shadow-hover:hover {
  border-color: var(--wd-border-color, #dcdfe6);
  box-shadow: var(
    --wd-panel-shadow-md,
    0 4px 8px -2px rgba(16, 24, 40, 0.08),
    0 12px 24px -4px rgba(16, 24, 40, 0.1)
  );
  transform: translateY(-1px);
}

.wd-panel__header {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px 12px 18px;
  border-bottom: 1px solid var(--wd-border-color-light, #e4e7ed);
  transition: background-color 0.2s ease;
}
/* 品牌色标识条 */
.wd-panel__header::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--wd-color-primary, #409eff);
  border-radius: 0 var(--wd-radius-small, 2px) var(--wd-radius-small, 2px) 0;
}
.wd-panel__header.is-collapsible {
  cursor: pointer;
}
.wd-panel__header.is-collapsible:hover {
  background: var(--wd-bg-color-page, #f5f7fa);
}
.wd-panel__header-main {
  display: flex;
  align-items: baseline;
  gap: 8px;
  min-width: 0;
  flex: 1;
}
.wd-panel__title {
  font-size: var(--wd-font-size-base, 14px);
  font-weight: 600;
  line-height: 22px;
  color: var(--wd-text-color-primary, #303133);
  white-space: nowrap;
}
.wd-panel__description {
  font-size: var(--wd-font-size-small, 12px);
  color: var(--wd-text-color-secondary, #909399);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.wd-panel__header-extra {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}
.wd-panel__collapse-icon {
  cursor: pointer;
  color: var(--wd-text-color-secondary, #909399);
  transition: transform 0.25s ease, color 0.2s ease;
}
.wd-panel__collapse-icon:hover {
  color: var(--wd-color-primary, #409eff);
}
.wd-panel__collapse-icon.is-collapsed {
  transform: rotate(-90deg);
}

/* 折叠动画：grid 1fr -> 0fr，无需测量高度 */
.wd-panel__content {
  display: grid;
  grid-template-rows: 1fr;
  transition: grid-template-rows 0.28s ease;
}
.wd-panel__content.is-collapsed {
  grid-template-rows: 0fr;
}
.wd-panel__content-inner {
  overflow: hidden;
  min-height: 0;
}
.wd-panel__body {
  padding: 16px;
}
.wd-panel__footer {
  padding: 10px 16px;
  border-top: 1px solid var(--wd-border-color-light, #e4e7ed);
  background: var(--wd-bg-color-page, #f5f7fa);
}
</style>
