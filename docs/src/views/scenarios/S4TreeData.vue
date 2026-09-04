<template>
  <div class="scenario-page">
    <wd-panel title="树形数据" description="场景：树形表格展示组织架构 —— DataGrid 内置树形渲染，支持懒加载 / 默认展开">
      <wd-data-grid
        :data-source="treeData"
        row-key="id"
        :default-expand-all="true"
        :with-selection="true"
      >
        <el-table-column prop="name" label="部门 / 组" min-width="240" />
        <el-table-column prop="leader" label="负责人" width="140" />
        <el-table-column prop="count" label="人数" width="120">
          <template #default="{ row }">
            <el-tag size="small" effect="plain">{{ row.count || 0 }} 人</el-tag>
          </template>
        </el-table-column>
      </wd-data-grid>
    </wd-panel>

    <wd-panel title="Select 远程加载" description="场景：下拉选项由接口加载（/options/roles），支持远程搜索">
      <wd-select
        api="/options/roles"
        placeholder="请选择角色"
        style="width: 260px"
      />
      <div class="row-gap" />
      <wd-checkbox-list api="/options/roles" :button-style="true" />
    </wd-panel>
  </div>
</template>

<script setup lang="ts">
const treeData = [
  { id: 1, name: '研发中心', leader: '陈总', count: 120, children: [
    { id: 11, name: '前端组', leader: '刘工', count: 40 },
    { id: 12, name: '后端组', leader: '杨工', count: 50 },
    { id: 13, name: '测试组', leader: '黄工', count: 30 }
  ] },
  { id: 2, name: '产品中心', leader: '林总', count: 40, children: [
    { id: 21, name: '产品组', leader: '周工', count: 20 },
    { id: 22, name: '设计组', leader: '吴工', count: 20 }
  ] },
  { id: 3, name: '运营中心', leader: '郑总', count: 25, children: [
    { id: 31, name: '市场组', leader: '孙工', count: 25 }
  ] }
]
</script>

<style scoped>
.scenario-page {
  width: 100%;
}
.row-gap {
  height: 16px;
}
</style>
