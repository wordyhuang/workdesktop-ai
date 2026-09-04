<template>
  <el-button v-bind="$attrs" :loading="loading" @click="onClick">
    <slot />
  </el-button>
</template>

<script setup lang="ts">
import { ElMessageBox } from 'element-plus'
import { useApiAction } from './useApiAction'
import { filterProp, headRefreshDatagridProp, apiProps } from '../common/props'

defineOptions({ name: 'WdConfirmButton', inheritAttrs: false })

const props = defineProps({
  ...filterProp,
  ...headRefreshDatagridProp,
  ...apiProps,
  /** 确认文案 */
  confirmText: { type: String, default: '确认执行该操作？' },
  /** 取消按钮文案（空则不显示取消按钮） */
  cancelText: { type: String, default: '取消' },
  /** 确认框标题 */
  confirmTitle: { type: String, default: '提示' },
  /** 按钮级 loading */
  buttonLoading: { type: Boolean, default: true },
  pageLoading: { type: Boolean, default: false }
})

const emit = defineEmits([
  'click',
  'confirm',
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
  try {
    await ElMessageBox.confirm(props.confirmText, props.confirmTitle, {
      confirmButtonText: '确定',
      cancelButtonText: props.cancelText,
      type: 'warning'
    })
  } catch {
    emit('cancel')
    return
  }
  emit('confirm')
  await doRequest()
}
</script>
