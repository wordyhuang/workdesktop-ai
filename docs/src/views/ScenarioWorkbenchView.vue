<template>
  <div class="workbench-page">
    <!-- 页面顶条：标题 / 今日完成度 / 日期时间 -->
    <header class="wb-topbar">
      <div class="wb-topbar__brand">
        <span class="wb-topbar__logo"><el-icon :size="22"><OfficeBuilding /></el-icon></span>
        <div>
          <h1 class="wb-topbar__title">工作台</h1>
          <p class="wb-topbar__sub">审批 · 流程 · 协作 一站式处理</p>
        </div>
      </div>
      <!-- 今日完成度：标签行（完成度 + 任务数）+ 进度条 -->
      <div class="wb-topbar__progress">
        <div class="wb-topbar__progress-head">
          <span class="wb-topbar__percent">今日完成度 <b>72%</b></span>
          <span class="wb-topbar__tasks">已完成 8 / 11 项任务</span>
        </div>
        <el-progress :percentage="72" :stroke-width="8" :show-text="false" class="wb-topbar__bar" />
      </div>
      <!-- 日期时间 -->
      <div class="wb-topbar__time">{{ todayText }}</div>
    </header>

    <!-- 欢迎横幅 -->
    <section class="wb-banner">
      <div class="wb-banner__text">
        <p class="wb-banner__headline">{{ greeting }}，让每一次审批都高效流转</p>
        <p class="wb-banner__flow">
          提交 <el-icon><ArrowRight /></el-icon> 审批 <el-icon><ArrowRight /></el-icon>
          归档 <el-icon><ArrowRight /></el-icon> 复盘
        </p>
      </div>
      <ul class="wb-banner__feats">
        <li><el-icon><Checked /></el-icon>一站式审批</li>
        <li><el-icon><DataLine /></el-icon>流程可视化</li>
        <li><el-icon><TrendCharts /></el-icon>数据驱动</li>
        <li><el-icon><Bell /></el-icon>消息提醒</li>
      </ul>
    </section>

    <!-- 今日核心工作 -->
    <wd-panel title="今日核心工作" icon="AlarmClock" description="建议按顺序优先处理">
      <template #extra>
        <el-button link type="primary">全部任务</el-button>
      </template>
      <div class="wb-core-wrap">
        <div class="wb-core-viewport">
          <ul class="wb-core" :style="{ transform: `translateX(calc(${corePage} * (-100% - 10px)))` }">
          <li v-for="(t, i) in coreTasks" :key="t.title" class="wb-core__item">
            <div class="wb-core__head">
              <span class="wb-core__no">{{ String(i + 1).padStart(2, '0') }}</span>
              <span class="wb-core__icon"><el-icon :size="15"><component :is="t.icon" /></el-icon></span>
              <span class="wb-core__title">{{ t.title }}</span>
            </div>
          <div class="wb-core__foot">
            <el-progress
              v-if="t.percent > 0 && t.percent < 100"
              :percentage="t.percent" :stroke-width="5" :show-text="false" class="wb-core__bar" />
            <span class="wb-core__due">截止 {{ t.due }}</span>
            <span class="wb-core__state">
              <b v-if="t.percent > 0">{{ t.percent }}%</b>
              <wd-tag size="small" :type="stateType(t.state)">{{ t.state }}</wd-tag>
            </span>
          </div>
          </li>
          </ul>
        </div>
        <button
          class="wb-core__nav is-prev" type="button" aria-label="上一页"
          :disabled="corePage <= 0" @click="corePage--">
          <el-icon :size="14"><ArrowLeft /></el-icon>
        </button>
        <button
          class="wb-core__nav is-next" type="button" aria-label="下一页"
          :disabled="corePage >= coreMaxPage" @click="corePage++">
          <el-icon :size="14"><ArrowRight /></el-icon>
        </button>
      </div>
    </wd-panel>

    <!-- 今日数据总览 + 异常提醒 -->
    <section class="wb-row wb-row--fill">
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
                size="small" round effect="light">
                {{ Math.abs(s.delta) }}%
              </wd-tag>
            </div>
            <svg class="wb-stat__spark" viewBox="0 0 100 24" preserveAspectRatio="none" aria-hidden="true">
              <polygon :points="sparkArea(s.trend)" fill="var(--el-color-primary-light-9)" />
              <polyline
                :points="sparkPoints(s.trend)" fill="none" stroke="var(--el-color-primary)"
                stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
                vector-effect="non-scaling-stroke" />
            </svg>
          </div>
        </div>
      </wd-panel>

      <wd-panel title="异常提醒" icon="WarningFilled">
        <wd-tips
          type="box" icon="WarningFilled"
          color="var(--el-color-danger)" bg="var(--el-color-danger-light-9)"
          tips="共 3 条异常需要处理，请尽快确认，避免影响流程时效。" />
        <ul class="wb-alert-list">
          <li v-for="a in alerts" :key="a.title" class="wb-alert">
            <div class="wb-alert__body">
              <div class="wb-alert__title">{{ a.title }}</div>
              <div class="wb-alert__meta">{{ a.meta }}</div>
            </div>
            <el-button link type="primary" size="small">{{ a.action }}</el-button>
          </li>
        </ul>
      </wd-panel>
    </section>

    <!-- 销售趋势 + 本月目标 / 待办审批 + 我的流程（左右列同高，目标面板填充图表下方剩余高度） -->
    <section class="wb-row wb-row--fill">
      <div class="wb-col">
        <wd-panel title="销售趋势" icon="TrendCharts" description="近 12 个月（万元）" class="wb-chart">
          <template #extra>
            <div class="wb-legend">
              <span class="wb-legend__item"><i class="is-primary" />今年</span>
              <span class="wb-legend__item"><i class="is-muted" />去年</span>
            </div>
          </template>
          <svg class="wb-chart__svg" :viewBox="`0 0 640 ${CHART.h}`" role="img" aria-label="近 12 个月销售趋势折线图">
            <g v-for="g in gridLines" :key="g.value">
              <line :x1="CHART.padL" :y1="g.y" :x2="640 - CHART.padR" :y2="g.y"
                stroke="var(--el-border-color-lighter)" stroke-width="1" />
              <text :x="CHART.padL - 8" :y="g.y + 3" text-anchor="end" class="wb-chart__tick">{{ g.value }}</text>
            </g>
            <polyline :points="linePoints(salesLastYear)" fill="none" stroke="var(--el-text-color-secondary)"
              stroke-width="1.4" stroke-dasharray="5 4" />
            <polygon :points="chartArea(salesThisYear)" fill="url(#wbChartFill)" />
            <polyline :points="linePoints(salesThisYear)" fill="none" stroke="var(--el-color-primary)" stroke-width="2" />
            <g v-for="(p, i) in chartDots(salesThisYear)" :key="i">
              <circle :cx="p.x" :cy="p.y" r="2.6" fill="var(--el-color-primary)" />
              <title>{{ monthLabels[i] }}：{{ salesThisYear[i] }} 万元</title>
            </g>
            <text v-for="(label, i) in monthLabels" :key="label" :x="chartX(i)" :y="CHART.h - 8" text-anchor="middle"
              class="wb-chart__tick">{{ label }}</text>
            <defs>
              <linearGradient id="wbChartFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="var(--el-color-primary)" stop-opacity="0.14" />
                <stop offset="100%" stop-color="var(--el-color-primary)" stop-opacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </wd-panel>

        <wd-panel title="本月目标达成" icon="Aim" description="截至 09:00" class="wb-goals-panel">
          <ul class="wb-goals">
            <li v-for="g in goals" :key="g.label" class="wb-goal">
              <div class="wb-goal__head">
                <span class="wb-goal__label">{{ g.label }}</span>
                <span class="wb-goal__percent">{{ g.percent }}<i>%</i></span>
              </div>
              <div class="wb-goal__meta">
                <span class="wb-goal__num">{{ g.value }}<i>/ {{ g.target }}{{ g.unit }}</i></span>
                <span class="wb-goal__gap">还差 {{ g.target - g.value }}{{ g.unit }}</span>
              </div>
              <div class="wb-goal__bar">
                <span class="wb-goal__bar-fill" :style="{ '--w': `${g.percent}%` }" />
              </div>
            </li>
          </ul>
        </wd-panel>
      </div>

      <div class="wb-col">
        <wd-panel title="待办审批" icon="Bell">
          <template #extra>
            <el-button link type="primary">全部</el-button>
          </template>
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

        <wd-panel title="我的流程" icon="Promotion">
          <template #extra>
            <el-button link type="primary">全部</el-button>
          </template>
          <ul class="wb-flow-list">
            <li v-for="flow in flows" :key="flow.id" class="wb-flow">
              <div class="wb-flow__row">
                <span class="wb-flow__title">{{ flow.title }}</span>
                <wd-tag size="small" :type="flowState(flow.state).tag" effect="light">{{ flow.state }}</wd-tag>
              </div>
              <div class="wb-flow__meta">{{ flow.node }}</div>
              <el-progress v-if="flow.percent < 100" :percentage="flow.percent" :stroke-width="5"
                :show-text="false" class="wb-flow__bar" />
            </li>
          </ul>
        </wd-panel>
      </div>
    </section>

    <!-- 今日任务 + 快捷功能 -->
    <section class="wb-row wb-row--fill">
      <wd-panel title="今日任务" icon="List">
        <template #extra>
          <el-radio-group v-model="taskFilter" size="small">
            <el-radio-button label="全部" />
            <el-radio-button label="进行中" />
            <el-radio-button label="待开始" />
            <el-radio-button label="已完成" />
          </el-radio-group>
        </template>
        <ul class="wb-timeline">
          <li v-for="task in pagedTasks" :key="task.time + task.title" class="wb-timeline__item">
            <span class="wb-timeline__time">{{ task.time }}</span>
            <span class="wb-timeline__dot" :class="`is-${stateType(task.state)}`" />
            <span class="wb-timeline__title">{{ task.title }}</span>
            <wd-tag size="small" :type="stateType(task.state)" effect="light">{{ task.state }}</wd-tag>
          </li>
        </ul>
        <el-empty v-if="!filteredTasks.length" description="该状态下暂无任务" :image-size="64" />
        <el-pagination
          v-model:current-page="taskPage"
          class="wb-task-pager"
          :page-size="TASK_PAGE_SIZE"
          :total="filteredTasks.length"
          layout="prev, pager, next"
          small background hide-on-single-page />
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
import { computed, ref, watch, type Component } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Aim, AlarmClock, ArrowLeft, ArrowRight, Bell, BottomRight, Calendar, Checked, Clock,
  DataLine, EditPen, Grid, List, Money, OfficeBuilding, Odometer,
  ShoppingCart, Suitcase, TopRight, TrendCharts,
  Wallet, WarningFilled
} from '@element-plus/icons-vue'

