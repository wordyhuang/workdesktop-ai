import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick, defineComponent } from 'vue'
import WdDateRangePicker from '../DateRangePicker.vue'

const ElDatePickerStub = defineComponent({
  name: 'ElDatePicker',
  props: ['type', 'modelValue', 'valueFormat', 'startPlaceholder', 'endPlaceholder', 'disabled', 'shortcuts'],
  emits: ['update:modelValue', 'change'],
  template: '<input class="el-date-range-picker-stub" />'
})

function mountPicker(props: Record<string, any> = {}) {
  return mount(WdDateRangePicker, {
    props,
    global: { stubs: { 'el-date-picker': ElDatePickerStub } }
  })
}

describe('WdDateRangePicker valueFormat 默认值映射', () => {
  it('type=date 缺省 valueFormat=YYYY-MM-DD', () => {
    const wrapper = mountPicker()
    const state = (wrapper.vm as any).$.setupState
    expect(state.valueFormatInner).toBe('YYYY-MM-DD')
    wrapper.unmount()
  })
  it('type=datetime 缺省 valueFormat=YYYY-MM-DD HH:mm:ss', () => {
    const wrapper = mountPicker({ type: 'datetime' })
    const state = (wrapper.vm as any).$.setupState
    expect(state.valueFormatInner).toBe('YYYY-MM-DD HH:mm:ss')
    wrapper.unmount()
  })
  it('显式 valueFormat 优先', () => {
    const wrapper = mountPicker({ valueFormat: 'YYYY/MM/DD' })
    const state = (wrapper.vm as any).$.setupState
    expect(state.valueFormatInner).toBe('YYYY/MM/DD')
    wrapper.unmount()
  })
})

describe('WdDateRangePicker 双向绑定与透传', () => {
  it('固定 type=daterange，modelValue / 起止占位文案透传', () => {
    const range = ['2026-10-01', '2026-10-18']
    const wrapper = mountPicker({ modelValue: range })
    const inner = wrapper.findComponent(ElDatePickerStub)
    expect(inner.props('type')).toBe('daterange')
    expect(inner.props('modelValue')).toStrictEqual(range)
    expect(inner.props('startPlaceholder')).toBe('开始日期')
    expect(inner.props('endPlaceholder')).toBe('结束日期')
    wrapper.unmount()
  })
  it('内部值变化 emit update:modelValue', async () => {
    const wrapper = mountPicker()
    const inner = wrapper.findComponent(ElDatePickerStub)
    inner.vm.$emit('update:modelValue', ['2026-01-01', '2026-01-31'])
    await nextTick()
    const emitted = wrapper.emitted('update:modelValue')!
    expect(emitted.at(-1)[0]).toEqual(['2026-01-01', '2026-01-31'])
    wrapper.unmount()
  })
})

describe('WdDateRangePicker 快捷选项', () => {
  it('withShortcut=false 时不传 shortcuts', () => {
    const wrapper = mountPicker()
    const inner = wrapper.findComponent(ElDatePickerStub)
    expect(inner.props('shortcuts')).toBeUndefined()
    wrapper.unmount()
  })
  it('withShortcut=true 时内置 5 个快捷项（今天/近7天/近30天/本月/上月）', () => {
    const wrapper = mountPicker({ withShortcut: true })
    const inner = wrapper.findComponent(ElDatePickerStub)
    const shortcuts = inner.props('shortcuts') as Array<{ text: string }>
    expect(shortcuts.map((s) => s.text)).toEqual(['今天', '近7天', '近30天', '本月', '上月'])
    wrapper.unmount()
  })
})
