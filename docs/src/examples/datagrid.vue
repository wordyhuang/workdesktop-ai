<template>
  <div class="example-page">
    <unpack-note>
      该组件自动对 API 返回数据中的 <code>data</code> 进行解包：<code>data</code> 为分页对象 <code>{ list, total, pageSize, currentPage }</code>，逐项解析出：
      <ul>
        <li><code>list</code>：表格行数据数组</li>
        <li><code>total</code>：数据总条数（用于分页）</li>
        <li><code>pageSize</code>：每页条数（回显分页器）</li>
        <li><code>currentPage</code>：当前页码（回显分页器）</li>
      </ul>
      字段名可用全局配置 <code>response.list</code> 的 <code>listName</code> / <code>totalName</code> / <code>pageSizeName</code> / <code>currentPageName</code> 自定义（默认 <code>list</code> / <code>total</code> / <code>pageSize</code> / <code>currentPage</code>）。
    </unpack-note>
    <demo-block title="API 数据 + 分页 + 搜索联动 + 工具栏"
      desc="SearchPanel 与 DataGrid 放在同一个容器内，配置相同 filter，点击查询自动刷新表格（重置到第一页）；同时演示：<br/>1. border 表格边框<br/>2. tools 内置新增/导出按钮（emit add/export 事件）<br/>3. #toolbar 插槽补充自定义按钮<br/>4. 搜索面板支持默认项 + more 展开更多隐藏条件<br/>5. 多种数据类型展示：文本、Tag、进度条、日期等<br/>6. 最右侧操作列：详情/删除按钮"
      :code="code1">
      <div>
        <wd-search-panel head-refresh-datagrid filter="main">
          <template #default="{ model }">
            <wd-form-item label="姓名" prop="name">
              <el-input v-model="model.name" placeholder="姓名 / 邮箱 / 手机号" clearable style="width: 200px" />
            </wd-form-item>
            <wd-form-item label="状态" prop="status">
              <el-select v-model="model.status" clearable placeholder="全部" style="width: 120px">
                <el-option label="启用" :value="1" />
                <el-option label="禁用" :value="0" />
              </el-select>
            </wd-form-item>
            <wd-form-item label="部门" prop="dept">
              <el-select v-model="model.dept" clearable placeholder="全部" style="width: 140px">
                <el-option label="技术部" value="技术部" />
                <el-option label="产品部" value="产品部" />
                <el-option label="设计部" value="设计部" />
                <el-option label="市场部" value="市场部" />
                <el-option label="运营部" value="运营部" />
              </el-select>
            </wd-form-item>
          </template>
          <template #more="{ model }">
            <wd-form-item label="性别" prop="gender">
              <el-radio-group v-model="model.gender">
                <el-radio :value="1">男</el-radio>
                <el-radio :value="2">女</el-radio>
              </el-radio-group>
            </wd-form-item>
            <wd-form-item label="角色" prop="role">
              <el-select v-model="model.role" clearable placeholder="全部" style="width: 120px">
                <el-option label="管理员" :value="1" />
                <el-option label="编辑" :value="2" />
                <el-option label="访客" :value="3" />
              </el-select>
            </wd-form-item>
            <wd-form-item label="入职时间" prop="entryTime">
              <el-date-picker v-model="model.entryTime" type="daterange" range-separator="至" start-placeholder="开始日期"
                end-placeholder="结束日期" value-format="YYYY-MM-DD" style="width: 260px;" />
            </wd-form-item>
            <wd-form-item label="绩效等级" prop="performance">
              <el-select v-model="model.performance" clearable placeholder="全部" style="width: 120px">
                <el-option label="A-优秀" value="A" />
                <el-option label="B-良好" value="B" />
                <el-option label="C-合格" value="C" />
                <el-option label="D-待改进" value="D" />
              </el-select>
            </wd-form-item>
          </template>
        </wd-search-panel>
        <wd-data-grid border api="/user/list" :active="true" filter="main"
          :tools="{ add: true, export: true, columnSetting: true }"
          style="margin-top: 12px;" @add="onAdd" @export="onExport">
          <template #toolbar>
            <el-button @click="onBatchImport">批量导入</el-button>
          </template>
          <el-table-column prop="id" label="ID" width="70" />
          <el-table-column label="姓名" min-width="180">
            <template #default="{ row }">
              <div class="user-cell">
                <el-avatar :size="32" :class="row.gender === 1 ? 'avatar-male' : 'avatar-female'">
                  {{ row.name.slice(0, 1) }}
                </el-avatar>
                <div class="user-meta">
                  <span class="user-name">{{ row.name }}</span>
                  <span class="user-sub">{{ row.job }}</span>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="email" label="邮箱" min-width="200" show-overflow-tooltip />
          <el-table-column prop="gender" label="性别" width="80">
            <template #default="{ row }">
              <el-tag :type="row.gender === 1 ? 'primary' : 'danger'" size="small">
                {{ row.gender === 1 ? '男' : '女' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="dept" label="部门" width="110" />
          <el-table-column prop="role" label="角色" width="100">
            <template #default="{ row }">{{ roleText(row.role) }}</template>
          </el-table-column>
          <el-table-column prop="progress" label="季度目标完成度" width="170">
            <template #default="{ row }">
              <el-progress :percentage="row.progress || 0" :stroke-width="10" :status="progressStatus(row.progress)" />
            </template>
          </el-table-column>
          <el-table-column prop="performance" label="绩效" width="90">
            <template #default="{ row }">
              <el-tag :type="performanceType(row.performance)" size="small">
                {{ row.performance || '-' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="entryTime" label="入职时间" width="130" />
          <el-table-column prop="status" label="状态" width="90">
            <template #default="{ row }">
              <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
                {{ row.status === 1 ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="170" fixed="right">
            <template #default="{ row }">
              <el-button-group>
                <wd-drawer-button
                  label="详情"
                  type="primary"
                  button-size="small"
                  :title="`${row.name} - 详情`"
                  :data="row"
                  size="60%"
                >
                  <template #default="{ data }">
                    <div class="detail-content">
                      <div class="detail-section">
                        <h4>基本信息</h4>
                        <el-descriptions :column="2" border size="default">
                          <el-descriptions-item label="工号">No.{{ String(data.id).padStart(4, '0') }}</el-descriptions-item>
                          <el-descriptions-item label="姓名">{{ data.name }}</el-descriptions-item>
                          <el-descriptions-item label="性别">
                            <el-tag :type="data.gender === 1 ? 'primary' : 'danger'" size="small">
                              {{ data.gender === 1 ? '男' : '女' }}
                            </el-tag>
                          </el-descriptions-item>
                          <el-descriptions-item label="岗位">{{ data.job }}</el-descriptions-item>
                          <el-descriptions-item label="部门">{{ data.dept }}</el-descriptions-item>
                          <el-descriptions-item label="角色">{{ roleText(data.role) }}</el-descriptions-item>
                          <el-descriptions-item label="手机号">{{ data.phone }}</el-descriptions-item>
                          <el-descriptions-item label="邮箱">{{ data.email }}</el-descriptions-item>
                          <el-descriptions-item label="入职时间">{{ data.entryTime }}</el-descriptions-item>
                          <el-descriptions-item label="状态">
                            <el-tag :type="data.status === 1 ? 'success' : 'info'" size="small">
                              {{ data.status === 1 ? '启用' : '禁用' }}
                            </el-tag>
                          </el-descriptions-item>
                          <el-descriptions-item label="上季度绩效">
                            <el-tag :type="performanceType(data.performance)" size="small">
                              {{ performanceText(data.performance) }}
                            </el-tag>
                          </el-descriptions-item>
                        </el-descriptions>
                      </div>
                      <div class="detail-section">
                        <h4>完成进度</h4>
                        <el-progress :percentage="data.progress || 0" :stroke-width="16" />
                      </div>
                      <div class="detail-section">
                        <h4>附件预览</h4>
                        <div class="viewer-trigger" @click="openViewer(row)">
                          <el-icon :size="32">
                            <Picture />
                          </el-icon>
                          <p>点击查看附件</p>
                        </div>
                      </div>
                    </div>
                  </template>
                </wd-drawer-button>

                <wd-popconfirm-button type="danger" size="small" title="确定删除该条数据吗？" @confirm="onDelete(row)">
                  删除
                </wd-popconfirm-button>
              </el-button-group>
            </template>
          </el-table-column>
        </wd-data-grid>
      </div>
    </demo-block>

    <demo-block title="工具栏：按钮形态 / 尺寸 / 位置"
      desc="tools.mode 指定内置工具按钮形态（round 圆角 / square 方角 / group 连续按钮组），tools.buttonSize 指定按钮尺寸（large/default/small，与 el-button 对齐：40/32/24px）；tools-position 指定内置工具组位置（left/right/bottom，默认 right），toolbar-position 指定自定义工具栏（toolbar 插槽 + 新增/导出）位置（left/right/bottom，默认 left）；任一组置于 bottom 时与分页器合并在同一行"
      :code="codeTools">
      <div class="toolbar-demo-controls">
        <div class="toolbar-demo-item">
          <span class="toolbar-demo-label">工具按钮形态：</span>
          <el-radio-group v-model="toolMode" size="small">
            <el-radio-button value="round">圆角</el-radio-button>
            <el-radio-button value="square">方角</el-radio-button>
            <el-radio-button value="group">按钮组</el-radio-button>
          </el-radio-group>
        </div>
        <div class="toolbar-demo-item">
          <span class="toolbar-demo-label">按钮尺寸：</span>
          <el-radio-group v-model="toolSize" size="small">
            <el-radio-button value="large">大</el-radio-button>
            <el-radio-button value="default">默认</el-radio-button>
            <el-radio-button value="small">小</el-radio-button>
          </el-radio-group>
        </div>
        <div class="toolbar-demo-item">
          <span class="toolbar-demo-label">内置工具组位置：</span>
          <el-radio-group v-model="toolsPos" size="small">
            <el-radio-button value="left">左</el-radio-button>
            <el-radio-button value="right">右</el-radio-button>
            <el-radio-button value="bottom">底部</el-radio-button>
          </el-radio-group>
        </div>
        <div class="toolbar-demo-item">
          <span class="toolbar-demo-label">自定义栏位置：</span>
          <el-radio-group v-model="toolbarPos" size="small">
            <el-radio-button value="left">左</el-radio-button>
            <el-radio-button value="right">右</el-radio-button>
            <el-radio-button value="bottom">底部</el-radio-button>
          </el-radio-group>
        </div>
      </div>
      <wd-data-grid border api="/user/list" :active="true" row-key="id"
        :tools="{ add: true, export: true, columnSetting: true, mode: toolMode, buttonSize: toolSize }"
        :tools-position="toolsPos" :toolbar-position="toolbarPos"
        style="margin-top: 12px;" @add="onAdd" @export="onExport">
        <template #toolbar>
          <el-button @click="onBatchImport">批量导入</el-button>
        </template>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="姓名" min-width="140" />
        <el-table-column prop="dept" label="部门" width="120" />
        <el-table-column prop="status" label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
      </wd-data-grid>
    </demo-block>

    <demo-block title="静态数据 + 动态列" desc="dataSource 传入静态数组；dynamic-column 开启列设置（隐藏/排序/持久化）"
      :code="code2">
      <wd-data-grid :data-source="staticRows" :dynamic-column="true"
        column-storage-key="doc-datagrid-static" :with-index="true" border>
        <el-table-column prop="code" label="项目编号" width="110" />
        <el-table-column prop="name" label="项目名称" min-width="200" show-overflow-tooltip />
        <el-table-column prop="owner" label="负责人" width="90" />
        <el-table-column prop="members" label="团队" width="80">
          <template #default="{ row }">{{ row.members }} 人</template>
        </el-table-column>
        <el-table-column prop="priority" label="优先级" width="90">
          <template #default="{ row }">
            <el-tag :type="priorityType(row.priority)" size="small" effect="dark">{{ row.priority }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="progress" label="进度" width="170">
          <template #default="{ row }">
            <el-progress :percentage="row.progress" :stroke-width="10" :status="row.done ? 'success' : ''" />
          </template>
        </el-table-column>
        <el-table-column prop="deadline" label="截止日期" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="projectStatusType(row.status)" size="small">{{ projectStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
      </wd-data-grid>
    </demo-block>

    <demo-block title="表格 / 列表清单模式（卡片）"
      desc="开启 mode-switch 并提供 card-item 插槽后，工具栏出现「表格/列表切换」按钮，点击在表格视图与列表清单（卡片）视图间切换，@mode-change 回传当前视图（table/card）；card-item 插槽入参 { row, index }，单卡片内容完全自定义"
      :code="codeMode">
      <wd-data-grid :data-source="staticRows" :mode-switch="true" row-key="code"
        @mode-change="(m: string) => ElMessage.info(m === 'card' ? '已切换为列表清单视图' : '已切换为表格视图')">
        <el-table-column prop="code" label="项目编号" width="110" />
        <el-table-column prop="name" label="项目名称" min-width="200" show-overflow-tooltip />
        <el-table-column prop="owner" label="负责人" width="90" />
        <el-table-column prop="priority" label="优先级" width="90">
          <template #default="{ row }">
            <el-tag :type="priorityType(row.priority)" size="small" effect="dark">{{ row.priority }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="progress" label="进度" width="170">
          <template #default="{ row }">
            <el-progress :percentage="row.progress" :stroke-width="10" :status="row.done ? 'success' : ''" />
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="projectStatusType(row.status)" size="small">{{ projectStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <!-- 列表清单（卡片）模式：单卡片内容自定义 -->
        <template #card-item="{ row }">
          <div class="prj-card">
            <div class="prj-card__head">
              <span class="prj-card__name">{{ row.name }}</span>
              <el-tag :type="projectStatusType(row.status)" size="small">{{ projectStatusText(row.status) }}</el-tag>
            </div>
            <div class="prj-card__meta">
              <span>{{ row.code }}</span>
              <span>负责人 {{ row.owner }}</span>
              <span>截止 {{ row.deadline }}</span>
            </div>
            <div class="prj-card__foot">
              <el-progress :percentage="row.progress" :stroke-width="8" :status="row.done ? 'success' : ''" style="flex:1" />
              <el-tag :type="priorityType(row.priority)" size="small" effect="dark">{{ row.priority }}</el-tag>
            </div>
          </div>
        </template>
      </wd-data-grid>
    </demo-block>

    <demo-block title="方法调用（ref）"
      desc="给组件加 ref 后，可通过 grid.refresh() / grid.search(params) / grid.getSelection() / getCartList() / clearCart() / clearSelection() 等方法编程式操作表格，同时演示：<br/>1. 多选 + 选中回显（selectionKey）：v-model:model-value 双向绑定选中项回显勾选<br/>2. 跨页选择「购物车」：勾选行跨页累计，翻页/搜索不清空"
      :code="code4">
      <div style="margin-bottom: 12px">
        <!-- 多选 + selectionKey 示例控制区 -->
        <span style="margin-right: 12px">当前选中：{{ checkedNames.join('、') || '（空）' }}</span>
        <el-button size="small" @click="setPreset">设置预选（回显勾选）</el-button>
        <el-button size="small" @click="checkedNames = []">清空选中</el-button>
        <br /><br />
        <!-- 跨页购物车示例控制区 -->
        <span style="margin-right: 12px">已选购物车 {{ cartCount }} 项</span>
        <el-button size="small" @click="showCartCount">getCartList() 取购物车</el-button>
        <el-button size="small" @click="clearCartDemo">clearCart() 清空购物车</el-button>
        <br /><br />
        <!-- 通用方法调用区 -->
        <el-button size="small" @click="callRefresh">refresh() 刷新</el-button>
        <el-button size="small" @click="callSearch">search({ status: 1 }) 只看启用</el-button>
        <el-button size="small" @click="callResetSearch">resetSearch() 重置查询</el-button>
        <el-button size="small" @click="callGetSelection">getSelection() 取当前页选中</el-button>
        <el-button size="small" @click="callClearSelection">clearSelection() 清空当前页选择</el-button>
      </div>
      <wd-data-grid ref="gridRef" border api="/user/list" :active="true" row-key="id" :with-selection="true"
        selection-key="name" v-model:model-value="checkedNames" :with-selection-cart="true" cart-row-key="id"
        :tools="{ refresh: true }" @cart-change="(v: any[]) => (cartCount = v.length)">
        <el-table-column prop="name" label="姓名" min-width="120" />
        <el-table-column prop="dept" label="部门" width="120" />
        <el-table-column prop="status" label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
      </wd-data-grid>
    </demo-block>

    <demo-block title="高度模式"
      desc="两种高度模式：<br/>1. height='fix' - 贴合定高父容器：下方 .fix-box 为高 520px 的定高容器，表格 height='fix' 贴合其内容区，46 行数据超出容器高度，仅行区滚动、表头与工具栏保持固定<br/>2. 固定高度 - 不传 'fix' 传数字/CSS 长度时，表格整体取固定高度，行区内部滚动（此处 :height=&quot;420&quot;）"
      :code="codeFix">
      <div class="fix-box"><!-- 定高/可滚动父容器：表格高度以此容器内容区为界 -->
        <wd-data-grid :data-source="fixRows" height="fix" row-key="id" :tools="{ refresh: true, size: true }">
          <el-table-column prop="id" label="#" width="60" />
          <el-table-column prop="name" label="迭代任务" min-width="240" show-overflow-tooltip />
          <el-table-column prop="owner" label="负责人" width="90" />
          <el-table-column prop="dept" label="所属组" width="100" />
          <el-table-column prop="priority" label="优先级" width="90">
            <template #default="{ row }">
              <el-tag :type="priorityType(row.priority)" size="small" effect="plain">{{ row.priority }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="taskStatusType(row.status)" size="small">{{ taskStatusText(row.status) }}</el-tag>
            </template>
          </el-table-column>
        </wd-data-grid>
      </div>
      <div style="margin-top: 20px;">
        <wd-data-grid :data-source="fixRows" :height="420" row-key="id" :tools="{ refresh: true }">
          <el-table-column prop="id" label="#" width="60" />
          <el-table-column prop="name" label="迭代任务" min-width="240" show-overflow-tooltip />
          <el-table-column prop="owner" label="负责人" width="90" />
          <el-table-column prop="dept" label="所属组" width="100" />
          <el-table-column prop="priority" label="优先级" width="90">
            <template #default="{ row }">
              <el-tag :type="priorityType(row.priority)" size="small" effect="plain">{{ row.priority }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="taskStatusType(row.status)" size="small">{{ taskStatusText(row.status) }}</el-tag>
            </template>
          </el-table-column>
        </wd-data-grid>
      </div>
    </demo-block>
  </div>

  <!-- 附件大图预览：使用 ElementPlus 内置 el-image-viewer -->
  <el-image-viewer v-if="viewerVisible" :url-list="viewerSrc ? [viewerSrc] : []" @close="viewerVisible = false" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Picture } from '@element-plus/icons-vue'

// 工具按钮形态：round 圆角 / square 方角 / group 按钮组
const toolMode = ref<'round' | 'square' | 'group'>('round')
// 工具按钮尺寸：large / default / small（与 el-button 一致）
const toolSize = ref<'large' | 'default' | 'small'>('default')
// 内置工具组位置：left / right（默认）/ bottom
const toolsPos = ref<'left' | 'right' | 'bottom'>('right')
// 自定义工具栏位置：left（默认）/ right / bottom
const toolbarPos = ref<'left' | 'right' | 'bottom'>('left')

const code4 = `<!-- 同时演示：多选回显 + 跨页购物车 + 方法调用(ref) -->
<div style="margin-bottom: 12px">
  <!-- 多选 + selectionKey 示例控制区 -->
  <span style="margin-right: 12px">当前选中：{{ checkedNames.join('、') || '（空）' }}</span>
  <el-button size="small" @click="setPreset">设置预选（回显勾选）</el-button>
  <el-button size="small" @click="checkedNames = []">清空选中</el-button>
  <br/><br/>
  <!-- 跨页购物车示例控制区 -->
  <span style="margin-right: 12px">已选购物车 {{ cartCount }} 项</span>
  <el-button size="small" @click="showCartCount">getCartList() 取购物车</el-button>
  <el-button size="small" @click="clearCartDemo">clearCart() 清空购物车</el-button>
  <br/><br/>
  <!-- 通用方法调用区 -->
  <el-button size="small" @click="callRefresh">refresh() 刷新</el-button>
  <el-button size="small" @click="callSearch">search({ status: 1 }) 只看启用</el-button>
  <el-button size="small" @click="callResetSearch">resetSearch() 重置查询</el-button>
  <el-button size="small" @click="callGetSelection">getSelection() 取当前页选中</el-button>
  <el-button size="small" @click="callClearSelection">clearSelection() 清空当前页选择</el-button>
</div>
<wd-data-grid ref="gridRef" 
  border
  api="/user/list" 
  :active="true" 
  row-key="id" 
  :with-selection="true"
  selection-key="name"
  v-model:model-value="checkedNames"
  :with-selection-cart="true" 
  cart-row-key="id"
  :tools="{ refresh: true }"
  @cart-change="(v) => (cartCount = v.length)"
>
  <el-table-column prop="name" label="姓名" min-width="120" />
  <el-table-column prop="dept" label="部门" width="120" />
  <el-table-column prop="status" label="状态" width="90">
    <template #default="{ row }">
      <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
        {{ row.status === 1 ? '启用' : '禁用' }}
      </el-tag>
    </template>
  </el-table-column>
</wd-data-grid>

// 可用方法列表：
// gridRef.value.refresh()                       -> 刷新当前页
// gridRef.value.search({ status: 1 })           -> 带条件查询（回到第一页）
// gridRef.value.resetSearch()                   -> 清空条件并刷新
// gridRef.value.getSelection()                  -> 获取当前页选中行数组
// gridRef.value.clearSelection()                -> 清空当前页选中
// gridRef.value.getCartList()                   -> 获取购物车（跨页暂存）数组
// gridRef.value.clearCart()                     -> 清空购物车（计数归零）`

const gridRef = ref()

/** 多选 + selectionKey 示例：选中项（name 值数组），初始预选一项验证回显勾选 */
const checkedNames = ref<string[]>(['张伟'])

function setPreset() {
  checkedNames.value = ['王芳', '李娜', '刘洋']
  ElMessage.success('已设置预选，表格自动勾选对应行')
}

/** 跨页选择「购物车」示例 */
const cartCount = ref(0)

function showCartCount() {
  const rows = gridRef.value?.getCartList() || []
  ElMessage.info(`getCartList() 暂存 ${rows.length} 项`)
}
function clearCartDemo() {
  gridRef.value?.clearCart()
  ElMessage.success('已调用 clearCart()')
}

function callRefresh() {
  gridRef.value?.refresh()
  ElMessage.success('已调用 refresh()')
}
function callSearch() {
  gridRef.value?.search({ status: 1 })
  ElMessage.success('已调用 search({ status: 1 })')
}
function callResetSearch() {
  gridRef.value?.resetSearch()
  ElMessage.success('已调用 resetSearch()')
}
function callGetSelection() {
  const rows = gridRef.value?.getSelection() || []
  ElMessage.info(`getSelection() 选中 ${rows.length} 行`)
}
function callClearSelection() {
  gridRef.value?.clearSelection()
  ElMessage.success('已调用 clearSelection()')
}

const code1 = `<div>
  <wd-search-panel head-refresh-datagrid filter="main">
    <template #default="{ model }">
      <wd-form-item label="姓名" prop="name">
        <el-input v-model="model.name" placeholder="姓名 / 邮箱 / 手机号" clearable />
      </wd-form-item>
      <wd-form-item label="状态" prop="status">
        <el-select v-model="model.status" clearable placeholder="全部">
          <el-option label="启用" :value="1" />
          <el-option label="禁用" :value="0" />
        </el-select>
      </wd-form-item>
      <wd-form-item label="部门" prop="dept">
        <el-select v-model="model.dept" clearable placeholder="全部">
          <el-option label="技术部" value="技术部" />
          <el-option label="产品部" value="产品部" />
          <el-option label="设计部" value="设计部" />
          <el-option label="市场部" value="市场部" />
          <el-option label="运营部" value="运营部" />
        </el-select>
      </wd-form-item>
    </template>
    <!-- more 插槽：点击「展开」显示更多隐藏搜索项 -->
    <template #more="{ model }">
      <wd-form-item label="性别" prop="gender">
        <el-radio-group v-model="model.gender">
          <el-radio :value="1">男</el-radio>
          <el-radio :value="2">女</el-radio>
        </el-radio-group>
      </wd-form-item>
      <wd-form-item label="角色" prop="role">
        <el-select v-model="model.role" clearable placeholder="全部">
          <el-option label="管理员" :value="1" />
          <el-option label="编辑" :value="2" />
          <el-option label="访客" :value="3" />
        </el-select>
      </wd-form-item>
      <wd-form-item label="入职时间" prop="entryTime">
        <el-date-picker
          v-model="model.entryTime"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
        />
      </wd-form-item>
      <wd-form-item label="绩效等级" prop="performance">
        <el-select v-model="model.performance" clearable placeholder="全部">
          <el-option label="A-优秀" value="A" />
          <el-option label="B-良好" value="B" />
          <el-option label="C-合格" value="C" />
          <el-option label="D-待改进" value="D" />
        </el-select>
      </wd-form-item>
    </template>
  </wd-search-panel>
  <wd-data-grid 
    border 
    api="/user/list" 
    :active="true" 
    filter="main" 
    :tools="{ add: true, export: true, columnSetting: true }"
    style="margin-top: 12px;"
    @add="onAdd"
    @export="onExport"
  >
    <template #toolbar>
      <el-button @click="onBatchImport">批量导入</el-button>
    </template>
    <el-table-column prop="id" label="ID" width="70" />
    <!-- 头像 + 姓名/岗位 双行单元格 -->
    <el-table-column label="姓名" min-width="180">
      <template #default="{ row }">
        <div style="display:flex;align-items:center;gap:8px">
          <el-avatar :size="32" :class="row.gender === 1 ? 'avatar-male' : 'avatar-female'">
            {{ row.name.slice(0, 1) }}
          </el-avatar>
          <div style="display:flex;flex-direction:column;line-height:1.3">
            <span>{{ row.name }}</span>
            <span style="font-size:12px;color:#909399">{{ row.job }}</span>
          </div>
        </div>
      </template>
    </el-table-column>
    <el-table-column prop="email" label="邮箱" min-width="200" show-overflow-tooltip />
    <el-table-column prop="gender" label="性别" width="80">
      <template #default="{ row }">
        <el-tag :type="row.gender === 1 ? 'primary' : 'danger'" size="small">
          {{ row.gender === 1 ? '男' : '女' }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column prop="dept" label="部门" width="110" />
    <el-table-column prop="role" label="角色" width="100">
      <template #default="{ row }">{{ roleText(row.role) }}</template>
    </el-table-column>
    <el-table-column prop="progress" label="季度目标完成度" width="170">
      <template #default="{ row }">
        <el-progress :percentage="row.progress || 0" :stroke-width="10" :status="progressStatus(row.progress)" />
      </template>
    </el-table-column>
    <el-table-column prop="performance" label="绩效" width="100">
      <template #default="{ row }">
        <el-tag :type="performanceType(row.performance)" size="small">
          {{ performanceText(row.performance) }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column prop="entryTime" label="入职时间" width="130" />
    <el-table-column prop="status" label="状态" width="90">
      <template #default="{ row }">
        <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
          {{ row.status === 1 ? '启用' : '禁用' }}
        </el-tag>
      </template>
    </el-table-column>
    <!-- 固定在右侧的操作列：el-button-group + small 实底按钮 -->
    <el-table-column label="操作" width="170" fixed="right">
      <template #default="{ row }">
        <el-button-group>
          <!-- size 是抽屉尺寸；按钮尺寸走 button-size（与弹层尺寸解耦） -->
          <wd-drawer-button
            label="详情"
            type="primary"
            button-size="small"
            :title="\`\${row.name} - 详情\`"
            :data="row"
            size="60%"
          >
            <template #default="{ data }">
              <el-descriptions :column="2" border>
                <el-descriptions-item label="工号">No.{{ String(data.id).padStart(4, '0') }}</el-descriptions-item>
                <el-descriptions-item label="姓名">{{ data.name }}</el-descriptions-item>
                <el-descriptions-item label="岗位">{{ data.job }}</el-descriptions-item>
                <el-descriptions-item label="部门">{{ data.dept }}</el-descriptions-item>
                <el-descriptions-item label="手机号">{{ data.phone }}</el-descriptions-item>
                <el-descriptions-item label="邮箱">{{ data.email }}</el-descriptions-item>
                <el-descriptions-item label="入职时间">{{ data.entryTime }}</el-descriptions-item>
                <el-descriptions-item label="状态">{{ data.status === 1 ? '启用' : '禁用' }}</el-descriptions-item>
              </el-descriptions>
            </template>
          </wd-drawer-button>
          <wd-popconfirm-button
            type="danger"
            size="small"
            title="确定删除该条数据吗？"
            @confirm="onDelete(row)"
          >
            删除
          </wd-popconfirm-button>
        </el-button-group>
      </template>
    </el-table-column>
  </wd-data-grid>
</div>`

const codeTools = `<!-- 切换控件：按钮形态 / 尺寸 / 内置工具组位置 / 自定义栏位置 -->
<div class="toolbar-demo-controls">
  <div class="toolbar-demo-item">
    <span class="toolbar-demo-label">工具按钮形态：</span>
    <el-radio-group v-model="toolMode" size="small">
      <el-radio-button value="round">圆角</el-radio-button>
      <el-radio-button value="square">方角</el-radio-button>
      <el-radio-button value="group">按钮组</el-radio-button>
    </el-radio-group>
  </div>
  <div class="toolbar-demo-item">
    <span class="toolbar-demo-label">按钮尺寸：</span>
    <el-radio-group v-model="toolSize" size="small">
      <el-radio-button value="large">大</el-radio-button>
      <el-radio-button value="default">默认</el-radio-button>
      <el-radio-button value="small">小</el-radio-button>
    </el-radio-group>
  </div>
  <div class="toolbar-demo-item">
    <span class="toolbar-demo-label">内置工具组位置：</span>
    <el-radio-group v-model="toolsPos" size="small">
      <el-radio-button value="left">左</el-radio-button>
      <el-radio-button value="right">右</el-radio-button>
      <el-radio-button value="bottom">底部</el-radio-button>
    </el-radio-group>
  </div>
  <div class="toolbar-demo-item">
    <span class="toolbar-demo-label">自定义栏位置：</span>
    <el-radio-group v-model="toolbarPos" size="small">
      <el-radio-button value="left">左</el-radio-button>
      <el-radio-button value="right">右</el-radio-button>
      <el-radio-button value="bottom">底部</el-radio-button>
    </el-radio-group>
  </div>
</div>
<wd-data-grid
  border
  api="/user/list"
  :active="true"
  row-key="id"
  :tools="{ add: true, export: true, columnSetting: true, mode: toolMode, buttonSize: toolSize }"
  :tools-position="toolsPos"
  :toolbar-position="toolbarPos"
  style="margin-top: 12px;"
  @add="onAdd"
  @export="onExport"
>
  <!-- toolbar 插槽：自定义按钮，归入自定义工具栏组 -->
  <template #toolbar>
    <el-button @click="onBatchImport">批量导入</el-button>
  </template>
  <el-table-column prop="id" label="ID" width="80" />
  <el-table-column prop="name" label="姓名" min-width="140" />
  <el-table-column prop="dept" label="部门" width="120" />
  <el-table-column prop="status" label="状态" width="90">
    <template #default="{ row }">
      <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
        {{ row.status === 1 ? '启用' : '禁用' }}
      </el-tag>
    </template>
  </el-table-column>
</wd-data-grid>

// script 中的切换状态：
// const toolMode = ref<'round' | 'square' | 'group'>('round')
// const toolSize = ref<'large' | 'default' | 'small'>('default')
// const toolsPos = ref<'left' | 'right' | 'bottom'>('right')      // 默认 right
// const toolbarPos = ref<'left' | 'right' | 'bottom'>('left')    // 默认 left
// 任一组置于 bottom 时，与分页器合并在同一行展示`

const code2 = `<!-- 静态项目台账：编号/名称/团队/优先级/进度/截止日期/状态 -->
<wd-data-grid :data-source="rows"
  :dynamic-column="true" column-storage-key="demo" :with-index="true" border>
  <el-table-column prop="code" label="项目编号" width="110" />
  <el-table-column prop="name" label="项目名称" min-width="200" show-overflow-tooltip />
  <el-table-column prop="owner" label="负责人" width="90" />
  <el-table-column label="团队" width="80">
    <template #default="{ row }">{{ row.members }} 人</template>
  </el-table-column>
  <el-table-column label="优先级" width="90">
    <template #default="{ row }">
      <el-tag :type="priorityType(row.priority)" size="small" effect="dark">{{ row.priority }}</el-tag>
    </template>
  </el-table-column>
  <el-table-column label="进度" width="170">
    <template #default="{ row }">
      <el-progress :percentage="row.progress" :stroke-width="10" :status="row.done ? 'success' : ''" />
    </template>
  </el-table-column>
  <el-table-column prop="deadline" label="截止日期" width="120" />
  <el-table-column label="状态" width="100">
    <template #default="{ row }">
      <el-tag :type="projectStatusType(row.status)" size="small">
        {{ projectStatusText(row.status) }}
      </el-tag>
    </template>
  </el-table-column>
</wd-data-grid>`

const codeMode = `<!-- 开启 mode-switch + card-item 插槽：工具栏出现「表格/列表切换」按钮 -->
<wd-data-grid :data-source="rows" :mode-switch="true" row-key="code"
  @mode-change="onModeChange">
  <el-table-column prop="code" label="项目编号" width="110" />
  <el-table-column prop="name" label="项目名称" min-width="200" show-overflow-tooltip />
  <el-table-column prop="owner" label="负责人" width="90" />
  <el-table-column label="优先级" width="90">
    <template #default="{ row }">
      <el-tag :type="priorityType(row.priority)" size="small" effect="dark">{{ row.priority }}</el-tag>
    </template>
  </el-table-column>
  <el-table-column label="进度" width="170">
    <template #default="{ row }">
      <el-progress :percentage="row.progress" :stroke-width="10" :status="row.done ? 'success' : ''" />
    </template>
  </el-table-column>
  <el-table-column label="状态" width="100">
    <template #default="{ row }">
      <el-tag :type="projectStatusType(row.status)" size="small">
        {{ projectStatusText(row.status) }}
      </el-tag>
    </template>
  </el-table-column>

  <!-- 列表清单（卡片）模式：单卡片内容完全自定义，入参 { row, index } -->
  <template #card-item="{ row }">
    <div class="prj-card">
      <div class="prj-card__head">
        <span class="prj-card__name">{{ row.name }}</span>
        <el-tag :type="projectStatusType(row.status)" size="small">
          {{ projectStatusText(row.status) }}
        </el-tag>
      </div>
      <div class="prj-card__meta">
        <span>{{ row.code }}</span>
        <span>负责人 {{ row.owner }}</span>
        <span>截止 {{ row.deadline }}</span>
      </div>
      <div class="prj-card__foot">
        <el-progress :percentage="row.progress" :stroke-width="8"
          :status="row.done ? 'success' : ''" style="flex:1" />
        <el-tag :type="priorityType(row.priority)" size="small" effect="dark">{{ row.priority }}</el-tag>
      </div>
    </div>
  </template>
</wd-data-grid>

<script setup>
// mode-change 回传当前视图：'table' | 'card'，可做视图偏好持久化
function onModeChange(mode) {}
<\/script>`

const codeFix = `<template>
  <div class="fix-box"><!-- 定高/可滚动父容器：表格高度以此容器内容区为界 -->
    <wd-data-grid :data-source="rows" height="fix" row-key="id">
      <el-table-column prop="id" label="#" width="60" />
      <el-table-column prop="name" label="迭代任务" min-width="240" show-overflow-tooltip />
      <el-table-column prop="owner" label="负责人" width="90" />
      <el-table-column prop="dept" label="所属组" width="100" />
      <el-table-column label="优先级" width="90">
        <template #default="{ row }">
          <el-tag :type="priorityType(row.priority)" size="small" effect="plain">{{ row.priority }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="taskStatusType(row.status)" size="small">{{ taskStatusText(row.status) }}</el-tag>
        </template>
      </el-table-column>
    </wd-data-grid>
  </div>
  <div style="margin-top: 20px;">
    <wd-data-grid :data-source="rows" :height="420" row-key="id">
      <el-table-column prop="id" label="#" width="60" />
      <el-table-column prop="name" label="迭代任务" min-width="240" show-overflow-tooltip />
      <el-table-column prop="owner" label="负责人" width="90" />
      <el-table-column prop="dept" label="所属组" width="100" />
      <el-table-column label="优先级" width="90">
        <template #default="{ row }">
          <el-tag :type="priorityType(row.priority)" size="small" effect="plain">{{ row.priority }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="taskStatusType(row.status)" size="small">{{ taskStatusText(row.status) }}</el-tag>
        </template>
      </el-table-column>
    </wd-data-grid>
  </div>
</template>

<style scoped>
.fix-box { height: 520px; }  /* 内容区固定高；也可为 flex 伸展/可滚动容器 */
</style>

<!-- 两种高度模式说明：
  1. height="fix"：顶部取自身位置、底部贴合最近可约束祖先的内容区底；
     数据超出时仅行区域内滚动、表头固定；祖先无定高/滚动约束时退化为内容自适应。
  2. height="420"：数字/CSS 长度：表格整体取固定高度，行区内部滚动 -->`

// 事件处理器：按钮点击只发事件，业务（打开新增弹窗/下载文件）由使用方实现

function onAdd() {
  ElMessage.info('「新增」：业务里在此打开新增抽屉/弹窗')
}
function onExport() {
  ElMessage.success('「导出」：业务里在此发起文件下载')
}
function onBatchImport() {
  ElMessage.info('「批量导入」：toolbar 插槽补充的按钮')
}

function roleText(role: number) {
  return { 1: '管理员', 2: '编辑', 3: '访客' }[role] || '未知'
}

function performanceType(p: string) {
  return { A: 'danger', B: 'success', C: 'warning', D: 'info' }[p] || 'info'
}

function performanceText(p: string) {
  return { A: 'A · 优秀', B: 'B · 良好', C: 'C · 合格', D: 'D · 待改进' }[p] || '-'
}

/** 进度条状态：完成显绿，严重滞后显红，其余默认蓝色 */
function progressStatus(percent: number) {
  if (percent >= 100) return 'success'
  if (percent < 30) return 'exception'
  if (percent >= 80) return 'warning'
  return ''
}

/** 优先级标签色：紧急/高/中/低 */
function priorityType(p: string) {
  return { 紧急: 'danger', 高: 'warning', 中: 'primary', 低: 'info' }[p] || 'info'
}

/** 项目状态（done / doing / risk / pause） */
function projectStatusType(s: string) {
  return { done: 'success', doing: 'primary', risk: 'danger', pause: 'info' }[s] || 'info'
}
function projectStatusText(s: string) {
  return { done: '已上线', doing: '进行中', risk: '有风险', pause: '已暂停' }[s] || '进行中'
}

/** 迭代任务状态（done / doing / todo） */
function taskStatusType(s: string) {
  return { done: 'success', doing: 'warning', todo: 'info' }[s] || 'info'
}
function taskStatusText(s: string) {
  return { done: '已完成', doing: '进行中', todo: '待开始' }[s] || '待开始'
}

/** 附件预览相关状态 */
const viewerVisible = ref(false)
const viewerSrc = ref('')

/** 打开附件预览 */
function openViewer(row: any) {
  // 模拟一张示例图片（实际业务中来自 row.avatar 或 row.attachments 等字段）
  viewerSrc.value = `https://picsum.photos/800/600?random=${row.id || 1}`
  viewerVisible.value = true
}

function onDelete(row: any) {
  ElMessage.success(`删除成功：${row.name || '---'}`)
}

/** 静态示例：2026 Q3 在研项目台账 */
const staticRows = [
  { code: 'PRJ-2026-001', name: 'WorkDesktop 低代码组件库 3.0', owner: '张伟', members: 6, priority: '高', progress: 92, deadline: '2026-09-30', status: 'doing', done: false },
  { code: 'PRJ-2026-002', name: '订单中台微服务拆分与重构', owner: '刘洋', members: 9, priority: '紧急', progress: 100, deadline: '2026-07-15', status: 'done', done: true },
  { code: 'PRJ-2026-003', name: '经营数据看板（二期）', owner: '陈静', members: 4, priority: '中', progress: 65, deadline: '2026-10-20', status: 'doing', done: false },
  { code: 'PRJ-2026-004', name: 'App 端 H5 离线包与性能优化', owner: '赵磊', members: 5, priority: '高', progress: 43, deadline: '2026-08-31', status: 'risk', done: false },
  { code: 'PRJ-2026-005', name: '统一权限中心（RBAC + 数据权限）', owner: '王芳', members: 7, priority: '紧急', progress: 27, deadline: '2026-09-10', status: 'risk', done: false },
  { code: 'PRJ-2025-018', name: '官网改版与品牌视觉升级', owner: '吴婷', members: 3, priority: '低', progress: 100, deadline: '2026-05-20', status: 'done', done: true },
  { code: 'PRJ-2026-006', name: '消息推送通道整合（短信/站内/企微）', owner: '周杰', members: 4, priority: '中', progress: 12, deadline: '2026-11-30', status: 'pause', done: false },
  { code: 'PRJ-2026-007', name: '开放平台 OpenAPI 与开发者门户', owner: '徐强', members: 8, priority: '高', progress: 58, deadline: '2026-12-15', status: 'doing', done: false }
]

/** 高度示例：Sprint-26 迭代任务清单（46 条，用于验证行区滚动） */
const taskTitles = [
  '登录页接入图形验证码', '用户列表支持列拖拽排序', '修复分页器页码越界问题', '表格空数据插画替换',
  '封装 useTable 组合式 API', '导出 Excel 增加耗时提示', '搜索条件 URL 同步', '字典项接入远程缓存',
  '权限指令 v-permission 补全单测', '暗色主题下下拉框配色修正', '组织树懒加载与勾选回显', '文件上传断点续传',
  '富文本编辑器图片压缩', '操作日志增加操作人筛选', '角色复制功能联调', '数据字典批量导入',
  '菜单图标支持自定义 SVG', '个人中心手机号换绑', '站内信已读/未读批量处理', 'Webhook 重试策略调优',
  'SSO 单点登录协议升级', '列表批量编辑性能优化', '审批流加签/减签支持', '租户隔离回归测试',
  '看板图表自适应重绘', '打印模板变量插值', '告警规则静默时段配置', 'API 限流熔断参数面板',
  '密码强度规则可配置化', '登录设备管理与下线', '消息模板多语言改造', '文件预览支持 Office 格式',
  '首页快捷入口个性化排序', '表格合计行逻辑修正', '日期控件禁用态对比度修复', '导出任务中心进度轮询',
  '第三方企微通讯录同步', '操作审计日志归档', '动态表单联动规则引擎', '大屏数据实时推送',
  '结算单对账差异高亮', '退款流程状态机梳理', '灰度发布按部门圈选', '接口 Mock 数据与文档同步',
  '骨架屏在弱网下的兜底', '组件库按需加载体积治理'
]
const taskOwners = ['张伟', '王芳', '刘洋', '陈静', '杨帆', '赵磊', '周杰', '吴婷']
const taskDepts = ['平台组', '业务组', '数据组', '质量组']
const taskPriorities = ['紧急', '高', '中', '低']
const fixRows = taskTitles.map((title, i) => ({
  id: i + 1,
  name: title,
  owner: taskOwners[i % taskOwners.length],
  dept: taskDepts[i % taskDepts.length],
  priority: taskPriorities[i % taskPriorities.length],
  status: i % 7 === 5 ? 'todo' : i % 4 === 0 ? 'doing' : 'done'
}))
</script>

<style scoped>
.example-page {
  width: 100%;
}

.toolbar-demo-controls {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.toolbar-demo-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-demo-label {
  font-size: 13px;
  color: #909399;
}

.fix-box {
  /* 定高父容器：height='fix' 的表格贴合此容器内容区底（行区内滚动、表头固定） */
  height: 520px;
  box-sizing: border-box;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-meta {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
}

.user-name {
  font-size: 13px;
  color: #303133;
}

.user-sub {
  font-size: 12px;
  color: #909399;
}

.avatar-male {
  background: #409eff;
  color: #fff;
  flex-shrink: 0;
}

.avatar-female {
  background: #f56c6c;
  color: #fff;
  flex-shrink: 0;
}

.detail-content {
  padding: 0 16px;
}

.detail-section {
  margin-bottom: 28px;
}

.detail-section h4 {
  margin: 0 0 12px;
  font-size: 15px;
  font-weight: 60;
  color: #303133;
}

.viewer-trigger {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 200px;
  height: 160px;
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: #909399;
}

.viewer-trigger:hover {
  border-color: #409eff;
  color: #409eff;
  background: #ecf5ff;
}

.viewer-trigger p {
  margin: 8px 0 0;
  font-size: 13px;
}

/* 表格/列表清单模式：自定义卡片 */
.prj-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.prj-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.prj-card__name {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.prj-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 12px;
  font-size: 12px;
  color: #909399;
}

.prj-card__foot {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>
