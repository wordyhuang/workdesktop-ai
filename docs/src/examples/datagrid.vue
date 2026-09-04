<template>
  <div class="example-page">
    <demo-block
      title="API 数据 + 分页 + 搜索联动"
      desc="SearchPanel 与 DataGrid 配置相同 filter，点击查询自动刷新表格（重置到第一页）"
      :code="code1"
    >
      <wd-search-panel head-refresh-datagrid filter="main" collapsible>
        <template #default="{ model }">
          <el-form-item label="姓名">
            <el-input v-model="model.name" placeholder="模糊搜索姓名/邮箱" clearable style="width: 200px" />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="model.status" clearable placeholder="全部" style="width: 120px">
              <el-option label="启用" :value="1" />
              <el-option label="禁用" :value="0" />
            </el-select>
          </el-form-item>
        </template>
      </wd-search-panel>

      <wd-data-grid
        api="/user/list"
        :active="true"
        filter="main"
        :tools="{ refresh: true, size: true }"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="姓名" min-width="120" />
        <el-table-column prop="dept" label="部门" width="110" />
        <el-table-column prop="role" label="角色" width="100">
          <template #default="{ row }">{{ roleText(row.role) }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="120" />
      </wd-data-grid>
    </demo-block>

    <demo-block
      title="静态数据 + 卡片模式 + 动态列"
      desc="dataSource 传入静态数组；mode-switch 切换表格/卡片视图；dynamic-column 开启列设置（隐藏/排序/持久化）"
      :code="code2"
    >
      <wd-data-grid
        :data-source="staticRows"
        :mode-switch="true"
        :dynamic-column="true"
        column-storage-key="doc-datagrid-static"
        :with-index="true"
      >
        <el-table-column prop="name" label="项目" min-width="160" />
        <el-table-column prop="owner" label="负责人" width="120" />
        <el-table-column prop="progress" label="进度" width="180">
          <template #default="{ row }">
            <el-progress :percentage="row.progress" :stroke-width="10" />
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.done ? 'success' : 'warning'" size="small">{{ row.done ? '已完成' : '进行中' }}</el-tag>
          </template>
        </el-table-column>
      </wd-data-grid>
    </demo-block>

    <demo-block
      title="树形数据"
      desc="row-key + tree-props 渲染树形结构，default-expand-all 默认展开"
      :code="code3"
    >
      <wd-data-grid :data-source="treeRows" row-key="id" :default-expand-all="true">
        <el-table-column prop="name" label="部门" min-width="220" />
        <el-table-column prop="count" label="人数" width="120" />
        <el-table-column prop="leader" label="负责人" width="140" />
      </wd-data-grid>
    </demo-block>
  </div>
</template>

<script setup lang="ts">
const code1 = `<wd-search-panel head-refresh-datagrid filter="main">
  <template #default="{ model }">
    <el-form-item label="姓名"><el-input v-model="model.name" /></el-form-item>
  </template>
</wd-search-panel>

<wd-data-grid api="/user/list" :active="true" filter="main">
  <el-table-column prop="name" label="姓名" />
  <el-table-column prop="dept" label="部门" />
</wd-data-grid>`

const code2 = `<wd-data-grid :data-source="rows" :mode-switch="true"
  :dynamic-column="true" column-storage-key="demo">
  <el-table-column prop="name" label="项目" />
</wd-data-grid>`

const code3 = `<wd-data-grid :data-source="tree" row-key="id" :default-expand-all="true">
  <el-table-column prop="name" label="部门" />
</wd-data-grid>`

function roleText(role: number) {
  return { 1: '管理员', 2: '编辑', 3: '访客' }[role] || '未知'
}

const staticRows = [
  { name: 'WorkDesktop 组件库', owner: '张三', progress: 90, done: true },
  { name: '订单中台重构', owner: '李四', progress: 60, done: false },
  { name: '数据看板二期', owner: '王五', progress: 35, done: false },
  { name: '移动端适配', owner: '赵六', progress: 100, done: true },
  { name: '权限体系升级', owner: '钱七', progress: 15, done: false }
]

const treeRows = [
  { id: 1, name: '研发中心', count: 120, leader: '陈总', children: [
    { id: 11, name: '前端组', count: 40, leader: '刘工' },
    { id: 12, name: '后端组', count: 50, leader: '杨工' },
    { id: 13, name: '测试组', count: 30, leader: '黄工' }
  ]},
  { id: 2, name: '产品中心', count: 40, leader: '林总', children: [
    { id: 21, name: '产品组', count: 20, leader: '周工' },
    { id: 22, name: '设计组', count: 20, leader: '吴工' }
  ]}
]
</script>

<style scoped>
.example-page {
  width: 100%;
}
</style>
