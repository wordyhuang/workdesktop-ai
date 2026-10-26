import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import WdPanel from '../styles/Panel.vue'

function mountPanel(props: Record<string, unknown> = {}) {
  return mount(WdPanel, {
    props: { title: '基础信息', description: '产品核心字段', ...props }
  })
}

describe('WdPanel description 展示模式', () => {
  it('默认（显示展示）：description 正常显示，标题无虚线', async () => {
    const wrapper = mountPanel()
    await nextTick()
    const desc = wrapper.find('.wd-panel__description')
    const title = wrapper.find('.wd-panel__title')
    expect(desc.exists()).toBe(true)
    expect(desc.text()).toBe('产品核心字段')
    // 默认=显示展示 → 不带折叠态类
    expect(desc.classes('is-folding')).toBe(false)
    expect(title.classes('is-dashed')).toBe(false)
    wrapper.unmount()
  })

  it('descriptionExpandable=true：description 折叠（is-folding），标题出现虚线（is-dashed）', async () => {
    const wrapper = mountPanel({ descriptionExpandable: true })
    await nextTick()
    const desc = wrapper.find('.wd-panel__description')
    const title = wrapper.find('.wd-panel__title')
    expect(desc.exists()).toBe(true)
    expect(desc.classes('is-folding')).toBe(true)
    expect(title.classes('is-dashed')).toBe(true)
    wrapper.unmount()
  })

  it('description 为空时两个模式都不渲染 description', async () => {
    const wrapper = mountPanel({ description: '' })
    await nextTick()
    expect(wrapper.find('.wd-panel__description').exists()).toBe(false)
    wrapper.unmount()
  })
})