<template>
  <div class="example-page">
    <demo-block
      title="手动模式"
      desc="items 传入路径数组（title / icon / path），适合已知固定层级；点击抛出 item-click，router 模式下带 path 的段自动以 el-breadcrumb-item 的 to 跳转"
      :code="code1"
    >
      <div class="path-manual-demo">
        <wd-path :items="manualItems" @item-click="onClick" />
      </div>
    </demo-block>

    <demo-block
      title="自动模式 · 联动 WdStation"
      desc="mode=auto 且与 WdStation 使用同一 filter：自动读取当前菜单所在路径（分组 → 菜单 → 子菜单），再补充内容区 H1~H4 标题链；点击左侧菜单，路径菜单段联动更新；滚动右侧内容区，路径标题段始终跟随当前可视范围内第一个标题。animation 可设置段变动时的动画（none/fade/slide）"
      :code="code2"
    >
      <div class="station-stage">
        <wd-station
          title="WorkDesktop"
          logo="Platform"
          :menu-groups="menuGroups"
          filter="path-demo"
          user-name="张管理员"
          copyright="© 2026 WorkDesktop"
          router-mode="html"
          @menu-select="onMenuSelect"
        >
          <div class="path-page">
            <div class="path-anim-switch">
              <wd-path mode="auto" filter="path-demo" :animation="demoAnim" @item-click="onClick" />
              <el-radio-group v-model="demoAnim" size="small">
                <el-radio-button value="none">无动画</el-radio-button>
                <el-radio-button value="fade">淡入淡出</el-radio-button>
                <el-radio-button value="slide">滑移</el-radio-button>
              </el-radio-group>
            </div>
            <div class="path-article">
              <h1>产品管理</h1>
              <p>产品管理页面概述，用于承载路径自动补充的第一个标题层级。</p>
              <h2>基本信息</h2>
              <p>这里展示产品的基础信息配置区块。</p>
              <h3>规格参数</h3>
              <p>滚动页面时，路径标题段跟随当前可视范围内第一个标题更新。</p>
              <h3>价格库存</h3>
              <p>新进入可视区顶部的标题会成为当前路径。</p>
              <h2>上架信息</h2>
              <p>这里展示产品的上架发布配置区块。</p>
            </div>
          </div>
        </wd-station>
      </div>
    </demo-block>

    <demo-block
      title="自动模式 · 自定义容器"
      desc="container 指定标题扫描范围（选择器或元素引用，默认自动取最近的 .wd-station__content，无则整页）；滚动容器时当前标题链跟随可视范围内第一个标题切换"
      :code="code3"
    >
      <div class="path-scope-demo">
        <wd-path mode="auto" filter="path-scope" :container="scopeRef" @item-click="onClick" />
        <div ref="scopeRef" class="path-scope">
          <h1>订单中心</h1>
          <p>订单中心的页面介绍。</p>
          <h2>订单列表</h2>
          <h3>待审核</h3>
          <p>待审核订单说明。</p>
          <h3>已发货</h3>
          <p>已发货订单说明。</p>
          <h2>退款管理</h2>
          <h3>退款单</h3>
          <p>退款单说明。</p>
          <h3>退款进度</h3>
          <p>退款进度说明。</p>
        </div>
      </div>
    </demo-block>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const manualItems = [
  { title: '首页', icon: 'HomeFilled' },
  { title: '用户管理', icon: 'User' },
  { title: '用户列表' }
]

const menuGroups = [
  {
    key: 'product',
    title: '产品中心',
    icon: 'Goods',
    menus: [
      {
        title: '产品管理',
        icon: 'List',
        children: [{ title: '产品列表', affix: true }, { title: '分类管理' }]
      },
      { title: '库存管理', icon: 'Box' }
    ]
  },
  {
    key: 'system',
    title: '系统设置',
    icon: 'Setting',
    menus: [{ title: '用户管理', icon: 'User' }, { title: '角色管理', icon: 'Avatar' }]
  }
]

const scopeRef = ref<HTMLElement | null>(null)

/** 自动模式 demo：路径段变动动画（none/fade/slide） */
const demoAnim = ref<'none' | 'fade' | 'slide'>('slide')

