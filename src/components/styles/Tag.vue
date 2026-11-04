<template>
  <el-tag
    class="wd-tag"
    :class="{ 'is-icon-only': isIconOnly }"
    :style="paletteStyle"
    :effect="effect"
    :closable="closable"
    :disable-transitions="disableTransitions"
    :hit="hit"
    :round="round"
    :size="size"
    v-bind="$attrs"
  >
    <!-- icon + #default：标签内只显示 icon，#default 内容转为 tooltip 悬停展示 -->
    <template v-if="hasIcon">
      <el-tooltip v-if="hasDefault" :content="slotText" effect="dark" placement="top">
        <span class="wd-tag__icon" :style="{ color: 'var(--el-tag-text-color)' }">
          <i v-if="isFontIcon" :class="icon" />
          <el-icon v-else><component :is="iconComp" /></el-icon>
        </span>
      </el-tooltip>
      <span v-else class="wd-tag__icon" :style="{ color: 'var(--el-tag-text-color)' }">
        <i v-if="isFontIcon" :class="icon" />
        <el-icon v-else><component :is="iconComp" /></el-icon>
      </span>
    </template>
    <slot v-else />
  </el-tag>
</template>

<script setup lang="ts">
import { computed, useSlots, type PropType, type Component } from 'vue'
import { TAG_PALETTE, matchAutoColor, type WdTagColor, type WdTagType } from './tag-palette'
import { isIconFontClass, resolveStationIcon } from '../../lib/core/station-icon'

defineOptions({ name: 'WdTag', inheritAttrs: false })

const props = defineProps({
  /** 颜色类型：primary/success/warning/danger/info/purple/cyan/orange/pink/geekblue/magenta/lime 共 12 种预设色；auto=按展示内容自动匹配（语义关键词命中 → 稳定 hash 兜底） */
  type: {
    type: String as PropType<WdTagType>,
    default: 'primary'
  },
  /** 自定义颜色（任意 CSS 颜色值），优先级高于 type 色板 */
  color: { type: String, default: '' },
  /** 标签风格（透传 el-tag）：light=浅色 / plain=朴素 / dark=深色 */
  effect: {
    type: String as PropType<'light' | 'plain' | 'dark'>,
    default: 'light'
  },
  /** 是否可关闭（透传 el-tag） */
  closable: { type: Boolean, default: false },
  /** 是否禁用渐变动画（透传 el-tag） */
  disableTransitions: { type: Boolean, default: false },
  /** 是否边框描边态（透传 el-tag） */
  hit: { type: Boolean, default: false },
  /** 是否圆角胶囊形（透传 el-tag） */
  round: { type: Boolean, default: false },
  /** 尺寸（透传 el-tag） */
  size: {
    type: String as PropType<'large' | 'default' | 'small'>,
    default: 'default'
  },
  /** 标签图标（@element-plus/icons-vue 名称字符串 / 图标字体 class（如 'fa-solid fa-user'）/ 组件对象）；设置后标签默认只显示该 icon，若同时提供 #default 插槽则插槽内容转为 tooltip 悬停展示 */
  icon: {
    type: [String, Object] as PropType<string | Component>,
    default: ''
  }
})

const slots = useSlots()

/* ---------- 展示内容提取 ---------- */
const hasDefault = computed(() => !!slots.default)
const hasIcon = computed(() => !!props.icon)
const isIconOnly = computed(() => hasIcon.value && !hasDefault.value)
const isFontIcon = computed(() => typeof props.icon === 'string' && isIconFontClass(props.icon))
const iconComp = computed(() =>
  typeof props.icon === 'string' && !isFontIcon.value ? resolveStationIcon(props.icon) : props.icon
)

/** 提取 vnode 树中的纯文本（tooltip 内容 / auto 匹配源） */
function vnodeText(nodes: unknown): string {
  if (!nodes) return ''
  if (typeof nodes === 'string') return nodes
  if (Array.isArray(nodes)) return nodes.map(vnodeText).join('')
  if (typeof nodes === 'object' && typeof (nodes as any).children !== 'undefined') {
    return vnodeText((nodes as any).children)
  }
  return ''
}

const slotText = computed(() => vnodeText(slots.default?.()).trim())

/* ---------- auto 匹配源：icon + tips 时按 tips 文本匹配；仅 icon 时按 icon 名匹配 ---------- */
const autoSource = computed(() => {
  if (hasIcon.value) {
    return hasDefault.value ? slotText.value : typeof props.icon === 'string' ? props.icon : ''
  }
  return slotText.value
})

/** 实际生效的色板颜色（auto 解析 / 未知值回退 primary） */
const resolvedColor = computed<WdTagColor>(() => {
  if (props.type === 'auto') return matchAutoColor(autoSource.value)
  return props.type in TAG_PALETTE ? (props.type as WdTagColor) : 'primary'
})

/* ---------- 色板派生：按 effect 把基准色注入 el-tag 的样式变量 ---------- */
const paletteStyle = computed(() => {
  const base = props.color || TAG_PALETTE[resolvedColor.value]
  if (props.effect === 'dark') {
    return {
      '--el-tag-bg-color': base,
      '--el-tag-border-color': base,
      '--el-tag-text-color': '#fff'
    }
  }
  if (props.effect === 'plain') {
    return {
      '--el-tag-bg-color': 'transparent',
      '--el-tag-border-color': base,
      '--el-tag-text-color': base
    }
  }
  return {
    '--el-tag-bg-color': `color-mix(in srgb, ${base} 12%, transparent)`,
    '--el-tag-border-color': `color-mix(in srgb, ${base} 25%, transparent)`,
    '--el-tag-text-color': base
  }
})
</script>

<style scoped>
/* icon-only：只显示一个 icon，收敛内边距为近方形 */
.el-tag.wd-tag.is-icon-only {
  padding: 0 5px;
}

/* icon 颜色跟随标签文字色（auto 模式下随之自动联动） */
.wd-tag__icon {
  display: inline-flex;
  align-items: center;
  vertical-align: middle;
  line-height: 1;
}

.wd-tag__icon .el-icon {
  display: inline-flex;
  vertical-align: middle;
}
</style>
