<template>
  <div class="example-page">
    <demo-block
      title="后端返回标准（响应格式约定）"
      desc="WorkDesktop 约定后端统一返回 { code, message, data }；列表接口 data 为 { list, total, pageSize, currentPage }。成功判定：code &gt;= response.successCode（默认 0）。字段名均可通过全局配置覆盖"
      :code="code5"
    >
      <el-table :data="responseStdRows" border size="small" style="width: 100%">
        <el-table-column prop="field" label="字段" width="150" />
        <el-table-column prop="type" label="类型" width="140" />
        <el-table-column prop="desc" label="说明" />
      </el-table>
      <div style="margin-top: 12px; font-size: 13px; line-height: 1.8">
        <p><b>成功判定规则：</b></p>
        <ul style="margin: 0; padding-left: 20px">
          <li>code 未返回或非数字 → 视为成功（兼容非标准响应）</li>
          <li><code>code &gt;= response.successCode</code>（默认 0）→ 成功，进入 <code>api-success</code></li>
          <li>否则业务失败，<code>resolve(success=false)</code> 进入 <code>api-fail</code>，<b>不抛异常</b></li>
          <li>直接返回数组 / 原始值（无 code 包裹）→ 兼容按成功处理</li>
        </ul>
        <p style="margin-top: 8px">
          <b>与后端字段不一致？</b>通过全局配置改名，无需改后端：<code>response.props</code>（code/message/data）、
          <code>response.list</code>（list/total/pageSize/currentPage）、<code>request.pageParam</code>（请求分页字段）。
        </p>
      </div>
    </demo-block>

    <demo-block
      title="RequestAPI 自建实例"
      desc="RequestAPI 是本库公开的请求核心类，所有组件都基于它开发。库内置全局单例 request；也可 new RequestAPI(axiosConfig) 自建独立实例（独立 baseURL / 超时等），方法与 request 完全一致"
      :code="code0"
    >
      <div>
        <el-button type="success" plain :loading="customLoading" @click="manualCustom">new RequestAPI().get（自建实例请求）</el-button>
        <p v-if="customResult" style="margin-top: 8px">
          <el-tag :type="customResult.success ? 'success' : 'danger'" size="small">
            success: {{ customResult.success }} · total: {{ customResult.data?.total }}
          </el-tag>
        </p>
      </div>
    </demo-block>

    <demo-block
      title="手动 GET 请求"
      desc="request 是全局单例（所有组件共享的请求核心）。request.get(url, params?, reqOptions?) 返回 Promise&lt;ApiResult&gt;，自动加 urlPrefix、loading、提示、解封响应"
      :code="code1"
    >
      <div>
        <el-button type="success" :loading="getLoading" @click="manualGet">GET /user/list（第 1 页 5 条）</el-button>
        <div v-if="getResult" style="margin-top: 12px">
          <el-tag :type="getResult.success ? 'success' : 'danger'" size="small">
            success: {{ getResult.success }}
          </el-tag>
          <el-tag size="small" style="margin-left: 8px">total: {{ getResult.data?.total }}</el-tag>
          <ul style="margin: 8px 0 0; padding-left: 20px; font-size: 13px; color: #606266">
            <li v-for="u in (getResult.data?.list || []).slice(0, 3)" :key="u.id">
              {{ u.id }} · {{ u.name }} · {{ u.dept }}
            </li>
          </ul>
        </div>
      </div>
    </demo-block>

    <demo-block
      title="手动 POST / DELETE 请求"
      desc="request.post(url, data?, reqOptions?) 提交数据；request.delete(url, params?) 删除。业务失败 resolve(success=false)，不抛异常"
      :code="code2"
    >
      <div>
        <el-button type="primary" :loading="postLoading" @click="manualPost">POST /user/save（新增）</el-button>
        <p v-if="postResult" style="margin-top: 8px">
          <el-tag :type="postResult.success ? 'success' : 'danger'" size="small">
            {{ postResult.success ? '新增成功' : '失败：' + postResult.message }}
          </el-tag>
        </p>
      </div>
    </demo-block>

    <demo-block
      title="ApiResult 结构"
      desc="所有请求方法返回 Promise&lt;ApiResult&gt;，业务失败不 reject（success=false），仅网络异常 reject"
      :code="code7"
    >
      <el-table :data="apiResultRows" border size="small" style="width: 100%">
        <el-table-column prop="field" label="字段" width="120" />
        <el-table-column prop="type" label="类型" width="140" />
        <el-table-column prop="desc" label="说明" />
      </el-table>
    </demo-block>

    <demo-block
      title="响应解封演示"
      desc="点击请求，对照查看「后端原始响应」与「解封后的 ApiResult」——库自动从 { code, message, data } 提取字段并判定 success"
      :code="code6"
    >
      <div>
        <el-button type="primary" :loading="unpackLoading" @click="manualUnpack">GET /user/list（解封演示）</el-button>
        <div v-if="unpackResult" style="margin-top: 12px; display: flex; gap: 16px; flex-wrap: wrap">
          <div style="flex: 1; min-width: 280px">
            <p><b>后端原始响应（result.raw）</b></p>
            <pre style="background:#f5f7fa; padding:8px; border-radius:4px; font-size:12px; margin:0">{{ pretty(rawBody) }}</pre>
          </div>
          <div style="flex: 1; min-width: 280px">
            <p><b>解封后的 ApiResult</b></p>
            <pre style="background:#f5f7fa; padding:8px; border-radius:4px; font-size:12px; margin:0">{{ pretty(unpackResult) }}</pre>
          </div>
        </div>
      </div>
    </demo-block>

    <demo-block
      title="声明式 useRequest"
      desc="useRequest(api, options) 绑定接口与请求策略，返回 { data, loading, error, run, refresh, abort }，适合在组件内声明式管理请求状态"
      :code="code3"
    >
      <div>
        <el-button type="warning" :loading="loading" @click="run({ currentPage: 1, pageSize: 5 })">
          {{ data ? '重新加载' : '加载用户列表' }}
        </el-button>
        <el-tag v-if="loading" size="small" type="warning" style="margin-left: 8px">加载中...</el-tag>
        <ul v-if="data" style="margin: 8px 0 0; padding-left: 20px; font-size: 13px; color: #606266">
          <li v-for="u in data.list.slice(0, 3)" :key="u.id">{{ u.id }} · {{ u.name }} · {{ u.dept }}</li>
        </ul>
      </div>
    </demo-block>

    <demo-block
      title="请求事件监听"
      desc="request.on(handler) 订阅 apiBefore / apiSuccess / apiFail / apiException / apiAfter 事件，返回取消订阅函数"
      :code="code4"
    >
      <div>
        <el-button type="info" plain :loading="eventLoading" @click="fireEvent">触发一次请求并观察事件</el-button>
        <div style="margin-top: 8px; font-size: 12px; color: #909399; white-space: pre-wrap">
          {{ eventLog || '（暂无事件，点击按钮触发）' }}
        </div>
      </div>
    </demo-block>
  </div>
