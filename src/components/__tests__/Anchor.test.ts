import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import WdAnchor from '../styles/Anchor.vue'

beforeEach(() => {
  document.body.querySelectorAll('.anchor-test-host').forEach((el) => el.remove())
})

const buildHost = () => {
  const host = document.createElement('div')
  host.className = 'anchor-test-host'
  host.innerHTML =
    '<h1>产品管理</h1><p>简介</p><h2>基本信息</h2><p>内容</p><h3>规格参数</h3><p>内容</p><h3>价格库存</h3><p>内容</p><h2>上架信息</h2><p>内容</p>'
  document.body.appendChild(host)
  return host
}

const mountAnchor = async (props: any = {}, host?: HTMLElement, attach = false) => {
  const target = host || buildHost()
  const wrapper = mount(WdAnchor, {
    props: { container: target, ...props },
    attachTo: attach ? target : document.body
  })
  await nextTick()
  return wrapper
}

const itemTexts = (wrapper: any) =>
  // dot 模式（默认）下文字 span 不渲染，从 data-title 取真实标题；
  // dot=false 时 data-title 也同步可用，统一用 data-title 读取更稳定
  wrapper.findAll('.wd-anchor__item').map((w: any) => w.attributes('data-title'))

// 用例 helper：默认 collapsed，测试列表渲染前先展开
const expandAnchor = async (wrapper: any) => {
  await wrapper.find('.wd-anchor__toggle').trigger('click')
  await nextTick()
}

describe('WdAnchor 默认形态', () => {
  it('默认收起：仅显示触发按钮，不渲染列表', async () => {
    const wrapper = await mountAnchor()
    expect(wrapper.find('.wd-anchor__toggle').exists()).toBe(true)
    expect(wrapper.find('.wd-anchor__list').exists()).toBe(false)
    expect(wrapper.find('.wd-anchor').attributes('data-expanded')).toBe('false')
    wrapper.unmount()
  })

  it('默认 dot=true：圆点模式开启，文字 span 不渲染', async () => {
    const wrapper = await mountAnchor()
    expect(wrapper.find('.wd-anchor').attributes('data-dot')).toBe('true')
    wrapper.unmount()
  })

  it('v-model:expanded 受控：点击触发按钮切换并抛出 update:expanded', async () => {
    const wrapper = await mountAnchor()
    await wrapper.find('.wd-anchor__toggle').trigger('click')
    const updates = wrapper.emitted('update:expanded')
    expect(updates).toBeTruthy()
    expect(updates!.at(-1)[0]).toBe(true)
    await wrapper.setProps({ expanded: true })
    expect(wrapper.find('.wd-anchor').attributes('data-expanded')).toBe('true')
    expect(wrapper.find('.wd-anchor__list').exists()).toBe(true)
    wrapper.unmount()
  })

  it('#toggle 插槽：自定义触发按钮内容', async () => {
    const wrapper = mount(WdAnchor, {
      props: { container: document.body },
      slots: { toggle: '<span class="my-toggle-icon">NAV</span>' }
    })
    await nextTick()
    expect(wrapper.find('.wd-anchor__toggle .my-toggle-icon').text()).toBe('NAV')
    wrapper.unmount()
  })

  it('toggleText 传入时按钮显示文字（覆盖默认图标）', async () => {
    const wrapper = mount(WdAnchor, {
      props: { container: document.body, toggleText: '目录' }
    })
    await nextTick()
    const text = wrapper.find('.wd-anchor__toggle-text')
    expect(text.exists()).toBe(true)
    expect(text.text()).toBe('目录')
    expect(wrapper.find('.wd-anchor__toggle-icon').exists()).toBe(false)
    wrapper.unmount()
  })

  it('toggleTextDirection=vertical 时按钮文字 data-direction=vertical', async () => {
    const wrapper = mount(WdAnchor, {
      props: { container: document.body, toggleText: '导航', toggleTextDirection: 'vertical' }
    })
    await nextTick()
    expect(wrapper.find('.wd-anchor__toggle-text').attributes('data-direction')).toBe('vertical')
    wrapper.unmount()
  })
})

