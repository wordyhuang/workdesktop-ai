# 场景三：详情查看页面

> **创建时间**：2026-10-14\
> **最后修改时间**：2026-10-14\
> **当前版本**：V\_1.0\
> **适用对象**：AI 编码助手、开发团队\
> **核心目标**：只读详情页的展示规范\
> **文档简略描述**：本文件是「编码场景指导」的子路由，由 `document/scenarios_v1.0.md`（V\_1.17）拆分而来。小节编号（§x.y）与主文档一致；跨场景引用（如"见 §1.7"）请按编号到对应子文件查阅，编号→文件映射见 [ai-router.md](../ai-router.md)。内容修改请先改主文档，再同步本文件。


### 3.1 场景描述

查看单条数据的完整信息，通常由 DataGrid 行操作"查看"触发，以 Dialog 或 Drawer 形式弹出。**数据详情与数据的新增/编辑分离**，不使用 DataForm，而是用独立的详情布局实现。原因：详情是只读展示，字段排列方式与编辑表单不同（可能多列并排、分区展示），强行复用 DataForm 会导致表单字段在只读态下排版不佳。

### 3.2 页面结构图

```
┌─────────────────────────────────────────┐
│  Dialog / Drawer                         │
│  标题：查看详情                            │
├─────────────────────────────────────────┤
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ 基本信息                            │  │
│  │ 名称：xxx    编码：xxx              │  │
│  │ 分类：xxx    状态：●启用            │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │ 扩展信息                            │  │
│  │ 创建人：xxx  创建时间：xxx          │  │
│  │ 备注：xxx                          │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │ 明细                              │  │
│  │ ┌─────┬─────┬──────┬───────────┐ │  │
│  │ │ 商品 │ 数量 │ 单价  │  小计     │ │  │
│  │ ├─────┼─────┼──────┼───────────┤ │  │
│  │ │ xxx │ 2   │ 100  │ 200       │ │  │
│  │ │ xxx │ 1   │ 50   │ 50        │ │  │
│  │ └─────┴─────┴──────┴───────────┘ │  │
│  └───────────────────────────────────┘  │
│                                         │
├─────────────────────────────────────────┤
│                                    [关闭] │
└─────────────────────────────────────────┘
```

### 3.3 实现方式

统一使用 **Panel + el-descriptions** 布局，不使用 DataForm：

| 方式                        | 适用       | 实现                              |
| ------------------------- | -------- | ------------------------------- |
| 单 Panel + descriptions    | 字段少，一区展示 | 一个 Panel 内 `el-descriptions`    |
| 多 Panel 分区 + descriptions | 字段多，需分组  | 多个 Panel，每个内嵌 `el-descriptions` |
| Panel + 明细表格              | 单据类主从数据  | 字段分区下方追加「明细」Panel，内嵌只读表格（见 3.7） |

### 3.4 代码示例

```html
<!-- Panel 分区布局 -->
<wd-dialog title="查看详情" v-model="visible">
  <wd-panel title="基本信息">
    <el-descriptions :column="2" border>
      <el-descriptions-item label="名称">{{ data.name }}</el-descriptions-item>
      <el-descriptions-item label="编码">{{ data.code }}</el-descriptions-item>
      <el-descriptions-item label="分类">
        <el-tag>{{ data.categoryName }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="状态">
        <span>●{{ data.statusText }}</span>
        <!-- 详情页 el-descriptions-item label 是纯字符串，无内置 tip prop；Tips 嵌到值区域旁 -->
        <wd-tips
          type="word"
          icon="QuestionFilled"
          tips="含义：草稿=未提交可编辑；审核中=不可编辑等待审批；已完成=流程结束不可修改" />
      </el-descriptions-item>
    </el-descriptions>
  </wd-panel>
  <wd-panel title="扩展信息">
    <el-descriptions :column="2" border>
      <el-descriptions-item label="创建人">{{ data.creator }}</el-descriptions-item>
      <el-descriptions-item label="创建时间">
        <el-icon><Calendar /></el-icon> {{ formatDate(data.createTime) }}
      </el-descriptions-item>
      <el-descriptions-item label="备注" :span="2">
        {{ data.remark || '-' }}
      </el-descriptions-item>
    </el-descriptions>
  </wd-panel>
  <template #footer>
    <el-button @click="visible = false">关闭</el-button>
  </template>
</wd-dialog>
```

### 3.5 渲染规范

