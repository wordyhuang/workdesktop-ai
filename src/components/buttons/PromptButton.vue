<template>
  <el-tooltip
    v-if="tips"
    :content="tips"
    :effect="tipsType"
    :placement="placement"
  >
    <el-button v-bind="$attrs" :loading="loading" @click="onClick">
      <slot>{{ label }}</slot>
    </el-button>
  </el-tooltip>
  <el-button v-else v-bind="$attrs" :loading="loading" @click="onClick">
    <slot>{{ label }}</slot>
  </el-button>
</template>

<script setup lang="ts">
import { ElMessageBox } from 'element-plus'
import { useSlots } from 'vue'
import { useApiAction } from './useApiAction'
import { filterProp, headRefreshDatagridProp, apiProps, buttonTextProp, tipsProp } from '../common/props'

defineOptions({ name: 'WdPromptButton', inheritAttrs: false })

const props = defineProps({
  ...filterProp,
  ...headRefreshDatagridProp,
  ...apiProps,
  ...buttonTextProp,
  ...tipsProp,
  /** 输入框标题 */
  promptTitle: { type: String, default: '请输入' },
  /** 输入框占位文本（默认输入框模式有效） */
  promptPlaceholder: { type: String, default: '请输入内容' },
  /** 输入值并入 apiParam 的字段名（默认输入框模式有效） */
  paramKey: { type: String, default: 'value' },
  /** 输入框默认值（默认输入框模式有效） */
  promptDefault: { type: String, default: '' },
  buttonLoading: { type: Boolean, default: true },
  pageLoading: { type: Boolean, default: false }
})

const emit = defineEmits([
  'click',
  'prompt',
  'cancel',
  'confirm',
  'apiBefore',
  'apiSuccess',
  'apiFail',
  'apiException',
  'apiAfter'
])

const slots = useSlots()
const { loading, doRequest } = useApiAction({
  getApi: () => props.api,
  getMethod: () => props.apiMethod,
  getParam: () => props.apiParam,
  getFilter: () => props.filter,
  getHeadRefresh: () => props.headRefreshDatagrid,
  emit,
  buttonLoading: () => props.buttonLoading,
  getReqOptions: () => ({ showLoading: props.pageLoading })
})

async function onClick(event: MouseEvent) {
  emit('click', event)
  if (slots.content) {
    // 自定义内容模式：弹窗内容由用户插槽 #content 提供，点击确认后请求 API
    try {
      await ElMessageBox.prompt(props.promptTitle, props.promptTitle, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPlaceholder: props.promptPlaceholder,
        inputValue: props.promptDefault,
        // 允许自定义内容：message 设为空，插槽内容会被保留
        dangerouslyUseHTMLString: true,
        message: ''
      })
      emit('confirm')
      const success = await doRequest({})
      // API 请求成功（success=true）自动关闭弹窗，失败不关闭让用户继续修改
      if (success) {
        ElMessageBox.close()
      }
    } catch {
      emit('cancel')
    }
    return
  }

  // 默认单输入框模式
  let value: string
  try {
    const res = await ElMessageBox.prompt(props.promptTitle, props.promptTitle, {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPlaceholder: props.promptPlaceholder,
      inputValue: props.promptDefault
    })
    value = res.value
  } catch {
    emit('cancel')
    return
  }
  emit('prompt', value)
  const success = await doRequest({ [props.paramKey]: value })
  // 根据 API 返回 success 决定是否自动关闭：成功关闭，失败不关闭
  if (success) {
    ElMessageBox.close()
  }
}
</script>