</template>

<script setup lang="ts">
import { onUnmounted, ref } from 'vue'
import { RequestAPI, request, useRequest, type ApiResult } from '../../../src'

// ---- RequestAPI 自建实例 ----
const customApi = new RequestAPI()
const customLoading = ref(false)
const customResult = ref<ApiResult<{ list: any[]; total: number }> | null>(null)

const manualCustom = async () => {
  customLoading.value = true
  try {
    customResult.value = await customApi.get('/user/list', { currentPage: 1, pageSize: 5 })
  } finally {
    customLoading.value = false
  }
}

// ---- 手动请求 ----
const getLoading = ref(false)
const getResult = ref<ApiResult<{ list: any[]; total: number }> | null>(null)

const manualGet = async () => {
  getLoading.value = true
  try {
    getResult.value = await request.get('/user/list', { currentPage: 1, pageSize: 5 })
  } finally {
    getLoading.value = false
  }
}

const postLoading = ref(false)
const postResult = ref<ApiResult | null>(null)

const manualPost = async () => {
  postLoading.value = true
  try {
    postResult.value = await request.post('/user/save', {
      name: '手动新增用户',
      dept: '技术部',
      role: 2,
      status: 1
    })
  } finally {
    postLoading.value = false
  }
}

// ---- 声明式 useRequest ----
const { data, loading, run } = useRequest<{ list: any[]; total: number }>('/user/list', {
  method: 'get',
  immediate: false
})

// ---- 事件监听 ----
const eventLoading = ref(false)
const eventLog = ref('')

