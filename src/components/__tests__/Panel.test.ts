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

function mockContentHeight(wrapper: ReturnType<typeof mountPanel>, height: number) {
  const inner = wrapper.find('.wd-panel__content-inner').element as HTMLElement
  Object.defineProperty(inner, 'scrollHeight', { value: height, configurable: true })
}

describe('WdPanel descriptionAlign 描述对齐', () => {
  it("默认 'left'：description 紧跟标题（无 is-right，DOM 在 title 之后）", async () => {
    const wrapper = mountPanel()
    await nextTick()
    const desc = wrapper.find('.wd-panel__description')
    expect(desc.classes('is-right')).toBe(false)
    const titleEl = wrapper.find('.wd-panel__title').element
    // FOLLOWING：desc 在 title 之后（顺序不受对齐影响）
    expect(
      titleEl.compareDocumentPosition(desc.element) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
    wrapper.unmount()
  })

  it("descriptionAlign='right'：description 标记 is-right（靠右侧空白区右端），DOM 顺序不变", async () => {
    const wrapper = mountPanel({ descriptionAlign: 'right' })
    await nextTick()
    const desc = wrapper.find('.wd-panel__description')
    expect(desc.classes('is-right')).toBe(true)
    const titleEl = wrapper.find('.wd-panel__title').element
    expect(
      titleEl.compareDocumentPosition(desc.element) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
    wrapper.unmount()
  })

  it("right 与 descriptionExpandable=true 组合：对齐与悬停折叠互不影响", async () => {
    const wrapper = mountPanel({ descriptionAlign: 'right', descriptionExpandable: true })
    await nextTick()
    const desc = wrapper.find('.wd-panel__description')
    expect(desc.classes('is-right')).toBe(true)
    expect(desc.classes('is-folding')).toBe(true)
    expect(wrapper.find('.wd-panel__title').classes('is-dashed')).toBe(true)
    wrapper.unmount()
  })
})

async function settle() {
  await nextTick()
  await nextTick()
}

describe('WdPanel collapseHeight 内容超限自动折叠', () => {
  it('默认 collapseHeight=0：内容再高也不自动折叠', async () => {
    const wrapper = mountPanel({ collapsible: true })
    mockContentHeight(wrapper, 2000)
    await settle()
    expect(wrapper.find('.wd-panel__content').classes('is-collapsed')).toBe(false)
    expect(wrapper.find('.wd-panel__header').attributes('aria-expanded')).toBe('true')
    wrapper.unmount()
  })

  it('collapsible=true 且内容高于 collapseHeight：自动折叠并触发事件', async () => {
    const wrapper = mountPanel({ collapsible: true, collapseHeight: 100 })
    mockContentHeight(wrapper, 400)
    await settle()
    expect(wrapper.find('.wd-panel__content').classes('is-collapsed')).toBe(true)
    expect(wrapper.find('.wd-panel__header').attributes('aria-expanded')).toBe('false')
    expect(wrapper.emitted('update:opened')?.[0]).toEqual([false])
    expect(wrapper.emitted('change')?.[0]).toEqual([false])
    wrapper.unmount()
  })

  it('内容不高于 collapseHeight：保持展开', async () => {
    const wrapper = mountPanel({ collapsible: true, collapseHeight: 100 })
    mockContentHeight(wrapper, 80)
    await settle()
    expect(wrapper.find('.wd-panel__content').classes('is-collapsed')).toBe(false)
    expect(wrapper.emitted('update:opened')).toBeUndefined()
    wrapper.unmount()
  })

  it('未开启 collapsible：即使内容超限也不自动折叠', async () => {
    const wrapper = mountPanel({ collapseHeight: 100 })
    mockContentHeight(wrapper, 400)
    await settle()
    expect(wrapper.find('.wd-panel__content').classes('is-collapsed')).toBe(false)
    expect(wrapper.emitted('update:opened')).toBeUndefined()
    wrapper.unmount()
  })

  it('初始 opened=false：保持折叠且不重复触发事件', async () => {
    const wrapper = mountPanel({ collapsible: true, collapseHeight: 100, opened: false })
    mockContentHeight(wrapper, 400)
    await settle()
    expect(wrapper.find('.wd-panel__content').classes('is-collapsed')).toBe(true)
    expect(wrapper.emitted('update:opened')).toBeUndefined()
    wrapper.unmount()
  })
})