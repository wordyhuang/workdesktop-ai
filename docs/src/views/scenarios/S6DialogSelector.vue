<template>
  <div class="scenario-page">
    <wd-panel title="弹窗选择器" description="场景：从弹窗中选择数据回填 —— DialogButton 打开选择器，内嵌表格单选，确定后回填">
      <div class="selector-line">
        <span class="selector-label">已选用户：</span>
        <el-input
          :model-value="picked.map((u) => u.name).join('、') || '未选择'"
          placeholder="点击右侧按钮选择"
          readonly
          style="width: 320px"
        />
        <wd-dialog-button
          type="primary"
          text="选择用户"
          dialog-title="选择用户"
        >
          <template #default="{ close }">
            <wd-data-grid
              :data-source="users"
              row-key="id"
              :with-pager="false"
              :with-index="true"
              style="height: 360px"
              @selection-change="onPick"
            >
              <el-table-column prop="id" label="ID" width="70" />
              <el-table-column prop="name" label="姓名" min-width="120" />
              <el-table-column prop="dept" label="部门" width="120" />
              <el-table-column prop="email" label="邮箱" min-width="180" />
            </wd-data-grid>
          </template>
          <template #footer="{ close }">
            <el-button @click="close">取消</el-button>
            <el-button type="primary" @click="confirmPick(close)">确定</el-button>
          </template>
        </wd-dialog-button>
        <el-button v-if="picked.length" link type="danger" @click="picked = []">清空</el-button>
      </div>
    </wd-panel>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const users = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  name: `用户${i + 1}`,
  dept: ['技术部', '产品部', '设计部', '市场部', '运营部'][i % 5],
  email: `user${i + 1}@example.com`
}))

const picked = ref<any[]>([])
const temp = ref<any[]>([])

function onPick(rows: any[]) {
  temp.value = rows
}

function confirmPick(close: () => void) {
  if (temp.value.length) {
    picked.value = [...temp.value]
  }
  close()
}
</script>

<style scoped>
.scenario-page {
  width: 100%;
}
.selector-line {
  display: flex;
  align-items: center;
  gap: 12px;
}
.selector-label {
  font-size: 14px;
  color: #606266;
}
</style>
