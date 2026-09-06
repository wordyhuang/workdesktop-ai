<template>
  <el-button v-bind="$attrs" @click="onClick">
    <slot>{{ text }}</slot>
  </el-button>
</template>

<script setup lang="ts">
import { getCurrentInstance, type PropType } from 'vue'
import { filterProp, buttonTextProp } from '../common/props'

defineOptions({ name: 'WdRouteButton', inheritAttrs: false })

const props = defineProps({
  ...filterProp,
  ...buttonTextProp,
  /** 路由 name（与 routePath 二选一） */
  routeName: { type: String, default: '' },
  /** 路由 path */
  routePath: { type: String, default: '' },
  /** 路由 params */
  params: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
  /** 路由 query */
  query: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
  /** 打开方式 */
  target: { type: String as PropType<'_self' | '_blank'>, default: '_self' }
})

const emit = defineEmits(['click'])

const instance = getCurrentInstance()

function onClick(event: MouseEvent) {
  emit('click', event)

  // 无路由配置：仅触发 click
  if (!props.routeName && !props.routePath) return

  // 新窗口：拼 URL 后 window.open
  if (props.target === '_blank') {
    const url = buildUrl()
    if (url) window.open(url, '_blank')
    return
  }

  // 当前窗口：优先走 vue-router（inject $router / globalProperties.$router）
  const router =
    (instance?.proxy as any)?.$router ||
    instance?.appContext?.config?.globalProperties?.$router
  if (router) {
    if (props.routeName) {
      router.push({ name: props.routeName, params: props.params, query: props.query })
    } else {
      router.push({ path: props.routePath, query: props.query })
    }
  } else if (props.routePath) {
    // 无 router 环境：退化到 location
    window.location.href = buildUrl()
  }
}

function buildUrl(): string {
  const base = props.routePath || ''
  const qs = new URLSearchParams(props.query as Record<string, string>).toString()
  return qs ? `${base}?${qs}` : base
}
</script>
