<template>
  <div class="stats-page">
    <!-- 顶条：标题 + 时间范围切换 + 更新时间 -->
    <header class="st-top">
      <div class="st-top__head">
        <h1 class="st-top__title">统计中心</h1>
        <p class="st-top__sub">核心指标 · 渠道结构 · 转化漏斗 · 时段分布 · 多维排行 一屏掌握</p>
      </div>
      <div class="st-top__right">
        <ScenarioPromptButton scene="stats" title="统计中心" />
        <div class="st-range" role="group" aria-label="时间范围切换">
          <button
            v-for="r in RANGES" :key="r.key" type="button" class="st-range__btn"
            :class="{ 'is-active': range === r.key }" @click="onRange(r.key)">
            {{ r.label }}
          </button>
        </div>
        <span class="st-top__updated">更新于 {{ updatedText }}</span>
      </div>
    </header>

    <!-- KPI 行：彩底指标卡，点击卡片联动主趋势图 -->
    <section class="st-kpis">
      <button
        v-for="m in METRICS" :key="m.key" type="button" class="st-kpi"
        :class="{ 'is-active': activeKey === m.key }" :style="{ background: m.tint }"
        @click="activeKey = m.key">
        <span class="st-kpi__label">{{ m.label }}</span>
        <span class="st-kpi__value">{{ m.display }}<i>{{ m.unit }}</i></span>
        <span class="st-kpi__delta" :class="deltaGood(m) ? 'is-good' : 'is-bad'">
          较上期 <b>{{ m.delta }}</b>
        </span>
      </button>
    </section>

    <!-- 主区双列：左 3 = 主趋势图 + 数据速览，右 2 = 渠道占比 -->
    <section class="st-row">
      <div class="st-row__main">
        <wd-panel :title="`${activeMetric.label}趋势`" :description="rangeLabel" icon="TrendCharts">
          <template #extra>
            <div class="st-chart__legend">
              <span class="st-chart__legend-item"><i class="is-cur" />本期</span>
              <span class="st-chart__legend-item"><i class="is-prev" />上期</span>
              <span class="st-chart__hint">点击数据点查看明细</span>
            </div>
          </template>
          <div class="st-chart">
            <svg
              class="st-chart__svg" :viewBox="`0 0 640 ${CHART.h}`" role="img"
              :aria-label="`${activeMetric.label}趋势图`" @mousemove="onChartMove" @mouseleave="hoverIndex = -1"
              @click="onChartClick">
              <polyline
                :points="linePoints(prevPoints)" fill="none" stroke="#c09048"
                stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
              <polyline
                :points="linePoints(points)" fill="none" stroke="var(--el-color-primary)"
                stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
              <line
                v-if="hoverIndex >= 0" :x1="chartX(hoverIndex)" :y1="CHART.padT" :x2="chartX(hoverIndex)"
                :y2="CHART.h - CHART.padB" stroke="var(--el-color-primary)" stroke-opacity="0.35" stroke-dasharray="4 3" />
              <circle
                v-for="(p, i) in chartDots(points)" :key="i" class="st-chart__dot"
                :class="{ 'is-hover': i === hoverIndex, 'is-drill': i === drillIndex }"
                :cx="p.x" :cy="p.y" r="3.4" fill="var(--el-color-primary)" stroke="#fff" stroke-width="1.4" />
              <text
                v-for="(label, i) in labels" :key="label" :x="chartX(i)" :y="CHART.h - 8"
                text-anchor="middle" class="st-chart__tick">{{ label }}</text>
            </svg>
            <div v-if="hoverIndex >= 0" class="st-chart__tip" :style="tipStyle">
              <b>{{ labels[hoverIndex] }}</b>
              <span>本期{{ activeMetric.label }}：{{ fmtPoint(points[hoverIndex]) }}{{ activeMetric.unit }}</span>
              <span class="is-prev">上期{{ activeMetric.label }}：{{ fmtPoint(prevPoints[hoverIndex]) }}{{ activeMetric.unit }}</span>
            </div>
          </div>
        </wd-panel>

        <wd-panel title="数据速览" icon="Histogram" description="各板块贡献 Top 5">
          <ul class="st-quick">
            <li v-for="(q, i) in QUICK_LIST" :key="q.name" class="st-quick__item">
              <span class="st-quick__rank" :class="`is-${i + 1}`">{{ i + 1 }}</span>
              <span class="st-quick__name">{{ q.name }}</span>
              <span class="st-quick__bar"><i :style="{ width: (q.share / QUICK_LIST[0].share) * 100 + '%' }" /></span>
              <span class="st-quick__val">{{ q.share }}%</span>
            </li>
          </ul>
        </wd-panel>
      </div>

      <wd-panel class="st-row__side" title="渠道占比" icon="PieChart" :description="rangeLabel">
        <div class="st-donut">
          <svg class="st-donut__svg" viewBox="0 0 140 140" role="img" aria-label="渠道占比环形图">
            <g transform="rotate(-90 70 70)">
              <circle
                v-for="(seg, i) in donutSegs" :key="seg.name" class="st-donut__seg"
                :class="{ 'is-dim': activeChannel >= 0 && activeChannel !== i }"
                cx="70" cy="70" r="54" fill="none" :stroke="seg.color" stroke-width="16"
                :stroke-dasharray="seg.dash" :stroke-dashoffset="seg.offset"
                @mouseenter="activeChannel = i" @mouseleave="activeChannel = -1" />
            </g>
            <text x="70" y="66" text-anchor="middle" class="st-donut__total">{{ donutTotalText }}</text>
            <text x="70" y="84" text-anchor="middle" class="st-donut__cap">总量</text>
          </svg>
          <ul class="st-legend">
            <li
              v-for="(c, i) in channelList" :key="c.name" class="st-legend__item"
              :class="{ 'is-dim': activeChannel >= 0 && activeChannel !== i }"
              @mouseenter="activeChannel = i" @mouseleave="activeChannel = -1">
              <i class="st-legend__dot" :style="{ background: c.color }" />
              <span class="st-legend__name">{{ c.name }}</span>
              <span class="st-legend__val">{{ donutPercent(c) }}%</span>
            </li>
          </ul>
        </div>
      </wd-panel>
    </section>

    <!-- 第二行双列：转化漏斗 + 24 小时访问分布 -->
    <section class="st-row2">
      <wd-panel class="st-row2__funnel" title="转化漏斗" icon="Filter" :description="`整体转化 ${funnelOverall}%`">
        <div class="st-funnel">
          <svg class="st-funnel__svg" viewBox="0 0 400 232" role="img" aria-label="转化漏斗图">
            <g v-for="(s, i) in funnelStages" :key="s.name">
              <polygon class="st-funnel__stage" :points="funnelPoly(i)" :fill="s.color" />
              <text :x="396" :y="i * 60 + 18" text-anchor="end" class="st-funnel__name">{{ s.name }}</text>
              <text :x="396" :y="i * 60 + 37" text-anchor="end" class="st-funnel__val">{{ s.value.toLocaleString() }}</text>
            </g>
            <text
              v-for="(r, i) in funnelRates" :key="`r${i}`" :x="150" :y="i * 60 + 57"
              text-anchor="middle" class="st-funnel__rate">↓ {{ r }}%</text>
          </svg>
        </div>
      </wd-panel>

      <wd-panel
        class="st-row2__hour" title="24 小时访问分布" icon="DataLine"
        :description="`峰值 ${hourPeak}:00 · 占全天 ${hourPeakShare}%`">
        <div class="st-hour">
          <svg
            class="st-hour__svg" viewBox="0 0 560 210" role="img" aria-label="24小时访问分布柱状图"
            @mouseleave="hourHover = -1">
            <rect
              v-for="(_, i) in hourData" :key="i" class="st-hour__bar"
              :class="{ 'is-peak': i === hourPeak, 'is-hover': i === hourHover }"
              :x="hourBar(i).x" :y="hourBar(i).y" :width="hourBar(i).w" :height="hourBar(i).h" rx="3"
              @mouseenter="hourHover = i" />
            <line :x1="12" :x2="548" :y1="hourAvgY" :y2="hourAvgY" class="st-hour__avg-line" />
            <text :x="548" :y="hourAvgY - 5" text-anchor="end" class="st-hour__avg">均值 {{ fmtHour(hourAvg) }}</text>
            <text
              v-for="t in hourTicks" :key="t.hour" :x="t.x" :y="202"
              text-anchor="middle" class="st-hour__tick">{{ t.label }}</text>
          </svg>
          <div v-if="hourHover >= 0" class="st-hour__tip" :style="hourTipStyle">
            <b>{{ hourHover }}:00 – {{ hourHover + 1 }}:00</b>
            <span>{{ hourData[hourHover].toLocaleString() }} 人次</span>
          </div>
        </div>
      </wd-panel>
    </section>

    <!-- 第三行双列：访问排行 TOP5（维度 tab 切换） + 地域分布 -->
    <section class="st-row3">
      <wd-panel class="st-row3__rank" title="访问排行 TOP 5" icon="Trophy" description="较上期变化">
        <template #extra>
          <div class="st-top5__tabs" role="group" aria-label="排行维度切换">
            <button
              v-for="t in TOP_TABS" :key="t.key" type="button" class="st-top5__tab"
              :class="{ 'is-active': topTab === t.key }" @click="topTab = t.key">
              {{ t.label }}
            </button>
          </div>
        </template>
        <ul class="st-top5">
          <li v-for="(r, i) in topList" :key="r.name" class="st-top5__item">
            <span class="st-top5__rank" :class="`is-${i + 1}`">{{ i + 1 }}</span>
            <span class="st-top5__name">{{ r.name }}</span>
            <span class="st-top5__bar"><i :style="{ width: (r.value / topList[0].value) * 100 + '%' }" /></span>
            <span class="st-top5__val">{{ r.value.toLocaleString() }}</span>
            <span class="st-top5__delta" :class="r.delta.startsWith('-') ? 'is-bad' : 'is-good'">{{ r.delta }}</span>
          </li>
        </ul>
      </wd-panel>

      <wd-panel
        class="st-row3__region" title="地域分布" icon="Location"
        :description="`TOP ${regionList.length} 省市 · 覆盖 28 个`">
        <ul class="st-region">
          <li v-for="r in regionList" :key="r.name" class="st-region__item">
            <span class="st-region__name">{{ r.name }}</span>
            <span class="st-region__bar"><i :style="{ width: (r.value / regionList[0].value) * 100 + '%' }" /></span>
            <span class="st-region__val">{{ r.value.toLocaleString() }}</span>
            <span class="st-region__pct">{{ regionPct(r) }}%</span>
          </li>
        </ul>
      </wd-panel>
    </section>

    <!-- 下钻明细：点击趋势图数据点，右侧抽屉展开 -->
    <wd-drawer v-model="detailVisible" :title="drillTitle" size="420px">
      <div v-if="drillIndex >= 0" class="st-drawer">
        <div class="st-drawer__meta">
          <span>{{ rangeLabel }} · {{ labels[drillIndex] }}</span>
          <span>共 {{ detailRows.length }} 条</span>
        </div>
        <ul class="st-detail">
          <li v-for="row in detailRows" :key="row.event + row.time" class="st-detail__row">
            <span class="st-detail__time">{{ row.time }}</span>
            <span class="st-detail__event">{{ row.event }}</span>
            <wd-tag size="small" effect="plain">{{ row.channel }}</wd-tag>
            <b class="st-detail__val">{{ row.value }}</b>
          </li>
        </ul>
      </div>
      <template #footer="{ close }">
        <el-button @click="close">关闭</el-button>
      </template>
    </wd-drawer>
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import ScenarioPromptButton from '../components/ScenarioPromptButton.vue'

