import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import WdPath from '../styles/Path.vue'
import {
  registerStation,
  notifyStationChange,
  clearStationRegistry,
  clearPathListeners
} from '../../lib/core/station-linkage'

/* ---------- ElementPlus 桩（默认透传 attrs，click 可落到根元素） ---------- */
const ElBreadcrumb = defineComponent({
  name: 'el-breadcrumb',
  setup(_, { slots }) {
    return () => h('div', { class: 'el-breadcrumb' }, slots.default?.())
  }
})
const ElBreadcrumbItem = defineComponent({
  name: 'el-breadcrumb-item',
  setup(_, { slots }) {
    return () => h('li', { class: 'el-breadcrumb-item' }, slots.default?.())
  }
})
const ElIcon = defineComponent({
  name: 'el-icon',
  setup(_, { slots }) {
    return () => h('i', { class: 'el-icon' }, slots.default?.())
  }
})

const stubs = { 'el-breadcrumb': ElBreadcrumb, 'el-breadcrumb-item': ElBreadcrumbItem, 'el-icon': ElIcon }

beforeEach(() => {
  clearStationRegistry()
  clearPathListeners()
  document.body.querySelectorAll('.path-test-host').forEach((el) => el.remove())
})

const itemTexts = (wrapper: any) =>
  wrapper.findAll('.el-breadcrumb-item').map((w: any) => w.text())

describe('WdPath 手动模式', () => {
  it('渲染 items 路径', () => {
    const wrapper = mount(WdPath, {
      props: { items: [{ title: '首页' }, { title: '用户管理' }, { title: '用户列表' }] },
      global: { stubs }
    })
    expect(itemTexts(wrapper)).toEqual(['首页', '用户管理', '用户列表'])
    wrapper.unmount()
  })

  it('items 支持 JSON 字符串（UMD 属性式写法）', () => {
    const wrapper = mount(WdPath, {
      props: { items: JSON.stringify([{ title: '首页' }, { title: '订单中心' }]) },
      global: { stubs }
    })
    expect(itemTexts(wrapper)).toEqual(['首页', '订单中心'])
    wrapper.unmount()
  })

  it('非法 JSON 回退空路径并告警', () => {
    const warn = vi.spyOn(console, 'error').mockImplementation(() => {})
    const wrapper = mount(WdPath, {
      props: { items: 'not-json' },
      global: { stubs }
    })
    expect(wrapper.findAll('.el-breadcrumb-item')).toHaveLength(0)
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
    wrapper.unmount()
  })

  it('挂载时发出初始 change，点击抛出 item-click', async () => {
    const wrapper = mount(WdPath, {
      props: { items: [{ title: '首页' }, { title: '用户管理' }] },
      global: { stubs }
    })
    const change = wrapper.emitted('change')
    expect(change).toBeTruthy()
    expect((change![0][0] as any[]).map((s) => s.title)).toEqual(['首页', '用户管理'])

    await wrapper.findAll('.el-breadcrumb-item')[1].trigger('click')
    const clicked = wrapper.emitted('item-click')![0][0] as any
    expect(clicked.title).toBe('用户管理')
    wrapper.unmount()
  })
})

describe('WdPath 内容变动动画', () => {
  it('默认 animation=none：不渲染动画容器（保持原始 DOM 结构）', () => {
    const wrapper = mount(WdPath, {
      props: { items: [{ title: '首页' }, { title: '用户管理' }] },
      global: { stubs }
    })
    expect(wrapper.find('.wd-path__anim').exists()).toBe(false)
    expect(wrapper.find('.wd-path').attributes('data-animation')).toBe('none')
    wrapper.unmount()
  })

  it('animation=fade：渲染动画容器并标记 data-animation=fade', () => {
    const wrapper = mount(WdPath, {
      props: { items: [{ title: '首页' }, { title: '用户管理' }], animation: 'fade' },
      global: { stubs }
    })
    const anim = wrapper.find('.wd-path__anim')
    expect(anim.exists()).toBe(true)
    expect(anim.attributes('data-animation')).toBe('fade')
    // 段仍正常渲染
    expect(itemTexts(wrapper)).toEqual(['首页', '用户管理'])
    wrapper.unmount()
  })

  it('animation=slide：标记 slide，items 变动后新段正确渲染（动画不影响内容）', async () => {
    const wrapper = mount(WdPath, {
      props: { items: [{ title: '首页' }, { title: '旧页面' }], animation: 'slide' },
      global: { stubs }
    })
    expect(wrapper.find('.wd-path__anim').attributes('data-animation')).toBe('slide')
    await wrapper.setProps({ items: [{ title: '首页' }, { title: '新页面' }] })
    await nextTick()
    expect(itemTexts(wrapper)).toEqual(['首页', '新页面'])
    wrapper.unmount()
  })
})

