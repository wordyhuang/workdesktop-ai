<template>
  <div class="playground">
    <h1 class="playground__title">Playground</h1>
    <p class="playground__desc">选择组件 → 调整属性 → 实时预览 → 复制代码</p>

    <el-row :gutter="16">
      <!-- 左侧：组件与属性配置 -->
      <el-col :span="8">
        <div class="playground__panel">
          <div class="playground__panel-title">组件选择</div>
          <el-radio-group v-model="currentKey" class="playground__radios">
            <el-radio-button v-for="c in configs" :key="c.key" :value="c.key">
              {{ c.label }}
            </el-radio-button>
          </el-radio-group>

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
      <el-col :span="16">
        <div class="playground__panel">
          <div class="playground__panel-title">实时预览</div>
          <div class="playground__preview">
            <component :is="currentComp" v-bind="previewBind" />
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
import { computed, markRaw, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { DocumentCopy } from '@element-plus/icons-vue'
import {
  WdDataGrid,
  WdApiButton,
  WdSelect,
  WdSwitch,
  WdTips,
  WdPanel
} from '../../../src'

interface PropDef {
  name: string
  label: string
  type: 'string' | 'boolean' | 'number' | 'select'
  options?: { label: string; value: any }[]
  default?: any
}
interface CompConfig {
  key: string
  label: string
  comp: any
  props: PropDef[]
  /** 静态额外绑定（如 dataSource 等） */
  extra?: Record<string, any>
}

const playStaticRows = [
  { id: 1, name: '项目 A', owner: '张三' },
  { id: 2, name: '项目 B', owner: '李四' },
  { id: 3, name: '项目 C', owner: '王五' }
]

const configs: CompConfig[] = [
  {
    key: 'data-grid',
    label: 'DataGrid',
    comp: markRaw(WdDataGrid),
    props: [
      { name: 'withIndex', label: '序号列', type: 'boolean', default: true },
      { name: 'withSelection', label: '多选', type: 'boolean', default: true },
      { name: 'stripe', label: '斑马纹', type: 'boolean', default: true },
      { name: 'border', label: '边框', type: 'boolean', default: true },
      { name: 'tableSize', label: '尺寸', type: 'select', options: [
        { label: '大', value: 'large' }, { label: '默认', value: 'default' }, { label: '小', value: 'small' }
      ], default: 'default' }
    ],
    extra: {
      'data-source': playStaticRows
    }
  },
  {
    key: 'api-button',
    label: 'ApiButton',
    comp: markRaw(WdApiButton),
    props: [
      { name: 'type', label: '类型', type: 'select', options: [
        { label: 'primary', value: 'primary' }, { label: 'success', value: 'success' },
        { label: 'warning', value: 'warning' }, { label: 'danger', value: 'danger' },
        { label: 'info', value: 'info' }, { label: 'default', value: 'default' }
      ], default: 'primary' },
      { name: 'buttonLoading', label: '按钮 loading', type: 'boolean', default: true },
      { name: 'pageLoading', label: '页面遮罩', type: 'boolean', default: false },
      { name: 'api', label: '接口地址', type: 'string', default: '' },
      { name: 'slotText', label: '按钮文案', type: 'string', default: '点击请求' }
    ]
  },
  {
    key: 'select',
    label: 'Select',
    comp: markRaw(WdSelect),
    props: [
      { name: 'multiple', label: '多选', type: 'boolean', default: false },
      { name: 'remote', label: '远程搜索', type: 'boolean', default: false },
      { name: 'filterable', label: '可搜索', type: 'boolean', default: true },
      { name: 'placeholder', label: '占位文本', type: 'string', default: '请选择角色' }
    ],
    extra: {
      'data-source': [
        { value: 1, text: '管理员' },
        { value: 2, text: '编辑' },
        { value: 3, text: '访客' }
      ]
    }
  },
  {
    key: 'switch',
    label: 'Switch',
    comp: markRaw(WdSwitch),
    props: [
      { name: 'activeValue', label: '开启值', type: 'string', default: '1' },
      { name: 'inactiveValue', label: '关闭值', type: 'string', default: '0' },
      { name: 'tips', label: '提示', type: 'string', default: '切换即请求' },
      { name: 'api', label: '接口地址', type: 'string', default: '' }
    ]
  },
  {
    key: 'tips',
    label: 'Tips',
    comp: markRaw(WdTips),
    props: [
      { name: 'type', label: '模式', type: 'select', options: [
        { label: 'word（悬停图标）', value: 'word' }, { label: 'box（行内文字）', value: 'box' }
      ], default: 'word' },
      { name: 'tips', label: '提示内容', type: 'string', default: '这是一条提示' },
      { name: 'color', label: '颜色', type: 'string', default: '#909399' }
    ]
  }
]

const currentKey = ref('data-grid')
const current = computed(() => configs.find((c) => c.key === currentKey.value))
const values = ref<Record<string, any>>({})

// 切换组件时重置属性值
watch(currentKey, () => {
  const map: Record<string, any> = {}
  current.value?.props.forEach((p) => {
    map[p.name] = p.default !== undefined ? p.default : defaultFor(p.type)
  })
  values.value = map
}, { immediate: true })

function defaultFor(type: PropDef['type']) {
  if (type === 'boolean') return false
  if (type === 'number') return 0
  return ''
}

const currentComp = computed(() => current.value?.comp)

const previewBind = computed(() => {
  const c = current.value
  if (!c) return {}
  const bind: Record<string, any> = { ...(c.extra || {}) }
  c.props.forEach((p) => {
    const v = values.value[p.name]
    if (v === undefined || v === '') return
    // 布尔开关属性用 kebab 传给组件（组件 props 均支持）
    bind[p.name] = v
  })
  return bind
})

const generatedCode = computed(() => {
  const c = current.value
  if (!c) return ''
  const attrs: string[] = []
  c.props.forEach((p) => {
    const v = values.value[p.name]
    if (v === undefined || v === '') return
    if (typeof v === 'boolean') attrs.push(v ? `:${toKebab(p.name)}="true"` : `:${toKebab(p.name)}="false"`)
    else if (typeof v === 'number') attrs.push(`:${toKebab(p.name)}="${v}"`)
    else attrs.push(`${toKebab(p.name)}="${v}"`)
  })
  const inner = c.key === 'api-button' ? values.value.slotText || '点击请求' : '内容'
  return `<${tagName(c.key)}${attrs.length ? ' ' + attrs.join(' ') : ''}>${inner}</${tagName(c.key)}>`
})

function toKebab(s: string) {
  return s.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase())
}
function tagName(key: string) {
  return 'wd-' + key
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
.playground__title {
  margin: 0 0 4px;
  font-size: 22px;
  color: #303133;
}
.playground__desc {
  margin: 0 0 20px;
  color: #909399;
  font-size: 13px;
}
.playground__panel {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 16px;
}
.playground__panel-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.playground__radios {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.playground__preview {
  min-height: 180px;
  border: 1px dashed #dcdfe6;
  border-radius: 6px;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px;
}
</style>
