# 场景九：工作台页面（仪表盘 / 首屏聚合页）

> **创建时间**：2026-11-04\
> **最后修改时间**：2026-11-04\
> **当前版本**：V\_1.0\
> **适用对象**：AI 编码助手、开发团队\
> **核心目标**：工作台 / 仪表盘类页面的布局骨架、六种卡片区块模式、SVG 图表实现与数据接入口径\
> **文档简略描述**：本文件是「编码场景指导」的第 9 个子场景（新增场景，非主文档拆分）。参考实现：[ScenarioWorkbenchView.vue](../docs/src/views/ScenarioWorkbenchView.vue)（访问地址 `http://localhost:5003/#/scenario/workbench`，路由名 ScenarioWorkbench）。小节编号（§x.y）自 §9 起；跨场景引用（如"见 §0.8"）请按编号到对应子文件查阅，编号→文件映射见 [ai-router.md](../ai-router.md)。工作台的数据请求规范见 [ai-api/use-request-guide.md](../ai-api/use-request-guide.md)。

***

### 9.1 场景描述

工作台（仪表盘）是**登录后首屏聚合页**：把多块业务的"摘要/指标/待办"拼在一屏内，以**浏览 + 快速跳转**为主，一般不做复杂增删改查。典型区块：待办审批、数据总览、趋势图表、快捷功能入口。

与 CRUD 场景（§1–§8）的本质区别：

| 维度 | CRUD 页（场景一~八） | 工作台（本场景） |
| --- | --- | --- |
| 主体结构 | 一张 DataGrid 主表 | 多块 wd-panel 卡片分区聚合 |
| 数据形态 | 记录列表（行 × 列） | 指标数值、摘要条目、图表 |
| 用户动作 | 查询 / 增删改查 | 看一眼 → 点一下跳走或就地办结 |
| 图表 | 不涉及 | 轻量趋势图（SVG 手绘即可，不引第三方图表库） |

**三个核心建议**：

1. **卡片化分区**：每个业务块独立成一张 wd-panel 卡片（title + icon + description + extra 插槽），不要把多块业务挤进一个容器。
2. **主列 + 侧列**：左主列放"重"内容（总览 / 图表 / 任务），右侧 340px 窄列放"轻"内容（待办 / 流程 / 快捷入口），同一行左右**拉伸到同高**。
3. **图表轻量化**：趋势 / 迷你走势用原生 SVG 手绘（polyline / polygon / linearGradient），不引入 ECharts 等图表库；确需复杂交互图表时先评估包体再引入。

### 9.2 页面结构图

```
┌──────────────────────────────────────────────────────────────┐
│ 顶条（通栏，非卡片）：品牌区(logo+标题+副题)                    │
│   ｜今日完成度(百分比+任务数+进度条)｜日期时间                  │
├──────────────────────────────────────────────────────────────┤
│ 欢迎横幅（渐变细条）：时段问候语 + 主流程一句话 + 能力标签        │
├──────────────────────────────────────────────────────────────┤
│ 今日核心工作：一行 3 张任务卡，横向轮播（左右悬浮箭头翻页）        │
├──────────────────────────────────────────┬───────────────────┤
│ 今日数据总览：6 张统计卡                    │ 异常提醒            │
│ （指标值+单位+较昨日涨跌+迷你趋势折线）       │ (wd-tips+条目+行动) │
├──────────────────────────────────────────┼───────────────────┤
│ 销售趋势（SVG 双线折线图，今年/去年）        │ 待办审批            │
│ 本月目标达成（填充图表下方剩余高度）          │ （通过/拒绝+移除动画）│
│                                          ├───────────────────┤
│                                          │ 我的流程（状态+进度）│
├──────────────────────────────────────────┼───────────────────┤
│ 今日任务（状态 radio 过滤+前端分页时间线）   │ 快捷功能九宫格      │
└──────────────────────────────────────────┴───────────────────┘
```

### 9.3 布局骨架与紧凑化约定

