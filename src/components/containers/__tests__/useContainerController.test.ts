/**
 * useContainerController 显隐双向同步回归测试
 * 背景：容器曾只按挂载时的 modelValue 初始化，外部后续置 true 无效
 * （DrawerButton 懒挂载两段式打开失效，弹层打不开）；关闭后也不回写外部，
 * 导致二次打开失效。本测试锁定修复行为。
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, reactive, type PropType } from 'vue'
import { useContainerController } from '../useContainerController'

vi.mock('element-plus', () => ({
  ElMessageBox: { confirm: vi.fn() }
}))

const TestHost = defineComponent({
  props: {
    modelValue: { type: Boolean, default: undefined },
    headRefreshDatagrid: { type: [Boolean, String] as PropType<boolean | string>, default: false },
    filter: { type: String, default: '' }
  },
  emits: ['update:modelValue'],
  setup(props, { emit, expose }) {
    const ctl = useContainerController({
      props: reactive(props) as any,
      emit
    })
    expose(ctl)
    return ctl
  },
  template: '<div />'
})

function mountHost(modelValue = false) {
  return mount(TestHost, {
    props: { modelValue },
    attachTo: document.body
  })
}

beforeEach(() => {
  document.body.innerHTML = ''
})

describe('useContainerController 显隐双向同步', () => {
  it('挂载后外部 modelValue false→true，弹层应打开（受控模式）', async () => {
    const wrapper = mountHost(false)
    // 挂载初始为关闭
    await wrapper.setProps({ modelValue: true })
    // flush watch（默认 pre 触发，setProps 已触发渲染队列）
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.visible).toBe(true)
  })

  it('初始 modelValue=true 时应为打开', () => {
    const wrapper = mountHost(true)
    expect(wrapper.vm.visible).toBe(true)
  })

  it('弹层被内部关闭（visible=false，如 X/遮罩/ESC）后应回写 update:modelValue=false', async () => {
    const wrapper = mountHost(true)
    // 模拟 el-dialog/el-drawer 把绑定 ref 置 false（不经过 syncVisible 的关闭路径）
    wrapper.vm.visible = false
    await wrapper.vm.$nextTick()
    const updates = wrapper.emitted('update:modelValue')
    expect(updates).toBeTruthy()
    expect(updates!.some(([v]) => v === false)).toBe(true)
  })

  it('外部受控置 false 时也应关闭弹层', async () => {
    const wrapper = mountHost(true)
    await wrapper.setProps({ modelValue: false })
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.visible).toBe(false)
  })
})
