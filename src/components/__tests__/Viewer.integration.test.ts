import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, provide, inject } from 'vue'
import Viewer from '../data/viewer/Viewer.vue'

// mock 网络层：Viewer 走 request.get/post/...，这里统一 mock
const { mockGet } = vi.hoisted(() => ({ mockGet: vi.fn() }))
vi.mock('../../lib/core/http', () => ({
  request: {
    get: mockGet,
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}))

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
          ...(attrs.disabled ? { disabled: 'disabled' } : {}),
          onClick: (e: MouseEvent) => {
            if (!attrs.disabled) (attrs as any).onClick?.(e)
          }
        },
        slots.default?.()
      )
  }
})
const ElTooltip = defineComponent({
  name: 'el-tooltip',
  setup(_, { slots }) {
    return () => h('span', { class: 'el-tooltip-stub' }, slots.default?.())
  }
})
const ElIcon = defineComponent({
  name: 'el-icon',
  setup(_, { slots }) {
    return () => h('i', { class: 'el-icon-stub' }, slots.default?.())
  }
})
const ElEmpty = defineComponent({
  name: 'el-empty',
  setup() {
    return () => h('div', { class: 'el-empty-stub' })
  }
})

// el-descriptions：透传 size 属性，渲染默认插槽（内含 #extra 与描述项）
const ElDescriptions = defineComponent({
  name: 'el-descriptions',
  inheritAttrs: false,
  props: {
    title: { type: String, default: '' },
    column: { type: [Number, Object], default: 3 },
    border: { type: Boolean, default: true },
    size: { type: String, default: 'default' }
  },
  setup(p, { slots, attrs }) {
    return () =>
      h('div', { class: 'el-descriptions-stub', 'data-size': p.size, ...attrs }, [
        slots.extra ? h('div', { class: 'el-descriptions__extra' }, slots.extra()) : null,
        h('div', { class: 'el-descriptions__body' }, slots.default?.())
      ])
  }
})
const ElDescriptionsItem = defineComponent({
  name: 'el-descriptions-item',
  props: { label: { type: String, default: '' } },
  setup(p, { slots }) {
    return () =>
      h('div', { class: 'el-descriptions-item-stub' }, [
        h('span', { class: 'el-descriptions-item__label' }, p.label),
        h('span', { class: 'el-descriptions-item__content' }, slots.default?.())
      ])
  }
})

const ElDialog = defineComponent({
  name: 'el-dialog',
  props: { modelValue: Boolean, title: String },
  setup(p, { slots }) {
    return () =>
      h('div', { class: 'el-dialog-stub' }, [
        p.modelValue ? slots.default?.() : null,
        p.modelValue ? h('div', { class: 'el-dialog__footer' }, slots.footer?.()) : null
      ])
  }
})

// el-checkbox：透传 model-value，点击切换并 emit update:modelValue
const ElCheckbox = defineComponent({
  name: 'el-checkbox',
  props: { modelValue: Boolean },
  emits: ['update:modelValue'],
  setup(p, { slots, emit }) {
    return () =>
      h(
        'label',
        {
          class: 'el-checkbox-stub',
          onClick: () => emit('update:modelValue', !p.modelValue)
        },
        slots.default?.()
      )
  }
})

// el-dropdown：子项点击 -> emit command -> Viewer @command
const dropdownCmdKey = Symbol('dropdown-command')
const ElDropdown = defineComponent({
  name: 'el-dropdown',
  inheritAttrs: false,
  setup(_p, { slots, attrs }) {
    provide(dropdownCmdKey, (cmd: unknown) => (attrs as any).onCommand?.(cmd))
    return () =>
      h('span', { class: 'el-dropdown-stub' }, [slots.default?.(), slots.dropdown?.()])
  }
})
const ElDropdownMenu = defineComponent({
  name: 'el-dropdown-menu',
  setup(_p, { slots }) {
    return () => h('div', { class: 'el-dropdown-menu-stub' }, slots.default?.())
  }
})
const ElDropdownItem = defineComponent({
  name: 'el-dropdown-item',
  inheritAttrs: false,
  props: { command: { type: [String, Number], default: undefined }, disabled: Boolean },
  setup(p, { slots }) {
    const emitCmd = inject<(cmd: unknown) => void>(dropdownCmdKey)
    return () =>
      h(
        'div',
        {
          class: 'el-dropdown-item-stub',
          ...(p.disabled ? { disabled: '' } : {}),
          onClick: () => {
            if (!p.disabled) emitCmd?.(p.command)
          }
        },
        slots.default?.()
      )
  }
})

