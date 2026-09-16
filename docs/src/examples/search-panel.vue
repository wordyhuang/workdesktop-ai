<template>
  <div class="example-page">
    <demo-block title="搜索联动"
      desc="搜索与表格分别用 Panel 包裹、外层无大容器；SearchPanel 右侧按钮横排不换行；more 插槽放隐藏项（部门/手机号/岗位/日期），点「展开」时隐藏条件作为独立第二行整行平顺滑出，不改变默认搜索区布局；label-width=&quot;auto&quot; 时标签宽度随文字自适应；子项用 wd-form-item，给 tip 属性后 label 右侧出现问号帮助图标（悬停解释）；查询/重置联动同 filter DataGrid（重置到第一页、异组不刷新）"
      :code="code1">
      <wd-search-panel head-refresh-datagrid filter="panel-demo" label-width="auto" :default-expand="false"
        @search="onSearch" @reset="onReset">
        <template #default="{ model }">
          <wd-search-item label="姓名" prop="name" tip="支持姓名关键字模糊匹配">
            <el-input v-model="model.name" clearable placeholder="模糊搜索" style="width: 200px" />
          </wd-search-item>
          <wd-search-item label="状态" prop="status" tip="按启用/禁用筛选">
            <el-select v-model="model.status" clearable placeholder="全部" style="width: 120px">
              <el-option label="启用" :value="1" />
              <el-option label="禁用" :value="0" />
            </el-select>
          </wd-search-item>
        </template>
        <template #more="{ model }">
          <el-form-item label="所属部门">
            <el-input v-model="model.dept" clearable placeholder="所在部门" style="width: 180px" />
          </el-form-item>
          <el-form-item label="标签">
            <el-input v-model="model.tag" clearable placeholder="标签关键字" style="width: 140px" />
          </el-form-item>
          <wd-search-item label="手机号" prop="phone" tip="用于登录/找回账号的绑定手机号">
            <el-input v-model="model.phone" clearable placeholder="联系手机号" style="width: 160px" />
          </wd-search-item>
          <el-form-item label="岗位类型">
            <el-select v-model="model.jobType" clearable placeholder="全部" style="width: 140px">
              <el-option label="正式" value="formal" />
              <el-option label="试用" value="probation" />
              <el-option label="外包" value="outsource" />
            </el-select>
          </el-form-item>
          <wd-search-item label="创建日期" prop="dateRange" tip="按创建时间范围筛选，含起止当天">
            <el-date-picker v-model="model.dateRange" type="daterange" range-separator="至" start-placeholder="开始日期"
              end-placeholder="结束日期" value-format="YYYY-MM-DD" style="width: 260px" />
          </wd-search-item>
        </template>
      </wd-search-panel>

      <wd-data-grid api="/user/list" :active="true" filter="panel-demo" :with-pager="false" :with-index="true">
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="name" label="姓名" min-width="120" />
        <el-table-column prop="dept" label="部门" width="110" />
        <el-table-column prop="status" label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
      </wd-data-grid>
    </demo-block>
    <demo-block title="方法调用（ref）" desc="给 SearchPanel 加 ref，可编程式获取查询参数、展开/收起更多条件、重置表单" :code="code2">
      <div class="method-bar">
        <el-button size="small" @click="callGetParams">getSearchParams()</el-button>
        <el-button size="small" @click="callExpand">expand()</el-button>
        <el-button size="small" @click="callCollapse">collapse()</el-button>
        <el-button size="small" @click="callReset">resetForm()</el-button>
      </div>
      <wd-panel title="搜索条件">
        <wd-search-panel ref="panelRef" label-width="auto" :default-expand="false">
          <template #default="{ model }">
            <wd-search-item label="姓名" prop="name" tip="支持姓名关键字模糊匹配">
              <el-input v-model="model.name" clearable placeholder="模糊搜索" style="width: 200px" />
            </wd-search-item>
          </template>
          <template #more="{ model }">
            <el-form-item label="所属部门">
              <el-input v-model="model.dept" clearable placeholder="所在部门" style="width: 180px" />
            </el-form-item>
            <el-form-item label="岗位类型">
              <el-select v-model="model.jobType" clearable placeholder="全部" style="width: 140px">
                <el-option label="正式" value="formal" />
                <el-option label="试用" value="probation" />
                <el-option label="外包" value="outsource" />
              </el-select>
            </el-form-item>
            <el-form-item label="创建日期">
              <el-date-picker v-model="model.dateRange" type="daterange" range-separator="至" start-placeholder="开始日期"
                end-placeholder="结束日期" value-format="YYYY-MM-DD" style="width: 260px" />
            </el-form-item>
          </template>
        </wd-search-panel>
      </wd-panel>
    </demo-block>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const panelRef = ref()

