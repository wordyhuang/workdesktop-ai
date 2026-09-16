<template>
  <div class="example-page">
    <unpack-note>
      该组件自动对 API 返回数据中的 <code>data</code> 进行解包：<code>data</code> 直接作为详情数据对象，按 <code>items</code> 中各项的 <code>prop</code> 从 <code>data</code> 取值渲染对应字段，空值显示 <code>-</code>。
    </unpack-note>
    <demo-block title="静态数据 + items 配置"
      desc="通过 items 声明字段（prop/label/span），data 直接传入对象即可渲染只读描述列表；空值自动显示 -。标题右侧自带「调整大小」与「显示字段」按钮，无需配置即可切换文字大小、勾选显隐、拖拽手柄调整字段顺序（与 DataGrid 列设置一致）"
      :code="code1">
      <wd-viewer title="员工信息" :column="2" :items="basicItems" :data="staticData">
        <el-descriptions-item label="备注" :span="2">
          该员工为 2026 年度核心贡献者，主导多个重点项目落地。
        </el-descriptions-item>
      </wd-viewer>
    </demo-block>

    <demo-block style="margin-top: 24px" title="content 插槽自由布局"
      desc="提供 #content 插槽后完全接管内容布局（脱离描述列表栅格，可做卡片/分栏/头像等任意排版），仍自动装载静态或接口数据，作用域 { row, data }；此模式不再显示描述列表与大小/字段工具"
      :code="code3">
      <wd-viewer :data="staticData">
        <template #content="{ row }">
          <div class="profile-card">
            <el-avatar :size="56">{{ row.name?.slice(0, 1) }}</el-avatar>
            <div class="profile-meta">
              <div class="profile-name">{{ row.name }} · {{ row.job }}</div>
              <div class="profile-sub">{{ row.dept }}</div>
              <div class="profile-sub">{{ row.email }}</div>
            </div>
          </div>
        </template>
      </wd-viewer>
    </demo-block>

    <demo-block style="margin-top: 24px" title="API 自动获取详情"
      desc="配置 api + apiParam，active=true 时挂载自动请求并装载；切换 id 会重新拉取（/mock/user/detail）" :code="code2">
      <div class="viewer-toolbar">
        <el-select v-model="userId" style="width: 200px" placeholder="选择用户">
          <el-option v-for="u in userOptions" :key="u.id" :label="`${u.id} - ${u.name}`" :value="u.id" />
        </el-select>
        <el-button type="primary" @click="reload">手动刷新</el-button>
      </div>
      <wd-viewer ref="apiViewerRef" title="用户详情（接口加载）" :column="2" api="/user/detail" :api-param="{ id: userId }" active
        :items="apiItems" @load-success="onLoadSuccess">
        <template #status-cell="{ value }">
          <el-tag :type="value === 1 ? 'success' : 'info'" size="small">
            {{ value === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
        <template #progress-cell="{ value }">
          <el-progress :percentage="Number(value) || 0" :stroke-width="14" style="width: 180px" />
        </template>
      </wd-viewer>
    </demo-block>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { mockStore } from '../mock'

const code1 = `<wd-viewer title="员工信息" :column="2" :items="items" :data="row">
  <el-descriptions-item label="备注" :span="2">自定义补充内容</el-descriptions-item>
</wd-viewer>

// items 字段配置
const items = [
  { prop: 'name', label: '姓名' },
  { prop: 'dept', label: '部门' },
  { prop: 'email', label: '邮箱', span: 2 }
]`

const code2 = `<wd-viewer
  title="用户详情"
  :column="2"
  api="/user/detail"
  :api-param="{ id: userId }"
  active
  :items="items"
>
  <template #status-cell="{ value }">
    <el-tag :type="value === 1 ? 'success' : 'info'">
      {{ value === 1 ? '启用' : '禁用' }}
    </el-tag>
  </template>
</wd-viewer>`

const code3 = `<wd-viewer :data="row">
  <template #content="{ row }">
    <div class="profile-card">
      <el-avatar :size="56">{{ row.name?.slice(0, 1) }}</el-avatar>
      <div class="profile-meta">
        <div class="profile-name">{{ row.name }} · {{ row.job }}</div>
        <div class="profile-sub">{{ row.dept }}</div>
        <div class="profile-sub">{{ row.email }}</div>
      </div>
    </div>
  </template>
</wd-viewer>`

// 静态数据示例
const staticData = {
  name: '张伟',
  dept: '技术部',
  job: '架构师',
  email: 'user001@workdesktop.cn'
}
const basicItems = [
  { prop: 'name', label: '姓名' },
  { prop: 'dept', label: '部门' },
  { prop: 'job', label: '岗位' },
  { prop: 'email', label: '邮箱' }
]

// API 示例
const userOptions = mockStore.users.slice(0, 8).map((u) => ({ id: u.id, name: u.name }))
const userId = ref(1)
const apiViewerRef = ref()

const apiItems = [
  { prop: 'id', label: 'ID' },
  { prop: 'name', label: '姓名' },
  { prop: 'dept', label: '部门' },
  { prop: 'job', label: '岗位' },
  { prop: 'status', label: '状态' },
  { prop: 'progress', label: '目标进度' },
  { prop: 'email', label: '邮箱', span: 2 },
  { prop: 'phone', label: '手机号', span: 2 },
  { prop: 'entryTime', label: '入职日期' },
  { prop: 'createTime', label: '创建时间' }
]

function reload() {
  apiViewerRef.value?.requestApi({ id: userId.value })
}

function onLoadSuccess({ data }: { data: any }) {
  ElMessage.success(`已加载：${data?.name || ''}`)
}
</script>

<style scoped>
.example-page {
  width: 100%;
}

.viewer-toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.profile-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
}

.profile-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.profile-sub {
  margin-top: 4px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
</style>
