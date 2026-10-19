<template>
  <div class="example-page">
    <demo-block
      title="悬浮快速导航（默认收起+圆点）"
      desc="WdAnchor 默认形态：右侧悬浮、收起为一个圆形触发按钮、圆点模式隐藏文字；点击触发按钮展开列表。本演示用 :expanded=true 展开便于预览文字列表效果，实际业务中默认是收起状态"
      :code="code1"
    >
      <div class="anchor-stage">
        <div ref="articleRef" class="anchor-article">
          <h1>产品中心</h1>
          <p>产品中心总览。快速导航会自动解析本页所有标题，无需手动维护锚点。</p>
          <h2>基本信息</h2>
          <p>这里是基本信息区块的说明文字，用于撑长内容触发滚动。</p>
          <h3>规格参数</h3>
          <p>规格参数的详细描述，滚动到这里时导航会高亮到本项。</p>
          <h3>价格库存</h3>
          <p>价格与库存的详细描述，滚动到这里时导航会高亮到本项。</p>
          <h2>上架信息</h2>
          <p>上架发布配置区块的说明文字。</p>
          <h3>渠道管理</h3>
          <p>各销售渠道的配置说明。</p>
          <h3>审核流程</h3>
          <p>上架前的审核节点说明。</p>
          <h2>运营配置</h2>
          <p>运营活动、优惠券、推荐位的配置说明。</p>
        </div>
        <wd-anchor
          :container="articleRef"
          position="absolute"
          :offset="12"
          expanded
          :dot="false"
          @change="onChange"
          @item-click="onClick"
        />
      </div>
    </demo-block>

    <demo-block
      title="层级过滤（max-level=2）"
      desc="max-level 控制收录的最大标题层级；只展示到 h2，h3/h4 不进入列表，但滚动定位仍按全部标题计算"
      :code="code2"
    >
      <div class="anchor-stage anchor-stage--narrow">
        <div ref="article2Ref" class="anchor-article">
          <h1>订单中心</h1>
          <p>订单中心概述。</p>
          <h2>订单列表</h2>
          <h3>待审核</h3>
          <p>待审核订单说明（h3，不会出现在导航列表中）。</p>
          <h3>已发货</h3>
          <p>已发货订单说明（h3，不会出现在导航列表中）。</p>
          <h2>退款管理</h2>
          <h3>退款单</h3>
          <p>退款单说明（h3，不会出现在导航列表中）。</p>
        </div>
        <wd-anchor :container="article2Ref" position="absolute" :max-level="2" @item-click="onClick" />
      </div>
    </demo-block>

    <demo-block
      title="手动 items + filter 联动"
      desc="通过 items prop 直接传入菜单数组（跳过容器标题扫描）；也可使用 filter 分组 + setAnchorItems API 跨组件/跨页面批量驱动。点击下方按钮模拟外部代码注入菜单"
      :code="code3"
    >
      <div class="anchor-stage anchor-stage--narrow">
        <div ref="article3Ref" class="anchor-article">
          <h1>固定菜单页</h1>
          <p>本页内容没有真正的标题语义，但菜单由业务代码指定。</p>
        </div>
        <wd-anchor
          ref="anchor3Ref"
          :items="manualItems"
          filter="demo-anchor"
          position="absolute"
          @item-click="onClick"
        />
      </div>
      <div class="demo-actions">
        <el-button size="small" @click="injectByLinkage">setAnchorItems 注入</el-button>
        <el-button size="small" @click="resetItems">重置为手动 items</el-button>
      </div>
    </demo-block>

    <demo-block
      title="默认收起 + v-model:expanded + #toggle 插槽"
      desc="WdAnchor 默认就是收起形态（仅触发按钮）。通过 v-model:expanded 可受控展开态；#toggle 插槽可自定义触发按钮内容（例如换成图标或文字按钮），点击行为仍由组件接管"
      :code="code4"
    >
      <div class="anchor-stage anchor-stage--narrow">
        <div ref="article4Ref" class="anchor-article">
          <h1>受控展开</h1>
          <p>外部按钮可控制 Anchor 展开/收起。</p>
          <h2>第一章</h2>
          <p>第一章内容。</p>
          <h2>第二章</h2>
          <p>第二章内容。</p>
          <h2>第三章</h2>
          <p>第三章内容。</p>
        </div>
        <wd-anchor
          v-model:expanded="anchor4Expanded"
          :container="article4Ref"
          position="absolute"
        >
          <template #toggle>
            <span class="my-toggle-icon">≡</span>
          </template>
        </wd-anchor>
      </div>
      <div class="demo-actions">
        <el-button size="small" @click="anchor4Expanded = !anchor4Expanded">
          外部切换（当前：{{ anchor4Expanded ? '展开' : '收起' }}）
        </el-button>
      </div>
    </demo-block>

    <demo-block
      title="文字模式（dot=false）"
      desc="dot 默认开启（圆点）；设 dot=false 后列表项显示文字，适合信息密度高的场景"
      :code="code5"
    >
      <div class="anchor-stage anchor-stage--narrow">
        <div ref="article5Ref" class="anchor-article">
          <h1>文字导航</h1>
          <p>显示完整文字标题。</p>
          <h2>章节 A</h2>
          <p>A 段内容。</p>
          <h2>章节 B</h2>
          <p>B 段内容。</p>
          <h2>章节 C</h2>
          <p>C 段内容。</p>
        </div>
        <wd-anchor v-model:expanded="anchor5Expanded" :container="article5Ref" position="absolute" :dot="false" />
      </div>
    </demo-block>

    <demo-block
      title="位置 placement"
      desc="placement=left/top/bottom 让导航贴左侧 / 顶部 / 底部；与 position=absolute 叠加嵌入舞台"
      :code="code6"
    >
      <div class="anchor-stage anchor-stage--narrow anchor-stage--placement">
        <div ref="article6Ref" class="anchor-article">
          <h1>左侧导航</h1>
          <p>导航贴左侧时的效果。</p>
          <h2>一</h2>
          <p>内容 1。</p>
          <h2>二</h2>
          <p>内容 2。</p>
        </div>
        <wd-anchor :container="article6Ref" position="absolute" placement="left" />
      </div>
    </demo-block>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElButton } from 'element-plus'
