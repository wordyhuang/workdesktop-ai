<template>
  <div class="example-page">
    <demo-block
      title="读取全局配置"
      desc="useGlobalConfig() / getGlobalConfig() 读取当前生效的全局配置（默认层 + 全局层 merge 后的结果）"
      :code="code1"
    >
      <div>
        <p>当前全局配置关键项：</p>
        <el-descriptions :column="2" border size="small" style="max-width: 640px">
          <el-descriptions-item label="page.pager.pageSize">
            {{ config.page?.pager?.pageSize }}
          </el-descriptions-item>
          <el-descriptions-item label="request.urlPrefix">
            {{ config.request?.urlPrefix || '(空)' }}
          </el-descriptions-item>
          <el-descriptions-item label="response.successCode">
            {{ config.response?.successCode }}
          </el-descriptions-item>
          <el-descriptions-item label="response.props.codeName">
            {{ config.response?.props?.codeName }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </demo-block>

    <demo-block
      title="动态修改全局配置"
      desc="setGlobalConfig(partial) 增量合并到全局层，返回新配置；修改后新挂载的组件生效（已挂载组件在 onMounted 时读取一次并缓存）"
      :code="code2"
    >
      <div>
        <el-button type="primary" @click="changePageSize">把 pageSize 改为 15</el-button>
        <el-button @click="resetPageSize" style="margin-left: 8px">恢复默认 20</el-button>
        <p style="margin-top: 12px">
          修改后 page.pager.pageSize = <b>{{ config.page?.pager?.pageSize }}</b>
        </p>
      </div>
    </demo-block>

    <demo-block
      title="组件内合并配置 useConfig"
      desc="useConfig(componentName, props) 面向组件封装者：合并 componentDefault 全局默认与本地 props，props 中非 undefined 值覆盖默认；开发者可通过 page.componentDefault.WdDataGrid 预设组件默认值（见下方「按组件类型设置默认值」demo）"
      :code="code3"
    >
      <div>
        <p>
          <el-tag size="small" type="info" style="margin-right: 8px">WdDataGrid 默认</el-tag>
          withPager = <b>{{ cfg.withPager }}</b>，tableSize = <b>{{ cfg.tableSize }}</b>
        </p>
        <p style="font-size: 13px; color: #909399">
          演示传入了 props { withPager: false }，最终合并结果 withPager = false（props 覆盖默认）。
        </p>
      </div>
    </demo-block>

    <demo-block
      title="三级配置覆盖规则"
      desc="默认层 → 全局层 → 组件 Props"
      :code="code4"
    >
      <div style="font-size: 13px; line-height: 1.8">
        <ol style="margin: 0; padding-left: 20px">
          <li><b>默认层</b>：库内置 defaultConfig，见 src/lib/configs/default-config.ts</li>
          <li>
            <b>全局层</b>：npm 场景 app.use(WorkDesktop, config) 传入，或 script 场景
            window.workDesktopConfig 注入；运行中可用 setGlobalConfig() 增量修改
          </li>
          <li><b>组件 Props</b>：单个组件上直接设置，只影响当前组件</li>
        </ol>
      </div>
    </demo-block>

    <demo-block
      title="按组件类型设置默认值（componentDefault）"
      desc="page.componentDefault 按组件类型设置 props 默认值（如 WdRequester.method / WdDataGrid.withPager）。下方演示：全局修改 WdRequester 默认请求方法后用 :key 强制重建组件，未传 method 的实例改用新默认发起请求；配置修改只对重建/新挂载的组件生效（已挂载组件在 onMounted 时读取一次并缓存）"
      :code="code5"
    >
      <div>
        <el-button type="primary" plain @click="setRequesterGet">设为默认 GET 并重建</el-button>
        <el-button plain @click="resetRequesterPost" style="margin-left: 8px">恢复默认 POST 并重建</el-button>
        <p style="margin-top: 12px">
          当前 WdRequester 全局默认 method = <b>{{ requesterDefaultMethod }}</b>
        </p>
        <p style="margin-top: 8px">
          <el-tag size="small" type="info" style="margin-right: 8px">未传 method 的实例</el-tag>
          <el-button size="small" type="success" plain :loading="compTrigger" @click="compTrigger = true">
            用当前默认方法请求 /user/list
          </el-button>
          <el-tag
            v-if="compResult"
            :type="compResult.success ? 'success' : 'danger'"
            size="small"
            style="margin-left: 8px"
          >
            {{ compResult.success ? '请求成功（GET/POST /user/list 均有 mock）' : '请求失败：' + compResult.message }}
          </el-tag>
        </p>
        <wd-requester
          :key="compKey"
          v-model="compTrigger"
          url="/user/list"
          :params="{ currentPage: 1, pageSize: 3 }"
          @api-success="onCompSuccess"
          @api-fail="onCompFail"
        />
      </div>
    </demo-block>

    <demo-block
      title="常用全局配置项"
      desc="以下为常用配置的真实路径与默认值"
      :code="code6"
    >
      <el-table :data="configItems" border size="small" style="width: 100%">
        <el-table-column prop="path" label="配置路径" width="260" />
        <el-table-column prop="default" label="默认值" width="140" />
        <el-table-column prop="desc" label="说明" />
      </el-table>
    </demo-block>
  </div>
</template>

<script setup lang="ts">
import { shallowRef, ref, onUnmounted } from 'vue'
import { useGlobalConfig, setGlobalConfig, useConfig, getGlobalConfig } from '../../../src'
import type { ApiResult } from '../../../src'

const config = shallowRef(useGlobalConfig())

const changePageSize = () => {
  config.value = setGlobalConfig({ page: { pager: { pageSize: 15 } } })
}

const resetPageSize = () => {
  config.value = setGlobalConfig({ page: { pager: { pageSize: 20 } } })
}

// 组件内合并：componentDefault 默认 < 本地 props 覆盖
const cfg = useConfig('WdDataGrid', { withPager: false })

// ---- 按组件类型设置默认值（componentDefault） ----
const requesterDefaultMethod = ref(
  (getGlobalConfig().page?.componentDefault?.WdRequester?.method as string) || 'post'
)
const compKey = ref(0)
const compTrigger = ref(false)
const compResult = ref<ApiResult | null>(null)

const setRequesterGet = () => {
  setGlobalConfig({ page: { componentDefault: { WdRequester: { method: 'get' } } } })
  requesterDefaultMethod.value = getGlobalConfig().page.componentDefault.WdRequester.method
  compKey.value++ // 强制重建组件，使新的默认值生效
}

const resetRequesterPost = () => {
  setGlobalConfig({ page: { componentDefault: { WdRequester: { method: 'post' } } } })
  requesterDefaultMethod.value = getGlobalConfig().page.componentDefault.WdRequester.method
  compKey.value++
}

const onCompSuccess = (res: ApiResult) => {
  compResult.value = res
}

const onCompFail = (res: ApiResult) => {
  compResult.value = res
}

onUnmounted(() => {
  // 离开页面恢复默认，避免影响其他示例
  setGlobalConfig({ page: { componentDefault: { WdRequester: { method: 'post' } } } })
})

const code1 = `import { useGlobalConfig } from 'workdesktop-ai'

// 读取当前全局配置（默认层 + 全局层 merge 结果）
const config = useGlobalConfig()
console.log(config.page?.pager?.pageSize)`

const code2 = `import { setGlobalConfig } from 'workdesktop-ai'

// 增量合并，返回新配置；仅影响新挂载的组件
setGlobalConfig({ page: { pager: { pageSize: 15 } } })

// 全部重置
import { resetConfig } from 'workdesktop-ai'
resetConfig()`

const code3 = `import { useConfig } from 'workdesktop-ai'

// 组件封装者：合并 WdDataGrid 的全局默认与本地 props
const cfg = useConfig('WdDataGrid', { withPager: false })
// cfg.value.withPager === false（props 覆盖默认）`

const code4 = `// 三级配置覆盖规则：默认层 → 全局层 → 组件 Props（后者覆盖前者）

// 1. 默认层：库内置 defaultConfig（见 src/lib/configs/default-config.ts）

// 2. 全局层：npm 场景 install 时传入
createApp(App).use(WorkDesktop, {
  request: { urlPrefix: '/mock' },
  page: { pager: { pageSize: 10 } }
})
//    script 场景：window.workDesktopConfig = { request: { urlPrefix: '/mock' } }
//    运行中增量修改：setGlobalConfig({ page: { pager: { pageSize: 15 } } })

// 3. 组件 Props：单个组件上直接设置（如 with-pager="false"），只影响当前组件`

const code5 = `<template>
  <el-button type="primary" plain @click="setRequesterGet">设为默认 GET 并重建</el-button>
  <el-button plain @click="resetRequesterPost" style="margin-left: 8px">恢复默认 POST 并重建</el-button>
  <p style="margin-top: 12px">
    当前 WdRequester 全局默认 method = <b>{{ requesterDefaultMethod }}</b>
  </p>
  <p style="margin-top: 8px">
    <el-tag size="small" type="info" style="margin-right: 8px">未传 method 的实例</el-tag>
    <el-button size="small" type="success" plain :loading="compTrigger" @click="compTrigger = true">
      用当前默认方法请求 /user/list
    </el-button>
    <el-tag v-if="compResult" :type="compResult.success ? 'success' : 'danger'" size="small" style="margin-left: 8px">
      {{ compResult.success ? '请求成功' : '请求失败：' + compResult.message }}
    </el-tag>
  </p>
  <!-- :key 强制重建后，未传 method 的实例读取新的全局默认值 -->
  <wd-requester
    :key="compKey"
    v-model="compTrigger"
    url="/user/list"
    :params="{ currentPage: 1, pageSize: 3 }"
    @api-success="onCompSuccess"
    @api-fail="onCompFail"
  />
</template>

<script>
// page.componentDefault 按组件类型设置 props 默认值，init 时传入：
// app.use(WorkDesktop, {
//   page: { componentDefault: { WdRequester: { method: 'get' }, WdDataGrid: { withPager: true } } }
// })
// 运行中修改只影响重建/新挂载的组件（已挂载组件 onMounted 读取一次并缓存）；
// 组件内 useConfig('组件名', props) 合并 componentDefault 与本地 props，props 中非 undefined 值覆盖默认

import { ref } from 'vue'
import { getGlobalConfig, setGlobalConfig } from 'workdesktop-ai'

const requesterDefaultMethod = ref(getGlobalConfig().page?.componentDefault?.WdRequester?.method || 'post')
const compKey = ref(0)
const compTrigger = ref(false)
const compResult = ref(null)

const setRequesterGet = () => {
  setGlobalConfig({ page: { componentDefault: { WdRequester: { method: 'get' } } } })
  requesterDefaultMethod.value = getGlobalConfig().page.componentDefault.WdRequester.method
  compKey.value++ // 强制重建组件，使新的默认值生效
}

const resetRequesterPost = () => {
  setGlobalConfig({ page: { componentDefault: { WdRequester: { method: 'post' } } } })
  requesterDefaultMethod.value = getGlobalConfig().page.componentDefault.WdRequester.method
  compKey.value++
}

const onCompSuccess = (res) => { compResult.value = res }
const onCompFail = (res) => { compResult.value = res }
<\/script>`

const code6 = `<template>
  <el-table :data="configItems" border size="small" style="width: 100%">
    <el-table-column prop="path" label="配置路径" width="260" />
    <el-table-column prop="default" label="默认值" width="140" />
    <el-table-column prop="desc" label="说明" />
  </el-table>
</template>

<script>
// 常用全局配置项（路径与默认值）；通过 setGlobalConfig 增量修改，如：
// setGlobalConfig({
//   request: { urlPrefix: '/mock', dedup: true, axiosConfig: { timeout: 30000 } },
//   response: { props: { codeName: 'code', messageName: 'message', dataName: 'data' }, successCode: 0 },
//   page: { pager: { pageSize: 20 } }
// })

const configItems = [
  { path: 'request.urlPrefix', default: "''", desc: '请求前缀，自动拼接到相对 URL 前（如 /mock）' },
  { path: 'request.dedup', default: 'true', desc: '并发相同请求合并去重（method+url+params 一致只发一次网络）；reqOptions.dedup=false 可单次跳过' },
  { path: 'request.axiosConfig.timeout', default: '30000', desc: 'axios 超时时间（毫秒）' },
  { path: 'request.loading.enable', default: 'true', desc: '请求时是否显示全局 loading' },
  { path: 'request.transform.requestInterceptor', default: '—', desc: '请求拦截器（如注入 token）：(config) => config' },
  { path: 'request.pageParam.pageField', default: "'currentPage'", desc: '分页页码字段名' },
  { path: 'request.pageParam.sizeField', default: "'pageSize'", desc: '分页大小字段名' },
  { path: 'request.pageParam.searchField', default: "'param'", desc: '搜索条件外层字段名' },
  { path: 'response.props.codeName', default: "'code'", desc: '响应状态码字段名' },
  { path: 'response.props.messageName', default: "'message'", desc: '响应消息字段名' },
  { path: 'response.props.dataName', default: "'data'", desc: '响应数据字段名' },
  { path: 'response.successCode', default: '0', desc: '判定成功的状态码，code >= successCode 视为成功' },
  { path: 'response.list.listName', default: "'list'", desc: '列表响应中列表数据字段名' },
  { path: 'response.list.totalName', default: "'total'", desc: '列表响应中总条数字段名' },
  { path: 'response.list.pageSizeName', default: "'pageSize'", desc: '列表响应中每页条数字段名' },
  { path: 'response.list.currentPageName', default: "'currentPage'", desc: '列表响应中当前页数字段名' },
  { path: 'response.success.tipsMode', default: "'message'", desc: '成功提示呈现方式（message/notify/messagebox/none），showTips 默认 false 不提示' },
  { path: 'response.fail.tipsMode', default: "'messagebox'", desc: '业务失败（code<successCode）提示呈现方式，showTips 默认 true；title 可配弹框标题' },
  { path: 'response.fail.tipsType', default: "'error'", desc: '业务失败时的提示语义类型（success/warning/error/info）' },
  { path: 'response.exception.tipsMode', default: "'messagebox'", desc: '网络异常提示呈现方式，showTips 默认 true，弹框标题默认「网络异常」' },
  { path: 'page.pager.pageSize', default: '20', desc: 'DataGrid 默认每页条数' },
  { path: 'page.componentDefault', default: '{}', desc: '按组件类型设置 props 默认值（如 WdRequester.method / WdDataGrid.withPager）' },
  { path: 'theme.colors', default: '{}', desc: '主题色令牌覆盖（自动应用到 :root CSS 变量）' },
  { path: 'theme.cssVars', default: '{}', desc: 'CSS 变量覆盖（--wd-* / --el-*），优先级高于 colors' }
]
<\/script>`

const configItems = [
  {
    path: 'request.urlPrefix',
    default: "''",
    desc: '请求前缀，自动拼接到相对 URL 前（如 /mock）'
  },
  {
    path: 'request.dedup',
    default: 'true',
    desc: '并发相同请求合并去重（method+url+params 一致只发一次网络），如表格列内多行发起同一请求；reqOptions.dedup=false 可单次跳过'
  },
  {
    path: 'request.axiosConfig.timeout',
    default: '30000',
    desc: 'axios 超时时间（毫秒）'
  },
  {
    path: 'request.loading.enable',
    default: 'true',
    desc: '请求时是否显示全局 loading'
  },
  {
    path: 'request.transform.requestInterceptor',
    default: '—',
    desc: '请求拦截器（如注入 token）：(config) => config'
  },
  {
    path: 'request.pageParam.pageField',
    default: "'currentPage'",
    desc: '分页页码字段名'
  },
  {
    path: 'request.pageParam.sizeField',
    default: "'pageSize'",
    desc: '分页大小字段名'
  },
  {
    path: 'request.pageParam.searchField',
    default: "'param'",
    desc: '搜索条件外层字段名'
  },
  {
    path: 'response.props.codeName',
    default: "'code'",
    desc: '响应状态码字段名'
  },
  {
    path: 'response.props.messageName',
    default: "'message'",
    desc: '响应消息字段名'
  },
  {
    path: 'response.props.dataName',
    default: "'data'",
    desc: '响应数据字段名'
  },
  {
    path: 'response.successCode',
    default: '0',
    desc: '判定成功的状态码，code >= successCode 视为成功'
  },
  {
    path: 'response.list.listName',
    default: "'list'",
    desc: '列表响应中列表数据字段名'
  },
  {
    path: 'response.list.totalName',
    default: "'total'",
    desc: '列表响应中总条数字段名'
  },
  {
    path: 'response.list.pageSizeName',
    default: "'pageSize'",
    desc: '列表响应中每页条数字段名'
  },
  {
    path: 'response.list.currentPageName',
    default: "'currentPage'",
    desc: '列表响应中当前页数字段名'
  },
  {
    path: 'response.success.tipsMode',
    default: "'message'",
    desc: '成功提示呈现方式（message/notify/messagebox/none），showTips 默认 false 不提示'
  },
  {
    path: 'response.fail.tipsMode',
    default: "'messagebox'",
    desc: '业务失败（code<successCode）提示呈现方式，showTips 默认 true；title 可配弹框标题'
  },
  {
    path: 'response.fail.tipsType',
    default: "'error'",
    desc: '业务失败时的提示语义类型（success/warning/error/info）'
  },
  {
    path: 'response.exception.tipsMode',
    default: "'messagebox'",
    desc: '网络异常提示呈现方式，showTips 默认 true，弹框标题默认「网络异常」'
  },
  {
    path: 'page.pager.pageSize',
    default: '20',
    desc: 'DataGrid 默认每页条数'
  },
  {
    path: 'page.componentDefault',
    default: '{}',
    desc: '按组件类型设置 props 默认值（如 WdRequester.method / WdDataGrid.withPager）'
  },
  {
    path: 'theme.colors',
    default: '{}',
    desc: '主题色令牌覆盖（自动应用到 :root CSS 变量）'
  },
  {
    path: 'theme.cssVars',
    default: '{}',
    desc: 'CSS 变量覆盖（--wd-* / --el-*），优先级高于 colors'
  }
]
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
