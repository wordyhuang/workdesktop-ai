import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import DataForm from '../form/data-form/DataForm.vue'
import { registerDataGrid, clearLinkageRegistry } from '../../lib/core/linkage'

// mock http：DataForm 直接调用 request.get / post / put
const { mockRequest } = vi.hoisted(() => {
  const mockRequest: Record<string, ReturnType<typeof vi.fn>> = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
  return { mockRequest }
})
vi.mock('../../lib/core/http', () => ({
  request: mockRequest
}))

// mock element-plus：DataForm 仅使用 ElMessage / ElMessageBox
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

/* ---------- el-form / el-button 桩 ---------- */
/** 校验失败开关：模拟表单校验不通过 */
let forceValidateFail = false
const ElFormStub = defineComponent({
  name: 'el-form',
  setup(_p, { expose, slots }) {
    const validate = async () => {
      if (forceValidateFail) throw new Error('invalid')
      return true
    }
    const clearValidate = () => {}
    expose({ validate, clearValidate, resetFields: () => {} })
    return () => h('form', { class: 'el-form-stub' }, slots.default?.())
  }
})
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

const global = { stubs: { 'el-form': ElFormStub, 'el-button': ElButton }, directives: { loading: {} } }

describe('DataForm 集成（表单链路 + http + 声明式联动）', () => {
  let refreshSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    clearLinkageRegistry()
    mockConfirm.mockResolvedValue('confirm')
    refreshSpy = vi.fn()
    registerDataGrid({ filter: 'main', refresh: refreshSpy })
    mockRequest.get.mockResolvedValue({ success: true, data: { name: '原值', age: 18 } })
    mockRequest.post.mockResolvedValue({ success: true, data: { id: 9 } })
    mockRequest.put.mockResolvedValue({ success: true, data: { id: 9 } })
  })
  afterEach(() => {
    vi.restoreAllMocks()
    clearLinkageRegistry()
  })

  it('edit + api：挂载自动请求详情并回填，emit load-success', async () => {
    const wrapper = mount(DataForm, {
      props: { mode: 'edit', api: '/detail', active: true, headCloseDrawer: false },
      global
    })
    await flushPromises()
    expect(mockRequest.get).toHaveBeenCalledWith('/detail', {})
    expect((wrapper.vm as any).getFormData()).toEqual({ name: '原值', age: 18 })
    expect(wrapper.emitted('load-success')?.[0][0]).toEqual({ name: '原值', age: 18 })
    wrapper.unmount()
  })

  it('create 提交成功：请求载荷正确、刷新同组 DataGrid、emit submit-success + close', async () => {
    const wrapper = mount(DataForm, {
      props: {
        submitApi: '/save',
        headRefreshDatagrid: true,
        filter: 'main',
        data: { name: '新增', age: 1 }
      },
      global
    })
    await flushPromises()
    await (wrapper.vm as any).submitForm()
    await flushPromises()

    expect(mockRequest.post).toHaveBeenCalledWith('/save', { name: '新增', age: 1 })
    expect(refreshSpy).toHaveBeenCalledTimes(1)
    expect(wrapper.emitted('submit-success')?.[0][0]).toEqual({ id: 9 })
    expect(wrapper.emitted('close')?.[0][0]).toEqual({ reason: 'submit' })
    wrapper.unmount()
  })

  it('保存并继续：提交成功后清空表单且不关闭', async () => {
    const wrapper = mount(DataForm, {
      props: {
        submitApi: '/save',
        headRefreshDatagrid: false,
        headCloseDrawer: false,
        data: { name: 'n1' }
      },
      global
    })
    await flushPromises()
    await (wrapper.vm as any).submitForm(true)
    await flushPromises()
    expect(wrapper.emitted('close')).toBeUndefined()
    expect((wrapper.vm as any).getFormData()).toEqual({})
    wrapper.unmount()
  })

  it('业务失败：emit submit-fail、不刷新、不关闭', async () => {
    mockRequest.post.mockResolvedValue({ success: false, data: null, code: -1, message: 'no' })
    const wrapper = mount(DataForm, {
      props: { submitApi: '/save', headRefreshDatagrid: true, filter: 'main', data: { name: 'a' } },
      global
    })
    await flushPromises()
    await (wrapper.vm as any).submitForm()
    await flushPromises()
    expect(wrapper.emitted('submit-fail')).toBeTruthy()
    expect(refreshSpy).not.toHaveBeenCalled()
    expect(wrapper.emitted('close')).toBeUndefined()
    wrapper.unmount()
  })

  it('无 submitApi：直接 emit submit-success 走联动关闭', async () => {
    const wrapper = mount(DataForm, {
      props: { headRefreshDatagrid: false, data: { name: '本地' } },
      global
    })
    await flushPromises()
    await (wrapper.vm as any).submitForm()
    await flushPromises()
    expect(mockRequest.post).not.toHaveBeenCalled()
    expect(wrapper.emitted('submit-success')?.[0][0]).toEqual({ name: '本地' })
    expect(wrapper.emitted('close')?.[0][0]).toEqual({ reason: 'submit' })
    wrapper.unmount()
  })

  it('submitKeys 白名单过滤提交字段', async () => {
    const wrapper = mount(DataForm, {
      props: { submitApi: '/save', submitKeys: 'name', headCloseDrawer: false, data: { name: 'n', age: 2 } },
      global
    })
    await flushPromises()
    await (wrapper.vm as any).submitForm()
    await flushPromises()
    expect(mockRequest.post).toHaveBeenCalledWith('/save', { name: 'n' })
    wrapper.unmount()
  })

  it('submitExcludeKeys 黑名单剔除提交字段', async () => {
    const wrapper = mount(DataForm, {
      props: {
        submitApi: '/save',
        submitExcludeKeys: ['_idx'],
        headCloseDrawer: false,
        data: { name: 'n', _idx: 3 }
      },
      global
    })
    await flushPromises()
    await (wrapper.vm as any).submitForm()
    await flushPromises()
    expect(mockRequest.post).toHaveBeenCalledWith('/save', { name: 'n' })
    wrapper.unmount()
  })

  it('校验失败：不请求并提示', async () => {
    const wrapper = mount(DataForm, {
      props: { submitApi: '/save', data: { name: 'a' } },
      global
    })
    await flushPromises()
    forceValidateFail = true
    try {
      await (wrapper.vm as any).submitForm()
    } finally {
      forceValidateFail = false
    }
    await flushPromises()
    expect(mockElMessage.warning).toHaveBeenCalledWith('请完善表单必填项')
    expect(mockRequest.post).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('修改检测：isDirty / resetForm 回填原值', async () => {
    const wrapper = mount(DataForm, {
      props: { mode: 'edit', api: '/detail', active: true, headCloseDrawer: false },
      global
    })
    await flushPromises()
    expect((wrapper.vm as any).isDirty()).toBe(false)

    // 修改 model（DataForm 会把 model 挂到 app.globalProperties.model）
    const model = (wrapper.vm as any).$.appContext.config.globalProperties.model
    model.age = 99
    expect((wrapper.vm as any).isDirty()).toBe(true)

    await (wrapper.vm as any).resetForm()
    expect((wrapper.vm as any).getFormData()).toEqual({ name: '原值', age: 18 })
    wrapper.unmount()
  })

  it('beforeLeave：无修改直接放行；有修改且取消则拦截', async () => {
    const wrapper = mount(DataForm, {
      props: { mode: 'edit', api: '/detail', active: true, headCloseDrawer: false },
      global
    })
    await flushPromises()
    expect(await (wrapper.vm as any).beforeLeave()).toBe(true)

    const model = (wrapper.vm as any).$.appContext.config.globalProperties.model
    model.name = '改过'
    mockConfirm.mockRejectedValueOnce('cancel')
    expect(await (wrapper.vm as any).beforeLeave()).toBe(false)
    mockConfirm.mockResolvedValueOnce('confirm')
    expect(await (wrapper.vm as any).beforeLeave()).toBe(true)
    wrapper.unmount()
  })

  it('edit 模式容器数据（props.data）在挂载时回填', async () => {
    const wrapper = mount(DataForm, {
      props: { mode: 'edit', data: { name: '外部', age: 30 }, headCloseDrawer: false },
      global
    })
    await flushPromises()
    expect((wrapper.vm as any).getFormData()).toEqual({ name: '外部', age: 30 })
    wrapper.unmount()
  })
})
