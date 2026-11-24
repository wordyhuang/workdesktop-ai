import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import WdTips from '../styles/Tips.vue'

/* ---------- ElementPlus 桩：透传 attrs 到根元素 ---------- */
const ElIcon = defineComponent({
  name: 'el-icon',
  inheritAttrs: false,
  setup(_, { slots, attrs }) {
    return () => h('span', attrs, slots.default?.())
  }
})
const ElTooltip = defineComponent({
  name: 'el-tooltip',
  setup(_, { slots }) {
    return () => h('span', slots.default?.())
  }
})

const mountTips = (props: Record<string, unknown> = {}, slots: Record<string, string> = {}) =>
  mount(WdTips, {
    props,
    slots,
    global: { stubs: { 'el-icon': ElIcon, 'el-tooltip': ElTooltip } }
  })

const styleOf = (wrapper: ReturnType<typeof mountTips>) =>
  wrapper.find('.wd-tips__box').attributes('style') || ''

describe('WdTips bgType=auto 语义背景', () => {
  it('bgType 默认 none：box 无背景样式与填充内边距类', () => {
    const wrapper = mountTips({ type: 'box', tips: '默认无背景' })
    expect(wrapper.find('.wd-tips__box').classes()).not.toContain('wd-tips__box--filled')
    expect(styleOf(wrapper)).not.toContain('background')
  })

  it('bgType=auto + WarningFilled：warning 语义浅底与橙色文字', () => {
    const wrapper = mountTips({ type: 'box', bgType: 'auto', icon: 'WarningFilled', tips: '警告' })
    expect(wrapper.find('.wd-tips__box').classes()).toContain('wd-tips__box--filled')
    const style = styleOf(wrapper)
    expect(style).toContain('var(--wd-color-warning')
    expect(style).toContain('color-mix')
  })

  it('bgType=auto + QuestionFilled：主色语义浅底', () => {
    const wrapper = mountTips({ type: 'box', bgType: 'auto', icon: 'QuestionFilled', tips: '疑问' })
    const style = styleOf(wrapper)
    expect(style).toContain('var(--wd-color-primary')
    expect(style).toContain('color-mix')
  })

  it('bgType=auto + InfoFilled：info 语义浅底', () => {
    const wrapper = mountTips({ type: 'box', bgType: 'auto', tips: '信息' })
    const style = styleOf(wrapper)
    expect(style).toContain('var(--wd-color-info, #909399)')
    expect(style).toContain('color-mix')
  })

  it('bgType=auto + 显式 color：背景与文字都取该颜色', () => {
    const wrapper = mountTips({ type: 'box', bgType: 'auto', color: '#123456', tips: '自定义' })
    const style = styleOf(wrapper)
    expect(style).toContain('#123456')
    expect(style).toContain('color-mix')
    expect(style).not.toContain('var(--wd-color-info')
  })

  it('bgType=auto 下 word 模式图标颜色跟随 icon 语义', () => {
    const wrapper = mountTips({ bgType: 'auto', icon: 'WarningFilled', tips: '警告' })
    const iconStyle = wrapper.find('.wd-tips__icon').attributes('style') || ''
    expect(iconStyle).toContain('var(--wd-color-warning')
  })

  it('未开启 auto 时 bg=primary 行为不变', () => {
    const wrapper = mountTips({ type: 'box', bg: 'primary', tips: '主题浅底' })
    const style = styleOf(wrapper)
    expect(style).toContain('var(--wd-color-primary)')
    expect(wrapper.find('.wd-tips__box').classes()).toContain('wd-tips__box--filled')
    expect(wrapper.find('.wd-tips__box').classes()).not.toContain('wd-tips__box--auto')
  })

  it('未开启 auto 时默认文字颜色仍为信息灰', () => {
    const wrapper = mountTips({ type: 'box', tips: '默认灰' })
    const style = styleOf(wrapper)
    expect(style.includes('#909399') || style.includes('rgb(144, 147, 153)')).toBe(true)
  })
})
