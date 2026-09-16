<template>
  <div class="example-page">
    <demo-block
      title="基础用法"
      desc="menuGroups 传入分组菜单，顶部分导台切换分组、左侧菜单联动更换；工具栏含刷新/设置/用户，toolbarConfig 可把工具调到左侧点位；html 模式内容走默认插槽"
      :code="code1"
    >
      <div class="station-stage">
        <wd-station
          title="WorkDesktop"
          logo="Platform"
          :menu-groups="menuGroups"
          :toolbar-config="{ refresh: 'left' }"
          user-name="张管理员"
          copyright="© 2026 WorkDesktop"
          footer-info="v1.0 演示环境"
          router-mode="html"
          @menu-select="onMenuSelect"
          @refresh="onEvent('refresh')"
          @settings="onEvent('settings')"
          @logout="onEvent('logout')"
        >
          <div class="station-demo-page">
            <h4>当前菜单</h4>
            <p>{{ currentMenuText }}</p>
          </div>
        </wd-station>
      </div>
    </demo-block>

    <demo-block
      title="扁平菜单自动归组"
      desc="menus 传扁平数组，按 groupKey / group 字段自动聚合分组；未声明分组的菜单归入「默认」组，两种数据结构统一归一"
      :code="code2"
    >
      <div class="station-stage">
        <wd-station
          title="WorkDesktop"
          logo="Platform"
          :menus="flatMenus"
          user-name="张管理员"
          copyright="© 2026 WorkDesktop"
          router-mode="html"
          @menu-select="onMenuSelect"
        >
          <div class="station-demo-page">
            <h4>当前菜单</h4>
            <p>{{ currentMenuText }}</p>
          </div>
        </wd-station>
      </div>
    </demo-block>

    <demo-block
      title="Tabs 内容模式"
      desc="content-mode=tabs 开启多标签页：点菜单自动开标签，affix 菜单为固定标签（自动开启、不可关闭），关闭激活标签后跳转相邻标签"
      :code="code3"
    >
      <div class="station-stage">
        <wd-station
          title="WorkDesktop"
          logo="Platform"
          :menu-groups="menuGroups"
          content-mode="tabs"
          user-name="张管理员"
          copyright="© 2026 WorkDesktop"
          router-mode="html"
          @menu-select="onMenuSelect"
        >
          <div class="station-demo-page">
            <h4>当前标签页</h4>
            <p>{{ currentMenuText }}</p>
          </div>
        </wd-station>
      </div>
    </demo-block>

    <demo-block
      title="顶部菜单模式"
      desc="menu-mode=top 时菜单移到顶部横排，折叠按钮变为向上/向下箭头，控制顶部菜单的收起与展开"
      :code="code4"
    >
      <div class="station-stage">
        <wd-station
          title="WorkDesktop"
          logo="Platform"
          :menu-groups="menuGroups"
          menu-mode="top"
          user-name="张管理员"
          copyright="© 2026 WorkDesktop"
          router-mode="html"
          @menu-select="onMenuSelect"
        >
          <div class="station-demo-page">
            <h4>当前菜单</h4>
            <p>{{ currentMenuText }}</p>
          </div>
        </wd-station>
      </div>
    </demo-block>

    <demo-block
      title="标题模式"
      desc="header-mode=title 时顶栏中央显示系统标题（无分导台），左侧菜单按分组标题展示全量菜单，适合分组较少的系统"
      :code="code5"
    >
      <div class="station-stage">
        <wd-station
          title="WorkDesktop"
          logo="Platform"
          :menu-groups="menuGroups"
          header-mode="title"
          user-name="张管理员"
          copyright="© 2026 WorkDesktop"
          router-mode="html"
          @menu-select="onMenuSelect"
        >
          <div class="station-demo-page">
            <h4>当前菜单</h4>
            <p>{{ currentMenuText }}</p>
          </div>
        </wd-station>
      </div>
    </demo-block>

    <demo-block
      title="底栏信息联动"
      desc="setStationFooter / refreshStationView 命令式 API：按 filter 定向更新底栏动态信息、强制重挂载内容区；true 只作用于同 filter 分组"
      :code="code6"
    >
      <div class="station-stage">
        <wd-station
          title="WorkDesktop"
          logo="Platform"
          :menu-groups="menuGroups"
          filter="demo-linkage"
          user-name="张管理员"
          copyright="© 2026 WorkDesktop"
          footer-info="等待联动指令…"
          router-mode="html"
          @menu-select="onMenuSelect"
          @refresh="onRefresh"
        >
          <div class="station-demo-page">
            <h4>内容区</h4>
            <p>内容已刷新 {{ refreshCount }} 次</p>
            <el-button size="small" type="primary" @click="onSetFooter">更新底栏信息</el-button>
            <el-button size="small" @click="onRefreshStation">刷新内容区</el-button>
          </div>
        </wd-station>
      </div>
    </demo-block>

    <demo-block
      title="固定点位插槽"
      desc="logo / menu-top / menu-bottom / header-left / header-center / header-right / tabs-left / tabs-right / footer 各固定点位均可插槽自定义；logo 与 menu 插槽带 collapsed 作用域参数（折叠时可切换 mini 形态），未传插槽的点位保持默认渲染"
      :code="code7"
    >
      <div class="station-stage">
        <wd-station
          title="WorkDesktop"
          logo="Platform"
          :menu-groups="menuGroups"
          content-mode="tabs"
          user-name="张管理员"
          copyright="© 2026 WorkDesktop"
          router-mode="html"
          @menu-select="onMenuSelect"
        >
          <template #logo="{ collapsed }">
            <el-icon class="slot-logo-icon"><Platform /></el-icon>
            <span v-show="!collapsed" class="slot-logo-text">定制品牌</span>
          </template>
          <template #menu-top="{ collapsed }">
            <div v-show="!collapsed" class="slot-menu-top">菜单上方区域（如搜索）</div>
          </template>
          <template #menu-bottom="{ collapsed }">
            <div v-show="!collapsed" class="slot-menu-bottom">菜单下方区域 · v1.0.2</div>
          </template>
          <template #header-left>
            <el-tag size="small" type="success">生产环境</el-tag>
          </template>
          <template #header-center>
            <el-input size="small" placeholder="全局搜索（示意）" class="slot-header-search" />
          </template>
          <template #header-right>
            <el-badge :value="3" class="slot-notice">
              <el-icon><Bell /></el-icon>
            </el-badge>
          </template>
          <template #tabs-left>
            <span class="slot-tabs-left">快捷区</span>
          </template>
          <template #tabs-right>
            <el-button size="small" text type="primary">标签设置</el-button>
          </template>
          <template #footer>
            <span>自定义底栏：共 8 条待办</span>
            <span>© 2026 WorkDesktop</span>
          </template>
          <div class="station-demo-page">
            <h4>当前标签页</h4>
            <p>{{ currentMenuText }}</p>
          </div>
        </wd-station>
      </div>
    </demo-block>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Platform, Bell } from '@element-plus/icons-vue'
