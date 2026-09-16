<template>
  <div class="example-page">
    <demo-block title="基础用法" desc="v-model 控制显隐，方向/尺寸可配；关闭后触发 confirm 事件" :code="code1" layout="row">
      <el-button type="primary" @click="visible = true">打开抽屉</el-button>
      <el-button type="success" @click="topVisible = true">顶部抽屉</el-button>

      <wd-drawer v-model="visible" title="基础抽屉" size="40%">
        <p class="content-line">抽屉内容区域，可放置表单或任意内容。</p>
      </wd-drawer>

      <wd-drawer v-model="topVisible" title="顶部抽屉" direction="ttb" size="280px">
        <p class="content-line">direction=ttb 顶部滑出。</p>
      </wd-drawer>
    </demo-block>

    <demo-block title="对话框模式" desc="同一个 WdDrawer 组件，通过 mode=dialog 切换为对话框（默认 mode=drawer 抽屉）" :code="code2"
      layout="row">
      <el-button type="warning" @click="dialogVisible = true">打开对话框</el-button>
      <el-button type="danger" @click="confirmVisible = true">带关闭确认</el-button>

      <wd-drawer v-model="dialogVisible" mode="dialog" title="基础对话框" size="480px">
        <p class="content-line">这是对话框内容区域，支持任意插槽内容。</p>
      </wd-drawer>

      <wd-drawer v-model="confirmVisible" mode="dialog" title="关闭确认" size="420px" confirm-message="确认关闭？有未保存内容将丢失。">
        <p class="content-line">点击 X / 遮罩 / ESC 会触发关闭前确认。</p>
      </wd-drawer>
    </demo-block>

    <demo-block title="iframe 模式" desc="设置 url 属性后，容器内部自动渲染填充满整个容器的 iframe，data 参数会拼为 query 参数传递给 iframe" :code="code3"
      layout="row">
      <el-button type="primary" @click="iframeDrawerVisible = true">iframe 抽屉</el-button>
      <el-button type="warning" @click="iframeDialogVisible = true">iframe 对话框</el-button>

      <wd-drawer v-model="iframeDrawerVisible" title="内嵌页面抽屉" url="https://www.example.com"
        :data="{ token: 'demo-token', user: 123 }" size="60%" />

      <wd-drawer v-model="iframeDialogVisible" mode="dialog" title="内嵌页面对话框" url="https://www.example.com"
        size="700px" />
    </demo-block>

    <demo-block title="跨 iframe 联动（表单提交 → 关闭抽屉 + 刷新表格）"
      desc="url 模式下自动建立 postMessage 桥接：iframe 内表单上报 wd-container:submit-success 后抽屉自动关闭并刷新同组表格；修改内容触发 wd-container:dirty 自动注册未保存确认；footer 按钮通过 sendToIframe 驱动子页提交；reload-on-open 让每次打开都重新加载 iframe（本例已开启，可观察到每次打开子页重新就绪并回填）"
      :code="code4">
      <el-button type="primary" @click="linkageVisible = true">打开联动抽屉</el-button>
      <div style="height: 12px" />
      <wd-data-grid api="/user/list" :active="true" filter="iframe-demo" :with-pager="false" :with-index="true"
        style="height: 220px">
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="name" label="姓名" min-width="120" />
        <el-table-column prop="role" label="角色" width="100" />
      </wd-data-grid>

      <wd-drawer ref="linkageDrawer" v-model="linkageVisible" title="编辑用户（iframe 表单）" :url="linkageChildSrc" origin="*"
        reload-on-open :data="{ id: 1001, name: '张三' }" filter="iframe-demo" head-refresh-datagrid
        @iframe-ready="onIframeReady" @iframe-dirty="onIframeDirty" @iframe-submit-success="onIframeSubmitSuccess"
        @iframe-message="onIframeMessage">
        <template #footer="{ close }">
          <el-button @click="close">取消</el-button>
          <el-button type="primary" @click="submitFromFooter">保存（驱动子页提交）</el-button>
        </template>
      </wd-drawer>
    </demo-block>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const code1 = `<wd-drawer v-model="visible" title="基础抽屉" size="40%">
  <p>抽屉内容</p>
</wd-drawer>`

const code2 = `<wd-drawer v-model="visible" mode="dialog" title="基础对话框" size="480px">
  <p>对话框内容</p>
</wd-drawer>`

const code3 = `<!-- iframe 抽屉 -->
<wd-drawer
  v-model="visible"
  title="内嵌页面抽屉"
  url="https://www.example.com"
  :data="{ token: 'demo-token', user: 123 }"
  size="60%"
/>

<!-- iframe 对话框 -->
<wd-drawer
  v-model="visible"
  mode="dialog"
  title="内嵌页面对话框"
  url="https://www.example.com"
  size="700px"
/>`

