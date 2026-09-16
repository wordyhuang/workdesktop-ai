<template>
  <div class="linkage-page">
    <PageHeader
      eyebrow="LINKAGE PLAYGROUND"
      icon="Connection"
      title="联动联调演示"
      desc="覆盖声明式联动（filter + headRefreshDatagrid）、事件驱动联动（row-action）与事件总线（useEventBus）跨层级通信。"
    />

    <!-- 1. 声明式联动：搜索面板 + 数据列表（分别用 Panel 包裹，外层无大容器） -->
    <wd-panel title="搜索条件">
      <wd-search-panel head-refresh-datagrid filter="link1">
        <template #default="{ model }">
          <el-form-item label="姓名">
            <el-input v-model="model.name" clearable placeholder="模糊搜索" style="width: 200px" />
          </el-form-item>
          <el-form-item label="部门">
            <el-select v-model="model.dept" clearable placeholder="全部" style="width: 150px">
              <el-option v-for="d in depts" :key="d" :label="d" :value="d" />
            </el-select>
          </el-form-item>
        </template>
      </wd-search-panel>
    </wd-panel>

    <wd-panel
      title="数据列表"
      description="SearchPanel 查询 → 刷新同 filter DataGrid；DrawerButton 表单提交 → 关闭抽屉 + 刷新表格（headRefreshDatagrid）"
    >
      <div class="linkage__toolbar">
        <wd-drawer-button
          type="primary"
          label="新增用户"
          title="新增用户"
          filter="link1"
          head-refresh-datagrid="link1"
        >
          <wd-data-form mode="create" submit-api="/user/save" :rules="rules">
            <template #default="{ model }">
              <el-form-item label="姓名" prop="name">
                <el-input v-model="model.name" />
              </el-form-item>
              <el-form-item label="部门" prop="dept">
                <el-select v-model="model.dept" style="width: 100%">
                  <el-option v-for="d in depts" :key="d" :label="d" :value="d" />
                </el-select>
              </el-form-item>
              <el-form-item label="邮箱" prop="email">
                <el-input v-model="model.email" />
              </el-form-item>
            </template>
          </wd-data-form>
        </wd-drawer-button>
        <span class="linkage__hint">提交后表格自动刷新（新增行会出现在列表顶部）</span>
      </div>

      <wd-data-grid
        api="/user/list"
        :active="true"
        filter="link1"
        :with-pager="false"
        :tools="{ refresh: true }"
      >
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
    </wd-panel>

    <!-- 2. 事件驱动联动（row-action） -->
    <wd-panel title="事件驱动联动（row-action）" description="DataGrid rowActions 内置操作列点击 → emit row-action → 父组件响应（打开详情 / 删除并刷新）">
      <el-row :gutter="16">
        <el-col :span="14">
          <wd-data-grid
            api="/user/list"
            :active="true"
            filter="link2"
            :row-actions="rowActions"
            :with-pager="false"
            @row-action="onRowAction"
          >
            <el-table-column prop="id" label="ID" width="70" />
            <el-table-column prop="name" label="姓名" min-width="120" />
            <el-table-column prop="dept" label="部门" width="110" />
            <el-table-column prop="email" label="邮箱" min-width="160" />
          </wd-data-grid>
        </el-col>
        <el-col :span="10">
          <div class="linkage__log">
            <div class="linkage__log-title">事件日志</div>
            <div v-if="!logs.length" class="linkage__log-empty">点击右侧表格操作按钮触发事件</div>
            <div v-for="(log, i) in logs" :key="i" class="linkage__log-item">{{ log }}</div>
          </div>
        </el-col>
      </el-row>
    </wd-panel>

    <!-- 3. useEventBus 跨层级 -->
    <wd-panel title="事件总线（useEventBus）" description="跨层级组件通信：左侧 emit，右侧 on 监听并响应">
      <el-row :gutter="16">
        <el-col :span="10">
          <div class="linkage__bus-sender">
            <p class="linkage__label">发送端</p>
            <el-select v-model="selectedUser" placeholder="选择用户" style="width: 200px">
              <el-option v-for="u in busUsers" :key="u.id" :label="u.name" :value="u.id" />
            </el-select>
            <el-button type="primary" @click="busSend" style="margin-left: 8px">发送</el-button>
            <p class="linkage__hint">选择用户后点击发送，通过事件总线通知右侧接收端</p>
          </div>
        </el-col>
        <el-col :span="14">
          <div class="linkage__bus-receiver">
            <p class="linkage__label">接收端</p>
            <el-tag v-if="busReceived" type="success" size="large">
              已接收：用户「{{ busReceived.name }}」（部门 {{ busReceived.dept }}）
            </el-tag>
            <el-tag v-else type="info" size="large">等待事件总线消息…</el-tag>
          </div>
        </el-col>
      </el-row>
    </wd-panel>
  </div>
