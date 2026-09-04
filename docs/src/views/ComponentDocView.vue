<template>
  <div v-if="meta" class="component-doc">
    <doc-page :meta="meta">
      <template #examples>
        <component :is="Example" v-if="Example" />
      </template>
    </doc-page>
  </div>
  <el-empty v-else description="未找到该组件文档" />
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import { useRoute } from 'vue-router'
import { componentMap } from '../api-meta'
import DocPage from '../components/DocPage.vue'

const route = useRoute()
const meta = computed(() => componentMap[String(route.params.path)])

const Example = computed(() =>
  meta.value
    ? defineAsyncComponent(() => import(`../examples/${meta.value.path}.vue`))
    : null
)
</script>
