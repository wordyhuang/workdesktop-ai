import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import WdCardRail from '../styles/CardRail.vue'

/* ---------- ElementPlus 图标桩 ---------- */
const ElIcon = defineComponent({
  name: 'el-icon',
  setup(_, { slots }) {
    return () => h('i', { class: 'el-icon' }, slots.default?.())
  }
})

const stubs = { 'el-icon': ElIcon }

const makeItems = (count: number) =>
  Array.from({ length: count }, (_, i) => ({ id: i + 1, title: `任务${i + 1}` }))

const mountRail = (props: Record<string, any> = {}, itemCount = 6) =>
  mount(WdCardRail, {
    props: { items: makeItems(itemCount), ...props },
    slots: {
      default: ({ item, index }: any) =>
        h('span', { class: 'demo-item' }, `${index}:${item.title}`)
    },
    global: { stubs }
  })

const trackPage = (wrapper: any) => {
  const style = wrapper.find('.wd-card-rail__track').attributes('style') || ''
  const matched = style.match(/--wd-rail-page:\s*(\d+)/)
  return matched ? Number(matched[1]) : 0
}

const prevBtn = (wrapper: any) => wrapper.find('[aria-label="上一页"]')
const nextBtn = (wrapper: any) => wrapper.find('[aria-label="下一页"]')

describe('WdCardRail 渲染与作用域插槽', () => {
  it('按 items 数量渲染卡片，并透出 item / index 给默认插槽', () => {
    const wrapper = mountRail()
    expect(wrapper.findAll('.wd-card-rail__item')).toHaveLength(6)
    expect(wrapper.find('.wd-card-rail__item').text()).toBe('0:任务1')
    expect(wrapper.findAll('.demo-item')[5].text()).toBe('5:任务6')
    wrapper.unmount()
  })

  it('items 为空时不渲染卡片，翻页按钮均禁用', () => {
    const wrapper = mountRail({ items: [] }, 0)
    expect(wrapper.findAll('.wd-card-rail__item')).toHaveLength(0)
    expect(prevBtn(wrapper).attributes('disabled')).toBeDefined()
    expect(nextBtn(wrapper).attributes('disabled')).toBeDefined()
    wrapper.unmount()
  })

  it('showNav=false 时不渲染翻页按钮', () => {
    const wrapper = mountRail({ showNav: false })
    expect(wrapper.find('.wd-card-rail__nav').exists()).toBe(false)
    wrapper.unmount()
  })
})

describe('WdCardRail 翻页与边界', () => {
  it('首屏上一页禁用；点击下一页页码 +1 并抛出 update:page / change', async () => {
    const wrapper = mountRail()
    expect(trackPage(wrapper)).toBe(0)
    expect(prevBtn(wrapper).attributes('disabled')).toBeDefined()

    await nextBtn(wrapper).trigger('click')
    expect(trackPage(wrapper)).toBe(1)
    expect(wrapper.emitted('update:page')?.[0]).toEqual([1])
    expect(wrapper.emitted('change')?.[0]).toEqual([1])
    await nextBtn(wrapper).trigger('click')
    expect(trackPage(wrapper)).toBe(1)
    expect(nextBtn(wrapper).attributes('disabled')).toBeDefined()
    wrapper.unmount()
  })

  it('perPage 决定页宽与最大页：6 条 / 2 条每页 → 最大页 2', async () => {
    const wrapper = mountRail({ perPage: 2 })
    expect(nextBtn(wrapper).attributes('disabled')).toBeUndefined()
    await nextBtn(wrapper).trigger('click')
    await nextBtn(wrapper).trigger('click')
    expect(trackPage(wrapper)).toBe(2)
    expect(nextBtn(wrapper).attributes('disabled')).toBeDefined()
    expect(prevBtn(wrapper).attributes('disabled')).toBeUndefined()
    wrapper.unmount()
  })

  it('页宽写入 --wd-rail-per，卡片宽度按每页条数分栏', () => {
    const wrapper = mountRail({ perPage: 4 })
    const style = wrapper.find('.wd-card-rail').attributes('style') || ''
    expect(style).toContain('--wd-rail-per: 4')
    wrapper.unmount()
  })

  it('items 变少导致当前页越界时自动收敛到最大页并抛 update:page', async () => {
    const wrapper = mountRail({ perPage: 2 })
    await nextBtn(wrapper).trigger('click')
    await nextBtn(wrapper).trigger('click')
    expect(trackPage(wrapper)).toBe(2)

    await wrapper.setProps({ items: makeItems(3) })
    expect(trackPage(wrapper)).toBe(1)
    expect(wrapper.emitted('update:page')?.at(-1)).toEqual([1])
    wrapper.unmount()
  })

  it('受控 page 传入越界值时按最大页渲染', () => {
    const wrapper = mountRail({ perPage: 2, page: 9 })
    expect(trackPage(wrapper)).toBe(2)
    expect(nextBtn(wrapper).attributes('disabled')).toBeDefined()
    wrapper.unmount()
  })
})

