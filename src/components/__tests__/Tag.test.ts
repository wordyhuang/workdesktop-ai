import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import WdTag from '../styles/Tag.vue'
import { TAG_PALETTE, matchAutoColor, TAG_COLOR_ORDER } from '../styles/tag-palette'

/* ---------- ElementPlus 桩：透传 attrs 到根元素 ---------- */
const ElTag = defineComponent({
  name: 'el-tag',
  inheritAttrs: false,
  setup(_, { slots, attrs }) {
    return () =>
      h(
        'span',
        { ...attrs, class: 'el-tag' + (attrs.class ? ' ' + (attrs.class as string) : '') },
        slots.default?.()
      )
  }
})
const ElTooltip = defineComponent({
  name: 'el-tooltip',
  props: { content: { type: String, default: '' } },
  setup(props, { slots }) {
    return () => h('span', { class: 'tooltip-host', 'data-content': props.content }, slots.default?.())
  }
})
const ElIcon = defineComponent({
  name: 'el-icon',
  setup(_, { slots }) {
    return () => h('i', { class: 'el-icon' }, slots.default?.())
  }
})

const stubs = { 'el-tag': ElTag, 'el-tooltip': ElTooltip, 'el-icon': ElIcon }

const mountTag = (props: Record<string, any> = {}, slots: Record<string, any> = {}) =>
  mount(WdTag, { props, slots, global: { stubs } })

/** 取 el-tag 根元素上的注入样式字符串 */
const tagStyle = (wrapper: any) => wrapper.find('.el-tag').attributes('style') || ''

describe('WdTag 基础渲染与色板（12 色）', () => {
  it('默认渲染 el-tag，内容为插槽文本', () => {
    const wrapper = mountTag({}, { default: () => '已完成' })
    expect(wrapper.find('.el-tag').exists()).toBe(true)
    expect(wrapper.find('.el-tag').text()).toBe('已完成')
    wrapper.unmount()
  })

  it('12 种预设色：各注入正确的基准色变量（light effect）', () => {
    const cases: Array<[string, string]> = [
      ['primary', '#409eff'],
      ['success', '#67c23a'],
      ['warning', '#e6a23c'],
      ['danger', '#f56c6c'],
      ['info', '#909399'],
      ['purple', '#9254de'],
      ['cyan', '#13c2c2'],
      ['orange', '#fa8c16'],
      ['pink', '#eb2f96'],
      ['geekblue', '#2f54eb'],
      ['magenta', '#c41d7f'],
      ['lime', '#7cb305']
    ]
    for (const [type, base] of cases) {
      const wrapper = mountTag({ type })
      const style = tagStyle(wrapper)
      expect(style).toContain(`--el-tag-text-color: ${base}`)
      expect(style).toContain(`color-mix(in srgb, ${base} 12%, transparent)`)
      wrapper.unmount()
    }
  })

  it('effect=dark：实色底 + 白字', () => {
    const wrapper = mountTag({ type: 'success', effect: 'dark' })
    const style = tagStyle(wrapper)
    expect(style).toContain('--el-tag-bg-color: #67c23a')
    expect(style).toContain('--el-tag-text-color: #fff')
    wrapper.unmount()
  })

  it('effect=plain：透明底 + 彩字 + 实色边框', () => {
    const wrapper = mountTag({ type: 'danger', effect: 'plain' })
    const style = tagStyle(wrapper)
    expect(style).toContain('--el-tag-bg-color: transparent')
    expect(style).toContain('--el-tag-border-color: #f56c6c')
    expect(style).toContain('--el-tag-text-color: #f56c6c')
    wrapper.unmount()
  })

  it('color 自定义色值优先于色板', () => {
    const wrapper = mountTag({ type: 'success', color: '#ff6600' })
    const style = tagStyle(wrapper)
    expect(style).toContain('--el-tag-text-color: #ff6600')
    expect(style).not.toContain('#67c23a')
    wrapper.unmount()
  })

  it('未知 type 回退 primary', () => {
    const wrapper = mountTag({ type: 'no-such' as any })
    expect(tagStyle(wrapper)).toContain('#409eff')
    wrapper.unmount()
  })

  it('el-tag 原生属性透传（closable / round / size / effect）', () => {
    const wrapper = mountTag({ closable: true, round: true, size: 'small', effect: 'dark' })
    const attrs = wrapper.find('.el-tag').attributes()
    expect(attrs.closable).toBeDefined()
    expect(attrs.round).toBeDefined()
    expect(attrs.size).toBe('small')
    wrapper.unmount()
  })
})

