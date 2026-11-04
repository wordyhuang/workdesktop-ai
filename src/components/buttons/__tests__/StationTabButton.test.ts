import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import StationTabButton from '../StationTabButton.vue'
import { registerStation, clearStationRegistry } from '../../../lib/core/station-linkage'

const ElButtonStub = defineComponent({
  name: 'ElButton',
  emits: ['click'],
  template: '<button class="el-button-stub" @click="$emit(\'click\', $event)"><slot /></button>'
})

const ElTooltipStub = defineComponent({
  name: 'ElTooltip',
  template: '<div class="tooltip-stub"><slot /></div>'
})

const stubs = { 'el-button': ElButtonStub, 'el-tooltip': ElTooltipStub }

function mountBtn(props: Record<string, any> = {}) {
  return mount(StationTabButton, {
    props,
    global: { stubs }
  })
}

function fakeStation(filter = '') {
  const openTab = vi.fn()
  registerStation({ filter, setFooterInfo: vi.fn(), refresh: vi.fn(), openTab })
  return openTab
}

beforeEach(() => {
  clearStationRegistry()
})

describe('WdStationTabButton', () => {
  it('点击按 filter 调用同组 Station 的 openTab，并抛出 open 事件', async () => {
    const openTab = fakeStation('g')
    const wrapper = mountBtn({ filter: 'g', label: '打开任务列表', path: '/work/tasks' })

    await wrapper.find('button.el-button-stub').trigger('click')

    expect(openTab).toHaveBeenCalledTimes(1)
    // 只给 path 时标题不透传，交由 Station 反查菜单标题
    expect(openTab.mock.calls[0][0]).toMatchObject({
      title: undefined,
      path: '/work/tasks'
    })
    expect(wrapper.emitted('click')).toHaveLength(1)
    expect(wrapper.emitted('open')?.[0][0]).toEqual({
      tab: {
        key: undefined,
        title: undefined,
        path: '/work/tasks',
        icon: undefined,
        affix: undefined
      },
      opened: 1
    })
  })

  it('给定 tabKey 且未给 tabTitle 时，标题回退按钮 label', async () => {
    const openTab = fakeStation('g')
    const wrapper = mountBtn({ filter: 'g', label: '统计', tabKey: 'custom:stats' })

    await wrapper.find('button.el-button-stub').trigger('click')

    expect(openTab.mock.calls[0][0]).toMatchObject({
      key: 'custom:stats',
      title: '统计'
    })
  })

  it('filter 为空串时命中空 filter 组的 Station', async () => {
    const openTab = fakeStation('')
    const wrapper = mountBtn({ label: '默认分组', path: '/work/dashboard' })

    await wrapper.find('button.el-button-stub').trigger('click')

    expect(openTab).toHaveBeenCalledTimes(1)
    expect(wrapper.emitted('open')?.[0][0]).toMatchObject({ opened: 1 })
  })

  it('不同 filter 组的 Station 不受影响', async () => {
    fakeStation('other')
    const wrapper = mountBtn({ filter: 'g', label: '打开', path: '/a' })

    await wrapper.find('button.el-button-stub').trigger('click')

    expect(wrapper.emitted('open')?.[0][0]).toMatchObject({ opened: 0 })
  })

  it('自定义标签：tabKey / tabTitle / tabIcon / affix 透传', async () => {
    const openTab = fakeStation('g')
    const wrapper = mountBtn({
      filter: 'g',
      label: '统计',
      tabKey: 'custom:stats',
      tabTitle: '数据统计',
      tabIcon: 'DataLine',
      affix: true
    })

    await wrapper.find('button.el-button-stub').trigger('click')

    expect(openTab.mock.calls[0][0]).toMatchObject({
      key: 'custom:stats',
      title: '数据统计',
      icon: 'DataLine',
      affix: true
    })
  })

  it('key 与 path 都未提供时不调用 openTab，opened 为 0', async () => {
    const openTab = fakeStation('g')
    const wrapper = mountBtn({ filter: 'g', label: '空标签' })

    await wrapper.find('button.el-button-stub').trigger('click')

    expect(openTab).not.toHaveBeenCalled()
    expect(wrapper.emitted('open')?.[0][0]).toMatchObject({ opened: 0 })
  })

  it('配置 tips 时按钮被 el-tooltip 包裹，无 tips 时不包裹', () => {
    const withTips = mountBtn({ label: '提示', path: '/a', tips: '悬停提示' })
    expect(withTips.find('.tooltip-stub').exists()).toBe(true)

    const withoutTips = mountBtn({ label: '无提示', path: '/a' })
    expect(withoutTips.find('.tooltip-stub').exists()).toBe(false)
  })
})
