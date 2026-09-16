<template>
  <div class="unpack-note">
    <p class="unpack-note__title">
      <el-icon class="unpack-note__icon"><InfoFilled /></el-icon>
      {{ title }}
    </p>
    <div class="unpack-note__body">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { InfoFilled } from '@element-plus/icons-vue'

withDefaults(defineProps<{ title?: string }>(), { title: 'API 数据解包说明' })
</script>

<style scoped>
.unpack-note {
  position: relative;
  margin-bottom: 14px;
  padding: 12px 16px;
  background: var(--el-color-primary-light-9, #ecf5ff);
  border: 1px solid var(--el-color-primary-light-7, #d9ecff);
  border-left: 4px solid var(--wd-color-primary, #409eff);
  border-radius: 10px;
  font-size: 13px;
  line-height: 1.75;
  color: var(--wd-text-color-regular, #606266);
}
.unpack-note__title {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 0 4px;
  font-size: 13.5px;
  font-weight: 650;
  color: var(--wd-color-primary, #409eff);
}
.unpack-note__icon {
  font-size: 15px;
}
.unpack-note__body :deep(p) {
  margin: 5px 0;
}
.unpack-note__body :deep(ul) {
  margin: 5px 0;
  padding-left: 20px;
}
.unpack-note__body :deep(li) {
  margin: 2px 0;
}
.unpack-note__body :deep(code) {
  padding: 1px 6px;
  background: rgba(64, 158, 255, 0.12);
  border: 1px solid rgba(64, 158, 255, 0.18);
  border-radius: 5px;
  color: var(--el-color-primary-dark-2, #337ecc);
  font-family: 'SFMono-Regular', Consolas, monospace;
  font-size: 12px;
}
</style>