/** 问候语按当前时段显示 */
const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 6) return '凌晨好'
  if (h < 9) return '早上好'
  if (h < 12) return '上午好'
  if (h < 14) return '中午好'
  if (h < 18) return '下午好'
  return '晚上好'
})
const todayText = computed(() => {
  const d = new Date()
  const week = ['日', '一', '二', '三', '四', '五', '六'][d.getDay()]
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 · 星期${week}`
})

/** 状态 → 语义色（wd-tag type） */
function stateType(state: string): 'primary' | 'warning' | 'success' | 'danger' | 'info' {
  if (state === '已完成' || state === '已通过') return 'success'
  if (state === '已驳回') return 'danger'
  if (state === '进行中') return 'warning'
  if (state === '待开始') return 'info'
  return 'primary'
}

/** 今日核心工作（静态演示数据） */
interface CoreTask { title: string; cat: string; percent: number; due: string; state: string; icon: Component }
const CORE_PAGE_SIZE = 3
const coreTasks: CoreTask[] = [
  { title: 'Q4 预算评审会材料准备', cat: '会议材料', percent: 60, due: '今天 11:30', state: '进行中', icon: EditPen },
  { title: '供应商合同续签审批', cat: '合同', percent: 20, due: '今天 15:00', state: '进行中', icon: DataLine },
  { title: '11 月部门排期确认', cat: '协作', percent: 0, due: '今天 18:00', state: '待开始', icon: Calendar },
  { title: '客户拜访复盘纪要归档', cat: '客户', percent: 100, due: '今天 10:00', state: '已完成', icon: Checked },
  { title: '渠道月度对账单核对', cat: '财务', percent: 45, due: '今天 17:00', state: '进行中', icon: Money },
  { title: '本周运营数据周报', cat: '汇报', percent: 0, due: '今天 20:00', state: '待开始', icon: TrendCharts }
]
const corePage = ref(0)
const coreMaxPage = Math.max(0, Math.ceil(coreTasks.length / CORE_PAGE_SIZE) - 1)

/** 今日数据总览（静态演示数据，真实业务由 requestAPI 提供）；trend=近 7 日迷你趋势柱（0-100 相对高度） */
interface Stat { label: string; value: string; unit: string; delta?: number; trend: number[] }
const stats: Stat[] = [
  { label: '昨日销售额', value: '6.8', unit: '万', delta: 8.2, trend: [35, 45, 40, 60, 55, 78, 92] },
  { label: '新增客户', value: '68', unit: '家', delta: 34.0, trend: [30, 42, 38, 55, 62, 58, 80] },
  { label: '在途订单', value: '214', unit: '单', delta: 12.4, trend: [55, 48, 60, 52, 68, 74, 82] },
  { label: '本月回款', value: '82.5', unit: '万', delta: -2.1, trend: [90, 84, 88, 70, 62, 58, 46] },
  { label: '待审报销单', value: '9', unit: '笔', delta: 22.2, trend: [25, 35, 30, 48, 55, 66, 75] },
  { label: '会议室使用', value: '5', unit: '间', delta: 40.0, trend: [40, 52, 46, 64, 58, 72, 88] }
]

/** 异常提醒 */
const alerts = [
  { title: '报销单 BT-1102 已挂起 3 天', meta: '申请人：张伟 · 金额 ¥1,280.00', action: '去处理' },
  { title: '供应商合同 H-2026-087 即将到期', meta: '到期日：11-08 · 金额 ¥56,000', action: '去续签' }
]

/** 折线图：坐标换算（静态演示数据） */
const CHART = { w: 640, h: 190, padL: 40, padR: 16, padT: 14, padB: 26, max: 160 }
const monthLabels = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
const salesThisYear = [86, 92, 78, 95, 104, 98, 112, 118, 106, 124, 132, 141]
const salesLastYear = [70, 74, 69, 82, 88, 84, 92, 96, 90, 101, 108, 115]

/** 本月目标达成（静态演示数据，填充销售趋势面板下方剩余高度） */
const goals = [
  { label: '销售额目标', value: 860, target: 1000, unit: '万', percent: 86 },
  { label: '回款目标', value: 620, target: 800, unit: '万', percent: 78 },
  { label: '新客户开发', value: 42, target: 50, unit: '家', percent: 84 }
]

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

/** 统计卡迷你折线坐标：0-100 相对值按 min-max 归一化到 viewBox 高度（1-23），x 均分 0-100 */
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

/** 待办审批 */
interface Approval { id: number; type: string; title: string; applicant: string; time: string }
const approvals = ref<Approval[]>([
  { id: 1, type: '请假申请', title: '年假 2 天（10-22 至 10-23）', applicant: '张伟', time: '今天 09:32' },
  { id: 2, type: '报销申请', title: '客户拜访差旅报销 ¥1,280.00', applicant: '李娜', time: '今天 10:15' },
  { id: 3, type: '合同审批', title: '年度框架采购合同 ¥56,000', applicant: '王强', time: '昨天 17:40' },
  { id: 4, type: '用章申请', title: '投标文件盖章（3 份）', applicant: '赵敏', time: '昨天 15:08' },
  { id: 5, type: '会议室预订', title: '明下午产品评审会（大会议室）', applicant: '陈杰', time: '昨天 11:26' }
])
function approve(item: Approval) {
  approvals.value = approvals.value.filter((a) => a.id !== item.id)
  ElMessage.success(`已通过「${item.type}」`)
}
function reject(item: Approval) {
  approvals.value = approvals.value.filter((a) => a.id !== item.id)
  ElMessage.info(`已拒绝「${item.type}」`)
}

/** 我的流程 */
interface Flow { id: number; title: string; node: string; state: string; percent: number }
const flows: Flow[] = [
  { id: 1, title: 'Q4 市场推广预算申请', node: '当前节点：财务复核', state: '进行中', percent: 60 },
  { id: 2, title: '年度设备采购计划', node: '当前节点：部门审批', state: '进行中', percent: 30 },
  { id: 3, title: '办公耗材更换申请', node: '已完成全部节点', state: '已通过', percent: 100 },
  { id: 4, title: '8 月差旅报销结算', node: '附件不齐，被退回修改', state: '已驳回', percent: 100 }
]
function flowState(state: string): { tag: 'primary' | 'warning' | 'success' | 'danger' } {
  if (state === '已通过') return { tag: 'success' }
  if (state === '已驳回') return { tag: 'danger' }
  return { tag: 'warning' }
}

/** 今日任务时间线（12 条演示数据，前端分页每页 5 条） */
interface TaskItem { time: string; title: string; state: string }
const TASK_PAGE_SIZE = 5
const tasks: TaskItem[] = [
  { time: '08:30', title: '部门晨会同步', state: '已完成' },
  { time: '09:00', title: '审批日报签发', state: '已完成' },
  { time: '09:30', title: 'Q4 预算评审会', state: '进行中' },
  { time: '11:30', title: '评审材料终稿提交', state: '进行中' },
  { time: '13:30', title: '客户新需求澄清会', state: '已完成' },
  { time: '14:00', title: '供应商合同会签', state: '进行中' },
  { time: '15:00', title: '门店巡检报告复核', state: '待开始' },
  { time: '16:30', title: '11 月部门排期确认', state: '待开始' },
  { time: '17:00', title: '渠道周数据对齐', state: '待开始' },
  { time: '18:00', title: '周复盘与数据周报', state: '待开始' },
  { time: '18:30', title: '明日报重点事项清单', state: '待开始' },
  { time: '19:30', title: '值班交接确认', state: '待开始' }
]
const taskFilter = ref('全部')
const filteredTasks = computed(() =>
  taskFilter.value === '全部' ? tasks : tasks.filter((t) => t.state === taskFilter.value)
)
const taskPage = ref(1)
const pagedTasks = computed(() =>
  filteredTasks.value.slice((taskPage.value - 1) * TASK_PAGE_SIZE, taskPage.value * TASK_PAGE_SIZE)
)
watch(taskFilter, () => { taskPage.value = 1 })

/** 快捷功能九宫格 */
interface AppEntry { label: string; icon: Component }
const apps: AppEntry[] = [
  { label: '请假申请', icon: Calendar },
  { label: '报销申请', icon: Money },
  { label: '会议室预订', icon: Clock },
  { label: '用章申请', icon: EditPen },
  { label: '采购申请', icon: ShoppingCart },
  { label: '差旅申请', icon: Suitcase },
  { label: '考勤打卡', icon: AlarmClock },
  { label: '我的工资条', icon: Wallet },
  { label: '公司公告', icon: Bell }
]
function openApp(label: string) {
  ElMessage.info(`打开「${label}」（演示入口）`)
}
</script>

<style scoped>
.workbench-page {
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* 紧凑化：页面用自身 gap 控制节奏，抵消 Panel 自带外边距并收敛头部/正文留白 */
.workbench-page :deep(.wd-panel) {
  margin-bottom: 0;
}
.workbench-page :deep(.wd-panel__header) {
  padding: 8px 14px;
}
.workbench-page :deep(.wd-panel__body) {
  padding: 10px 14px 12px;
}

/* ===== 页面顶条 ===== */
.wb-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}
.wb-topbar__brand {
  display: flex;
  align-items: center;
  gap: 10px;
}
.wb-topbar__logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 9px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  flex: none;
}
.wb-topbar__title {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  line-height: 1.25;
}
.wb-topbar__sub {
  margin: 1px 0 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.wb-topbar__progress {
  width: 300px;
}
.wb-topbar__progress-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}
.wb-topbar__percent {
  font-size: 12px;
  color: var(--el-text-color-regular);
}
.wb-topbar__percent b {
  font-size: 15px;
  font-weight: 600;
  color: var(--el-color-primary);
  font-variant-numeric: tabular-nums;
}
.wb-topbar__bar {
  margin-top: 4px;
}
.wb-topbar__bar :deep(.el-progress-bar__outer) {
  height: 6px;
}
.wb-topbar__tasks {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
/* 顶栏右侧日期时间 */
.wb-topbar__time {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

/* ===== 欢迎横幅（压扁为单行细条） ===== */
.wb-banner {
  display: flex;
  align-items: center;
  gap: 8px 20px;
  flex-wrap: wrap;
  padding: 8px 16px;
  border-radius: 8px;
  background: linear-gradient(120deg, var(--el-color-primary-light-8) 0%, var(--el-color-primary-light-9) 70%);
}
.wb-banner__text {
  display: flex;
  align-items: baseline;
  gap: 14px;
  flex-wrap: wrap;
  min-width: 0;
}
.wb-banner__headline {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.wb-banner__flow {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.wb-banner__flow .el-icon {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}
.wb-banner__feats {
  display: flex;
  align-items: center;
  gap: 6px 18px;
  flex-wrap: wrap;
  margin: 0 0 0 auto;
  padding: 0;
  list-style: none;
}
.wb-banner__feats li {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: var(--el-text-color-regular);
}
.wb-banner__feats .el-icon {
  color: var(--el-color-primary);
  font-size: 13px;
}

/* ===== 今日核心工作（一行三张卡片） ===== */
/* 核心工作轮播：wrap 承载悬浮箭头，viewport 裁切溢出，track 横向滑动 */
.wb-core-wrap {
  position: relative;
}
.wb-core-viewport {
  overflow: hidden;
}
.wb-core {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  gap: 10px;
  transition: transform 0.45s cubic-bezier(0.4, 0, 0.2, 1);
}
.wb-core__item {
  flex: 0 0 calc((100% - 20px) / 3);
  box-sizing: border-box;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px 12px;
  border: 1px solid var(--el-border-color-extra-light);
  border-radius: 8px;
  background: var(--el-bg-color);
}
/* 左右滑动箭头：半悬浮于卡片两侧，圆形白底 */
.wb-core__nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 1px solid var(--el-border-color-light);
  background: var(--el-bg-color);
  box-shadow: var(--el-box-shadow-light);
  color: var(--el-text-color-regular);
  cursor: pointer;
  transition: color 0.2s ease, border-color 0.2s ease, opacity 0.2s ease;
}
.wb-core__nav:hover:not(:disabled) {
  color: var(--el-color-primary);
  border-color: var(--el-color-primary);
}
.wb-core__nav:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
.wb-core__nav.is-prev { left: -9px; }
.wb-core__nav.is-next { right: -9px; }
.wb-core__head {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.wb-core__no {
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-placeholder);
  font-variant-numeric: tabular-nums;
  flex: none;
}
.wb-core__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  flex: none;
}
.wb-core__title {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.wb-core__foot {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.wb-core__bar {
  width: 96px;
  max-width: 36%;
  flex: none;
}
.wb-core__due {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.wb-core__state {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
  flex: none;
}
.wb-core__state b {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-color-primary);
  font-variant-numeric: tabular-nums;
}

/* ===== 行布局：主列 + 侧列 ===== */
.wb-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 10px;
  align-items: start;
}

/* wb-row--fill：同一行内左右面板拉伸到同高（内容区 flex 撑满，数据卡均匀填充） */
.wb-row--fill {
  align-items: stretch;
}
.wb-row--fill :deep(.wd-panel) {
  display: flex;
  flex-direction: column;
  margin-bottom: 0;
}
.wb-row--fill :deep(.wd-panel__content),
.wb-row--fill :deep(.wd-panel__content-inner),
.wb-row--fill :deep(.wd-panel__body) {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}
.wb-row--fill .wb-stats {
  flex: 1;
  grid-auto-rows: 1fr;
}
.wb-col {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}

/* ===== 今日数据总览 ===== */
.wb-stats {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
}
.wb-stat {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--el-border-color-extra-light);
  border-radius: 8px;
  padding: 8px 10px;
}
/* 近 7 日迷你趋势折线：垫在卡片底部，填充同高拉伸后的剩余空间 */
.wb-stat__spark {
  display: block;
  width: 100%;
  height: 24px;
  margin-top: auto;
}
.wb-stat__label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.wb-stat__value {
  display: block;
  margin-top: 3px;
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
}
.wb-stat__value i {
  font-style: normal;
  font-size: 12px;
  font-weight: 400;
  color: var(--el-text-color-secondary);
  margin-left: 2px;
}
/* 较昨日 + 涨跌标签：数值下方一行，左对齐 */
.wb-stat__sub {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
}
.wb-stat__cmp {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}

/* ===== 异常提醒 ===== */
.wb-alert-list {
  list-style: none;
  margin: 8px 0 0;
  padding: 0;
}
.wb-alert {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 0;
  border-bottom: 1px solid var(--el-border-color-extra-light);
}
.wb-alert:last-child {
  border-bottom: none;
}
.wb-alert__body {
  flex: 1;
  min-width: 0;
}
.wb-alert__title {
  font-size: 13px;
  color: var(--el-text-color-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.wb-alert__meta {
  margin-top: 2px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

/* ===== 折线图 ===== */
.wb-chart__svg {
  display: block;
  width: 100%;
  height: auto;
}
.wb-chart__tick {
  font-size: 10px;
  fill: var(--el-text-color-secondary);
}
.wb-legend {
  display: flex;
  gap: 16px;
}
.wb-legend__item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.wb-legend__item i {
  width: 10px;
  height: 10px;
  border-radius: 2px;
}
.wb-legend__item .is-primary { background: var(--el-color-primary); }
.wb-legend__item .is-muted {
  background: var(--el-text-color-secondary);
  opacity: 0.7;
}

/* ===== 本月目标达成：flex:1 填充图表下方剩余高度，百分比为主视觉 ===== */
.wb-goals-panel { flex: 1; }
.wb-goals {
  list-style: none;
  margin: 0;
  padding: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  gap: 10px;
}
.wb-goal__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.wb-goal__label {
  font-size: 13px;
  color: var(--el-text-color-regular);
}
.wb-goal__percent {
  font-size: 20px;
  font-weight: 700;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  color: var(--el-color-primary);
}
.wb-goal__percent i {
  font-style: normal;
  font-size: 12px;
  font-weight: 600;
  margin-left: 1px;
  color: var(--el-color-primary-light-3);
}
.wb-goal__meta {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-top: 2px;
}
.wb-goal__num {
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}
.wb-goal__num i {
  font-style: normal;
  font-size: 12px;
  font-weight: 400;
  color: var(--el-text-color-secondary);
  margin-left: 4px;
}
.wb-goal__gap {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.wb-goal__bar {
  height: 8px;
  margin-top: 6px;
  border-radius: 4px;
  background: var(--el-color-primary-light-9);
  overflow: hidden;
}
.wb-goal__bar-fill {
  display: block;
  width: var(--w);
  height: 100%;
  border-radius: 4px;
  background: linear-gradient(90deg, var(--el-color-primary-light-3), var(--el-color-primary));
  animation: wb-goal-fill 0.8s ease both;
}
@keyframes wb-goal-fill {
  from { width: 0; }
}

/* ===== 待办审批 ===== */
.wb-approve-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
}
.wb-approve {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 0;
  border-bottom: 1px solid var(--el-border-color-extra-light);
}
.wb-approve:last-child { border-bottom: none; }
.wb-approve__body {
  flex: 1;
  min-width: 0;
}
.wb-approve__row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.wb-approve__title {
  font-size: 13px;
  color: var(--el-text-color-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.wb-approve__meta {
  margin-top: 3px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.wb-approve__actions {
  display: flex;
  flex: none;
}
.wb-approve__actions .el-button + .el-button {
  margin-left: 8px;
}
.wb-list-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.wb-list-leave-to {
  opacity: 0;
  transform: translateX(12px);
}

/* ===== 我的流程 ===== */
.wb-flow-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.wb-flow {
  padding: 6px 0;
  border-bottom: 1px solid var(--el-border-color-extra-light);
}
.wb-flow:last-child { border-bottom: none; }
.wb-flow__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.wb-flow__title {
  font-size: 13px;
  color: var(--el-text-color-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.wb-flow__meta {
  margin: 2px 0 5px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.wb-flow__bar :deep(.el-progress-bar__outer) {
  background-color: var(--el-fill-color-light);
}

/* ===== 今日任务时间线：面板与右侧同高拉伸，条目自顶部依次排列，分页垫底 ===== */
.wb-timeline {
  list-style: none;
  margin: 0;
  padding: 0;
  flex: 1;
}
.wb-task-pager {
  margin-top: 12px;
  justify-content: flex-end;
}
.wb-timeline__item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 0;
  border-bottom: 1px solid var(--el-border-color-extra-light);
}
.wb-timeline__item:last-child { border-bottom: none; }
.wb-timeline__time {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  font-variant-numeric: tabular-nums;
  width: 44px;
  flex: none;
}
.wb-timeline__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex: none;
  background: var(--el-color-info);
}
.wb-timeline__dot.is-warning { background: var(--el-color-warning); }
.wb-timeline__dot.is-success { background: var(--el-color-success); }
.wb-timeline__dot.is-danger { background: var(--el-color-danger); }
.wb-timeline__title {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  color: var(--el-text-color-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ===== 快捷功能九宫格（侧栏窄列：图标上、文字下） ===== */
.wb-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.wb-grid__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 9px 6px;
  border: 1px solid var(--el-border-color-extra-light);
  border-radius: 8px;
  background: var(--el-bg-color);
  cursor: pointer;
  transition: border-color 0.2s ease, background-color 0.2s ease;
}
.wb-grid__item:hover {
  border-color: var(--el-color-primary-light-5);
  background: var(--el-color-primary-light-9);
}
.wb-grid__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  flex: none;
  transition: background-color 0.2s ease;
}
.wb-grid__item:hover .wb-grid__icon {
  background: var(--el-color-primary-light-8);
}
.wb-grid__label {
  font-size: 12px;
  color: var(--el-text-color-primary);
}

/* 响应式：窄屏降级为单列 */
@media (max-width: 1100px) {
  .wb-row { grid-template-columns: 1fr; }
  .wb-stats { grid-template-columns: repeat(3, 1fr); }
  .wb-core { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .wb-stats { grid-template-columns: repeat(2, 1fr); }
  .wb-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