```css
/* 页面容器：限宽居中 + 垂直 gap 控制节奏 */
.workbench-page {
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* 紧凑化：抵消 wd-panel 自带外边距，收敛头部/正文留白 */
.workbench-page :deep(.wd-panel) { margin-bottom: 0; }
.workbench-page :deep(.wd-panel__header) { padding: 8px 14px; }
.workbench-page :deep(.wd-panel__body) { padding: 10px 14px 12px; }

/* 主列 + 侧列：minmax(0,1fr) 防止内容撑破栅格 */
.wb-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 10px;
  align-items: start;
}

/* 同一行左右面板拉伸到同高：panel 转 flex column，内容区撑满 */
.wb-row--fill { align-items: stretch; }
.wb-row--fill :deep(.wd-panel) { display: flex; flex-direction: column; }
.wb-row--fill :deep(.wd-panel__body) { display: flex; flex-direction: column; flex: 1; min-height: 0; }
```

**要点**：

- 顶条、欢迎横幅是**通栏元素**（不用 wd-panel 包裹），只有业务区块用 wd-panel。
- 同高拉伸后，侧列窄面板里"内容不足"的块（如目标达成）用 `flex: 1` 吸收剩余高度，而不是留白。
- 侧列固定 **340px**；小于 1100px 降级单列（见 §9.7 响应式）。

### 9.4 六种卡片区块模式

参考实现中的六种标准区块，新增工作台时按模式套用：

**① 统计卡（今日数据总览）**：`grid: repeat(6, 1fr)`，每张卡 = 指标名(12px) + 数值(18px, tabular-nums) + 单位 + "较昨日"涨跌标签（icon TopRight/BottomRight，正 success 负 danger）+ 迷你趋势 sparkline。sparkline 用 `viewBox="0 0 100 24"`，按 min-max 归一化算 y 坐标，polygon 面积填充 + polyline 描边。

**② 轮播卡（今日核心工作）**：外层 viewport `overflow: hidden`，轨道 flex + gap 10px + `transition: transform 0.45s`，每张 `flex: 0 0 calc((100% - 20px) / 3)` 一行 3 张；翻页用 `transform: translateX(calc(page * (-100% - 10px)))`；左右箭头 absolute 半悬浮圆形白底按钮，到边界 `disabled`。

**③ 图表卡（销售趋势）**：原生 SVG 折线图，宽度 100% 自适应。固定 viewBox（如 640×190）+ 四边留白（padL/padR/padT/padB）+ 纵轴最大值（max），数值 → 坐标的换算函数（chartX/chartY）单独封装；网格参考线 + 刻度 text；对比线用灰色虚线（stroke-dasharray）；主线 + 渐变面积（linearGradient 从 primary 14% 到透明）+ 数据点 circle（内嵌 `<title>` 悬浮显示"月份：数值"）。

**④ 列表卡（异常提醒 / 待办审批 / 我的流程）**：条目纵向排布，条目间 `border-bottom: 1px solid var(--el-border-color-extra-light)` 分隔（最后一条去掉）；标题 13px 单行省略、meta 12px；操作按钮靠右。待办类条目操作成功后：ElMessage 反馈（§0.8）→ 从数组移除 → 外层用 `<transition-group>` 做移除动画；列表清空后显示 el-empty（§0.10）。

**⑤ 时间线卡（今日任务）**：extra 插槽放 el-radio-group 做状态过滤（computed 过滤，切换时重置到第一页）；条目 = 时间(定宽) + 状态圆点(8px, 语义色) + 标题 + 状态标签；前端分页 `el-pagination` page-size 5、`layout="prev, pager, next"`、`hide-on-single-page`。

**⑥ 九宫格（快捷功能）**：`grid: repeat(3, 1fr)`，每项是 `button`（不是 a 链接）= 图标块(34px 圆角) + 文字(12px)；hover 换边框/背景；已上线的项路由跳转，未上线的点击 `ElMessage.info('打开「xx」（演示入口）')`，不留死链接。

### 9.5 交互流程（加载与数据接入）

```
1. 页面加载（必要时整页 loading，见 §0.11）
     ↓
2. 并行请求各卡片摘要数据（指标 / 待办 / 异常 / 任务），见 §0.2 与 use-request-guide.md
     ↓
3. 各卡片独立渲染；某块无数据 → el-empty 空状态（§0.10），不整页报错
     ↓
4. 就地办结类操作（通过 / 拒绝）→ ElMessage 反馈（§0.8）→ 条目从列表移除（transition-group）
   危险操作走确认机制分级（§0.9）
     ↓
5. 跳转型入口（快捷功能 / 全部任务 / 去处理）→ 路由跳转或弹窗/抽屉（§0.7）
     ↓
6. 数据顺序更新（如完成度、待办数）→ 同步刷新对应卡片，保持口径一致
```

