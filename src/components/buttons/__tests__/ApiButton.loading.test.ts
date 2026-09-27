/**
 * ApiButton 按钮级 loading 回归测试
 * 背景：实测点击请求时 el-button 从未收到 loading=true（按钮不转圈），锁定该链路。
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent } from 'vue'
import ApiButton from '../ApiButton.vue'

vi.mock('element-plus', () => ({
  ElMessage: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
  ElMessageBox: { prompt: vi.fn() },
  ElLoading: { service: vi.fn(() => ({ close: vi.fn() })) },
  ElTooltip: { name: 'ElTooltip' }
}))

const requestMock = vi.fn()
vi.mock('../../lib/core/http', () => ({
  request: { request: (...args: any[]) => requestMock(...args) }
}))

const ElButtonStub = defineComponent({
  name: 'ElButton',
  props: { loading: Boolean },
  emits: ['click'],
  template:
    '<button class="el-button-stub" :class="{ \'is-loading\': loading }" @click="$emit(\'click\', $event)"><slot /></button>'
})

const ElTooltipStub = defineComponent({
  name: 'ElTooltip',
  template: '<div class="tooltip-stub"><slot /></div>'
})

function mountBtn(props: Record<string, any> = {}) {
  return mount(ApiButton, {
    props: { api: '/user/save', ...props },
    global: {
      stubs: { 'el-button': ElButtonStub, 'el-tooltip': ElTooltipStub }
    }
  })
}

beforeEach(() => {
  requestMock.mockReset()
  document.body.innerHTML = ''
})

describe('ApiButton 按钮级 loading', () => {
  it('请求期间 el-button 收到 loading=true（挂起请求验证）', async () => {
    let resolveReq: (v: any) => void = () => {}
    requestMock.mockImplementation(
      () => new Promise((res) => { resolveReq = res })
    )

    const wrapper = mountBtn()
    const btn = wrapper.find('button.el-button-stub')
    expect(btn.classes()).not.toContain('is-loading')

    await btn.trigger('click')
    // 请求挂起中：loading 应已置 true
    expect(btn.classes()).toContain('is-loading')

    resolveReq({ success: true, data: {}, code: 0, message: 'ok' })
    await vi.waitFor(() => {
      expect(btn.classes()).not.toContain('is-loading')
    })
  })

  it('buttonLoading=false 时请求期间不转圈', async () => {
    let resolveReq: (v: any) => void = () => {}
    requestMock.mockImplementation(
      () => new Promise((res) => { resolveReq = res })
    )

    const wrapper = mountBtn({ buttonLoading: false })
    const btn = wrapper.find('button.el-button-stub')
    await btn.trigger('click')
    expect(btn.classes()).not.toContain('is-loading')

    resolveReq({ success: true, data: {}, code: 0, message: 'ok' })
    await flushPromises()
  })
})
