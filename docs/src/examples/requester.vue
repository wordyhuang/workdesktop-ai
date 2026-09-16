<template>
  <div class="example-page">
    <unpack-note>
      该组件不解析 <code>data</code> 内部结构，请求完成后把整个 ApiResult（含 <code>success</code> / <code>data</code> / <code>code</code> / <code>message</code>）原样通过事件抛出：成功 <code>api-success</code>、业务失败 <code>api-fail</code>、异常 <code>api-exception</code>；其中 <code>data</code> 即后端返回的业务数据本体。
    </unpack-note>
    <demo-block
      title="基本用法"
      desc="v-model 为一次性触发开关：true 发起请求，请求完成（成功/失败/异常）后自动回 false。完全封装请求核心 RequestAPI，支持 get/post/put/delete；url/params 为业务参数、实时读取，method 与 reqOptions 可通过全局配置设默认值（见下方「全局配置覆盖默认值」）"
      :code="code1"
    >
      <div>
        <el-button type="success" @click="trigger = true">GET /user/list（第 1 页 5 条）</el-button>
        <el-tag v-if="result" :type="result.success ? 'success' : 'danger'" size="small" style="margin-left: 8px">
          {{ result.success ? '成功 total=' + result.data.total : '失败：' + result.message }}
        </el-tag>
        <ul v-if="result && result.success" style="margin: 8px 0 0; padding-left: 20px; font-size: 13px; color: #606266">
          <li v-for="u in result.data.list.slice(0, 3)" :key="u.id">{{ u.id }} · {{ u.name }} · {{ u.dept }}</li>
        </ul>

        <wd-requester
          v-model="trigger"
          url="/user/list"
          method="get"
          :params="{ currentPage: 1, pageSize: 5 }"
          @api-success="onSuccess"
          @api-fail="onFail"
        />
      </div>
    </demo-block>

    <demo-block
      title="一次性开关：提交后自动复位"
      desc="触发开关在请求完成后自动置 false，开发者无需手动复位；再次提交只需把开关置 true。页面同步展示 submitTrigger 当前值，可见请求结束后已自动回到 false"
      :code="code2"
    >
      <div>
        <el-button type="primary" :loading="submitTrigger" @click="submitTrigger = true">
          POST /user/save（新增）
        </el-button>
        <p style="margin-top: 8px">
          触发开关（submitTrigger）当前为：<b>{{ submitTrigger }}</b>（请求完成后自动回 false）
        </p>
        <wd-requester
          v-model="submitTrigger"
          url="/user/save"
          method="post"
          :params="{ name: 'Requester 新增', dept: '技术部', role: 2, status: 1 }"
          @api-success="onSubmitSuccess"
        />
      </div>
    </demo-block>

    <demo-block
      title="在 apiBefore 中手动中断"
      desc="api-before 事件携带 abort 函数（参数名可自定义），可在请求发出前中断本次请求——常用于二次确认、权限拦截等场景；中断后同样会触发 api-after 并将开关复位为 false"
      :code="code3"
    >
      <div>
        <el-button type="warning" @click="cancelTrigger = true">发起请求并立即中断</el-button>
        <el-tag size="small" type="info" style="margin-left: 8px">请求将在 apiBefore 中被中断</el-tag>
        <p style="margin-top: 8px">
          触发开关（cancelTrigger）当前为：<b>{{ cancelTrigger }}</b>（中断后已复位）
        </p>
        <wd-requester
          v-model="cancelTrigger"
          url="/user/list"
          method="get"
          :params="{ currentPage: 1, pageSize: 3 }"
          @api-before="onApiBefore"
          @api-after="onApiAfter"
        />
      </div>
    </demo-block>

    <demo-block
      title="全局配置覆盖默认值"
      desc="Requester 支持三级配置（默认层 → 全局层 → 本地 props）。method、reqOptions 的默认值可在 page.componentDefault.WdRequester 中全局设置，未显式传 props 的实例自动生效；本地 props 优先级最高。配置在组件挂载时读取一次，运行中修改只影响之后新挂载的组件"
      :code="code4"
    >
      <el-table :data="configRows" border size="small" style="width: 100%">
        <el-table-column prop="prop" label="可配置 prop" width="140" />
        <el-table-column prop="default" label="默认值" width="120" />
        <el-table-column prop="desc" label="说明" />
      </el-table>
    </demo-block>

    <demo-block
      title="完整请求事件流"
      desc="组件全周期事件：api-before → api-success / api-fail / api-exception → api-after。下面用日志展示两种场景：正常请求与在 apiBefore 中手动中断；被新请求替换的旧请求不会触发任何事件（静默中断）"
      :code="code5"
    >
      <div>
        <el-button type="success" plain @click="eventTrigger = true">正常请求</el-button>
        <el-button type="warning" plain @click="abortEventTrigger = true">发起后在 apiBefore 中断</el-button>
        <el-tag size="small" type="info" style="margin-left: 8px">开关：{{ eventTrigger || abortEventTrigger }}</el-tag>
        <div style="margin-top: 8px; font-size: 12px; color: #909399; white-space: pre-wrap; line-height: 1.7">
          {{ eventLog || '（暂无事件，点击上方按钮触发）' }}
        </div>

        <wd-requester
          v-model="eventTrigger"
          url="/user/list"
          method="get"
          :params="{ currentPage: 1, pageSize: 3 }"
          @api-before="onEventBefore('normal')"
          @api-success="onEventSuccess"
          @api-after="onEventAfter"
        />
        <wd-requester
          v-model="abortEventTrigger"
          url="/user/list"
          method="get"
          :params="{ currentPage: 1, pageSize: 3 }"
          @api-before="onEventBefore('abort')"
          @api-after="onEventAfter"
        />
      </div>
    </demo-block>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { ApiResult } from '../../../src'

