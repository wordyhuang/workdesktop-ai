<template>
  <div class="wd-panel"
    :class="[`wd-panel--shadow-${shadow}`, { 'wd-panel--no-border': !border, 'wd-panel--card': mode === 'card' }]">
    <div v-if="title || $slots.title" class="wd-panel__header"
      :class="{ 'is-collapsible': collapsible, 'is-icon': !!icon, 'is-short-bar': titleBar === 'short' }" role="heading"
      :aria-expanded="collapsible ? openedState : undefined" @click="onHeaderClick"
      @keydown.enter.prevent="onHeaderClick" @keydown.space.prevent="onHeaderClick">
      <div class="wd-panel__header-main"
        :class="{ 'is-desc-inline': mode === 'card' && descriptionAlign === 'right' }">
        <el-icon v-if="isIconFontClass(icon)" class="wd-panel__title-icon"><i :class="icon" /></el-icon>
        <el-icon v-else-if="resolveStationIcon(icon)" class="wd-panel__title-icon">
          <component :is="resolveStationIcon(icon)" />
        </el-icon>
        <slot name="title">
          <span class="wd-panel__title" :class="{ 'is-dashed': descriptionExpandable }">{{ title }}</span>
          <span v-if="description" class="wd-panel__description"
            :class="{ 'is-folding': descriptionExpandable, 'is-right': descriptionAlign === 'right' }">{{ description }}</span>
        </slot>
      </div>
      <div v-if="$slots.extra || collapsible" class="wd-panel__header-extra" @click.stop>
        <slot name="extra" />
        <el-icon v-if="collapsible" class="wd-panel__collapse-icon" :class="{ 'is-collapsed': !openedState }"
          role="button" :aria-label="openedState ? '收起' : '展开'" tabindex="0" @click="toggle"
          @keydown.enter.prevent="toggle" @keydown.space.prevent="toggle">
          <ArrowDown />
        </el-icon>
      </div>
    </div>
    <div class="wd-panel__content" :class="{ 'is-collapsed': collapsible && !openedState }">
      <div ref="contentInnerRef" class="wd-panel__content-inner">
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
import { ref, computed, watch, onMounted, nextTick, type PropType, type Component } from 'vue'
import { ArrowDown } from '@element-plus/icons-vue'
import { isIconFontClass, resolveStationIcon } from '../../lib/core/station-icon'

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
  },
  /** 是否显示外边框（嵌套在卡片/弹层等容器内时可关闭） */
  border: { type: Boolean, default: true },
  /** description 展示模式：false=显示展示（默认，描述直接显示在标题旁）；true=折叠展示（标题下出现虚线，鼠标悬停标题时才显示描述） */
  descriptionExpandable: { type: Boolean, default: false },
  /** description 在标题右侧空白区的对齐方式：left=紧跟标题（默认）；right=靠面板头部右端对齐 */
  descriptionAlign: {
    type: String as PropType<'left' | 'right'>,
    default: 'left'
  },
  /** 标题左侧品牌色标识条高度形态：long=与头部同高（默认，出厂表现）；short=与标题行同高（约 22px，垂直居中对齐标题行）；icon 或 mode="card" 下标识条隐藏，该属性无效 */
  titleBar: {
    type: String as PropType<'long' | 'short'>,
    default: 'long'
  },
  /** 标题图标（@element-plus/icons-vue 名称字符串 / 图标字体 class 如 'fa-solid fa-user'（需自行引入对应 CSS）/ 直接传组件）；设置后标题前显示图标，且左侧品牌色标识条隐藏 */
  icon: { type: [String, Object] as PropType<string | Component>, default: '' },
  /** 展示模式：panel=常规分区面板（默认）；card=信息卡片（白底大圆角、标题带浅色背景块、描述换行到标题下方，适合 flex 容器一行并行多卡） */
  mode: {
    type: String as PropType<'panel' | 'card'>,
    default: 'panel'
  },
  /** 内容高度阈值（px）：collapsible=true 且内容实际高度超过该值时挂载后自动折叠；0=不自动折叠（完全撑开） */
  collapseHeight: { type: Number, default: 0 }
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

const contentInnerRef = ref<HTMLElement | null>(null)