const off = request.on((payload) => {
  eventLog.value = `${new Date().toLocaleTimeString()} [${payload.type}] url=${payload.url || '-'} code=${payload.code ?? '-'} msg=${payload.message || '-'}\n${eventLog.value}`
})

const fireEvent = async () => {
  eventLoading.value = true
  try {
    await request.get('/user/list', { currentPage: 1, pageSize: 3 })
  } finally {
    eventLoading.value = false
  }
}

onUnmounted(off)

// ---- 响应解封演示 ----
const unpackLoading = ref(false)
const unpackResult = ref<ApiResult | null>(null)
const rawBody = ref<any>(null)

const manualUnpack = async () => {
  unpackLoading.value = true
  try {
    const res = await request.get('/user/list', { currentPage: 1, pageSize: 2 })
    unpackResult.value = res
    rawBody.value = res.raw
  } finally {
    unpackLoading.value = false
  }
}

function pretty(o: any) {
  try {
    return JSON.stringify(o, null, 2)
  } catch {
    return String(o)
  }
}

// ---- 文档表格 ----
const responseStdRows = [
  { field: 'code', type: 'number|string', desc: '状态码。code >= successCode（默认 0）视为成功；可配 response.successCode' },
  { field: 'message', type: 'string', desc: '提示消息（成功/失败提示文案来源）' },
  { field: 'data', type: 'any', desc: '业务数据；列表接口为 { list, total, pageSize, currentPage }' },
  { field: 'data.list', type: 'array', desc: '列表数据（列表接口）' },
  { field: 'data.total', type: 'number', desc: '总条数（列表接口，分页用）' },
  { field: 'data.pageSize', type: 'number', desc: '每页条数（列表接口，回显用）' },
  { field: 'data.currentPage', type: 'number', desc: '当前页码（列表接口，回显用）' }
]

const apiResultRows = [
  { field: 'success', type: 'boolean', desc: '是否成功（业务失败也为 false，但不 reject）' },
  { field: 'data', type: 'any', desc: '解封后的业务数据' },
  { field: 'code', type: 'number|string', desc: '响应状态码' },
  { field: 'message', type: 'string', desc: '响应消息' },
  { field: 'raw', type: 'any', desc: '原始响应体' }
]

const code7 = `<template>
  <el-table :data="apiResultRows" border size="small" style="width: 100%">
    <el-table-column prop="field" label="字段" width="120" />
    <el-table-column prop="type" label="类型" width="140" />
    <el-table-column prop="desc" label="说明" />
  </el-table>
</template>

<script>
// ApiResult：所有请求方法返回 Promise<ApiResult>（业务失败不 reject，仅网络异常 reject）
// interface ApiResult<T = any> {
//   success: boolean        // 是否成功（业务失败也为 false，但不 reject）
//   data: T | null          // 解封后的业务数据
//   code?: number | string  // 响应状态码
//   message?: string        // 响应消息
//   raw?: any               // 原始响应体
// }
//
// 业务失败用 success 分支判断：
// const result = await request.get('/user/list')
// if (result.success) { console.log(result.data) }
// else { console.error(result.message) }

const apiResultRows = [
  { field: 'success', type: 'boolean', desc: '是否成功（业务失败也为 false，但不 reject）' },
  { field: 'data', type: 'any', desc: '解封后的业务数据' },
  { field: 'code', type: 'number|string', desc: '响应状态码' },
  { field: 'message', type: 'string', desc: '响应消息' },
  { field: 'raw', type: 'any', desc: '原始响应体' }
]
<\/script>`

const code0 = `import { RequestAPI } from 'workdesktop-ai'

// RequestAPI 是本库公开的请求核心类，所有组件都基于它开发
// 库内置全局单例 request；也可自建独立实例（可传 axios 配置）
const customApi = new RequestAPI({ baseURL: '/other-api', timeout: 20000 })

// 方法与全局单例完全一致：get/post/put/delete/request
const result = await customApi.get('/user/list', { currentPage: 1, pageSize: 5 })
// result: { success, data, code, message, raw }`

const code1 = `import { request } from 'workdesktop-ai'

// request.get(url, params?, reqOptions?)
const result = await request.get('/user/list', {
  currentPage: 1,
  pageSize: 5
})
// result: { success, data, code, message, raw }
if (result.success) {
  console.log(result.data.list, result.data.total)
}`