</template>

<script setup lang="ts">
import { onUnmounted, ref } from 'vue'
import { request, useEventBus, refreshDataGrid } from '../../../src'
import { ElMessage } from 'element-plus'

// ---------- 声明式联动 ----------
const depts = ['技术部', '产品部', '设计部', '市场部', '运营部']
const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  dept: [{ required: true, message: '请选择部门', trigger: 'change' }],
  email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }]
}

// ---------- row-action 事件联动 ----------
const rowActions = [
  { text: '详情', command: 'detail' },
  { text: '禁用', command: 'disable', type: 'danger' }
]
const logs = ref<string[]>([])

function pushLog(msg: string) {
  logs.value.unshift(`${new Date().toLocaleTimeString()}  ${msg}`)
  if (logs.value.length > 8) logs.value.pop()
}

async function onRowAction({ row, command }: { row: any; command: string }) {
  if (command === 'detail') {
    pushLog(`row-action[detail]：打开用户 ${row.name} 详情`)
    ElMessage.info(`查看用户详情：${row.name}`)
  } else if (command === 'disable') {
    const result = await request.post('/user/status', { id: row.id, status: 0 })
    if (result.success) {
      pushLog(`row-action[disable]：${row.name} 已禁用，刷新表格`)
      ElMessage.success(`${row.name} 已禁用`)
      refreshDataGrid('link2')
    }
  }
}

// ---------- useEventBus 跨层级 ----------
const bus = useEventBus()
const busUsers = Array.from({ length: 5 }, (_, i) => ({
  id: i + 1,
  name: `用户${i + 1}`,
  dept: depts[i % depts.length]
}))
const selectedUser = ref<number | undefined>()
const busReceived = ref<any>(null)

function busSend() {
  const u = busUsers.find((x) => x.id === selectedUser.value)
  if (!u) {
    ElMessage.warning('请先选择用户')
    return
  }
  bus.emit('wd:user-selected', u)
  pushLog(`eventBus 发送：wd:user-selected → ${u.name}`)
}

// 监听总线事件（接收端）
const offBus = bus.on('wd:user-selected', (payload: any) => {
  busReceived.value = payload
  pushLog(`eventBus 接收：${payload.name}`)
})

onUnmounted(() => {
  offBus()
})
</script>

<style scoped>
.linkage-page {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.linkage__toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
.linkage__hint {
  font-size: 12px;
  color: var(--wd-text-color-secondary, #909399);
}

/* 事件日志卡 */
.linkage__log {
  position: relative;
  background: var(--wd-bg-color-page, #f7f8fa);
  border: 1px solid var(--wd-border-color-light, #ebeef5);
  border-radius: 12px;
  padding: 14px 16px;
  height: 100%;
  min-height: 180px;
  box-sizing: border-box;
  overflow: hidden;
}
.linkage__log::before {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: 3px;
  background: linear-gradient(180deg, var(--wd-color-primary, #409eff), var(--el-color-primary-light-3, #79bbff));
}
.linkage__log-title {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  font-weight: 700;
  color: var(--wd-text-color-primary, #303133);
  margin-bottom: 10px;
}
.linkage__log-title::before {
  content: '';
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--wd-color-primary, #409eff);
  box-shadow: 0 0 0 3px var(--el-color-primary-light-9, #ecf5ff);
}
.linkage__log-empty {
  color: var(--wd-text-color-placeholder, #c0c4cc);
  font-size: 13px;
  padding: 8px 0;
}
.linkage__log-item {
  position: relative;
  font-size: 12px;
  color: var(--wd-color-primary, #409eff);
  line-height: 1.7;
  font-family: 'SFMono-Regular', Consolas, monospace;
  padding: 5px 8px;
  margin-bottom: 4px;
  background: var(--el-color-primary-light-9, #ecf5ff);
  border-radius: 7px;
  word-break: break-all;
}

/* 事件总线收发端 */
.linkage__bus-sender,
.linkage__bus-receiver {
  padding: 6px 4px;
}
.linkage__label {
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 0 0 14px;
  font-size: 13px;
  font-weight: 700;
  color: var(--wd-text-color-regular, #606266);
}
.linkage__label::before {
  content: '';
  width: 4px;
  height: 14px;
  border-radius: 2px;
  background: linear-gradient(180deg, var(--wd-color-primary, #409eff), var(--el-color-primary-light-3, #79bbff));
}

@media (max-width: 960px) {
  .linkage__toolbar {
    flex-wrap: wrap;
  }
}
</style>
