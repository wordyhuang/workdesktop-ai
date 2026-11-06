<template>
  <div class="focus-page" :class="{ 'is-zen': zenMode }">
    <!-- 极简顶条：问候 / 统计 / 专注开关（渐进式披露 L0：默认只呈现最少信息） -->
    <header class="fc-top">
      <div class="fc-top__hello">
        <h1 class="fc-top__title">{{ greeting }}，今天只做一件事</h1>
        <p class="fc-top__sub">{{ todayText }} · 已完成 {{ doneTotal }} 件事 · {{ pomodoroCount }} 个番茄</p>
      </div>
      <div class="fc-top__ops">
        <ScenarioPromptButton scene="focus" title="专注工作台" />
        <el-tooltip content="键盘快捷键（?）" placement="bottom" :show-after="200">
          <button class="fc-icon-btn" type="button" aria-label="快捷键帮助" @click="helpVisible = true">
            <el-icon :size="16"><QuestionFilled /></el-icon>
          </button>
        </el-tooltip>
        <button
          class="fc-zen-btn" type="button"
          :class="{ 'is-on': zenMode }"
          :aria-pressed="zenMode"
          @click="zenMode = !zenMode">
          <el-icon :size="14"><component :is="zenMode ? View : Hide" /></el-icon>
          {{ zenMode ? '退出专注' : '专注模式' }}
          <kbd class="fc-kbd">F</kbd>
        </button>
      </div>
    </header>

    <!-- 当前任务聚焦卡：单列主任务区，其它信息一律收进折叠区 -->
    <section v-if="currentTask" class="fc-card" :aria-label="'当前任务：' + currentTask.title">
      <div class="fc-card__meta">
        <wd-tag size="small" :type="priorityType(currentTask.priority)">{{ currentTask.priority }}</wd-tag>
        <span class="fc-card__est">预计 {{ currentTask.estimate }}</span>
        <span class="fc-card__dot">·</span>
        <span class="fc-card__src">{{ currentTask.source }}</span>
      </div>
      <h2 class="fc-card__title">{{ currentTask.title }}</h2>
      <p class="fc-card__summary">{{ currentTask.summary }}</p>

      <!-- 渐进式披露 L1：详情按需展开（子任务清单 / 备注），默认收起 -->
      <button
        class="fc-disclose" type="button"
        :aria-expanded="detailOpen"
        @click="detailOpen = !detailOpen">
        <el-icon :size="13" class="fc-disclose__arrow" :class="{ 'is-open': detailOpen }"><ArrowRight /></el-icon>
        {{ detailOpen ? '收起详情' : '展开详情' }}
        <span class="fc-disclose__hint">{{ detailOpen ? '' : currentTask.checklist.filter((c) => !c.done).length + ' 个待办子项' }}</span>
        <kbd class="fc-kbd">E</kbd>
      </button>
      <div class="fc-detail" :class="{ 'is-open': detailOpen }">
        <div class="fc-detail__inner">
          <ul class="fc-checklist">
            <li v-for="(c, ci) in currentTask.checklist" :key="c.text" class="fc-checklist__item" :class="{ 'is-done': c.done }">
              <el-checkbox
                :model-value="c.done"
                @change="toggleCheck(ci)"
              >{{ c.text }}</el-checkbox>
            </li>
          </ul>
          <p class="fc-card__note">{{ currentTask.note }}</p>
        </div>
      </div>

      <!-- 番茄钟：环进度 + 开始/暂停/重置（Space / R） -->
      <div class="fc-timer" :class="{ 'is-running': timerRunning, 'is-break': isBreakPhase }">
        <svg class="fc-timer__ring" viewBox="0 0 120 120" aria-hidden="true">
          <circle class="fc-timer__track" cx="60" cy="60" r="52" />
          <circle
            class="fc-timer__bar" cx="60" cy="60" r="52"
            :stroke-dasharray="RING_LEN"
            :stroke-dashoffset="ringOffset" />
        </svg>
        <div class="fc-timer__center">
          <b class="fc-timer__clock">{{ clockText }}</b>
          <span class="fc-timer__phase">{{ timerRunning ? (isBreakPhase ? '休息中' : '专注中') : (remain < totalSeconds ? '已暂停' : (isBreakPhase ? '休息' : '待开始')) }}</span>
        </div>
        <div class="fc-timer__ops">
          <button class="fc-timer__main" type="button" @click="toggleTimer">
            <el-icon :size="14"><component :is="timerRunning ? VideoPause : VideoPlay" /></el-icon>
            {{ timerRunning ? '暂停' : '开始专注' }}
            <kbd class="fc-kbd fc-kbd--ghost">Space</kbd>
          </button>
          <button class="fc-timer__reset" type="button" aria-label="重置计时" @click="resetTimer">
            <el-icon :size="14"><RefreshLeft /></el-icon>
            <kbd class="fc-kbd fc-kbd--ghost">R</kbd>
          </button>
        </div>
      </div>

      <!-- 当前任务操作行 -->
      <div class="fc-card__ops">
        <button class="fc-btn fc-btn--primary" type="button" @click="completeCurrent">
          <el-icon :size="14"><CircleCheck /></el-icon>
          完成它
          <kbd class="fc-kbd fc-kbd--ghost">C</kbd>
        </button>
        <button class="fc-btn fc-btn--plain" type="button" @click="skipCurrent">
          <el-icon :size="14"><Sort /></el-icon>
          先放一放
        </button>
      </div>
    </section>

    <!-- 空状态：全部任务完成的庆祝视图（渐进披露终点） -->
    <section v-else class="fc-empty">
      <span class="fc-empty__medal"><el-icon :size="34"><Trophy /></el-icon></span>
      <h2 class="fc-empty__title">今日任务已清空</h2>
      <p class="fc-empty__desc">完成 {{ doneTotal }} 件事 · 累计 {{ pomodoroCount }} 个番茄，给自己泡杯茶吧</p>
    </section>

    <!-- 渐进式披露 L1：折叠区（专注模式下整体隐藏，保持视野干净） -->
    <template v-if="!zenMode">
      <!-- 专注提示 -->
      <wd-tips
        class="fc-hint"
        type="box" icon="Bell"
        color="var(--el-color-primary)" bg="var(--el-color-primary-light-9)"
        tips="专注时段建议静音群消息：完成一个番茄后再集中处理审批与回复。" />

      <!-- 任务队列：默认收起只显示计数，展开后可将任意任务「设为当前」 -->
      <section class="fc-fold" :class="{ 'is-open': queueOpen }">
        <button class="fc-fold__head" type="button" :aria-expanded="queueOpen" @click="queueOpen = !queueOpen">
          <span class="fc-fold__title">任务队列</span>
          <span class="fc-fold__count">还有 {{ queue.length }} 件</span>
          <el-icon :size="13" class="fc-fold__arrow"><ArrowDown /></el-icon>
        </button>
        <div class="fc-fold__body">
          <ul class="fc-fold__inner">
            <li v-for="t in queue" :key="t.title" class="fc-queue__item">
              <span class="fc-queue__flag" :class="priorityClass(t.priority)" />
              <div class="fc-queue__body">
                <b>{{ t.title }}</b>
                <span>{{ t.priority }} · 预计 {{ t.estimate }}</span>
              </div>
              <button class="fc-queue__pick" type="button" @click="focusTask(t)">设为当前</button>
            </li>
            <li v-if="!queue.length" class="fc-queue__blank">队列已空，专注当前就好</li>
          </ul>
        </div>
      </section>

      <!-- 待办审批：默认收起摘要行；逐条通过/驳回为乐观更新，底部弹出可撤销条 -->
      <section class="fc-fold" :class="{ 'is-open': approveOpen }">
        <button class="fc-fold__head" type="button" :aria-expanded="approveOpen" @click="approveOpen = !approveOpen">
          <span class="fc-fold__title">待办审批</span>
          <span class="fc-fold__count" :class="{ 'is-warn': approvals.length }">{{ approvals.length }} 条待处理</span>
          <el-icon :size="13" class="fc-fold__arrow"><ArrowDown /></el-icon>
        </button>
        <div class="fc-fold__body">
          <ul class="fc-fold__inner">
            <li v-for="a in approvals" :key="a.id" class="fc-approve__item">
              <span class="fc-approve__tag" :class="'is-' + a.kind">{{ a.kind }}</span>
              <div class="fc-approve__body">
                <b>{{ a.title }}</b>
                <span>{{ a.meta }}</span>
              </div>
              <div class="fc-approve__ops">
                <button class="fc-approve__btn is-ok" type="button" @click="approve(a.id, 'ok')">通过</button>
                <button class="fc-approve__btn is-no" type="button" @click="approve(a.id, 'no')">驳回</button>
              </div>
            </li>
            <li v-if="!approvals.length" class="fc-queue__blank">审批已清空，暂无待处理事项</li>
          </ul>
        </div>
      </section>

      <!-- 今日引导：三步 checklist，事件自动勾选，也可手动勾 -->
      <section class="fc-fold" :class="{ 'is-open': guideOpen }">
        <button class="fc-fold__head" type="button" :aria-expanded="guideOpen" @click="guideOpen = !guideOpen">
          <span class="fc-fold__title">今日引导</span>
          <span class="fc-fold__count">{{ guideDoneCount }}/3</span>
          <el-icon :size="13" class="fc-fold__arrow"><ArrowDown /></el-icon>
        </button>
        <div class="fc-fold__body">
          <ul class="fc-fold__inner">
            <li v-for="g in guide" :key="g.text" class="fc-guide__item" :class="{ 'is-done': g.done }">
              <el-checkbox v-model="g.done">{{ g.text }}</el-checkbox>
            </li>
          </ul>
        </div>
      </section>
    </template>

    <!-- 乐观更新撤销条：5 秒倒计时，超时自动消失 -->
    <transition name="fc-toast">
      <div v-if="undo" class="fc-undo" role="status">
        <span class="fc-undo__text">{{ undo.item.title }}</span>
        <button class="fc-undo__btn" type="button" @click="undoApprove">撤销</button>
        <i class="fc-undo__bar" :style="{ transform: `scaleX(${undo.remain / UNDO_SECONDS})` }" />
      </div>
    </transition>

    <!-- 快捷键帮助抽屉（渐进披露 L2：低频信息放浮层） -->
    <el-drawer v-model="helpVisible" title="键盘快捷键" size="340px" append-to-body>
      <ul class="fc-keys">
        <li v-for="k in KEYMAP" :key="k.key" class="fc-keys__row">
          <span>{{ k.desc }}</span>
          <kbd class="fc-kbd">{{ k.key }}</kbd>
        </li>
      </ul>
      <p class="fc-keys__note">输入框聚焦时快捷键自动失效；Esc 可收起详情或关闭本面板。</p>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import ScenarioPromptButton from '../components/ScenarioPromptButton.vue'
