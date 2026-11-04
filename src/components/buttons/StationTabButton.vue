<template>
  <el-tooltip
    v-if="tips"
    :content="tips"
    :effect="tipsType"
    :placement="placement"
  >
    <el-button v-bind="$attrs" @click="onClick"><slot>{{ label }}</slot></el-button>
  </el-tooltip>
  <el-button v-else v-bind="$attrs" @click="onClick"><slot>{{ label }}</slot></el-button>
</template>

<script setup lang="ts">
import { type PropType } from 'vue'
import { filterProp, buttonTextProp, tipsProp } from '../common/props'
import { openStationTab } from '../../lib/core/station-linkage'
import type { StationTabInput } from '../../lib/core/station-linkage'

defineOptions({ name: 'WdStationTabButton', inheritAttrs: false })

const props = defineProps({
  ...filterProp,
  ...buttonTextProp,
  ...tipsProp,
  /** 标签唯一标识（与 Station 菜单项 key 一致；缺省时按 path 反查菜单补齐） */
  tabKey: { type: String, default: '' },
  /** 标签标题（缺省取 label，仍未取到时由 Station 按 path 反查菜单标题） */
  tabTitle: { type: String, default: '' },
  /** 标签对应路由路径 */
  path: { type: String, default: '' },
  /** 标签图标（EP 图标名 / 图标字体 class / 组件；缺省取菜单项图标） */
  tabIcon: { type: [String, Object] as PropType<string | object>, default: '' },
  /** 固定标签（不可关闭） */
  affix: { type: Boolean, default: false }
})

const emit = defineEmits(['click', 'open'])

function onClick(event: MouseEvent) {
  emit('click', event)

  // 只给 path（未给 tabKey）时不透传 label 作为标题，交给 Station 反查菜单标题；
  // 自定义标签（tabKey）或纯按钮场景才回退按钮 label
  const title = props.tabTitle || (props.tabKey || !props.path ? props.label : '') || undefined

  const tab: StationTabInput = {
    key: props.tabKey || undefined,
    title,
    path: props.path || undefined,
    icon: props.tabIcon || undefined,
    affix: props.affix || undefined
  }

  // filter 为空串时 resolveTargets 会直接返回空，需传 true 命中自身所在的空 filter 组
  const opened = openStationTab(props.filter || true, tab, props.filter)
  emit('open', { tab, opened })
}
</script>
