import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import WdPanel from '../styles/Panel.vue'

/** 自定义图标组件（测试 icon 直传组件形态） */
const CustomIcon = defineComponent({
  name: 'CustomIcon',
  render: () => h('i', { class: 'custom-icon-mark' })
})

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

describe('WdPanel icon 标题图标', () => {
  it('默认不传 icon：不渲染标题图标，header 无 is-icon 类（保留品牌色标识条）', async () => {
    const wrapper = mountPanel()
    await nextTick()
    expect(wrapper.find('.wd-panel__title-icon').exists()).toBe(false)
    expect(wrapper.find('.wd-panel__header').classes('is-icon')).toBe(false)
    wrapper.unmount()
  })

  it("icon='Setting'（EP 图标名）：渲染标题图标，header 标记 is-icon（隐藏标识条）", async () => {
    const wrapper = mountPanel({ icon: 'Setting' })
    await nextTick()
    const iconEl = wrapper.find('.wd-panel__title-icon')
    expect(iconEl.exists()).toBe(true)
    expect(iconEl.find('svg').exists()).toBe(true)
    expect(wrapper.find('.wd-panel__header').classes('is-icon')).toBe(true)
    wrapper.unmount()
  })

  it("icon 为图标字体 class（'fa-solid fa-user'）：按 <i :class> 渲染", async () => {
    const wrapper = mountPanel({ icon: 'fa-solid fa-user' })
    await nextTick()
    const iconEl = wrapper.find('.wd-panel__title-icon')
    expect(iconEl.exists()).toBe(true)
    expect(iconEl.find('i.fa-solid.fa-user').exists()).toBe(true)
    expect(wrapper.find('.wd-panel__header').classes('is-icon')).toBe(true)
    wrapper.unmount()
  })

  it('icon 传组件：直接渲染该组件', async () => {
    const wrapper = mountPanel({ icon: CustomIcon })
    await nextTick()
    expect(wrapper.find('.wd-panel__title-icon .custom-icon-mark').exists()).toBe(true)
    wrapper.unmount()
  })

  it('icon 渲染在 title 之前（DOM 顺序），title/description 不受影响', async () => {
    const wrapper = mountPanel({ icon: 'Setting' })
    await nextTick()
    const iconEl = wrapper.find('.wd-panel__title-icon').element
    const titleEl = wrapper.find('.wd-panel__title').element
    expect(
      iconEl.compareDocumentPosition(titleEl) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
    expect(wrapper.find('.wd-panel__title').text()).toBe('基础信息')
    expect(wrapper.find('.wd-panel__description').exists()).toBe(true)
    wrapper.unmount()
  })
})

describe('WdPanel titleBar 标识条形态', () => {
  it("默认 'long'：header 无 is-short-bar 类（保持与头部同高的既有表现）", async () => {
    const wrapper = mountPanel()
    await nextTick()
    expect(wrapper.find('.wd-panel__header').classes('is-short-bar')).toBe(false)
    wrapper.unmount()
  })

  it("titleBar='long'：显式长条，header 无 is-short-bar 类", async () => {
    const wrapper = mountPanel({ titleBar: 'long' })
    await nextTick()
    expect(wrapper.find('.wd-panel__header').classes('is-short-bar')).toBe(false)
    wrapper.unmount()
  })

  it("titleBar='short'：header 标记 is-short-bar 类（短条与标题行同高）", async () => {
    const wrapper = mountPanel({ titleBar: 'short' })
    await nextTick()
    expect(wrapper.find('.wd-panel__header').classes('is-short-bar')).toBe(true)
    wrapper.unmount()
  })

  it("titleBar='short' 与 icon 组合：is-icon 仍标记（标识条隐藏优先，短条形态无视觉效果）", async () => {
    const wrapper = mountPanel({ titleBar: 'short', icon: 'Setting' })
    await nextTick()
    expect(wrapper.find('.wd-panel__header').classes('is-short-bar')).toBe(true)
    expect(wrapper.find('.wd-panel__header').classes('is-icon')).toBe(true)
    wrapper.unmount()
  })

  it("titleBar='short' 与 mode='card' 组合：card 类正常标记（card 下标识条隐藏，短条形态无效）", async () => {
    const wrapper = mountPanel({ titleBar: 'short', mode: 'card' })
    await nextTick()
    expect(wrapper.find('.wd-panel__header').classes('is-short-bar')).toBe(true)
    expect(wrapper.find('.wd-panel').classes('wd-panel--card')).toBe(true)
    wrapper.unmount()
  })
})

describe('WdPanel mode 卡片模式', () => {
  it("默认 mode='panel'：根元素无 wd-panel--card 类（保持既有面板表现）", async () => {
    const wrapper = mountPanel()
    await nextTick()
    expect(wrapper.find('.wd-panel').classes('wd-panel--card')).toBe(false)
    wrapper.unmount()
  })

  it("mode='card'：根元素标记 wd-panel--card 类", async () => {
    const wrapper = mountPanel({ mode: 'card' })
    await nextTick()
    expect(wrapper.find('.wd-panel').classes('wd-panel--card')).toBe(true)
    wrapper.unmount()
  })

  it("mode='card'：title 与 description 正常渲染，DOM 顺序 title 在前（视觉换行由样式实现）", async () => {
    const wrapper = mountPanel({ mode: 'card' })
    await nextTick()
    const titleEl = wrapper.find('.wd-panel__title').element
    const descEl = wrapper.find('.wd-panel__description').element
    expect(wrapper.find('.wd-panel__title').text()).toBe('基础信息')
    expect(wrapper.find('.wd-panel__description').text()).toBe('产品核心字段')
    expect(
      titleEl.compareDocumentPosition(descEl) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
    wrapper.unmount()
  })

  it("mode='card' 与 icon 组合：图标正常渲染，header 标记 is-icon", async () => {
    const wrapper = mountPanel({ mode: 'card', icon: 'Setting' })
    await nextTick()
    expect(wrapper.find('.wd-panel__title-icon svg').exists()).toBe(true)
    expect(wrapper.find('.wd-panel__header').classes('is-icon')).toBe(true)
    wrapper.unmount()
  })

  it("mode='card' 与 extra 插槽组合：extra 仍渲染在头部（与标题同行右侧）", async () => {
    const wrapper = mount(WdPanel, {
      props: { title: '账号信息', description: '用户基础资料', mode: 'card' },
      slots: { extra: '<button class="extra-mark">编辑资料</button>' }
    })
    await nextTick()
    expect(wrapper.find('.wd-panel__header-extra .extra-mark').exists()).toBe(true)
    wrapper.unmount()
  })
})

describe('WdPanel card 模式描述对齐', () => {
  it("mode='card' 默认 left：header-main 无 is-desc-inline（描述换行显示在标题下方）", async () => {
    const wrapper = mountPanel({ mode: 'card' })
    await nextTick()
    expect(wrapper.find('.wd-panel__header-main').classes('is-desc-inline')).toBe(false)
    expect(wrapper.find('.wd-panel__description').classes('is-right')).toBe(false)
    wrapper.unmount()
  })

  it("mode='card' + descriptionAlign='right'：header-main 标记 is-desc-inline（描述与标题同行、垂直居中），description 标记 is-right", async () => {
    const wrapper = mountPanel({ mode: 'card', descriptionAlign: 'right' })
    await nextTick()
    expect(wrapper.find('.wd-panel__header-main').classes('is-desc-inline')).toBe(true)
    expect(wrapper.find('.wd-panel__description').classes('is-right')).toBe(true)
    wrapper.unmount()
  })

  it("panel 模式 + descriptionAlign='right'：header-main 无 is-desc-inline（不影响既有同行贴右端表现）", async () => {
    const wrapper = mountPanel({ descriptionAlign: 'right' })
    await nextTick()
    expect(wrapper.find('.wd-panel__header-main').classes('is-desc-inline')).toBe(false)
    expect(wrapper.find('.wd-panel__description').classes('is-right')).toBe(true)
    wrapper.unmount()
  })
})