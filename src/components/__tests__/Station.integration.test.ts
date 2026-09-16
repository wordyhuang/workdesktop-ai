import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, reactive, nextTick } from 'vue'
import { Fold, Expand, ArrowUp, ArrowDown } from '@element-plus/icons-vue'
import Station from '../layout/Station.vue'
import {
  setStationFooter,
  refreshStationView,
  clearStationRegistry
} from '../../lib/core/station-linkage'

/* ---------- ElementPlus 桩（单根组件，class / onClick / index 等 attrs 自动落到根节点） ---------- */
const passthrough = (name: string, tag: string, cls: string) =>
  defineComponent({
    name,
    setup(_, { slots }) {
      return () => h(tag, { class: cls }, slots.default?.())
    }
  })

const ElMenu = passthrough('el-menu', 'ul', 'el-menu-stub')
const ElMenuItem = passthrough('el-menu-item', 'li', 'el-menu-item-stub')
const ElScrollbar = passthrough('el-scrollbar', 'div', 'el-scrollbar-stub')
const ElTooltip = passthrough('el-tooltip', 'span', 'el-tooltip-stub')
const ElIcon = passthrough('el-icon', 'i', 'el-icon-stub')
const ElAvatar = passthrough('el-avatar', 'span', 'el-avatar-stub')
const ElButton = passthrough('el-button', 'button', 'el-button-stub')

const ElSubMenu = defineComponent({
  name: 'el-sub-menu',
  setup(_, { slots }) {
    return () =>
      h('li', { class: 'el-sub-menu-stub' }, [
        h('div', { class: 'el-sub-menu-stub__title' }, slots.title?.()),
        h('ul', { class: 'el-sub-menu-stub__content' }, slots.default?.())
      ])
  }
})
const ElMenuItemGroup = defineComponent({
  name: 'el-menu-item-group',
  props: { title: String },
  setup(p, { slots }) {
    return () =>
      h('li', { class: 'el-menu-item-group-stub', 'data-title': p.title }, slots.default?.())
  }
})
const ElTabs = defineComponent({
  name: 'el-tabs',
  props: { modelValue: String },
  setup(p, { slots }) {
    return () => h('div', { class: 'el-tabs-stub', 'data-active': p.modelValue }, slots.default?.())
  }
})
const ElTabPane = defineComponent({
  name: 'el-tab-pane',
  props: { name: String },
  setup(p, { slots }) {
    return () =>
      h('div', { class: 'el-tab-pane-stub', 'data-name': p.name }, [
        slots.label?.(),
        slots.default?.()
      ])
  }
})
const ElDropdown = defineComponent({
  name: 'el-dropdown',
  setup(_, { slots }) {
    return () =>
      h('span', { class: 'el-dropdown-stub' }, [slots.default?.(), slots.dropdown?.()])
  }
})
const ElDropdownMenu = passthrough('el-dropdown-menu', 'div', 'el-dropdown-menu-stub')
/* dropdown-item 需单独建模 disabled：声明为 prop，仅禁用时渲染 disabled 属性（贴近 EP 行为） */
const ElDropdownItem = defineComponent({
  name: 'el-dropdown-item',
  props: { disabled: Boolean },
  setup(props, { slots }) {
    return () =>
      h(
        'div',
        { class: 'el-dropdown-item-stub', disabled: props.disabled ? '' : undefined },
        slots.default?.()
      )
  }
})
const ElBadge = defineComponent({
  name: 'el-badge',
  setup(_, { slots }) {
    return () =>
      h('span', { class: 'el-badge-stub' }, [slots.default?.(), h('sup', { class: 'el-badge-stub__value' })])
  }
})

const stubs = {
  'el-menu': ElMenu,
  'el-menu-item': ElMenuItem,
  'el-sub-menu': ElSubMenu,
  'el-menu-item-group': ElMenuItemGroup,
  'el-scrollbar': ElScrollbar,
  'el-tooltip': ElTooltip,
  'el-icon': ElIcon,
  'el-avatar': ElAvatar,
  'el-button': ElButton,
  'el-tabs': ElTabs,
  'el-tab-pane': ElTabPane,
  'el-dropdown': ElDropdown,
  'el-dropdown-menu': ElDropdownMenu,
  'el-dropdown-item': ElDropdownItem,
  'el-badge': ElBadge
}

const RouterViewStub = defineComponent({
  name: 'RouterView',
  setup() {
    return () => h('div', { class: 'router-view-stub' }, 'RV')
  }
})

