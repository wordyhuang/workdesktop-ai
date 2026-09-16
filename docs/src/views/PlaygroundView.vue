<template>
  <div class="playground">
    <PageHeader
      eyebrow="LIVE PLAYGROUND"
      icon="MagicStick"
      title="Playground"
      desc="选择组件 → 调整属性 → 实时预览 → 复制代码，零配置体验全部 27 个组件的常用能力。"
    />

    <el-row :gutter="16">
      <!-- 左侧：组件与属性配置 -->
      <el-col :span="8" :xs="24">
        <div class="playground__panel">
          <div class="playground__panel-title">组件选择</div>
          <div v-for="g in playGroups" :key="g.label" class="playground__group">
            <div class="playground__group-label">{{ g.label }}</div>
            <el-radio-group v-model="currentKey" class="playground__radios">
              <el-radio-button v-for="c in g.items" :key="c.key" :value="c.key">
                {{ c.label }}
              </el-radio-button>
            </el-radio-group>
          </div>

          <template v-if="current">
            <div class="playground__panel-title" style="margin-top: 20px">属性配置</div>
            <el-form label-width="90px" size="small">
              <el-form-item v-for="p in current.props" :key="p.name" :label="p.label">
                <el-select
                  v-if="p.type === 'select'"
                  v-model="values[p.name]"
                  style="width: 100%"
                >
                  <el-option v-for="o in p.options" :key="o.value" :label="o.label" :value="o.value" />
                </el-select>
                <el-switch v-else-if="p.type === 'boolean'" v-model="values[p.name]" />
                <el-input-number
                  v-else-if="p.type === 'number'"
                  v-model="values[p.name]"
                  style="width: 100%"
                />
                <el-input v-else v-model="values[p.name]" placeholder="请输入" />
              </el-form-item>
            </el-form>
          </template>
        </div>
      </el-col>

      <!-- 右侧：预览 + 代码 -->
      <el-col :span="16" :xs="24" class="playground__right">
        <div class="playground__panel">
          <div class="playground__panel-title">实时预览</div>
          <div class="playground__preview">
            <div class="playground__preview-inner">
              <!-- 数据组件 -->
              <wd-data-grid v-if="currentKey === 'data-grid'" v-bind="previewBind">
                <el-table-column prop="id" label="ID" width="70" />
                <el-table-column prop="name" label="项目名称" min-width="140" />
                <el-table-column prop="owner" label="负责人" min-width="100" />
              </wd-data-grid>

              <component :is="currentComp" v-else-if="currentKey === 'editable-grid'" v-bind="previewBind" />

              <wd-viewer v-else-if="currentKey === 'viewer'" v-bind="previewBind">
                <el-descriptions-item label="备注" :span="2">
                  年度核心贡献者，主导多个重点项目落地。
                </el-descriptions-item>
              </wd-viewer>

              <div v-else-if="currentKey === 'requester'" class="playground__center">
                <wd-requester
                  v-model="reqTrigger"
                  v-bind="previewBind"
                  @api-success="onReqSuccess"
                  @api-exception="onReqError"
                />
                <el-button type="primary" @click="reqTrigger = true">发起请求</el-button>
              </div>

              <!-- 表单组件 -->
              <wd-data-form v-else-if="currentKey === 'data-form'" v-bind="previewBind">
                <template #default="{ model }">
                  <el-form-item label="姓名" prop="name">
                    <el-input v-model="model.name" placeholder="请输入姓名" />
                  </el-form-item>
                  <el-form-item label="部门" prop="dept">
                    <el-input v-model="model.dept" placeholder="请输入部门" />
                  </el-form-item>
                </template>
              </wd-data-form>

              <wd-search-panel
                v-else-if="currentKey === 'search-panel'"
                v-bind="previewBind"
                @search="onPlaySearch"
              >
                <template #default="{ model }">
                  <wd-search-item label="姓名" prop="name">
                    <el-input v-model="model.name" clearable style="width: 160px" />
                  </wd-search-item>
                  <wd-search-item label="部门" prop="dept">
                    <el-input v-model="model.dept" clearable style="width: 160px" />
                  </wd-search-item>
                </template>
              </wd-search-panel>

              <el-form v-else-if="currentKey === 'form-item'" style="width: 100%">
                <wd-form-item v-bind="previewBind" prop="name">
                  <el-input v-model="playForm.name" placeholder="请输入姓名" />
                </wd-form-item>
              </el-form>

              <wd-search-panel v-else-if="currentKey === 'search-item'">
                <template #default="{ model }">
                  <wd-search-item v-bind="previewBind" prop="kw">
                    <el-input v-model="model.kw" clearable style="width: 180px" />
                  </wd-search-item>
                </template>
              </wd-search-panel>

              <!-- 按钮组件（默认插槽为按钮文案） -->
              <div v-else-if="isSlotButton" class="playground__center">
                <component :is="currentComp" v-bind="previewBind">{{ slotText }}</component>
              </div>

              <wd-drawer-button v-else-if="currentKey === 'drawer-button'" v-bind="previewBind">
                <div style="padding: 8px 0">
                  内容区：可嵌 wd-data-form、表格等任意内容；配 filter + head-refresh-datagrid
                  可在提交成功后自动关闭并刷新同组表格。
                </div>
              </wd-drawer-button>

              <!-- 容器组件 -->
              <div v-else-if="currentKey === 'drawer'" class="playground__center">
                <el-button type="primary" @click="drawerVisible = true">打开抽屉</el-button>
                <wd-drawer v-model="drawerVisible" v-bind="previewBind">
                  <div style="padding: 8px 0">
                    抽屉内容区：可放任意组件；url 内嵌页面时可基于 wd-container:* 协议双向通信。
                  </div>
                </wd-drawer>
              </div>

              <wd-iframe v-else-if="currentKey === 'iframe'" v-bind="previewBind" />

              <!-- 表单元素（v-model 本地态） -->
              <wd-select
                v-else-if="currentKey === 'select'"
                v-model="selVal"
                v-bind="previewBind"
                style="width: 240px"
              />
              <wd-auto-complete
                v-else-if="currentKey === 'auto-complete'"
                v-model="acVal"
                v-bind="previewBind"
                style="width: 240px"
              />
              <wd-checkbox-list v-else-if="currentKey === 'checkbox-list'" v-model="chkVal" v-bind="previewBind" />
              <wd-radio-list v-else-if="currentKey === 'radio-list'" v-model="radVal" v-bind="previewBind" />
              <wd-switch v-else-if="currentKey === 'switch'" v-model="swVal" v-bind="previewBind" />

              <component
                :is="currentComp"
                v-else-if="currentKey === 'upload' || currentKey === 'image-upload'"
                v-bind="previewBind"
              />

              <!-- 辅助组件 -->
              <wd-panel v-else-if="currentKey === 'panel'" v-bind="previewBind">
                <p style="margin: 0">{{ slotText }}</p>
              </wd-panel>

              <div v-else-if="currentKey === 'tips'" class="playground__center">
                <wd-tips v-bind="previewBind" />
              </div>

              <!-- 布局组件 -->
              <wd-station v-else-if="currentKey === 'station'" v-bind="previewBind">
                <div style="padding: 16px">内容区：页面渲染在这里</div>
              </wd-station>
            </div>
          </div>

          <div class="playground__panel-title" style="margin-top: 20px">
            生成代码
            <el-button link size="small" type="primary" @click="copyCode">
              <el-icon><DocumentCopy /></el-icon>
              {{ copied ? '已复制' : '复制' }}
            </el-button>
          </div>
          <CodeBlock :code="generatedCode" />
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { DocumentCopy } from '@element-plus/icons-vue'
import { playGroups, type PlayConfig, type PlayPropDef } from './playground-configs'

