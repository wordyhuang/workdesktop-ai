<template>
  <div class="example-page">
    <demo-block
      title="固定高度"
      desc="height 控制 iframe 高度（数字按 px 或任意 CSS 长度），加载完成触发 load 事件"
      :code="code1"
    >
      <wd-iframe :src="demoSrc" height="260px" @load="onLoad" />
    </demo-block>

    <demo-block
      title="双向消息通信"
      desc="基于 postMessage：子页面 parent.postMessage 上报 → 父组件 @message 透传；父组件 ref.send() 主动下发 → 子页面 message 监听接收"
      :code="code2"
    >
      <div class="row">
        <el-button size="small" @click="sendToChild">向子页面发送消息</el-button>
        <el-tag size="small" type="info">最近收到：{{ lastMessage }}</el-tag>
      </div>
      <wd-iframe
        ref="iframeRef"
        :src="demoMsgSrc"
        height="200px"
        origin="*"
        @message="onMessage"
      />
    </demo-block>

    <demo-block
      title="高度自适应"
      desc="autoHeight 开启后，子页面按约定上报 { type:'wd-iframe-height', height }，父组件自动调整 iframe 高度"
      :code="code3"
    >
      <wd-iframe :src="demoAutoHeightSrc" height="120px" auto-height @message="onMessage" />
    </demo-block>

    <demo-block
      title="重新加载"
      desc="refreshKey 变化 或 ref.refresh() 强制重新加载 iframe 内容；适合「每次显示时刷新」场景"
      :code="code4"
    >
      <div class="row">
        <el-button size="small" @click="refreshByKey">refreshKey +1（prop 方式）</el-button>
        <el-button size="small" @click="refreshByMethod">refresh()（方法方式）</el-button>
        <el-tag size="small" type="info">已加载 {{ loadCount }} 次</el-tag>
      </div>
      <wd-iframe
        ref="reloadIframeRef"
        :refresh-key="reloadKey"
        :src="demoSrc"
        height="180px"
        @load="onReloadLoad"
      />
    </demo-block>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import type WdIframe from '../../../src/components/containers/Iframe.vue'

const iframeRef = ref<InstanceType<typeof WdIframe> | null>(null)
const lastMessage = ref('—')

const demoHtml = encodeURIComponent(
  '<html><head><meta charset="UTF-8"></head><body style="font-family:sans-serif;padding:16px"><h3>内嵌子页面</h3><p>这是通过 iframe 嵌入的内容。</p></body></html>'
)

const demoMsgHtml = encodeURIComponent(
  `<html><head><meta charset="UTF-8"></head><body style="font-family:sans-serif;padding:16px"><h3>消息通信子页</h3>
   <div id="recv">等待父页面消息...</div>
   <script>
     // 子 → 父：上报
     window.addEventListener('message', function(e) {
       document.getElementById('recv').textContent = '收到父消息: ' + JSON.stringify(e.data);
     });
   <\/script>
   <button onclick="parent.postMessage({type:'custom', text:'来自子页面的问候'},'*')">向父页面发消息</button>
   </body></html>`
)

const demoAutoHeightHtml = encodeURIComponent(
  `<html><head><meta charset="UTF-8"></head><body style="font-family:sans-serif;padding:16px"><h3>高度自适应子页</h3>
   <p>点击按钮上报不同高度，父容器自动伸缩</p>
   <button onclick="parent.postMessage({type:'wd-iframe-height',height:150},'*')">高度 150px</button>
   <button onclick="parent.postMessage({type:'wd-iframe-height',height:260},'*')">高度 260px</button>
   </body></html>`
)

const code1 = `<wd-iframe :src="src" height="260px" @load="onLoad" />`

const code2 = `<wd-iframe
  ref="iframeRef"
  :src="childPage"
  height="200px"
  origin="*"
  @message="onMessage"
/>
<script>
const iframeRef = ref()
function sendToChild() {
  // 父 → 子：主动下发消息
  iframeRef.value.send({ type: 'greeting', text: '你好，子页面！' })
}
<\/script>`

const code3 = `<!-- 子页面按约定上报高度 -->
<wd-iframe :src="childPage" auto-height />
<script>
// 子页面内：
parent.postMessage({ type: 'wd-iframe-height', height: 260 }, '*')
<\/script>`

const code4 = `<!-- 方式一：refreshKey prop，值变化即重载 -->
<wd-iframe :refresh-key="reloadKey" :src="src" />
<!-- 方式二：ref.refresh() 方法 -->
<wd-iframe ref="iframeRef" :src="src" />
<script>
// 方式一：refreshKey 值变化即重载
const reloadKey = ref(0)
function onShow() {
  reloadKey.value += 1 // 每次显示时自增，强制刷新
}
// 方式二：需要时调用方法强制刷新
iframeRef.value.refresh()
<\/script>`

const demoSrc = `data:text/html;charset=utf-8,${demoHtml}`
const demoMsgSrc = `data:text/html;charset=utf-8,${demoMsgHtml}`
const demoAutoHeightSrc = `data:text/html;charset=utf-8,${demoAutoHeightHtml}`

/** 重新加载示例 */
const reloadKey = ref(0)
const loadCount = ref(0)

function onReloadLoad() {
  loadCount.value += 1
}
function refreshByKey() {
  reloadKey.value += 1
  ElMessage.info('已通过 refreshKey 触发重新加载')
}
function refreshByMethod() {
  reloadIframeRef.value?.refresh()
  ElMessage.info('已通过 refresh() 触发重新加载')
}
const reloadIframeRef = ref<InstanceType<typeof WdIframe> | null>(null)

function onLoad() {
  ElMessage.success('iframe 加载完成')
}

function onMessage(data: any) {
  if (data?.type === 'wd-iframe-height') {
    lastMessage.value = `高度上报：${data.height}px`
    ElMessage.info(lastMessage.value)
    return
  }
  lastMessage.value = JSON.stringify(data)
}

function sendToChild() {
  iframeRef.value?.send({ type: 'greeting', text: '你好，子页面！' })
  ElMessage.info('已向子页面发送消息')
}
</script>

<style scoped>
.example-page {
  width: 100%;
}
.row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
</style>
