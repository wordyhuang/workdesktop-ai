<template>
  <div class="wd-data-form">
    <el-form
      ref="formRef"
      v-loading="loading"
      :model="formModel"
      :rules="rules"
      :label-width="labelWidth"
      :label-position="labelPosition"
      :inline="inline"
      :disabled="loading"
      v-bind="$attrs"
      @submit.prevent
    >
      <slot :model="formModel" :form="formRef" />

      <!-- 底部操作区 -->
      <div v-if="withActions" class="wd-data-form__footer">
        <slot name="footer" :submit="submitForm" :reset="resetForm" :loading="loading">
          <el-button @click="onClose">{{ closeText }}</el-button>
          <el-button v-if="actionConf.showReset" @click="resetForm">{{ actionConf.resetText }}</el-button>
          <el-button
            v-if="isCreate && keepFormButton && actionConf.showContinue"
            :loading="loading"
            @click="submitForm(true)"
          >
            {{ actionConf.continueText }}
          </el-button>
          <el-button type="primary" :loading="loading" @click="submitForm(false)">
            {{ actionConf.submitText }}
          </el-button>
        </slot>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch, provide, inject, getCurrentInstance, type PropType } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { request } from '../../../lib/core/http'
import { refreshDataGrid } from '../../../lib/core/linkage'
import { deepMerge } from '../../../lib/core/utils'
import { useContainer } from '../../containers/containerContext'

defineOptions({ name: 'WdDataForm', inheritAttrs: false })

const props = defineProps({
  /** 模式：create 新增 / edit 编辑 */
  mode: { type: String as PropType<'create' | 'edit'>, default: 'create' },
  /** 详情数据接口（edit 模式回填） */
  api: { type: String, default: '' },
  apiMethod: { type: String as PropType<'get' | 'post'>, default: 'get' },
  apiParam: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
  /** 提交接口 */
  submitApi: { type: String, default: '' },
  submitMethod: { type: String as PropType<'post' | 'put'>, default: 'post' },
  /** 提交字段白名单 */
  submitKeys: { type: [String, Array] as PropType<string | string[]>, default: undefined },
  /** 提交字段黑名单 */
  submitExcludeKeys: { type: [String, Array] as PropType<string | string[]>, default: undefined },
  /** 是否自动请求详情 */
  active: { type: Boolean, default: false },
  /** 有未保存修改时离开确认 */
  confirmLeave: { type: Boolean, default: true },
  /** 是否显示底部操作按钮区 */
  withActions: { type: Boolean, default: true },
  /** 底部按钮文案配置 */
  actionConfig: {
    type: Object as PropType<{
      resetText?: string
      submitText?: string
      continueText?: string
      closeText?: string
      showReset?: boolean
      showContinue?: boolean
    }>,
    default: () => ({})
  },
  /** 提交后关闭抽屉 */
  headCloseDrawer: { type: [Boolean, String], default: true },
  /** 提交后刷新表格 */
  headRefreshDatagrid: { type: [Boolean, String], default: false },
  /** 显示连续操作按钮 */
  keepFormButton: { type: Boolean, default: true },
  /** 表单规则（透传 el-form rules） */
  rules: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
  labelWidth: { type: [String, Number], default: '100px' },
  labelPosition: { type: String as PropType<'left' | 'right' | 'top'>, default: 'right' },
  inline: { type: Boolean, default: false },
  /** 联动分组 */
  filter: { type: String, default: '' },
  /** 外部传入的初始数据（DrawerButton drawerData 等） */
  data: { type: Object as PropType<Record<string, any>>, default: undefined }
})

const emit = defineEmits([
  'submit-success',
  'submit-fail',
  'load-success',
  'change',
  'close',
  'apiBefore',
  'apiAfter'
])

const formRef = ref<any>(null)
const loading = ref(false)
const formModel = reactive<Record<string, any>>({})
/** 初始快照，用于修改检测与 edit 重置 */
const snapshot = ref<Record<string, any>>({})

const isCreate = computed(() => props.mode !== 'edit')

