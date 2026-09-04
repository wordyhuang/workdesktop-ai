<template>
  <el-upload
    ref="uploadRef"
    :action="resolvedAction"
    :headers="uploadHeaders"
    :accept="accept"
    :limit="limit"
    :multiple="multiple"
    :auto-upload="autoUpload"
    :name="name"
    :data="data"
    :disabled="disabled"
    :show-file-list="showFileList"
    v-model:file-list="innerFileList"
    :before-upload="beforeUpload"
    :before-remove="beforeRemove"
    :on-success="onSuccess"
    :on-error="onError"
    :on-remove="onRemove"
    :on-exceed="onExceed"
    :on-preview="onPreview"
    v-bind="$attrs"
  >
    <slot>
      <el-button type="primary">{{ buttonText }}</el-button>
    </slot>
    <template v-if="withSubmit && !autoUpload" #tip>
      <div class="el-upload__tip">
        <el-button size="small" type="success" :loading="submitting" @click.stop="submitUpload">
          {{ submitButtonText }}
        </el-button>
      </div>
    </template>
  </el-upload>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, onMounted, ref, watch } from 'vue'
import type { UploadFile, UploadFiles, UploadInstance, UploadProps, UploadRawFile, UploadUserFile } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import { request } from '../../lib/core/http'
import { getGlobalConfig } from '../../lib/core/config'
import { refreshDataGrid } from '../../lib/core/linkage'
import { filterProp, headRefreshDatagridProp } from '../common/props'
import type { PropType } from 'vue'

defineOptions({ name: 'WdUpload', inheritAttrs: false })

const props = defineProps({
  ...filterProp,
  ...headRefreshDatagridProp,
  /** 上传地址（走全局 urlPrefix 拼接；为空则 el-upload 不真正提交，由外部接管） */
  api: { type: String, default: '' },
  /** 后端删除地址 */
  deleteApi: { type: String, default: '' },
  /** 删除请求方法 */
  deleteMethod: {
    type: String as PropType<'get' | 'post' | 'put' | 'delete'>,
    default: 'post'
  },
  /** 删除时取文件记录的主键字段名 */
  primaryKey: { type: String, default: 'id' },
  /** 手动提交按钮文案（auto-upload=false 时显示） */
  submitButtonText: { type: String, default: '开始上传' },
  /** 选择按钮文案（默认插槽未提供时） */
  buttonText: { type: String, default: '点击上传' },
  // ---- el-upload 同名透传 ----
  accept: { type: String, default: '' },
  limit: { type: Number, default: undefined },
  multiple: { type: Boolean, default: false },
  autoUpload: { type: Boolean, default: true },
  /** 上传字段名 */
  name: { type: String, default: 'file' },
  /** 附加表单数据 */
  data: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
  disabled: { type: Boolean, default: false },
  showFileList: { type: Boolean, default: true },
  /** 文件大小限制（MB），0 不限制 */
  maxSize: { type: Number, default: 0 },
  /** v-model 绑定的已上传文件列表（含后端返回记录） */
  modelValue: { type: Array as PropType<UploadUserFile[]>, default: () => [] }
})

const emit = defineEmits([
  'update:modelValue',
  'change',
  'success',
  'error',
  'delete-success',
  'preview',
  'exceed',
  'apiBefore',
  'apiSuccess',
  'apiFail',
  'apiException',
  'apiAfter'
])

const instance = getCurrentInstance()
const uploadRef = ref<UploadInstance>()
const submitting = ref(false)
const innerFileList = ref<UploadUserFile[]>([...props.modelValue])

watch(
  () => props.modelValue,
  (val) => {
    innerFileList.value = [...val]
  }
)

