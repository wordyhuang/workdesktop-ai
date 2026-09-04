<template>
  <div class="example-page">
    <demo-block
      title="两种模式"
      desc="word=悬停图标模式；box=行内文字模式；颜色图标可配"
      :code="code1"
      layout="row"
    >
      <wd-tips tips="这是悬停提示内容" />
      <wd-tips type="word" icon="WarningFilled" tips="警告提示" color="#e6a23c" />
      <wd-tips type="box" tips="行内文字提示" />
      <wd-tips type="box" icon="QuestionFilled" tips="带图标的行内提示" color="#409eff" />
    </demo-block>

    <demo-block title="表格列提示" desc="常用于表头/字段说明" :code="code2">
      <el-table :data="rows" border size="small" style="width: 420px">
        <el-table-column label="字段">
          <template #header>
            <span>优惠比例</span>
            <wd-tips type="word" tips="指订单实付金额的返还比例" style="margin-left: 6px" />
          </template>
          <template #default="{ row }">{{ row.ratio }}%</template>
        </el-table-column>
        <el-table-column prop="desc" label="说明" />
      </el-table>
    </demo-block>
  </div>
</template>

<script setup lang="ts">
const code1 = `<wd-tips tips="悬停提示" />
<wd-tips type="box" tips="行内文字提示" />
<wd-tips type="box" icon="WarningFilled" tips="带图标" color="#e6a23c" />`
const code2 = `<el-table-column label="优惠比例">
  <template #header>
    <span>优惠比例</span>
    <wd-tips type="word" tips="指订单实付金额的返还比例" />
  </template>
</el-table-column>`

const rows = [{ ratio: 10, desc: '普通会员' }, { ratio: 20, desc: '黄金会员' }]
</script>

<style scoped>
.example-page {
  width: 100%;
}
</style>
