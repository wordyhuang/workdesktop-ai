<template>
  <!-- WorkDesktop 品牌标：几何 V 形（双斜条）+ 炭黑圆角底座，源自产品 Logo 的矢量化重绘 -->
  <svg class="brand-mark" viewBox="0 0 48 48" role="img" aria-label="WorkDesktop">
    <path :fill="blue" d="M6.6 8.2h10.9c.5 0 .9.3 1 .8l6.1 21.3-8.9 3.1c-.5.2-1 0-1.2-.5L6 9.4c-.2-.6.1-1.2.6-1.2z" />
    <path :fill="blue" d="M41.4 8.2H30.5c-.5 0-.9.3-1 .8l-6.1 21.3 8.9 3.1c.5.2 1 0 1.2-.5L42 9.4c.2-.6-.1-1.2-.6-1.2z" />
    <rect x="7" y="35" width="34" height="6.4" rx="3.2" :fill="ink" />
  </svg>
</template>

<script setup lang="ts">
/** 品牌双色：V 形取主色令牌（跟随换肤），底座取 Logo 炭黑（恒定，保持识别度） */
const blue = 'var(--wd-color-primary, #1677ff)'
const ink = '#2b2e33'
</script>

<style scoped>
.brand-mark {
  /* 覆盖 el-icon 内部 svg 的 1em 约束，品牌标需要更大的视觉占位 */
  width: 1.75em;
  height: 1.75em;
  flex: none;
  display: block;
}
</style>