const code2 = `// POST 提交
const r1 = await request.post('/user/save', {
  name: '张三', dept: '技术部', role: 2, status: 1
})
if (!r1.success) {
  // 业务失败（如后端返回 code != 0），已 resolve，不会抛异常
  console.warn(r1.message)
}

// DELETE 删除
const r2 = await request.delete('/user', { id: 12 })`

const code3 = `import { useRequest } from 'workdesktop-ai'

// 声明式：绑定接口 + 策略，返回响应式状态与方法
const { data, loading, error, run, refresh, abort } = useRequest('/user/list', {
  method: 'get',
  immediate: false,   // 不自动请求，点击后 run()
})

// run(params) 手动请求；refresh() 用上次参数重发；abort() 中断
await run({ currentPage: 1, pageSize: 5 })`

const code4 = `import { request } from 'workdesktop-ai'

// 订阅全局请求事件，返回取消订阅函数
const off = request.on((payload) => {
  // payload.type: apiBefore/apiSuccess/apiFail/apiException/apiAfter
  console.log(payload.type, payload.url, payload.code, payload.message)
})

// 组件卸载时取消订阅
onUnmounted(off)`

const code5 = `<template>
  <el-table :data="responseStdRows" border size="small" style="width: 100%">
    <el-table-column prop="field" label="字段" width="150" />
    <el-table-column prop="type" label="类型" width="140" />
    <el-table-column prop="desc" label="说明" />
  </el-table>

  <div style="margin-top: 12px; font-size: 13px; line-height: 1.8">
    <p><b>成功判定规则：</b></p>
    <ul style="margin: 0; padding-left: 20px">
      <li>code 未返回或非数字 → 视为成功（兼容非标准响应）</li>
      <li><code>code &gt;= response.successCode</code>（默认 0）→ 成功，进入 <code>api-success</code></li>
      <li>否则业务失败，<code>resolve(success=false)</code> 进入 <code>api-fail</code>，<b>不抛异常</b></li>
      <li>直接返回数组 / 原始值（无 code 包裹）→ 兼容按成功处理</li>
    </ul>
    <p style="margin-top: 8px">
      <b>与后端字段不一致？</b>通过全局配置改名，无需改后端：<code>response.props</code>（code/message/data）、
      <code>response.list</code>（list/total/pageSize/currentPage）、<code>request.pageParam</code>（请求分页字段）。
    </p>
  </div>
</template>

<script>
// ===== 后端返回标准（约定俗成 + 可配 transform）=====
// 1. 通用响应：{ code: 0, message: 'ok', data: { ... } }
// 2. 列表响应（data 内嵌分页结构）：
//    { code: 0, message: 'ok', data: { list: [...], total: 53, pageSize: 10, currentPage: 1 } }
// 3. 成功判定：code >= response.successCode（默认 0）
//    code 未返回 / 非数字 → 按成功处理（兼容非标准响应）
// 4. 字段名与后端不一致？全局配置改名，无需改后端：
//    response.props（code/message/data）、response.list（list/total/pageSize/currentPage）、
//    request.pageParam（请求分页字段）

const responseStdRows = [
  { field: 'code', type: 'number|string', desc: '状态码。code >= successCode（默认 0）视为成功；可配 response.successCode' },
  { field: 'message', type: 'string', desc: '提示消息（成功/失败提示文案来源）' },
  { field: 'data', type: 'any', desc: '业务数据；列表接口为 { list, total, pageSize, currentPage }' },
  { field: 'data.list', type: 'array', desc: '列表数据（列表接口）' },
  { field: 'data.total', type: 'number', desc: '总条数（列表接口，分页用）' },
  { field: 'data.pageSize', type: 'number', desc: '每页条数（列表接口，回显用）' },
  { field: 'data.currentPage', type: 'number', desc: '当前页码（列表接口，回显用）' }
]
<\/script>`

const code6 = `// 解封演示：请求后同时拿到原始响应与解封结果
const result = await request.get('/user/list', { currentPage: 1, pageSize: 2 })

// result.raw         → 后端原始响应体 { code, message, data }
// result.success     → code >= 0 为 true
// result.code        → 后端 code
// result.message     → 后端 message
// result.data        → 解封后的业务数据（data 字段）
// result.data.list / result.data.total → 列表数据与总条数`
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
