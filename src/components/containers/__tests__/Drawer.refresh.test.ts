/**
 * WdDrawer 内容刷新测试
 * Station 顶部刷新按钮 → drawer-linkage → Drawer.refresh()：
 * - iframe 模式：iframeKey++ 重建 iframe（src 重载）
 * - 非 iframe 模式：优先调用内容组件经 useContainer().registerRefresh 注册的 refresh；
 *   无注册时回退 contentKey++ 强制重挂载插槽内容（与 Station contentKey 同机制）
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import Drawer from '../Drawer.vue'
import { useContainer } from '../containerContext'
import { getDrawers, clearDrawerLinkageRegistry } from '../../../lib/core/drawer-linkage'

vi.mock('element-plus', () => ({ ElMessageBox: { confirm: vi.fn() } }))

// 透传所有 attrs（含 class）到根元素，并渲染默认插槽
const DrawerStub = defineComponent({
  name: 'ElDrawer',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => h('div', { class: 'el-drawer-stub', ...attrs }, slots.default?.())
  }
})

const DialogStub = defineComponent({
  name: 'ElDialog',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => h('div', { class: 'el-dialog-stub', ...attrs }, slots.default?.())
  }
})

let mountCount = 0

/** 插槽内容组件：setup 计数（验证重挂载）；可选注册自身 refresh 到容器上下文 */
function makeContent(registerFn?: () => any) {
  return defineComponent({
    name: 'Content',
    setup() {
      mountCount += 1
      const ctx = useContainer()
      if (registerFn) ctx?.registerRefresh?.(registerFn)
      return () => h('div', { class: 'content-root' }, 'content')
    }
  })
}

function mountDrawer(props: Record<string, any> = {}, content?: any) {
  return mount(Drawer, {
    props: { modelValue: true, ...props },
    slots: content ? { default: content } : {},
    global: { stubs: { ElDrawer: DrawerStub, ElDialog: DialogStub } }
  })
}

describe('WdDrawer 内容刷新', () => {
  beforeEach(() => {
    clearDrawerLinkageRegistry()
    mountCount = 0
  })

  afterEach(() => {
    clearDrawerLinkageRegistry()
  })

  it('非 iframe 且无注册组件：refresh() 强制重挂载插槽内容', async () => {
    const wrapper = mountDrawer({}, makeContent())
    expect(mountCount).toBe(1)
    ;(wrapper.vm as any).refresh()
    await nextTick()
    expect(mountCount).toBe(2)
  })

  it('非 iframe 且内容组件已注册 refresh：refresh() 优先调用注册函数且不重挂载', async () => {
    const contentRefresh = vi.fn()
    const wrapper = mountDrawer({}, makeContent(contentRefresh))
    expect(mountCount).toBe(1)
    ;(wrapper.vm as any).refresh()
    await nextTick()
    expect(contentRefresh).toHaveBeenCalledTimes(1)
    expect(mountCount).toBe(1)
  })

  it('iframe 模式：refresh() 重建 iframe（元素引用变化）', async () => {
    const wrapper = mountDrawer({ url: 'https://example.com/list' })
    const before = wrapper.find('iframe').element
    ;(wrapper.vm as any).refresh()
    await nextTick()
    expect(wrapper.find('iframe').element).not.toBe(before)
  })

  it('dialog 模式（mode=dialog）同样支持 key 重挂载', async () => {
    const wrapper = mountDrawer({ mode: 'dialog' }, makeContent())
    expect(mountCount).toBe(1)
    ;(wrapper.vm as any).refresh()
    await nextTick()
    expect(mountCount).toBe(2)
  })

  it('挂载时注册到 drawer-linkage，卸载时注销', () => {
    const wrapper = mountDrawer({ filter: 'main' }, makeContent())
    expect(getDrawers('main')).toHaveLength(1)
    wrapper.unmount()
    expect(getDrawers('main')).toHaveLength(0)
  })

  it('多个内容组件注册 refresh 时全部被调用', async () => {
    const a = vi.fn()
    const b = vi.fn()
    const Two = defineComponent({
      name: 'Two',
      setup() {
        mountCount += 1
        const ctx = useContainer()
        ctx?.registerRefresh?.(a)
        ctx?.registerRefresh?.(b)
        return () => h('div', 'two')
      }
    })
    const wrapper = mountDrawer({}, Two)
    ;(wrapper.vm as any).refresh()
    await nextTick()
    expect(a).toHaveBeenCalledTimes(1)
    expect(b).toHaveBeenCalledTimes(1)
    expect(mountCount).toBe(1)
  })
})