function onMenuSelect(item: { title: string }) {
  ElMessage.info(`切换菜单：${item.title}`)
}

function onClick(item: { title: string }) {
  ElMessage.info(`点击路径：${item.title}`)
}

const code1 = `<wd-path
  :items="[
    { title: '首页', icon: 'HomeFilled' },
    { title: '用户管理', icon: 'User' },
    { title: '用户列表' }
  ]"
  @item-click="onClick"
/>

// 手动模式：items 完全由调用方填写，点击抛出 item-click（router 模式下带 path 的段自动跳转）`

const code2 = `<wd-station
  title="WorkDesktop" logo="Platform"
  :menu-groups="menuGroups"
  filter="path-demo"
  router-mode="html"
  @menu-select="onMenuSelect"
>
  <div>
    <!-- 与 WdStation 同一 filter → 自动读取当前菜单路径链 -->
    <!-- animation：段变动动画 none（默认）/ fade 淡入淡出 / slide 滑移淡入 -->
    <wd-path mode="auto" filter="path-demo" animation="slide" @item-click="onClick" />
    <article>
      <h1>产品管理</h1>
      <p>页面概述……</p>
      <h2>基本信息</h2>
      <p>内容……</p>
      <h3>规格参数</h3>
      <p>内容……</p>
      <h2>上架信息</h2>
      <p>内容……</p>
    </article>
  </div>
</wd-station>

// 自动模式：首页 / 分组 / 菜单 / 子菜单（来自 Station）
//          + 当前视口标题链 H1 / H2 / H3（来自页面，滚动跟随）
// 滚动页面 → 路径标题段始终跟随当前可视范围内第一个标题`

const code3 = `<template>
  <div>
    <!-- filter 隔离联动组；container 限定标题扫描范围（默认取最近的 .wd-station__content） -->
    <wd-path mode="auto" filter="path-scope" :container="scopeRef" />
    <div ref="scopeRef" class="scope">
      <h1>订单中心</h1>
      <h2>订单列表</h2>
      <h3>待审核</h3>
      <h3>已发货</h3>
      <h2>退款管理</h2>
      <h3>退款单</h3>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const scopeRef = ref(null)
<\/script>`
</script>

<style scoped>
.path-manual-demo {
  padding: 12px 0;
}
.station-stage {
  height: 440px;
  border: 1px solid var(--wd-border-color-light, #e4e7ed);
  border-radius: 6px;
  overflow: hidden;
}
.path-page {
  height: 100%;
}
.path-anim-switch {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}
.path-anim-switch :deep(.wd-path) {
  margin-bottom: 0;
}
.path-page :deep(.wd-path) {
  margin-bottom: 12px;
}
.path-article {
  border: 1px dashed var(--wd-border-color-light, #e4e7ed);
  border-radius: 6px;
  padding: 12px 16px 320px;
}
.path-article h1 {
  font-size: 20px;
  margin: 0 0 8px;
}
.path-article h2 {
  font-size: 16px;
  margin: 16px 0 8px;
  color: var(--wd-text-color-primary, #303133);
}
.path-article h3 {
  font-size: 14px;
  margin: 12px 0 4px;
  color: var(--wd-text-color-regular, #606266);
}
.path-article p {
  margin: 4px 0;
  color: var(--wd-text-color-secondary, #909399);
  font-size: 13px;
}
.path-scope-demo {
  padding: 4px 0;
}
.path-scope-demo .wd-path {
  margin-bottom: 10px;
}
.path-scope {
  height: 150px;
  overflow: auto;
  border: 1px dashed var(--wd-border-color-light, #e4e7ed);
  border-radius: 6px;
  padding: 8px 16px;
}
.path-scope h1 {
  font-size: 18px;
  margin: 4px 0;
}
.path-scope h2 {
  font-size: 15px;
  margin: 10px 0 4px;
  color: var(--wd-text-color-primary, #303133);
}
.path-scope h3 {
  font-size: 13px;
  margin: 8px 0 2px;
  color: var(--wd-text-color-regular, #606266);
}
.path-scope p {
  margin: 2px 0;
  color: var(--wd-text-color-secondary, #909399);
  font-size: 12px;
}
</style>