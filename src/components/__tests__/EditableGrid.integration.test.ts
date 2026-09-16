import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, provide, inject, type InjectionKey } from 'vue'
import EditableGrid from '../data/editable-grid/EditableGrid.vue'

// mock 网络层（saveAll 接口模式会走 request.post / useDataGrid 走 request.request）
const { mockHttpPost, mockHttpRequest } = vi.hoisted(() => ({
  mockHttpPost: vi.fn(),
  mockHttpRequest: vi.fn()
}))
vi.mock('../../lib/core/http', () => ({
  request: {
    request: mockHttpRequest,
    get: vi.fn(),
    post: mockHttpPost,
    put: vi.fn(),
    delete: vi.fn()
  }
}))

// mock element-plus：拦截 ElMessage / ElMessageBox（模板里的 el-* 走下方 stubs 注册）
const { mockElMessage, mockConfirm } = vi.hoisted(() => {
  const mockElMessage: Record<string, any> = vi.fn()
  ;['success', 'warning', 'error', 'info', 'close'].forEach((m) => {
    mockElMessage[m] = vi.fn()
  })
  return { mockElMessage, mockConfirm: vi.fn() }
})
vi.mock('element-plus', () => ({
  ElMessage: mockElMessage,
  ElMessageBox: { confirm: mockConfirm }
}))

/* ---------- 桩：el-table 提供行数据/单元格点击，el-table-column 逐行渲染 default 槽 ---------- */
interface TableCtx {
  rows: Record<string, any>[]
  onCellClick?: (row: Record<string, any>, column: { property: string }) => void
}
const tableCtxKey: InjectionKey<TableCtx> = Symbol('wd-table-ctx')

const ElTable = defineComponent({
  name: 'el-table',
  props: { data: { type: Array, default: () => [] } },
  setup(props, { slots, attrs }) {
    const cls = ['el-table-stub', attrs.class].filter(Boolean).join(' ')
    provide(tableCtxKey, {
      rows: (props.data as Record<string, any>[]) || [],
      onCellClick: (attrs as any).onCellClick
    })
    return () => h('div', { class: cls }, slots.default?.())
  }
})

const ElTableColumn = defineComponent({
  name: 'el-table-column',
  props: { prop: String, type: String },
  setup(p, { slots }) {
    const ctx = inject(tableCtxKey, { rows: [] as Record<string, any>[] })
    return () => {
      if (p.type === 'selection' || p.type === 'index') return h('div', { class: 'el-col-meta-stub' })
      const rows = ctx.rows
      return h(
        'div',
        { class: 'el-table-column-stub' },
        rows.map((row, i) =>
          h(
            'div',
            {
              class: 'wd-test-row',
              onClick: () => ctx.onCellClick?.(row, { property: p.prop as string })
            },
            slots.default?.({ row, column: { property: p.prop }, $index: i })
          )
        )
      )
    }
  }
})

/** 工具栏 / 操作列按钮 */
const ElButton = defineComponent({
  name: 'el-button',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () =>
      h(
        'button',
        { class: 'el-button-stub', onClick: (e: MouseEvent) => (attrs as any).onClick?.(e) },
        slots.default?.()
      )
  }
})

/** 编辑器 el-input：v-model + change/blur 事件，模拟真实提交时机 */
const ElInput = defineComponent({
  name: 'el-input',
  inheritAttrs: false,
  props: { modelValue: { default: undefined }, placeholder: String },
  setup(p, { attrs, emit, expose }) {
    expose({ focus: () => undefined })
    const onInput = (e: Event) => emit('update:modelValue', (e.target as HTMLInputElement).value)
    const onChange = () => emit('change', p.modelValue)
    const onBlur = () => emit('blur')
    return () =>
      h('input', {
        class: 'el-input-stub',
        value: p.modelValue ?? '',
        onInput,
        onChange,
        onBlur
      })
  }
})

const ElEmpty = defineComponent({
  name: 'el-empty',
  setup(_, { slots }) {
    return () => h('div', { class: 'el-empty-stub' }, slots.default?.())
  }
})

/** 其余 el-* 叶子组件：纯透传默认插槽，避免真实 EP 渲染依赖与告警 */
function passStub(name: string) {
  return defineComponent({
    name,
    setup(_p, { slots }) {
      return () => h('div', { class: `${name}-stub` }, slots.default?.())
    }
  })
}

const stubs = {
  'el-table': ElTable,
  'el-table-column': ElTableColumn,
  'el-button': ElButton,
  'el-input': ElInput,
  'el-empty': ElEmpty,
  'el-tooltip': passStub('el-tooltip'),
  'el-icon': passStub('el-icon'),
  'el-input-number': passStub('el-input-number'),
  'el-select': passStub('el-select'),
  'el-option': passStub('el-option'),
  'el-date-picker': passStub('el-date-picker'),
  'el-pagination': passStub('el-pagination'),
  'el-checkbox': passStub('el-checkbox'),
  'el-dialog': passStub('el-dialog'),
  'el-dropdown': passStub('el-dropdown'),
  'el-dropdown-menu': passStub('el-dropdown-menu'),
  'el-dropdown-item': passStub('el-dropdown-item')
}

/* ---------- 夹具 ---------- */
const nameCol = (extra: Record<string, any> = {}) => ({
  prop: 'name',
  label: '名称',
  editor: 'input' as const,
  ...extra
})

