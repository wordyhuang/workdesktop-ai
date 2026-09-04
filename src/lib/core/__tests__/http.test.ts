import { describe, it, expect, beforeEach, vi } from 'vitest'
import { resetConfig, setGlobalConfig } from '../config'

// ---- mock 网络层与 element-plus 提示/loading ----
const { ElMessage, ElNotification, loadingService, loadingClose, axiosRequest, axiosCreate } =
  vi.hoisted(() => {
    const ElMessage = vi.fn()
    const ElNotification = vi.fn()
    const loadingClose = vi.fn()
    const loadingService = vi.fn(() => ({ close: loadingClose }))
    const axiosRequest = vi.fn()
    const axiosCreate = vi.fn(() => ({
      request: axiosRequest,
      defaults: {},
      interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } }
    }))
    return { ElMessage, ElNotification, loadingService, loadingClose, axiosRequest, axiosCreate }
  })

vi.mock('element-plus', () => ({
  ElMessage,
  ElNotification,
  ElLoading: { service: loadingService }
}))
vi.mock('axios', () => ({
  default: { create: axiosCreate }
}))

import { request } from '../http'

/** 让下一个网络请求返回指定响应体 */
function respond(body: any, extra?: Record<string, any>) {
  axiosRequest.mockImplementationOnce((config: any) =>
    Promise.resolve({
      data: body,
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
      ...extra
    })
  )
}

/** 捕获最后一次 axios 调用配置 */
function lastAxiosConfig() {
  return axiosRequest.mock.calls[axiosRequest.mock.calls.length - 1][0]
}

