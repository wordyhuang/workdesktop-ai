<template>
  <div class="code-block">
    <div class="code-block__bar">
      <span class="code-block__lang">{{ lang }}</span>
      <el-button link size="small" @click="copy">
        <el-icon><DocumentCopy /></el-icon>
        {{ copied ? '已复制' : '复制' }}
      </el-button>
    </div>
    <pre class="code-block__pre"><code>{{ code }}</code></pre>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { DocumentCopy } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const props = withDefaults(
  defineProps<{
    code: string
    lang?: string
  }>(),
  { lang: 'vue' }
)

const copied = ref(false)

async function copy() {
  try {
    await navigator.clipboard.writeText(props.code)
  } catch {
    const ta = document.createElement('textarea')
    ta.value = props.code
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
  }
  copied.value = true
  ElMessage.success('代码已复制')
  setTimeout(() => (copied.value = false), 1500)
}
</script>

<style scoped>
.code-block {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  overflow: hidden;
  background: #f7f8fa;
}
.code-block__bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 12px;
  background: #fff;
  border-bottom: 1px solid #ebeef5;
}
.code-block__lang {
  font-size: 12px;
  color: #909399;
}
.code-block__pre {
  margin: 0;
  padding: 12px 16px;
  overflow: auto;
  font-size: 12.5px;
  line-height: 1.6;
  font-family: 'JetBrains Mono', Consolas, 'Courier New', monospace;
  color: #303133;
}
</style>