const code4 = `<template>
  <el-button type="primary" @click="linkageVisible = true">打开联动抽屉</el-button>

  <!-- 同 filter 分组表格：iframe 提交成功后自动刷新（head-refresh-datagrid） -->
  <wd-data-grid api="/user/list" :active="true" filter="iframe-demo" :with-pager="false" :with-index="true"
    style="height: 220px">
    <el-table-column prop="id" label="ID" width="70" />
    <el-table-column prop="name" label="姓名" min-width="120" />
    <el-table-column prop="role" label="角色" width="100" />
  </wd-data-grid>

  <wd-drawer
    ref="linkageDrawer"
    v-model="linkageVisible"
    title="编辑用户（iframe 表单）"
    :url="linkageChildSrc"
    origin="*"
    reload-on-open
    :data="{ id: 1001, name: '张三' }"
    filter="iframe-demo"
    head-refresh-datagrid
    @iframe-ready="onIframeReady"
    @iframe-dirty="onIframeDirty"
    @iframe-submit-success="onIframeSubmitSuccess"
  >
    <template #footer="{ close }">
      <el-button @click="close">取消</el-button>
      <el-button type="primary" @click="submitFromFooter">保存（驱动子页提交）</el-button>
    </template>
  </wd-drawer>
</template>

<script>
// url 模式自动建立 postMessage 桥接；iframe 子页面协议（wd-container:*）：
//   子页就绪     → { type: 'wd-container:ready' }（父级收到后自动下发 :data 数据）
//   父级下发     → 子页监听 'wd-container:init'，取 payload.data 回填表单
//   父级驱动提交 → 子页监听 'wd-container:submit' 后自行提交
//   子页上报脏   → { type: 'wd-container:dirty', payload: { dirty: true } }（父级自动注册未保存确认）
//   关闭前确认   → 父级发 'wd-container:dirty-confirm'，子页回 'wd-container:dirty-confirm-response'
//                  （带 requestId、payload.allowClose）
//   子页提交成功 → { type: 'wd-container:submit-success' }（父级自动关闭抽屉并刷新同组表格）
// 本例 linkageChildSrc 为演示用 data: URL 子页面，生产环境替换为独立表单页地址；
// reload-on-open 让每次打开都重新加载 iframe（默认 false 保留上次内容）

import { ref } from 'vue'

const linkageVisible = ref(false)
const linkageDrawer = ref()

function onIframeReady() { /* iframe 就绪，已自动下发数据 */ }
function onIframeDirty({ dirty }) { /* dirty=true 时已注册未保存守卫 */ }
function onIframeSubmitSuccess() { /* 抽屉已自动关闭，表格已自动刷新 */ }

function submitFromFooter() {
  // footer 按钮 → 驱动 iframe 内表单提交（子页监听 wd-container:submit 后自行提交）
  linkageDrawer.value?.sendToIframe('wd-container:submit')
}
<\/script>`

const visible = ref(false)
const topVisible = ref(false)
const dialogVisible = ref(false)
const confirmVisible = ref(false)
const iframeDrawerVisible = ref(false)
const iframeDialogVisible = ref(false)
const linkageVisible = ref(false)

/** iframe 子页面：演示 wd-container:* 协议（data: URL 仅用于演示，生产为独立页面） */
const linkageChildHtml = encodeURIComponent(
  `<html><head><meta charset="UTF-8"></head><body style="font-family:sans-serif;padding:16px">
    <h3>iframe 表单</h3>
    <div id="form">
      <p>ID：<b id="fid">—</b></p>
      <p>姓名：<b id="fname">—</b></p>
    </div>
    <div id="log" style="font-size:12px;color:#909399"></div>
    <script>
      var isDirty = false;
      function log(t) { document.getElementById('log').textContent = t; }
      // 就绪：请求父级下发数据
      parent.postMessage({ type: 'wd-container:ready' }, '*');
      window.addEventListener('message', function (e) {
        var d = e.data || {};
        if (d.type === 'wd-container:init') {
          var data = (d.payload && d.payload.data) || {};
          document.getElementById('fid').textContent = data.id;
          document.getElementById('fname').textContent = data.name;
          log('收到父级数据并回填');
        }
        if (d.type === 'wd-container:submit') {
          doSubmit();
        }
        if (d.type === 'wd-container:dirty-confirm') {
          var allow = !isDirty || confirm('有未保存修改，确定关闭？');
          parent.postMessage({
            type: 'wd-container:dirty-confirm-response',
            requestId: d.requestId,
            payload: { allowClose: allow }
          }, '*');
        }
      });
      // 修改姓名 → 上报脏状态（父级自动注册未保存守卫）
      function onChange() {
        isDirty = true;
        parent.postMessage({ type: 'wd-container:dirty', payload: { dirty: true } }, '*');
        log('已上报脏状态，关闭前会确认');
      }
      // 提交成功 → 父级自动关闭抽屉并刷新表格
      function doSubmit() {
        isDirty = false;
        parent.postMessage({ type: 'wd-container:submit-success' }, '*');
      }
    <\/script>
    <button onclick="onChange()">修改（标记脏）</button>
    <button onclick="doSubmit()">子页内提交</button>
  </body></html>`
)

const linkageChildSrc = `data:text/html;charset=utf-8,${linkageChildHtml}`

const linkageDrawer = ref<{ sendToIframe: (type: string, payload?: any) => void } | null>(null)

function onIframeReady() {
  ElMessage.info('iframe 就绪，已自动下发数据')
}
function onIframeDirty({ dirty }: any) {
  ElMessage.info(dirty ? 'iframe 有未保存修改（已注册守卫）' : 'iframe 已保存')
}
function onIframeSubmitSuccess() {
  ElMessage.success('iframe 提交成功：抽屉已关闭，表格已刷新')
}
function onIframeMessage(data: any) {
  // 未识别的协议消息也可统一监听
  console.log('[iframe-message]', data)
}
function submitFromFooter() {
  // footer 按钮 → 驱动 iframe 内表单提交（子页监听 wd-container:submit 后自行提交）
  linkageDrawer.value?.sendToIframe('wd-container:submit')
  ElMessage.info('已向 iframe 发送提交指令')
}
</script>

<style scoped>
.example-page {
  width: 100%;
}

.content-line {
  color: #606266;
  margin: 8px 0;
}
</style>