import { setStationFooter, refreshStationView } from '../../../src'

const code1 = `<wd-station
  title="WorkDesktop" logo="Platform"
  :menu-groups="menuGroups"
  :toolbar-config="{ refresh: 'left' }"
  user-name="张管理员"
  copyright="© 2026 WorkDesktop"
  footer-info="v1.0 演示环境"
  router-mode="html"
  @menu-select="onMenuSelect"
>
  <div>内容区</div>
</wd-station>`

const code2 = `<wd-station :menus="flatMenus" router-mode="html">
  <div>内容区</div>
</wd-station>

// flatMenus：按 group / groupKey 自动聚合，无组项归「默认」组
[
  { title: '工作台', path: '/work/dashboard', group: '工作区', groupKey: 'workspace' },
  { title: '用户列表', path: '/sys/user', group: '系统设置', groupKey: 'system' },
  { title: '关于系统', path: '/about' }
]`

const code3 = `<wd-station :menu-groups="menuGroups" content-mode="tabs" router-mode="html">
  <div>内容区</div>
</wd-station>

// 菜单项 affix: true → 固定标签，挂载自动开启、不可关闭`

const code4 = `<wd-station :menu-groups="menuGroups" menu-mode="top" router-mode="html">
  <div>内容区</div>
</wd-station>`

const code5 = `<wd-station :menu-groups="menuGroups" header-mode="title" router-mode="html">
  <div>内容区</div>
</wd-station>`

const code6 = `<template>
  <wd-station
    title="WorkDesktop" logo="Platform"
    :menu-groups="menuGroups"
    filter="demo-linkage"
    user-name="张管理员"
    copyright="© 2026 WorkDesktop"
    footer-info="等待联动指令…"
    router-mode="html"
    @refresh="onRefresh"
  >
    <div>
      <p>内容已刷新 {{ refreshCount }} 次</p>
      <el-button size="small" type="primary" @click="onSetFooter">更新底栏信息</el-button>
      <el-button size="small" @click="onRefreshStation">刷新内容区</el-button>
    </div>
  </wd-station>
</template>

<script>
// setStationFooter / refreshStationView：命令式 API，按 filter 定向作用（true 只作用于同 filter 分组）
import { ref } from 'vue'
import { setStationFooter, refreshStationView } from 'workdesktop-ai'

const refreshCount = ref(0)

function onSetFooter() {
  // 定向更新 filter=demo-linkage 的 Station 底栏信息，返回作用实例数
  const n = setStationFooter('demo-linkage', \`底栏信息已更新于 \${new Date().toLocaleTimeString()}\`)
}

function onRefreshStation() {
  // 定向强制重挂载内容区（触发被作用实例的 @refresh）
  const n = refreshStationView('demo-linkage')
}

function onRefresh() {
  refreshCount.value += 1
}
<\/script>`

