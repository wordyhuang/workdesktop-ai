<template>
  <section class="demo-block">
    <div class="demo-block__head">
      <h3 class="demo-block__title">{{ title }}</h3>
      <el-button v-if="code" link size="small" @click="showCode = !showCode">
        {{ showCode ? '收起代码' : '查看代码' }}
      </el-button>
    </div>
    <p v-if="desc" class="demo-block__desc">{{ desc }}</p>
    <div class="demo-block__preview" :class="`is-${layout}`">
      <slot />
    </div>
    <div v-if="showCode && code" class="demo-block__code">
      <CodeBlock :code="code" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

withDefaults(
  defineProps<{
    title: string
    desc?: string
    code?: string
    /** 预览区布局：default 纵向 / row 横向排列 */
    layout?: 'default' | 'row'
  }>(),
  { layout: 'default' }
)

const showCode = ref(false)
</script>

<style scoped>
.demo-block {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  margin-bottom: 16px;
  background: #fff;
  overflow: hidden;
}
.demo-block__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px 0;
}
.demo-block__title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}
.demo-block__desc {
  margin: 6px 16px 0;
  font-size: 13px;
  color: #909399;
}
.demo-block__preview {
  padding: 16px;
}
.demo-block__preview.is-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}
.demo-block__code {
  border-top: 1px solid #ebeef5;
}
</style>