describe('http.request 主流程', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetConfig()
  })

  it('成功解封：code>=successCode → success=true，data 为业务数据', async () => {
    respond({ code: 0, message: 'ok', data: { id: 1 } })
    const result = await request.get('/users')
    expect(result.success).toBe(true)
    expect(result.data).toEqual({ id: 1 })
    expect(result.code).toBe(0)
    // 默认 showTips=false 不弹成功提示
    expect(ElMessage).not.toHaveBeenCalled()
  })

  it('业务失败：code<successCode → resolve 到 success=false', async () => {
    respond({ code: -1, message: '无权限', data: null })
    const result = await request.post('/save', { a: 1 })
    expect(result.success).toBe(false)
    expect(result.data).toBeNull()
    expect(result.message).toBe('无权限')
    // 默认 fail.showTips=true → ElMessage
    expect(ElMessage).toHaveBeenCalledWith(expect.objectContaining({ message: '无权限' }))
  })

  it('fail 使用 notify 时走 ElNotification', async () => {
    setGlobalConfig({ response: { fail: { tipsType: 'notify' } } })
    respond({ code: -2, message: '出错啦', data: null })
    await request.post('/save')
    expect(ElNotification).toHaveBeenCalled()
    expect(ElMessage).not.toHaveBeenCalled()
  })

  it('非标准响应（数组/原始值）直接透传为 data', async () => {
    respond([1, 2, 3])
    const r1 = await request.get('/list')
    expect(r1.success).toBe(true)
    expect(r1.data).toEqual([1, 2, 3])
  })

  it('code 缺省时视为成功', async () => {
    respond({ data: 'x' })
    const result = await request.get('/x')
    expect(result.success).toBe(true)
    expect(result.data).toBe('x')
  })

  it('urlPrefix 自动拼接，绝对地址不加前缀', async () => {
    setGlobalConfig({ request: { urlPrefix: '/api' } })
    respond({ code: 0, data: 'ok' })
    await request.get('/users')
    expect(lastAxiosConfig().url).toBe('/api/users')
    respond({ code: 0, data: 'ok' })
    await request.get('http://example.com/a')
    expect(lastAxiosConfig().url).toBe('http://example.com/a')
  })

  it('requestInterceptor 改写 axios 配置（加 token）', async () => {
    setGlobalConfig({
      request: { transform: { requestInterceptor: (cfg: any) => ({ ...cfg, headers: { token: 't1' } }) } }
    })
    respond({ code: 0, data: 'ok' })
    await request.get('/users')
    expect(lastAxiosConfig().headers).toEqual({ token: 't1' })
  })

  it('responseInterceptor 可改写响应再解封', async () => {
    setGlobalConfig({
      request: {
        transform: {
          responseInterceptor: (res: any) => ({ ...res, data: { code: 0, message: 'ok', data: 'real' } })
        }
      }
    })
    respond({ code: -999, message: '原始错误', data: null })
    const result = await request.get('/x')
    expect(result.success).toBe(true)
    expect(result.data).toBe('real')
  })

  it('自定义响应字段名（resConfig 覆盖）', async () => {
    setGlobalConfig({
      response: { props: { codeName: 'code', messageName: 'msg', dataName: 'rows' } }
    })
    respond({ code: 0, msg: 'hi', rows: [1] })
    const result = await request.get('/x')
    expect(result.data).toEqual([1])
    expect(result.message).toBe('hi')
  })

  it('listeners：apiBefore/apiSuccess/apiAfter 依次触发，off 可解绑', async () => {
    respond({ code: 0, data: 'ok' })
    const events: string[] = []
    const handler = (p: any) => events.push(p.type)
    const off = request.on(handler)
    await request.get('/users')
    expect(events).toEqual(['apiBefore', 'apiSuccess', 'apiAfter'])
    // 失败走 apiFail
    respond({ code: -1, message: 'x', data: null })
    events.length = 0
    await request.get('/x')
    expect(events).toEqual(['apiBefore', 'apiFail', 'apiAfter'])
    off()
    respond({ code: 0, data: 'ok' })
    events.length = 0
    await request.get('/x')
    expect(events).toEqual([])
  })

  it('监听器抛错不影响主流程', async () => {
    respond({ code: 0, data: 'ok' })
    const off = request.on(() => {
      throw new Error('listener boom')
    })
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const result = await request.get('/x')
    expect(result.success).toBe(true)
    spy.mockRestore()
    off()
  })

  it('loading：默认开启时 service 调用并在完成后 close', async () => {
    respond({ code: 0, data: 'ok' })
    await request.get('/x')
    expect(loadingService).toHaveBeenCalledTimes(1)
    expect(loadingClose).toHaveBeenCalledTimes(1)
  })

  it('showLoading=false 时跳过 loading', async () => {
    respond({ code: 0, data: 'ok' })
    await request.get('/x', undefined, { showLoading: false })
    expect(loadingService).not.toHaveBeenCalled()
  })

  it('网络异常：默认 reject 包装 Error', async () => {
    axiosRequest.mockRejectedValueOnce(new Error('Network Error'))
    const onBefore = vi.fn()
    const off = request.on((p: any) => p.type === 'apiException' && onBefore())
    await expect(request.get('/x')).rejects.toMatchObject({ success: false, message: 'Network Error' })
    // 默认 exception.showTips=true → 弹错误提示
    expect(ElMessage).toHaveBeenCalledWith(expect.objectContaining({ message: 'Network Error' }))
    expect(onBefore).toHaveBeenCalled()
    off()
  })

  it('throwException=true 时网络异常直接抛出原错误', async () => {
    setGlobalConfig({ request: { throwException: true } })
    axiosRequest.mockRejectedValueOnce(new Error('boom'))
    await expect(request.get('/x')).rejects.toThrow('boom')
  })

  it('便捷方法 get/post/put/delete 透传正确 method', async () => {
    respond({ code: 0, data: 'ok' })
    await request.get('/g', { q: 1 })
    expect(lastAxiosConfig()).toMatchObject({ url: '/g', method: 'get', params: { q: 1 } })
    respond({ code: 0, data: 'ok' })
    await request.post('/p', { a: 1 })
    expect(lastAxiosConfig()).toMatchObject({ url: '/p', method: 'post', data: { a: 1 } })
    respond({ code: 0, data: 'ok' })
    await request.put('/u', { b: 2 })
    expect(lastAxiosConfig()).toMatchObject({ url: '/u', method: 'put', data: { b: 2 } })
    respond({ code: 0, data: 'ok' })
    await request.delete('/d', { id: 3 })
    expect(lastAxiosConfig()).toMatchObject({ url: '/d', method: 'delete', params: { id: 3 } })
  })
})

describe('http.create 组件级实例覆盖', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetConfig()
  })

  it('create 子实例的组件级配置覆盖全局（urlPrefix）', async () => {
    setGlobalConfig({ request: { urlPrefix: '/global' } })
    respond({ code: 0, data: 'ok' })
    const ins = request.create({ request: { urlPrefix: '/ins' } } as any)
    // 子实例复用父级监听器
    const events: string[] = []
    const off = request.on((p: any) => events.push(p.type))
    await ins.get('/users')
    expect(lastAxiosConfig().url).toBe('/ins/users')
    expect(events).toContain('apiAfter')
    off()
    // 全局实例仍用全局前缀
    respond({ code: 0, data: 'ok' })
    await request.get('/users')
    expect(lastAxiosConfig().url).toBe('/global/users')
  })
})