describe('WdAnchor 标题解析与列表渲染', () => {
  it('渲染容器内全部 h1~h4 标题（按文档顺序）', async () => {
    const wrapper = await mountAnchor()
    await expandAnchor(wrapper)
    expect(itemTexts(wrapper)).toEqual(['产品管理', '基本信息', '规格参数', '价格库存', '上架信息'])
    wrapper.unmount()
  })

  it('max-level 过滤：仅显示 ≤ 指定层级的标题', async () => {
    const wrapper = await mountAnchor({ maxLevel: 2 })
    await expandAnchor(wrapper)
    expect(itemTexts(wrapper)).toEqual(['产品管理', '基本信息', '上架信息'])
    wrapper.unmount()
  })

  it('渲染层级缩进样式类（h1=0 / h2=1 / h3=2）', async () => {
    const wrapper = await mountAnchor()
    await expandAnchor(wrapper)
    const indents = wrapper.findAll('.wd-anchor__item').map((w: any) => w.attributes('data-level'))
    expect(indents).toEqual(['1', '2', '3', '3', '2'])
    wrapper.unmount()
  })

  it('空标题列表时不渲染任何列表项', async () => {
    const host = document.createElement('div')
    host.className = 'anchor-test-host'
    host.innerHTML = '<p>没有标题</p>'
    document.body.appendChild(host)
    const wrapper = await mountAnchor({}, host)
    await expandAnchor(wrapper)
    expect(wrapper.findAll('.wd-anchor__item')).toHaveLength(0)
    wrapper.unmount()
  })
})

describe('WdAnchor 滚动高亮', () => {
  it('happy-dom 矩形全 0 → 默认高亮第一个标题', async () => {
    const wrapper = await mountAnchor()
    await expandAnchor(wrapper)
    const active = wrapper.findAll('.wd-anchor__item.is-active').map((w: any) => w.attributes('data-title'))
    expect(active).toEqual(['产品管理'])
    wrapper.unmount()
  })

  it('激活项变化时抛出 change 事件（携带当前标题）', async () => {
    const wrapper = await mountAnchor()
    await expandAnchor(wrapper)
    const state = (wrapper.vm as any).$.setupState
    state.activeIndex = 2
    await nextTick()
    const change = wrapper.emitted('change')
    expect(change).toBeTruthy()
    expect(change!.at(-1)[0].title).toBe('规格参数')
    wrapper.unmount()
  })
})

describe('WdAnchor 点击跳转', () => {
  it('点击列表项抛出 item-click 并调用容器滚动到目标标题', async () => {
    const host = buildHost()
    const wrapper = await mountAnchor({}, host)
    await expandAnchor(wrapper)
    // 元素级容器（非 body）→ 组件调用容器自身 scrollTo
    const scrollSpy = vi.spyOn(host, 'scrollTo').mockImplementation(() => {})
    await wrapper.findAll('.wd-anchor__item')[1].trigger('click')
    expect(scrollSpy).toHaveBeenCalled()
    const clicked = wrapper.emitted('item-click')![0][0] as any
    expect(clicked.title).toBe('基本信息')
    scrollSpy.mockRestore()
    wrapper.unmount()
  })
})

describe('WdAnchor 自激防护', () => {
  it('Anchor 自身内部 DOM 变动不触发标题重扫', async () => {
    const host = buildHost()
    const wrapper = mount(WdAnchor, {
      props: { container: host },
      attachTo: host
    })
    await nextTick()
    const state = (wrapper.vm as any).$.setupState
    const before = state.headings
    const span = document.createElement('span')
    wrapper.element.appendChild(span)
    await nextTick(); await nextTick()
    span.remove()
    await nextTick(); await nextTick()
    expect(state.headings).toBe(before)
    wrapper.unmount()
  })

  it('容器内新增标题节点时触发重扫', async () => {
    const host = buildHost()
    const wrapper = await mountAnchor({}, host)
    const state = (wrapper.vm as any).$.setupState
    const before = state.headings
    const h2 = document.createElement('h2')
    h2.textContent = '新章节'
    host.appendChild(h2)
    await nextTick(); await nextTick()
    expect(state.headings).not.toBe(before)
    expect(state.headings).toHaveLength(before.length + 1)
    wrapper.unmount()
  })
})

describe('WdAnchor 悬浮定位与方法', () => {
  it('默认 position=fixed（右侧中部悬浮），可切换 absolute', async () => {
    const wrapper = await mountAnchor()
    expect(wrapper.find('.wd-anchor').attributes('data-position')).toBe('fixed')
    await wrapper.setProps({ position: 'absolute' })
    expect(wrapper.find('.wd-anchor').attributes('data-position')).toBe('absolute')
    wrapper.unmount()
  })

  it('refresh() 方法可手动重扫标题', async () => {
    const host = buildHost()
    const wrapper = await mountAnchor({}, host)
    const state = (wrapper.vm as any).$.setupState
    const before = state.headings
    const h2 = document.createElement('h2')
    h2.textContent = '手动刷新章节'
    host.appendChild(h2)
    state.refresh()
    await nextTick()
    expect(state.headings).not.toBe(before)
    expect(state.headings.some((h: any) => h.title === '手动刷新章节')).toBe(true)
    wrapper.unmount()
  })
})