defineOptions({ name: 'ScenarioStatsView' })

const CHART = { h: 160, padL: 48, padR: 16, padT: 16, padB: 28 }

type RangeKey = '7d' | '30d' | '12m'

const RANGES: { key: RangeKey; label: string; labels: string[] }[] = [
  { key: '7d', label: '近 7 天', labels: ['10-31', '11-01', '11-02', '11-03', '11-04', '11-05', '11-06'] },
  { key: '30d', label: '近 30 天', labels: ['10-08', '10-11', '10-14', '10-17', '10-20', '10-23', '10-26', '10-29', '11-01', '11-04'] },
  { key: '12m', label: '近 12 个月', labels: ['12月', '1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月'] }
]

interface Metric {
  key: string
  label: string
  unit: string
  display: string
  delta: string
  tint: string // KPI 彩卡底色
  inverse?: boolean // 逆指标：下降为好（如退款率）
  data: Record<RangeKey, number[]>
  prev: Record<RangeKey, number[]> // 上期对比线
}

const METRICS: Metric[] = [
  {
    key: 'visits', label: '访问量', unit: ' 人次', display: '7,543', delta: '+12.4%', tint: '#e9f0fe',
    data: {
      '7d': [820, 932, 901, 1050, 1290, 1130, 1420],
      '30d': [780, 860, 910, 880, 1020, 1140, 1090, 1230, 1310, 1400],
      '12m': [6.2, 5.8, 6.9, 7.4, 8.1, 7.6, 8.8, 9.4, 10.2, 11.0, 11.8, 12.6]
    },
    prev: {
      '7d': [760, 812, 858, 901, 980, 1042, 1088],
      '30d': [720, 750, 780, 762, 810, 848, 830, 880, 930, 970],
      '12m': [5.4, 5.6, 6.0, 6.2, 6.6, 6.9, 7.2, 7.8, 8.4, 9.0, 9.6, 10.4]
    }
  },
  {
    key: 'conv', label: '转化率', unit: ' %', display: '3.76', delta: '+0.8pt', tint: '#e3f9ef',
    data: {
      '7d': [3.2, 3.5, 3.1, 3.8, 4.2, 3.9, 4.6],
      '30d': [2.9, 3.1, 3.0, 3.3, 3.6, 3.4, 3.8, 4.0, 4.3, 4.5],
      '12m': [2.4, 2.6, 2.8, 2.7, 3.1, 3.3, 3.2, 3.6, 3.9, 4.1, 4.4, 4.6]
    },
    prev: {
      '7d': [2.8, 3.0, 2.9, 3.2, 3.5, 3.3, 3.7],
      '30d': [2.5, 2.6, 2.7, 2.8, 3.0, 2.9, 3.1, 3.3, 3.5, 3.7],
      '12m': [2.0, 2.1, 2.3, 2.2, 2.5, 2.7, 2.6, 2.9, 3.1, 3.3, 3.6, 3.8]
    }
  },
  {
    key: 'aov', label: '客单价', unit: ' 元', display: '¥201', delta: '+5.2%', tint: '#fdebea',
    data: {
      '7d': [186, 192, 178, 205, 214, 208, 226],
      '30d': [175, 180, 184, 179, 190, 196, 192, 201, 208, 215],
      '12m': [158, 162, 166, 171, 168, 175, 181, 186, 192, 197, 204, 211]
    },
    prev: {
      '7d': [178, 182, 175, 188, 196, 201, 210],
      '30d': [168, 172, 176, 170, 182, 186, 183, 190, 196, 203],
      '12m': [150, 153, 158, 162, 164, 168, 173, 178, 184, 189, 194, 201]
    }
  },
  {
    key: 'orders', label: '订单量', unit: ' 单', display: '1,036', delta: '+9.6%', tint: '#e9f0fe',
    data: {
      '7d': [118, 132, 126, 148, 165, 158, 189],
      '30d': [96, 104, 110, 102, 118, 126, 121, 134, 146, 158],
      '12m': [620, 660, 700, 690, 760, 810, 800, 880, 940, 990, 1030, 1090]
    },
    prev: {
      '7d': [102, 118, 121, 130, 142, 151, 158],
      '30d': [88, 92, 98, 96, 105, 112, 118, 120, 130, 141],
      '12m': [580, 600, 640, 660, 700, 740, 760, 810, 860, 900, 950, 1000]
    }
  },
  {
    key: 'users', label: '新增用户', unit: ' 人', display: '2,148', delta: '+15.2%', tint: '#fef4de',
    data: {
      '7d': [210, 245, 232, 276, 310, 298, 352],
      '30d': [190, 210, 224, 205, 238, 252, 246, 270, 292, 315],
      '12m': [980, 1050, 1120, 1100, 1240, 1310, 1290, 1420, 1530, 1620, 1720, 1850]
    },
    prev: {
      '7d': [180, 198, 205, 224, 240, 252, 268],
      '30d': [168, 175, 190, 186, 200, 214, 224, 236, 250, 262],
      '12m': [900, 940, 1000, 1030, 1100, 1180, 1220, 1300, 1380, 1460, 1540, 1620]
    }
  },
  {
    key: 'refund', label: '退款率', unit: ' %', display: '2.43', delta: '-0.6pt', tint: '#e3f9ef', inverse: true,
    data: {
      '7d': [2.8, 2.6, 3.0, 2.4, 2.1, 2.3, 1.8],
      '30d': [3.1, 2.9, 2.8, 3.0, 2.6, 2.4, 2.5, 2.2, 2.0, 1.8],
      '12m': [3.8, 3.6, 3.4, 3.5, 3.1, 2.9, 3.0, 2.7, 2.5, 2.3, 2.1, 1.9]
    },
    prev: {
      '7d': [3.2, 3.1, 3.4, 3.0, 2.8, 2.9, 2.4],
      '30d': [3.5, 3.3, 3.2, 3.4, 3.0, 2.9, 3.0, 2.7, 2.5, 2.3],
      '12m': [4.2, 4.0, 3.9, 3.9, 3.6, 3.4, 3.4, 3.2, 3.0, 2.8, 2.6, 2.4]
    }
  }
]