import {
  ArrowDown, ArrowRight, CircleCheck, Hide, QuestionFilled,
  RefreshLeft, Sort, Trophy, VideoPause, VideoPlay, View
} from '@element-plus/icons-vue'

/** 番茄钟环参数 */
const RING_LEN = 2 * Math.PI * 52
const FOCUS_SECONDS = 25 * 60
const BREAK_SECONDS = 5 * 60
/** 乐观更新撤销窗口（秒） */
const UNDO_SECONDS = 5

interface CheckItem { text: string; done: boolean }
interface FocusTask {
  title: string
  priority: '高' | '中' | '低'
  estimate: string
  source: string
  summary: string
  note: string
  checklist: CheckItem[]
}

const seedTasks: FocusTask[] = [
  {
    title: 'Q3 评审材料终稿',
    priority: '高', estimate: '40 分钟', source: '来自项目群',
    summary: '补齐性能对比章节并核对图表口径，下午 3 点前发出评审邀请。',
    note: '评审重点：数据组件渲染性能与表单校验链路；图表口径与 9 月版本对齐。',
    checklist: [
      { text: '补齐性能对比章节', done: true },
      { text: '核对 3 张图表口径', done: false },
      { text: '生成 PDF 并发出评审邀请', done: false }
    ]
  },
  {
    title: '审批流异常复盘',
    priority: '高', estimate: '30 分钟', source: '来自异常提醒',
    summary: '整理本周 3 条审批超时记录，输出根因与改进项。',
    note: '重点看附件缺失与代提交两类场景。',
    checklist: [
      { text: '导出超时记录', done: false },
      { text: '归纳根因清单', done: false }
    ]
  },
  {
    title: '整理周会待办',
    priority: '中', estimate: '15 分钟', source: '来自会议纪要',
    summary: '把周会待办按「本日 / 本周」拆分并同步到任务池。',
    note: '',
    checklist: [{ text: '拆分待办并同步', done: false }]
  },
  {
    title: '回复合作方邮件',
    priority: '中', estimate: '10 分钟', source: '来自邮箱',
    summary: '确认接口联调时间窗口，附上环境地址与联系人。',
    note: '',
    checklist: [{ text: '回复并抄送双方负责人', done: false }]
  },
  {
    title: '更新组件变更日志',
    priority: '低', estimate: '20 分钟', source: '来自例行事务',
    summary: '补记本周组件修复记录，标记破坏性变更。',
    note: '',
    checklist: [{ text: '补记 CHANGELOG', done: false }]
  }
]