const code7 = `<wd-station
  title="WorkDesktop" logo="Platform"
  :menu-groups="menuGroups" content-mode="tabs"
  user-name="张管理员" copyright="© 2026 WorkDesktop"
  router-mode="html"
>
  <!-- logo：带 collapsed 作用域参数，折叠时只留图标 -->
  <template #logo="{ collapsed }">
    <el-icon><Platform /></el-icon>
    <span v-show="!collapsed">定制品牌</span>
  </template>
  <!-- 侧栏菜单上 / 下方扩展区 -->
  <template #menu-top="{ collapsed }">
    <div v-show="!collapsed">菜单上方区域（如搜索）</div>
  </template>
  <template #menu-bottom="{ collapsed }">
    <div v-show="!collapsed">菜单下方区域 · v1.0.2</div>
  </template>
  <!-- 顶栏左 / 中 / 右扩展区（右侧插在工具栏之前） -->
  <template #header-left>
    <el-tag size="small" type="success">生产环境</el-tag>
  </template>
  <template #header-center>
    <el-input size="small" placeholder="全局搜索（示意）" />
  </template>
  <template #header-right>
    <el-badge :value="3"><el-icon><Bell /></el-icon></el-badge>
  </template>
  <!-- tabs 条左右扩展区 -->
  <template #tabs-left>
    <span>快捷区</span>
  </template>
  <template #tabs-right>
    <el-button size="small" text type="primary">标签设置</el-button>
  </template>
  <!-- 底栏整区替换默认 info / copyright -->
  <template #footer>
    <span>自定义底栏：共 8 条待办</span>
    <span>© 2026 WorkDesktop</span>
  </template>
  <div>内容区</div>
</wd-station>`

const menuGroups = [
  {
    key: 'workspace',
    title: '工作区',
    icon: 'Monitor',
    menus: [
      { title: '工作台', path: '/work/dashboard', icon: 'Odometer', affix: true },
      {
        title: '我的任务',
        icon: 'Tickets',
        children: [
          { title: '任务列表', path: '/work/tasks' },
          { title: '任务日历', path: '/work/calendar' }
        ]
      },
      { title: '消息中心', path: '/work/messages', icon: 'Bell', badge: 5 }
    ]
  },
  {
    key: 'system',
    title: '系统设置',
    icon: 'Setting',
    menus: [
      {
        title: '用户管理',
        icon: 'User',
        children: [
          { title: '用户列表', path: '/sys/user' },
          { title: '角色管理', path: '/sys/role' }
        ]
      },
      { title: '系统参数', path: '/sys/config', icon: 'Tools' }
    ]
  }
]

const flatMenus = [
  { title: '工作台', path: '/work/dashboard', icon: 'Odometer', group: '工作区', groupKey: 'workspace' },
  { title: '任务列表', path: '/work/tasks', icon: 'Tickets', group: '工作区', groupKey: 'workspace' },
  { title: '用户列表', path: '/sys/user', icon: 'User', group: '系统设置', groupKey: 'system' },
  { title: '系统参数', path: '/sys/config', icon: 'Tools', group: '系统设置', groupKey: 'system' },
  { title: '关于系统', path: '/about', icon: 'InfoFilled' }
]

const currentMenuText = ref('（点击左侧菜单）')
const refreshCount = ref(0)

function onMenuSelect(item: { title: string; path?: string }) {
  currentMenuText.value = `${item.title}${item.path ? `（${item.path}）` : ''}`
}

function onEvent(name: string) {
  ElMessage.info(`触发 ${name} 事件`)
}

function onSetFooter() {
  const now = new Date().toLocaleTimeString()
  const n = setStationFooter('demo-linkage', `底栏信息已更新于 ${now}`)
  ElMessage.success(`已更新 ${n} 个 Station 实例`)
}

function onRefreshStation() {
  const n = refreshStationView('demo-linkage')
  ElMessage.success(`已刷新 ${n} 个 Station 实例`)
}

function onRefresh() {
  refreshCount.value += 1
}
</script>

<style scoped>
.example-page {
  width: 100%;
}
.station-stage {
  height: 440px;
  border: 1px solid var(--wd-border-color-light, #e4e7ed);
  border-radius: 6px;
  overflow: hidden;
}
.station-demo-page {
  padding: 4px 8px;
}
.station-demo-page h4 {
  margin: 0 0 8px;
  font-size: 14px;
  color: var(--wd-text-color-primary, #303133);
}
.station-demo-page p {
  margin: 0 0 12px;
  font-size: 13px;
  color: var(--wd-text-color-regular, #606266);
}
/* 固定点位插槽示例 */
.slot-logo-icon {
  font-size: 22px;
  color: var(--wd-color-primary, #409eff);
}
.slot-logo-text {
  font-size: 15px;
  font-weight: 600;
  color: var(--wd-text-color-primary, #303133);
}
.slot-menu-top,
.slot-menu-bottom {
  padding: 8px 12px;
  font-size: 12px;
  color: var(--wd-text-color-secondary, #909399);
}
.slot-header-search {
  width: 180px;
}
.slot-notice {
  margin-right: 4px;
}
.slot-tabs-left {
  margin: 0 8px;
  font-size: 12px;
  color: var(--wd-text-color-secondary, #909399);
  white-space: nowrap;
}
</style>
