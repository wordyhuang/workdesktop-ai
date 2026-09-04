<template>
  <div class="example-page">
    <demo-block
      title="固定高度"
      desc="height 控制 iframe 高度，加载完成触发 load 事件"
      :code="code1"
    >
      <wd-iframe
        :src="demoSrc"
        height="260px"
        @load="onLoad"
      />
    </demo-block>

    <demo-block
      title="消息通信"
      desc="子页面 postMessage 透传 message 事件；约定 { type:'wd-iframe-height', height } 可自适应高度"
      :code="code2"
    >
      <wd-iframe :src="msgSrc" height="200px" @message="onMessage" />
    </demo-block>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'

const demoHtml = encodeURIComponent(
  '<html><body style="font-family:sans-serif;padding:16px"><h3>内嵌子页面</h3><p>这是通过 iframe 嵌入的内容。</p></body></html>'
)
const demoMsgHtml = encodeURIComponent(
  `<html><body style="font-family:sans-serif;padding:16px"><h3>消息通信子页</h3>
   <button onclick="parent.postMessage({type:'wd-iframe-height',height:180},'*')">上报高度 180px</button>
   </body></html>`
)

const code1 = `<wd-iframe :src="src" height="260px" @load="onLoad" />`
const code2 = `<wd-iframe :src="src" @message="onMessage" />`

const demoSrc = `data:text/html,${demoHtml}`
const msgSrc = `data:text/html,${demoMsgHtml}`

function onLoad() {
  ElMessage.success('iframe 加载完成')
}
function onMessage(data: any) {
  if (data?.type === 'wd-iframe-height') {
    ElMessage.info(`收到高度上报：${data.height}px`)
  }
}
</script>

<style scoped>
.example-page {
  width: 100%;
}
</style>