/** 当前聚焦任务（主任务区只呈现这一件）与任务队列 */
const currentTask = ref<FocusTask | null>(seedTasks[0])
const queue = ref<FocusTask[]>(seedTasks.slice(1))
const detailOpen = ref(false)

const doneTotal = ref(2)
const pomodoroCount = ref(0)
const zenMode = ref(false)
const helpVisible = ref(false)

/** 折叠区展开状态：默认全部收起，按需披露 */
const queueOpen = ref(false)
const approveOpen = ref(false)
const guideOpen = ref(false)

interface Approval { id: number; kind: string; title: string; meta: string }
const approvals = ref<Approval[]>([
  { id: 1, kind: '请假', title: '李芳 · 年假 1 天（11-06）', meta: '项目低谷期，建议通过' },
  { id: 2, kind: '报销', title: '王磊 · 差旅报销 ¥1,286', meta: '行程与订单一致' },
  { id: 3, kind: '采购', title: '赵倩 · 测试机采购 2 台', meta: '预算内，走快速通道' }
])

interface UndoState { item: Approval; index: number; kind: 'ok' | 'no'; remain: number }
const undo = ref<UndoState | null>(null)
let undoTimer: ReturnType<typeof setInterval> | null = null

const guide = reactive([
  { text: '认领一个任务并开始专注', done: false },
  { text: '完成一个番茄钟', done: false },
  { text: '清空待办审批', done: false }
])
const guideDoneCount = computed(() => guide.filter((g) => g.done).length)