describe('WdAnchor 手动 items 模式', () => {
  it('items 传入后不扫描容器标题，直接渲染手动列表', async () => {
    const host = buildHost()
    const items = [
      { title: '首页', level: 1 },
      { title: '账户设置', level: 2 },
      { title: '安全中心', level: 3 },
    ]
    const wrapper = await mountAnchor({ items }, host)
    await expandAnchor(wrapper)
    expect(itemTexts(wrapper)).toEqual(['首页', '账户设置', '安全中心'])
    wrapper.unmount()
  })

  it('items 模式点击项只抛 item-click（不自动滚动），切换 items 时列表更新', async () => {
    const host = buildHost()
    const scrollSpy = vi.spyOn(host, 'scrollTo').mockImplementation(() => {})
    const wrapper = await mountAnchor({ items: [{ title: 'A', level: 1 }] }, host)
    await expandAnchor(wrapper)
    await wrapper.findAll('.wd-anchor__item')[0].trigger('click')
    expect(wrapper.emitted('item-click')!.at(-1)[0].title).toBe('A')
    expect(scrollSpy).not.toHaveBeenCalled()
    await wrapper.setProps({ items: [{ title: 'B', level: 1 }] })
    expect(itemTexts(wrapper)).toEqual(['B'])
    scrollSpy.mockRestore()
    wrapper.unmount()
  })

  it('items 支持 JSON 字符串', async () => {
    const wrapper = await mountAnchor({ items: '[{"title":"JSON-1","level":1},{"title":"JSON-2","level":2}]' })
    await expandAnchor(wrapper)
    expect(itemTexts(wrapper)).toEqual(['JSON-1', 'JSON-2'])
    wrapper.unmount()
  })
})

describe('WdAnchor 位置 placement', () => {
  it('默认 placement=right，支持 left / top / bottom', async () => {
    const wrapper = await mountAnchor()
    expect(wrapper.find('.wd-anchor').attributes('data-placement')).toBe('right')
    await wrapper.setProps({ placement: 'left' })
    expect(wrapper.find('.wd-anchor').attributes('data-placement')).toBe('left')
    await wrapper.setProps({ placement: 'top' })
    expect(wrapper.find('.wd-anchor').attributes('data-placement')).toBe('top')
    await wrapper.setProps({ placement: 'bottom' })
    expect(wrapper.find('.wd-anchor').attributes('data-placement')).toBe('bottom')
    wrapper.unmount()
  })
})

describe('WdAnchor 圆点模式', () => {
  it('dot=false 时显示文字 span', async () => {
    const wrapper = await mountAnchor({ dot: false })
    await expandAnchor(wrapper)
    expect(wrapper.find('.wd-anchor').attributes('data-dot')).toBe('false')
    expect(wrapper.find('.wd-anchor__text').exists()).toBe(true)
    wrapper.unmount()
  })

  it('dot=true 时文字 span 不渲染，但 li 携带 data-title 供悬停 tooltip 读取', async () => {
    const wrapper = await mountAnchor()
    await expandAnchor(wrapper)
    expect(wrapper.find('.wd-anchor').attributes('data-dot')).toBe('true')
    expect(wrapper.find('.wd-anchor__text').exists()).toBe(false)
    // li 必须带 data-title（CSS ::after attr(data-title) 的数据来源）
    const items = wrapper.findAll('.wd-anchor__item')
    expect(items.length).toBeGreaterThan(0)
    expect(items[0].attributes('data-title')).toBe('产品管理')
    // 列表根节点携带 data-dot=true，CSS 据此启用悬停 tooltip
    expect(wrapper.find('.wd-anchor').attributes('data-dot')).toBe('true')
    wrapper.unmount()
  })
})

describe('WdAnchor filter 联动', () => {
  it('同 filter 组 Anchor 实例可被跨组件 setAnchorItems / notifyAnchorChange 驱动', async () => {
    const { registerAnchorInstance, setAnchorItems, notifyAnchorChange, getAnchorItems } = await import(
      '../../lib/core/anchor-linkage'
    )
    const host = buildHost()
    const wrapper = await mountAnchor({ filter: 'demo-linkage' }, host)
    await nextTick()
    // 业务代码跨组件指定菜单内容
    const n = setAnchorItems('demo-linkage', [
      { title: '跨组菜单-1', level: 1 },
      { title: '跨组菜单-2', level: 2 },
    ])
    expect(n).toBe(1)
    await nextTick()
    await expandAnchor(wrapper)
    expect(itemTexts(wrapper)).toEqual(['跨组菜单-1', '跨组菜单-2'])
    // 通知刷新
    const notified = notifyAnchorChange('demo-linkage')
    expect(notified).toBe(1)
    // 读取当前菜单
    const items = getAnchorItems('demo-linkage')
    expect(items).toHaveLength(2)
    wrapper.unmount()
  })
})
