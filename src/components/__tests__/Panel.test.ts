import { describe, it, expect, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
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

describe('WdPanel 样式默认值', () => {
  it('margin-bottom 默认 6px（--wd-panel-margin-bottom 未设置时的出厂回退值）', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/components/styles/Panel.vue'), 'utf-8')
    expect(source).toContain('margin-bottom: var(--wd-panel-margin-bottom, 6px)')
  })
})

describe('WdPanel fullscreenable 专注模式（原地全屏）', () => {
  let wrappers: Array<{ unmount: () => void }> = []

  afterEach(() => {
    wrappers.forEach((w) => w.unmount())
    wrappers = []
    document.body.style.overflow = ''
  })

  function mountFullscreen(props: Record<string, unknown> = {}, slots: Record<string, unknown> = {}) {
    const wrapper = mount(WdPanel, {
      props: { title: '专注面板', ...props },
      slots
    })
    wrappers.push(wrapper)
    return wrapper
  }

  it('fullscreenable 默认 false：不渲染全屏触发按钮（普通面板行为不变）', () => {
    const wrapper = mountFullscreen()
    expect(wrapper.find('.wd-panel__fullscreen-trigger').exists()).toBe(false)
    expect(wrapper.find('.wd-panel').classes()).not.toContain('is-fullscreen')
    // 未开启时也不渲染全屏遮罩（teleport 节点）
    expect(document.querySelector('.wd-panel__fullscreen-mask')).toBeNull()
  })

  it('fullscreenable=true：右上角渲染全屏触发按钮（aria-label 进入全屏，位于头部操作区）', () => {
    const wrapper = mountFullscreen({ fullscreenable: true })
    const trigger = wrapper.find('.wd-panel__fullscreen-trigger')
    expect(trigger.exists()).toBe(true)
    expect(trigger.attributes('aria-label')).toBe('进入全屏')
    expect(trigger.attributes('role')).toBe('button')
    expect(trigger.element.closest('.wd-panel__header-extra')).toBeTruthy()
  })

  it('点击全屏按钮：进入全屏（根 is-fullscreen + 事件 + 锁定页面滚动 + 遮罩激活）', async () => {
    const wrapper = mountFullscreen({ fullscreenable: true })
    await wrapper.find('.wd-panel__fullscreen-trigger').trigger('click')
    await settle()
    expect(wrapper.find('.wd-panel').classes()).toContain('is-fullscreen')
    expect(wrapper.emitted('update:fullscreen')).toEqual([[true]])
    expect(wrapper.emitted('fullscreen-change')).toEqual([[true]])
    expect(document.body.style.overflow).toBe('hidden')
    expect(wrapper.find('.wd-panel__fullscreen-trigger').attributes('aria-label')).toBe('退出全屏')
    // 遮罩节点 teleport 到 body 且标记激活
    const mask = document.querySelector('.wd-panel__fullscreen-mask')
    expect(mask).toBeTruthy()
    expect(mask?.classList.contains('is-active')).toBe(true)
  })

  it('全屏态再点击关闭按钮：退出全屏并恢复页面滚动', async () => {
    const wrapper = mountFullscreen({ fullscreenable: true })
    await wrapper.find('.wd-panel__fullscreen-trigger').trigger('click')
    await settle()
    await wrapper.find('.wd-panel__fullscreen-trigger').trigger('click')
    await settle()
    expect(wrapper.find('.wd-panel').classes()).not.toContain('is-fullscreen')
    const emitted = wrapper.emitted('update:fullscreen') as unknown[][] | undefined
    expect(emitted?.[emitted.length - 1]).toEqual([false])
    expect(document.body.style.overflow).toBe('')
    expect(wrapper.find('.wd-panel__fullscreen-trigger').attributes('aria-label')).toBe('进入全屏')
  })

  it('受控模式：fullscreen prop 切换驱动全屏态与滚动锁定', async () => {
    const wrapper = mountFullscreen({ fullscreenable: true })
    expect(wrapper.find('.wd-panel').classes()).not.toContain('is-fullscreen')
    await wrapper.setProps({ fullscreen: true })
    await settle()
    expect(wrapper.find('.wd-panel').classes()).toContain('is-fullscreen')
    expect(document.body.style.overflow).toBe('hidden')
    await wrapper.setProps({ fullscreen: false })
    await settle()
    expect(wrapper.find('.wd-panel').classes()).not.toContain('is-fullscreen')
    expect(document.body.style.overflow).toBe('')
  })

  it('初始 fullscreen=true：挂载后直接进入全屏', async () => {
    const wrapper = mountFullscreen({ fullscreenable: true, fullscreen: true })
    await settle()
    expect(wrapper.find('.wd-panel').classes()).toContain('is-fullscreen')
    expect(document.body.style.overflow).toBe('hidden')
    expect(wrapper.emitted('fullscreen-change')).toEqual([[true]])
  })

  it('暴露方法：toggleFullscreen / enterFullscreen / exitFullscreen', async () => {
    const wrapper = mountFullscreen({ fullscreenable: true })
    await (wrapper.vm as unknown as { toggleFullscreen: () => void }).toggleFullscreen()
    await settle()
    expect(wrapper.find('.wd-panel').classes()).toContain('is-fullscreen')
    await (wrapper.vm as unknown as { exitFullscreen: () => void }).exitFullscreen()
    await settle()
    expect(wrapper.find('.wd-panel').classes()).not.toContain('is-fullscreen')
    await (wrapper.vm as unknown as { enterFullscreen: () => void }).enterFullscreen()
    await settle()
    expect(wrapper.find('.wd-panel').classes()).toContain('is-fullscreen')
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('extra 插槽内容与全屏按钮共存于头部操作区', () => {
    const wrapper = mountFullscreen(
      { fullscreenable: true },
      { extra: '<button class="slot-extra">自定义操作</button>' }
    )
    expect(wrapper.find('.wd-panel__header-extra .slot-extra').exists()).toBe(true)
    expect(wrapper.find('.wd-panel__header-extra .wd-panel__fullscreen-trigger').exists()).toBe(true)
  })

  it('卸载清理：全屏态卸载组件后恢复页面滚动、遮罩节点移除', async () => {
    const wrapper = mountFullscreen({ fullscreenable: true })
    await wrapper.find('.wd-panel__fullscreen-trigger').trigger('click')
    await settle()
    expect(document.body.style.overflow).toBe('hidden')
    expect(document.querySelector('.wd-panel__fullscreen-mask')).toBeTruthy()
    wrapper.unmount()
    await settle()
    expect(document.body.style.overflow).toBe('')
    expect(document.querySelector('.wd-panel__fullscreen-mask')).toBeNull()
    wrappers = []
  })

  it('样式令牌：全屏层级与遮罩色使用 --wd-panel-fullscreen-* 变量', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/components/styles/Panel.vue'), 'utf-8')
    expect(source).toContain('--wd-panel-fullscreen-z-index')
    expect(source).toContain('--wd-panel-fullscreen-mask-color')
  })
})