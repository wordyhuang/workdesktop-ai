import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import DataGrid from '../data/datagrid/DataGrid.vue'
import { resetConfig } from '../../lib/core/config'
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
    return () =>
      h(
        'button',
        {
          class: 'el-button-stub',
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
  setup(_, { slots, attrs }) {
    return () => h('div', { class: 'el-table-stub', ...attrs }, slots.default?.())
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
    return () => h('div', { class: 'el-dialog-stub' }, _p.modelValue ? slots.default?.() : null)
  }
})
const ElCheckbox = defineComponent({
  name: 'el-checkbox',
  setup(_, { slots }) {
    return () => h('label', { class: 'el-checkbox-stub' }, slots.default?.())
  }
})
const ElDropdown = defineComponent({
  name: 'el-dropdown',
  setup(_p, { slots }) {
    return () => h('span', { class: 'el-dropdown-stub' }, slots.default?.())
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
  setup(_p, { slots }) {
    return () => h('div', { class: 'el-dropdown-item-stub' }, slots.default?.())
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