**数据接入口径**：开发期先写**静态演示数据 + interface 类型定义**（每块数据一个 interface），接口就绪后仅替换取数来源，模板不动。演示数据要贴近真实业务语义（金额用 ¥ + 千分位、时间用"今天 09:32 / 昨天 17:40"），不要用 lorem/abc 之类的假词（§0.12 文案规范）。

### 9.6 代码示例

以下为精简骨架（完整实现见 [ScenarioWorkbenchView.vue](../docs/src/views/ScenarioWorkbenchView.vue)）：

```html
<template>
  <div class="workbench-page">
    <!-- ① 顶条：品牌区 + 完成度 + 日期时间（通栏，不用 wd-panel） -->
    <header class="wb-topbar">
      <div class="wb-topbar__brand">
        <span class="wb-topbar__logo"><el-icon :size="22"><OfficeBuilding /></el-icon></span>
        <div>
          <h1 class="wb-topbar__title">工作台</h1>
          <p class="wb-topbar__sub">审批 · 流程 · 协作 一站式处理</p>
        </div>
      </div>
      <div class="wb-topbar__progress">
        <div class="wb-topbar__progress-head">
          <span class="wb-topbar__percent">今日完成度 <b>72%</b></span>
          <span class="wb-topbar__tasks">已完成 8 / 11 项任务</span>
        </div>
        <el-progress :percentage="72" :stroke-width="8" :show-text="false" class="wb-topbar__bar" />
      </div>
      <div class="wb-topbar__time">{{ todayText }}</div>
    </header>

    <!-- ② 欢迎横幅：时段问候 + 主流程一句话 + 能力标签 -->
    <section class="wb-banner">
      <div class="wb-banner__text">
        <p class="wb-banner__headline">{{ greeting }}，让每一次审批都高效流转</p>
        <p class="wb-banner__flow">
          提交 <el-icon><ArrowRight /></el-icon> 审批 <el-icon><ArrowRight /></el-icon> 归档
        </p>
      </div>
      <ul class="wb-banner__feats">
        <li><el-icon><Checked /></el-icon>一站式审批</li>
        <li><el-icon><DataLine /></el-icon>流程可视化</li>
      </ul>
    </section>

    <!-- ③ 主列 + 侧列（左右同高拉伸） -->
    <section class="wb-row wb-row--fill">
      <!-- 主列：今日数据总览（统计卡） -->
      <wd-panel title="今日数据总览" icon="Odometer" description="截至 09:00">
        <div class="wb-stats">
          <div v-for="s in stats" :key="s.label" class="wb-stat">
            <span class="wb-stat__label">{{ s.label }}</span>
            <span class="wb-stat__value">{{ s.value }}<i>{{ s.unit }}</i></span>
            <div class="wb-stat__sub">
              <span class="wb-stat__cmp">较昨日</span>
              <wd-tag
                v-if="s.delta !== undefined"
                :type="s.delta >= 0 ? 'success' : 'danger'"
                :icon="s.delta >= 0 ? TopRight : BottomRight"
                size="small" round effect="light">{{ Math.abs(s.delta) }}%</wd-tag>
            </div>
            <!-- 迷你趋势 sparkline：viewBox 0 0 100 24，min-max 归一化 -->
            <svg class="wb-stat__spark" viewBox="0 0 100 24" preserveAspectRatio="none" aria-hidden="true">
              <polygon :points="sparkArea(s.trend)" fill="var(--el-color-primary-light-9)" />
              <polyline :points="sparkPoints(s.trend)" fill="none" stroke="var(--el-color-primary)"
                stroke-width="1.5" vector-effect="non-scaling-stroke" />
            </svg>
          </div>
        </div>
      </wd-panel>

      <!-- 侧列：待办审批（列表卡 + 就地办结） -->
      <wd-panel title="待办审批" icon="Bell">
        <transition-group name="wb-list" tag="ul" class="wb-approve-list">
          <li v-for="item in approvals" :key="item.id" class="wb-approve">
            <div class="wb-approve__body">
              <div class="wb-approve__row">
                <wd-tag size="small" effect="plain">{{ item.type }}</wd-tag>
                <span class="wb-approve__title" :title="item.title">{{ item.title }}</span>
              </div>
              <div class="wb-approve__meta">{{ item.applicant }} · {{ item.time }}</div>
            </div>
            <div class="wb-approve__actions">
              <el-button size="small" type="primary" @click="approve(item)">通过</el-button>
              <el-button size="small" plain @click="reject(item)">拒绝</el-button>
            </div>
          </li>
        </transition-group>
        <el-empty v-if="!approvals.length" description="审批已全部处理完" :image-size="72" />
      </wd-panel>
    </section>

    <!-- ④ 第二行：图表卡 + 快捷功能 -->
    <section class="wb-row">
      <wd-panel title="销售趋势" icon="TrendCharts" description="近 12 个月（万元）">
        <!-- 原生 SVG 折线图：今年实线 + 去年虚线 + 渐变面积，换算函数见脚本区 -->
        <svg class="wb-chart__svg" :viewBox="`0 0 640 ${CHART.h}`" role="img" aria-label="销售趋势折线图">
          <g v-for="g in gridLines" :key="g.value">
            <line :x1="CHART.padL" :y1="g.y" :x2="640 - CHART.padR" :y2="g.y"
              stroke="var(--el-border-color-lighter)" stroke-width="1" />
            <text :x="CHART.padL - 8" :y="g.y + 3" text-anchor="end" class="wb-chart__tick">{{ g.value }}</text>
          </g>
          <polyline :points="linePoints(salesLastYear)" fill="none" stroke="var(--el-text-color-secondary)"
            stroke-width="1.4" stroke-dasharray="5 4" />
          <polygon :points="chartArea(salesThisYear)" fill="url(#wbChartFill)" />
          <polyline :points="linePoints(salesThisYear)" fill="none"
            stroke="var(--el-color-primary)" stroke-width="2" />
          <g v-for="(p, i) in chartDots(salesThisYear)" :key="i">
            <circle :cx="p.x" :cy="p.y" r="2.6" fill="var(--el-color-primary)" />
            <title>{{ monthLabels[i] }}：{{ salesThisYear[i] }} 万元</title>
          </g>
          <defs>
            <linearGradient id="wbChartFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="var(--el-color-primary)" stop-opacity="0.14" />
              <stop offset="100%" stop-color="var(--el-color-primary)" stop-opacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </wd-panel>

      <wd-panel title="快捷功能" icon="Grid">
        <div class="wb-grid">
          <button v-for="app in apps" :key="app.label" type="button" class="wb-grid__item"
            @click="openApp(app.label)">
            <span class="wb-grid__icon"><el-icon :size="20"><component :is="app.icon" /></el-icon></span>
            <span class="wb-grid__label">{{ app.label }}</span>
          </button>
        </div>
      </wd-panel>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, type Component } from 'vue'
import { ElMessage } from 'element-plus'
import { ArrowRight, BottomRight, Checked, DataLine, OfficeBuilding, TopRight } from '@element-plus/icons-vue'

/* 时段问候与日期 */
const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return '上午好'
  if (h < 18) return '下午好'
  return '晚上好'
})
const todayText = computed(() => {
  const d = new Date()
  const week = ['日', '一', '二', '三', '四', '五', '六'][d.getDay()]
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 · 星期${week}`
})