describe('WdTag type=auto 自动匹配', () => {
  it('语义关键词命中：状态语义（中文）', () => {
    expect(matchAutoColor('已完成')).toBe('success')
    expect(matchAutoColor('部署失败')).toBe('danger')
    expect(matchAutoColor('待审核')).toBe('warning')
    expect(matchAutoColor('草稿')).toBe('info')
    wrapperAutoCheck('已完成', TAG_PALETTE.success)
    wrapperAutoCheck('部署失败', TAG_PALETTE.danger)
    wrapperAutoCheck('待审核', TAG_PALETTE.warning)
  })

  it('语义关键词命中：业务语义与英文（大小写不敏感）', () => {
    expect(matchAutoColor('测试环境')).toBe('cyan')
    expect(matchAutoColor('HOT')).toBe('purple')
    expect(matchAutoColor('archived')).toBe('geekblue')
    expect(matchAutoColor('促销')).toBe('magenta')
    expect(matchAutoColor('新鲜直达')).toBe('lime')
  })

  it('未命中走稳定 hash：同文本永远同色，且落在 12 色内', () => {
    expect(matchAutoColor('环境A')).toBe(matchAutoColor('环境A'))
    expect(TAG_COLOR_ORDER).toContain(matchAutoColor('环境A'))
    // 至少覆盖一个非默认色（hash 均匀分布的烟雾断言）
    const colors = new Set(['alpha', 'beta-x', 'gamma-y', 'delta-z', 'epsilon', 'zeta'].map(matchAutoColor))
    expect(colors.size).toBeGreaterThan(1)
  })

  it('空文本回退 primary', () => {
    expect(matchAutoColor('')).toBe('primary')
  })

  it('type=auto 组件渲染：内容文本决定注入色', () => {
    const wrapper = mountTag({ type: 'auto' }, { default: () => '进行中' })
    expect(tagStyle(wrapper)).toContain('#e6a23c') // warning
    wrapper.unmount()
  })

  it('type=auto：同文本两次挂载颜色一致', () => {
    const w1 = mountTag({ type: 'auto' }, { default: () => '灰度发布中' })
    const w2 = mountTag({ type: 'auto' }, { default: () => '灰度发布中' })
    expect(tagStyle(w1)).toBe(tagStyle(w2))
    w1.unmount()
    w2.unmount()
  })

  /** 组件级辅助：断言 type=auto + 文本的注入色 */
  function wrapperAutoCheck(text: string, base: string) {
    const wrapper = mountTag({ type: 'auto' }, { default: () => text })
    expect(tagStyle(wrapper)).toContain(base)
    wrapper.unmount()
  }
})

describe('WdTag icon 与 tips', () => {
  it('icon（EP 图标名）：渲染 el-icon，标签内无插槽文本', () => {
    const wrapper = mountTag({ icon: 'WarningFilled' }, { default: () => '悬停提示' })
    expect(wrapper.find('.el-icon').exists()).toBe(true)
    expect(wrapper.find('.el-tag').text()).not.toContain('悬停提示')
    wrapper.unmount()
  })

  it('icon + #default：#default 转 tooltip（不直接渲染）', () => {
    const wrapper = mountTag({ icon: 'InfoFilled' }, { default: () => '这是提示内容' })
    expect(wrapper.find('.el-icon').exists()).toBe(true)
    expect(wrapper.find('.el-tag').text()).not.toContain('这是提示内容')
    expect(wrapper.find('.tooltip-host').exists()).toBe(true)
    expect(wrapper.find('.tooltip-host').attributes('data-content')).toBe('这是提示内容')
    wrapper.unmount()
  })

  it('icon 无 #default：只渲染 icon，无 tooltip', () => {
    const wrapper = mountTag({ icon: 'InfoFilled' })
    expect(wrapper.find('.el-icon').exists()).toBe(true)
    expect(wrapper.find('.tooltip-host').exists()).toBe(false)
    wrapper.unmount()
  })

  it('icon 颜色跟随 tag 文字色（auto 模式联动）', () => {
    const wrapper = mountTag({ icon: 'InfoFilled', type: 'auto' }, { default: () => '已通过' })
    const iconHost = wrapper.find('.wd-tag__icon')
    expect(iconHost.exists()).toBe(true)
    expect(iconHost.attributes('style') || '').toContain('var(--el-tag-text-color)')
    wrapper.unmount()
  })

  it('icon 图标字体 class：按 <i :class> 渲染', () => {
    const wrapper = mountTag({ icon: 'fa-solid fa-user' })
    const i = wrapper.find('.el-tag i.fa-solid.fa-user')
    expect(i.exists()).toBe(true)
    expect(wrapper.find('.el-icon').exists()).toBe(false)
    wrapper.unmount()
  })

  it('icon 组件对象：直接渲染组件', () => {
    const Comp = defineComponent({ name: 'MyIcon', setup: () => () => h('svg', { class: 'my-icon' }) })
    const wrapper = mountTag({ icon: Comp })
    expect(wrapper.find('.my-icon').exists()).toBe(true)
    wrapper.unmount()
  })

  it('icon-only 标记 is-icon-only 类（收敛内边距）', () => {
    const wrapper = mountTag({ icon: 'InfoFilled' })
    expect(wrapper.find('.el-tag').classes()).toContain('is-icon-only')
    wrapper.unmount()
  })

  it('icon + #default 时 auto 匹配源为 tips 文本', () => {
    const wrapper = mountTag({ icon: 'InfoFilled', type: 'auto' }, { default: () => '测试环境' })
    expect(tagStyle(wrapper)).toContain('#13c2c2') // cyan
    wrapper.unmount()
  })

  it('icon-only（无 #default）时 auto 匹配源为 icon 名', () => {
    const wrapper = mountTag({ icon: 'WarningFilled', type: 'auto' })
    expect(tagStyle(wrapper)).toContain('#e6a23c') // warning（icon 名含 warning）
    wrapper.unmount()
  })
})