const stubs = {
  'el-button': ElButton,
  'el-tooltip': ElTooltip,
  'el-icon': ElIcon,
  'el-empty': ElEmpty,
  'el-descriptions': ElDescriptions,
  'el-descriptions-item': ElDescriptionsItem,
  'el-dialog': ElDialog,
  'el-checkbox': ElCheckbox,
  'el-dropdown': ElDropdown,
  'el-dropdown-menu': ElDropdownMenu,
  'el-dropdown-item': ElDropdownItem
}

const sampleItems = [
  { prop: 'name', label: '姓名' },
  { prop: 'age', label: '年龄' },
  { prop: 'address', label: '地址' }
]
const sampleData = { name: '张三', age: 28, address: '北京市海淀区' }

function mountViewer(props: Record<string, any> = {}) {
  return mount(Viewer, {
    props: { items: sampleItems, data: sampleData, ...props },
    global: { stubs, directives: { loading: {} } }
  })
}

/** 描述项标签顺序 */
function labelsOf(wrapper: ReturnType<typeof mount>) {
  return wrapper.findAll('.el-descriptions-item__label').map((n) => n.text())
}

describe('Viewer 集成（描述渲染 + 标题工具自动启用 + http mock）', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('静态 data + items：按配置渲染描述项，空值显示 -', () => {
    const wrapper = mountViewer({ data: { name: '李四', age: null, address: '' } })
    const contents = wrapper.findAll('.el-descriptions-item__content').map((n) => n.text())
    expect(labelsOf(wrapper)).toEqual(['姓名', '年龄', '地址'])
    expect(contents).toEqual(['李四', '-', '-'])
    wrapper.unmount()
  })

  it('标题工具自动渲染：无需任何配置即出现调整大小与显示字段按钮（title 为空也渲染）', () => {
    const wrapper = mountViewer()
    // #extra 插槽内容落在标题区
    expect(wrapper.find('.el-descriptions__extra').exists()).toBe(true)
    // 一个下拉触发按钮 + 一个字段设置按钮
    expect(wrapper.findComponent(ElDropdown).exists()).toBe(true)
    const toolButtons = wrapper.findAll('.wd-viewer__tools button.el-button-stub')
    expect(toolButtons.length).toBe(2)
    wrapper.unmount()
  })

  it('调整大小：点下拉项后 el-descriptions 的 size 跟随变化（大/默认/小）', async () => {
    const wrapper = mountViewer()
    const desc = wrapper.findComponent(ElDescriptions)
    expect(desc.props('size')).toBe('default')

    const items = wrapper.findAllComponents(ElDropdownItem)
    await items[0].trigger('click') // 大
    expect(wrapper.findComponent(ElDescriptions).props('size')).toBe('large')

    await items[2].trigger('click') // 小
    expect(wrapper.findComponent(ElDescriptions).props('size')).toBe('small')

    await items[1].trigger('click') // 默认
    expect(wrapper.findComponent(ElDescriptions).props('size')).toBe('default')
    wrapper.unmount()
  })

  it('显示字段：取消勾选后对应字段不渲染，重新勾选恢复', async () => {
    const wrapper = mountViewer()

    // 打开显示字段弹层（工具栏第二个按钮）
    const toolButtons = wrapper.findAll('.wd-viewer__tools button.el-button-stub')
    await toolButtons[1].trigger('click')

    let checks = wrapper.findAllComponents(ElCheckbox)
    expect(checks.length).toBe(3)
    // 取消“年龄”
    await checks[1].trigger('click')

    expect(labelsOf(wrapper)).toEqual(['姓名', '地址'])

    // 重新勾选恢复
    checks = wrapper.findAllComponents(ElCheckbox)
    await checks[1].trigger('click')
    expect(labelsOf(wrapper)).toEqual(['姓名', '年龄', '地址'])
    wrapper.unmount()
  })

  it('显示字段：拖拽手柄调整字段展示顺序（与 DataGrid 列设置一致）', async () => {
    const wrapper = mountViewer()
    const toolButtons = wrapper.findAll('.wd-viewer__tools button.el-button-stub')
    await toolButtons[1].trigger('click')

    // 每行一个拖拽手柄
    const rows = wrapper.findAll('.wd-viewer__field-item')
    expect(rows.length).toBe(3)
    rows.forEach((r) => expect(r.find('.wd-viewer__field-handle').exists()).toBe(true))

    // 拖动第二行（年龄）放到第三行（地址）之后（clientY 大 -> after）
    await rows[1].find('.wd-viewer__field-handle').trigger('dragstart')
    await rows[2].trigger('dragover', { clientY: 999 })
    await rows[2].trigger('drop')
    expect(labelsOf(wrapper)).toEqual(['姓名', '地址', '年龄'])

    // 拖回：年龄（现第三行）放到地址之前（clientY 小 -> before）
    const rows2 = wrapper.findAll('.wd-viewer__field-item')
    await rows2[2].find('.wd-viewer__field-handle').trigger('dragstart')
    await rows2[1].trigger('dragover', { clientY: -1 })
    await rows2[1].trigger('drop')
    expect(labelsOf(wrapper)).toEqual(['姓名', '年龄', '地址'])
    wrapper.unmount()
  })

  it('恢复默认：显隐与排序全部还原为 items 配置', async () => {
    const wrapper = mountViewer()
    const toolButtons = wrapper.findAll('.wd-viewer__tools button.el-button-stub')
    await toolButtons[1].trigger('click')

    // 取消“姓名”
    await wrapper.findAllComponents(ElCheckbox)[0].trigger('click')
    // 拖拽“年龄”到“地址”之后
    const rows = wrapper.findAll('.wd-viewer__field-item')
    await rows[1].find('.wd-viewer__field-handle').trigger('dragstart')
    await rows[2].trigger('dragover', { clientY: 999 })
    await rows[2].trigger('drop')
    expect(labelsOf(wrapper)).toEqual(['地址', '年龄'])

    // footer 中“恢复默认”为第一个按钮
    const resetBtn = wrapper.findAll('.el-dialog__footer button.el-button-stub')[0]
    await resetBtn.trigger('click')
    expect(labelsOf(wrapper)).toEqual(['姓名', '年龄', '地址'])
    wrapper.unmount()
  })

  it('无数据时不渲染描述区，展示空状态', () => {
    const wrapper = mount(Viewer, {
      props: { items: sampleItems },
      global: { stubs, directives: { loading: {} } }
    })
    expect(wrapper.findComponent(ElDescriptions).exists()).toBe(false)
    expect(wrapper.find('.wd-viewer__empty').exists()).toBe(true)
    wrapper.unmount()
  })

  it('#content 整体内容插槽：存在时不再渲染描述列表/工具，接管布局并透传 row、data', () => {
    const wrapper = mount(Viewer, {
      props: { items: sampleItems, data: sampleData },
      slots: {
        content: `<div class="custom-layout">自定义布局-{{ row.name }}-{{ data.age }}</div>`
      },
      global: { stubs, directives: { loading: {} } }
    })
    // 描述列表及其标题工具不渲染
    expect(wrapper.findComponent(ElDescriptions).exists()).toBe(false)
    expect(wrapper.find('.el-descriptions__extra').exists()).toBe(false)
    // 插槽内容接管，row/data 均为当前数据
    expect(wrapper.find('.custom-layout').text()).toBe('自定义布局-张三-28')
    wrapper.unmount()
  })

  it('#content 插槽模式：无数据渲染空态；api+active 取数后透传数据', async () => {
    const emptyWrapper = mount(Viewer, {
      props: { items: sampleItems },
      slots: { content: '<div class="custom-layout">{{ row.name }}</div>' },
      global: { stubs, directives: { loading: {} } }
    })
    expect(emptyWrapper.find('.wd-viewer__empty').exists()).toBe(true)
    expect(emptyWrapper.find('.custom-layout').exists()).toBe(false)
    emptyWrapper.unmount()

    mockGet.mockResolvedValue({ success: true, data: sampleData })
    const wrapper = mount(Viewer, {
      props: { items: sampleItems, api: '/user/detail', active: true },
      slots: { content: '<div class="custom-layout">{{ row.name }}</div>' },
      global: { stubs, directives: { loading: {} } }
    })
    await flushPromises()
    expect(mockGet).toHaveBeenCalledTimes(1)
    expect(wrapper.find('.custom-layout').text()).toBe('张三')
    expect(wrapper.findComponent(ElDescriptions).exists()).toBe(false)
    wrapper.unmount()
  })

  it('api + active：挂载自动请求并装载数据，标题工具仍自动可用', async () => {
    mockGet.mockResolvedValue({ success: true, data: sampleData })
    const wrapper = mount(Viewer, {
      props: { items: sampleItems, api: '/user/detail', active: true },
      global: { stubs, directives: { loading: {} } }
    })
    await flushPromises()

    expect(mockGet).toHaveBeenCalledTimes(1)
    expect(mockGet.mock.calls[0][0]).toBe('/user/detail')
    expect(labelsOf(wrapper)).toEqual(['姓名', '年龄', '地址'])
    expect(wrapper.find('.el-descriptions__extra').exists()).toBe(true)
    wrapper.unmount()
  })
})