/* ---------- 菜单夹具 ---------- */
const menuGroupsFixture = [
  {
    key: 'workspace',
    title: '工作区',
    icon: 'Monitor',
    menus: [
      { title: '工作台', path: '/work/dashboard' },
      {
        title: '我的项目',
        path: '/work/projects',
        children: [
          { title: '项目列表', path: '/work/projects/list' },
          { title: '项目归档', path: '/work/projects/arch' }
        ]
      }
    ]
  },
  {
    key: 'system',
    title: '系统设置',
    menus: [
      { title: '用户管理', path: '/sys/user', affix: true },
      { title: '角色管理', path: '/sys/role', badge: 3 }
    ]
  }
]

const flatMenusFixture = [
  { title: '工作台', path: '/work/dashboard', group: '工作区', groupKey: 'workspace' },
  { title: '我的项目', path: '/work/projects', group: '工作区', groupKey: 'workspace' },
  { title: '用户管理', path: '/sys/user', group: '系统设置', groupKey: 'system', affix: true },
  { title: '角色管理', path: '/sys/role', group: '系统设置', groupKey: 'system' },
  { title: '无组页面', path: '/misc' }
]

function mountStation(props: Record<string, any> = {}, extra: Record<string, any> = {}) {
  return mount(Station, {
    props,
    global: { stubs, ...(extra.global || {}) },
    ...extra
  })
}

function mountWithRouter(props: Record<string, any> = {}, routePath = '/work/dashboard') {
  const push = vi.fn()
  const route = reactive({ path: routePath })
  const wrapper = mount(Station, {
    props,
    global: {
      stubs,
      components: { RouterView: RouterViewStub },
      config: { globalProperties: { $router: { push }, $route: route } }
    }
  })
  return { wrapper, push, route }
}

