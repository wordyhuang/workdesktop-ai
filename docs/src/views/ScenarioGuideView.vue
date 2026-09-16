<template>
  <div class="guide-page">
    <!-- 页头 -->
    <header class="guide-hero">
      <span class="guide-hero__bar" />
      <div class="guide-hero__body">
        <div class="guide-hero__eyebrow">
          <el-icon><MagicStick /></el-icon>
          <span>SCENARIO COOKBOOK</span>
        </div>
        <h1 class="guide-hero__title">场景搭建指引</h1>
        <p class="guide-hero__desc">
          用 WorkDesktop 的数据组件拼装后台常见业务场景。每个场景给出「适用场景 · 组件组合 · 关键代码」，
          照抄片段替换接口地址即可落地。
        </p>
        <div class="guide-hero__stats">
          <span class="guide-stat"><b>7</b><i>典型场景</i></span>
          <span class="guide-stat__divider" />
          <span class="guide-stat"><b>3</b><i>核心联动机制</i></span>
          <span class="guide-stat__divider" />
          <span class="guide-stat"><b>0</b><i>样板胶水代码</i></span>
        </div>
      </div>
    </header>

    <!-- 核心机制：先讲透联动，再看场景 -->
    <section class="guide-mechanism">
      <h2 class="guide-h2">
        <span class="guide-h2__no">00</span>
        核心联动机制
      </h2>
      <p class="guide-section-desc">
        七个场景全部建立在同一套「声明式联动」之上：不写查询 / 刷新 / 关闭的命令式代码，只约定
        <code>filter</code> 分组与刷新指令。
      </p>
      <div class="mechanism-grid">
        <div class="mechanism-card">
          <div class="mechanism-card__head">
            <span class="mechanism-card__badge">filter</span>
            <h3>筛选分组标识</h3>
          </div>
          <p>
            搜索面板与数据表格使用相同的 <code>filter</code>（如 <code>"s1"</code>），即归为一组。
            查询时搜索条件自动作为该表格的请求参数，无需手动收集表单。
          </p>
        </div>
        <div class="mechanism-card">
          <div class="mechanism-card__head">
            <span class="mechanism-card__badge">head-refresh-datagrid</span>
            <h3>声明式刷新指令</h3>
          </div>
          <p>
            写在按钮 / 抽屉触发器上，值为目标表格的 <code>filter</code>。提交成功后自动刷新对应表格；
            触发器在抽屉内时还会先关闭抽屉。
          </p>
        </div>
        <div class="mechanism-card">
          <div class="mechanism-card__head">
            <span class="mechanism-card__badge">refreshDataGrid()</span>
            <h3>命令式刷新</h3>
          </div>
          <p>
            自定义请求（如批量接口）完成后，调用
            <code>import { refreshDataGrid } from 'workdesktop-ai'</code> 主动刷新：
            <code>refreshDataGrid('s5')</code>。
          </p>
        </div>
      </div>
      <CodeBlock lang="ts" :code="mechanismCode" />
    </section>

    <!-- 场景卡片列表 -->
    <section
      v-for="(s, i) in scenarios"
      :id="s.anchor"
      :key="s.key"
      class="guide-scene"
    >
      <h2 class="guide-h2">
        <span class="guide-h2__no">{{ String(i + 1).padStart(2, '0') }}</span>
        {{ s.title }}
      </h2>
      <p class="guide-section-desc">{{ s.desc }}</p>

      <div class="guide-scene__layout">
        <aside class="guide-scene__side">
          <div class="guide-side-block">
            <p class="guide-side-label">适用场景</p>
            <ul class="guide-side-list">
              <li v-for="t in s.fit" :key="t">{{ t }}</li>
            </ul>
          </div>
          <div class="guide-side-block">
            <p class="guide-side-label">组件组合</p>
            <div class="guide-tags">
              <span v-for="c in s.components" :key="c" class="guide-tag">{{ c }}</span>
            </div>
          </div>
          <div v-if="s.points?.length" class="guide-side-block">
            <p class="guide-side-label">要点</p>
            <ul class="guide-side-list guide-side-list--tip">
              <li v-for="t in s.points" :key="t">{{ t }}</li>
            </ul>
          </div>
        </aside>
        <div class="guide-scene__main">
          <CodeBlock :lang="s.lang" :file="s.file" :code="s.code" />
        </div>
      </div>
    </section>

    <!-- 页尾导航 -->
    <footer class="guide-foot">
      <span>更多组件属性请查阅左侧组件文档与</span>
      <router-link class="guide-foot__link" to="/linkage">联动演示</router-link>
      <span>、</span>
      <router-link class="guide-foot__link" to="/playground">Playground</router-link>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { MagicStick } from '@element-plus/icons-vue'
