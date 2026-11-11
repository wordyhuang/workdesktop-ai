<template>
  <div class="example-page">
    <demo-block
      title="基础用法"
      desc="一行 3 条、共 7 条数据：左右按钮位于预留槽位（不遮挡卡片），分页平移、首尾页自动禁用"
      :code="code1"
    >
      <wd-card-rail :items="tasks" item-key="id">
        <template #default="{ item, index }">
          <div class="demo-task__head">
            <span class="demo-task__no">{{ String(index + 1).padStart(2, '0') }}</span>
            <el-icon :size="15"><component :is="item.icon" /></el-icon>
            <span class="demo-task__title">{{ item.title }}</span>
          </div>
          <div class="demo-task__foot">
            <el-progress
              v-if="item.percent > 0 && item.percent < 100"
              :percentage="item.percent" :stroke-width="5" :show-text="false"
              class="demo-task__bar" />
            <span class="demo-task__due">截止 {{ item.due }}</span>
            <wd-tag size="small" :type="item.stateType">{{ item.state }}</wd-tag>
          </div>
        </template>
      </wd-card-rail>
    </demo-block>

    <demo-block
      title="受控页码"
      desc="v-model:page 受控 + 外部按钮调用 ref 的 prev()/next()/goTo()；perPage=2"
      :code="code2"
    >
      <div class="demo-toolbar">
        <span class="demo-toolbar__label">当前页：{{ page }} / {{ maxPage }}</span>
        <el-button size="small" @click="railRef?.prev()">上一页</el-button>
        <el-button size="small" type="primary" @click="railRef?.next()">下一页</el-button>
        <el-button size="small" @click="railRef?.goTo(0)">回到首页</el-button>
      </div>
      <wd-card-rail ref="railRef" v-model:page="page" :items="tasks" :per-page="2" item-key="id">
        <template #default="{ item }">
          <div class="demo-card__title">{{ item.title }}</div>
          <div class="demo-card__meta">{{ item.due }} · {{ item.state }}</div>
        </template>
      </wd-card-rail>
    </demo-block>

    <demo-block
      title="自定义单项内容"
      desc="单项完全交给默认作用域插槽：这里渲染成指标卡；showNav=false 可隐藏翻页按钮"
      :code="code3"
    >
      <wd-card-rail :items="metrics" :per-page="3" item-key="label">
        <template #default="{ item }">
          <div class="demo-metric__label">{{ item.label }}</div>
          <div class="demo-metric__value">{{ item.value }}<i>{{ item.unit }}</i></div>
          <wd-tag size="small" :type="item.delta >= 0 ? 'success' : 'danger'">
            较昨日 {{ item.delta >= 0 ? '+' : '' }}{{ item.delta }}%
          </wd-tag>
        </template>
      </wd-card-rail>
    </demo-block>

    <demo-block
      title="循环滑动"
      desc="loop=true：首屏「上一页」跳到末页、末页「下一页」回到首屏；只有一页时双按钮仍禁用"
      :code="code4"
    >
      <wd-card-rail :items="tasks" :per-page="2" item-key="id" loop>
        <template #default="{ item }">
          <div class="demo-card__title">{{ item.title }}</div>
          <div class="demo-card__meta">{{ item.due }} · {{ item.state }}</div>
        </template>
      </wd-card-rail>
    </demo-block>

    <demo-block
      title="自定义翻页按钮"
      desc="通过 #nav 插槽接管翻页入口：默认圆形按钮不再渲染、也不再预留左右槽位，可放到任意位置"
      :code="code5"
    >
      <wd-card-rail :items="tasks" :per-page="3" item-key="id">
        <template #default="{ item }">
          <div class="demo-card__title">{{ item.title }}</div>
          <div class="demo-card__meta">{{ item.due }} · {{ item.state }}</div>
        </template>
        <template #nav="{ page, maxPage, prev, next, canPrev, canNext }">
          <div class="demo-nav">
            <el-button size="small" :disabled="!canPrev" @click="prev">上一页</el-button>
            <span class="demo-nav__page">{{ page + 1 }} / {{ maxPage + 1 }}</span>
            <el-button size="small" :disabled="!canNext" @click="next">下一页</el-button>
          </div>
        </template>
      </wd-card-rail>
    </demo-block>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { AlarmClock, Calendar, Document } from '@element-plus/icons-vue'

const railRef = ref()