import { setAnchorItems } from '../../../src'

const articleRef = ref<HTMLElement | null>(null)
const article2Ref = ref<HTMLElement | null>(null)
const article3Ref = ref<HTMLElement | null>(null)
const article4Ref = ref<HTMLElement | null>(null)
const article5Ref = ref<HTMLElement | null>(null)
const article6Ref = ref<HTMLElement | null>(null)

const anchor4Expanded = ref(false)
const anchor5Expanded = ref(true)

const manualItems = ref([
  { title: '首页', level: 1 },
  { title: '账户设置', level: 2 },
  { title: '安全中心', level: 2 },
])

function onChange(item: { title: string } | null) {
  // 章节高亮变化，可用于同步面包屑等其他组件
}

function onClick(item: { title: string }) {
  ElMessage.info(`跳转章节：${item.title}`)
}

function injectByLinkage() {
  const n = setAnchorItems('demo-anchor', [
    { title: '跨组注入-1', level: 1 },
    { title: '跨组注入-2', level: 2 },
    { title: '跨组注入-3', level: 3 },
  ])
  ElMessage.success(`已注入 ${n} 个 Anchor 实例`)
}

function resetItems() {
  manualItems.value = [
    { title: '首页', level: 1 },
    { title: '账户设置', level: 2 },
    { title: '安全中心', level: 2 },
  ]
}

const code1 = `<template>
  <div class="stage">
    <div ref="articleRef" class="article">
      <h1>产品中心</h1>
      <h2>基本信息</h2>
      <h3>规格参数</h3>
      <h2>上架信息</h2>
    </div>
    <!-- 默认形态：右侧悬浮、收起为触发按钮、圆点模式隐藏文字；
         用 :expanded=\"true\" 展开预览列表，:dot=\"false\" 显示文字 -->
    <wd-anchor :container="articleRef" position="absolute" :offset="12"
      expanded :dot="false" @change="onChange" @item-click="onClick" />
  </div>
</template>

<script setup>
// 自动解析容器内 h1~h4 → 层级缩进列表 → 滚动高亮当前章节 → 点击平滑跳转
<\/script>`

const code2 = `<wd-anchor :container="articleRef" :max-level="2" @item-click="onClick" />
<!-- max-level=2：只收录到 h2，h3/h4 不进入列表（滚动定位仍按全部标题计算） -->`

const code3 = `<script setup>
import { setAnchorItems } from 'workdesktop-ai'

// 方式一：直接传 items（数组或 JSON 字符串）
const manualItems = ref([{ title: '首页', level: 1 }, { title: '账户设置', level: 2 }])

// 方式二：filter 分组联动 —— 任意位置调用 setAnchorItems，同组所有 Anchor 实例同步菜单
setAnchorItems('demo-anchor', [
  { title: '跨组注入-1', level: 1 },
  { title: '跨组注入-2', level: 2 },
])
<\/script>

<wd-anchor :items="manualItems" filter="demo-anchor" position="absolute" @item-click="onClick" />`

const code4 = `<wd-anchor v-model:expanded="expanded" :container="articleRef" position="absolute">
  <template #toggle><span>≡</span></template>
</wd-anchor>
<!-- v-model:expanded 受控展开态；#toggle 插槽自定义触发按钮内容 -->`

const code5 = `<wd-anchor v-model:expanded="true" :container="articleRef" position="absolute" :dot="false" />
<!-- dot=false：显示完整文字标题；dot 默认 true（圆点模式） -->`

const code6 = `<wd-anchor :container="articleRef" position="absolute" placement="left" />
<!-- placement：right=右侧（默认）/ left=左侧 / top=顶部 / bottom=底部 -->`
</script>

<style scoped>
.anchor-stage {
  position: relative;
  display: flex;
  gap: 12px;
  align-items: flex-start;
}
.anchor-stage--narrow {
  max-width: 560px;
}
.anchor-stage--placement {
  height: 220px;
}
.anchor-article {
  flex: 1;
  height: 260px;
  overflow: auto;
  border: 1px dashed var(--wd-border-color-light, #e4e7ed);
  border-radius: 6px;
  padding: 12px 16px 120px;
}
.anchor-article h1 {
  font-size: 20px;
  margin: 0 0 8px;
}
.anchor-article h2 {
  font-size: 16px;
  margin: 16px 0 8px;
  color: var(--wd-text-color-primary, #303133);
}
.anchor-article h3 {
  font-size: 14px;
  margin: 12px 0 4px;
  color: var(--wd-text-color-regular, #606266);
}
.anchor-article p {
  margin: 4px 0;
  color: var(--wd-text-color-secondary, #909399);
  font-size: 13px;
}
.demo-actions {
  margin-top: 8px;
  display: flex;
  gap: 8px;
}
.my-toggle-icon {
  font-size: 14px;
  line-height: 1;
  color: var(--wd-color-primary, #409eff);
}
</style>