const CHANNEL_COLORS = ['#1a6dda', '#8d5df6', '#f6a525', '#12a35a', '#e74442', '#0ea5b7']

const CHANNELS: Record<RangeKey, { name: string; value: number }[]> = {
  '7d': [
    { name: '直接访问', value: 3470 },
    { name: '线上投放', value: 2414 },
    { name: '自然流量', value: 1659 },
    { name: '社交媒体', value: 986 },
    { name: '外部链接', value: 642 },
    { name: '邮件导流', value: 372 }
  ],
  '30d': [
    { name: '直接访问', value: 31200 },
    { name: '线上投放', value: 26000 },
    { name: '自然流量', value: 17100 },
    { name: '社交媒体', value: 12400 },
    { name: '外部链接', value: 8300 },
    { name: '邮件导流', value: 4600 }
  ],
  '12m': [
    { name: '直接访问', value: 98400 },
    { name: '线上投放', value: 100980 },
    { name: '自然流量', value: 59620 },
    { name: '社交媒体', value: 48200 },
    { name: '外部链接', value: 31600 },
    { name: '邮件导流', value: 18400 }
  ]
}

const QUICK_LIST = [
  { name: '会员卡续费', share: 32 },
  { name: '新客礼包', share: 27 },
  { name: '企业定制', share: 18 },
  { name: '门店核销', share: 14 },
  { name: '内容专栏', share: 9 }
]

