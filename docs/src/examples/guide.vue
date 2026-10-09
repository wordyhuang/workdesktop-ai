<template>
  <div class="example-page">
    <demo-block
      title="新手操作指引"
      desc="全屏蒙版 + 目标元素高亮挖洞 + 指引面板（位置自动避让翻转），支持上一步/下一步/跳过/完成与步骤圆点"
      :code="code1"
    >
      <div class="demo-app">
        <div class="demo-toolbar">
          <span class="demo-logo">企业管理后台</span>
          <el-input
            class="demo-search"
            placeholder="搜索菜单、功能..."
          />
          <el-button class="demo-add" type="primary">新建</el-button>
          <el-avatar :size="30" class="demo-avatar">管</el-avatar>
        </div>
        <div class="demo-body">
          <div class="demo-sidebar">
            <div
              v-for="m in ['工作台', '用户管理', '订单中心', '数据统计']"
              :key="m"
              class="demo-menu"
            >
              {{ m }}
            </div>
          </div>
          <div class="demo-content">
            <p>这是一个模拟的业务页面，点击下方按钮体验新手指引。</p>
            <el-button type="primary" @click="run1">开始新手指引</el-button>
          </div>
        </div>
      </div>

      <wd-guide v-model="visible1" :steps="steps1" />
    </demo-block>

    <demo-block
      title="圆形高亮"
      desc="highlight='circle' 适合突出头像、按钮等小元素；highlight='none' 则不挖洞，面板默认居中"
      :code="code2"
    >
      <div class="circle-demo">
        <el-avatar :size="48" class="demo-avatar-lg">王</el-avatar>
        <el-button type="primary" plain @click="run2">高亮头像</el-button>
      </div>

      <wd-guide v-model="visible2" :steps="steps2" />
    </demo-block>

    <demo-block
      title="自定义面板内容"
      desc="通过 #panel 插槽完全接管面板，可自由排版；插槽提供 step / current / total / prev / next / close"
      :code="code3"
    >
      <div class="custom-demo">
        <el-tag class="demo-custom-tag" type="warning">重点提示</el-tag>
        <el-button class="demo-custom-btn" type="primary" @click="run3">
          自定义指引
        </el-button>
      </div>

      <wd-guide v-model="visible3" :steps="steps3">
        <template #panel="{ current, total, next, close }">
          <div class="custom-panel">
            <div class="custom-panel__badge">{{ current + 1 }} / {{ total }}</div>
            <div class="custom-panel__title">自定义面板 {{ current + 1 }}</div>
            <div class="custom-panel__desc">
              这里是自定义内容区，你可以放置图片、表单、链接等任意元素。
            </div>
            <div class="custom-panel__actions">
              <el-button link type="info" @click="close('skip')">不再提示</el-button>
              <el-button type="primary" size="small" @click="next()">
                {{ current < total - 1 ? '继续' : '知道了' }}
              </el-button>
            </div>
          </div>
        </template>
      </wd-guide>
    </demo-block>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const visible1 = ref(false)
const visible2 = ref(false)
const visible3 = ref(false)

const steps1 = [
  {
    target: '.demo-logo',
    title: '欢迎使用',
    description: '这里是系统名称与品牌区域，点击 Logo 可随时返回首页。',
    placement: 'bottom'
  },
  {
    target: '.demo-search',
    title: '全局搜索',
    description: '输入关键字即可搜索菜单与功能，支持拼音与模糊匹配。',
    placement: 'bottom'
  },
  {
    target: '.demo-sidebar',
    title: '功能菜单',
    description: '所有业务模块集中在此，点击菜单项进入对应页面。',
    placement: 'right'
  },
  {
    target: '.demo-add',
    title: '新建数据',
    description: '需要创建记录时，点击此按钮打开新建表单。',
    placement: 'bottom'
  }
]

const steps2 = [
  {
    target: '.demo-avatar-lg',
    title: '当前用户',
    description: '圆形高亮适合头像这类小元素，点击可进入个人中心。',
    highlight: 'circle',
    placement: 'right',
    padding: 6
  }
]

const steps3 = [
  {
    target: '.demo-custom-tag',
    title: '重点提示',
    placement: 'bottom'
  },
  {
    target: '.demo-custom-btn',
    title: '自定义指引按钮',
    placement: 'bottom'
  }
]

const run1 = () => (visible1.value = true)
const run2 = () => (visible2.value = true)
const run3 = () => (visible3.value = true)

const code1 = `<wd-guide v-model="visible" :steps="steps" />
<el-button @click="visible = true">开始指引</el-button>

const steps = [
  { target: '.logo', title: '欢迎使用', description: '...', placement: 'bottom' },
  { target: '.search', title: '全局搜索', description: '...', placement: 'bottom' },
  { target: '.sidebar', title: '功能菜单', description: '...', placement: 'right' }
]`

const code2 = `<wd-guide
  v-model="visible"
  :steps="[
    { target: '.avatar', title: '当前用户', highlight: 'circle', placement: 'right' }
  ]"
/>`

const code3 = `<wd-guide v-model="visible" :steps="steps">
  <template #panel="{ current, total, next, close }">
    <div>自定义内容 {{ current + 1 }} / {{ total }}</div>
    <el-button @click="next()">继续</el-button>
  </template>
</wd-guide>`
</script>

<style scoped>
.example-page {
  width: 100%;
}

/* ---------- 模拟后台 ---------- */
.demo-app {
  border: 1px solid var(--wd-border-color-light, #e5e8ef);
  border-radius: 8px;
  overflow: hidden;
}
.demo-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 52px;
  padding: 0 16px;
  background: var(--wd-bg-color-page, #f4f6fa);
  border-bottom: 1px solid var(--wd-border-color-light, #e5e8ef);
}
.demo-logo {
  font-weight: 600;
  color: var(--wd-text-color-primary, #24272c);
  white-space: nowrap;
}
.demo-search {
  width: 200px;
}
.demo-add {
  margin-left: auto;
}
.demo-body {
  display: flex;
  min-height: 220px;
}
.demo-sidebar {
  width: 130px;
  padding: 10px;
  background: var(--wd-bg-color-page, #f4f6fa);
  border-right: 1px solid var(--wd-border-color-light, #e5e8ef);
}
.demo-menu {
  padding: 8px 10px;
  font-size: 13px;
  color: var(--wd-text-color-regular, #555b63);
  border-radius: 6px;
}
.demo-content {
  flex: 1;
  padding: 20px;
}
.demo-content p {
  margin: 0 0 14px;
  font-size: 13px;
  color: var(--wd-text-color-secondary, #909399);
}

.circle-demo {
  display: flex;
  align-items: center;
  gap: 16px;
}
.custom-demo {
  display: flex;
  align-items: center;
  gap: 14px;
}
.demo-avatar-lg {
  background: var(--wd-color-primary, #1677ff);
}

/* ---------- 自定义面板 ---------- */
.custom-panel {
  position: relative;
}
.custom-panel__badge {
  display: inline-block;
  padding: 2px 10px;
  font-size: 12px;
  color: var(--wd-color-primary, #1677ff);
  background: rgba(22, 119, 255, 0.1);
  border-radius: 999px;
}
.custom-panel__title {
  margin-top: 10px;
  font-size: 15px;
  font-weight: 600;
  color: var(--wd-text-color-primary, #24272c);
}
.custom-panel__desc {
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.7;
  color: var(--wd-text-color-regular, #555b63);
}
.custom-panel__actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  margin-top: 14px;
}
</style>
