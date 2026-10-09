import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import WdGuide from '../guide/Guide.vue'

/* ---------- ElementPlus 轻量桩 ---------- */
const ElButton = defineComponent({
  name: 'el-button',
  setup(_, { slots, attrs }) {
    return () => h('button', { class: 'el-button', ...attrs }, slots.default?.())
  }
})
const ElIcon = defineComponent({
  name: 'el-icon',
  setup(_, { slots }) {
    return () => h('i', { class: 'el-icon' }, slots.default?.())
  }
})

const stubs = { 'el-button': ElButton, 'el-icon': ElIcon }

function makeTarget(selector: string, rect: Partial<DOMRect> = {}) {
  const el = document.createElement('div')
  el.className = selector.replace('.', '')
  el.getBoundingClientRect = () =>
    ({
      left: 100,
      top: 100,
      width: 80,
      height: 40,
      right: 180,
      bottom: 140,
      ...rect
    } as DOMRect)
  document.body.appendChild(el)
  return el
}

afterEach(() => {
  document.body.querySelectorAll('.target,.avatar').forEach((el) => el.remove())
})

const mountGuide = (props: Record<string, any>) =>
  mount(WdGuide, {
    props: { steps: [], ...props },
    global: { stubs }
  })

describe('WdGuide 基础渲染', () => {
  it('未激活时不渲染引导层', () => {
    const wrapper = mountGuide({
      steps: [{ target: '.target', title: '第一步' }]
    })
    expect(document.querySelector('.wd-guide')).toBeNull()
    wrapper.unmount()
  })

  it('激活后渲染蒙版、高亮框与面板', async () => {
    makeTarget('target')
    const wrapper = mountGuide({
      modelValue: true,
      steps: [{ target: '.target', title: '第一步', description: '说明文字' }]
    })
    await flushPromises()
    await nextTick()

    expect(document.querySelector('.wd-guide')).not.toBeNull()
    expect(document.querySelector('.wd-guide__mask')).not.toBeNull()
    expect(document.querySelector('.wd-guide__spot')).not.toBeNull()
    expect(document.querySelector('.wd-guide__title')?.textContent).toBe('第一步')
    expect(document.querySelector('.wd-guide__desc')?.textContent).toBe('说明文字')
    wrapper.unmount()
  })
})

describe('WdGuide 步骤导航', () => {
  it('点击下一步推进步骤，最后一步触发 finish', async () => {
    makeTarget('target')
    const wrapper = mountGuide({
      modelValue: true,
      steps: [
        { target: '.target', title: '第一步' },
        { target: '.target', title: '第二步' }
      ]
    })
    await flushPromises()

    const buttons = document.querySelectorAll('.wd-guide__actions .el-button')
    // 第一步只有「下一步」
    ;(buttons[0] as HTMLElement).click()
    await nextTick()
    expect(wrapper.emitted('change')).toBeTruthy()
    expect(document.querySelector('.wd-guide__title')?.textContent).toBe('第二步')

    const finishButtons = document.querySelectorAll('.wd-guide__actions .el-button')
    // 第二步有「上一步」「完成」
    ;(finishButtons[1] as HTMLElement).click()
    await nextTick()
    expect(wrapper.emitted('finish')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
    wrapper.unmount()
  })

  it('点击跳过触发 skip 并关闭', async () => {
    makeTarget('target')
    const wrapper = mountGuide({
      modelValue: true,
      steps: [{ target: '.target', title: '第一步' }, { target: '.target', title: '第二步' }]
    })
    await flushPromises()

    ;(document.querySelector('.wd-guide__skip') as HTMLElement).click()
    await nextTick()
    expect(wrapper.emitted('skip')).toBeTruthy()
    wrapper.unmount()
  })

  it('点击步骤圆点跳转', async () => {
    makeTarget('target')
    const wrapper = mountGuide({
      modelValue: true,
      steps: [
        { target: '.target', title: '第一步' },
        { target: '.target', title: '第二步' },
        { target: '.target', title: '第三步' }
      ]
    })
    await flushPromises()

    const dots = document.querySelectorAll('.wd-guide__dot')
    ;(dots[2] as HTMLElement).click()
    await nextTick()
    expect(document.querySelector('.wd-guide__title')?.textContent).toBe('第三步')
    wrapper.unmount()
  })
})

describe('WdGuide 高亮与面板开关', () => {
  it('highlight=circle 时高亮框为圆形', async () => {
    makeTarget('avatar')
    const wrapper = mountGuide({
      modelValue: true,
      steps: [{ target: '.avatar', highlight: 'circle' }]
    })
    await flushPromises()
    await nextTick()
    const spot = document.querySelector('.wd-guide__spot') as HTMLElement
    expect(spot.classList.contains('is-circle')).toBe(true)
    wrapper.unmount()
  })

  it('showPanel=false 时不渲染面板', async () => {
    makeTarget('target')
    const wrapper = mountGuide({
      modelValue: true,
      showPanel: false,
      steps: [{ target: '.target', title: '第一步' }]
    })
    await flushPromises()
    expect(document.querySelector('.wd-guide__panel')).toBeNull()
    expect(document.querySelector('.wd-guide__spot')).not.toBeNull()
    wrapper.unmount()
  })

  it('目标元素不存在时不报错（面板回退居中）', async () => {
    const warnSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const wrapper = mountGuide({
      modelValue: true,
      steps: [{ target: '.not-exist', title: '第一步' }]
    })
    await flushPromises()
    expect(document.querySelector('.wd-guide')).not.toBeNull()
    warnSpy.mockRestore()
    wrapper.unmount()
  })
})