describe('WdCardRail 循环滑动（loop）', () => {
  it('loop=true 时首屏上一页可点击，跳转到末页并抛出事件', async () => {
    const wrapper = mountRail({ loop: true })
    expect(prevBtn(wrapper).attributes('disabled')).toBeUndefined()
    await prevBtn(wrapper).trigger('click')
    expect(trackPage(wrapper)).toBe(1)
    expect(wrapper.emitted('update:page')?.[0]).toEqual([1])
    expect(wrapper.emitted('change')?.[0]).toEqual([1])
    wrapper.unmount()
  })

  it('loop=true 时末页下一页回到首页', async () => {
    const wrapper = mountRail({ loop: true, page: 1 })
    expect(nextBtn(wrapper).attributes('disabled')).toBeUndefined()
    await nextBtn(wrapper).trigger('click')
    expect(trackPage(wrapper)).toBe(0)
    expect(wrapper.emitted('update:page')?.[0]).toEqual([0])
    wrapper.unmount()
  })

  it('loop=true 但只有一页（无越界空间）时双按钮仍禁用', () => {
    const wrapper = mountRail({ loop: true, perPage: 10 }, 6)
    expect(prevBtn(wrapper).attributes('disabled')).toBeDefined()
    expect(nextBtn(wrapper).attributes('disabled')).toBeDefined()
    wrapper.unmount()
  })

  it('loop=true 时暴露的 prev / next 同样循环', async () => {
    const wrapper = mountRail({ loop: true, perPage: 2 })
    const vm = wrapper.vm as any
    vm.prev()
    await wrapper.vm.$nextTick()
    expect(trackPage(wrapper)).toBe(2)
    vm.next()
    await wrapper.vm.$nextTick()
    expect(trackPage(wrapper)).toBe(0)
    wrapper.unmount()
  })
})

describe('WdCardRail 暴露方法', () => {
  it('goTo / prev / next 受边界约束并同步页码', async () => {
    const wrapper = mountRail({ perPage: 2 })
    const vm = wrapper.vm as any
    vm.goTo(5)
    await wrapper.vm.$nextTick()
    expect(trackPage(wrapper)).toBe(2)
    vm.prev()
    await wrapper.vm.$nextTick()
    expect(trackPage(wrapper)).toBe(1)
    vm.prev()
    vm.prev()
    await wrapper.vm.$nextTick()
    expect(trackPage(wrapper)).toBe(0)
    wrapper.unmount()
  })
})

describe('WdCardRail 翻页按钮定制', () => {
  it('默认渲染时根节点带 has-nav 类，为按钮预留轨道外侧槽位', () => {
    const wrapper = mountRail()
    expect(wrapper.find('.wd-card-rail').classes()).toContain('has-nav')
    wrapper.unmount()
  })

  it('showNav=false 时不预留按钮槽位', () => {
    const wrapper = mountRail({ showNav: false })
    expect(wrapper.find('.wd-card-rail').classes()).not.toContain('has-nav')
    wrapper.unmount()
  })

  it('提供 #nav 插槽时默认按钮不渲染，插槽可拿到翻页上下文并驱动翻页', async () => {
    const wrapper = mount(WdCardRail, {
      props: { items: makeItems(6), perPage: 3 },
      slots: {
        default: ({ item }: any) => h('span', item.title),
        nav: ({ page, maxPage, next, canNext }: any) =>
          h(
            'button',
            {
              class: 'demo-nav',
              'data-page': page,
              disabled: !canNext,
              onClick: next
            },
            `${page}/${maxPage}`
          )
      },
      global: { stubs }
    })
    expect(wrapper.find('[aria-label="下一页"]').exists()).toBe(false)
    expect(wrapper.find('.wd-card-rail').classes()).not.toContain('has-nav')
    expect(wrapper.find('.demo-nav').text()).toBe('0/1')

    await wrapper.find('.demo-nav').trigger('click')
    expect(trackPage(wrapper)).toBe(1)
    expect(wrapper.find('.demo-nav').attributes('data-page')).toBe('1')
    wrapper.unmount()
  })
})