const currentKey = ref('data-grid')
const current = computed<PlayConfig | undefined>(() => {
  for (const g of playGroups) {
    const hit = g.items.find((c) => c.key === currentKey.value)
    if (hit) return hit
  }
  return undefined
})
const currentComp = computed(() => current.value?.comp)
const values = ref<Record<string, any>>({})

// 切换组件时按配置重置属性值
watch(
  currentKey,
  () => {
    const map: Record<string, any> = {}
    current.value?.props.forEach((p) => {
      map[p.name] = p.default !== undefined ? p.default : defaultFor(p.type)
    })
    values.value = map
  },
  { immediate: true }
)

function defaultFor(type: PlayPropDef['type']) {
  if (type === 'boolean') return false
  if (type === 'number') return 0
  return ''
}

/** 预览绑定：静态 extra + 用户属性（__slot__ 与空字符串不进绑定） */
const previewBind = computed(() => {
  const c = current.value
  if (!c) return {}
  const bind: Record<string, any> = { ...(c.extra || {}) }
  c.props.forEach((p) => {
    if (p.name === '__slot__') return
    const v = values.value[p.name]
    if (v === undefined || v === '') return
    bind[p.name] = v
  })
  return bind
})

/** 默认插槽文案（按钮类 / panel） */
const slotText = computed(() => values.value['__slot__'] ?? '')

