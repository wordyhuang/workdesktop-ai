<template>
  <el-tooltip
    v-if="tips"
    :content="tips"
    :effect="tipsType"
    :placement="placement"
  >
    <el-button v-bind="buttonAttrs" :loading="loading" :disabled="mergedDisabled" @click="onClick">
      <template v-if="hasIcon" #icon>
        <el-icon v-if="loading" class="is-loading"><Loading /></el-icon>
        <slot v-else-if="hasIconSlot" name="icon" />
        <el-icon v-else><component :is="iconProp" /></el-icon>
      </template>
      <slot>{{ label }}</slot>
    </el-button>
  </el-tooltip>
  <el-button v-else v-bind="buttonAttrs" :loading="loading" :disabled="mergedDisabled" @click="onClick">
    <template v-if="hasIcon" #icon>
      <el-icon v-if="loading" class="is-loading"><Loading /></el-icon>
      <slot v-else-if="hasIconSlot" name="icon" />
      <el-icon v-else><component :is="iconProp" /></el-icon>
    </template>
    <slot>{{ label }}</slot>
  </el-button>
</template>

<script setup lang="ts">
import { computed, useAttrs, useSlots } from 'vue'
import { Loading } from '@element-plus/icons-vue'
import { useApiAction } from './useApiAction'
import { filterProp, headRefreshDatagridProp, apiProps, buttonTextProp, tipsProp } from '../common/props'

defineOptions({ name: 'WdApiButton', inheritAttrs: false })

const props = defineProps({
  ...filterProp,
  ...headRefreshDatagridProp,
  ...apiProps,
  ...buttonTextProp,
  ...tipsProp,
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

const attrs = useAttrs()
const slots = useSlots()

/** 按钮自身配置的图标：el-button 的 icon 属性或 #icon 插槽 */
const iconProp = computed(() => (attrs.icon as any) ?? null)
const hasIconSlot = computed(() => !!slots.icon)
const hasIcon = computed(() => iconProp.value != null || hasIconSlot.value)

/** 透传给 el-button 的属性（icon/disabled 由组件接管，避免重复渲染与冲突） */
const buttonAttrs = computed(() => {
  const { icon: _icon, disabled: _disabled, ...rest } = attrs as Record<string, unknown>
  return rest
})

/** 请求中禁用按钮，防止重复提交；同时保留外部传入的 disabled */
const mergedDisabled = computed(() => loading.value || Boolean((attrs as Record<string, unknown>).disabled))

async function onClick(event: MouseEvent) {
  if (loading.value) return
  emit('click', event)
  await doRequest()
}
</script>