/* 状态 → 语义色（wd-tag type），全页统一映射，禁止散落的三元判断 */
function stateType(state: string): 'primary' | 'warning' | 'success' | 'danger' | 'info' {
  if (state === '已完成' || state === '已通过') return 'success'
  if (state === '已驳回') return 'danger'
  if (state === '进行中') return 'warning'
  if (state === '待开始') return 'info'
  return 'primary'
}

/* 统计卡：开发期静态演示数据 + interface；接口就绪后仅替换取数来源 */
interface Stat { label: string; value: string; unit: string; delta?: number; trend: number[] }
const stats: Stat[] = [
  { label: '昨日销售额', value: '6.8', unit: '万', delta: 8.2, trend: [35, 45, 40, 60, 55, 78, 92] },
  { label: '新增客户', value: '68', unit: '家', delta: 34.0, trend: [30, 42, 38, 55, 62, 58, 80] }
]

/* sparkline 坐标：trend 值按 min-max 归一化到 viewBox 高度（1-23），x 均分 0-100 */
function sparkPoints(trend: number[]) {
  const min = Math.min(...trend)
  const range = Math.max(...trend) - min || 1
  return trend
    .map((v, i) => `${((i * 100) / (trend.length - 1)).toFixed(1)},${(23 - ((v - min) / range) * 22).toFixed(1)}`)
    .join(' ')
}
function sparkArea(trend: number[]) {
  return `${sparkPoints(trend)} 100,24 0,24`
}