const trigger = ref(false)
const submitTrigger = ref(false)
const cancelTrigger = ref(false)
const result = ref<ApiResult<{ list: any[]; total: number }> | null>(null)

function onSuccess(res: any) {
  result.value = res
}

function onFail(res: ApiResult) {
  result.value = res
}

function onSubmitSuccess(res: ApiResult) {
  ElMessage.success(res.success ? '新增成功' : '新增失败：' + res.message)
}

function onApiBefore(abort: () => void) {
  // 演示：请求发出前直接中断（可在确认弹窗取消时调用 abort()）
  abort()
  ElMessage.info('请求已在 apiBefore 中被中断')
}

function onApiAfter() {
  ElMessage.info('请求已结束（成功/失败/中断均触发 api-after）')
}

// ---- 完整事件流 ----
const eventTrigger = ref(false)
const abortEventTrigger = ref(false)
const eventLog = ref('')

const onEventBefore = (scenario: 'normal' | 'abort') => (abort: () => void) => {
  eventLog.value = `${new Date().toLocaleTimeString()} [api-before] scenario=${scenario}\n${eventLog.value}`
  if (scenario === 'abort') {
    abort()
    eventLog.value = `${new Date().toLocaleTimeString()} [手动调用 abort()] 本次请求被中断\n${eventLog.value}`
  }
}

const onEventSuccess = (res: ApiResult) => {
  eventLog.value = `${new Date().toLocaleTimeString()} [api-success] success=${res.success}\n${eventLog.value}`
}

const onEventAfter = () => {
  eventLog.value = `${new Date().toLocaleTimeString()} [api-after] 请求结束，开关已复位\n${eventLog.value}`
}

// ---- 全局配置覆盖默认值说明 ----
const configRows = [
  { prop: 'method', default: "'post'", desc: '请求方法默认值；如全局设 get，则未传 method 的实例默认 GET' },
  { prop: 'reqOptions', default: '{}', desc: '请求选项默认值（showLoading/showTips/tipsConfig/axiosConfig）；如全局设 showTips:false 统一关闭提示' }
]

const code1 = `<wd-requester
  v-model="trigger"
  url="/user/list"
  method="get"
  :params="{ currentPage: 1, pageSize: 5 }"
  @api-success="onSuccess"
  @api-fail="onFail"
/>
<el-button @click="trigger = true">发起请求</el-button>

<script setup>
import { ref } from 'vue'
const trigger = ref(false)  // true 发起，完成后自动回 false
<\/script>`

const code2 = `<wd-requester
  v-model="submitTrigger"
  url="/user/save"
  method="post"
  :params="{ name: '张三' }"
  @api-success="onSubmitSuccess"
/>
<el-button @click="submitTrigger = true">提交</el-button>

<script setup>
import { ref } from 'vue'
const submitTrigger = ref(false)
// 请求完成后 v-model 自动回 false，无需手动复位
<\/script>`

const code3 = `<wd-requester
  v-model="cancelTrigger"
  url="/user/list"
  method="get"
  @api-before="onApiBefore"
/>
<el-button @click="cancelTrigger = true">发起请求</el-button>

<script setup>
function onApiBefore(abort) {
  // 二次确认：取消则中断本次请求（中断后开关同样复位为 false）
  if (!confirm('确认继续？')) abort()
}
<\/script>`

const code4 = `// npm 项目：app.use 第二参
app.use(WorkDesktop, {
  page: {
    componentDefault: {
      WdRequester: {
        method: 'get',                 // 未显式传 method 的实例默认 GET
        reqOptions: { showTips: false } // 统一关闭请求提示
      }
    }
  }
})

// script 项目：window.workDesktopConfig 同理
window.workDesktopConfig = {
  page: { componentDefault: { WdRequester: { method: 'get' } } }
}

// 优先级：默认层 < 全局层（componentDefault）< 本地 props（显式传参覆盖）`

const code5 = `<wd-requester
  v-model="eventTrigger"
  url="/user/list"
  method="get"
  @api-before="(abort) => { /* 可手动 abort() */ }"
  @api-success="onSuccess"
  @api-fail="onFail"
  @api-exception="onError"
  @api-after="onAfter"
/>

// 事件时序：
// 正常：api-before → api-success/api-fail → api-after（开关复位 false）
// 中断：api-before（调 abort）→ api-after（开关复位 false）
// 替换：新请求触发时旧请求被静默中断，不触发任何事件`
</script>

<style scoped>
.example-page {
  width: 100%;
}
.example-page p {
  margin: 4px 0;
  color: var(--wd-text-color-regular, #606266);
  font-size: 13px;
}
</style>