/** 番茄钟：25 分钟专注 + 5 分钟休息两阶段 */
const phase = ref<'focus' | 'break'>('focus')
const remain = ref(FOCUS_SECONDS)
const timerRunning = ref(false)
let timerId: ReturnType<typeof setInterval> | null = null

const totalSeconds = computed(() => (phase.value === 'focus' ? FOCUS_SECONDS : BREAK_SECONDS))
const clockText = computed(() => {
  const m = Math.floor(remain.value / 60)
  const s = remain.value % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})
const ringOffset = computed(() => RING_LEN * (1 - remain.value / totalSeconds.value))
const isBreakPhase = computed(() => phase.value === 'break')

function stopTick() {
  if (timerId) { clearInterval(timerId); timerId = null }
  timerRunning.value = false
}

function tick() {
  remain.value--
  if (remain.value > 0) return
  stopTick()
  if (phase.value === 'focus') {
    pomodoroCount.value++
    guide[1].done = true
    ElMessage.success('完成一个番茄，休息 5 分钟')
    phase.value = 'break'
    remain.value = BREAK_SECONDS
  } else {
    ElMessage.info('休息结束，开始下一个番茄')
    phase.value = 'focus'
    remain.value = FOCUS_SECONDS
  }
}

function toggleTimer() {
  if (timerRunning.value) { stopTick(); return }
  guide[0].done = true
  timerRunning.value = true
  timerId = setInterval(tick, 1000)
}

