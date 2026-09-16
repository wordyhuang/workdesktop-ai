<template>
  <el-form-item
    class="wd-search-item"
    :class="{ 'is-help': !!tip }"
    :label="label"
    :prop="prop"
    v-bind="$attrs"
  >
    <!-- label 区域：文本（可被 #label 覆盖）+ tip 提供的帮助图标（鼠标悬停显示解释说明） -->
    <template v-if="showLabel" #label>
      <span class="wd-search-item__label">
        <span class="wd-search-item__title">
          <slot name="label">{{ label }}</slot>
        </span>
        <el-tooltip
          v-if="tip"
          :content="tip"
          :placement="tipPlacement"
          effect="dark"
          :show-after="100"
        >
          <span class="wd-search-item__tip" tabindex="0" role="note" aria-label="帮助说明">
            <el-icon>
              <QuestionFilled />
            </el-icon>
          </span>
        </el-tooltip>
      </span>
    </template>

    <!-- 控件区：el-input / el-select 等放默认插槽 -->
    <slot />
  </el-form-item>
</template>

<script setup lang="ts">
import { computed, useSlots, type PropType } from 'vue'
import { QuestionFilled } from '@element-plus/icons-vue'

defineOptions({ name: 'WdSearchItem', inheritAttrs: false })

const props = defineProps({
  /** 字段标签文字 */
  label: { type: String, default: '' },
  /** 绑定字段名（对应查询 model 的 key，如姓名→model.name） */
  prop: { type: String, default: '' },
  /** 帮助说明：提供时 label 右侧自动出现带问号的图标，鼠标悬停显示说明；不传则不显示图标 */
  tip: { type: String, default: '' },
  /** 帮助气泡的弹出位置 */
  tipPlacement: {
    type: String as PropType<'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'right'>,
    default: 'top'
  }
})

const slots = useSlots()

// 存在 label 文字、自定义 label 插槽或帮助说明时，才渲染 label 区域
const showLabel = computed(() => !!(props.label || slots.label || props.tip))
</script>

<style scoped>
.wd-search-item__label {
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
}
.wd-search-item__tip {
  display: inline-flex;
  align-items: center;
  margin-left: 4px;
  color: var(--wd-color-info, #909399);
  cursor: help;
}
.wd-search-item__tip:focus-visible {
  outline: 1px dashed currentColor;
  outline-offset: 2px;
}
</style>