describe('WdPath 自动模式（Station 菜单链 + 页面标题）', () => {
  const buildHost = () => {
    const host = document.createElement('div')
    host.className = 'path-test-host'
    host.innerHTML =
      '<h1>产品管理</h1><p>简介</p><h2>基本信息</h2><p>内容</p><h3>规格参数</h3><p>内容</p><h2>上架信息</h2><p>内容</p>'
    document.body.appendChild(host)
    return host
  }

  const mountAuto = async (extra: any = {}, host?: HTMLElement) => {
    const wrapper = mount(WdPath, {
      props: { mode: 'auto', filter: 'g', container: host || buildHost(), ...extra },
      global: { stubs }
    })
    await nextTick()
    return wrapper
  }

  it('组装 首页 + 菜单链 + 当前标题链（happy-dom 矩形全 0 → 激活可视范围内第一个标题）', async () => {
    registerStation({
      filter: 'g',
      setFooterInfo: vi.fn(),
      refresh: vi.fn(),
      getActiveMenuChain: () => [{ title: '工作区' }, { title: '任务列表', path: '/work/tasks' }]
    })
    const wrapper = await mountAuto()
    // 可视范围内第一个标题为 h1「产品管理」→ 链 = 产品管理
    expect(itemTexts(wrapper)).toEqual(['首页', '工作区', '任务列表', '产品管理'])
    wrapper.unmount()
  })

  it('show-home=false 隐藏首页节点', async () => {
    registerStation({
      filter: 'g',
      setFooterInfo: vi.fn(),
      refresh: vi.fn(),
      getActiveMenuChain: () => [{ title: '工作区' }]
    })
    const wrapper = await mountAuto({ showHome: false })
    expect(itemTexts(wrapper)[0]).toBe('工作区')
    expect(itemTexts(wrapper)).not.toContain('首页')
    wrapper.unmount()
  })

  it('无 Station 实例时仅渲染 首页 + 标题链', async () => {
    const wrapper = await mountAuto()
    // 可视范围内第一个标题为 h1「产品管理」→ 链 = 产品管理
    expect(itemTexts(wrapper)).toEqual(['首页', '产品管理'])
    wrapper.unmount()
  })

  it('Station 菜单变化（notifyStationChange）触发菜单链刷新', async () => {
    registerStation({
      filter: 'g',
      setFooterInfo: vi.fn(),
      refresh: vi.fn(),
      getActiveMenuChain: () => [{ title: '工作区' }, { title: '任务列表' }]
    })
    const wrapper = await mountAuto()
    expect(itemTexts(wrapper)).toContain('任务列表')
    notifyStationChange('g')
    await nextTick()
    expect(itemTexts(wrapper)).toContain('任务列表')
    wrapper.unmount()
  })

  it('Path 自身内部 DOM 变动（如动画节点增删）不触发标题重扫，避免自激循环', async () => {
    const host = buildHost()
    // attachTo：让 wd-path 真实位于被观察容器内部（与文档/Station 场景一致）
    const wrapper = mount(WdPath, {
      props: { mode: 'auto', filter: 'g', container: host },
      global: { stubs },
      attachTo: host
    })
    await nextTick()
    const state = (wrapper.vm as any).$.setupState
    const before = state.headings
    // 模拟 TransitionGroup 在 .wd-path 内部增删路径段节点
    const span = document.createElement('span')
    wrapper.element.appendChild(span)
    await nextTick(); await nextTick()
    span.remove()
    await nextTick(); await nextTick()
    expect(state.headings).toBe(before)
    wrapper.unmount()
  })

  it('容器内非标题结构变动不重建标题列表（标题签名比对）', async () => {
    const host = buildHost()
    const wrapper = await mountAuto({}, host)
    const state = (wrapper.vm as any).$.setupState
    const before = state.headings
    host.appendChild(document.createElement('p'))
    await nextTick(); await nextTick()
    expect(state.headings).toBe(before)
    wrapper.unmount()
  })

  it('容器内新增标题节点时触发重扫', async () => {
    const host = buildHost()
    const wrapper = await mountAuto({}, host)
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
