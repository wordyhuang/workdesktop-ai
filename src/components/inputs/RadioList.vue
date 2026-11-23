<template>
  <el-radio-group
    v-model="inner"
    v-loading="loading"
    v-bind="$attrs"
    @change="onChange"
  >
    <template v-for="opt in options" :key="String(opt.value)">
      <el-radio-button v-if="buttonStyle" :value="opt.value">
        <span class="wd-option-row">
          <span class="wd-option-text">
            <slot :option="opt.raw" :text="opt.text" :value="opt.value" :tips="opt.tips">{{ opt.text }}</slot>
          </span>
          <el-tooltip
            v-if="opt.tips"
            :content="opt.tips"
            placement="top"
            effect="dark"
            :show-after="200"
          >
            <span class="wd-option-tip" tabindex="0" role="note" aria-label="帮助说明" @click.stop>
              <el-icon><QuestionFilled /></el-icon>
            </span>
          </el-tooltip>
        </span>
      </el-radio-button>
      <el-radio v-else :value="opt.value">
        <span class="wd-option-row">
          <span class="wd-option-text">
            <slot :option="opt.raw" :text="opt.text" :value="opt.value" :tips="opt.tips">{{ opt.text }}</slot>
          </span>
          <el-tooltip
            v-if="opt.tips"
            :content="opt.tips"
            placement="top"
            effect="dark"
            :show-after="200"
          >
            <span class="wd-option-tip" tabindex="0" role="note" aria-label="帮助说明" @click.stop>
              <el-icon><QuestionFilled /></el-icon>
            </span>
          </el-tooltip>
        </span>
      </el-radio>
    </template>
  </el-radio-group>
</template>

<script setup lang="ts">
import { computed, toRefs, type PropType } from 'vue'
import { QuestionFilled } from '@element-plus/icons-vue'
import { useOptionsLoader } from './useOptionsLoader'
import { optionsProps } from '../common/props'

defineOptions({ name: 'WdRadioList', inheritAttrs: false })

const props = defineProps({
  ...optionsProps,
  modelValue: { type: [String, Number, Boolean] as PropType<any>, default: undefined },
  /** 按钮样式 */
  buttonStyle: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'change', 'apiBefore', 'apiSuccess', 'apiFail', 'apiAfter'])

const refs = toRefs(props)
const { options, loading } = useOptionsLoader({
  api: refs.api,
  apiMethod: refs.apiMethod as any,
  apiParam: refs.apiParam,
  active: refs.active,
  dataSource: refs.dataSource as any,
  textProp: refs.textProp,
  valueProp: refs.valueProp,
  tipsProp: refs.tipsProp,
  addData: refs.addData as any,
  appendData: refs.appendData as any,
  emit
})

const inner = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

function onChange(val: any) {
  emit('change', val)
}
</script>

<style scoped>
.wd-option-row {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  max-width: 100%;
}
.wd-option-text {
  display: inline-block;
}
.wd-option-tip {
  display: inline-flex;
  align-items: center;
  color: var(--el-text-color-secondary, #909399);
  font-size: 14px;
  cursor: help;
}
.wd-option-tip:focus-visible {
  outline: 1px dashed currentColor;
  outline-offset: 2px;
}
/* 选中态：icon 跟随文字颜色（按钮样式选中为蓝底白字，灰色 icon 在蓝底上不可读） */
.el-radio.is-checked .wd-option-tip,
.el-radio-button.is-active .wd-option-tip {
  color: inherit;
}
</style>