/* 折线图：viewBox + 四边留白 + 纵轴最大值，数值 → 坐标换算独立封装 */
const CHART = { w: 640, h: 190, padL: 40, padR: 16, padT: 14, padB: 26, max: 160 }
const monthLabels = ['1月', '2月', '3月', '4月']
const salesThisYear = [86, 92, 78, 95]
const salesLastYear = [70, 74, 69, 82]

function chartX(i: number) {
  return CHART.padL + (i * (CHART.w - CHART.padL - CHART.padR)) / (monthLabels.length - 1)
}
function chartY(v: number) {
  return CHART.padT + (1 - v / CHART.max) * (CHART.h - CHART.padT - CHART.padB)
}
function linePoints(data: number[]) {
  return data.map((v, i) => `${chartX(i).toFixed(1)},${chartY(v).toFixed(1)}`).join(' ')
}
function chartArea(data: number[]) {
  return `${linePoints(data)} ${chartX(data.length - 1).toFixed(1)},${CHART.h - CHART.padB} ${CHART.padL},${CHART.h - CHART.padB}`
}
function chartDots(data: number[]) {
  return data.map((v, i) => ({ x: chartX(i), y: chartY(v) }))
}
const gridLines = [0, 40, 80, 120, 160].map((value) => ({ value, y: chartY(value) }))

/* 待办审批：就地办结 → 反馈 + 移除，transition-group 做移除动画 */
interface Approval { id: number; type: string; title: string; applicant: string; time: string }
const approvals = ref<Approval[]>([
  { id: 1, type: '请假申请', title: '年假 2 天（10-22 至 10-23）', applicant: '张伟', time: '今天 09:32' },
  { id: 2, type: '报销申请', title: '客户拜访差旅报销 ¥1,280.00', applicant: '李娜', time: '今天 10:15' }
])
function approve(item: Approval) {
  approvals.value = approvals.value.filter((a) => a.id !== item.id)
  ElMessage.success(`已通过「${item.type}」`)
}
function reject(item: Approval) {
  approvals.value = approvals.value.filter((a) => a.id !== item.id)
  ElMessage.info(`已拒绝「${item.type}」`)
}

/* 快捷功能：未接后端的入口用演示提示，不留死链接 */
interface AppEntry { label: string; icon: Component }
const apps: AppEntry[] = [
  { label: '请假申请', icon: DataLine },
  { label: '报销申请', icon: Checked },
  { label: '会议室预订', icon: ArrowRight }
]
function openApp(label: string) {
  ElMessage.info(`打开「${label}」（演示入口）`)
}
</script>
```

配套样式（节选，完整见参考实现）：

```css
/* 统计卡：6 列栅格，同高拉伸时 auto-rows: 1fr 均分行高 */
.wb-stats { display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; }
.wb-stat {
  display: flex; flex-direction: column;
  border: 1px solid var(--el-border-color-extra-light);
  border-radius: 8px; padding: 8px 10px;
}
.wb-stat__value {
  font-size: 18px; font-weight: 600; line-height: 1.2;
  font-variant-numeric: tabular-nums;  /* 全页数字统一等宽数字 */
}
.wb-stat__spark { display: block; width: 100%; height: 24px; margin-top: auto; }

/* 图表：宽度自适应，SVG 内文字用刻度类 */
.wb-chart__svg { display: block; width: 100%; height: auto; }
.wb-chart__tick { font-size: 10px; fill: var(--el-text-color-secondary); }

/* 列表条目：分隔线 + 单行省略（省略三件套 + min-width: 0 缺一不可） */
.wb-approve { display: flex; align-items: center; gap: 12px;
  padding: 6px 0; border-bottom: 1px solid var(--el-border-color-extra-light); }
.wb-approve:last-child { border-bottom: none; }
.wb-approve__body { flex: 1; min-width: 0; }
.wb-approve__title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* 九宫格 + hover 反馈 */
.wb-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.wb-grid__item { display: flex; flex-direction: column; align-items: center; gap: 5px;
  padding: 9px 6px; border: 1px solid var(--el-border-color-extra-light);
  border-radius: 8px; background: var(--el-bg-color); cursor: pointer; }
.wb-grid__item:hover { border-color: var(--el-color-primary-light-5);
  background: var(--el-color-primary-light-9); }

