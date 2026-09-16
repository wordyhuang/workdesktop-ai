<template>
  <!-- 悬停提示（el-tooltip）与气泡确认（el-popconfirm）平级，均以 virtual-ref 指向同一按钮：
       hover 显示提示、click 弹出确认，互不嵌套、互不冲突 -->
  <el-button ref="btnRef" v-bind="$attrs" :loading="loading" @click="onClick">
    <slot>{{ label }}</slot>
  </el-button>

  <el-tooltip
    v-if="tips"
    :virtual-ref="btnRef"
    virtual-triggering
    :content="tips"
    :effect="tipsType"
    :placement="placement"
  />

  <el-popconfirm
    :virtual-ref="btnRef"
    virtual-triggering
    :title="title"
    :confirm-button-text="confirmButtonText"
    :cancel-button-text="cancelButtonText"
    :confirm-button-type="confirmButtonType"
    :cancel-button-type="cancelButtonType"
    :icon="popIcon"
    :icon-color="popIconColor"
    :hide-after="hideAfter"
    :disabled="popDisabled"
    :width="width"
    :trigger="trigger"
    :placement="placement"
    :popper-class="popperClass"
    :popper-options="popperOptions"
    :show-after="showAfter"
    :teleported="teleported"
    :persistent="persistent"
    @confirm="onConfirm"
    @cancel="onCancel"
    @show="emit('show')"
    @hide="emit('hide')"
  />
</template>

<script setup lang="ts">
import { ref, type Component, type PropType } from 'vue'
import { useApiAction } from './useApiAction'
import { filterProp, headRefreshDatagridProp, apiProps, buttonTextProp, tipsProp } from '../common/props'

defineOptions({ name: 'WdPopconfirmButton', inheritAttrs: false })

const props = defineProps({
  ...filterProp,
  ...headRefreshDatagridProp,
  ...apiProps,
  ...buttonTextProp,
  ...tipsProp,
  // ---------- el-popconfirm 集成属性 ----------
  /** 确认提示标题 */
  title: { type: String, default: '' },
  /** 确定按钮文案 */
  confirmButtonText: { type: String, default: '确定' },
  /** 取消按钮文案 */
  cancelButtonText: { type: String, default: '取消' },
  /** 确定按钮类型 */
  confirmButtonType: {
    type: String as PropType<'primary' | 'success' | 'warning' | 'danger' | 'info' | 'text'>,
    default: 'primary'
  },
  /** 取消按钮类型 */
  cancelButtonType: {
    type: String as PropType<'primary' | 'success' | 'warning' | 'danger' | 'info' | 'text'>,
    default: 'text'
  },
  /** 弹层图标（命名 popIcon 避免与 el-button 的 icon 透传冲突） */
  popIcon: { type: [String, Object] as PropType<string | Component>, default: undefined },
  /** 弹层图标颜色 */
  popIconColor: { type: String, default: undefined },
  /** 关闭动画时长（ms，继承自 el-popconfirm） */
  hideAfter: { type: Number, default: undefined },
  /** 禁用确认弹层（命名 popDisabled 避免与 el-button 的 disabled 透传冲突） */
  popDisabled: { type: Boolean, default: false },
  /** 弹层宽度 */
  width: { type: [String, Number], default: undefined },
  /** 触发方式 */
  trigger: {
    type: String as PropType<'click' | 'hover' | 'focus' | 'contextmenu'>,
    default: 'click'
  },
  /** 弹层自定义类名 */
  popperClass: { type: String, default: '' },
  /** popper 配置 */
  popperOptions: { type: Object, default: undefined },
  /** 显示延迟（ms） */
  showAfter: { type: Number, default: undefined },
  /** 是否挂载到 body */
  teleported: { type: Boolean, default: true },
  /** 关闭时是否保留内容 */
  persistent: { type: Boolean, default: false },
  // ---------- 请求相关 ----------
  /** 按钮级 loading（默认 true）；false 时按钮不转圈 */
  buttonLoading: { type: Boolean, default: true },
  /** 页面级 loading（全局遮罩 ElLoading） */
  pageLoading: { type: Boolean, default: false }
})

const emit = defineEmits([
  'click',
  'confirm',
  'cancel',
  'show',
  'hide',
  'apiBefore',
  'apiSuccess',
  'apiFail',
  'apiException',
  'apiAfter'
])

/** 按钮引用：el-tooltip / el-popconfirm 通过 virtual-ref 指向它 */
const btnRef = ref<InstanceType<typeof import('element-plus').ElButton>>()

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

/** 点击按钮（弹层触发由 el-popconfirm 接管） */
function onClick(event: MouseEvent) {
  emit('click', event)
}

/** 用户点击「确定」→ 自动请求 API */
async function onConfirm() {
  emit('confirm')
  await doRequest()
}

/** 用户点击「取消」 */
function onCancel() {
  emit('cancel')
}
</script>