function resetTimer() {
  stopTick()
  phase.value = 'focus'
  remain.value = FOCUS_SECONDS
}

/** 子项勾选：全部完成时给出可提交提示 */
function toggleCheck(ci: number) {
  const list = currentTask.value?.checklist
  if (!list) return
  list[ci].done = !list[ci].done
  if (list.every((c) => c.done)) ElMessage.success('子任务已全部完成，可以「完成它」了')
}

function completeCurrent() {
  const t = currentTask.value
  if (!t) return
  doneTotal.value++
  currentTask.value = queue.value.shift() ?? null
  detailOpen.value = false
  ElMessage.success(`已完成「${t.title}」`)
}

function skipCurrent() {
  const t = currentTask.value
  if (!t) return
  queue.value.push(t)
  currentTask.value = queue.value.shift() ?? null
  detailOpen.value = false
  ElMessage.info(`「${t.title}」已移到队尾`)
}

/** 队列任务设为当前：旧任务退回队尾，保持单任务聚焦 */
function focusTask(t: FocusTask) {
  const idx = queue.value.indexOf(t)
  if (idx > -1) queue.value.splice(idx, 1)
  if (currentTask.value) queue.value.push(currentTask.value)
  currentTask.value = t
  detailOpen.value = false
  guide[0].done = true
}

/** 审批乐观更新：先移除并弹出可撤销条，5 秒不撤销视为确认 */
function approve(id: number, kind: 'ok' | 'no') {
  const index = approvals.value.findIndex((a) => a.id === id)
  if (index < 0) return
  const item = approvals.value[index]
  approvals.value.splice(index, 1)
  if (undoTimer) { clearInterval(undoTimer); undoTimer = null }
  undo.value = { item, index, kind, remain: UNDO_SECONDS }
  undoTimer = setInterval(() => {
    if (!undo.value) return
    undo.value.remain--
    if (undo.value.remain <= 0) clearUndo()
  }, 1000)
}

function clearUndo() {
  undo.value = null
  if (undoTimer) { clearInterval(undoTimer); undoTimer = null }
}

function undoApprove() {
  const u = undo.value
  if (!u) return
  clearUndo()
  approvals.value.splice(Math.min(u.index, approvals.value.length), 0, u.item)
  ElMessage.info('已撤销，审批单恢复到待处理')
}

/** 审批清空自动勾选引导第三步 */
watch(() => approvals.value.length, (n) => { if (n === 0) guide[2].done = true })

/** 键盘快捷键：输入态与帮助浮层打开时自动让路 */
const KEYMAP = [
  { key: 'Space', desc: '开始 / 暂停番茄钟' },
  { key: 'E', desc: '展开 / 收起任务详情' },
  { key: 'C', desc: '完成当前任务' },
  { key: 'F', desc: '切换专注模式' },
  { key: 'R', desc: '重置番茄钟' },
  { key: '?', desc: '打开本帮助' },
  { key: 'Esc', desc: '收起详情 / 关闭浮层' }
]

function onKeydown(e: KeyboardEvent) {
  const el = e.target as HTMLElement | null
  if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return
  if (helpVisible.value) return
  switch (e.key) {
    case ' ': e.preventDefault(); toggleTimer(); break
    case 'e': case 'E': if (currentTask.value) detailOpen.value = !detailOpen.value; break
    case 'c': case 'C': completeCurrent(); break
    case 'f': case 'F': zenMode.value = !zenMode.value; break
    case 'r': case 'R': resetTimer(); break
    case '?': helpVisible.value = true; break
    case 'Escape': detailOpen.value = false; break
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  stopTick()
  clearUndo()
})

/** 顶条文案 */
const hour = new Date().getHours()
const greeting = hour < 6 ? '夜深了' : hour < 9 ? '早上好' : hour < 12 ? '上午好' : hour < 14 ? '中午好' : hour < 18 ? '下午好' : '晚上好'
const todayText = (() => {
  const d = new Date()
  const week = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][d.getDay()]
  return `${d.getMonth() + 1}月${d.getDate()}日 · ${week}`
})()

