import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ref } from 'vue'

const { mockHttpRequest } = vi.hoisted(() => ({ mockHttpRequest: vi.fn() }))
vi.mock('../../core/http', () => ({
  request: { request: mockHttpRequest }
}))

import { useRequest, unrefValue } from '../useRequest'

describe('useRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    // 默认：业务成功、data 为对象
    mockHttpRequest.mockResolvedValue({ success: true, data: { id: 1 }, code: 0, message: 'ok' })
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('immediate=true 时初始化自动请求一次', async () => {
    useRequest('/auto', { immediate: true })
    await vi.waitFor(() => expect(mockHttpRequest).toHaveBeenCalledTimes(1))
    expect(mockHttpRequest.mock.calls[0][0]).toMatchObject({ url: '/auto', method: 'post' })
  })

  it('immediate=false 时手动 run，成功后更新 data 并回调 onSuccess', async () => {
    const onSuccess = vi.fn()
    const hook = useRequest<{ id: number }>('/save', {
      immediate: false,
      method: 'post',
      onSuccess
    })
    const result = await hook.run({ name: 'a' })
    expect(hook.data.value).toEqual({ id: 1 })
    expect(hook.loading.value).toBe(false)
    expect(onSuccess).toHaveBeenCalledWith({ id: 1 }, expect.objectContaining({ success: true }))
    // post → data 承载参数
    expect(mockHttpRequest.mock.calls[0][0]).toMatchObject({ method: 'post', data: { name: 'a' } })
    expect(result).toMatchObject({ success: true })
  })

  it('get 方法参数走 params', async () => {
    const hook = useRequest('/q', { immediate: false, method: 'get' })
    await hook.run({ kw: 'x' })
    expect(mockHttpRequest.mock.calls[0][0]).toMatchObject({ method: 'get', params: { kw: 'x' } })
  })

  it('业务失败触发 onFail 且不更新 data', async () => {
    mockHttpRequest.mockResolvedValue({ success: false, data: null, code: -1, message: 'no' })
    const onFail = vi.fn()
    const onSuccess = vi.fn()
    const hook = useRequest('/x', { immediate: false, onFail, onSuccess })
    await hook.run()
    expect(onFail).toHaveBeenCalled()
    expect(onSuccess).not.toHaveBeenCalled()
    expect(hook.data.value).toBeNull()
  })

  it('网络异常：run 返回 null，error 与 onError 触发', async () => {
    mockHttpRequest.mockRejectedValue(new Error('net down'))
    const onError = vi.fn()
    const hook = useRequest('/x', { immediate: false, onError })
    const result = await hook.run()
    expect(result).toBeNull()
    expect(hook.error.value?.message).toBe('net down')
    expect(onError).toHaveBeenCalled()
  })

  it('refresh 复用上次参数', async () => {
    const hook = useRequest('/x', { immediate: false })
    await hook.run({ page: 2 })
    await hook.refresh()
    expect(mockHttpRequest).toHaveBeenCalledTimes(2)
    expect(mockHttpRequest.mock.calls[1][0].data).toEqual({ page: 2 })
  })

  it('api 支持函数式动态地址', async () => {
    let id = 1
    const hook = useRequest(() => `/user/${id}`, { immediate: false })
    id = 9
    await hook.run()
    expect(mockHttpRequest.mock.calls[0][0].url).toBe('/user/9')
  })

  it('abort 可中止进行中的请求并复位 loading', async () => {
    mockHttpRequest.mockImplementationOnce(() => new Promise(() => {}))
    const hook = useRequest('/slow', { immediate: false })
    const pending = hook.run()
    expect(hook.loading.value).toBe(true)
    hook.abort()
    expect(hook.loading.value).toBe(false)
    await Promise.race([pending, Promise.resolve('timeout')])
  })

  it('unrefValue 解包 ref，普通对象不处理', () => {
    expect(unrefValue(ref(5))).toBe(5)
    expect(unrefValue({ value: 'x' })).toEqual({ value: 'x' })
    expect(unrefValue('raw')).toBe('raw')
  })
})
