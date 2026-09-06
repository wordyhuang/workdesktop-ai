<template>
  <el-button v-bind="$attrs" :loading="loading" @click="onClick">
    <slot>{{ text }}</slot>
  </el-button>
</template>

<script setup lang="ts">
import { useApiAction } from './useApiAction'
import { filterProp, headRefreshDatagridProp, apiProps, buttonTextProp } from '../common/props'

defineOptions({ name: 'WdApiButton', inheritAttrs: false })

const props = defineProps({
  ...filterProp,
  ...headRefreshDatagridProp,
  ...apiProps,
  ...buttonTextProp,
  /** 按钮级 loading（默认 true）；false 时按钮不转圈 */
  buttonLoading: { type: Boolean, default: true },
  /** 页面级 loading（全局遮罩 ElLoading） */
  pageLoading: { type: Boolean, default: false }
})

const emit = defineEmits([
  'click',
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
  await doRequest()
}
</script>
