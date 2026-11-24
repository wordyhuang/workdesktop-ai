<template>
  <!-- word：悬停图标模式 -->
  <el-tooltip v-if="type === 'word'" :content="tips" effect="dark" placement="top">
    <el-icon class="wd-tips__icon" :style="{ color: resolvedColor }">
      <component :is="iconComp" />
    </el-icon>
  </el-tooltip>

  <!-- box：行内文字模式 -->
  <span
    v-else
    class="wd-tips__box"
    :class="{ 'wd-tips__box--filled': hasBg, 'wd-tips__box--auto': isAuto }"
    :style="boxStyle"
  >
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
  /** 图标/文字颜色（缺省：bgType=auto 时按 icon 语义取色，否则信息灰 #909399） */
  color: { type: String, default: '' },
  /**
   * box 模式背景：none=不带背景（默认）；primary=主题色浅底（文字取主题色）；
   * 也可传任意 CSS 颜色值（如 '#FEFEFE'、'rgba(...)'）
   */
  bg: { type: String, default: 'none' },
  /**
   * 背景类型：none=不带背景（默认）；auto=按 icon 语义自动配浅底与文字色
   * （InfoFilled→信息灰 / WarningFilled→警告橙 / QuestionFilled→主题色），
   * 显式传 color 时以其为准；优先级高于 bg
   */
  bgType: { type: String as PropType<'none' | 'auto'>, default: 'none' }
})

const DEFAULT_COLOR = '#909399'

const iconMap: Record<string, any> = { InfoFilled, WarningFilled, QuestionFilled }

const iconComp = computed(() => iconMap[props.icon] || InfoFilled)

/** auto 模式：icon 语义 → 主题色（文字取实色、背景按 12% 混出浅底，与 Tag light effect 一致） */
const AUTO_ICON_THEME: Record<string, { color: string }> = {
  InfoFilled: { color: 'var(--wd-color-info, #909399)' },
  WarningFilled: { color: 'var(--wd-color-warning, #e6a23c)' },
  QuestionFilled: { color: 'var(--wd-color-primary, #1677ff)' }
}

const isAuto = computed(() => props.bgType === 'auto')

const autoTheme = computed(() => AUTO_ICON_THEME[props.icon] || AUTO_ICON_THEME.InfoFilled)

const resolvedColor = computed(() =>
  props.color || (isAuto.value ? autoTheme.value.color : DEFAULT_COLOR)
)

const hasBg = computed(() => isAuto.value || (!!props.bg && props.bg !== 'none'))

const boxStyle = computed(() => {
  if (isAuto.value) {
    const base = props.color || autoTheme.value.color
    return {
      color: resolvedColor.value,
      // 自定义属性按原样保留，避免内联 background 对 color-mix 的兼容差异
      '--wd-tips-auto-bg': `color-mix(in srgb, ${base} 12%, transparent)`
    }
  }
  if (props.bg === 'primary') {
    return {
      color: 'var(--wd-color-primary)',
      backgroundColor: 'color-mix(in srgb, var(--wd-color-primary) 10%, transparent)'
    }
  }
  if (hasBg.value) {
    return { color: resolvedColor.value, backgroundColor: props.bg }
  }
  return { color: resolvedColor.value }
})
</script>

<style scoped>
.wd-tips__icon {
  cursor: pointer;
  vertical-align: middle;
  /* 左右 4px 扩大悬停/点击热区，图标与相邻文字不挤在一起 */
  padding: 0 4px;
  box-sizing: content-box;
}
.wd-tips__box {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  /* 上下 4px 保证行内文字提示不贴边，左右 8px 留出呼吸感 */
  padding: 4px 8px;
  font-size: var(--wd-font-size-sm, 12px);
  line-height: 1.5;
  box-sizing: border-box;
}
.wd-tips__box--filled {
  padding: 6px 12px;
  border-radius: var(--wd-radius-base, 6px);
}
.wd-tips__box--auto {
  background-color: var(--wd-tips-auto-bg);
}
.wd-tips__box-icon {
  flex-shrink: 0;
}
</style>