// collapseHeight > 0 且 collapsible 时：挂载渲染完成后测量内容高度，超限则自动折叠一次
onMounted(async () => {
  if (!props.collapsible || !(props.collapseHeight > 0) || !openedState.value) return
  await nextTick()
  const el = contentInnerRef.value
  if (!el) return
  if (el.scrollHeight > props.collapseHeight) {
    innerOpened.value = false
    emit('update:opened', false)
    emit('change', false)
  }
})
</script>

<style scoped>
.wd-panel {
  width: 100%;
  margin-bottom: var(--wd-panel-margin-bottom, var(--wd-spacing-base, 12px));
  /* 组件级令牌回退链：--wd-panel-* 未设时回落全局令牌，皮肤可单独定制 Panel */
  background: var(--wd-panel-bg, var(--wd-bg-color, #fff));
  /* 背景素材：皮肤可挂纹理/图片（须置于 background 简写之后，否则被简写重置） */
  background-image: var(--wd-panel-bg-image, none);
  border: var(--wd-border-width, 1px) var(--wd-border-style, solid) var(--wd-panel-border-color, var(--wd-border-color-light, #e4e7ed));
  border-radius: var(--wd-panel-radius, var(--wd-radius-base, 4px));
  box-sizing: border-box;
  overflow: hidden;
  transition: box-shadow 0.25s ease, border-color 0.25s ease, transform 0.25s ease;
}

/* 阴影跟随可覆盖变量：在任意祖先/全局定义
   --wd-panel-shadow-sm / --wd-panel-shadow-md 即可换肤 */
.wd-panel--shadow-always {
  box-shadow: var(--wd-panel-shadow-sm,
      0 1px 2px rgba(16, 24, 40, 0.04),
      0 1px 6px -1px rgba(16, 24, 40, 0.06));
}

.wd-panel--shadow-hover:hover {
  border-color: var(--wd-border-color, #dcdfe6);
  box-shadow: var(--wd-panel-shadow-md,
      0 4px 8px -2px rgba(16, 24, 40, 0.08),
      0 12px 24px -4px rgba(16, 24, 40, 0.1));
  transform: translateY(-1px);
}

/* 无边框：transparent 保持盒模型一致；:hover 提优先级防止悬停阴影重新上色 */
.wd-panel--no-border,
.wd-panel--no-border:hover {
  border-color: transparent;
}

.wd-panel__header {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--wd-spacing-base, 12px);
  padding: var(--wd-panel-header-padding, var(--wd-spacing-base, 12px) var(--wd-spacing-large, 16px) var(--wd-spacing-base, 12px) 18px);
  background: var(--wd-panel-header-bg, transparent);
  border-bottom: var(--wd-border-width, 1px) var(--wd-border-style, solid) var(--wd-border-color-light, #e4e7ed);
  transition: background-color 0.2s ease;
}

/* 品牌色标识条：组件级令牌回退链，出厂保持 3px 全高主色细条 */
.wd-panel__header::before {
  content: '';
  position: absolute;
  left: 0;
  top: var(--wd-panel-title-bar-inset, 0);
  bottom: var(--wd-panel-title-bar-inset, 0);
  width: var(--wd-panel-title-bar-width, 3px);
  background: var(--wd-panel-title-bar-bg, var(--wd-color-primary, #409eff));
  border-radius: var(--wd-panel-title-bar-radius, 0 var(--wd-radius-small, 2px) var(--wd-radius-small, 2px) 0);
}

/* titleBar='short'：色条与标题行同高（默认 22px），顶部对齐标题行
   （--wd-panel-title-bar-top 默认 12px 与 header 顶部内边距一致，皮肤改 header 上内边距时需同步），
   并与左侧边框留有间距（--wd-panel-title-bar-left 默认 10px）；
   短条浮动后四角均圆角（--wd-panel-title-bar-radius 回退值与长条不同：长条贴边只圆右角）；
   短条形态下 --wd-panel-title-bar-inset 不生效 */
.wd-panel__header.is-short-bar::before {
  top: var(--wd-panel-title-bar-top, 12px);
  bottom: auto;
  left: var(--wd-panel-title-bar-left, 10px);
  height: var(--wd-panel-title-bar-height, 22px);
  border-radius: var(--wd-panel-title-bar-radius, var(--wd-radius-small, 2px));
}

/* short 模式 description 换行显示在标题下方独占整行（与 card 模式同手法，DOM 顺序不变） */
.wd-panel__header.is-short-bar .wd-panel__header-main {
  flex-wrap: wrap;
}

.wd-panel__header.is-short-bar .wd-panel__description {
  width: 100%;
}

.wd-panel__header.is-icon::before {
  display: none;
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

/* 标题图标：替代品牌色标识条承担视觉锚点角色，主色渲染、随行高垂直居中 */
.wd-panel__title-icon {
  align-self: center;
  font-size: 16px;
  color: var(--wd-panel-title-icon-color, var(--wd-color-primary, #409eff));
}

.wd-panel__title {
  font-size: var(--wd-font-size-base, 14px);
  font-weight: 600;
  line-height: 22px;
  color: var(--wd-panel-title-color, var(--wd-text-color-primary, #303133));
  white-space: nowrap;
}

.wd-panel__description {
  font-size: var(--wd-font-size-small, 12px);
  color: var(--wd-text-color-secondary, #909399);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* descriptionAlign='right'：description 吸收标题右侧剩余空白，贴到面板头部右端 */
.wd-panel__description.is-right {
  margin-left: auto;
}

/* descriptionExpandable=true：标题下出现虚线下划线 */
.wd-panel__title.is-dashed {
  border-bottom: 1px dashed var(--wd-text-color-secondary, #909399);
  padding-bottom: 1px;
}

/* descriptionExpandable=true：描述默认隐藏，鼠标悬停标题时淡入 + 轻微滑入 */
.wd-panel__description.is-folding {
  display: none;
}

.wd-panel__header:hover .wd-panel__description.is-folding {
  display: inline-block;
  animation: wd-panel-description-in 0.24s cubic-bezier(0.22, 0.61, 0.36, 1);
}

/* 居右对齐时从右往左滑入，位移方向与对齐方向一致 */
.wd-panel__header:hover .wd-panel__description.is-folding.is-right {
  animation-name: wd-panel-description-in-right;
}

@keyframes wd-panel-description-in {
  from {
    opacity: 0;
    transform: translateX(-4px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes wd-panel-description-in-right {
  from {
    opacity: 0;
    transform: translateX(4px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
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
  padding: var(--wd-panel-body-padding, var(--wd-spacing-large, 16px));
}

.wd-panel__footer {
  padding: 10px var(--wd-spacing-large, 16px);
  border-top: var(--wd-border-width, 1px) var(--wd-border-style, solid) var(--wd-border-color-light, #e4e7ed);
  background: var(--wd-panel-footer-bg, var(--wd-bg-color-page, #f5f7fa));
}

/* card 模式：白底大圆角信息卡片——头部整体带浅色背景、description 换行到标题下方、
   隐藏品牌色标识条与头部底部分割线；width:100% 配合外层 flex 容器（gap 布局）可一行并行多卡 */
.wd-panel--card {
  border-radius: var(--wd-panel-card-radius, 12px);
}

.wd-panel--card .wd-panel__header {
  border-bottom: none;
  padding: var(--wd-panel-card-header-padding, var(--wd-spacing-large, 16px));
  /* card 头部背景三级回退：--wd-panel-card-header-bg（card 专属）→ --wd-panel-header-bg（皮肤 panel 头部背景，自动联动）→ #e4e9f0 */
  background: var(--wd-panel-card-header-bg, var(--wd-panel-header-bg, #f8f8f8));
  border-radius: var(--wd-panel-card-radius, 12px) var(--wd-panel-card-radius, 12px) 0 0;
}

.wd-panel--card .wd-panel__header::before {
  display: none;
}

/* 标题行 + 描述换行：header-main 允许换行，description 独占整行掉到标题下方 */
.wd-panel--card .wd-panel__header-main {
  flex-wrap: wrap;
  row-gap: var(--wd-panel-card-title-gap, 6px);
}

.wd-panel--card .wd-panel__description {
  width: 100%;
}

/* card 模式 descriptionAlign='right'：描述不换行，与标题同行贴头部右端并垂直居中
   （覆盖上方「描述独占整行」的换行表现；left 时仍保持描述在标题下方） */
.wd-panel--card .wd-panel__header-main.is-desc-inline {
  align-items: center;
}

.wd-panel--card .wd-panel__header-main.is-desc-inline .wd-panel__description {
  width: auto;
}
</style>
