<template>
  <el-date-picker
    v-model="inner"
    type="daterange"
    :value-format="valueFormatInner"
    :start-placeholder="startPlaceholder"
    :end-placeholder="endPlaceholder"
    :disabled="disabled"
    :shortcuts="withShortcut ? shortcuts : undefined"
    v-bind="$attrs"
    @change="onChange"
  />
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue'

defineOptions({ name: 'WdDateRangePicker', inheritAttrs: false })

const props = defineProps({
  modelValue: { type: Array as PropType<string[] | Date[]>, default: undefined },
  /** 选择类型：date 日期范围 / datetime 日期时间范围 */
  type: { type: String as PropType<'date' | 'datetime'>, default: 'date' },
  /** 绑定值格式（dayjs 令牌）；缺省按 type 匹配：date=YYYY-MM-DD / datetime=YYYY-MM-DD HH:mm:ss */
  valueFormat: { type: String, default: '' },
  /** 起始占位文案 */
  startPlaceholder: { type: String, default: '开始日期' },
  /** 结束占位文案 */
  endPlaceholder: { type: String, default: '结束日期' },
  /** 是否禁用 */
  disabled: { type: Boolean, default: false },
  /** 是否内置快捷选项（今天 / 近7天 / 近30天 / 本月 / 上月） */
  withShortcut: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'change'])

const inner = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const valueFormatInner = computed(() => {
  if (props.valueFormat) return props.valueFormat
  return props.type === 'datetime' ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD'
})

function onChange(val: any) {
  emit('change', val)
}

const shortcuts = [
  {
    text: '今天',
    value: () => {
      const start = startOfDay(new Date())
      const end = props.type === 'datetime' ? new Date() : startOfDay(new Date())
      return [start, end]
    }
  },
  {
    text: '近7天',
    value: () => {
      const end = props.type === 'datetime' ? new Date() : startOfDay(new Date())
      const start = new Date()
      start.setDate(start.getDate() - 6)
      return [startOfDay(start), end]
    }
  },
  {
    text: '近30天',
    value: () => {
      const end = props.type === 'datetime' ? new Date() : startOfDay(new Date())
      const start = new Date()
      start.setDate(start.getDate() - 29)
      return [startOfDay(start), end]
    }
  },
  {
    text: '本月',
    value: () => {
      const now = new Date()
      const start = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1))
      const end = props.type === 'datetime' ? now : startOfDay(now)
      return [start, end]
    }
  },
  {
    text: '上月',
    value: () => {
      const now = new Date()
      const start = startOfDay(new Date(now.getFullYear(), now.getMonth() - 1, 1))
      const end = startOfDay(new Date(now.getFullYear(), now.getMonth(), 0))
      return [start, end]
    }
  }
]

function startOfDay(d: Date) {
  const nd = new Date(d)
  nd.setHours(0, 0, 0, 0)
  return nd
}
</script>
