/**
 * WdIframe 加载检测 / loading 遮罩 / 超时 测试
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import Iframe from '../Iframe.vue'
import { resetConfig, setGlobalConfig } from '../../../lib/core/config'

/** 捕获 v-loading 当前绑定值（不依赖 ElementPlus 插件） */
const vLoadingCapture = {
  mounted(el: HTMLElement, binding: any) {
    el.setAttribute('data-loading', String(binding.value))
  },
  updated(el: HTMLElement, binding: any) {
    el.setAttribute('data-loading', String(binding.value))
  }
}

function mountIframe(props: Record<string, any> = {}) {
  return mount(Iframe, {
    props: { src: 'about:blank', ...props },
    global: { directives: { loading: vLoadingCapture } }
  })
}

/** 断言当前 v-loading 绑定值 */
function expectLoading(wrapper: ReturnType<typeof mountIframe>, expected: boolean) {
  expect(wrapper.find('.wd-iframe-wrapper').attributes('data-loading')).toBe(String(expected))
}

beforeEach(() => {
  resetConfig()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('WdIframe 加载检测', () => {
  it('加载完成触发 load 与 complete 事件', async () => {
    const wrapper = mountIframe()
    await wrapper.find('iframe').trigger('load')
    expect(wrapper.emitted('load')).toBeTruthy()
    expect(wrapper.emitted('complete')).toBeTruthy()
  })

  it('默认（全局 loading.enable=true）加载期间显示遮罩，完成后关闭', async () => {
    const wrapper = mountIframe()
    await nextTick()
    expectLoading(wrapper, true)

    await wrapper.find('iframe').trigger('load')
    expectLoading(wrapper, false)
  })

  it('loading=false 时关闭遮罩（开发人员手动关闭 loading）', async () => {
    const wrapper = mountIframe({ loading: false })
    await nextTick()
    expectLoading(wrapper, false)
  })

  it('loading=true 强制显示，即使全局 request.loading.enable=false', async () => {
    setGlobalConfig({ request: { loading: { enable: false } } })
    const wrapper = mountIframe({ loading: true })
    await nextTick()
    expectLoading(wrapper, true)
  })

  it('未显式传 loading 时跟随全局配置（enable=false 不显示）', async () => {
    setGlobalConfig({ request: { loading: { enable: false } } })
    const wrapper = mountIframe()
    await nextTick()
    expectLoading(wrapper, false)
  })

  it('src 为空时不显示遮罩', async () => {
    const wrapper = mountIframe({ src: '' })
    await nextTick()
    expectLoading(wrapper, false)
  })

  it('超时后自动关闭遮罩并触发 timeout 事件', async () => {
    vi.useFakeTimers()
    const wrapper = mountIframe({ timeout: 1000 })
    await nextTick()
    expectLoading(wrapper, true)

    vi.advanceTimersByTime(1000)
    await nextTick()

    expectLoading(wrapper, false)
    expect(wrapper.emitted('timeout')?.[0]).toEqual([{ timeout: 1000 }])
  })

  it('在超时前完成加载：不触发 timeout', async () => {
    vi.useFakeTimers()
    const wrapper = mountIframe({ timeout: 1000 })
    await nextTick()

    await wrapper.find('iframe').trigger('load')
    vi.advanceTimersByTime(2000)

    expect(wrapper.emitted('timeout')).toBeFalsy()
    expect(wrapper.emitted('complete')).toBeTruthy()
  })

  it('timeout=0（默认）不限制，不会超时', async () => {
    vi.useFakeTimers()
    const wrapper = mountIframe({ timeout: 0 })
    await nextTick()
    vi.advanceTimersByTime(100000)
    expect(wrapper.emitted('timeout')).toBeFalsy()
    expectLoading(wrapper, true)
  })

  it('refresh() 重新进入 loading', async () => {
    const wrapper = mountIframe()
    await nextTick()
    await wrapper.find('iframe').trigger('load')
    expectLoading(wrapper, false)

    wrapper.vm.refresh()
    await nextTick()
    expectLoading(wrapper, true)
  })
})