| 数据类型      | 渲染方式                                                                                                            | 示例                                                        |
| --------- | --------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| 普通文本      | `el-descriptions-item` 直接显示                                                                                     | `{{ data.name }}`                                         |
| 分类/类型     | Tag 标签，带语义色                                                                                                     | `<el-tag type="primary">{{ data.categoryName }}</el-tag>` |
| 状态        | 状态点 + 文案                                                                                                        | `●启用` / `●禁用`                                             |
| 时间/日期     | 图标 + 格式化时间                                                                                                      | `📅 2023-03-15 09:30:00`                                  |
| 长文本/备注    | `:span="2"` 跨整行显示                                                                                               | 备注内容跨列展示                                                  |
| 邮箱/链接     | 蓝色文字，可点击                                                                                                        | `<a style="color: var(--el-color-primary)">`              |
| 可复制编码     | 文本 + 复制图标                                                                                                       | `ZS001 📋`                                                |
| 附件        | 文件图标 + 文件名，可点击下载                                                                                                | `📄 简历.pdf`                                               |
| 空值        | 统一显示 `-`                                                                                                        | `{{ data.value \|\| '-' }}`                               |
| 关键字段/状态说明 | 值区域旁嵌 `wd-tips type="word" icon="QuestionFilled"` 问号图标，悬停说明含义（因 `el-descriptions-item label` 是纯字符串无内置 tip prop） | 见下方示例                                                     |

### 3.6 分区原则

详情页按业务逻辑分区，每个分区用 Panel 包裹，内嵌 `el-descriptions`：

| 分区   | 含字段示例                   | 说明                    |
| ---- | ----------------------- | --------------------- |
| 基本信息 | 名称、编码、分类、部门、职位          | 核心标识字段，最常用            |
| 联系信息 | 手机、邮箱、地址、紧急联系人          | 通讯相关                  |
| 扩展信息 | 创建人、创建时间、更新人、更新时间、备注、附件 | 系统字段 + 辅助信息           |
| 明细数据 | 商品/费用/成员等子表行            | 单据类主从结构，整表只读展示（见 3.7） |

> 分区数量建议 2-4 个，超过 4 个考虑合并。每个分区字段 4-8 个为宜。

### 3.7 明细板块显示

单据类详情（订单、报销单、入库单等）除头部字段外通常带一组明细行（商品明细、费用明细、成员明细）。明细作为**独立分区**置于字段分区之后，整表只读展示。

| 要点       | 规范                                                          |
| -------- | ----------------------------------------------------------- |
| 独立 Panel | 明细单独一个 `wd-panel title="明细"`，放在字段分区之后                       |
| 只读展示     | 用只读表格（DataGrid 静态数据源或只读 DataGrid），**不放**新增/编辑/删除按钮          |
| 数据源      | 明细量小（≤ 几十行）用 `:data-source="detailRows"` 静态数据；量大走 `api` 懒加载 |
| 列渲染      | 复用 1.7 表格列渲染规范：金额/数量格式化、单位列、备注省略等                           |
| 空状态      | 无明细时显示表格空状态「暂无明细」，不渲染空 Panel 标题                             |
| 合计行      | 金额类明细可在底部加合计（数量合计/金额合计），表尾用粗体或底色强调                          |

```html
<!-- 明细板块：字段分区之后，独立 Panel，只读表格 -->
<wd-panel title="明细">
  <wd-datagrid
    :data-source="detailRows"
    :columns="detailColumns"
    :with-pager="false"
    :tools="{ refresh: false, size: false, modeSwitch: false, columnSetting: false }"
  />
  <!-- 合计行：金额类明细在表格下方汇总展示；标签后加 Tips 说明计算口径 -->
  <div v-if="detailRows.length" class="detail-summary">
    <span>共 {{ detailRows.length }} 项</span>
    <span>
      数量合计 {{ totalQuantity }}
      <wd-tips
        type="word"
        icon="QuestionFilled"
        tips="统计口径：已审核行的数量求和，不含草稿与已作废行" />
    </span>
    <span>
      金额合计 ¥ {{ totalAmount.toFixed(2) }}
      <wd-tips
        type="word"
        icon="QuestionFilled"
        tips="统计口径：含税金额 = 单价 × 数量 × (1 + 税率)" />
    </span>
  </div>
</wd-panel>

<script setup>
// 明细列：金额右对齐 + 千分位格式化
const detailColumns = [
  { prop: 'goodsName', label: '商品名称', minWidth: 160 },
  { prop: 'spec',      label: '规格',     width: 120 },
  { prop: 'quantity',  label: '数量',     width: 90,  align: 'right' },
  { prop: 'unitPrice', label: '单价',     width: 110, align: 'right',
    formatter: (r) => `¥ ${Number(r.unitPrice).toFixed(2)}` },
  { prop: 'amount',    label: '小计',     width: 120, align: 'right',
    formatter: (r) => `¥ ${Number(r.amount).toFixed(2)}` },
  { prop: 'remark',    label: '备注',     minWidth: 120, showOverflowTooltip: true },
]

// 合计：数量/金额求总
const totalQuantity = computed(() => detailRows.reduce((s, r) => s + Number(r.quantity || 0), 0))
const totalAmount   = computed(() => detailRows.reduce((s, r) => s + Number(r.amount || 0), 0))
</script>

<style scoped>
.detail-summary {
  display: flex; gap: 24px; justify-content: flex-end;
  padding: 8px 12px; font-weight: 600;
  background: var(--wd-panel-header-bg, var(--wd-bg-color, #fff));
}
</style>
```

> **选型口径**：明细仅展示、行数几十行内 → `:data-source` 静态数据 + `wd-datagrid` 只读配置；明细行数可能很大或需服务端分页 → 走 `api` 数据源并保留分页；明细需要行内编辑 → 改在编辑场景用 `wd-editable-grid`（详情页恒为只读）。

