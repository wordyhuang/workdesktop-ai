<template>
  <div class="example-page">
    <unpack-note>
      该组件自动对 API 返回数据中的 <code>data</code> 进行解包：<code>data</code> 为选项数组（若为 <code>{ list }</code> 结构则取其 <code>list</code>），逐项按字段映射解析出：
      <ul>
        <li><code>text</code>：选项中显示的文本</li>
        <li><code>value</code>：选项选中时传递的值</li>
        <li><code>tips</code>：对选项的说明解释（非空时显示悬停提示）</li>
      </ul>
      字段名可用 <code>text-prop</code> / <code>value-prop</code> / <code>tips-prop</code> 自定义（默认 <code>text</code> / <code>value</code> / <code>tips</code>）。
    </unpack-note>
    <demo-block
      title="本地过滤"
      desc="dataSource 静态数据 + 输入即过滤；选中触发 select 事件"
      :code="code1"
    >
      <wd-auto-complete
        :data-source="options"
        placeholder="输入关键字搜索（如：前端）"
        style="width: 320px"
        @select="onSelect"
      />
    </demo-block>

    <demo-block
      title="远程搜索"
      desc="api + remote 远程搜索建议，label-key/value-key 字段映射"
      :code="code2"
    >
      <wd-auto-complete
        api="/user/list"
        keyword-key="name"
        value-key="name"
        label-key="name"
        placeholder="输入姓名远程搜索"
        style="width: 320px"
      >
        <template #default="{ option }">
          <div class="suggest-item">
            <span>{{ option.name }}</span>
            <span class="suggest-item__sub">{{ option.dept }}</span>
          </div>
        </template>
      </wd-auto-complete>
    </demo-block>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'

const code1 = `<wd-auto-complete :data-source="options"
  placeholder="输入关键字搜索" @select="onSelect" />`
const code2 = `<wd-auto-complete api="/user/list" keyword-key="name"
  value-key="name" label-key="name" />`

const options = [
  { value: 1, text: '前端组' },
  { value: 2, text: '后端组' },
  { value: 3, text: '测试组' },
  { value: 4, text: '产品组' },
  { value: 5, text: '设计组' }
]

function onSelect(item: any) {
  ElMessage.info(`选中：${item.name}`)
}
</script>

<style scoped>
.example-page {
  width: 100%;
}
.suggest-item {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}
.suggest-item__sub {
  color: #909399;
  font-size: 12px;
}
</style>
