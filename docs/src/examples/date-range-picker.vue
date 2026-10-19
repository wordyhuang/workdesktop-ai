<template>
  <div class="example-page">
    <unpack-note>
      <code>WdDateRangePicker</code> 固定使用 <code>type="daterange"</code> 的范围选择器：
      <code>v-model</code> 绑定数组 <code>[开始, 结束]</code>，缺省格式按 <code>type</code> 自动映射
      （date=YYYY-MM-DD / datetime=YYYY-MM-DD HH:mm:ss）；
      内置 <code>withShortcut</code> 快捷选项（今天 / 近7天 / 近30天 / 本月 / 上月）。
    </unpack-note>

    <demo-block title="基础日期范围"
      desc="默认 type='date'，绑定值为 [开始, 结束] 字符串数组"
      :code="code1" layout="row">
      <wd-date-range-picker v-model="basic" />
      <span class="current">当前值：{{ basic ? basic.join(' ~ ') : '（空）' }}</span>
    </demo-block>

    <demo-block title="日期时间范围（datetime）"
      desc="type='datetime' 时绑定值格式切换为 YYYY-MM-DD HH:mm:ss"
      :code="code2" layout="row">
      <wd-date-range-picker v-model="datetime" type="datetime" />
      <span class="current">当前值：{{ datetime ? datetime.join(' ~ ') : '（空）' }}</span>
    </demo-block>

    <demo-block title="内置快捷选项"
      desc="开启 withShortcut 后，面板左侧内置「今天 / 近7天 / 近30天 / 本月 / 上月」"
      :code="code3" layout="row">
      <wd-date-range-picker v-model="shortcut" with-shortcut start-placeholder="开始" end-placeholder="结束" />
      <span class="current">当前值：{{ shortcut ? shortcut.join(' ~ ') : '（空）' }}</span>
    </demo-block>

    <demo-block title="禁用与自定义占位"
      desc="disabled 整体禁用；start-placeholder / end-placeholder 自定义占位文案"
      :code="code4" layout="row">
      <wd-date-range-picker v-model="disabled" disabled start-placeholder="开始日期" end-placeholder="结束日期" />
    </demo-block>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const code1 = `<wd-date-range-picker v-model="range" />
<!-- 绑定值：['2026-10-01', '2026-10-18'] -->`

const code2 = `<wd-date-range-picker v-model="range" type="datetime" />
<!-- 绑定值：['2026-10-01 00:00:00', '2026-10-18 23:59:59'] -->`

const code3 = `<wd-date-range-picker
  v-model="range"
  with-shortcut
  start-placeholder="开始"
  end-placeholder="结束"
/>
<!-- 内置快捷：今天 / 近7天 / 近30天 / 本月 / 上月 -->`

const code4 = `<wd-date-range-picker v-model="range" disabled />`

const basic = ref<string[]>()
const datetime = ref<string[]>()
const shortcut = ref<string[]>()
const disabled = ref<string[]>(['2026-10-01', '2026-10-18'])
</script>

<style scoped>
.example-page {
  width: 100%;
}
.current {
  margin-left: 16px;
  font-size: 13px;
  color: #606266;
}
</style>
