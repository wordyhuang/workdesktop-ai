# 场景七：数据导入导出

> **创建时间**：2026-10-14\
> **最后修改时间**：2026-10-14\
> **当前版本**：V\_1.0\
> **适用对象**：AI 编码助手、开发团队\
> **核心目标**：数据导入导出的流程与交互规范\
> **文档简略描述**：本文件是「编码场景指导」的子路由，由 `document/scenarios_v1.0.md`（V\_1.17）拆分而来。小节编号（§x.y）与主文档一致；跨场景引用（如"见 §1.7"）请按编号到对应子文件查阅，编号→文件映射见 [ai-router.md](../ai-router.md)。内容修改请先改主文档，再同步本文件。


### 7.1 场景描述

在 DataGrid 列表页面，通过工具栏按钮触发导入/导出操作。导入时弹出 Drawer/Dialog，引导用户完成"下载模板 → 上传文件 → 设置参数 → 校验预览 → 确认导入"全流程；导出时弹出参数面板，选择导出范围和字段后下载文件。

### 7.2 页面结构图

```
DataGrid 工具栏
├── [导入] 按钮（DrawerButton）
│   └── Drawer：数据导入面板
│       ├── Step1: 下载模板（含必填字段说明）
│       ├── Step2: 上传文件（拖拽/点击）
│       ├── Step3: 导入参数设置
│       ├── Step4: 校验结果预览
│       └── 底部：[取消] [开始导入]
│
└── [导出] 按钮（DialogButton）
    └── Dialog：数据导出面板
        ├── 导出范围（全部/选中/筛选条件）
        ├── 导出字段（勾选）
        ├── 导出格式（Excel/CSV）
        └── 底部：[取消] [开始导出]
```

### 7.3 导入面板交互流程

```
1. 用户点击「导入」按钮
       ↓
2. Drawer 打开，显示导入面板
       ↓
3. 用户下载模板，填写数据
       ↓
4. 用户上传文件（拖拽或点击）
       ├─ 上传失败 → 提示错误（格式不对/超大小）
       └─ 上传成功 → 显示文件名+大小
       ↓
5. 设置导入参数
   - 重复数据处理：覆盖/跳过/追加
   - 导入数量限制
   - 校验模式：遇错跳过 / 遇错终止
   - 导入后操作：刷新列表（默认勾选）
       ↓
6. 点击「开始导入」
       ↓
7. 后端校验文件内容，返回校验结果
       ├─ 全部有效 → 直接导入，成功提示，关闭面板，刷新列表
       └─ 部分错误 → 显示校验结果（总行数/有效/错误）
              ├─ 有错误行 → 列出错误行号+原因
              │   ├─ 用户选择「跳过错误行导入」 → 导入有效行
              │   └─ 用户选择「取消」 → 不导入，修改后重来
              └─ 全部错误 → 提示"文件数据全部校验失败"，阻止导入
```

### 7.4 导出面板交互流程

```
1. 用户点击「导出」按钮
       ↓
2. Dialog 打开，显示导出面板
       ↓
3. 选择导出范围
   - 全部数据（当前筛选条件下的所有数据）
   - 当前页数据
   - 选中数据（有选中行时可用）
       ↓
4. 选择导出字段（勾选，默认全部）
       ↓
5. 选择导出格式（Excel / CSV）
       ↓
6. 点击「开始导出」
       ↓
7. 后端生成文件，返回下载链接
       ↓
8. 浏览器自动下载文件，关闭面板
```

### 7.5 导入面板代码示例

