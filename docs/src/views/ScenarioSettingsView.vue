<template>
  <div class="settings-page">
    <!-- 顶条：标题 + AI 提示词入口 + 三步流程说明 -->
    <wd-panel class="settings-top">
      <div class="settings-top__inner">
        <div class="settings-top__main">
          <h1 class="settings-top__title">设置中心</h1>
          <p class="settings-top__sub">账户 · 安全 · 通知 · 外观，一站式个人配置</p>
        </div>
        <div class="settings-top__actions">
          <wd-api-button
            type="primary"
            label="保存更改"
            api="/settings/save"
            :api-param="saveAllParam"
            head-refresh-datagrid="settings-logs"
            @api-success="showMessage('保存成功，变更已记录')"
          />
          <ScenarioPromptButton scene="settings" title="设置中心" />
        </div>
      </div>
      <div class="settings-flow">
        <span v-for="(step, idx) in FLOW_STEPS" :key="step" class="settings-flow__step">
          <i class="settings-flow__no">{{ `0${idx + 1}` }}</i>
          <span>{{ step }}</span>
        </span>
      </div>
    </wd-panel>

    <!-- 页面顶部提示（§0.1）：功能介绍与注意事项 -->
    <wd-tips type="box" icon="InfoFilled" class="settings-tips">
      本页统一管理个人配置，修改后点击右上角「保存更改」一次性保存并自动记录变更；离开页面前请确认已保存。
    </wd-tips>

    <!-- 主体：左侧分类导航 + 右侧单页滚动分区 -->
    <div class="settings-body">
      <wd-panel class="settings-nav">
        <nav class="settings-nav__list" aria-label="设置分类导航">
          <button
            v-for="nav in NAVS"
            :key="nav.key"
            type="button"
            class="settings-nav__item"
            :class="{ 'is-active': activeNav === nav.key }"
            @click="scrollToSection(nav.key)"
          >
            <span class="settings-nav__icon" :style="{ background: nav.tint, color: nav.color }">
              <el-icon :size="15"><component :is="nav.icon" /></el-icon>
            </span>
            <span class="settings-nav__text">
              <b>{{ nav.title }}</b>
              <small>{{ nav.desc }}</small>
            </span>
          </button>
        </nav>
      </wd-panel>

      <div ref="sectionsRef" class="settings-sections">
        <!-- 01 基本设置 -->
        <section id="sec-basic" class="settings-section">
          <div class="settings-section__head">
            <span class="settings-section__icon" style="background: var(--el-color-primary-light-9); color: var(--el-color-primary)">
              <el-icon :size="16"><User /></el-icon>
            </span>
            <div>
              <h2>基本设置</h2>
              <p>头像、昵称与基础使用偏好</p>
            </div>
          </div>

          <wd-panel title="个人信息" description="展示在协作场景中的身份信息">
            <div class="settings-profile">
              <div class="settings-avatar">林</div>
              <div class="settings-profile__meta">
                <div class="settings-profile__name">
                  <b>林语鸢</b>
                  <wd-tag type="success" size="small" round>已认证</wd-tag>
                </div>
                <p>lin.yuyuan@workdesktop.cn · 产品部 · 产品经理</p>
              </div>
              <el-button text type="primary" size="small">更换头像</el-button>
            </div>
            <div class="settings-form-grid">
              <div class="settings-field">
                <label>昵称</label>
                <el-input v-model="profile.nickname" maxlength="20" show-word-limit placeholder="请输入昵称" />
              </div>
              <div class="settings-field">
                <label>个人签名</label>
                <el-input v-model="profile.bio" placeholder="一句话介绍自己" />
              </div>
            </div>
          </wd-panel>

          <wd-panel title="通用偏好" description="这些设置仅影响你自己的使用体验">
            <div class="settings-row">
              <div class="settings-row__main">
                <b>每周工作报告邮件</b>
                <small>每周一 09:00 发送上周工作摘要到你的邮箱</small>
              </div>
              <wd-switch v-model="prefs.reportEmail" />
            </div>
            <div class="settings-row">
              <div class="settings-row__main">
                <b>桌面通知</b>
                <small>收到审批、@我、任务变更时弹出桌面提醒</small>
              </div>
              <wd-switch v-model="prefs.desktopNotify" />
            </div>
          </wd-panel>
        </section>

        <!-- 02 安全与登录 -->
        <section id="sec-security" class="settings-section">
          <div class="settings-section__head">
            <span class="settings-section__icon" style="background: var(--el-color-success-light-9); color: var(--el-color-success)">
              <el-icon :size="16"><Lock /></el-icon>
            </span>
            <div>
              <h2>安全与登录</h2>
              <p>登录设备管理与最近登录记录</p>
            </div>
          </div>

          <wd-panel title="登录设备" description="发现陌生设备请立即下线">
            <div v-for="device in DEVICES" :key="device.id" class="settings-device">
              <span class="settings-device__icon">
                <el-icon :size="17"><component :is="device.icon" /></el-icon>
              </span>
              <div class="settings-device__main">
                <div class="settings-device__name">
                  <b>{{ device.name }}</b>
                  <wd-tag v-if="device.current" type="primary" size="small" round>当前设备</wd-tag>
                </div>
                <small>{{ device.place }} · {{ device.time }}</small>
              </div>
            </div>
            <template #footer>
              <div class="settings-footer settings-footer--right">
                <wd-popconfirm-button
                  label="强制下线其他设备"
                  title="确定强制下线除当前设备外的所有登录？"
                  api="/settings/sessions/revoke"
                  @api-success="showMessage('已强制下线其他设备')"
                />
              </div>
            </template>
          </wd-panel>

          <wd-panel title="登录日志" description="最近 5 次登录记录">
            <wd-data-grid
              api="/settings/login-logs"
              :active="true"
              :tools="{ refresh: true }"
              :fix="false"
              :with-index="false"
              :with-pager="false"
            >
              <el-table-column prop="time" label="时间" width="180" />
              <el-table-column prop="device" label="设备" min-width="200">
                <template #default="{ row }">
                  {{ row.device }}
                  <wd-tag :type="row.result === '登录成功' ? 'success' : 'danger'" size="small">
                    {{ row.result }}
                  </wd-tag>
                </template>
              </el-table-column>
              <el-table-column prop="ip" label="IP" width="140" />
            </wd-data-grid>
          </wd-panel>
        </section>

        <!-- 03 通知偏好 -->
        <section id="sec-notify" class="settings-section">
          <div class="settings-section__head">
            <span class="settings-section__icon" style="background: var(--el-color-warning-light-9); color: var(--el-color-warning)">
              <el-icon :size="16"><Bell /></el-icon>
            </span>
            <div>
              <h2>通知偏好</h2>
              <p>选择接收通知的渠道与消息类型</p>
            </div>
          </div>

          <wd-panel title="通知渠道" description="关闭后将不再接收对应渠道的消息">
            <div class="settings-row">
              <div class="settings-row__main">
                <b>邮件通知</b>
                <small>审批进度、任务提醒汇总发送至邮箱</small>
              </div>
              <wd-switch v-model="notify.mail" />
            </div>
            <div class="settings-row">
              <div class="settings-row__main">
                <b>短信通知</b>
                <small>仅紧急审批与安全提醒发送短信</small>
              </div>
              <wd-switch v-model="notify.sms" />
            </div>
            <div class="settings-row">
              <div class="settings-row__main">
                <b>桌面推送</b>
                <small>浏览器标签页与客户端实时推送</small>
              </div>
              <wd-switch v-model="notify.push" />
            </div>

            <div class="settings-block">
              <div class="settings-block__head">
                <b>接收类型</b>
                <small>勾选需要接收的通知类型</small>
              </div>
              <wd-checkbox-list v-model="notify.types" :data-source="NOTIFY_TYPES" button-style />
            </div>

            <div class="settings-row settings-row--vacation">
              <div class="settings-row__main">
                <b>休假自动回复</b>
                <small>休假期间自动回复审批与消息</small>
              </div>
              <wd-switch v-model="notify.vacation" />
            </div>
            <div class="settings-inline">
              <label>生效日期</label>
              <wd-date-range-picker
                v-model="notify.vacationRange"
                :disabled="!notify.vacation"
                value-format="YYYY-MM-DD"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                with-shortcut
              />
            </div>
          </wd-panel>
        </section>

        <!-- 04 外观与语言 -->
        <section id="sec-appearance" class="settings-section">
          <div class="settings-section__head">
            <span class="settings-section__icon" style="background: var(--el-color-primary-light-8); color: var(--el-color-primary)">
              <el-icon :size="16"><Brush /></el-icon>
            </span>
            <div>
              <h2>外观与语言</h2>
              <p>界面主题、语言与时区设置</p>
            </div>
          </div>

          <wd-panel title="主题与语言" description="主题跟随系统时会自动切换明暗">
            <div class="settings-block settings-block--first">
              <div class="settings-block__head">
                <b>主题模式</b>
                <small>选择界面明暗风格</small>
              </div>
              <wd-radio-list v-model="appearance.theme" :data-source="THEMES" button-style />
            </div>
            <div class="settings-form-grid settings-form-grid--appearance">
              <div class="settings-field">
                <label>界面语言</label>
                <wd-radio-list v-model="appearance.language" :data-source="LANGUAGES" button-style />
              </div>
              <div class="settings-field">
                <label>时区</label>
                <wd-select v-model="appearance.timezone" :data-source="TIMEZONES" placeholder="请选择时区" />
              </div>
            </div>
          </wd-panel>
        </section>

        <!-- 05 操作日志 -->
        <section id="sec-logs" class="settings-section">
          <div class="settings-section__head">
            <span class="settings-section__icon" style="background: var(--el-color-info-light-9); color: var(--el-color-info)">
              <el-icon :size="16"><Document /></el-icon>
            </span>
            <div>
              <h2>操作日志</h2>
              <p>配置变更记录与账号危险操作</p>
            </div>
          </div>

          <wd-panel title="变更记录" description="每次保存配置后自动写入">
            <wd-tips
              type="box"
              bg="primary"
              icon="InfoFilled"
              tips="保存任意区块的配置后，此处自动追加一条变更流水（声明式联动 head-refresh-datagrid，无需手写刷新代码）。"
            />
            <wd-data-grid
              class="settings-logs-grid"
              api="/settings/logs"
              :active="true"
              :tools="{ refresh: true }"
              :fix="false"
              :with-index="false"
              :with-pager="false"
              filter="settings-logs"
            >
              <el-table-column prop="id" label="ID" width="70" />
              <el-table-column prop="section" label="变更区块" width="120" />
              <el-table-column prop="action" label="操作说明" min-width="220" />
              <el-table-column prop="time" label="时间" width="180" />
            </wd-data-grid>
          </wd-panel>

          <wd-panel title="危险操作" description="请谨慎操作，相关行为不可撤销">
            <wd-tips
              type="box"
              icon="WarningFilled"
              color="#e6a23c"
              bg="var(--el-color-warning-light-9)"
              tips="注销账号为不可恢复操作，提交后账号数据将被清除且无法找回，请务必谨慎操作。"
            />
            <div class="settings-danger">
              <div class="settings-danger__main">
                <b>注销账号</b>
                <small>注销后你将退出所有设备，且无法继续使用该账号登录。</small>
              </div>
              <!-- §0.9 L2 强确认：不可恢复操作需输入指定文本，输入不符时 mock 返回业务失败、弹窗保留可改 -->
              <wd-prompt-button
                label="注销账号"
                type="danger"
                prompt-title="注销后账号数据将被清除且不可恢复，请输入「注销」确认"
                prompt-placeholder="请输入「注销」"
                param-key="confirmText"
                api="/settings/deactivate"
                @api-success="showMessage('注销申请已提交')"
              />
            </div>
          </wd-panel>
        </section>
      </div>
    </div>

    <p class="settings-footnote">以上为演示数据：保存仅写入本站 mock 内存，不会产生真实配置变更。</p>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import {
  Bell,
  Brush,
  Document,
  Iphone,
  Lock,
  Monitor,
  User
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import ScenarioPromptButton from '../components/ScenarioPromptButton.vue'

interface NavItem {
  key: string
  title: string
  desc: string
  icon: any
  tint: string
  color: string
}

/** 左侧分类导航（key 与分区 id 一一对应：sec-{key}） */
const NAVS: NavItem[] = [
  {
    key: 'basic',
    title: '基本设置',
    desc: '资料与通用偏好',
    icon: User,
    tint: 'var(--el-color-primary-light-9)',
    color: 'var(--el-color-primary)'
  },
  {
    key: 'security',
    title: '安全与登录',
    desc: '设备与登录记录',
    icon: Lock,
    tint: 'var(--el-color-success-light-9)',
    color: 'var(--el-color-success)'
  },
  {
    key: 'notify',
    title: '通知偏好',
    desc: '渠道与接收类型',
    icon: Bell,
    tint: 'var(--el-color-warning-light-9)',
    color: 'var(--el-color-warning)'
  },
  {
    key: 'appearance',
    title: '外观与语言',
    desc: '主题、语言与时区',
    icon: Brush,
    tint: 'var(--el-color-primary-light-8)',
    color: 'var(--el-color-primary)'
  },
  {
    key: 'logs',
    title: '操作日志',
    desc: '变更流水与危险操作',
    icon: Document,
    tint: 'var(--el-color-info-light-9)',
    color: 'var(--el-color-info)'
  }
]

const FLOW_STEPS = ['左侧分类导航', '单页滚动分区', '保存后自动记录变更']

const THEMES = [
  { text: '跟随系统', value: 'auto' },
  { text: '浅色', value: 'light' },
  { text: '深色', value: 'dark' }
]

const LANGUAGES = [
  { text: '简体中文', value: 'zh-CN' },
  { text: 'English', value: 'en-US' },
  { text: '日本語', value: 'ja-JP' }
]

const TIMEZONES = [
  { text: '(UTC+08:00) 中国标准时间', value: 'Asia/Shanghai' },
  { text: '(UTC+09:00) 日本标准时间', value: 'Asia/Tokyo' },
  { text: '(UTC-08:00) 太平洋时间', value: 'America/Los_Angeles' }
]

const NOTIFY_TYPES = [
  { text: '审批提醒', value: 'approval' },
  { text: '任务指派', value: 'task' },
  { text: '系统公告', value: 'notice' }
]

const DEVICES = [
  {
    id: 'mac',
    name: 'MacBook Pro · Chrome',
    place: '上海 · 10.12.8.24',
    time: '当前在线',
    current: true,
    icon: Monitor
  },
  {
    id: 'iphone',
    name: 'iPhone 15 · 飞书 App',
    place: '上海 · 10.12.8.61',
    time: '最后活跃 2026-11-10 20:47',
    current: false,
    icon: Iphone
  }
]

const profile = reactive({
  nickname: '林语鸢',
  bio: '让复杂的产品变简单'
})

const prefs = reactive({
  reportEmail: true,
  desktopNotify: false
})

const notify = reactive({
  mail: true,
  sms: false,
  push: true,
  types: ['approval', 'task'],
  vacation: false,
  vacationRange: [] as string[]
})

const appearance = reactive({
  theme: 'auto',
  language: 'zh-CN',
  timezone: 'Asia/Shanghai'
})

/** 唯一保存按钮的提交参数（点击时经 getParam 读取，拿到的始终是当前值） */
const saveAllParam = computed(() => ({
  section: 'all',
  data: { ...profile, ...prefs, ...notify, ...appearance }
}))

/** 保存/危险操作成功后的轻提示（组件默认不弹成功提示，此处按大厂设置页习惯给反馈） */
function showMessage(message: string) {
  ElMessage.success(message)
}

// ---------- 左侧导航滚动定位 + 滚动高亮（仅滚动右侧设置区，页面本身不动） ----------
const activeNav = ref(NAVS[0].key)
const sectionsRef = ref<HTMLElement | null>(null)

function scrollToSection(key: string) {
  activeNav.value = key
  const container = sectionsRef.value
  const section = document.getElementById(`sec-${key}`)
  if (!container || !section) return
  // 内容区可独立滚动时只滚内容区；窄屏（单列、内容区不滚动）回退为页面定位
  if (container.scrollHeight > container.clientHeight + 1) {
    container.scrollTo({ top: section.offsetTop, behavior: 'smooth' })
  } else {
    section.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

function onContentScroll() {
  const container = sectionsRef.value
  if (!container) return
  const base = container.getBoundingClientRect().top
  let current = NAVS[0].key
  for (const nav of NAVS) {
    const section = document.getElementById(`sec-${nav.key}`)
    if (!section) continue
    if (section.getBoundingClientRect().top - base <= 40) current = nav.key
  }
  activeNav.value = current
}

onMounted(() => {
  sectionsRef.value?.addEventListener('scroll', onContentScroll, { passive: true })
  nextTick(onContentScroll)
})

onBeforeUnmount(() => {
  sectionsRef.value?.removeEventListener('scroll', onContentScroll)
})
</script>

<style scoped>
.settings-page {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
  max-width: 1280px;
  margin: 0 auto;
}

/* 页面顶部提示（box 横幅）与上下容器的间距 */
.settings-tips {
  margin: 10px 0 8px;
}

.settings-page *,
.settings-page *::before,
.settings-page *::after {
  box-sizing: border-box;
}

/* ---------- 顶条 ---------- */
.settings-top__inner {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

/* 顶条右侧操作区：全局保存 + AI 提示词入口 */
.settings-top__actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: none;
}

.settings-top__title {
  margin: 0;
  font-size: 26px;
  line-height: 1.2;
  font-weight: 650;
  color: var(--el-text-color-primary);
  letter-spacing: 0.5px;
}

.settings-top__sub {
  margin: 6px 0 0;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.settings-flow {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}

.settings-flow__step {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 5px 12px 5px 6px;
  border: 1px solid var(--el-border-color-extra-light);
  border-radius: 999px;
  background: var(--el-fill-color-light);
  font-size: 12.5px;
  color: var(--el-text-color-regular);
}

.settings-flow__no {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  font-style: normal;
  font-size: 11px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

/* ---------- 两栏布局 ---------- */
.settings-body {
  display: grid;
  grid-template-columns: 236px minmax(0, 1fr);
  gap: 12px;
  align-items: stretch;
  flex: 1;
  min-height: 0;
  margin-top: 4px;
}

.settings-nav__list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.settings-nav__item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 9px 10px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  text-align: left;
  cursor: pointer;
  font-family: inherit;
  transition: background-color 0.18s ease, color 0.18s ease;
}

.settings-nav__item:hover {
  background: var(--el-fill-color-light);
}

.settings-nav__item.is-active {
  background: var(--el-color-primary-light-9);
}

.settings-nav__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  flex-shrink: 0;
}

.settings-nav__text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.settings-nav__text b {
  font-size: 13px;
  font-weight: 550;
  color: var(--el-text-color-primary);
}

.settings-nav__text small {
  font-size: 11.5px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.settings-nav__item.is-active .settings-nav__text b {
  color: var(--el-color-primary);
}

/* ---------- 分区 ---------- */
.settings-sections {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow-y: auto;
}

.settings-section {
  margin-bottom: 22px;
}

.settings-section__head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 2px 2px 10px;
}

.settings-section__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  flex-shrink: 0;
}

.settings-section__head h2 {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.settings-section__head p {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

/* ---------- 面板内容：资料 / 表单 / 开关行 ---------- */
.settings-profile {
  display: flex;
  align-items: center;
  gap: 12px;
}

.settings-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  font-size: 18px;
  font-weight: 600;
  flex-shrink: 0;
}

.settings-profile__meta {
  min-width: 0;
}

.settings-profile__name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.settings-profile__meta p {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.settings-profile > .el-button {
  margin-left: auto;
}

.settings-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--el-border-color-extra-light);
}

.settings-form-grid--appearance {
  margin-top: 14px;
}

.settings-field label {
  display: block;
  margin-bottom: 6px;
  font-size: 12.5px;
  color: var(--el-text-color-regular);
}

.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 11px 0;
}

.settings-row + .settings-row {
  border-top: 1px solid var(--el-border-color-extra-light);
}

.settings-row--vacation {
  border-top: 1px solid var(--el-border-color-extra-light);
}

.settings-row__main b {
  display: block;
  font-size: 13.5px;
  font-weight: 550;
  color: var(--el-text-color-primary);
}

.settings-row__main small {
  display: block;
  margin-top: 3px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.settings-block {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid var(--el-border-color-extra-light);
}

.settings-block--first {
  margin-top: 0;
  padding-top: 0;
  border-top: 0;
}

.settings-block__head {
  margin-bottom: 10px;
}

.settings-block__head b {
  display: block;
  font-size: 13.5px;
  font-weight: 550;
  color: var(--el-text-color-primary);
}

.settings-block__head small {
  display: block;
  margin-top: 3px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.settings-inline {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 4px;
}

.settings-inline label {
  font-size: 12.5px;
  color: var(--el-text-color-regular);
  white-space: nowrap;
}

/* ---------- 设备 / 表格 / 危险操作 ---------- */
.settings-device {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
}

.settings-device + .settings-device {
  border-top: 1px solid var(--el-border-color-extra-light);
}

.settings-device__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-regular);
  flex-shrink: 0;
}

.settings-device__name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13.5px;
  font-weight: 550;
  color: var(--el-text-color-primary);
}

.settings-device__main small {
  display: block;
  margin-top: 3px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.settings-logs-grid {
  margin-top: 12px;
}

.settings-danger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid var(--el-border-color-extra-light);
}

.settings-danger__main b {
  display: block;
  font-size: 13.5px;
  font-weight: 550;
  color: var(--el-text-color-primary);
}

.settings-danger__main small {
  display: block;
  margin-top: 3px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

/* ---------- 面板底部 ---------- */
.settings-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.settings-footer--right {
  justify-content: flex-end;
}

.settings-footnote {
  margin: 6px 2px 0;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  text-align: center;
}

/* ---------- 响应式 ---------- */
@media (max-width: 1100px) {
  /* 窄屏：恢复页面滚动，内容区不再独立滚动 */
  .settings-page {
    display: block;
    height: auto;
  }

  .settings-body {
    display: grid;
    grid-template-columns: 1fr;
    align-items: start;
    flex: none;
  }

  .settings-sections {
    overflow: visible;
  }

  .settings-nav__list {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 6px;
  }

  .settings-nav__item {
    width: auto;
    flex: 1 1 160px;
  }
}
</style>