import CodeBlock from '../components/CodeBlock.vue'

const mechanismCode = `// 方式一：声明式（推荐）—— 搜索面板与表格同组，提交后自动刷新
<wd-search-panel head-refresh-datagrid filter="s1"> ... </wd-search-panel>
<wd-data-grid api="/user/list" filter="s1" :active="true"> ... </wd-data-grid>

// 方式二：命令式 —— 自定义请求完成后手动刷新
import { request, refreshDataGrid } from 'workdesktop-ai'

await request.post('/user/batch', { ids, action: 'remove' })
refreshDataGrid('s1') // 刷新 filter="s1" 的表格`

interface Scene {
  key: string
  anchor: string
  title: string
  desc: string
  fit: string[]
  components: string[]
  points?: string[]
  lang: string
  file: string
  code: string
}

const scenarios: Scene[] = [
  {
    key: 'pagination',
    anchor: 'scene-pagination',
    title: '分页数据列表',
    desc: '搜索条件 + 接口表格 + 分页的列表页标准形态。搜索面板与表格声明式联动，分页、loading、查询全部内置。',
    fit: ['后台列表页首页', '条件检索 + 翻页', '只读数据浏览'],
    components: ['wd-panel', 'wd-search-panel', 'wd-data-grid'],
    points: [
      '两个组件使用相同 filter',
      'DataGrid 设 :active="true" 进入页面即查询',
      ':tools 控制刷新 / 页大小工具'
    ],
    lang: 'vue',
    file: 'UserList.vue',
    code: `<wd-panel title="搜索条件">
  <wd-search-panel head-refresh-datagrid filter="s1">
    <template #default="{ model }">
      <el-form-item label="关键字">
        <el-input v-model="model.name" placeholder="姓名 / 邮箱" clearable />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="model.status" clearable placeholder="全部">
          <el-option label="启用" :value="1" />
          <el-option label="禁用" :value="0" />
        </el-select>
      </el-form-item>
    </template>
  </wd-search-panel>
</wd-panel>

<wd-panel title="数据列表">
  <wd-data-grid api="/user/list" :active="true" filter="s1" :tools="{ refresh: true, size: true }">
    <el-table-column prop="id" label="ID" width="70" />
    <el-table-column prop="name" label="姓名" min-width="120" />
    <el-table-column prop="status" label="状态" width="90">
      <template #default="{ row }">
        <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
          {{ row.status === 1 ? '启用' : '禁用' }}
        </el-tag>
      </template>
    </el-table-column>
  </wd-data-grid>
</wd-panel>`
  },
  {
    key: 'maintain',
    anchor: 'scene-maintain',
    title: '数据维护（增 / 删 / 改）',
    desc: '工具栏「新增」与行内「编辑」走抽屉表单，提交成功自动关闭抽屉并刷新表格；行内删除走二次确认按钮。',
    fit: ['用户 / 配置管理', '标准 CRUD 页面', '带校验的表单维护'],
    components: ['wd-data-grid', 'wd-drawer-button', 'wd-data-form', 'wd-confirm-button'],
    points: [
      'DataForm mode 区分 create / edit',
      '编辑时抽屉触发器传 :data="row" 回填',
      'head-refresh-datagrid 提交成功后刷新同组表格'
    ],
    lang: 'vue',
    file: 'UserMaintain.vue',
    code: `<wd-data-grid api="/user/list" :active="true" filter="s2" :tools="{ refresh: true }">
  <template #toolbar="{ selection }">
    <!-- 新增：抽屉 + 表单，成功后刷新 filter=s2 的表格 -->
    <wd-drawer-button type="primary" label="新增用户" title="新增用户"
      filter="s2" head-refresh-datagrid="s2">
      <wd-data-form mode="create" submit-api="/user/save" :rules="rules">
        <template #default="{ model }">
          <el-form-item label="姓名" prop="name">
            <el-input v-model="model.name" />
          </el-form-item>
        </template>
      </wd-data-form>
    </wd-drawer-button>
  </template>

  <el-table-column label="操作" fixed="right">
    <template #default="{ row }">
      <!-- 编辑：:data 回填当前行 -->
      <wd-drawer-button link type="primary" label="编辑" :data="row"
        filter="s2" head-refresh-datagrid="s2">
        <wd-data-form mode="edit" submit-api="/user/save" :rules="rules">
          <template #default="{ model }"> ... </template>
        </wd-data-form>
      </wd-drawer-button>
      <!-- 删除：二次确认后发 DELETE /user?id=xx，成功刷新 -->
      <wd-confirm-button link type="danger" label="删除"
        confirm-text="确认删除该用户？" api="/user" :api-method="'delete'"
        :api-param="{ id: row.id }" filter="s2" head-refresh-datagrid="s2" />
    </template>
  </el-table-column>
</wd-data-grid>`
  },
  {
    key: 'detail',
    anchor: 'scene-detail',
    title: '详情查看',
    desc: '行内按钮打开对话框，内部用 Panel 分区 + 描述列表展示只读详情；:data 把当前行快照透传进弹窗。',
    fit: ['订单 / 用户详情', '只读档案查看', '弹窗内多区块信息'],
    components: ['wd-drawer-button', 'wd-panel', 'el-descriptions'],
    points: [
      'mode="dialog" 渲染为对话框而非抽屉',
      '详情可由行快照渲染，也可用 api 动态加载'
    ],
    lang: 'vue',
    file: 'UserDetail.vue',
    code: `<wd-drawer-button link type="primary" label="详情" mode="dialog"
  title="用户详情" :data="row">
  <div class="detail-body">
    <wd-panel title="基本信息" description="用户基础资料">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="姓名">{{ row.name }}</el-descriptions-item>
        <el-descriptions-item label="部门">{{ row.dept }}</el-descriptions-item>
        <el-descriptions-item label="邮箱" :span="2">{{ row.email }}</el-descriptions-item>
      </el-descriptions>
    </wd-panel>
    <wd-panel title="账号信息" description="系统账号配置">
      <wd-tips type="box" icon="WarningFilled"
        tips="详情数据来自当前行快照，正式项目可用 api 动态加载" />
    </wd-panel>
  </div>
</wd-drawer-button>`
  },
  {
    key: 'tree',
    anchor: 'scene-tree',
    title: '树形数据与远程选项',
    desc: 'DataGrid 直接吃 children 树形数据；下拉 / 复选组选项由接口加载，省去手工 request + 赋值。',
    fit: ['组织架构 / 菜单树', '层级数据浏览', '选项来自字典接口的表单'],
    components: ['wd-data-grid', 'wd-select', 'wd-checkbox-list'],
    points: [
      '树形需 row-key，默认展开用 :default-expand-all',
      'wd-select / wd-checkbox-list 传 api 自动加载选项'
    ],
    lang: 'vue',
    file: 'DeptTree.vue',
    code: `<!-- 树形表格：data-source 提供 children -->
<wd-data-grid :data-source="treeData" row-key="id"
  :default-expand-all="true" :with-selection="true">
  <el-table-column prop="name" label="部门 / 组" min-width="240" />
  <el-table-column prop="leader" label="负责人" width="140" />
</wd-data-grid>

<!-- 远程选项：接口返回字典，自动渲染 -->
<wd-select api="/options/roles" placeholder="请选择角色" style="width: 260px" />
<wd-checkbox-list api="/options/roles" :button-style="true" />

<!-- treeData 结构
[{ id: 1, name: '研发中心', children: [
   { id: 11, name: '前端组' }, { id: 12, name: '后端组' }] }] -->`
  },
  {
    key: 'batch',
    anchor: 'scene-batch',
    title: '批量操作与可编辑表格',
    desc: '表格多选收集勾选项，批量接口完成后命令式刷新；可编辑表格按列声明编辑器与校验，无保存接口时本地提交。',
    fit: ['批量启用 / 禁用 / 删除', 'Excel 式快速录入', '行内编辑 + 校验'],
    components: ['wd-data-grid', 'wd-editable-grid', 'request', 'refreshDataGrid'],
    points: [
      '多选需 row-key + :with-selection，勾选走 @selection-change',
      'editable-grid 列配置 editor: input/select/number',
      '无 saveApi 时触发 @save="{ rows }" 本地处理'
    ],
    lang: 'vue',
    file: 'BatchOps.vue',
    code: `<wd-data-grid api="/user/list" :active="true" filter="s5" row-key="id"
  :with-selection="true" @selection-change="onSelectionChange">
  <template #toolbar>
    <el-button type="danger" plain :disabled="!selection.length" @click="batch('remove')">
      批量删除
    </el-button>
  </template>
</wd-data-grid>

<wd-editable-grid :columns="columns" :model-value="rows" :with-pager="false"
  save-button-text="保存修改" @save="onSave" />

<script setup lang="ts">
import { request, refreshDataGrid } from 'workdesktop-ai'
const selection = ref([])
const onSelectionChange = (rows) => (selection.value = rows)
async function batch(action) {
  const ids = selection.value.map((r) => r.id)
  const res = await request.post('/user/batch', { ids, action })
  if (res.success) refreshDataGrid('s5')
}
const columns = [
  { prop: 'name', label: '任务名称', editor: 'input', required: true },
  { prop: 'priority', label: '优先级', editor: 'select',
    options: [{ text: '高', value: '高' }], required: true },
  { prop: 'progress', label: '进度(%)', editor: 'number', min: 0, max: 100 }
]
const onSave = ({ rows }) => console.log('本地提交', rows)
<\/script>`
  },
  {
    key: 'selector',
    anchor: 'scene-selector',
    title: '弹窗选择器',
    desc: '对话框内嵌单选表格，勾选暂存到临时变量，点「确定」才回填主表单；取消不污染已选值。',
    fit: ['选择关联用户 / 商品', '主外键关联录入', '带回填的选择弹窗'],
    components: ['wd-drawer-button', 'wd-data-grid'],
    points: [
      '默认插槽 / 底部插槽都能拿到 { close }',
      '勾选先存 temp，确定时再提交给 picked'
    ],
    lang: 'vue',
    file: 'UserPicker.vue',
    code: `<el-input :model-value="picked.map(u => u.name).join('、') || '未选择'" readonly />

<wd-drawer-button type="primary" label="选择用户" mode="dialog" title="选择用户">
  <template #default>
    <wd-data-grid :data-source="users" row-key="id" :with-selection="true"
      :with-pager="false" style="height: 360px" @selection-change="onPick" />
  </template>
  <template #footer="{ close }">
    <el-button @click="close">取消</el-button>
    <el-button type="primary" @click="confirm(close)">确定</el-button>
  </template>
</wd-drawer-button>

<script setup lang="ts">
const picked = ref([])
const temp = ref([])
const onPick = (rows) => (temp.value = rows)
function confirm(close) {
  if (temp.value.length) picked.value = [...temp.value]
  close()
}
<\/script>`
  },
  {
    key: 'io',
    anchor: 'scene-io',
    title: '数据导入与导出',
    desc: '文件 / 图片上传组件自动上传、删除二次确认；导出用 ApiButton 直接请求导出接口，成功自动提示。',
    fit: ['Excel / 附件导入', '图片素材上传', '一键导出报表'],
    components: ['wd-upload', 'wd-image-upload', 'wd-api-button'],
    points: [
      'Upload 配 limit / multiple / accept 控制约束',
      'ImageUpload 支持缩略图、数量上限、大图预览',
      'ApiButton 可配 head-refresh-datagrid 导出后刷新'
    ],
    lang: 'vue',
    file: 'ImportExport.vue',
    code: `<!-- 文件导入：自动上传，删除二次确认并调删除接口 -->
<wd-upload api="/file/upload" delete-api="/file" :limit="5" :multiple="true"
  accept=".xlsx,.xls,.csv,.pdf" button-text="选择文件上传" />

<!-- 图片上传：缩略图 + 数量限制 + 大图预览 -->
<wd-image-upload api="/file/upload" delete-api="/file" :max-count="6"
  thumbnail-size="90" tip="最多上传 6 张图片" />

<!-- 数据导出：点击请求 /user/export，成功自动提示 -->
<wd-api-button type="success" label="导出用户数据" icon="Download" api="/user/export" />`
  }
]
</script>