const DETAIL_ROWS = [
  { time: '09:12', event: '企业定制询单（华东）', channel: '线上投放', value: '+182 人次' },
  { time: '10:05', event: '会员卡续费订单 ×26', channel: '直接访问', value: '¥5,220' },
  { time: '11:40', event: '新客礼包领取', channel: '自然流量', value: '+96 人次' },
  { time: '14:22', event: '门店核销券使用', channel: '直接访问', value: '+54 单' },
  { time: '15:48', event: '内容专栏订阅', channel: '自然流量', value: '+37 人' },
  { time: '16:30', event: '投放落地页访问峰值', channel: '线上投放', value: '+213 人次' },
  { time: '17:15', event: '老客召回短信点击', channel: '直接访问', value: '+88 人次' },
  { time: '18:02', event: '企业定制询单（华南）', channel: '线上投放', value: '+64 人次' }
]

/* ---- 转化漏斗 ---- */
const FUNNEL_STAGES = ['访问', '加购/询单', '下单', '支付完成']
const FUNNEL_COLORS = ['#1a6dda', '#8d5df6', '#f6a525', '#12a35a']
const FUNNEL: Record<RangeKey, number[]> = {
  '7d': [7543, 2210, 1036, 918],
  '30d': [29860, 8420, 4180, 3720],
  '12m': [326400, 96800, 51200, 46300]
}

/* ---- 24 小时访问分布 ---- */
const HOURLY: Record<RangeKey, number[]> = {
  '7d': [180, 120, 80, 60, 55, 70, 160, 320, 480, 610, 690, 640, 520, 470, 500, 560, 620, 700, 760, 820, 740, 560, 380, 260],
  '30d': [2400, 1600, 1050, 800, 720, 900, 2100, 4200, 6300, 8000, 9100, 8400, 6900, 6200, 6600, 7400, 8100, 9200, 10000, 10800, 9700, 7300, 5000, 3400],
  '12m': [26000, 17500, 11500, 8800, 8000, 10000, 23000, 46000, 69000, 88000, 100000, 92000, 76000, 68000, 72000, 81000, 89000, 101000, 110000, 119000, 106000, 80000, 55000, 37000]
}

