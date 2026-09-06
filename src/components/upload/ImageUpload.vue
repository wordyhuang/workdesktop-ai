<template>
  <div class="wd-image-upload" :class="{ 'is-hide-add': hideAdd }">
    <el-upload
      ref="uploadRef"
      :action="resolvedAction"
      list-type="picture-card"
      :accept="accept || 'image/*'"
      :limit="maxCount"
      :multiple="maxCount > 1"
      v-model:file-list="innerFileList"
      :before-upload="beforeUpload"
      :before-remove="beforeRemove"
      :on-success="onSuccess"
      :on-error="onError"
      :on-preview="onPreview"
      :on-exceed="onExceed"
      v-bind="$attrs"
    >
      <el-icon><Plus /></el-icon>
      <template #tip>
        <div v-if="tip" class="el-upload__tip">{{ tip }}</div>
      </template>
    </el-upload>

    <wd-viewer
      v-if="preview"
      v-model="viewerVisible"
      :src="viewerSources"
      :page="viewerPage"
      type="image"
      @page-change="onViewerPageChange"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import type { UploadFile, UploadFiles, UploadInstance, UploadProps, UploadUserFile } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import { request } from '../../lib/core/http'
import { getGlobalConfig } from '../../lib/core/config'
import { refreshDataGrid } from '../../lib/core/linkage'
import { filterProp, headRefreshDatagridProp } from '../common/props'
import Viewer from '../utils/Viewer.vue'
import type { PropType } from 'vue'

defineOptions({ name: 'WdImageUpload', inheritAttrs: false })