```html
<!-- DataGrid 工具栏中的导入按钮 -->
<wd-datagrid ref="datagridRef" api="/api/users" :active="true">
  <template #toolbar>
    <wd-drawer-button label="数据导入" title="数据导入" size="480px" @confirm="handleImport" />
    <wd-dialog-button label="数据导出" title="数据导出" @confirm="handleExport" />
  </template>
</wd-datagrid>

<!-- 导入面板内容（放在 Drawer 的 default 插槽中） -->
<wd-drawer-button label="数据导入" title="数据导入" size="480px" :head-refresh-datagrid="true">
  <div style="padding: 20px;">

    <!-- Step 1: 下载模板 -->
    <wd-panel title="① 下载导入模板">
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px; background: var(--el-fill-color-light); border-radius: 4px;">
        <div>
          <span>📄 用户数据导入模板.xlsx</span>
          <span style="color: var(--el-text-color-secondary); font-size: 12px; margin-left: 8px;">含字段说明和格式示例</span>
        </div>
        <wd-api-button api="/api/users/template" link type="primary">下载模板</wd-api-button>
      </div>
      <div style="margin-top: 8px; font-size: 12px;">
        <span style="color: var(--el-color-warning); font-weight: 600;">必填字段：</span>
        <el-tag v-for="field in requiredFields" :key="field" size="small" type="warning" style="margin: 0 2px;">
          {{ field }}
        </el-tag>
      </div>
    </wd-panel>

    <!-- Step 2: 上传文件 -->
    <wd-panel title="② 上传数据文件">
      <wd-upload
        accept=".xlsx,.xls,.csv"
        :max-size="10"
        :auto-upload="false"
        :limit="1"
        :on-change="handleFileChange">
      </wd-upload>
    </wd-panel>

    <!-- Step 3: 导入参数设置 -->
    <wd-panel title="③ 导入设置">
      <el-form label-width="120px">
        <el-form-item label="重复数据处理">
          <el-radio-group v-model="importConfig.duplicateStrategy">
            <el-radio value="overwrite">覆盖</el-radio>
            <el-radio value="skip">跳过</el-radio>
            <el-radio value="append">追加</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="导入数量限制">
          <el-input-number v-model="importConfig.limit" :min="1" :max="10000" />
          <span style="margin-left: 8px; color: var(--el-text-color-secondary); font-size: 12px;">条/次</span>
        </el-form-item>
        <el-form-item label="校验模式">
          <el-checkbox v-model="importConfig.continueOnError">遇错跳过，继续导入</el-checkbox>
          <span style="color: var(--el-text-color-secondary); font-size: 12px;">（关闭则遇错终止）</span>
        </el-form-item>
        <el-form-item label="导入后操作">
          <el-checkbox v-model="importConfig.refreshAfterImport">导入完成后刷新列表</el-checkbox>
        </el-form-item>
      </el-form>
    </wd-panel>

    <!-- Step 4: 校验结果（上传+校验后显示） -->
    <wd-panel v-if="importResult" title="④ 校验结果">
      <div style="display: flex; gap: 8px; margin-bottom: 12px;">
        <div style="flex: 1; text-align: center; padding: 10px; background: var(--el-color-success-light-9); border-radius: 4px;">
          <div style="font-size: 20px; font-weight: 600; color: var(--el-color-success);">{{ importResult.total }}</div>
          <div style="font-size: 12px; color: var(--el-text-color-secondary);">总行数</div>
        </div>
        <div style="flex: 1; text-align: center; padding: 10px; background: var(--el-color-success-light-9); border-radius: 4px;">
          <div style="font-size: 20px; font-weight: 600; color: var(--el-color-success);">{{ importResult.valid }}</div>
          <div style="font-size: 12px; color: var(--el-text-color-secondary);">有效行数</div>
        </div>
        <div style="flex: 1; text-align: center; padding: 10px; background: var(--el-color-danger-light-9); border-radius: 4px;">
          <div style="font-size: 20px; font-weight: 600; color: var(--el-color-danger);">{{ importResult.errors.length }}</div>
          <div style="font-size: 12px; color: var(--el-text-color-secondary);">错误行数</div>
        </div>
      </div>
      <div v-if="importResult.errors.length" style="padding: 8px; background: var(--el-color-danger-light-9); border-radius: 4px; font-size: 12px; color: var(--el-color-danger);">
        <div style="font-weight: 600; margin-bottom: 4px;">⚠️ 以下行校验失败：</div>
        <div v-for="error in importResult.errors" :key="error.row" style="margin-left: 8px; line-height: 1.8;">
          第 {{ error.row }} 行：{{ error.message }}
        </div>
      </div>
    </wd-panel>

  </div>

  <template #footer>
    <el-button @click="visible = false">取消</el-button>
    <wd-confirm-button
      api="/api/users/import"
      :api-param="importConfig"
      type="primary"
      :head-refresh-datagrid="true">
      开始导入
    </wd-confirm-button>
  </template>
</wd-drawer-button>
```