/* ---- 访问排行 TOP5 ---- */
type TopKey = 'page' | 'channel' | 'item'
const TOP_TABS: { key: TopKey; label: string }[] = [
  { key: 'page', label: '页面' },
  { key: 'channel', label: '渠道' },
  { key: 'item', label: '商品' }
]
const TOP_RANKS: Record<TopKey, { name: string; delta: string; v: Record<RangeKey, number> }[]> = {
  page: [
    { name: '工作台首页', delta: '+12.4%', v: { '7d': 1860, '30d': 8240, '12m': 96800 } },
    { name: '会员中心', delta: '+9.6%', v: { '7d': 1420, '30d': 6510, '12m': 74200 } },
    { name: '产品方案', delta: '+15.2%', v: { '7d': 1180, '30d': 5230, '12m': 61500 } },
    { name: '帮助中心', delta: '+4.1%', v: { '7d': 860, '30d': 3940, '12m': 43800 } },
    { name: '订单列表', delta: '-2.3%', v: { '7d': 742, '30d': 3180, '12m': 36200 } }
  ],
  channel: [
    { name: '直接访问', delta: '+8.2%', v: { '7d': 2540, '30d': 10860, '12m': 121400 } },
    { name: '线上投放', delta: '+21.5%', v: { '7d': 1760, '30d': 7940, '12m': 98600 } },
    { name: '自然流量', delta: '+5.4%', v: { '7d': 1240, '30d': 5720, '12m': 74300 } },
    { name: '社群转发', delta: '+12.8%', v: { '7d': 686, '30d': 3260, '12m': 41900 } },
    { name: '邮件召回', delta: '-6.1%', v: { '7d': 412, '30d': 2040, '12m': 28700 } }
  ],
  item: [
    { name: '会员卡·年卡', delta: '+18.2%', v: { '7d': 486, '30d': 2340, '12m': 28600 } },
    { name: '新客礼包', delta: '+9.4%', v: { '7d': 412, '30d': 2060, '12m': 24800 } },
    { name: '企业定制服务', delta: '+26.7%', v: { '7d': 356, '30d': 1720, '12m': 21300 } },
    { name: '门店核销券', delta: '+3.2%', v: { '7d': 298, '30d': 1480, '12m': 18400 } },
    { name: '内容专栏订阅', delta: '-1.8%', v: { '7d': 214, '30d': 1120, '12m': 14900 } }
  ]
}

/* ---- 地域分布 ---- */
const REGIONS: Record<RangeKey, { name: string; value: number }[]> = {
  '7d': [
    { name: '广东', value: 1680 },
    { name: '江苏', value: 1240 },
    { name: '浙江', value: 1020 },
    { name: '上海', value: 986 },
    { name: '北京', value: 872 },
    { name: '四川', value: 614 }
  ],
  '30d': [
    { name: '广东', value: 7240 },
    { name: '江苏', value: 5310 },
    { name: '浙江', value: 4480 },
    { name: '上海', value: 4110 },
    { name: '北京', value: 3760 },
    { name: '四川', value: 2680 }
  ],
  '12m': [
    { name: '广东', value: 82600 },
    { name: '江苏', value: 61400 },
    { name: '浙江', value: 52300 },
    { name: '上海', value: 47900 },
    { name: '北京', value: 44100 },
    { name: '四川', value: 31200 }
  ]
}

const updatedText = '今日 09:00'
const range = ref<RangeKey>('7d')
const activeKey = ref('visits')
const hoverIndex = ref(-1)
const drillIndex = ref(-1)
const activeChannel = ref(-1)
const hourHover = ref(-1)
const topTab = ref<TopKey>('page')

const rangeLabel = computed(() => RANGES.find((r) => r.key === range.value)!.label)
const labels = computed(() => RANGES.find((r) => r.key === range.value)!.labels)
const activeMetric = computed(() => METRICS.find((m) => m.key === activeKey.value)!)
const points = computed(() => activeMetric.value.data[range.value])
const prevPoints = computed(() => activeMetric.value.prev[range.value])
const chartMax = computed(() => Math.max(...points.value, ...prevPoints.value) * 1.15)
const step = computed(() => (640 - CHART.padL - CHART.padR) / Math.max(points.value.length - 1, 1))

const drillTitle = computed(() =>
  drillIndex.value >= 0 ? `${activeMetric.value.label} · ${labels.value[drillIndex.value]} 明细` : '下钻明细'
)
/** 抽屉显隐跟随选中数据点：关闭抽屉即清空下钻 */
const detailVisible = computed({
  get: () => drillIndex.value >= 0,
  set: (v: boolean) => {
    if (!v) drillIndex.value = -1
  }
})

const detailRows = computed(() => DETAIL_ROWS.slice(0, 5))

/* ---- 图表几何 ---- */
const chartX = (i: number) => CHART.padL + i * step.value
const chartY = (v: number) => CHART.padT + (1 - v / chartMax.value) * (CHART.h - CHART.padT - CHART.padB)

const linePoints = (data: number[]) => data.map((v, i) => `${chartX(i)},${chartY(v)}`).join(' ')
const chartDots = (data: number[]) => data.map((v, i) => ({ x: chartX(i), y: chartY(v) }))

const fmtPoint = (v: number) => (v >= 100 ? Math.round(v).toLocaleString() : `${Math.round(v * 100) / 100}`)

/* ---- hover tooltip / 点击下钻 ---- */
/** 按指针坐标换算最近的数据点下标（move 与 click 共用，避免依赖 hover 残留状态） */
const pointIndexAt = (e: MouseEvent) => {
  const rect = (e.currentTarget as SVGElement).getBoundingClientRect()
  const x = ((e.clientX - rect.left) / rect.width) * 640
  const idx = Math.round((x - CHART.padL) / step.value)
  return Math.min(Math.max(idx, 0), points.value.length - 1)
}
const onChartMove = (e: MouseEvent) => {
  hoverIndex.value = pointIndexAt(e)
}
const onChartClick = (e: MouseEvent) => {
  drillIndex.value = pointIndexAt(e)
  hoverIndex.value = drillIndex.value
}
const tipStyle = computed(() => ({
  left: `${(chartX(hoverIndex.value) / 640) * 100}%`
}))

/* ---- KPI 卡 ---- */
const deltaGood = (m: Metric) => {
  const down = m.delta.startsWith('-')
  return m.inverse ? down : !down
}