const props = defineProps({
  ...filterProp,
  ...headRefreshDatagridProp,
  /** 上传地址 */
  api: { type: String, default: '' },
  /** 后端删除地址 */
  deleteApi: { type: String, default: '' },
  /** 删除请求方法 */
  deleteMethod: {
    type: String as PropType<'get' | 'post' | 'put' | 'delete'>,
    default: 'post'
  },
  /** 删除主键字段 */
  primaryKey: { type: String, default: 'id' },
  /** 最大图片数量，超限隐藏加号 */
  maxCount: { type: Number, default: 8 },
  /** 缩略图尺寸（px，兼容属性式字符串写法） */
  thumbnailSize: { type: [Number, String], default: 100 },
  /** 是否点击缩略图大图预览（集成 Viewer） */
  preview: { type: Boolean, default: true },
  /** 接收类型，默认 image/* */
  accept: { type: String, default: '' },
  /** 单图大小限制（MB） */
  maxSize: { type: Number, default: 5 },
  /** 提示文案 */
  tip: { type: String, default: '' },
  /** v-model：已上传图片地址数组 */
  modelValue: { type: Array as PropType<string[]>, default: () => [] }
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

const uploadRef = ref<UploadInstance>()
const innerFileList = ref<UploadUserFile[]>(
  props.modelValue.map((url) => ({ name: url.split('/').pop() || 'image', url }))
)
const viewerVisible = ref(false)
const viewerPage = ref(1)

watch(
  () => props.modelValue,
  (val) => {
    innerFileList.value = val.map((url) => ({ name: url.split('/').pop() || 'image', url }))
  }
)

/** 仅展示成功图片的地址（用于 Viewer 轮播） */
const viewerSources = computed(() =>
  innerFileList.value.map((f) => f.url || (f as any).biz?.url || '').filter(Boolean)
)

/** 达到上限隐藏加号 */
const hideAdd = computed(() => innerFileList.value.length >= props.maxCount)

const resolvedAction = computed(() => {
  if (!props.api) return '#'
  if (/^https?:\/\//.test(props.api)) return props.api
  const prefix = getGlobalConfig().request.urlPrefix || ''
  return prefix ? `${prefix.replace(/\/$/, '')}/${props.api.replace(/^\//, '')}` : props.api
})

function syncModel() {
  const urls = innerFileList.value
    .map((f) => f.url || (f as any).biz?.url || (f as any).biz?.path || '')
    .filter(Boolean)
  emit('update:modelValue', urls)
  emit('change', urls)
}

const beforeUpload: UploadProps['beforeUpload'] = (rawFile) => {
  if (!rawFile.type.startsWith('image/')) {
    ElMessage.error('仅支持上传图片文件')
    return false
  }
  if (props.maxSize && rawFile.size / 1024 / 1024 > props.maxSize) {
    ElMessage.error(`图片大小不能超过 ${props.maxSize}MB`)
    return false
  }
  emit('apiBefore', { url: props.api, file: rawFile })
  return true
}

const onSuccess: UploadProps['onSuccess'] = (response, uploadFile, uploadFiles) => {
  const cfg = getGlobalConfig()
  const { codeName, messageName, dataName } = cfg.response.props
  const code = response?.[codeName]
  const ok = code === undefined || code === null || Number.isNaN(Number(code)) || Number(code) >= cfg.response.successCode

  ;(uploadFile as any).response = response
  if (ok && response?.[dataName]) {
    const bizData = response[dataName]
    ;(uploadFile as any).biz = bizData
    if (bizData && typeof bizData === 'object') {
      uploadFile.url = uploadFile.url || bizData.url || bizData.path
    } else if (typeof bizData === 'string') {
      uploadFile.url = bizData
    }
  }

  if (ok) {
    emit('success', { response, file: uploadFile, files: uploadFiles })
    emit('apiSuccess', { data: response?.[dataName], raw: response })
    if (props.headRefreshDatagrid) refreshDataGrid(props.headRefreshDatagrid, props.filter)
  } else {
    ElMessage.error(response?.[messageName] || '上传失败')
    // 失败项从列表移除
    innerFileList.value = innerFileList.value.filter((f) => f.uid !== uploadFile.uid)
    emit('error', { response, file: uploadFile })
    emit('apiFail', { code, message: response?.[messageName] })
  }
  emit('apiAfter', { url: props.api })
  syncModel()
}

const onError: UploadProps['onError'] = (err, uploadFile) => {
  ElMessage.error('上传失败，请稍后重试')
  innerFileList.value = innerFileList.value.filter((f) => f.uid !== uploadFile.uid)
  emit('error', { error: err, file: uploadFile })
  emit('apiException', { error: err, message: err?.message })
  emit('apiAfter', { url: props.api, error: err })
  syncModel()
}

const beforeRemove: UploadProps['beforeRemove'] = async (uploadFile) => {
  try {
    await ElMessageBox.confirm('确认删除该图片？', '提示', {
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
      const param = { [props.primaryKey]: fileId }
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
    emit('delete-success', { file: uploadFile })
  }
  return true
}

const onPreview: UploadProps['onPreview'] = (uploadFile) => {
  emit('preview', { file: uploadFile })
  if (!props.preview) return
  const idx = viewerSources.value.findIndex((url) => url === (uploadFile.url || (uploadFile as any).biz?.url))
  viewerPage.value = idx >= 0 ? idx + 1 : 1
  viewerVisible.value = true
}

function onViewerPageChange(page: number) {
  viewerPage.value = page
}

const onExceed: UploadProps['onExceed'] = () => {
  ElMessage.warning(`最多上传 ${props.maxCount} 张图片`)
  emit('exceed', { maxCount: props.maxCount })
}

function clearFiles() {
  uploadRef.value?.clearFiles()
  innerFileList.value = []
  syncModel()
}

defineExpose({ clearFiles, uploadRef })
</script>

<style scoped>
.wd-image-upload :deep(.el-upload-list--picture-card .el-upload-list__item),
.wd-image-upload :deep(.el-upload--picture-card) {
  width: v-bind('thumbnailSize + "px"');
  height: v-bind('thumbnailSize + "px"');
}
.wd-image-upload.is-hide-add :deep(.el-upload--picture-card),
.wd-image-upload :deep(.is-hide-add .el-upload--picture-card) {
  display: none;
}
</style>
