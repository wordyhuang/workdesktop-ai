import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, provide, inject, watch } from 'vue'
import DataGrid from '../data/datagrid/DataGrid.vue'
import { Menu, Grid } from '@element-plus/icons-vue'
import { resetConfig, setGlobalConfig } from '../../lib/core/config'
import { refreshDataGrid } from '../../lib/core/linkage'

// mock 网络层：替换 http 模块，链路走真实 useDataGrid → mock request
const { mockHttpRequest } = vi.hoisted(() => ({ mockHttpRequest: vi.fn() }))
vi.mock('../../lib/core/http', () => ({
  request: { request: mockHttpRequest }
}))

/* ---------- ElementPlus 叶子组件桩（避免真实 EP 渲染依赖） ---------- */
const ElButton = defineComponent({
  name: 'el-button',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    const cls = ['el-button-stub', attrs.class].filter(Boolean).join(' ')
    return () =>
      h(
        'button',
        {
          class: cls,
          onClick: (e: MouseEvent) => (attrs as any).onClick?.(e)
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
const ElTable = defineComponent({
  name: 'el-table',
  setup(_p, { slots, attrs, expose }) {
    // 模拟 EP 多选交互：维护内部选中集，并在变化时触发 selection-change
    let selection: any[] = []
    const sync = () => (attrs as any).onSelectionChange?.(selection)
    const clearSelection = () => {
      selection = []
      sync()
    }
    const toggleRowSelection = (row: any, selected = true) => {
      const i = selection.findIndex((r: any) => r === row)
      if (selected && i < 0) {
        selection.push(row)
        sync()
      }
      if (!selected && i >= 0) {
        selection.splice(i, 1)
        sync()
      }
    }
    const triggerSelectionChange = (rows: any[]) => {
      selection = rows
      sync()
    }
    expose({ clearSelection, toggleRowSelection, triggerSelectionChange })
    // 模拟翻页/数据刷新后 selection 重建：仅保留仍在新数据中的行（未开 reserve-selection 时等价于清空）
    watch(
      () => (attrs as any).data,
      (data: any[]) => {
        const keep = selection.filter((r: any) => (data || []).includes(r))
        if (keep.length !== selection.length) {
          selection = keep
          sync()
        }
      }
    )
    const cls = ['el-table-stub', attrs.class].filter(Boolean).join(' ')
    return () => h('div', { ...attrs, class: cls }, slots.default?.())
  }
})
const ElTableColumn = defineComponent({
  name: 'el-table-column',
  setup(_p, { slots }) {
    return () => h('div', { class: 'el-table-column-stub' }, slots.default?.())
  }
})
const ElEmpty = defineComponent({
  name: 'el-empty',
  setup(_, { slots }) {
    return () => h('div', { class: 'el-empty-stub' }, slots.default?.())
  }
})
const ElPagination = defineComponent({
  name: 'el-pagination',
  props: { currentPage: Number, pageSize: Number, total: Number },
  setup() {
    return () => h('div', { class: 'el-pagination-stub' })
  }
})
const ElDialog = defineComponent({
  name: 'el-dialog',
  props: { modelValue: Boolean, title: String },
  setup(_p, { slots }) {
    return () =>
      h('div', { class: 'el-dialog-stub' }, [
        _p.modelValue ? slots.default?.() : null,
        _p.modelValue ? slots.footer?.() : null
      ])
  }
})
const ElCheckbox = defineComponent({
  name: 'el-checkbox',
  setup(_, { slots }) {
    return () => h('label', { class: 'el-checkbox-stub' }, slots.default?.())
  }
})
const ElBadge = defineComponent({
  name: 'el-badge',
  props: { value: [Number, String], hidden: Boolean },
  setup(p, { slots }) {
    return () =>
      h('span', { class: 'el-badge-stub' }, [
        slots.default?.(),
        p.hidden ? null : h('sup', { class: 'el-badge-stub__value' }, String(p.value ?? 0))
      ])
  }
})
const dropdownCmdKey = Symbol('dropdown-command')
const ElDropdown = defineComponent({
  name: 'el-dropdown',
  inheritAttrs: false,
  setup(_p, { slots, attrs }) {
    // 模拟 EP dropdown：子项点击 -> emit command -> DataGrid @command
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
  'el-table': ElTable,
  'el-table-column': ElTableColumn,
  'el-empty': ElEmpty,
  'el-pagination': ElPagination,
  'el-dialog': ElDialog,
  'el-checkbox': ElCheckbox,
  'el-badge': ElBadge,
  'el-dropdown': ElDropdown,
  'el-dropdown-menu': ElDropdownMenu,
  'el-dropdown-item': ElDropdownItem
}

/** 列表成功响应 */
function listOk(list: any[] = [{ id: 1, name: '张三' }], total = 1) {
  mockHttpRequest.mockResolvedValue({
    success: true,
    data: { list, total, pageSize: 20, currentPage: 1 }
  })
}

function lastPayload() {
  const call = mockHttpRequest.mock.calls[mockHttpRequest.mock.calls.length - 1][0]
  return call.data ?? call.params
}

describe('DataGrid 集成（组件 + useDataGrid + linkage + http mock）', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetConfig()
    listOk()
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('api + active：挂载自动请求，发出带分页参数请求并 emit loaded', async () => {
    const wrapper = mount(DataGrid, {
      props: { api: '/users', active: true, filter: 'main' },
      global: { stubs, directives: { loading: {} } }
    })
    await flushPromises()

    expect(mockHttpRequest).toHaveBeenCalledTimes(1)
    expect(lastPayload()).toEqual({ currentPage: 1, pageSize: 20, param: {} })
    expect(mockHttpRequest.mock.calls[0][0]).toMatchObject({ url: '/users', method: 'post' })
    const loaded = wrapper.emitted('loaded')
    expect(loaded?.length).toBe(1)
    expect(loaded?.[0][0]).toMatchObject({ list: [{ id: 1, name: '张三' }], total: 1 })
    wrapper.unmount()
  })

  it('active=false 时不自动请求，点工具栏刷新按钮才请求', async () => {
    const wrapper = mount(DataGrid, {
      props: { api: '/users' },
      global: { stubs, directives: { loading: {} } }
    })
    await flushPromises()
    expect(mockHttpRequest).not.toHaveBeenCalled()

    // 工具栏刷新按钮
    await wrapper.find('button.el-button-stub').trigger('click')
    await flushPromises()
    expect(mockHttpRequest).toHaveBeenCalledTimes(1)
    wrapper.unmount()
  })

  it('声明式联动：refreshDataGrid 触发同 filter 组 DataGrid 刷新', async () => {
    const wrapper = mount(DataGrid, {
      props: { api: '/users', filter: 'g1' },
      global: { stubs, directives: { loading: {} } }
    })
    await flushPromises()
    expect(mockHttpRequest).not.toHaveBeenCalled()

    const count = refreshDataGrid(true, 'g1')
    await flushPromises()
    expect(count).toBe(1)
    expect(mockHttpRequest).toHaveBeenCalledTimes(1)
    wrapper.unmount()
  })

  it('分页变化：onChangeCurrentpage 更新分页参数并 emit page-change', async () => {
    const wrapper = mount(DataGrid, {
      props: { api: '/users', withPager: true },
      global: { stubs, directives: { loading: {} } }
    })
    await flushPromises()

    await (wrapper.vm as any).onChangeCurrentpage(3)
    await flushPromises()
    expect(lastPayload()).toMatchObject({ currentPage: 3, pageSize: 20 })
    expect(wrapper.emitted('page-change')?.length).toBe(1)

    await (wrapper.vm as any).onChangePagesize(50)
    await flushPromises()
    expect(lastPayload()).toMatchObject({ currentPage: 1, pageSize: 50 })
    wrapper.unmount()
  })

  it('static dataSource：不发请求，刷新为幂等 no-op', async () => {
    const wrapper = mount(DataGrid, {
      props: { dataSource: [{ id: 1, name: 'a' }], withPager: false },
      global: { stubs, directives: { loading: {} } }
    })
    await flushPromises()
    expect(mockHttpRequest).not.toHaveBeenCalled()
    await (wrapper.vm as any).refresh()
    await flushPromises()
    expect(mockHttpRequest).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('withPager=false 时不渲染分页区', async () => {
    const wrapper = mount(DataGrid, {
      props: { api: '/users', withPager: false },
      global: { stubs, directives: { loading: {} } }
    })
    await flushPromises()
    expect(wrapper.find('.el-pagination-stub').exists()).toBe(false)
    wrapper.unmount()
  })

  it('分页位置：默认 right，pagerPosition 可指定 left / center', async () => {
    const def = mount(DataGrid, {
      props: { api: '/users', active: true },
      global: { stubs, directives: { loading: {} } }
    })
    await flushPromises()
    const defBar = def.find('.wd-datagrid__bottom-bar')
    expect(defBar.exists()).toBe(true)
    expect(defBar.classes()).toContain('pager-at-right')
    def.unmount()

    const left = mount(DataGrid, {
      props: { api: '/users', active: true, pagerPosition: 'left' },
      global: { stubs, directives: { loading: {} } }
    })
    await flushPromises()
    expect(left.find('.wd-datagrid__bottom-bar').classes()).toContain('pager-at-left')
    left.unmount()

    const center = mount(DataGrid, {
      props: { api: '/users', active: true, pagerPosition: 'center' },
      global: { stubs, directives: { loading: {} } }
    })
    await flushPromises()
    expect(center.find('.wd-datagrid__bottom-bar').classes()).toContain('pager-at-center')
    center.unmount()
  })

  it('分页位置：全局配置 page.pager.position 生效，prop 优先于全局配置', async () => {
    setGlobalConfig({ page: { pager: { position: 'center' } } })
    const byGlobal = mount(DataGrid, {
      props: { api: '/users', active: true },
      global: { stubs, directives: { loading: {} } }
    })
    await flushPromises()
    expect(byGlobal.find('.wd-datagrid__bottom-bar').classes()).toContain('pager-at-center')
    byGlobal.unmount()

    const byProp = mount(DataGrid, {
      props: { api: '/users', active: true, pagerPosition: 'left' },
      global: { stubs, directives: { loading: {} } }
    })
    await flushPromises()
    expect(byProp.find('.wd-datagrid__bottom-bar').classes()).toContain('pager-at-left')
    byProp.unmount()
  })

  /** 定位模式切换按钮：唯一含 Menu/Grid 图标的工具按钮（表格态显示 Menu，卡片态显示 Grid） */
  function findModeBtn(wrapper: any) {
    return wrapper
      .findAll('button.el-button-stub')
      .find((b: any) => b.findComponent(Menu).exists() || b.findComponent(Grid).exists())
  }

  it('表格/列表清单模式：提供 card-item 插槽时渲染切换按钮，点击切换卡片/表格视图', async () => {
    const wrapper = mount(DataGrid, {
      props: { api: '/users', active: true, modeSwitch: true },
      slots: {
        'card-item': ({ row }: any) => h('div', { class: 'my-card-item' }, row.name)
      },
      global: { stubs, directives: { loading: {} } }
    })
    await flushPromises()
    // 默认表格视图，切换按钮可见
    expect(findModeBtn(wrapper)).toBeTruthy()
    expect(wrapper.find('.el-table-stub').exists()).toBe(true)
    expect(wrapper.find('.wd-datagrid__cards').exists()).toBe(false)

    // 点击切换为卡片视图：自定义 card-item 生效、表格卸载、emit mode-change
    await findModeBtn(wrapper).trigger('click')
    expect(wrapper.find('.wd-datagrid__cards').exists()).toBe(true)
    expect(wrapper.find('.el-table-stub').exists()).toBe(false)
    expect(wrapper.find('.my-card-item').text()).toBe('张三')
    expect(wrapper.emitted('mode-change')?.[0]).toEqual(['card'])

    // 再点切回表格视图
    await findModeBtn(wrapper).trigger('click')
    expect(wrapper.find('.el-table-stub').exists()).toBe(true)
    expect(wrapper.find('.wd-datagrid__cards').exists()).toBe(false)
    expect(wrapper.emitted('mode-change')?.[1]).toEqual(['table'])
    wrapper.unmount()
  })

  it('表格/列表清单模式：未提供 card-item 插槽时不渲染切换按钮（即使开启 modeSwitch）', async () => {
    const wrapper = mount(DataGrid, {
      props: { api: '/users', active: true, modeSwitch: true },
      global: { stubs, directives: { loading: {} } }
    })
    await flushPromises()
    expect(wrapper.findComponent(Menu).exists()).toBe(false)
    expect(wrapper.findComponent(Grid).exists()).toBe(false)
    wrapper.unmount()
  })

  it('搜索联动入口：search 带参请求并重置页码', async () => {
    const wrapper = mount(DataGrid, {
      props: { api: '/users' },
      global: { stubs, directives: { loading: {} } }
    })
    await flushPromises()
    await (wrapper.vm as any).search({ kw: 'x' })
    await flushPromises()
    expect(lastPayload()).toEqual({ currentPage: 1, pageSize: 20, param: { kw: 'x' } })
    wrapper.unmount()
  })

  it('tools.add/export：开启后左区渲染「新增/导出」按钮，点击分别 emit add / export', async () => {
    const wrapper = mount(DataGrid, {
      props: {
        dataSource: [{ id: 1, name: '张三' }],
        withPager: false,
        tools: { add: true, export: true, refresh: false, size: false }
      },
      global: { stubs, directives: { loading: {} } }
    })
    await flushPromises()

    const left = wrapper.find('.wd-datagrid__toolbar-left')
    const btnAdd = left.findAll('button.el-button-stub').find((b) => b.text().includes('新增'))
    const btnExport = left.findAll('button.el-button-stub').find((b) => b.text().includes('导出'))
    expect(btnAdd?.exists()).toBe(true)
    expect(btnExport?.exists()).toBe(true)

    await btnAdd!.trigger('click')
    await btnExport!.trigger('click')
    expect(wrapper.emitted('add')?.length).toBe(1)
    expect(wrapper.emitted('export')?.length).toBe(1)
    wrapper.unmount()
  })

  it('tools.add/export 默认关闭：不渲染对应按钮（开发人员可通过属性关闭）', async () => {
    const wrapper = mount(DataGrid, {
      props: {
        dataSource: [{ id: 1, name: '张三' }],
        withPager: false,
        tools: { refresh: false, size: false }
      },
      global: { stubs, directives: { loading: {} } }
    })
    await flushPromises()
    // 无任何开启项时工具栏整体不渲染
    expect(wrapper.find('.wd-datagrid__toolbar').exists()).toBe(false)
    expect(wrapper.find('.wd-datagrid__toolbar-left').exists()).toBe(false)
    wrapper.unmount()
  })

  it('toolbar 插槽：补充按钮渲染在左区内置按钮（新增）的最左侧', async () => {
    const wrapper = mount(DataGrid, {
      props: {
        dataSource: [{ id: 1, name: '张三' }],
        withPager: false,
        tools: { add: true, export: true, refresh: false }
      },
      slots: {
        toolbar: () => h('button', { class: 'custom-toolbar-btn' }, '批量导入')
      },
      global: { stubs, directives: { loading: {} } }
    })
    await flushPromises()

    const leftEl = wrapper.find('.wd-datagrid__toolbar-left').element
    const nodes = Array.from(leftEl.children)
    const slotIdx = nodes.findIndex((n) => n.classList.contains('custom-toolbar-btn'))
    const addIdx = nodes.findIndex((n) => n.textContent?.includes('新增'))
    expect(slotIdx).toBeGreaterThanOrEqual(0)
    expect(addIdx).toBeGreaterThan(slotIdx)
    wrapper.unmount()
  })

  it('tools.size：菜单禁用态跟随当前尺寸，切到 大/小 后可切回「默认」', async () => {
    const wrapper = mount(DataGrid, {
      props: {
        dataSource: [{ id: 1, name: '张三' }],
        withPager: false,
        tools: { refresh: false, size: true }
      },
      global: { stubs, directives: { loading: {} } }
    })
    await flushPromises()

    const item = (label: string) =>
      wrapper
        .findAll('.wd-datagrid__toolbar-right .el-dropdown-item-stub')
        .find((i) => i.text().includes(label))!

    // 初始 default：当前项（默认）禁用
    expect(item('默认').attributes('disabled')).toBe('')
    // 切到「大」：禁用态随之迁移，默认项恢复可点（回归点：旧绑定 tableSize prop 恒默认导致无法切回）
    await item('大').trigger('click')
    await flushPromises()
    expect(wrapper.find('.el-table-stub').attributes('size')).toBe('large')
    expect(item('大').attributes('disabled')).toBe('')
    expect(item('默认').attributes('disabled')).toBeUndefined()
    // 再切回「默认」：尺寸恢复 default
    await item('默认').trigger('click')
    await flushPromises()
    expect(wrapper.find('.el-table-stub').attributes('size')).toBe('default')
    expect(item('默认').attributes('disabled')).toBe('')
    wrapper.unmount()
  })

  it('组件卸载后从联动中心注销', async () => {
    const wrapper = mount(DataGrid, {
      props: { api: '/users', filter: 'tmp' },
      global: { stubs, directives: { loading: {} } }
    })
    await flushPromises()
    wrapper.unmount()
    expect(refreshDataGrid(true, 'tmp')).toBe(0)
  })
})

describe('DataGrid 选中项 modelValue 双向绑定 + selectionKey', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetConfig()
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  /** 获取 el-table 桩实例（模拟 EP 表格实例） */
  function tableStub(wrapper: ReturnType<typeof mount>) {
    return wrapper.findComponent({ name: 'el-table' }).vm as any
  }

  const rows = [
    { id: 1, name: '张三' },
    { id: 2, name: '李四' },
    { id: 3, name: '王五' }
  ]

  function mountGrid(extraProps: Record<string, any> = {}, slots: Record<string, any> = {}) {
    return mount(DataGrid, {
      props: {
        dataSource: rows,
        withPager: false,
        withSelection: true,
        tools: { refresh: false, size: false },
        ...extraProps
      },
      slots,
      global: { stubs, directives: { loading: {} } }
    })
  }

  it('默认（无 selectionKey）：勾选后 selection-change / update:modelValue 返回完整行对象数组', async () => {
    const wrapper = mountGrid()
    await flushPromises()

    tableStub(wrapper).triggerSelectionChange([rows[0], rows[2]])
    await flushPromises()

    expect(wrapper.emitted('selection-change')?.at(-1)?.[0]).toEqual([rows[0], rows[2]])
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toEqual([rows[0], rows[2]])
    expect((wrapper.vm as any).getSelection()).toEqual([rows[0], rows[2]])
    wrapper.unmount()
  })

  it('设置 selectionKey：返回对应字段值数组，getSelection 一致', async () => {
    const wrapper = mountGrid({ selectionKey: 'id' })
    await flushPromises()

    tableStub(wrapper).triggerSelectionChange([rows[0], rows[1]])
    await flushPromises()

    expect(wrapper.emitted('selection-change')?.at(-1)?.[0]).toEqual([1, 2])
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toEqual([1, 2])
    expect((wrapper.vm as any).getSelection()).toEqual([1, 2])
    wrapper.unmount()
  })

  it('设置 modelValue（selectionKey 值数组）：数据就绪后对应行被勾选，且回显不反向 emit', async () => {
    const wrapper = mountGrid({ selectionKey: 'id', modelValue: [1, 3] })
    await flushPromises()
    // 数据/勾选经 nextTick 落地
    await flushPromises()

    // 勾选的正是 id=1 / id=3 两行
    expect((wrapper.vm as any).getSelection()).toEqual([1, 3])
    // 回显是程序化勾选，不应触发对外 update:modelValue（避免循环）
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    wrapper.unmount()
  })

  it('设置 modelValue（无 selectionKey 传行数组）：按引用回显勾选', async () => {
    const wrapper = mountGrid({ modelValue: [rows[1]] })
    await flushPromises()
    await flushPromises()

    expect((wrapper.vm as any).getSelection()).toEqual([rows[1]])
    wrapper.unmount()
  })

  it('modelValue 由非空改为空数组：清空表格勾选', async () => {
    const wrapper = mountGrid({ selectionKey: 'id', modelValue: [1, 3] })
    await flushPromises()
    await flushPromises()
    expect((wrapper.vm as any).getSelection()).toEqual([1, 3])

    // 父组件清空选中 → 表格勾选同步清空（空→空不会误触发）
    await wrapper.setProps({ modelValue: [] })
    await flushPromises()
    await flushPromises()
    expect((wrapper.vm as any).getSelection()).toEqual([])
    wrapper.unmount()
  })
})

describe('DataGrid 跨页选择「购物车」（withSelectionCart）', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetConfig()
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  function mountCart(props: Record<string, any> = {}) {
    return mount(DataGrid, {
      props: {
        api: '/users',
        active: true,
        rowKey: 'id',
        withSelection: true,
        withSelectionCart: true,
        cartRowKey: 'id',
        tools: { refresh: false },
        ...props
      },
      global: { stubs, directives: { loading: {} } }
    })
  }

  function tableStub(wrapper: ReturnType<typeof mount>) {
    return wrapper.findComponent({ name: 'el-table' }).vm as any
  }

  it('开启后渲染收集按钮；勾选行跨页累计（cart-change + 角标数量 + getCartList）', async () => {
    listOk([
      { id: 1, name: '张三' },
      { id: 2, name: '李四' }
    ], 2)
    const wrapper = mountCart()
    await flushPromises()

    // 收集按钮存在（独立于 tools），初始角标隐藏（el-badge hidden）
    const btn = wrapper.find('.wd-datagrid__cart-btn')
    expect(btn.exists()).toBe(true)
    expect(wrapper.find('.el-badge-stub__value').exists()).toBe(false)

    const rows = [
      { id: 1, name: '张三' },
      { id: 2, name: '李四' }
    ]
    tableStub(wrapper).triggerSelectionChange([rows[0]])
    await flushPromises()
    expect(wrapper.emitted('cart-change')?.at(-1)?.[0]).toEqual([rows[0]])
    expect((wrapper.vm as any).getCartList()).toEqual([rows[0]])
    expect(wrapper.find('.el-badge-stub__value').text()).toBe('1')

    tableStub(wrapper).triggerSelectionChange(rows)
    await flushPromises()
    expect((wrapper.vm as any).getCartList()).toHaveLength(2)
    expect(wrapper.find('.el-badge-stub__value').text()).toBe('2')
    wrapper.unmount()
  })

  it('cartRowKey 去重：同 key 重复勾选只保留一份（后入者为准）', async () => {
    listOk([{ id: 1, name: '张三' }], 1)
    const wrapper = mountCart()
    await flushPromises()

    const a = { id: 1, name: '张三' }
    const b = { id: 1, name: '张三（新）' }
    tableStub(wrapper).triggerSelectionChange([a])
    await flushPromises()
    tableStub(wrapper).triggerSelectionChange([b])
    await flushPromises()

    expect((wrapper.vm as any).getCartList()).toHaveLength(1)
    expect((wrapper.vm as any).getCartList()[0]).toMatchObject({ id: 1, name: '张三（新）' })
    wrapper.unmount()
  })

  it('翻页/刷新不清空购物车；翻回含暂存行的页自动回勾', async () => {
    const page1 = [{ id: 1, name: '张三' }]
    const page2 = [
      { id: 2, name: '李四' },
      { id: 3, name: '王五' }
    ]
    mockHttpRequest
      .mockResolvedValueOnce({ success: true, data: { list: page1, total: 3, pageSize: 20, currentPage: 1 } })
      .mockResolvedValueOnce({ success: true, data: { list: page2, total: 3, pageSize: 20, currentPage: 2 } })
      .mockResolvedValueOnce({ success: true, data: { list: page1, total: 3, pageSize: 20, currentPage: 1 } })
    const wrapper = mountCart()
    await flushPromises()

    // 第 1 页勾选 id=1
    tableStub(wrapper).triggerSelectionChange([page1[0]])
    await flushPromises()
    expect((wrapper.vm as any).getCartList()).toHaveLength(1)

    // 翻到第 2 页：购物车不清空、不误勾
    await (wrapper.vm as any).onChangeCurrentpage(2)
    await flushPromises()
    expect((wrapper.vm as any).getCartList()).toHaveLength(1)
    expect((wrapper.vm as any).getCartList()[0]).toMatchObject({ id: 1 })
    expect((wrapper.vm as any).getSelection()).toEqual([])

    // 翻回第 1 页：自动回勾 id=1
    await (wrapper.vm as any).onChangeCurrentpage(1)
    await flushPromises()
    expect((wrapper.vm as any).getSelection()).toEqual([page1[0]])
    wrapper.unmount()
  })

  it('openCart 打开面板：默认内容逐条展示 + 清空按钮生效（计数归零）', async () => {
    listOk([{ id: 1, name: '张三' }], 1)
    const wrapper = mountCart()
    await flushPromises()

    tableStub(wrapper).triggerSelectionChange([{ id: 1, name: '张三' }])
    await flushPromises()

    // 点击收集按钮打开面板（el-dialog stub，页面含列设置弹层 stub，需按购物车列表定位）
    await wrapper.find('.wd-datagrid__cart-btn').trigger('click')
    await flushPromises()
    const cartDialog = wrapper.findAll('.el-dialog-stub').find((d) => d.find('.wd-datagrid__cart-list').exists())
    expect(cartDialog?.exists()).toBe(true)
    expect(cartDialog!.text()).toContain('张三')

    // 面板「清空」按钮 → 购物车清空、角标消失
    const clearBtn = wrapper.findAll('button.el-button-stub').find((b) => b.text().includes('清空'))
    expect(clearBtn?.exists()).toBe(true)
    await clearBtn!.trigger('click')
    await flushPromises()
    expect((wrapper.vm as any).getCartList()).toHaveLength(0)
    expect(wrapper.find('.wd-datagrid__cart-badge').exists()).toBe(false)
    wrapper.unmount()
  })

  it('clearCart() 方法：清空购物车并 emit cart-change', async () => {
    listOk([{ id: 1, name: '张三' }], 1)
    const wrapper = mountCart()
    await flushPromises()

    tableStub(wrapper).triggerSelectionChange([{ id: 1, name: '张三' }])
    await flushPromises()
    expect((wrapper.vm as any).getCartList()).toHaveLength(1)

    await (wrapper.vm as any).clearCart()
    await flushPromises()
    expect((wrapper.vm as any).getCartList()).toHaveLength(0)
    expect(wrapper.emitted('cart-change')?.at(-1)?.[0]).toEqual([])
    wrapper.unmount()
  })
})

describe('DataGrid height 高度模式（height:fix / 固定高度）', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  /** 造一个「定高约束祖先」并模拟 happy-dom 缺失的布局几何 */
  function makeHost(clientHeight: number) {
    const host = document.createElement('div')
    document.body.appendChild(host)
    host.style.height = '600px'
    host.style.overflowY = 'hidden'
    Object.defineProperty(host, 'clientHeight', { configurable: true, value: clientHeight })
    Object.defineProperty(host, 'clientTop', { configurable: true, value: 0 })
    Object.defineProperty(host, 'scrollTop', { configurable: true, value: 0 })
    const origCS = window.getComputedStyle.bind(window)
    vi.spyOn(window, 'getComputedStyle').mockImplementation(((el: Element) => {
      if (el === host) {
        return { height: '600px', maxHeight: 'none', overflowY: 'hidden', paddingBottom: '0px' } as unknown as CSSStyleDeclaration
      }
      return origCS(el)
    }) as typeof window.getComputedStyle)
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
      (() =>
        ({
          top: 0, bottom: 0, left: 0, right: 0, x: 0, y: 0,
          width: 0, height: 0, toJSON: () => ({})
        })) as any
    )
    return host
  }

  it('height 传数字：el-table 绑定固定高度（行区内滚动）', async () => {
    const wrapper = mount(DataGrid, {
      props: { dataSource: [{ id: 1, name: 'a' }], withPager: false, height: 480, tools: { refresh: false } },
      global: { stubs, directives: { loading: {} } }
    })
    await flushPromises()
    expect(wrapper.find('.el-table-stub').attributes('height')).toBe('480')
    wrapper.unmount()
  })

  it("height='fix'：贴合最近可约束祖先（定高容器），根高与表体高=容器内容区可用高", async () => {
    const host = makeHost(560)
    const wrapper = mount(DataGrid, {
      props: { dataSource: [{ id: 1, name: 'a' }], withPager: false, height: 'fix', tools: { refresh: false } },
      global: { stubs, directives: { loading: {} } },
      attachTo: host
    })
    await flushPromises()

    const style = (wrapper.find('.wd-datagrid').attributes('style') || '').replace(/\s+/g, '')
    expect(style).toContain('height:560px')
    expect(wrapper.find('.el-table-stub').attributes('height')).toBe('560')
    wrapper.unmount()
    host.remove()
  })

  it("height='fix'：祖先尺寸变化（resize/折叠）后自动重算", async () => {
    const host = makeHost(560)
    const wrapper = mount(DataGrid, {
      props: { dataSource: [{ id: 1, name: 'a' }], withPager: false, height: 'fix', tools: { refresh: false } },
      global: { stubs, directives: { loading: {} } },
      attachTo: host
    })
    await flushPromises()
    expect(wrapper.find('.el-table-stub').attributes('height')).toBe('560')

    Object.defineProperty(host, 'clientHeight', { configurable: true, value: 760 })
    window.dispatchEvent(new Event('resize'))
    await flushPromises()

    const style = (wrapper.find('.wd-datagrid').attributes('style') || '').replace(/\s+/g, '')
    expect(style).toContain('height:760px')
    expect(wrapper.find('.el-table-stub').attributes('height')).toBe('760')
    wrapper.unmount()
    host.remove()
  })

  it("height='fix'：无任何可约束祖先时退化为内容自适应（不撑高、表体不定高）", async () => {
    const wrapper = mount(DataGrid, {
      props: { dataSource: [{ id: 1, name: 'a' }], withPager: false, height: 'fix', tools: { refresh: false } },
      global: { stubs, directives: { loading: {} } }
    })
    await flushPromises()

    expect(wrapper.find('.wd-datagrid').attributes('style')).toBeUndefined()
    expect(wrapper.find('.el-table-stub').attributes('height')).toBeUndefined()
    wrapper.unmount()
  })
})