<style scoped>
.guide-page {
  max-width: 1080px;
  margin: 0 auto;
  color: var(--wd-text-color-primary, #303133);
}

/* —— 页头 —— */
.guide-hero {
  display: flex;
  gap: 16px;
  padding: 20px 24px;
  border: 1px solid var(--wd-border-color-light, #ebeef5);
  border-radius: 14px;
  background:
    radial-gradient(120% 140% at 0% 0%, var(--el-color-primary-light-9, #ecf5ff) 0%, var(--wd-bg-color, #fff) 58%),
    var(--wd-bg-color, #fff);
  box-shadow: 0 4px 18px rgba(13, 18, 30, 0.05);
  margin-bottom: 22px;
}
.guide-hero__bar {
  flex: 0 0 5px;
  border-radius: 5px;
  background: linear-gradient(180deg, var(--wd-color-primary, #409eff), var(--el-color-primary-light-3, #79bbff));
}
.guide-hero__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  letter-spacing: 2px;
  font-weight: 700;
  color: var(--wd-color-primary, #409eff);
}
.guide-hero__title {
  margin: 6px 0 4px;
  font-size: 26px;
  font-weight: 750;
  letter-spacing: 0.3px;
}
.guide-hero__desc {
  margin: 0;
  font-size: 14px;
  line-height: 1.7;
  color: var(--wd-text-color-regular, #606266);
  max-width: 760px;
}
.guide-hero__stats {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 14px;
}
.guide-stat {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
}
.guide-stat b {
  font-size: 22px;
  font-weight: 750;
  color: var(--wd-color-primary, #409eff);
  font-variant-numeric: tabular-nums;
}
.guide-stat i {
  font-style: normal;
  font-size: 12px;
  color: var(--wd-text-color-secondary, #909399);
}
.guide-stat__divider {
  width: 1px;
  height: 16px;
  background: var(--wd-border-color, #dcdfe6);
}

/* —— 章节标题 —— */
.guide-h2 {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 700;
  color: var(--wd-text-color-primary, #303133);
  scroll-margin-top: 12px;
}
.guide-h2__no {
  font-family: 'SFMono-Regular', Consolas, monospace;
  font-size: 12px;
  font-weight: 600;
  color: var(--wd-color-primary, #409eff);
  background: var(--el-color-primary-light-9, #ecf5ff);
  border: 1px solid var(--el-color-primary-light-7, #d9ecff);
  border-radius: 5px;
  padding: 2px 7px;
}
.guide-section-desc {
  margin: 0 0 12px;
  font-size: 13.5px;
  line-height: 1.7;
  color: var(--wd-text-color-regular, #606266);
}
.guide-section-desc code,
.mechanism-card p code {
  padding: 1px 6px;
  background: var(--wd-bg-color-page, #f4f4f5);
  border: 1px solid var(--wd-border-color-light, #e9ecf1);
  border-radius: 5px;
  color: var(--wd-color-primary, #409eff);
  font-family: 'SFMono-Regular', Consolas, monospace;
  font-size: 12px;
}

/* —— 机制卡片 —— */
.guide-mechanism {
  margin-bottom: 28px;
}
.mechanism-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 14px;
}
.mechanism-card {
  padding: 14px 16px;
  border: 1px solid var(--wd-border-color-light, #ebeef5);
  border-radius: 12px;
  background: var(--wd-bg-color, #fff);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}
.mechanism-card:hover {
  transform: translateY(-2px);
  border-color: var(--el-color-primary-light-5, #a0cfff);
  box-shadow: 0 10px 24px rgba(13, 18, 30, 0.08);
}
.mechanism-card__head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.mechanism-card__head h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 650;
}
.mechanism-card__badge {
  font-family: 'SFMono-Regular', Consolas, monospace;
  font-size: 11px;
  color: #fff;
  background: linear-gradient(135deg, var(--wd-color-primary, #409eff), var(--el-color-primary-light-3, #79bbff));
  border-radius: 5px;
  padding: 3px 7px;
  white-space: nowrap;
}
.mechanism-card p {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.75;
  color: var(--wd-text-color-regular, #606266);
}

/* —— 场景区块 —— */
.guide-scene {
  margin-bottom: 26px;
  scroll-margin-top: 12px;
}
.guide-scene__layout {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 14px;
  align-items: start;
}
.guide-scene__side {
  position: sticky;
  top: 12px;
  padding: 14px;
  border: 1px solid var(--wd-border-color-light, #ebeef5);
  border-radius: 12px;
  background: var(--wd-bg-color, #fff);
}
.guide-side-block + .guide-side-block {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed var(--wd-border-color-light, #ebeef5);
}
.guide-side-label {
  margin: 0 0 8px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--wd-text-color-secondary, #909399);
}
.guide-side-list {
  margin: 0;
  padding-left: 16px;
}
.guide-side-list li {
  font-size: 12.5px;
  line-height: 1.9;
  color: var(--wd-text-color-regular, #606266);
}
.guide-side-list--tip li {
  list-style: none;
  position: relative;
  padding-left: 4px;
}
.guide-side-list--tip li::marker {
  color: var(--wd-color-primary, #409eff);
}
.guide-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.guide-tag {
  font-family: 'SFMono-Regular', Consolas, monospace;
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 6px;
  color: var(--wd-color-primary, #409eff);
  background: var(--el-color-primary-light-9, #ecf5ff);
  border: 1px solid var(--el-color-primary-light-7, #d9ecff);
}
.guide-scene__main {
  min-width: 0;
}

/* —— 页尾 —— */
.guide-foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  padding: 14px 4px 4px;
  font-size: 13px;
  color: var(--wd-text-color-secondary, #909399);
}
.guide-foot__link {
  color: var(--wd-color-primary, #409eff);
  text-decoration: none;
  font-weight: 600;
}
.guide-foot__link:hover {
  text-decoration: underline;
}

@media (max-width: 960px) {
  .mechanism-grid {
    grid-template-columns: 1fr;
  }
  .guide-scene__layout {
    grid-template-columns: 1fr;
  }
  .guide-scene__side {
    position: static;
  }
}
</style>
