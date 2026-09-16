<template>
  <div class="example-page">
    <demo-block
      title="基础用法"
      desc="带标题/描述的面板，作为表单分组与详情分区容器；标题左侧带品牌色标识条，悬停呈现浮起阴影"
      :code="code1"
    >
      <wd-panel title="基本信息" description="用户基础资料">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="姓名">张三</el-descriptions-item>
          <el-descriptions-item label="部门">技术部</el-descriptions-item>
          <el-descriptions-item label="邮箱">zhangsan@example.com</el-descriptions-item>
        </el-descriptions>
      </wd-panel>

      <wd-panel title="自定义插槽" description="title 与 footer 插槽">
        <template #title>
          <span style="color: #409eff">自定义标题</span>
          <el-tag size="small" style="margin-left: 8px">标签</el-tag>
        </template>
        <p>面板主体内容。</p>
        <template #footer>
          <el-button size="small" type="primary">操作按钮</el-button>
        </template>
      </wd-panel>
    </demo-block>

    <demo-block
      title="可折叠"
      desc="collapsible 开启折叠，点击标题或箭头收起/展开，支持 v-model:opened 受控与 change 事件"
      :code="code2"
    >
      <wd-panel
        v-model:opened="opened"
        collapsible
        title="可折叠面板"
        description="点击标题区域切换"
        @change="onChange"
      >
        <p>折叠时主体与底部一并隐藏，展开时带有平滑的高度过渡动画。</p>
        <template #footer>
          <el-button size="small" type="primary">保存</el-button>
        </template>
      </wd-panel>
    </demo-block>

    <demo-block
      title="右侧操作区与阴影"
      desc="extra 插槽放置标题右侧操作；shadow 支持 always / hover（默认）/ never"
      :code="code3"
    >
      <wd-panel title="常驻阴影" shadow="always">
        <template #extra>
          <el-button link type="primary" size="small">刷新</el-button>
          <el-button link type="primary" size="small">更多</el-button>
        </template>
        <p>shadow="always" 时常驻轻阴影，适合需要突出的核心分区。</p>
      </wd-panel>

      <wd-panel title="无阴影" shadow="never" style="margin-bottom: 0">
        <p>shadow="never" 时仅保留描边，适合密集排列的次级分区。</p>
      </wd-panel>
    </demo-block>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const code1 = `<wd-panel title="基本信息" description="用户基础资料">
  <el-descriptions :column="2" border>
    <el-descriptions-item label="姓名">张三</el-descriptions-item>
  </el-descriptions>
</wd-panel>`

const code2 = `<wd-panel v-model:opened="opened" collapsible title="可折叠面板" description="点击标题区域切换">
  <p>主体内容</p>
</wd-panel>`

const code3 = `<wd-panel title="常驻阴影" shadow="always">
  <template #extra>
    <el-button link type="primary" size="small">刷新</el-button>
  </template>
  <p>主体内容</p>
</wd-panel>`

const opened = ref(true)

function onChange(v: boolean) {
  ElMessage.info(v ? '面板已展开' : '面板已收起')
}
</script>

<style scoped>
.example-page {
  width: 100%;
}
.example-page p {
  margin: 0;
  color: var(--wd-text-color-regular, #606266);
  font-size: var(--wd-font-size-base, 14px);
  line-height: 22px;
}
</style>
