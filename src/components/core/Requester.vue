<template>
  <!-- 无默认插槽 -->
  <slot></slot>
</template>

<script setup lang="ts">
/**
 * WdRequester 请求触发组件
 *
 * 使用 v-model 控制请求触发：开关变为 true 时发起请求；请求完成后自动设置为 false，
 * 等待开发者下一次将它变为 true 再触发。所有组件都基于本库公开请求核心 RequestAPI。
 *
 * 特性：
 * 1. 封装 get/post/put/delete/request 全部请求方法；
 * 2. 全周期 emit 事件：apiBefore 触发后允许开发者手动 abort 请求；
 * 3. 支持中途发起新请求：旧请求会自动被中断；
 * 4. 请求完成（成功/失败/异常）后自动将 v-model 置为 false；
 *
 * @example
 * <template>
 *   <wd-requester
 *     v-model="trigger"
 *     url="/api/save"
 *     method="post"
 *     @api-before="onApiBefore"
 *     @api-success="onSuccess"
 *   />
 *   <el-button @click="trigger = true">提交</el-button>
 * </template>
 */
import { onUnmounted, watch } from 'vue'
import { request, type ApiResult } from '../../lib/core/http'
import type { Method } from 'axios'
import type { ReqOptions } from '../../types/config'
import { useConfig } from '../../lib/composables/useConfig'

defineOptions({ name: 'WdRequester' })

interface Props {
  /** v-model 触发开关：true 则发起请求，完成后自动变 false */
  modelValue: boolean
  /** 请求 URL */
  url: string
  /** 请求方法，默认 post（可通过全局配置 page.componentDefault.WdRequester.method 覆盖） */
  method?: Method
  /** 请求参数（get/delete 放 query，post/put 放 body） */
  params?: any
  /** 请求选项（透传给 http）：showLoading/showTips/tipsConfig/axiosConfig/signal（可通过全局配置 page.componentDefault.WdRequester.reqOptions 覆盖） */
  reqOptions?: ReqOptions
}

const props = defineProps<Props>()

// 合并三级配置：默认层（default-config 的 WdRequester）→ 全局层（componentDefault）→ 本地 props
// 注意：url/params 属业务参数，实时读 props；method/reqOptions 属配置类，走合并结果
const config = useConfig<Record<string, any>>('WdRequester', props)

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'api-before', abort: () => void): void
  (e: 'api-success', result: ApiResult): void
  (e: 'api-fail', result: ApiResult): void
  (e: 'api-exception', error: any): void
  (e: 'api-after'): void
}

const emit = defineEmits<Emits>()

let currentController: AbortController | null = null

/**
 * 仅中断当前进行中的请求（不清引用）。
 * 传给 apiBefore 的 abort：中断后本请求仍走 finally 收尾（api-after + 复位开关）。
 */
function abortActive() {
  currentController?.abort()
}

/**
 * 中断并清引用：用于外部关闭开关 / 组件卸载，不触发收尾事件。
 */
function abortAndClear() {
  if (currentController) {
    currentController.abort()
    currentController = null
  }
}

async function doRequest() {
  // 中断并清掉上一次请求（旧请求的收尾会被跳过，不触发 api-after）
  abortAndClear()

  const controller = new AbortController()
  currentController = controller

  // 组装请求选项：全局默认（reqOptions）→ 实例 props 覆盖 → 注入 abort signal
  const reqOpts: ReqOptions = {
    ...(config.value.reqOptions || {}),
    ...(props.reqOptions || {}),
    signal: controller.signal,
  }

  try {
    // 触发 apiBefore，允许开发者在事件中手动调用 abort() 中断本次请求
    emit('api-before', abortActive)

    // 如果在 apiBefore 中被手动中断：直接走收尾（api-after + 复位开关）
    if (controller.signal.aborted) {
      return
    }

    let result: ApiResult
    // 请求方法优先级：实例 props.method → 全局默认 config.method → 内置兜底 'post'
    const method = (props.method ?? config.value.method ?? 'post').toLowerCase() as 'get' | 'post' | 'put' | 'delete'

    if (method === 'get' || method === 'delete') {
      result = await request[method](props.url, props.params, reqOpts)
    } else {
      result = await request[method](props.url, props.params, reqOpts)
    }

    if (controller.signal.aborted) {
      // 已被中断，无需后续处理
      return
    }

    if (result.success) {
      emit('api-success', result)
    } else {
      emit('api-fail', result)
    }
  } catch (e) {
    if (controller.signal.aborted) {
      return
    }
    emit('api-exception', e)
  } finally {
    if (currentController === controller) {
      currentController = null
      emit('api-after')
      // 自动关闭触发开关
      emit('update:modelValue', false)
    }
  }
}

// 监听 v-model 开关：变为 true 就发起请求
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal === true) {
      doRequest()
    } else {
      // 外部关闭开关：中断进行中的请求（不触发收尾事件）
      abortAndClear()
    }
  },
  { immediate: true }
)

onUnmounted(() => {
  abortAndClear()
})
</script>

<style scoped>
</style>
