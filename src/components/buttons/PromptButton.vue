<template>
  <el-button v-bind="$attrs" :loading="loading" @click="onClick">
    <slot />
  </el-button>
</template>

<script setup lang="ts">
import { ElMessageBox } from 'element-plus'
import { useApiAction } from './useApiAction'
import { filterProp, headRefreshDatagridProp, apiProps } from '../common/props'

defineOptions({ name: 'WdPromptButton', inheritAttrs: false })

const props = defineProps({
  ...filterProp,
  ...headRefreshDatagridProp,
  ...apiProps,
  /** 输入框标题 */
  promptTitle: { type: String, default: '请输入' },
  /** 输入框占位文本 */
  promptPlaceholder: { type: String, default: '请输入内容' },
  /** 输入值并入 apiParam 的字段名 */
  paramKey: { type: String, default: 'value' },
  /** 输入框默认值 */
  promptDefault: { type: String, default: '' },
  buttonLoading: { type: Boolean, default: true },
  pageLoading: { type: Boolean, default: false }
})

const emit = defineEmits([
  'click',
  'prompt',
  'cancel',
  'apiBefore',
  'apiSuccess',
  'apiFail',
  'apiException',
  'apiAfter'
])

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
  await doRequest({ [props.paramKey]: value })
}
</script>
