import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, type VNode } from 'vue'
import SearchPanel from '../form/SearchPanel.vue'
import { resetConfig } from '../../lib/core/config'

/* ---------- ElementPlus 叶子组件桩 ---------- */
const ElButton = defineComponent({
  name: 'el-button',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () =>
      h(
        'button',
        {
          class: 'el-button-stub',
          type: 'button',
          onClick: (e: MouseEvent) => (attrs as any).onClick?.(e)
        },
        slots.default?.()
      )
  }
})
const ElForm = defineComponent({
  name: 'el-form',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => h('form', { class: 'el-form-stub', ...attrs }, slots.default?.())
  }
})
const ElFormItem = defineComponent({
  name: 'el-form-item',
  setup(_p, { slots }) {
    return () => h('label', { class: 'el-form-item-stub' }, slots.default?.())
  }
})

const stubs = {
  'el-button': ElButton,
  'el-form': ElForm,
  'el-form-item': ElFormItem
}

/** 默认插槽：渲染一个可写 input，把输入同步进 model.a */
function defaultSlot(): (props: Record<string, any>) => VNode {
  return ({ model }) =>
    h('input', {
      'data-k': 'a',
      onInput: (e: Event) => {
        model.a = (e.target as HTMLInputElement).value
      }
    })
}

function findButton(wrapper: ReturnType<typeof mount>, text: string) {
  const btn = wrapper
    .findAll('button')
    .find((b) => b.text().includes(text))
  return btn
}

