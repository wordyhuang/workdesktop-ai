<template>
  <header class="page-header">
    <span class="page-header__bar" />
    <div class="page-header__body">
      <div v-if="eyebrow" class="page-header__eyebrow">
        <el-icon v-if="iconComp"><component :is="iconComp" /></el-icon>
        <span>{{ eyebrow }}</span>
      </div>
      <h1 class="page-header__title">{{ title }}</h1>
      <p v-if="desc || $slots.default" class="page-header__desc">
        <slot>{{ desc }}</slot>
      </p>
      <div v-if="$slots.extra" class="page-header__extra">
        <slot name="extra" />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import * as Icons from '@element-plus/icons-vue'

const props = defineProps<{
  eyebrow?: string
  title: string
  desc?: string
  /** Element Plus 图标组件名，如 Promotion / Connection / Brush / MagicStick */
  icon?: string
}>()

const iconComp = computed(() => (props.icon ? (Icons as Record<string, any>)[props.icon] : null))
</script>

<style scoped>
.page-header {
  display: flex;
  gap: 16px;
  padding: 20px 24px;
  border: 1px solid var(--wd-border-color-light, #ebeef5);
  border-radius: 14px;
  background:
    radial-gradient(120% 140% at 0% 0%, var(--el-color-primary-light-9, #ecf5ff) 0%, var(--wd-bg-color, #fff) 58%),
    var(--wd-bg-color, #fff);
  box-shadow: 0 4px 18px rgba(13, 18, 30, 0.05);
  margin-bottom: 18px;
}
.page-header__bar {
  flex: 0 0 5px;
  border-radius: 5px;
  background: linear-gradient(180deg, var(--wd-color-primary, #409eff), var(--el-color-primary-light-3, #79bbff));
}
.page-header__body {
  min-width: 0;
}
.page-header__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  letter-spacing: 2px;
  font-weight: 700;
  color: var(--wd-color-primary, #409eff);
}
.page-header__title {
  margin: 6px 0 4px;
  font-size: 26px;
  font-weight: 750;
  letter-spacing: 0.3px;
  color: var(--wd-text-color-primary, #303133);
}
.page-header__desc {
  margin: 0;
  font-size: 14px;
  line-height: 1.7;
  color: var(--wd-text-color-regular, #606266);
  max-width: 820px;
}
.page-header__desc :deep(code) {
  padding: 1px 6px;
  background: var(--wd-bg-color-page, #f4f4f5);
  border: 1px solid var(--wd-border-color-light, #e9ecf1);
  border-radius: 5px;
  color: var(--wd-color-primary, #409eff);
  font-family: 'SFMono-Regular', Consolas, monospace;
  font-size: 12.5px;
}
.page-header__extra {
  margin-top: 14px;
}
</style>