const actionConf = computed(() =>
  deepMerge(
    {
      resetText: '重置',
      submitText: '保存',
      continueText: '保存并继续',
      closeText: '关闭',
      showReset: true,
      showContinue: true
    },
    props.actionConfig || {}
  )
)

const closeText = computed(() => actionConf.value.closeText)

// 通过 provide 向子组件暴露 model；HTML 场景下插槽 v-model="model.xxx"
// 运行于根组件模板作用域，故同时把 model 挂到 app.config.globalProperties
// （根实例 proxy 查找 setupState/data 之后回退 globalProperties）
const instance = getCurrentInstance()
provide('wdDataForm', {
  model: formModel,
  formRef
})

/** 回填数据到表单 */
function fillForm(data: Record<string, any> | null | undefined) {
  // 清空旧值
  Object.keys(formModel).forEach((k) => delete formModel[k])
  if (data && typeof data === 'object') {
    Object.assign(formModel, JSON.parse(JSON.stringify(data)))
  }
  snapshot.value = JSON.parse(JSON.stringify(formModel))
}

/** 请求详情并回填 */
async function requestApi(options?: { apiParam?: Record<string, any> }) {
  if (!props.api) {
    fillForm(props.data || {})
    return
  }
  loading.value = true
  emit('apiBefore', { type: 'load' })
  try {
    const param = { ...props.apiParam, ...(options?.apiParam || {}) }
    const result =
      props.apiMethod === 'get'
        ? await request.get(props.api, param)
        : await request.post(props.api, param)
    if (result.success) {
      fillForm(result.data || {})
      emit('load-success', result.data)
    }
  } finally {
    loading.value = false
    emit('apiAfter', { type: 'load' })
  }
}

/** 取当前表单值 */
function getFormData() {
  return { ...formModel }
}

/** 按白/黑名单过滤提交字段 */
function pickSubmitData() {
  const data = getFormData()
  const toArr = (v: string | string[] | undefined) =>
    v == null ? null : Array.isArray(v) ? v : String(v).split(',').map((s) => s.trim()).filter(Boolean)

  const whitelist = toArr(props.submitKeys)
  const blacklist = toArr(props.submitExcludeKeys)

  let result = data
  if (whitelist) {
    result = whitelist.reduce((acc: Record<string, any>, key) => {
      acc[key] = data[key]
      return acc
    }, {})
  }
  if (blacklist) {
    result = Object.keys(result).reduce((acc: Record<string, any>, key) => {
      if (!blacklist.includes(key)) acc[key] = result[key]
      return acc
    }, {})
  }
  return result
}

/** 手动校验 */
async function validate(): Promise<boolean> {
  if (!formRef.value) return true
  try {
    await formRef.value.validate()
    return true
  } catch {
    return false
  }
}

/** 提交 */
async function submitForm(continueNext = false) {
  const ok = await validate()
  if (!ok) {
    ElMessage.warning('请完善表单必填项')
    return
  }
  if (!props.submitApi) {
    // 无提交接口：仅抛出事件，交给父组件处理
    emit('submit-success', getFormData())
    afterSubmitSuccess(getFormData(), continueNext)
    return
  }

  loading.value = true
  emit('apiBefore', { type: 'submit' })
  try {
    const submitData = pickSubmitData()
    const result =
      props.submitMethod === 'put'
        ? await request.put(props.submitApi, submitData)
        : await request.post(props.submitApi, submitData)

    if (result.success) {
      emit('submit-success', result.data)
      afterSubmitSuccess(result.data, continueNext)
    } else {
      emit('submit-fail', result)
    }
  } finally {
    loading.value = false
    emit('apiAfter', { type: 'submit' })
  }
}

/** 提交成功后的联动处理 */
function afterSubmitSuccess(data: any, continueNext: boolean) {
  // 1. 刷新目标 DataGrid（声明式联动）
  if (props.headRefreshDatagrid) {
    refreshDataGrid(props.headRefreshDatagrid, props.filter)
  }
  // 2. 关闭抽屉 / 连续操作
  if (continueNext && isCreate.value) {
    // 保存并继续：清空表单继续新增，不关闭
    resetForm(true)
  } else if (props.headCloseDrawer) {
    // 容器内：请求容器关闭（提交成功不再做离开确认）；独立使用：emit close
    if (container?.requestClose) {
      container.requestClose('submit')
    } else {
      emit('close', { reason: 'submit' })
    }
  }
  // 更新快照
  snapshot.value = JSON.parse(JSON.stringify(formModel))
}

