import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import WdSelect from '../inputs/Select.vue'
import WdCheckboxList from '../inputs/CheckboxList.vue'
import WdRadioList from '../inputs/RadioList.vue'

/* ---------- ElementPlus 桩：仅渲染插槽，便于断言 tooltip ---------- */
const passthrough = (name: string, withContent = false) =>
  defineComponent({
    name,
    setup(_, { slots, attrs }) {
      return () =>
        h(
          'div',
          { class: name, ...(withContent ? { 'data-content': attrs.content as string } : {}) },
          slots.default?.()
        )
    }
  })

const ElSelect = passthrough('el-select')
const ElOption = passthrough('el-option')
const ElIcon = passthrough('el-icon')
const ElCheckboxGroup = passthrough('el-checkbox-group')
const ElCheckbox = passthrough('el-checkbox')
const ElCheckboxButton = passthrough('el-checkbox-button')
const ElRadioGroup = passthrough('el-radio-group')
const ElRadio = passthrough('el-radio')
const ElRadioButton = passthrough('el-radio-button')
const ElTooltip = defineComponent({
  name: 'el-tooltip',
  setup(_, { slots, attrs }) {
    return () => h('span', { class: 'opt-tooltip', 'data-content': attrs.content as string }, slots.default?.())
  }
})

const stubs = {
  'el-select': ElSelect,
  'el-option': ElOption,
  'el-icon': ElIcon,
  'el-tooltip': ElTooltip,
  'el-checkbox-group': ElCheckboxGroup,
  'el-checkbox': ElCheckbox,
  'el-checkbox-button': ElCheckboxButton,
  'el-radio-group': ElRadioGroup,
  'el-radio': ElRadio,
  'el-radio-button': ElRadioButton
}

const globalOpts = {
  stubs,
  directives: { loading: { mounted() {}, updated() {} } }
}

const dataSource = [
  { value: 1, text: '普通用户', tips: '' },
  { value: 2, text: '管理员', tips: '拥有全部权限，请谨慎分配' }
]

describe('选项 tips 悬停提示（默认 tipsProp=tips）', () => {
  it('WdSelect：仅含 tips 的选项右侧渲染帮助图标，tooltip 内容等于 tips', async () => {
    const wrapper = mount(WdSelect, {
      props: { dataSource },
      global: globalOpts
    })
    await nextTick()

    const tips = wrapper.findAll('.opt-tooltip')
    expect(tips).toHaveLength(1)
    expect(tips[0].attributes('data-content')).toBe('拥有全部权限，请谨慎分配')
    // tooltip 只包裹帮助图标，选项文本在其外层独立渲染
    expect(tips[0].find('.wd-option-tip').exists()).toBe(true)
    expect(tips[0].text()).not.toContain('管理员')
    expect(wrapper.text()).toContain('管理员')
    // 无 tips 选项直接渲染文本、无图标
    expect(wrapper.text()).toContain('普通用户')
    expect(wrapper.findAll('.wd-option-tip')).toHaveLength(1)
    wrapper.unmount()
  })

  it('WdCheckboxList：含 tips 的选项包裹 tooltip（默认样式与按钮样式一致）', async () => {
    const wrapper = mount(WdCheckboxList, {
      props: { dataSource },
      global: globalOpts
    })
    await nextTick()
    expect(wrapper.findAll('.opt-tooltip')).toHaveLength(1)
    expect(wrapper.find('.opt-tooltip').attributes('data-content')).toBe('拥有全部权限，请谨慎分配')
    wrapper.unmount()

    const btn = mount(WdCheckboxList, {
      props: { dataSource, buttonStyle: true },
      global: globalOpts
    })
    await nextTick()
    expect(btn.findAll('.opt-tooltip')).toHaveLength(1)
    btn.unmount()
  })

  it('WdRadioList：含 tips 的选项包裹 tooltip（默认样式与按钮样式一致）', async () => {
    const wrapper = mount(WdRadioList, {
      props: { dataSource },
      global: globalOpts
    })
    await nextTick()
    expect(wrapper.findAll('.opt-tooltip')).toHaveLength(1)
    expect(wrapper.find('.opt-tooltip').attributes('data-content')).toBe('拥有全部权限，请谨慎分配')
    wrapper.unmount()

    const btn = mount(WdRadioList, {
      props: { dataSource, buttonStyle: true },
      global: globalOpts
    })
    await nextTick()
    expect(btn.findAll('.opt-tooltip')).toHaveLength(1)
    btn.unmount()
  })

  it('支持 tipsProp 自定义解包字段名', async () => {
    const custom = [
      { id: 1, name: '访客', remark: '仅可查看，不可编辑' },
      { id: 2, name: '编辑', remark: '' }
    ]
    const wrapper = mount(WdSelect, {
      props: {
        dataSource: custom,
        valueProp: 'id',
        textProp: 'name',
        tipsProp: 'remark'
      },
      global: globalOpts
    })
    await nextTick()

    const tips = wrapper.findAll('.opt-tooltip')
    expect(tips).toHaveLength(1)
    expect(tips[0].attributes('data-content')).toBe('仅可查看，不可编辑')
    expect(tips[0].text()).not.toContain('访客')
    expect(wrapper.text()).toContain('访客')
    expect(wrapper.findAll('.wd-option-tip')).toHaveLength(1)
    wrapper.unmount()
  })
})