### 3.8 列数与布局

| 场景     | el-descriptions column | 说明      |
| ------ | ---------------------- | ------- |
| 字段短、值短 | 2                      | 默认，两列并排 |
| 字段短、值长 | 1                      | 单列，避免挤压 |
| 字段多、值短 | 3                      | 三列，信息密集 |

> 长文本字段（备注、描述）用 `:span="2"` 或 `:span="3"` 跨整行。

### 3.9 完整编码模板

```html
<wd-dialog title="查看详情" v-model="visible" width="720px">
  <wd-panel title="基本信息">
    <el-descriptions :column="2" border>
      <el-descriptions-item label="名称">{{ data.name || '-' }}</el-descriptions-item>
      <el-descriptions-item label="编码">
        <span style="display:inline-flex;align-items:center;gap:4px">
          {{ data.code || '-' }}
          <el-icon v-if="data.code" style="cursor:pointer;color:var(--el-color-primary)" @click="copyText(data.code)">
            <CopyDocument />
          </el-icon>
        </span>
      </el-descriptions-item>
      <el-descriptions-item label="分类">
        <el-tag v-if="data.categoryName" type="primary">{{ data.categoryName }}</el-tag>
        <span v-else>-</span>
      </el-descriptions-item>
      <el-descriptions-item label="部门">{{ data.deptName || '-' }}</el-descriptions-item>
      <el-descriptions-item label="职位">{{ data.position || '-' }}</el-descriptions-item>
      <el-descriptions-item label="入职日期">
        <span v-if="data.entryDate" style="display:inline-flex;align-items:center;gap:4px">
          <el-icon><Calendar /></el-icon>{{ formatDate(data.entryDate) }}
        </span>
        <span v-else>-</span>
      </el-descriptions-item>
    </el-descriptions>
  </wd-panel>

  <wd-panel title="联系信息">
    <el-descriptions :column="2" border>
      <el-descriptions-item label="手机">{{ data.phone || '-' }}</el-descriptions-item>
      <el-descriptions-item label="邮箱">
        <span v-if="data.email" style="color:var(--el-color-primary);cursor:pointer">{{ data.email }}</span>
        <span v-else>-</span>
      </el-descriptions-item>
      <el-descriptions-item label="所在地">{{ data.address || '-' }}</el-descriptions-item>
      <el-descriptions-item label="紧急联系人">{{ data.emergencyContact || '-' }}</el-descriptions-item>
    </el-descriptions>
  </wd-panel>

  <wd-panel title="扩展信息">
    <el-descriptions :column="2" border>
      <el-descriptions-item label="创建人">{{ data.creator || '-' }}</el-descriptions-item>
      <el-descriptions-item label="创建时间">
        <span v-if="data.createTime" style="display:inline-flex;align-items:center;gap:4px">
          <el-icon><Calendar /></el-icon>{{ formatDate(data.createTime, 'YYYY-MM-DD HH:mm:ss') }}
        </span>
        <span v-else>-</span>
      </el-descriptions-item>
      <el-descriptions-item label="更新人">{{ data.updater || '-' }}</el-descriptions-item>
      <el-descriptions-item label="更新时间">
        <span v-if="data.updateTime" style="display:inline-flex;align-items:center;gap:4px">
          <el-icon><Calendar /></el-icon>{{ formatDate(data.updateTime, 'YYYY-MM-DD HH:mm:ss') }}
        </span>
        <span v-else>-</span>
      </el-descriptions-item>
      <el-descriptions-item label="备注" :span="2">
        {{ data.remark || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="附件" :span="2">
        <span v-if="data.attachment" style="color:var(--el-color-primary);cursor:pointer">
          📄 {{ data.attachment }}
        </span>
        <span v-else>-</span>
      </el-descriptions-item>
    </el-descriptions>
  </wd-panel>

  <template #footer>
    <el-button @click="visible = false">关闭</el-button>
  </template>
</wd-dialog>
```

### 3.10 编码要点总结

| 要点          | 规范                                           |
| ----------- | -------------------------------------------- |
| 不用 DataForm | 详情用 Panel + el-descriptions，不复用编辑表单          |
| 分区展示        | 用 WdPanel 按业务逻辑分组，标题简洁                       |
| 两列布局        | `el-descriptions` 默认 `:column="2"`，字段短时用     |
| 长文本跨行       | 备注/描述用 `:span="2"` 占满整行                      |
| 空值统一        | 所有空字段显示 `-`，不留空白                             |
| 时间带图标       | 时间字段前加 Calendar 图标                           |
| 可复制编码       | 编码字段后附 CopyDocument 图标                       |
| 状态用色点       | 状态字段用彩色圆点 + 文案                               |
| 底部只关闭       | 详情底部只有"关闭"按钮，无操作按钮                           |
| 明细板块        | 单据类详情追加「明细」Panel，只读表格 + 静态数据源 + 可加合计行（见 3.7） |
| Dialog 宽度   | 建议 720px，信息多时可用 Drawer 50%                   |

***
