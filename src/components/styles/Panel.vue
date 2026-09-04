<template>
  <div class="wd-panel">
    <div v-if="title || $slots.title" class="wd-panel__header">
      <slot name="title">
        <span class="wd-panel__title">{{ title }}</span>
        <span v-if="description" class="wd-panel__description">{{ description }}</span>
      </slot>
    </div>
    <div class="wd-panel__body">
      <slot />
    </div>
    <div v-if="$slots.footer" class="wd-panel__footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'WdPanel' })

defineProps({
  /** 面板标题 */
  title: { type: String, default: '' },
  /** 标题旁描述 */
  description: { type: String, default: '' }
})
</script>

<style scoped>
.wd-panel {
  width: 100%;
  background: var(--wd-bg-color, #fff);
  border: 1px solid var(--wd-border-color-light, #e4e7ed);
  border-radius: var(--wd-radius-base, 4px);
  margin-bottom: var(--wd-spacing-base, 12px);
  box-sizing: border-box;
}
.wd-panel__header {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--wd-border-color-light, #e4e7ed);
}
.wd-panel__title {
  font-size: var(--wd-font-size-md, 15px);
  font-weight: 600;
  color: var(--wd-text-color-primary, #303133);
}
.wd-panel__description {
  font-size: var(--wd-font-size-sm, 12px);
  color: var(--wd-text-color-secondary, #909399);
}
.wd-panel__body {
  padding: 16px;
}
.wd-panel__footer {
  padding: 12px 16px;
  border-top: 1px solid var(--wd-border-color-light, #e4e7ed);
}
</style>