### 7.6 导出面板代码示例

```html
<wd-dialog-button label="数据导出" title="数据导出" @confirm="handleExport">
  <div style="padding: 20px;">
    <wd-panel title="导出范围">
      <el-form label-width="100px">
        <el-form-item label="导出范围">
          <el-radio-group v-model="exportConfig.range">
            <el-radio value="all">全部数据（当前筛选条件）</el-radio>
            <el-radio value="page">当前页数据</el-radio>
            <el-radio value="selected" :disabled="!selectedRows.length">选中数据（{{ selectedRows.length }} 条）</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
    </wd-panel>

    <wd-panel title="导出字段">
      <el-checkbox-group v-model="exportConfig.fields">
        <el-checkbox v-for="col in columns" :key="col.prop" :value="col.prop">
          {{ col.label }}
        </el-checkbox>
      </el-checkbox-group>
    </wd-panel>

    <wd-panel title="导出格式">
      <el-form label-width="100px">
        <el-form-item label="文件格式">
          <el-radio-group v-model="exportConfig.format">
            <el-radio value="xlsx">Excel (.xlsx)</el-radio>
            <el-radio value="csv">CSV (.csv)</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
    </wd-panel>
  </div>

  <template #footer>
    <el-button @click="visible = false">取消</el-button>
    <wd-api-button
      api="/api/users/export"
      :api-param="exportConfig"
      type="primary"
      @success="handleDownload">
      开始导出
    </wd-api-button>
  </template>
</wd-dialog-button>
```

### 7.7 导入参数说明

| 参数                   | 类型                                  | 说明        | 默认值         |
| -------------------- | ----------------------------------- | --------- | ----------- |
| `duplicateStrategy`  | `'overwrite' \| 'skip' \| 'append'` | 重复数据处理策略  | `overwrite` |
| `limit`              | `number`                            | 单次导入数量上限  | `5000`      |
| `continueOnError`    | `boolean`                           | 遇错是否跳过继续  | `true`      |
| `refreshAfterImport` | `boolean`                           | 导入后是否刷新列表 | `true`      |

### 7.8 导出参数说明

| 参数       | 类型                              | 说明           | 默认值    |
| -------- | ------------------------------- | ------------ | ------ |
| `range`  | `'all' \| 'page' \| 'selected'` | 导出范围         | `all`  |
| `fields` | `string[]`                      | 导出字段 prop 列表 | 全部字段   |
| `format` | `'xlsx' \| 'csv'`               | 导出文件格式       | `xlsx` |

### 7.9 规范要点

| 项     | 规范                                     |
| ----- | -------------------------------------- |
| 模板下载  | 导入前**必须**提供模板下载，标注必填字段                 |
| 文件格式  | 支持 .xlsx / .xls / .csv，限制文件大小（建议 10MB） |
| 校验预览  | 上传后先校验再导入，显示总行数/有效/错误统计                |
| 错误反馈  | 列出错误行号 + 原因，让用户修改后重试                   |
| 导入后刷新 | 默认勾选"导入后刷新列表"                          |
| 导出选中  | 有选中行时才启用"选中数据"选项                       |
| 导出字段  | 默认全部勾选，用户可取消不需要的字段                     |
| 导出文件名 | 自动生成：`{模块名}_{日期时间}.{格式}`               |
| 按钮位置  | 导入导出按钮放在 DataGrid 的 toolbar 区域         |

***