/* ---- 渠道环形图 ---- */
const RING = 2 * Math.PI * 54
const channelList = computed(() =>
  CHANNELS[range.value].map((c, i) => ({ ...c, color: CHANNEL_COLORS[i % CHANNEL_COLORS.length] }))
)
const donutTotal = computed(() => channelList.value.reduce((s, c) => s + c.value, 0))
const donutTotalText = computed(() => (donutTotal.value >= 10000 ? `${(donutTotal.value / 10000).toFixed(1)}w` : donutTotal.value.toLocaleString()))
const donutPercent = (c: { value: number }) => Math.round((c.value / donutTotal.value) * 100)
const donutSegs = computed(() => {
  let acc = 0
  return channelList.value.map((c) => {
    const pct = (c.value / donutTotal.value) * 100
    const seg = {
      name: c.name,
      color: c.color,
      dash: `${(RING * pct) / 100 - 2} ${RING - (RING * pct) / 100 + 2}`,
      offset: -(RING * acc) / 100
    }
    acc += pct
    return seg
  })
})

/* ---- 转化漏斗几何 ---- */
const FUNNEL_GEO = { cx: 150, layerH: 46, gap: 14, maxW: 280 }
const funnelStages = computed(() => {
  const vals = FUNNEL[range.value]
  return vals.map((v, i) => ({
    name: FUNNEL_STAGES[i],
    value: v,
    color: FUNNEL_COLORS[i],
    w: Math.max((v / vals[0]) * FUNNEL_GEO.maxW, FUNNEL_GEO.maxW * 0.12)
  }))
})
const funnelPoly = (i: number) => {
  const s = funnelStages.value
  const wT = s[i].w
  const wB = i < s.length - 1 ? s[i + 1].w : s[i].w * 0.85
  const y = i * (FUNNEL_GEO.layerH + FUNNEL_GEO.gap)
  return `${FUNNEL_GEO.cx - wT / 2},${y} ${FUNNEL_GEO.cx + wT / 2},${y} ${FUNNEL_GEO.cx + wB / 2},${y + FUNNEL_GEO.layerH} ${FUNNEL_GEO.cx - wB / 2},${y + FUNNEL_GEO.layerH}`
}
const funnelRates = computed(() => {
  const vals = FUNNEL[range.value]
  return vals.slice(1).map((v, i) => `${Math.round((v / vals[i]) * 1000) / 10}`)
})
const funnelOverall = computed(() => {
  const vals = FUNNEL[range.value]
  return `${Math.round((vals[vals.length - 1] / vals[0]) * 1000) / 10}`
})

/* ---- 24 小时分布几何 ---- */
const HOUR = { w: 560, h: 210, padL: 12, padR: 12, padT: 16, padB: 24 }
const hourData = computed(() => HOURLY[range.value])
const hourMax = computed(() => Math.max(...hourData.value))
const hourAvg = computed(() => hourData.value.reduce((s, v) => s + v, 0) / hourData.value.length)
const hourPeak = computed(() => hourData.value.reduce((mi, v, i, arr) => (v > arr[mi] ? i : mi), 0))
const hourPeakShare = computed(() => {
  const total = hourData.value.reduce((s, v) => s + v, 0)
  return `${Math.round((hourData.value[hourPeak.value] / total) * 1000) / 10}`
})
const hourBar = (i: number) => {
  const slot = (HOUR.w - HOUR.padL - HOUR.padR) / hourData.value.length
  const h = (hourData.value[i] / hourMax.value) * (HOUR.h - HOUR.padT - HOUR.padB)
  return { x: HOUR.padL + i * slot + 4, y: HOUR.h - HOUR.padB - h, w: slot - 8, h }
}
const hourTicks = computed(() =>
  Array.from({ length: 12 }, (_, k) => {
    const b = hourBar(k * 2)
    return { hour: k * 2, x: b.x + b.w / 2, label: String(k * 2).padStart(2, '0') }
  })
)
const hourAvgY = computed(
  () => HOUR.h - HOUR.padB - (hourAvg.value / hourMax.value) * (HOUR.h - HOUR.padT - HOUR.padB)
)
const fmtHour = (v: number) =>
  v >= 100000 ? `${Math.round((v / 10000) * 10) / 10}w` : Math.round(v).toLocaleString()
const hourTipStyle = computed(() => {
  const b = hourBar(hourHover.value)
  return { left: `${((b.x + b.w / 2) / HOUR.w) * 100}%` }
})

/* ---- 访问排行 TOP5 ---- */
const topList = computed(() =>
  TOP_RANKS[topTab.value].map((r) => ({ name: r.name, delta: r.delta, value: r.v[range.value] }))
)

/* ---- 地域分布 ---- */
const regionList = computed(() => REGIONS[range.value])
const regionPct = (r: { value: number }) =>
  Math.round((r.value / regionList.value.reduce((s, x) => s + x.value, 0)) * 100)

/* ---- 交互 ---- */
const onRange = (key: RangeKey) => {
  range.value = key
  hoverIndex.value = -1
  drillIndex.value = -1
}
</script>
<style scoped>
/* box-sizing 收敛：docs 站无全局 reset，页内统一 */
.stats-page,
.stats-page * {
  box-sizing: border-box;
}

.stats-page {
  --wd-panel-radius: 12px;
  --wd-panel-border-color: #e6e8ec;
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-height: 100%;
  padding: 20px 26px 36px;
  background: #f4f5fc;
}

.stats-page :deep(.wd-panel) {
  margin-bottom: 0;
}

.stats-page > * {
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
}

