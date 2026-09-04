<template>
  <div class="scenario-page">
    <wd-panel title="详情查看" description="场景：列表 + 详情弹窗 —— 点击行内按钮打开 Dialog，内部用 Panel 分区展示只读详情">
      <wd-data-grid api="/user/list" :active="true" filter="s3" :tools="{ refresh: true }">
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="name" label="姓名" min-width="120" />
        <el-table-column prop="dept" label="部门" width="110" />
        <el-table-column prop="role" label="角色" width="100">
          <template #default="{ row }">{{ roleText(row.role) }}</template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column label="操作" width="110" fixed="right">
          <template #default="{ row }">
            <wd-dialog-button
              link
              type="primary"
              text="详情"
              dialog-title="用户详情"
              :dialog-data="row"
            >
              <div class="detail-body">
                <wd-panel title="基本信息" description="用户基础资料">
                  <el-descriptions :column="2" border>
                    <el-descriptions-item label="姓名">{{ row.name }}</el-descriptions-item>
                    <el-descriptions-item label="部门">{{ row.dept }}</el-descriptions-item>
                    <el-descriptions-item label="角色">{{ roleText(row.role) }}</el-descriptions-item>
                    <el-descriptions-item label="状态">
                      <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
                        {{ row.status === 1 ? '启用' : '禁用' }}
                      </el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="邮箱" :span="2">{{ row.email }}</el-descriptions-item>
                    <el-descriptions-item label="创建时间" :span="2">{{ row.createTime }}</el-descriptions-item>
                  </el-descriptions>
                </wd-panel>
                <wd-panel title="账号信息" description="系统账号配置">
                  <wd-tips type="box" icon="WarningFilled" tips="详情数据来自当前行快照，正式项目可用 api 动态加载" />
                  <div class="detail-meta">
                    <p>ID：{{ row.id }}</p>
                    <p>最近登录：2026-09-01 14:32</p>
                  </div>
                </wd-panel>
              </div>
            </wd-dialog-button>
          </template>
        </el-table-column>
      </wd-data-grid>
    </wd-panel>
  </div>
</template>

<script setup lang="ts">
function roleText(role: number) {
  return { 1: '管理员', 2: '编辑', 3: '访客' }[role] || '未知'
}
</script>

<style scoped>
.scenario-page {
  width: 100%;
}
.detail-body {
  padding: 4px;
}
.detail-meta p {
  margin: 6px 0;
  font-size: 13px;
  color: #606266;
}
</style>