function callGetParams() {
  const params = panelRef.value?.getSearchParams()
  ElMessage.info(`当前查询参数：${JSON.stringify(params)}`)
}
function callExpand() {
  panelRef.value?.expand()
  ElMessage.success('已展开更多条件')
}
function callCollapse() {
  panelRef.value?.collapse()
  ElMessage.success('已收起更多条件')
}
function callReset() {
  panelRef.value?.resetForm()
  ElMessage.success('已重置查询条件')
}

const code1 = `<template>
  <wd-search-panel head-refresh-datagrid filter="panel-demo" label-width="auto" :default-expand="false"
    @search="onSearch" @reset="onReset">
    <template #default="{ model }">
      <wd-search-item label="姓名" prop="name" tip="支持姓名关键字模糊匹配">
        <el-input v-model="model.name" clearable placeholder="模糊搜索" style="width: 200px" />
      </wd-search-item>
      <wd-search-item label="状态" prop="status" tip="按启用/禁用筛选">
        <el-select v-model="model.status" clearable placeholder="全部" style="width: 120px">
          <el-option label="启用" :value="1" />
          <el-option label="禁用" :value="0" />
        </el-select>
      </wd-search-item>
    </template>
    <!-- more 插槽放隐藏条件项，点「展开」作为独立第二行滑出；label-width="auto" 时 label 随文字自适应 -->
    <template #more="{ model }">
      <el-form-item label="所属部门">
        <el-input v-model="model.dept" clearable placeholder="所在部门" style="width: 180px" />
      </el-form-item>
      <el-form-item label="标签">
        <el-input v-model="model.tag" clearable placeholder="标签关键字" style="width: 140px" />
      </el-form-item>
      <wd-search-item label="手机号" prop="phone" tip="用于登录/找回账号的绑定手机号">
        <el-input v-model="model.phone" clearable placeholder="联系手机号" style="width: 160px" />
      </wd-search-item>
      <el-form-item label="岗位类型">
        <el-select v-model="model.jobType" clearable placeholder="全部" style="width: 140px">
          <el-option label="正式" value="formal" />
          <el-option label="试用" value="probation" />
          <el-option label="外包" value="outsource" />
        </el-select>
      </el-form-item>
      <wd-search-item label="创建日期" prop="dateRange" tip="按创建时间范围筛选，含起止当天">
        <el-date-picker v-model="model.dateRange" type="daterange" range-separator="至"
          start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD" style="width: 260px" />
      </wd-search-item>
    </template>
  </wd-search-panel>

  <!-- 同 filter 分组表格：查询/重置自动联动刷新（重置回第一页、异组不刷新） -->
  <wd-data-grid api="/user/list" :active="true" filter="panel-demo" :with-pager="false" :with-index="true">
    <el-table-column prop="id" label="ID" width="70" />
    <el-table-column prop="name" label="姓名" min-width="120" />
    <el-table-column prop="dept" label="部门" width="110" />
    <el-table-column prop="status" label="状态" width="90">
      <template #default="{ row }">
        <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
          {{ row.status === 1 ? '启用' : '禁用' }}
        </el-tag>
      </template>
    </el-table-column>
  </wd-data-grid>
</template>

<script>
function onSearch(params) {
  // params：当前查询参数对象（含 more 插槽字段）
  console.log('查询参数：', params)
}
function onReset() {
  // 已清空查询条件并联动刷新同组表格
}
<\/script>`

const code2 = `<wd-search-panel ref="panelRef" label-width="auto" :default-expand="false">
  <template #default="{ model }">
    <wd-search-item label="姓名" prop="name" tip="支持姓名关键字模糊匹配">
      <el-input v-model="model.name" />
    </wd-search-item>
  </template>
  <template #more="{ model }">
    <el-form-item label="所属部门">
      <el-input v-model="model.dept" />
    </el-form-item>
    <el-form-item label="岗位类型">
      <el-select v-model="model.jobType" clearable />
    </el-form-item>
    <el-form-item label="创建日期">
      <el-date-picker v-model="model.dateRange" type="daterange" />
    </el-form-item>
  </template>
</wd-search-panel>

// 通过 ref 调用方法
const panelRef = ref()
panelRef.value.getSearchParams()   // -> 当前查询参数对象（副本）
panelRef.value.expand()            // 展开更多条件
panelRef.value.collapse()          // 收起更多条件
panelRef.value.resetForm()         // 清空字段并触发 reset`

function onSearch(params: Record<string, any>) {
  ElMessage.info(`查询参数：${JSON.stringify(params)}`)
}
function onReset() {
  ElMessage.info('已重置')
}
</script>

<style scoped>
.example-page {
  width: 100%;
}

.method-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}
</style>