/** 重置：create 清空 / edit 回填原值 */
function resetForm(clearOnly = false) {
  if (isCreate.value || clearOnly) {
    Object.keys(formModel).forEach((k) => delete formModel[k])
    formRef.value?.clearValidate?.()
  } else {
    fillForm(snapshot.value)
    formRef.value?.clearValidate?.()
  }
}

/** 是否有未保存修改 */
function isDirty(): boolean {
  return JSON.stringify(formModel) !== JSON.stringify(snapshot.value)
}

/** 关闭（底部关闭按钮） */
function onClose() {
  if (container?.requestClose) {
    // 容器内：交给容器走关闭流程（容器统一执行未保存确认，避免重复弹窗）
    container.requestClose('manual')
    return
  }
  // 独立使用：自行确认
  if (props.confirmLeave && isDirty()) {
    ElMessageBox.confirm('有未保存的修改，确认离开？', '提示', {
      confirmButtonText: '确认离开',
      cancelButtonText: '继续编辑',
      type: 'warning'
    })
      .then(() => emit('close', { reason: 'manual' }))
      .catch(() => {})
    return
  }
  emit('close', { reason: 'manual' })
}

/** 供父组件/抽屉调用的离开检查 */
async function beforeLeave(): Promise<boolean> {
  if (!props.confirmLeave || !isDirty()) return true
  try {
    await ElMessageBox.confirm('有未保存的修改，确认离开？', '提示', {
      confirmButtonText: '确认离开',
      cancelButtonText: '继续编辑',
      type: 'warning'
    })
    return true
  } catch {
    return false
  }
}

// 表单变化事件（修改检测）
watch(
  formModel,
  () => {
    emit('change', getFormData())
  },
  { deep: true }
)

// 容器上下文（被 wd-drawer / wd-dialog 承载时存在）
const container = useContainer()
let removeBeforeClose: (() => void) | null = null
// 容器携带的数据（DrawerButton drawerData），props.data 优先
const containerData = computed(() => props.data || container?.data)

onMounted(() => {
  // HTML 场景：把 model 暴露给根模板作用域（v-model="model.xxx"）
  const appContext = instance?.appContext
  if (appContext) {
    appContext.config.globalProperties.model = formModel
    const rootProxy = appContext.app?.config?.globalProperties
    if (rootProxy) rootProxy.model = formModel
  }

  // 注册关闭前守卫：容器关闭时先做未保存确认（确认逻辑只走这一处，避免重复弹窗）
  if (container?.addBeforeClose) {
    removeBeforeClose = container.addBeforeClose(async () => {
      if (!props.confirmLeave || !isDirty()) return true
      try {
        await ElMessageBox.confirm('有未保存的修改，确认离开？', '提示', {
          confirmButtonText: '确认离开',
          cancelButtonText: '继续编辑',
          type: 'warning'
        })
        return true
      } catch {
        return false
      }
    })
  }

  if (props.mode === 'edit') {
    if (containerData.value) {
      fillForm(containerData.value)
    }
    if (props.active && props.api) {
      requestApi()
    }
  } else if (containerData.value) {
    fillForm(containerData.value)
  }
})

onBeforeUnmount(() => {
  removeBeforeClose?.()
  // 清理全局 model（仅当仍指向本实例时）
  const appContext = instance?.appContext
  if (appContext?.config?.globalProperties?.model === formModel) {
    delete appContext.config.globalProperties.model
  }
})

defineExpose({
  requestApi,
  submitForm,
  resetForm,
  validate,
  getFormData,
  isDirty,
  beforeLeave,
  fillForm,
  formRef
})
</script>

<style scoped>
.wd-data-form {
  width: 100%;
}
.wd-data-form__footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: var(--wd-spacing-base, 12px);
  border-top: 1px solid var(--wd-border-color-light, #e4e7ed);
  margin-top: var(--wd-spacing-base, 12px);
}
</style>
