import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import WdFormItem from '../form/FormItem.vue'

/* ---------- ElementPlus 相关组件桩 ---------- */
const ElFormItem = defineComponent({
  name: 'el-form-item',
  setup(_, { slots }) {
    return () =>
      h('div', { class: 'el-form-item-stub' }, [
        slots.label ? h('label', { class: 'el-form-item__label-stub' }, slots.label()) : null,
        h('div', { class: 'el-form-item__content-stub' }, slots.default?.())
      ])
  }
})
const ElTooltip = defineComponent({
  name: 'el-tooltip',
  setup(_, { slots, attrs }) {
    return () => h('span', { class: 'el-tooltip-stub', 'data-content': attrs.content as string }, slots.default?.())
  }
})
const ElIcon = defineComponent({
  name: 'el-icon',
  setup(_, { slots }) {
    return () => h('span', { class: 'el-icon-stub' }, slots.default?.())
  }
})

const stubs = {
  'el-form-item': ElFormItem,
  'el-tooltip': ElTooltip,
  'el-icon': ElIcon
}

describe('WdFormItem 表单子项（label 帮助提示）', () => {
  it('不传 tip：等同普通表单项，渲染 label 与控件，无问号图标/帮助气泡', () => {
    const wrapper = mount(WdFormItem, {
      props: { label: '姓名', prop: 'name' },
      slots: { default: h('input', { 'data-k': 'name' }) },
      global: { stubs }
    })

    expect(wrapper.classes()).toContain('wd-form-item')
    expect(wrapper.classes()).not.toContain('is-help')
    // label 文字渲染在 label 区域
    expect(wrapper.find('.el-form-item__label-stub').text()).toContain('姓名')
    // 控件经默认插槽透传
    expect(wrapper.find('input[data-k="name"]').exists()).toBe(true)
    // 无帮助图标
    expect(wrapper.find('.wd-form-item__tip').exists()).toBe(false)
    expect(wrapper.find('.el-tooltip-stub').exists()).toBe(false)
    wrapper.unmount()
  })

  it('传 tip：label 文字右侧自动出现问号图标，悬停解释内容等于 tip', () => {
    const wrapper = mount(WdFormItem, {
      props: { label: '手机号', prop: 'phone', tip: '用于登录/找回账号的绑定手机号' },
      slots: { default: h('input') },
      global: { stubs }
    })

    expect(wrapper.classes()).toContain('is-help')
    const labelEl = wrapper.find('.el-form-item__label-stub')
    expect(labelEl.text()).toContain('手机号')
    // label 右侧出现带问号的图标区，悬停触发 el-tooltip（content=tip）
    const tipEl = wrapper.find('.wd-form-item__tip')
    expect(tipEl.exists()).toBe(true)
    expect(wrapper.find('.el-icon-stub').exists()).toBe(true)
    const tooltip = wrapper.find('.el-tooltip-stub')
    expect(tooltip.exists()).toBe(true)
    expect(tooltip.attributes('data-content')).toBe('用于登录/找回账号的绑定手机号')
    wrapper.unmount()
  })

  it('支持 #label 插槽覆盖默认 label 文字', () => {
    const wrapper = mount(WdFormItem, {
      props: { label: '姓名', tip: '模糊匹配' },
      slots: { label: '<b>自定义标签</b>' },
      global: { stubs }
    })

    expect(wrapper.find('.el-form-item__label-stub .wd-form-item__title b').text()).toBe('自定义标签')
    wrapper.unmount()
  })
})
