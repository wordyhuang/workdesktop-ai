/**
 * WdDrawer 标题区样式回归测试
 * 需求：提供 title 时，抽屉上方显示该标题，标题区总高约 150px，
 * 不设上下 margin/padding，内容垂直居中。
 * 组件通过给 el-drawer 追加标题样式类（wd-drawer--titled），由全局 CSS 落地具体视觉；
 * 本测试锁定「有 title 才带类、title 正确透传」的 DOM 契约。
 */
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import Drawer from '../Drawer.vue'

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

function mountDrawer(props: Record<string, any> = {}) {
  return mount(Drawer, {
    props: { modelValue: true, ...props },
    global: { stubs: { ElDrawer: DrawerStub, ElDialog: DialogStub } }
  })
}

describe('WdDrawer 标题区', () => {
  it('提供 title 时抽屉带标题样式类 wd-drawer--titled', () => {
    const wrapper = mountDrawer({ title: '详情面板' })
    const drawer = wrapper.findComponent(DrawerStub)
    expect(drawer.classes()).toContain('wd-drawer--titled')
  })

  it('title 透传给 el-drawer', () => {
    const wrapper = mountDrawer({ title: '详情面板' })
    const drawer = wrapper.findComponent(DrawerStub)
    expect(drawer.attributes('title')).toBe('详情面板')
  })

  it('未提供 title 时不带标题样式类', () => {
    const wrapper = mountDrawer({})
    const drawer = wrapper.findComponent(DrawerStub)
    expect(drawer.classes()).not.toContain('wd-drawer--titled')
  })

  it('title 为空白字符串时不视为有效标题', () => {
    const wrapper = mountDrawer({ title: '   ' })
    const drawer = wrapper.findComponent(DrawerStub)
    expect(drawer.classes()).not.toContain('wd-drawer--titled')
  })

  it('dialog 模式不受标题样式类影响', () => {
    const wrapper = mountDrawer({ title: '详情面板', mode: 'dialog' })
    const dialog = wrapper.findComponent(DialogStub)
    expect(dialog.classes()).not.toContain('wd-drawer--titled')
  })

  it('url（iframe）模式抽屉带 wd-drawer--iframe 类', () => {
    const wrapper = mountDrawer({ url: 'https://example.com' })
    const drawer = wrapper.findComponent(DrawerStub)
    expect(drawer.classes()).toContain('wd-drawer--iframe')
  })

  it('非 iframe 模式不带 wd-drawer--iframe 类', () => {
    const wrapper = mountDrawer({})
    const drawer = wrapper.findComponent(DrawerStub)
    expect(drawer.classes()).not.toContain('wd-drawer--iframe')
  })
})