const priorityType = (p: FocusTask['priority']) => (p === '高' ? 'danger' : p === '中' ? 'warning' : 'info')
const priorityClass = (p: FocusTask['priority']) => (p === '高' ? 'is-high' : p === '中' ? 'is-mid' : 'is-low')
</script>

<style scoped>
/* 本站无全局 border-box reset，自建元素统一收敛盒模型（含子元素） */
.focus-page,
.focus-page * {
  box-sizing: border-box;
}

/* 单列聚焦布局：窄栏居中，天然抑制信息过载 */
.focus-page {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 20px 24px 56px;
}
.focus-page > * {
  width: min(760px, 100%);
}

/* —— 键帽 —— */
.fc-kbd {
  font-family: inherit;
  font-size: 11px;
  line-height: 1;
  padding: 3px 6px;
  border: 1px solid var(--el-border-color);
  border-bottom-width: 2px;
  border-radius: 4px;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
}
.fc-kbd--ghost {
  border-color: transparent;
  background: rgba(255, 255, 255, 0.18);
  color: inherit;
}

/* —— 极简顶条 —— */
.fc-top {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
}
.fc-top__title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.fc-top__sub {
  margin: 6px 0 0;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
.fc-top__ops {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.fc-icon-btn {
  width: 30px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 50%;
  background: var(--el-bg-color);
  color: var(--el-text-color-secondary);
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
}
.fc-icon-btn:hover {
  color: var(--el-color-primary);
  border-color: var(--el-color-primary-light-5);
}
.fc-zen-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 30px;
  padding: 0 12px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 15px;
  background: var(--el-bg-color);
  color: var(--el-text-color-regular);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
}
.fc-zen-btn:hover {
  color: var(--el-color-primary);
  border-color: var(--el-color-primary-light-5);
}
.fc-zen-btn.is-on {
  color: var(--el-color-primary);
  border-color: var(--el-color-primary-light-5);
  background: var(--el-color-primary-light-9);
}

/* —— 当前任务聚焦卡 —— */
.fc-card {
  border: 1px solid var(--el-border-color-extra-light);
  border-radius: 12px;
  background: var(--el-bg-color);
  padding: 24px 26px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.04);
}
.fc-card__meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.fc-card__title {
  margin: 12px 0 0;
  font-size: 24px;
  line-height: 1.35;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.fc-card__summary {
  margin: 8px 0 0;
  font-size: 14px;
  line-height: 1.7;
  color: var(--el-text-color-regular);
}

/* 渐进披露按钮：轻量文字态，与主操作拉开层级 */
.fc-disclose {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 14px;
  padding: 4px 2px;
  border: none;
  background: none;
  font-size: 13px;
  color: var(--el-text-color-secondary);
  cursor: pointer;
  transition: color 0.15s;
}
.fc-disclose:hover {
  color: var(--el-color-primary);
}
.fc-disclose__arrow {
  transition: transform 0.2s;
}
.fc-disclose__arrow.is-open {
  transform: rotate(90deg);
}
.fc-disclose__hint:empty {
  display: none;
}

/* 详情展开：grid-rows 0fr→1fr 高度动画 */
.fc-detail {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.25s ease;
}
.fc-detail.is-open {
  grid-template-rows: 1fr;
}
.fc-detail__inner {
  overflow: hidden;
}
.fc-checklist {
  list-style: none;
  margin: 14px 0 0;
  padding: 14px 16px;
  border-radius: 8px;
  background: var(--el-fill-color-lighter);
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.fc-checklist__item.is-done :deep(.el-checkbox__label) {
  color: var(--el-text-color-placeholder);
  text-decoration: line-through;
}
.fc-card__note {
  margin: 10px 0 0;
  font-size: 13px;
  line-height: 1.7;
  color: var(--el-text-color-secondary);
}
.fc-card__note:empty {
  display: none;
}

/* —— 番茄钟 —— */
.fc-timer {
  margin-top: 18px;
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 16px 18px;
  border-radius: 10px;
  background: var(--el-color-primary-light-9);
  transition: background 0.3s;
}
.fc-timer.is-break {
  background: var(--el-color-success-light-9);
}
.fc-timer__ring {
  width: 96px;
  height: 96px;
  flex-shrink: 0;
}
.fc-timer__track {
  fill: none;
  stroke: var(--el-border-color-extra-light);
  stroke-width: 7;
}
.fc-timer__bar {
  fill: none;
  stroke: var(--el-color-primary);
  stroke-width: 7;
  stroke-linecap: round;
  transform: rotate(-90deg);
  transform-origin: center;
  transition: stroke-dashoffset 0.5s linear, stroke 0.3s;
}
.fc-timer.is-break .fc-timer__bar {
  stroke: var(--el-color-success);
}
.fc-timer__center {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 96px;
  pointer-events: none;
}
.fc-timer__clock {
  font-size: 22px;
  font-variant-numeric: tabular-nums;
  color: var(--el-text-color-primary);
}
.fc-timer__phase {
  margin-top: 2px;
  font-size: 11px;
  color: var(--el-text-color-secondary);
}
.fc-timer {
  position: relative;
}
.fc-timer__center {
  left: 18px;
  top: 50%;
  transform: translateY(-50%);
}
.fc-timer__ops {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}
.fc-timer__main {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 34px;
  padding: 0 16px;
  border: none;
  border-radius: 17px;
  background: var(--el-color-primary);
  color: #fff;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;
}
.fc-timer__main:hover {
  background: var(--el-color-primary-light-3);
}
.fc-timer__main:active {
  transform: scale(0.97);
}
.fc-timer__reset {
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.7);
  color: var(--el-text-color-regular);
  cursor: pointer;
  transition: color 0.15s, background 0.15s;
}
.fc-timer__reset:hover {
  color: var(--el-color-primary);
}

/* —— 当前任务操作行 —— */
.fc-card__ops {
  margin-top: 18px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.fc-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 36px;
  padding: 0 18px;
  border-radius: 18px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.15s;
}
.fc-btn--primary {
  border: none;
  background: var(--el-color-primary);
  color: #fff;
}
.fc-btn--primary:hover {
  background: var(--el-color-primary-light-3);
}
.fc-btn--plain {
  border: 1px solid var(--el-border-color-light);
  background: var(--el-bg-color);
  color: var(--el-text-color-regular);
}
.fc-btn--plain:hover {
  color: var(--el-color-primary);
  border-color: var(--el-color-primary-light-5);
}

/* —— 空状态庆祝 —— */
.fc-empty {
  border: 1px dashed var(--el-border-color-light);
  border-radius: 12px;
  padding: 46px 24px;
  text-align: center;
}
.fc-empty__medal {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 68px;
  height: 68px;
  border-radius: 50%;
  background: var(--el-color-warning-light-9);
  color: var(--el-color-warning);
}
.fc-empty__title {
  margin: 14px 0 0;
  font-size: 18px;
  color: var(--el-text-color-primary);
}
.fc-empty__desc {
  margin: 6px 0 0;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

/* —— 折叠区（渐进披露 L1） —— */
.fc-hint {
  margin-top: 4px;
}
.fc-fold {
  border: 1px solid var(--el-border-color-extra-light);
  border-radius: 10px;
  background: var(--el-bg-color);
  overflow: hidden;
}
.fc-fold__head {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border: none;
  background: none;
  font-size: 14px;
  color: var(--el-text-color-primary);
  cursor: pointer;
  transition: background 0.15s;
}
.fc-fold__head:hover {
  background: var(--el-fill-color-lighter);
}
.fc-fold__title {
  font-weight: 600;
}
.fc-fold__count {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.fc-fold__count.is-warn {
  color: var(--el-color-warning);
}
.fc-fold__arrow {
  margin-left: auto;
  color: var(--el-text-color-secondary);
  transition: transform 0.2s;
}
.fc-fold.is-open .fc-fold__arrow {
  transform: rotate(180deg);
}
.fc-fold__body {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.25s ease;
}
.fc-fold.is-open .fc-fold__body {
  grid-template-rows: 1fr;
}
.fc-fold__inner {
  list-style: none;
  overflow: hidden;
  margin: 0;
  padding: 0 16px;
}
.fc-fold.is-open .fc-fold__inner {
  padding-bottom: 12px;
}
.fc-fold__inner li {
  border-top: 1px solid var(--el-border-color-extra-light);
}
.fc-fold__inner li.fc-queue__blank {
  border-top: none;
  padding: 12px 0;
  text-align: center;
  font-size: 13px;
  color: var(--el-text-color-placeholder);
}

/* 任务队列行 */
.fc-queue__item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
}
.fc-queue__flag {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--el-border-color);
  flex-shrink: 0;
}
.fc-queue__flag.is-high { background: var(--el-color-danger); }
.fc-queue__flag.is-mid { background: var(--el-color-warning); }
.fc-queue__flag.is-low { background: var(--el-color-info-light-5); }
.fc-queue__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.fc-queue__body b {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.fc-queue__body span {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.fc-queue__pick {
  flex-shrink: 0;
  height: 26px;
  padding: 0 12px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 13px;
  background: none;
  font-size: 12px;
  color: var(--el-text-color-regular);
  cursor: pointer;
  transition: all 0.15s;
}
.fc-queue__pick:hover {
  color: var(--el-color-primary);
  border-color: var(--el-color-primary-light-5);
}

/* 审批行 */
.fc-approve__item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
}
.fc-approve__tag {
  flex-shrink: 0;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  background: var(--el-fill-color);
  color: var(--el-text-color-secondary);
}
.fc-approve__tag.is-请假 { background: var(--el-color-success-light-9); color: var(--el-color-success); }
.fc-approve__tag.is-报销 { background: var(--el-color-primary-light-9); color: var(--el-color-primary); }
.fc-approve__tag.is-采购 { background: var(--el-color-warning-light-9); color: var(--el-color-warning); }
.fc-approve__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.fc-approve__body b {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.fc-approve__body span {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.fc-approve__ops {
  flex-shrink: 0;
  display: flex;
  gap: 6px;
}
.fc-approve__btn {
  height: 26px;
  padding: 0 12px;
  border-radius: 13px;
  border: none;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
}
.fc-approve__btn.is-ok {
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}
.fc-approve__btn.is-ok:hover {
  background: var(--el-color-primary);
  color: #fff;
}
.fc-approve__btn.is-no {
  background: var(--el-fill-color);
  color: var(--el-text-color-secondary);
}
.fc-approve__btn.is-no:hover {
  background: var(--el-color-danger-light-9);
  color: var(--el-color-danger);
}

/* 引导 checklist */
.fc-guide__item {
  padding: 8px 0;
}
.fc-guide__item.is-done :deep(.el-checkbox__label) {
  color: var(--el-text-color-placeholder);
}

/* —— 撤销条（乐观更新反馈） —— */
.fc-undo {
  position: fixed;
  left: 50%;
  bottom: 28px;
  transform: translateX(-50%);
  z-index: 2100;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  border-radius: 8px;
  background: var(--el-text-color-primary);
  color: var(--el-bg-color);
  font-size: 13px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.18);
  overflow: hidden;
}
.fc-undo__btn {
  border: none;
  background: none;
  color: var(--el-color-primary-light-5);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
}
.fc-undo__btn:hover {
  color: var(--el-color-primary-light-3);
}
.fc-undo__bar {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 2px;
  background: var(--el-color-primary);
  transform-origin: left;
}
.fc-toast-enter-active,
.fc-toast-leave-active {
  transition: all 0.25s ease;
}
.fc-toast-enter-from,
.fc-toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(12px);
}

/* —— 快捷键抽屉 —— */
.fc-keys {
  list-style: none;
  margin: 0;
  padding: 0;
}
.fc-keys__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 2px;
  border-bottom: 1px solid var(--el-border-color-extra-light);
  font-size: 13px;
  color: var(--el-text-color-regular);
}
.fc-keys__note {
  margin: 14px 0 0;
  font-size: 12px;
  line-height: 1.7;
  color: var(--el-text-color-secondary);
}

/* —— 专注模式：进一步降噪 —— */
.is-zen > .fc-top {
  padding-bottom: 4px;
}
.is-zen .fc-top__title {
  font-size: 17px;
}
</style>



