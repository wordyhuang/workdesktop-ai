<template>
  <div class="example-page">
    <demo-block
      title="基础用法"
      desc="WdSearchItem 专用于 SearchPanel，用法与 WdFormItem 一致，包裹搜索控件；多个子项在第一行流式排列，右侧为查询/重置按钮。通过插槽参数 model 绑定字段"
      :code="code1"
    >
      <wd-search-panel label-width="auto" :default-expand="false" @search="onSearch">
        <template #default="{ model }">
          <wd-search-item label="姓名" prop="name">
            <el-input v-model="model.name" clearable placeholder="请输入姓名" style="width: 180px" />
          </wd-search-item>
          <wd-search-item label="状态" prop="status">
            <el-select v-model="model.status" clearable placeholder="全部" style="width: 130px">
              <el-option label="启用" :value="1" />
              <el-option label="禁用" :value="0" />
            </el-select>
          </wd-search-item>
        </template>
      </wd-search-panel>
    </demo-block>

    <demo-block
      title="tip 帮助提示 + 展开更多"
      desc="提供 tip 后 label 右侧出现问号图标，悬停显示字段说明；隐藏条件放入 more 插槽，点「展开」整行滑出。默认项与更多项共享同一查询模型"
      :code="code2"
    >
      <wd-search-panel label-width="auto" :default-expand="false" @search="onSearch">
        <template #default="{ model }">
          <wd-search-item label="订单号" prop="orderNo" tip="支持订单号精确查询">
            <el-input v-model="model.orderNo" clearable placeholder="请输入订单号" style="width: 180px" />
          </wd-search-item>
          <wd-search-item label="状态" prop="status" tip="按订单当前状态筛选">
            <el-select v-model="model.status" clearable placeholder="全部" style="width: 130px">
              <el-option label="待支付" value="unpaid" />
              <el-option label="已支付" value="paid" />
              <el-option label="已完成" value="done" />
            </el-select>
          </wd-search-item>
        </template>
        <template #more="{ model }">
          <wd-search-item label="下单日期" prop="dateRange" tip="按下单时间范围筛选，含起止当天">
            <el-date-picker
              v-model="model.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
              style="width: 260px"
            />
          </wd-search-item>
          <wd-search-item label="渠道" prop="channel">
            <el-select v-model="model.channel" clearable placeholder="全部渠道" style="width: 150px">
              <el-option label="线上" value="online" />
              <el-option label="线下" value="offline" />
            </el-select>
          </wd-search-item>
        </template>
      </wd-search-panel>
    </demo-block>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'

const code1 = `<wd-search-panel label-width="auto" :default-expand="false" @search="onSearch">
  <template #default="{ model }">
    <wd-search-item label="姓名" prop="name">
      <el-input v-model="model.name" clearable placeholder="请输入姓名" />
    </wd-search-item>
    <wd-search-item label="状态" prop="status">
      <el-select v-model="model.status" clearable placeholder="全部">
        <el-option label="启用" :value="1" />
        <el-option label="禁用" :value="0" />
      </el-select>
    </wd-search-item>
  </template>
</wd-search-panel>`

const code2 = `<wd-search-panel label-width="auto" :default-expand="false">
  <template #default="{ model }">
    <!-- tip：label 右侧问号图标，悬停显示说明 -->
    <wd-search-item label="订单号" prop="orderNo" tip="支持订单号精确查询">
      <el-input v-model="model.orderNo" clearable />
    </wd-search-item>
  </template>
  <!-- 隐藏条件放 more 插槽，点「展开」滑出 -->
  <template #more="{ model }">
    <wd-search-item label="下单日期" prop="dateRange" tip="按时间范围筛选，含起止当天">
      <el-date-picker v-model="model.dateRange" type="daterange" />
    </wd-search-item>
  </template>
</wd-search-panel>`

function onSearch(params: Record<string, any>) {
  ElMessage.info(`查询参数：${JSON.stringify(params)}`)
}
</script>

<style scoped>
.example-page {
  width: 100%;
}
</style>