/** 默认插槽直接作为按钮文案的组件 */
const SLOT_BUTTON_KEYS = [
  'api-button',
  'confirm-button',
  'popconfirm-button',
  'prompt-button',
  'route-button',
  'tips-button'
]
const isSlotButton = computed(() => SLOT_BUTTON_KEYS.includes(currentKey.value))

/* ---------- 预览本地态（不进入生成代码） ---------- */
const reqTrigger = ref(false)
const drawerVisible = ref(false)
const selVal = ref()
const acVal = ref('')
const chkVal = ref<any[]>([])
const radVal = ref()
const swVal = ref('1')
const playForm = reactive({ name: '' })

function onReqSuccess(res: any) {
  const total = res?.data?.total
  ElMessage.success(total !== undefined ? `请求成功，total=${total}` : '请求成功')
}
function onReqError(err: any) {
  ElMessage.error('请求异常：' + (err?.message || err))
}
function onPlaySearch(model: any) {
  ElMessage.success('搜索条件：' + JSON.stringify(model))
}

/* ---------- 代码生成：与预览一一对应的完整 SFC ---------- */
const generatedCode = computed(() => {
  const c = current.value
  if (!c) return ''
  const lines: string[] = []
  if (c.comment) lines.push(`<!-- ${c.comment} -->`)

  // 属性序列化：固定 attrs 在前，用户属性在后
  const parts: string[] = []
  if (c.attrs) parts.push(c.attrs)
  c.props.forEach((p) => {
    if (p.name === '__slot__') return
    const v = values.value[p.name]
    if (v === undefined || v === '') return
    if (typeof v === 'boolean' || typeof v === 'number') parts.push(`:${toKebab(p.name)}="${v}"`)
    else parts.push(`${toKebab(p.name)}="${v}"`)
  })

  const tag = `wd-${c.key}`
  const open = parts.length ? `<${tag} ${parts.join(' ')}` : `<${tag}`

  // 内部内容：配置 inner（{{slotText}} 占位替换）> __slot__ 纯文案 > 自闭合
  let body: string
  if (c.inner) {
    const inner = c.inner.split('{{slotText}}').join(slotText.value)
    const indented = inner
      .split('\n')
      .map((l) => '    ' + l)
      .join('\n')
    body = `  ${open}>\n${indented}\n  </${tag}>`
  } else if (c.props.some((p) => p.name === '__slot__')) {
    body = `  ${open}>${slotText.value || c.label}</${tag}>`
  } else {
    body = `  ${open} />`
  }

  lines.push('<template>', body, '</template>')
  if (c.setup) {
    lines.push('', '<script setup>', c.setup, '</' + 'script>')
  }
  return lines.join('\n')
})

function toKebab(s: string) {
  return s.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase())
}

const copied = ref(false)
async function copyCode() {
  try {
    await navigator.clipboard.writeText(generatedCode.value)
  } catch {
    const ta = document.createElement('textarea')
    ta.value = generatedCode.value
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
  }
  copied.value = true
  ElMessage.success('代码已复制')
  setTimeout(() => (copied.value = false), 1500)
}
</script>

<style scoped>
.playground {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.playground__panel {
  background: var(--wd-bg-color, #fff);
  border: 1px solid var(--wd-border-color-light, #ebeef5);
  border-radius: 14px;
  padding: 18px 20px;
  box-shadow: 0 2px 12px rgba(13, 18, 30, 0.04);
  height: 100%;
  box-sizing: border-box;
}
.playground__panel-title {
  position: relative;
  font-size: 14px;
  font-weight: 700;
  color: var(--wd-text-color-primary, #303133);
  margin-bottom: 12px;
  padding-left: 11px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.playground__panel-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 14px;
  border-radius: 2px;
  background: linear-gradient(180deg, var(--wd-color-primary, #409eff), var(--el-color-primary-light-3, #79bbff));
}
.playground__panel-title .el-button {
  margin-left: auto;
}
.playground__group + .playground__group {
  margin-top: 10px;
}
.playground__group-label {
  font-size: 12px;
  color: var(--wd-text-color-secondary, #909399);
  margin-bottom: 6px;
}
.playground__radios {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.playground__preview {
  min-height: 200px;
  background: var(--wd-bg-color-page, #f7f8fa);
  border: 1px dashed var(--wd-border-color, #dcdfe6);
  border-radius: 12px;
  padding: 20px 16px;
  display: flex;
  align-items: center;
  transition: background-color 0.25s ease, border-color 0.25s ease;
}
.playground__preview-inner {
  width: 100%;
}
.playground__center {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px;
}
@media (max-width: 960px) {
  .playground__right {
    margin-top: 16px;
  }
}
</style>