/* 响应式：1100px 降单列，640px 收窄栅格 */
@media (max-width: 1100px) {
  .wb-row { grid-template-columns: 1fr; }
  .wb-stats { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 640px) {
  .wb-stats { grid-template-columns: repeat(2, 1fr); }
  .wb-grid { grid-template-columns: repeat(2, 1fr); }
}
```

### 9.7 规范要点

| 项 | 规范 |
| --- | --- |
| 适用判定 | 登录后首屏、聚合多业务摘要卡片、以浏览和快速跳转为主（无主表格、无复杂表单）时用本场景；一旦出现"完整记录列表 + 分页"就改用 §1 / §8 的列表场景 |
| 页面容器 | `max-width: 1280px` 居中，flex column + `gap: 10px` 控制垂直节奏；顶条/横幅为通栏元素，业务区块才用 wd-panel |
| 布局骨架 | 主列 + 340px 侧列（`grid-template-columns: minmax(0, 1fr) 340px`）；`minmax(0,1fr)` 必须带，防止长内容撑破栅格 |
| 同高拉伸 | 同一行左右面板底边对齐用 `wb-row--fill`（panel 与 body 转 flex column + `flex: 1`）；"内容不足"的侧列面板用 `flex: 1` 吸收剩余高度，不留白 |
| 紧凑化 | 工作台信息密度高，统一 `:deep(.wd-panel)` 收敛 header/body 内边距并抵消默认外边距，全页保持一种节奏 |
| 区块模式 | 按六种标准模式套用（统计卡 / 轮播卡 / 图表卡 / 列表卡 / 时间线卡 / 九宫格），不自创新结构；同模式卡片样式必须一致 |
| 图表选型 | 趋势 / 迷你走势用原生 SVG 手绘（polyline + linearGradient + `<title>` 悬浮），坐标换算封装成函数；**不默认引入 ECharts 等图表库**，确需复杂交互图表时先评估包体与按需引入方案 |
| 数据接入 | 静态演示数据 + interface 类型定义先行，接口就绪后仅替换取数来源（§0.2，详见 use-request-guide.md）；各卡片并行取数、独立渲染、独立空状态 |
| 状态语义色 | `stateType()` / `flowState()` 之类的语义色映射**集中定义一次**全页复用，禁止在模板里散落三元判断；状态点 / 标签 / 进度条颜色统一走 `--el-color-*` 主题变量 |
| 数字显示 | 所有数值（指标、百分比、日期时间）统一 `font-variant-numeric: tabular-nums`；金额用 ¥ + 千分位，涨跌用带 icon 的 success/danger 标签（正值 TopRight、负值 BottomRight） |
| 就地办结 | 待办类条目操作成功后：ElMessage 反馈（§0.8）→ 条目移除（transition-group 动画）→ 列表清空显示 el-empty（§0.10）；危险操作走确认分级（§0.9） |
| 入口行为 | 快捷功能用 `button` + 图标块；已上线走路由跳转 / 弹窗抽屉（§0.7），未上线用 `ElMessage.info('打开「xx」（演示入口）')`，不留死链接、不跳 404 |
| 单行省略 | 长标题一律省略三件套（overflow hidden + text-overflow ellipsis + white-space nowrap），容器侧 `min-width: 0`，完整内容放 `:title` 悬浮 |
| 响应式 | `≤1100px` 主侧列降单列、统计卡 3 列；`≤640px` 统计卡与九宫格降 2 列；顶条允许 wrap |
| 加载与空状态 | 首屏必要时整页 loading（§0.11）；单卡片无数据用 el-empty 局部兜底，不因一块空数据整页报错 |
| 文案 | 区块标题 4 字为宜（总览/待办/趋势/目标），描述补充口径（如"截至 09:00""近 12 个月（万元）"），其余遵守 §0.12 |

### 9.8 该场景对组件规格的补充需求

| 组件 | 补充项 | 说明 |
| --- | --- | --- |
| — | — | 工作台全部由既有能力组合实现（wd-panel + wd-tag + wd-tips + el-progress / el-empty / el-pagination / el-radio-group + 原生 HTML/SVG），不新增组件规格 |

> 结论：场景九**不新增组件规格**。图表用原生 SVG；若后续业务确需专业交互图表，再单独评估引入图表库并回流 PRD。

***

> **版本变更记录**：V\_1.0（2026-11-04）——首版发布。基于参考实现 ScenarioWorkbenchView.vue 提炼布局骨架、六种卡片区块模式、SVG 图表实现与数据接入口径，形成工作台场景指引。
