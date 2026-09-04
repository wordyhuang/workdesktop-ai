<template>
  <!-- word：悬停图标模式 -->
  <el-tooltip v-if="type === 'word'" :content="tips" effect="dark" placement="top">
    <el-icon class="wd-tips__icon" :style="{ color: color }">
      <component :is="iconComp" />
    </el-icon>
  </el-tooltip>

  <!-- box：行内文字模式 -->
  <span v-else class="wd-tips__box" :style="{ color: color }">
    <el-icon v-if="iconComp" class="wd-tips__box-icon">
      <component :is="iconComp" />
    </el-icon>
    <slot>{{ tips }}</slot>
  </span>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue'
import { InfoFilled, WarningFilled, QuestionFilled } from '@element-plus/icons-vue'

defineOptions({ name: 'WdTips' })

const props = defineProps({
  /** 提示内容 */
  tips: { type: String, default: '' },
  /** word=悬停图标模式 / box=行内文字模式 */
  type: { type: String as PropType<'word' | 'box'>, default: 'word' },
  /** 图标组件名（InfoFilled/WarningFilled/QuestionFilled） */
  icon: { type: String, default: 'InfoFilled' },
  /** 图标/文字颜色 */
  color: { type: String, default: '#909399' }
})

const iconMap: Record<string, any> = { InfoFilled, WarningFilled, QuestionFilled }

const iconComp = computed(() => iconMap[props.icon] || InfoFilled)
</script>

<style scoped>
.wd-tips__icon {
  cursor: pointer;
  vertical-align: middle;
}
.wd-tips__box {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: var(--wd-font-size-sm, 12px);
}
.wd-tips__box-icon {
  flex-shrink: 0;
}
</style>