function mountGrid(props: Record<string, any> = {}, options: Record<string, any> = {}) {
  return mount(EditableGrid, {
    props: {
      dataSource: [{ id: 1, name: '张三' }],
      withPager: false,
      withAdd: false,
      editMode: 'cell',
      tools: { refresh: false },
      columns: [nameCol()],
      ...props
    },
    global: { stubs, directives: { loading: {} }, ...options }
  })
}

async function openCellEditor(wrapper: ReturnType<typeof mountGrid>) {
  await wrapper.find('.wd-test-row').trigger('click')
  await flushPromises()
}

async function commitValue(wrapper: ReturnType<typeof mountGrid>, value: string) {
  const input = wrapper.find('input.el-input-stub')
  await input.setValue(value)
  await input.trigger('change')
  await flushPromises()
}

function cell(wrapper: ReturnType<typeof mountGrid>) {
  return wrapper.find('.wd-editable-grid__cell')
}

function clickButtonByText(wrapper: ReturnType<typeof mountGrid>, text: string) {
  const btn = wrapper.findAll('button.el-button-stub').find((b) => b.text().trim().startsWith(text))
  if (!btn) throw new Error(`button not found: ${text}`)
  return btn.trigger('click')
}

describe('EditableGrid 单元格已修改样式 + ElForm 风格 rules 校验', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('cell 模式：单元格值变化后出现 is-dirty 已修改样式，改回原值样式消失', async () => {
    const wrapper = mountGrid()
    await openCellEditor(wrapper)

    // 初始未修改：无已修改样式
    expect(cell(wrapper).classes()).not.toContain('is-dirty')

    await commitValue(wrapper, '李四')
    expect(cell(wrapper).classes()).toContain('is-dirty')
    expect(wrapper.vm.getDirtyRows().length).toBe(1)

    // 改回原值：样式消除，且该行不再计入脏行
    await commitValue(wrapper, '张三')
    expect(cell(wrapper).classes()).not.toContain('is-dirty')
    expect(wrapper.vm.getDirtyRows().length).toBe(0)
    wrapper.unmount()
  })

  it('cell 模式：值不满足与 ElForm 一致的 rules 时，单元格显示 is-error 约束样式并带错误提示', async () => {
    const wrapper = mountGrid({ columns: [nameCol({ rules: [{ required: true, message: '名称不能为空', trigger: 'change' }] })] })
    await openCellEditor(wrapper)

    await commitValue(wrapper, '')
    expect(cell(wrapper).classes()).toContain('is-error')
    expect(cell(wrapper).attributes('title')).toBe('名称不能为空')

    // 修改为满足规则后，错误样式消除
    await commitValue(wrapper, '李四')
    expect(cell(wrapper).classes()).not.toContain('is-error')
    wrapper.unmount()
  })

  it('批量保存：存在校验失败的单元格时中断保存并提示，不提交数据', async () => {
    const wrapper = mountGrid({
      saveApi: '/batch/save',
      columns: [nameCol({ rules: [{ required: true, message: '名称不能为空', trigger: 'change' }] })]
    })
    await openCellEditor(wrapper)
    await commitValue(wrapper, '')

    await clickButtonByText(wrapper, '批量保存')
    await flushPromises()

    // 中断：不发保存请求、不 emit save / update
    expect(mockHttpPost).not.toHaveBeenCalled()
    expect(wrapper.emitted('save')).toBeUndefined()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    // 提示 + validate-fail 事件
    expect(mockElMessage.warning).toHaveBeenCalled()
    expect(String(mockElMessage.warning.mock.calls[0][0])).toContain('名称不能为空')
    const fail = wrapper.emitted('validate-fail')
    expect(fail?.length).toBe(1)
    expect(fail?.[0][0]).toMatchObject({ index: 0, column: 'name', error: '名称不能为空' })
    wrapper.unmount()
  })

  it('批量保存：全部单元格满足规则时正常保存，保存后已修改样式清空', async () => {
    const wrapper = mountGrid({
      saveApi: '',
      columns: [nameCol({ rules: [{ required: true, message: '名称不能为空', trigger: 'change' }] })]
    })
    await openCellEditor(wrapper)
    await commitValue(wrapper, '李四')
    expect(cell(wrapper).classes()).not.toContain('is-error')

    await clickButtonByText(wrapper, '批量保存')
    await flushPromises()

    expect(wrapper.emitted('save')?.length).toBe(1)
    expect(wrapper.emitted('save')?.[0][0].rows[0]).toMatchObject({ id: 1, name: '李四' })
    // 保存成功：清空已修改样式
    expect(cell(wrapper).classes()).not.toContain('is-dirty')
    expect(cell(wrapper).classes()).not.toContain('is-error')
    wrapper.unmount()
  })

  it('row 模式：行内编辑修改的单元格出现已修改样式，取消编辑后还原并消除样式', async () => {
    const wrapper = mountGrid({ editMode: 'row' })
    await clickButtonByText(wrapper, '编辑')
    await flushPromises()

    await commitValue(wrapper, '李四')
    expect(cell(wrapper).classes()).toContain('is-dirty')

    await clickButtonByText(wrapper, '取消')
    await flushPromises()
    expect(cell(wrapper).classes()).not.toContain('is-dirty')
    expect(wrapper.vm.getDirtyRows().length).toBe(0)
    wrapper.unmount()
  })
})