describe('SearchPanel 双栏布局与折叠插槽', () => {
  beforeEach(() => {
    resetConfig()
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('双栏默认能力：无隐藏搜索条件时不显示展开/收起按钮，操作列按钮横排一行且宽度随内容自适应', async () => {
    const wrapper = mount(SearchPanel, {
      props: {},
      slots: { default: defaultSlot() },
      global: { stubs, directives: { loading: {} } }
    })
    await flushPromises()

    expect(wrapper.find('.wd-search-panel__fields').exists()).toBe(true)
    const actions = wrapper.find('.wd-search-panel__actions')
    expect(actions.exists()).toBe(true)
    // 默认 actionWidth='auto'：不写内联宽度
    expect((actions.attributes('style') || '').toLowerCase()).not.toContain('width')
    expect(findButton(wrapper, '搜索')).toBeTruthy()
    expect(findButton(wrapper, '重置')).toBeTruthy()
    // 默认区内容未超出折叠行高（无隐藏条件）：不渲染展开/收起按钮
    expect(findButton(wrapper, '展开')).toBeUndefined()
    expect(findButton(wrapper, '收起')).toBeUndefined()
    wrapper.unmount()
  })

  it('actionWidth 显式传入时操作列固定该宽度', async () => {
    const wrapper = mount(SearchPanel, {
      props: { actionWidth: 260 },
      slots: { default: defaultSlot() },
      global: { stubs, directives: { loading: {} } }
    })
    await flushPromises()

    const actions = wrapper.find('.wd-search-panel__actions')
    expect((actions.attributes('style') || '').replace(/\s+/g, '')).toContain('width:260px')
    wrapper.unmount()
  })

  it('旧折叠模式（无 more 插槽）：默认区超出折叠行高时才显示展开按钮，点击切换并 emit expand-change', async () => {
    const wrapper = mount(SearchPanel, {
      props: { collapsible: true, defaultExpand: false },
      slots: { default: defaultSlot() },
      global: { stubs, directives: { loading: {} } }
    })
    await flushPromises()

    const primary = wrapper.find('.wd-search-panel__primary')
    // happy-dom 无真实布局，未溢出时无隐藏条件：不显示展开按钮、默认区不折叠
    expect(findButton(wrapper, '展开')).toBeUndefined()
    expect(primary.classes()).not.toContain('is-collapsed')

    // 模拟默认区内容超出折叠行高（存在被隐藏的搜索条件），触发 resize 重新测量
    Object.defineProperty(primary.element, 'scrollHeight', { configurable: true, value: 120 })
    window.dispatchEvent(new Event('resize'))
    await flushPromises()
    expect(findButton(wrapper, '展开')).toBeTruthy()
    expect(primary.classes()).toContain('is-collapsed')

    await findButton(wrapper, '展开')!.trigger('click')
    await flushPromises()
    expect(primary.classes()).not.toContain('is-collapsed')
    expect(wrapper.emitted('expand-change')?.[0]).toEqual([true])

    await findButton(wrapper, '收起')!.trigger('click')
    expect(wrapper.emitted('expand-change')?.[1]).toEqual([false])
    wrapper.unmount()
  })

  it('more 插槽：隐藏区为独立第二行，默认收起(无 is-open)→点展开平滑滑出，collapsible=false 恒展开且无展开按钮', async () => {
    // collapsible + 默认收起：第二行容器常驻（用于动画），但不展开
    const wrapper = mount(SearchPanel, {
      props: { collapsible: true, defaultExpand: false },
      slots: {
        default: '<div class="field-default">默认项</div>',
        more: '<div class="field-more">隐藏项</div>'
      },
      global: { stubs, directives: { loading: {} } }
    })
    await flushPromises()

    const moreWrap = wrapper.find('.wd-search-panel__more-wrap')
    // 独立第二行容器已渲染但处于收起态
    expect(moreWrap.exists()).toBe(true)
    expect(moreWrap.classes()).not.toContain('is-open')
    // 默认区不再整体截断（有 more 插槽时默认项完整展示）
    expect(wrapper.find('.wd-search-panel__primary').classes()).not.toContain('is-collapsed')

    await findButton(wrapper, '展开')!.trigger('click')
    await flushPromises()
    expect(wrapper.find('.wd-search-panel__more-wrap').classes()).toContain('is-open')
    expect(wrapper.find('.field-more').text()).toBe('隐藏项')
    wrapper.unmount()

    // collapsible=false：隐藏区常驻展开、无展开按钮
    const always = mount(SearchPanel, {
      props: { collapsible: false },
      slots: {
        default: '<div class="field-default">默认项</div>',
        more: '<div class="field-more">隐藏项</div>'
      },
      global: { stubs, directives: { loading: {} } }
    })
    await flushPromises()
    const alwaysWrap = always.find('.wd-search-panel__more-wrap')
    expect(alwaysWrap.exists()).toBe(true)
    expect(alwaysWrap.classes()).toContain('is-open')
    expect(findButton(always, '展开')).toBeUndefined()
    expect(findButton(always, '收起')).toBeUndefined()
    always.unmount()
  })

  it('more 插槽：默认区与隐藏区分两行布局，所有表单项在同一个 el-form 作用域中，第二行整体位于第一行下方', async () => {
    const wrapper = mount(SearchPanel, {
      props: { collapsible: true, defaultExpand: true },
      slots: {
        default: '<div class="field-default">默认项</div>',
        more: '<div class="field-more">隐藏项</div>'
      },
      global: { stubs, directives: { loading: {} } }
    })
    await flushPromises()

    const forms = wrapper.findAll('form')
    // 所有表单项都在同一个 el-form 作用域中（默认区+隐藏区+按钮都在同一个 el-form 内）
    expect(forms.length).toBe(1)
    expect(forms[0].find('.field-default').exists()).toBe(true)
    expect(forms[0].find('.field-more').exists()).toBe(true)
    wrapper.unmount()
  })

  it('actions 插槽：自定义操作列替换内置按钮并注入 search/reset', async () => {
    const wrapper = mount(SearchPanel, {
      props: { collapsible: true },
      slots: {
        default: defaultSlot(),
        actions: 'CUSTOM-ACTIONS'
      },
      global: { stubs, directives: { loading: {} } }
    })
    await flushPromises()

    const actions = wrapper.find('.wd-search-panel__actions')
    expect(actions.text()).toContain('CUSTOM-ACTIONS')
    expect(findButton(wrapper, '搜索')).toBeUndefined()
    wrapper.unmount()
  })

  it('查询/重置：search 携当前表单值；reset 清空表单字段并触发 reset', async () => {
    const wrapper = mount(SearchPanel, {
      props: {},
      slots: { default: defaultSlot() },
      global: { stubs, directives: { loading: {} } }
    })
    await flushPromises()

    // 无隐藏搜索条件：不渲染展开/收起按钮
    expect(findButton(wrapper, '收起')).toBeUndefined()
    expect(findButton(wrapper, '展开')).toBeUndefined()

    const input = wrapper.find('input[data-k="a"]')
    await input.setValue('张三')
    await findButton(wrapper, '搜索')!.trigger('click')
    expect(wrapper.emitted('search')?.[0][0]).toEqual({ a: '张三' })

    await findButton(wrapper, '重置')!.trigger('click')
    expect(wrapper.emitted('reset')).toHaveLength(1)
    expect((wrapper.vm as any).getSearchParams()).toEqual({})
    wrapper.unmount()
  })
})