/** 拼接完整上传地址（el-upload 原生 XHR 不走 axios 实例，需自行拼 prefix） */
const resolvedAction = computed(() => {
  if (!props.api) return '#'
  if (/^https?:\/\//.test(props.api)) return props.api
  const cfg = getGlobalConfig()
  const prefix = cfg.request.urlPrefix || ''
  return prefix ? `${prefix.replace(/\/$/, '')}/${props.api.replace(/^\//, '')}` : props.api
})

/** 透传全局请求头（如 Authorization） */
const uploadHeaders = computed<Record<string, string>>(() => {
  const cfg = getGlobalConfig()
  const headers: Record<string, string> = {}
  const interceptor = cfg.request.transform.requestInterceptor
  // requestInterceptor 为 async，无法同步取头；此处仅注入静态 token 头
  const token = (cfg.request as any).token || ''
  if (token) headers.Authorization = `Bearer ${token}`
  return headers
})

const withSubmit = computed(() => !props.autoUpload)

function syncModel() {
  emit('update:modelValue', innerFileList.value)
  emit('change', innerFileList.value)
}

const beforeUpload: UploadProps['beforeUpload'] = (rawFile) => {
  if (props.maxSize && rawFile.size / 1024 / 1024 > props.maxSize) {
    ElMessage.error(`文件大小不能超过 ${props.maxSize}MB`)
    return false
  }
  emit('apiBefore', { url: props.api, file: rawFile })
  return true
}

/** el-upload 原生 XHR 成功回调：按全局解封约定判断业务成败 */
const onSuccess: UploadProps['onSuccess'] = (response, uploadFile, uploadFiles) => {
  const cfg = getGlobalConfig()
  const { codeName } = cfg.response.props
  const code = response?.[codeName]
  const ok = code === undefined || code === null || Number.isNaN(Number(code)) || Number(code) >= cfg.response.successCode

  // 把后端返回记录挂到文件对象，供删除时取主键
  ;(uploadFile as any).response = response
  if (ok && response?.[cfg.response.props.dataName]) {
    const bizData = response[cfg.response.props.dataName]
    ;(uploadFile as any).biz = bizData
    if (bizData && typeof bizData === 'object') {
      uploadFile.url = uploadFile.url || bizData.url || bizData.path
    }
  }

  if (ok) {
    emit('success', { response, file: uploadFile, files: uploadFiles })
    emit('apiSuccess', { data: response?.[cfg.response.props.dataName], raw: response })
    if (props.headRefreshDatagrid) refreshDataGrid(props.headRefreshDatagrid, props.filter)
  } else {
    ElMessage.error(response?.[cfg.response.props.messageName] || '上传失败')
    emit('error', { response, file: uploadFile })
    emit('apiFail', { code, message: response?.[cfg.response.props.messageName] })
  }
  emit('apiAfter', { url: props.api })
  syncModel()
}

const onError: UploadProps['onError'] = (err, uploadFile, uploadFiles) => {
  ElMessage.error('上传失败，请稍后重试')
  emit('error', { error: err, file: uploadFile, files: uploadFiles })
  emit('apiException', { error: err, message: err?.message })
  emit('apiAfter', { url: props.api, error: err })
  syncModel()
}

/**
 * 删除前置钩子：二次确认 + 已上传文件走后端删除接口
 * 返回 false / reject Promise 中止移除（el-upload 约定）
 */
const beforeRemove: UploadProps['beforeRemove'] = async (uploadFile) => {
  try {
    await ElMessageBox.confirm('确认删除该文件？删除后不可恢复。', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
  } catch {
    return false
  }

  const biz = (uploadFile as any).biz || uploadFile
  const fileId = biz?.[props.primaryKey] ?? (uploadFile.response as any)?.[props.primaryKey]

  if (props.deleteApi && fileId !== undefined && fileId !== null) {
    emit('apiBefore', { url: props.deleteApi })
    try {
      const param = { ...(props.data || {}), [props.primaryKey]: fileId }
      const result =
        props.deleteMethod === 'get'
          ? await request.get(props.deleteApi, param)
          : props.deleteMethod === 'delete'
            ? await request.delete(props.deleteApi, param)
            : props.deleteMethod === 'put'
              ? await request.put(props.deleteApi, param)
              : await request.post(props.deleteApi, param)
      if (result.success) {
        emit('delete-success', { file: uploadFile, data: result.data })
        emit('apiSuccess', { data: result.data })
        if (props.headRefreshDatagrid) refreshDataGrid(props.headRefreshDatagrid, props.filter)
      } else {
        emit('apiFail', { code: result.code, message: result.message })
        return false
      }
    } catch (error: any) {
      emit('apiException', { error, message: error?.message })
      return false
    } finally {
      emit('apiAfter', { url: props.deleteApi })
    }
  } else {
    // 仅本地移除（未上传成功或未配置删除接口）
    emit('delete-success', { file: uploadFile })
  }
  return true
}

/** 文件已从列表移除（el-upload 内部状态已更新） */
const onRemove: UploadProps['onRemove'] = () => {
  syncModel()
}

const onExceed: UploadProps['onExceed'] = (selectedFiles, uploadFiles) => {
  ElMessage.warning(`最多上传 ${props.limit} 个文件`)
  emit('exceed', { selectedFiles, files: uploadFiles })
}

const onPreview: UploadProps['onPreview'] = (uploadFile) => {
  emit('preview', { file: uploadFile })
}

/** 手动触发上传（auto-upload=false） */
function submitUpload() {
  uploadRef.value?.submit()
}

function clearFiles() {
  uploadRef.value?.clearFiles()
  innerFileList.value = []
  syncModel()
}

/** 追加外部文件记录（如表单回显） */
function addFile(file: UploadUserFile) {
  innerFileList.value = [...innerFileList.value, file]
  syncModel()
}

onMounted(() => {
  // 暴露给 HTML 场景根作用域（与 model/q 模式一致）
  if (instance) {
    instance.appContext.config.globalProperties.$wdUpload = { submitUpload, clearFiles }
  }
})

defineExpose({ submitUpload, clearFiles, addFile, uploadRef })
</script>