const tasks = [
  { id: 1, title: 'Q4 预算评审会材料准备', due: '今天 11:30', percent: 60, state: '进行中', stateType: 'warning', icon: AlarmClock },
  { id: 2, title: '供应商合同续签审批', due: '今天 15:00', percent: 20, state: '进行中', stateType: 'warning', icon: Document },
  { id: 3, title: '11 月部门排期确认', due: '今天 18:00', percent: 0, state: '待开始', stateType: 'info', icon: Calendar },
  { id: 4, title: '客户拜访复盘纪要归档', due: '今天 10:00', percent: 100, state: '已完成', stateType: 'success', icon: Document },
  { id: 5, title: '渠道月度对账单核对', due: '今天 17:00', percent: 45, state: '进行中', stateType: 'warning', icon: Document },
  { id: 6, title: '本周运营数据周报', due: '今天 20:00', percent: 0, state: '待开始', stateType: 'info', icon: Calendar },
  { id: 7, title: '年度培训计划初稿', due: '明天 12:00', percent: 0, state: '待开始', stateType: 'info', icon: Calendar }
]

const page = ref(0)
const maxPage = computed(() => Math.max(0, Math.ceil(tasks.length / 2) - 1))

const metrics = [
  { label: '今日成交额', value: '128.6', unit: '万元', delta: 12.4 },
  { label: '新增客户', value: '36', unit: '人', delta: 5.2 },
  { label: '待处理审批', value: '8', unit: '件', delta: -3.1 },
  { label: '流程平均时长', value: '2.4', unit: '小时', delta: -8.6 },
  { label: '客户满意度', value: '96.2', unit: '%', delta: 1.5 }
]

const code1 = `<wd-card-rail :items="tasks" item-key="id">
  <template #default="{ item, index }">
    <div class="demo-task__head">
      <span class="demo-task__no">{{ String(index + 1).padStart(2, '0') }}</span>
      <el-icon :size="15"><component :is="item.icon" /></el-icon>
      <span class="demo-task__title">{{ item.title }}</span>
    </div>
    <div class="demo-task__foot">
      <el-progress
        v-if="item.percent > 0 && item.percent < 100"
        :percentage="item.percent" :stroke-width="5" :show-text="false" />
      <span class="demo-task__due">截止 {{ item.due }}</span>
      <wd-tag size="small" :type="item.stateType">{{ item.state }}</wd-tag>
    </div>
  </template>
</wd-card-rail>`

const code2 = `<wd-card-rail ref="railRef" v-model:page="page" :items="tasks" :per-page="2" item-key="id">
  <template #default="{ item }">
    <div class="demo-card__title">{{ item.title }}</div>
    <div class="demo-card__meta">{{ item.due }} · {{ item.state }}</div>
  </template>
</wd-card-rail>

<!-- 外部按钮：railRef.value.prev() / next() / goTo(0) -->`

const code3 = `<wd-card-rail :items="metrics" :per-page="3" item-key="label">
  <template #default="{ item }">
    <div class="demo-metric__label">{{ item.label }}</div>
    <div class="demo-metric__value">{{ item.value }}<i>{{ item.unit }}</i></div>
    <wd-tag size="small" :type="item.delta >= 0 ? 'success' : 'danger'">
      较昨日 {{ item.delta >= 0 ? '+' : '' }}{{ item.delta }}%
    </wd-tag>
  </template>
</wd-card-rail>`

const code4 = `<wd-card-rail :items="tasks" :per-page="2" item-key="id" loop>
  <template #default="{ item }">
    <div class="demo-card__title">{{ item.title }}</div>
    <div class="demo-card__meta">{{ item.due }} · {{ item.state }}</div>
  </template>
</wd-card-rail>`

const code5 = `<wd-card-rail :items="tasks" :per-page="3" item-key="id">
  <template #default="{ item }">
    <div class="demo-card__title">{{ item.title }}</div>
    <div class="demo-card__meta">{{ item.due }} · {{ item.state }}</div>
  </template>
  <template #nav="{ page, maxPage, prev, next, canPrev, canNext }">
    <div class="demo-nav">
      <el-button size="small" :disabled="!canPrev" @click="prev">上一页</el-button>
      <span class="demo-nav__page">{{ page + 1 }} / {{ maxPage + 1 }}</span>
      <el-button size="small" :disabled="!canNext" @click="next">下一页</el-button>
    </div>
  </template>
</wd-card-rail>`
</script>

<style scoped>
.example-page {
  width: 100%;
}

.demo-task__head {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}
.demo-task__no {
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
}
.demo-task__title {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.demo-task__foot {
  display: flex;
  align-items: center;
  gap: 8px;
}
.demo-task__bar {
  width: 96px;
  flex: 0 0 96px;
}
.demo-task__due {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}

.demo-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}
.demo-toolbar__label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.demo-card__title {
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.demo-card__meta {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.demo-metric__label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.demo-metric__value {
  font-size: 22px;
  font-weight: 700;
  color: var(--el-text-color-primary);
}
.demo-metric__value i {
  margin-left: 2px;
  font-size: 12px;
  font-weight: 400;
  font-style: normal;
  color: var(--el-text-color-secondary);
}

.demo-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 10px;
}
.demo-nav__page {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