describe('WdStation 集成', () => {
  beforeEach(() => {
    clearStationRegistry()
  })
  afterEach(() => {
    clearStationRegistry()
    vi.restoreAllMocks()
  })

  it('渲染五大区域：logo / 分导台 / 侧边菜单 / 工具栏 / 底部', () => {
    const wrapper = mountStation({
      title: '运营中台',
      menuGroups: menuGroupsFixture,
      userName: '张三',
      copyright: '© 2026 ACME'
    })
    // logo 区
    expect(wrapper.find('.wd-station__logo').text()).toContain('运营中台')
    // 分导台（两个分组）
    const navItems = wrapper.findAll('.wd-station__nav-item')
    expect(navItems).toHaveLength(2)
    expect(navItems[0].text()).toContain('工作区')
    expect(navItems[0].classes()).toContain('is-active')
    // 侧边菜单：默认渲染当前组（工作区）的菜单
    const items = wrapper.findAll('.wd-station__aside .el-menu-item-stub')
    expect(items.map((i) => i.text())).toContain('工作台')
    expect(wrapper.find('.wd-station__aside').text()).not.toContain('用户管理')
    // 工具栏：刷新 / 设置 / 用户
    expect(wrapper.find('[data-tool="refresh"]').exists()).toBe(true)
    expect(wrapper.find('[data-tool="settings"]').exists()).toBe(true)
    expect(wrapper.find('[data-tool="user"]').exists()).toBe(true)
    // 底部
    expect(wrapper.find('.wd-station__footer').text()).toContain('© 2026 ACME')
  })

  it('toolbarConfig 控制工具点位与关闭', () => {
    const wrapper = mountStation({
      menuGroups: menuGroupsFixture,
      userName: '张三',
      toolbarConfig: { refresh: 'left', settings: 'none', user: 'right' }
    })
    // refresh 挪到 header-left
    expect(wrapper.find('.wd-station__header-left [data-tool="refresh"]').exists()).toBe(true)
    // settings 关闭
    expect(wrapper.find('[data-tool="settings"]').exists()).toBe(false)
    // user 留在右侧
    expect(wrapper.find('.wd-station__header-right [data-tool="user"]').exists()).toBe(true)
  })

  it('无用户信息时自动显示登录按钮并触发 login 事件', async () => {
    const wrapper = mountStation({ menuGroups: menuGroupsFixture })
    const login = wrapper.find('[data-tool="login"]')
    expect(login.exists()).toBe(true)
    expect(wrapper.find('[data-tool="user"]').exists()).toBe(false)
    await login.trigger('click')
    expect(wrapper.emitted('login')).toBeTruthy()
  })

  it('扁平 menus 按 group 字段聚合归组（出现顺序），无组归入「默认」', () => {
    const wrapper = mountStation({ menus: flatMenusFixture })
    const navItems = wrapper.findAll('.wd-station__nav-item')
    expect(navItems.map((n) => n.text())).toEqual(['工作区', '系统设置', '默认'])
    // 切到「默认」组
    return navItems[2].trigger('click').then(() => {
      const items = wrapper.findAll('.wd-station__aside .el-menu-item-stub')
      expect(items.map((i) => i.text())).toEqual(['无组页面'])
    })
  })

  it('menus / toolbar-config 支持 JSON 字符串，非法 JSON 降级并报错', () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {})
    const wrapper = mountStation({
      menus: JSON.stringify(flatMenusFixture),
      toolbarConfig: '{bad json'
    })
    expect(err).toHaveBeenCalled()
    // 菜单仍解析成功
    expect(wrapper.findAll('.wd-station__nav-item').length).toBe(3)
    // toolbar-config 解析失败回退默认（右侧工具齐全）
    expect(wrapper.find('[data-tool="refresh"]').exists()).toBe(true)
  })

  it('headerMode=title：隐藏分导台，侧边渲染全量菜单并带组标题', () => {
    const wrapper = mountStation({
      menuGroups: menuGroupsFixture,
      headerMode: 'title'
    })
    expect(wrapper.find('.wd-station__nav').exists()).toBe(false)
    const groupTitles = wrapper.findAll('.el-menu-item-group-stub')
    expect(groupTitles.map((g) => g.attributes('data-title'))).toEqual(['工作区', '系统设置'])
    // 全量菜单项都在
    const text = wrapper.find('.wd-station__aside').text()
    expect(text).toContain('工作台')
    expect(text).toContain('用户管理')
  })

  it('仅一个分组时分导台自动隐藏', () => {
    const wrapper = mountStation({
      menuGroups: [menuGroupsFixture[0]]
    })
    expect(wrapper.find('.wd-station__nav').exists()).toBe(false)
    expect(wrapper.find('.wd-station__aside').text()).toContain('工作台')
  })

  it('切换分组只换菜单不跳转路由', async () => {
    const { wrapper, push } = mountWithRouter({ menuGroups: menuGroupsFixture })
    const navItems = wrapper.findAll('.wd-station__nav-item')
    await navItems[1].trigger('click')
    expect(wrapper.emitted('update:active-group')![0]).toEqual(['system'])
    expect(wrapper.emitted('group-change')![0][0]).toMatchObject({ key: 'system', title: '系统设置' })
    // 不跳路由
    expect(push).not.toHaveBeenCalled()
    // 侧边菜单整体更换
    const text = wrapper.find('.wd-station__aside').text()
    expect(text).toContain('用户管理')
    expect(text).not.toContain('工作台')
  })

  it('菜单超过两层时 console.warn 提示但不拍平', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const deep = [
      {
        key: 'g',
        title: '组',
        menus: [
          {
            title: '一级',
            path: '/1',
            children: [{ title: '二级', path: '/2', children: [{ title: '三级', path: '/3' }] }]
          }
        ]
      }
    ]
    const wrapper = mountStation({ menuGroups: deep })
    expect(warn).toHaveBeenCalled()
    // 三级仍渲染（嵌套 sub-menu）
    expect(wrapper.text()).toContain('三级')
  })

  it('router 模式：菜单点击推送路由并同步激活态', async () => {
    const { wrapper, push } = mountWithRouter({ menuGroups: menuGroupsFixture })
    const target = wrapper
      .findAll('.wd-station__aside .el-menu-item-stub')
      .find((i) => i.text().includes('工作台'))!
    await target.trigger('click')
    expect(push).toHaveBeenCalledWith('/work/dashboard')
    expect(wrapper.emitted('menu-select')![0][0]).toMatchObject({ path: '/work/dashboard' })
    expect(wrapper.emitted('update:active-menu')!.pop()![0]).toBe('workspace:/work/dashboard')
  })

  it('html 模式：菜单点击不推路由，仅抛出 menu-select，内容由插槽渲染', async () => {
    const push = vi.fn()
    const wrapper = mount(Station, {
      props: { menuGroups: menuGroupsFixture, routerMode: 'html' },
      slots: { default: '<div class="html-page">自定义内容页</div>' },
      global: {
        stubs,
        config: { globalProperties: { $router: { push }, $route: reactive({ path: '/x' }) } }
      }
    })
    const target = wrapper
      .findAll('.wd-station__aside .el-menu-item-stub')
      .find((i) => i.text().includes('工作台'))!
    await target.trigger('click')
    expect(push).not.toHaveBeenCalled()
    expect(wrapper.emitted('menu-select')![0][0]).toMatchObject({ path: '/work/dashboard' })
    expect(wrapper.find('.html-page').exists()).toBe(true)
  })

  it('tabs 模式：affix 自动开启且不可关闭，openTab/closeTab 与相邻跳转', async () => {
    const wrapper = mountStation({
      menuGroups: menuGroupsFixture,
      contentMode: 'tabs',
      routerMode: 'html'
    })
    await nextTick()
    // affix（用户管理）自动开启，且无关闭按钮
    let panes = wrapper.findAll('.el-tab-pane-stub')
    expect(panes.map((p) => p.attributes('data-name'))).toContain('system:/sys/user')
    const affixPane = panes.find((p) => p.attributes('data-name') === 'system:/sys/user')!
    expect(affixPane.find('.wd-station__tab-close').exists()).toBe(false)

    // openTab 开新标签并激活
    ;(wrapper.vm as any).openTab({ title: '工作台', path: '/work/dashboard', _key: 'workspace:/work/dashboard' })
    await nextTick()
    panes = wrapper.findAll('.el-tab-pane-stub')
    expect(panes).toHaveLength(2)
    expect(wrapper.emitted('update:open-tabs')!.pop()![0]).toHaveLength(2)
    expect(wrapper.find('.el-tabs-stub').attributes('data-active')).toBe('workspace:/work/dashboard')

    // closeTab 关闭当前激活 → 跳到相邻（affix）
    ;(wrapper.vm as any).closeTab('workspace:/work/dashboard')
    await nextTick()
    expect(wrapper.findAll('.el-tab-pane-stub')).toHaveLength(1)
    expect(wrapper.emitted('tab-close')![0][0]).toMatchObject({ key: 'workspace:/work/dashboard' })
    expect(wrapper.find('.el-tabs-stub').attributes('data-active')).toBe('system:/sys/user')

    // affix 不可通过 closeTab 关闭
    ;(wrapper.vm as any).closeTab('system:/sys/user')
    await nextTick()
    expect(wrapper.findAll('.el-tab-pane-stub')).toHaveLength(1)
  })

  it('tabs 标签可点击切换并抛出 tab-click', async () => {
    const wrapper = mountStation({
      menuGroups: menuGroupsFixture,
      contentMode: 'tabs',
      routerMode: 'html'
    })
    await nextTick()
    ;(wrapper.vm as any).openTab({ title: '工作台', path: '/work/dashboard', _key: 'workspace:/work/dashboard' })
    await nextTick()
    const affixLabel = wrapper
      .findAll('.wd-station__tab-label')
      .find((l) => l.text().includes('用户管理'))!
    await affixLabel.trigger('click')
    expect(wrapper.emitted('tab-click')!.pop()![0]).toMatchObject({ key: 'system:/sys/user' })
    expect(wrapper.emitted('update:active-menu')!.pop()![0]).toBe('system:/sys/user')
  })

  it('tabs 右侧下拉：关闭当前/左侧/其他/所有（affix 保留）与禁用态', async () => {
    const wrapper = mountStation({
      menuGroups: menuGroupsFixture,
      contentMode: 'tabs',
      routerMode: 'html'
    })
    await nextTick()
    const vm = wrapper.vm as any
    // affix 用户管理已自动开启；再开 3 个：工作台 / 角色管理 / 项目列表
    vm.openTab({ title: '工作台', path: '/work/dashboard', _key: 'workspace:/work/dashboard' })
    vm.openTab({ title: '角色管理', path: '/sys/role', _key: 'system:/sys/role' })
    vm.openTab({ title: '项目列表', path: '/work/projects/list', _key: 'workspace:/work/projects/list' })
    await nextTick()
    expect(wrapper.find('.el-tabs-stub').attributes('data-active')).toBe('workspace:/work/projects/list')

    // tabs 条整宽容器 + 右侧下拉，含 4 个操作项且均可用
    const bar = wrapper.find('.wd-station__tabs-bar')
    expect(bar.exists()).toBe(true)
    const items = bar.findAll('.el-dropdown-item-stub')
    expect(items.map((i) => i.text())).toEqual([
      '关闭当前标签',
      '关闭左侧标签',
      '关闭其他标签',
      '关闭所有标签'
    ])
    items.forEach((i) => expect(i.attributes('disabled')).toBeUndefined())
    const paneKeys = () =>
      wrapper.findAll('.el-tab-pane-stub').map((p) => p.attributes('data-name'))

    // 关闭左侧：工作台 + 角色管理 被关（affix 用户管理保留），当前不变
    await items[1].trigger('click')
    await nextTick()
    expect(paneKeys()).toEqual(['system:/sys/user', 'workspace:/work/projects/list'])
    expect(wrapper.emitted('tab-close')!.map((e) => (e[0] as any).key)).toEqual([
      'workspace:/work/dashboard',
      'system:/sys/role'
    ])
    expect(wrapper.find('.el-tabs-stub').attributes('data-active')).toBe('workspace:/work/projects/list')

    // 再开 工作台 / 角色管理 → [用户管理, 项目列表, 工作台, 角色管理]，当前=角色管理
    vm.openTab({ title: '工作台', path: '/work/dashboard', _key: 'workspace:/work/dashboard' })
    vm.openTab({ title: '角色管理', path: '/sys/role', _key: 'system:/sys/role' })
    await nextTick()
    // 关闭其他：仅 affix + 当前（角色管理）保留
    await bar.findAll('.el-dropdown-item-stub')[2].trigger('click')
    await nextTick()
    expect(paneKeys()).toEqual(['system:/sys/user', 'system:/sys/role'])
    expect(wrapper.find('.el-tabs-stub').attributes('data-active')).toBe('system:/sys/role')

    // 关闭当前：角色管理被关，跳到 affix
    await bar.findAll('.el-dropdown-item-stub')[0].trigger('click')
    await nextTick()
    expect(paneKeys()).toEqual(['system:/sys/user'])
    expect(wrapper.find('.el-tabs-stub').attributes('data-active')).toBe('system:/sys/user')

    // 再开 工作台，关闭所有：仅 affix 保留，激活跳到 affix
    vm.openTab({ title: '工作台', path: '/work/dashboard', _key: 'workspace:/work/dashboard' })
    await nextTick()
    await bar.findAll('.el-dropdown-item-stub')[3].trigger('click')
    await nextTick()
    expect(paneKeys()).toEqual(['system:/sys/user'])
    expect(wrapper.find('.el-tabs-stub').attributes('data-active')).toBe('system:/sys/user')

    // 只剩 affix：4 项全部禁用
    bar.findAll('.el-dropdown-item-stub').forEach((i) =>
      expect(i.attributes('disabled')).toBeDefined()
    )
  })

  it('refresh：内容强制重挂载并抛出 refresh 事件', async () => {
    let mountedCount = 0
    const Probe = defineComponent({
      name: 'Probe',
      setup() {
        return () => h('div', { class: 'probe' }, 'probe')
      },
      mounted() {
        mountedCount += 1
      }
    })
    const wrapper = mount(Station, {
      props: { menuGroups: menuGroupsFixture, routerMode: 'html' },
      slots: { default: () => h(Probe) },
      global: { stubs }
    })
    expect(mountedCount).toBe(1)
    await wrapper.find('[data-tool="refresh"]').trigger('click')
    await nextTick()
    expect(mountedCount).toBe(2)
    expect(wrapper.emitted('refresh')).toBeTruthy()
    // expose refresh() 等效
    ;(wrapper.vm as any).refresh()
    await nextTick()
    expect(mountedCount).toBe(3)
  })

  it('v-model：collapsed / active-group / active-menu / open-tabs 双向同步', async () => {
    const wrapper = mountStation({
      menuGroups: menuGroupsFixture,
      collapsed: false,
      contentMode: 'tabs',
      routerMode: 'html'
    })
    // 内部操作 → 抛出更新事件
    await wrapper.find('.wd-station__collapse').trigger('click')
    expect(wrapper.emitted('update:collapsed')![0]).toEqual([true])
    // 外部 prop 变化 → 内部同步
    await wrapper.setProps({ collapsed: true, activeGroup: 'system', activeMenu: 'system:/sys/role' })
    await nextTick()
    expect(wrapper.find('.wd-station').classes()).toContain('is-collapsed')
    expect(wrapper.findAll('.wd-station__nav-item')[1].classes()).toContain('is-active')
    // open-tabs 外部受控
    await wrapper.setProps({ openTabs: [{ key: 'k1', title: '外部标签' }] })
    await nextTick()
    expect(wrapper.find('.el-tab-pane-stub').attributes('data-name')).toBe('k1')
  })

  it('折叠按钮：side 用 Fold/Expand，top 用 ArrowUp，none / collapsible=false 时隐藏', async () => {
    const wrapper = mountStation({ menuGroups: menuGroupsFixture })
    // side 展开 → Fold
    expect(wrapper.findComponent(Fold).exists()).toBe(true)
    await wrapper.setProps({ collapsed: true })
    expect(wrapper.findComponent(Expand).exists()).toBe(true)
    // top → ArrowUp
    await wrapper.setProps({ collapsed: false, menuMode: 'top' })
    expect(wrapper.findComponent(ArrowUp).exists()).toBe(true)
    expect(wrapper.find('.wd-station__aside').exists()).toBe(false)
    // none → 无折叠按钮
    await wrapper.setProps({ menuMode: 'none' })
    expect(wrapper.find('.wd-station__collapse').exists()).toBe(false)
    // collapsible=false → 无折叠按钮
    const w2 = mountStation({ menuGroups: menuGroupsFixture, collapsible: false })
    expect(w2.find('.wd-station__collapse').exists()).toBe(false)
  })

  it('折叠：未受控（无 v-model:collapsed）时内部状态驱动，点击可来回切换', async () => {
    // side：点击折叠按钮 → 侧栏收窄；再点 → 还原
    const wrapper = mountStation({ menuGroups: menuGroupsFixture })
    expect(wrapper.find('.wd-station__aside').classes()).not.toContain('is-collapsed')
    await wrapper.find('.wd-station__collapse').trigger('click')
    expect(wrapper.emitted('update:collapsed')![0]).toEqual([true])
    expect(wrapper.find('.wd-station__aside').classes()).toContain('is-collapsed')
    expect(wrapper.findComponent(Expand).exists()).toBe(true)
    await wrapper.find('.wd-station__collapse').trigger('click')
    expect(wrapper.emitted('update:collapsed')![1]).toEqual([false])
    expect(wrapper.find('.wd-station__aside').classes()).not.toContain('is-collapsed')

    // top：点击 → 顶部菜单隐藏；再点 → 恢复（jsdom 下用 style 断言 v-show）
    const wTop = mountStation({ menuGroups: menuGroupsFixture, menuMode: 'top' })
    const topMenu = wTop.find('.wd-station__top-menu')
    expect(topMenu.attributes('style') || '').not.toContain('display: none')
    await wTop.find('.wd-station__collapse').trigger('click')
    expect(wTop.find('.wd-station__top-menu').attributes('style')).toContain('display: none')
    expect(wTop.findComponent(ArrowDown).exists()).toBe(true)
    await wTop.find('.wd-station__collapse').trigger('click')
    expect(wTop.find('.wd-station__top-menu').attributes('style') || '').not.toContain('display: none')
  })

  it('侧栏收缩时 logo 区同步收窄并隐藏标题文字', async () => {
    const wrapper = mountStation({ title: '运营中台', menuGroups: menuGroupsFixture })
    expect(wrapper.find('.wd-station__aside').classes()).not.toContain('is-collapsed')
    await wrapper.setProps({ collapsed: true })
    const aside = wrapper.find('.wd-station__aside')
    expect(aside.classes()).toContain('is-collapsed')
    expect(aside.find('.wd-station__logo').classes()).toContain('is-collapsed')
    // 标题文字隐藏（v-show）
    const logoTitle = aside.find('.wd-station__logo-title')
    expect(logoTitle.attributes('style')).toContain('display: none')
  })

  it('router 模式按当前路由反查分组并激活', () => {
    const { wrapper } = mountWithRouter({ menuGroups: menuGroupsFixture }, '/sys/role')
    const navItems = wrapper.findAll('.wd-station__nav-item')
    expect(navItems[1].classes()).toContain('is-active')
    expect(wrapper.find('.wd-station__aside').text()).toContain('角色管理')
  })

  it('底部联动：setStationFooter / refreshStationView 支持同组与定向', async () => {
    const w1 = mountStation({ menuGroups: menuGroupsFixture, filter: 'f1' })
    const w2 = mountStation({ menuGroups: menuGroupsFixture, filter: 'f2' })
    await nextTick()
    // 同组：selfFilter=f1 → 只更新 w1
    setStationFooter(true, '共 3 条待办', 'f1')
    await nextTick()
    expect(w1.find('.wd-station__footer').text()).toContain('共 3 条待办')
    expect(w2.find('.wd-station__footer').text()).not.toContain('共 3 条待办')
    expect(w1.emitted('update:footer-info')![0]).toEqual(['共 3 条待办'])
    // 定向：字符串 target
    setStationFooter('f2', '定向消息')
    await nextTick()
    expect(w2.find('.wd-station__footer').text()).toContain('定向消息')
    // refreshStationView 同组触发 refresh
    refreshStationView(true, 'f1')
    expect(w1.emitted('refresh')).toBeTruthy()
    expect(w2.emitted('refresh')).toBeFalsy()
  })

  it('用户下拉点击「退出登录」触发 logout，设置图标触发 settings', async () => {
    const wrapper = mountStation({ menuGroups: menuGroupsFixture, userName: '张三' })
    const items = wrapper.findAll('.el-dropdown-item-stub')
    const logoutItem = items.find((i) => i.text().includes('退出登录'))!
    await logoutItem.trigger('click')
    expect(wrapper.emitted('logout')).toBeTruthy()
    await wrapper.find('[data-tool="settings"]').trigger('click')
    expect(wrapper.emitted('settings')).toBeTruthy()
  })

  it('菜单徽章：带 badge 的菜单项渲染 wd-station__menu-badge 且为末位子元素，无 badge 项不渲染', async () => {
    const wrapper = mountStation({ menuGroups: menuGroupsFixture })
    // 切到 system 组（角色管理 badge:3 在该组）
    await wrapper.findAll('.wd-station__nav-item')[1].trigger('click')
    const items = wrapper.findAll('.el-menu-item-stub')
    const badgeItem = items.find((i) => i.text().includes('角色管理'))!
    const badge = badgeItem.find('.el-badge-stub.wd-station__menu-badge')
    expect(badge.exists()).toBe(true)
    // 靠右布局契约：badge 必须是菜单项最后一个子元素（样式 margin-left:auto 生效前提）
    expect(badgeItem.element.lastElementChild).toBe(badge.element)
    // 无 badge 的菜单项不渲染徽章
    const plainItem = items.find((i) => i.text().includes('用户管理'))!
    expect(plainItem.find('.el-badge-stub').exists()).toBe(false)
  })

  it('slots：各固定点位渲染自定义内容且位置正确，传入的 logo/footer 替换默认内容', () => {
    const wrapper = mountStation(
      { menuGroups: menuGroupsFixture, contentMode: 'tabs', copyright: '©X', footerInfo: 'v1', userName: '张三' },
      {
        slots: {
          logo: () => h('span', { class: 'slot-logo' }, 'L'),
          'header-left': () => h('span', { class: 'slot-hl' }, 'HL'),
          'header-center': () => h('span', { class: 'slot-hc' }, 'HC'),
          'header-right': () => h('span', { class: 'slot-hr' }, 'HR'),
          'menu-top': () => h('div', { class: 'slot-mt' }, 'MT'),
          'menu-bottom': () => h('div', { class: 'slot-mb' }, 'MB'),
          'tabs-left': () => h('span', { class: 'slot-tl' }, 'TL'),
          'tabs-right': () => h('span', { class: 'slot-tr' }, 'TR'),
          footer: () => h('span', { class: 'slot-f' }, 'F')
        }
      }
    )
    const aside = wrapper.find('.wd-station__aside')
    // logo：默认图标+标题被替换
    expect(aside.find('.wd-station__logo .slot-logo').exists()).toBe(true)
    expect(aside.find('.wd-station__logo-title').exists()).toBe(false)
    // menu-top / menu-bottom：aside 内、菜单滚动区外
    expect(aside.find('.slot-mt').exists()).toBe(true)
    expect(aside.find('.slot-mb').exists()).toBe(true)
    expect(aside.find('.el-scrollbar-stub .slot-mt').exists()).toBe(false)
    expect(aside.find('.el-scrollbar-stub .slot-mb').exists()).toBe(false)
    // header 左 / 中 / 右
    expect(wrapper.find('.wd-station__header-left .slot-hl').exists()).toBe(true)
    expect(wrapper.find('.wd-station__header-center .slot-hc').exists()).toBe(true)
    expect(wrapper.find('.wd-station__header-right .slot-hr').exists()).toBe(true)
    // header-right：slot 在默认工具（user 下拉）之前
    const hrChildren = Array.from(wrapper.find('.wd-station__header-right').element.children)
    const hrSlotIdx = hrChildren.findIndex((c) => c.classList.contains('slot-hr'))
    const hrUserIdx = hrChildren.findIndex((c) => c.classList.contains('el-dropdown-stub'))
    expect(hrSlotIdx).toBeGreaterThanOrEqual(0)
    expect(hrUserIdx).toBeGreaterThan(hrSlotIdx)
    // tabs-left / tabs-right：el-tabs 之前、批量关闭下拉之后
    const barChildren = Array.from(wrapper.find('.wd-station__tabs-bar').element.children)
    const tlIdx = barChildren.findIndex((c) => c.classList.contains('slot-tl'))
    const tabsIdx = barChildren.findIndex((c) => c.classList.contains('el-tabs-stub'))
    const actionsIdx = barChildren.findIndex((c) => c.classList.contains('wd-station__tabs-actions'))
    const trIdx = barChildren.findIndex((c) => c.classList.contains('slot-tr'))
    expect(tlIdx).toBeGreaterThanOrEqual(0)
    expect(tlIdx).toBeLessThan(tabsIdx)
    expect(actionsIdx).toBeGreaterThanOrEqual(0)
    expect(trIdx).toBeGreaterThan(actionsIdx)
    // footer：默认 info/copyright 被替换
    expect(wrapper.find('.wd-station__footer .slot-f').exists()).toBe(true)
    expect(wrapper.find('.wd-station__footer-info').exists()).toBe(false)
    expect(wrapper.find('.wd-station__footer-copyright').exists()).toBe(false)
  })

  it('slots：top 菜单模式渲染 top-menu-left / top-menu-right，未传点位保持默认内容', () => {
    const wrapper = mountStation(
      { menuGroups: menuGroupsFixture, menuMode: 'top', title: '运营中台', copyright: '©X' },
      {
        slots: {
          'top-menu-left': () => h('span', { class: 'slot-tml' }, 'TML'),
          'top-menu-right': () => h('span', { class: 'slot-tmr' }, 'TMR')
        }
      }
    )
    const topChildren = Array.from(wrapper.find('.wd-station__top-menu').element.children)
    const lIdx = topChildren.findIndex((c) => c.classList.contains('slot-tml'))
    const menuIdx = topChildren.findIndex((c) => c.classList.contains('el-menu-stub'))
    const rIdx = topChildren.findIndex((c) => c.classList.contains('slot-tmr'))
    expect(lIdx).toBeGreaterThanOrEqual(0)
    expect(menuIdx).toBeGreaterThanOrEqual(0)
    expect(lIdx).toBeLessThan(menuIdx)
    expect(rIdx).toBeGreaterThan(menuIdx)
    // 未传 logo / footer：默认渲染（header 内 logo 显示标题，footer 显示版权）
    expect(wrapper.find('.wd-station__logo--header .wd-station__logo-title').text()).toBe('运营中台')
    expect(wrapper.find('.wd-station__footer-copyright').text()).toBe('©X')
  })

  it('slots：logo / menu-top / menu-bottom 透传 collapsed 作用域参数', async () => {
    const wrapper = mountStation(
      { menuGroups: menuGroupsFixture },
      {
        slots: {
          logo: (p: any) => h('span', { class: 'slot-logo' }, `collapsed=${p.collapsed}`),
          'menu-top': (p: any) => h('div', { class: 'slot-mt' }, `collapsed=${p.collapsed}`),
          'menu-bottom': (p: any) => h('div', { class: 'slot-mb' }, `collapsed=${p.collapsed}`)
        }
      }
    )
    expect(wrapper.find('.slot-logo').text()).toBe('collapsed=false')
    expect(wrapper.find('.slot-mt').text()).toBe('collapsed=false')
    expect(wrapper.find('.slot-mb').text()).toBe('collapsed=false')
    await wrapper.find('.wd-station__collapse').trigger('click')
    expect(wrapper.find('.slot-logo').text()).toBe('collapsed=true')
    expect(wrapper.find('.slot-mt').text()).toBe('collapsed=true')
    expect(wrapper.find('.slot-mb').text()).toBe('collapsed=true')
  })
})