/* ---- 顶条 ---- */
.st-top {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.st-top__title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.st-top__sub {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.st-top__right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.st-range {
  display: inline-flex;
  padding: 3px;
  background: var(--el-fill-color-light);
  border-radius: 8px;
}

.st-range__btn {
  padding: 5px 14px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  font-size: 12px;
  color: var(--el-text-color-regular);
  cursor: pointer;
  transition: all 0.2s;
}

.st-range__btn.is-active {
  background: var(--el-bg-color);
  color: var(--el-color-primary);
  font-weight: 600;
  box-shadow: 0 1px 4px rgb(0 0 0 / 8%);
}

.st-top__updated {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

/* ---- KPI 行 ---- */
.st-kpis {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 14px;
}

.st-kpi {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  min-width: 0;
  padding: 16px 18px 14px;
  border: 1px solid transparent;
  border-radius: 12px;
  text-align: left;
  cursor: pointer;
  transition: box-shadow 0.2s, transform 0.2s, border-color 0.2s;
}

.st-kpi:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgb(31 33 44 / 8%);
}

.st-kpi.is-active {
  border-color: #2551bd;
  box-shadow: 0 4px 14px rgb(37 81 189 / 20%);
}

.st-kpi__label {
  font-size: 12px;
  color: #737a87;
}

.st-kpi__value {
  font-size: 24px;
  font-weight: 700;
  color: #2551bd;
  font-variant-numeric: tabular-nums;
}

.st-kpi__value i {
  font-style: normal;
  font-size: 12px;
  font-weight: 400;
  color: #737a87;
  margin-left: 2px;
}

.st-kpi__delta {
  font-size: 12px;
  color: #737a87;
}

.st-kpi__delta b {
  font-weight: 600;
}

.st-kpi__delta.is-good b {
  color: #12a35a;
}

.st-kpi__delta.is-bad b {
  color: #e74442;
}

/* ---- 主趋势图 ---- */
.st-chart__legend {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.st-chart__legend-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.st-chart__legend-item i {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.st-chart__legend-item i.is-cur {
  background: var(--el-color-primary);
}

.st-chart__legend-item i.is-prev {
  background: #c09048;
}

.st-chart__hint {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.st-chart {
  position: relative;
  min-width: 0;
}

.st-chart__svg {
  display: block;
  width: 100%;
  height: auto;
  cursor: crosshair;
}

.st-chart__tick {
  font-size: 10px;
  fill: var(--el-text-color-secondary);
}

.st-chart__dot {
  cursor: pointer;
  transition: r 0.15s;
}

.st-chart__dot.is-hover,
.st-chart__dot.is-drill {
  r: 5;
}

.st-chart__dot.is-drill {
  stroke: var(--el-color-primary);
  stroke-width: 2.4;
}

.st-chart__tip {
  position: absolute;
  top: 8px;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 12px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  box-shadow: 0 4px 14px rgb(0 0 0 / 10%);
  pointer-events: none;
  white-space: nowrap;
  z-index: 5;
}

.st-chart__tip b {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.st-chart__tip span {
  font-size: 13px;
  color: var(--el-text-color-primary);
  font-weight: 600;
}

.st-chart__tip span.is-prev {
  color: var(--el-text-color-secondary);
  font-weight: 500;
}

/* ---- 双列行：左 3（主图 + 速览） / 右 2（渠道占比） ---- */
.st-row {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}

.st-row__main {
  flex: 3;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.st-row__side {
  flex: 2;
  min-width: 0;
}

.st-donut {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.st-donut__svg {
  flex: none;
  width: 118px;
  height: 118px;
}

.st-donut__seg {
  transition: opacity 0.2s;
  cursor: pointer;
}

.st-donut__seg.is-dim {
  opacity: 0.3;
}

.st-donut__total {
  font-size: 20px;
  font-weight: 600;
  fill: var(--el-text-color-primary);
}

.st-donut__cap {
  font-size: 11px;
  fill: var(--el-text-color-secondary);
}

.st-legend {
  width: 100%;
  min-width: 0;
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 10px;
}

.st-legend__item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 8px;
  background: var(--el-fill-color-lighter);
  cursor: default;
  transition: opacity 0.2s, background 0.2s;
}

.st-legend__item.is-dim {
  opacity: 0.45;
}

.st-legend__dot {
  width: 10px;
  height: 10px;
  border-radius: 3px;
  flex: none;
}

.st-legend__name {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  color: var(--el-text-color-primary);
}

.st-legend__val {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  font-variant-numeric: tabular-nums;
}

/* ---- 数据速览 ---- */
.st-quick {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.st-quick__item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.st-quick__rank {
  flex: none;
  width: 20px;
  height: 20px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  background: var(--el-fill-color);
  color: var(--el-text-color-secondary);
}

.st-quick__rank.is-1 {
  background: var(--el-color-danger-light-8);
  color: var(--el-color-danger);
}

.st-quick__rank.is-2 {
  background: var(--el-color-warning-light-8);
  color: var(--el-color-warning);
}

.st-quick__rank.is-3 {
  background: var(--el-color-primary-light-8);
  color: var(--el-color-primary);
}

.st-quick__name {
  flex: none;
  width: 84px;
  font-size: 13px;
  color: var(--el-text-color-primary);
}

.st-quick__bar {
  flex: 1;
  min-width: 0;
  height: 8px;
  border-radius: 4px;
  background: var(--el-fill-color-light);
  overflow: hidden;
}

.st-quick__bar i {
  display: block;
  height: 100%;
  border-radius: 4px;
  background: linear-gradient(90deg, var(--el-color-primary-light-5), var(--el-color-primary));
  transition: width 0.4s;
}

.st-quick__val {
  flex: none;
  width: 40px;
  text-align: right;
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  font-variant-numeric: tabular-nums;
}

/* ---- 第二/三行双列：漏斗 + 时段分布 / 排行 + 地域 ---- */
.st-row2,
.st-row3 {
  display: flex;
  gap: 14px;
  align-items: stretch;
}

.st-row2__funnel {
  flex: 2;
  min-width: 0;
}

.st-row2__hour {
  flex: 3;
  min-width: 0;
}

.st-row3__rank {
  flex: 3;
  min-width: 0;
}

.st-row3__region {
  flex: 2;
  min-width: 0;
}

/* 转化漏斗 */
.st-funnel {
  display: flex;
  justify-content: center;
}

.st-funnel__svg {
  width: 100%;
  max-width: 400px;
  height: auto;
}

.st-funnel__name {
  font-size: 11px;
  fill: var(--el-text-color-secondary);
}

.st-funnel__val {
  font-size: 13px;
  font-weight: 600;
  fill: var(--el-text-color-primary);
}

.st-funnel__rate {
  font-size: 11px;
  font-weight: 600;
  fill: var(--el-text-color-secondary);
}

/* 24 小时访问分布 */
.st-hour {
  position: relative;
}

.st-hour__svg {
  display: block;
  width: 100%;
  height: auto;
}

.st-hour__bar {
  fill: #c7dbf8;
  cursor: pointer;
  transition: fill 0.15s;
}

.st-hour__bar.is-peak {
  fill: var(--el-color-primary);
}

.st-hour__bar.is-hover {
  fill: #1257c4;
}

.st-hour__avg-line {
  stroke: var(--el-text-color-secondary);
  stroke-width: 1;
  stroke-dasharray: 4 3;
  opacity: 0.6;
  pointer-events: none;
}

.st-hour__avg,
.st-hour__tick {
  font-size: 10px;
  fill: var(--el-text-color-secondary);
}

.st-hour__tip {
  position: absolute;
  top: 4px;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 12px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  box-shadow: 0 4px 14px rgb(0 0 0 / 10%);
  pointer-events: none;
  white-space: nowrap;
  z-index: 5;
}

.st-hour__tip b {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.st-hour__tip span {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

/* 访问排行 TOP5 */
.st-top5__tabs {
  display: inline-flex;
  padding: 3px;
  background: var(--el-fill-color-light);
  border-radius: 8px;
}

.st-top5__tab {
  padding: 3px 12px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  font-size: 12px;
  color: var(--el-text-color-regular);
  cursor: pointer;
  transition: all 0.2s;
}

.st-top5__tab.is-active {
  background: var(--el-bg-color);
  color: var(--el-color-primary);
  font-weight: 600;
  box-shadow: 0 1px 4px rgb(0 0 0 / 8%);
}

.st-top5 {
  margin: 0;
  padding: 0;
  list-style: none;
}

.st-top5__item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.st-top5__item:last-child {
  border-bottom: 0;
}

.st-top5__rank {
  flex: none;
  width: 20px;
  height: 20px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  background: var(--el-fill-color);
  color: var(--el-text-color-secondary);
}

.st-top5__rank.is-1 {
  background: var(--el-color-danger-light-8);
  color: var(--el-color-danger);
}

.st-top5__rank.is-2 {
  background: var(--el-color-warning-light-8);
  color: var(--el-color-warning);
}

.st-top5__rank.is-3 {
  background: var(--el-color-primary-light-8);
  color: var(--el-color-primary);
}

.st-top5__name {
  flex: none;
  width: 96px;
  font-size: 13px;
  color: var(--el-text-color-primary);
}

.st-top5__bar {
  flex: 1;
  min-width: 0;
  height: 8px;
  border-radius: 4px;
  background: var(--el-fill-color-light);
  overflow: hidden;
}

.st-top5__bar i {
  display: block;
  height: 100%;
  border-radius: 4px;
  background: linear-gradient(90deg, var(--el-color-primary-light-5), var(--el-color-primary));
  transition: width 0.4s;
}

.st-top5__val {
  flex: none;
  width: 68px;
  text-align: right;
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  font-variant-numeric: tabular-nums;
}

.st-top5__delta {
  flex: none;
  width: 52px;
  text-align: right;
  font-size: 12px;
  font-weight: 600;
}

.st-top5__delta.is-good {
  color: #12a35a;
}

.st-top5__delta.is-bad {
  color: #e74442;
}

/* 地域分布 */
.st-region {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.st-region__item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.st-region__name {
  flex: none;
  width: 40px;
  font-size: 13px;
  color: var(--el-text-color-primary);
}

.st-region__bar {
  flex: 1;
  min-width: 0;
  height: 14px;
  border-radius: 4px;
  background: var(--el-fill-color-light);
  overflow: hidden;
}

.st-region__bar i {
  display: block;
  height: 100%;
  border-radius: 4px;
  background: linear-gradient(90deg, var(--el-color-primary-light-3), var(--el-color-primary));
  transition: width 0.4s;
}

.st-region__val {
  flex: none;
  width: 64px;
  text-align: right;
  font-size: 12px;
  color: var(--el-text-color-primary);
  font-variant-numeric: tabular-nums;
}

.st-region__pct {
  flex: none;
  width: 38px;
  text-align: right;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  font-variant-numeric: tabular-nums;
}

/* ---- 下钻明细抽屉 ---- */
.st-drawer__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.st-detail {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
}

.st-detail__row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 4px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.st-detail__row:last-child {
  border-bottom: 0;
}

.st-detail__time {
  flex: none;
  width: 52px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  font-variant-numeric: tabular-nums;
}

.st-detail__event {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  color: var(--el-text-color-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.st-detail__val {
  flex: none;
  font-size: 13px;
  color: var(--el-color-primary);
  font-variant-numeric: tabular-nums;
}

/* 窄屏适配 */
@media (max-width: 1280px) {
  .st-kpis {
    grid-template-columns: repeat(3, 1fr);
  }

  .st-row,
  .st-row2,
  .st-row3 {
    flex-direction: column;
    align-items: stretch;
  }

  .st-row__main,
  .st-row__side {
    width: 100%;
  }
}

@media (max-width: 720px) {
  .st-kpis {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>


