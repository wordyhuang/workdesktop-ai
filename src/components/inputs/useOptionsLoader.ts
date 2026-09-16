/**
 * 输入选择组共享：选项自动加载（静态数组 or api）、前插/后追加固定项
 */
import { ref, shallowRef, onMounted, watch, type Ref } from 'vue'
import { request } from '../../lib/core/http'

export interface UseOptionsOptions {
  api: Ref<string>
  apiMethod: Ref<'get' | 'post'>
  apiParam: Ref<Record<string, any>>
  active: Ref<boolean>
  dataSource: Ref<any[] | undefined>
  textProp: Ref<string>
  valueProp: Ref<string>
  tipsProp?: Ref<string>
  addData: Ref<any[] | undefined>
  appendData: Ref<any[] | undefined>
  emit: (event: any, ...args: any[]) => void
}

export interface NormalizedOption {
  text: string
  value: any
  /** 悬停提示内容（取 tipsProp 字段，无则为空字符串） */
  tips: string
  /** 原始数据（默认插槽上下文 { option }） */
  raw: Record<string, any>
}

export function useOptionsLoader(opts: UseOptionsOptions) {
  const options = shallowRef<NormalizedOption[]>([])
  const loading = ref(false)
  /** 标记是否加载过，避免重复请求 */
  const loaded = ref(false)

  function normalize(list: any[]): NormalizedOption[] {
    const textKey = opts.textProp.value
    const valueKey = opts.valueProp.value
    const tipsKey = opts.tipsProp?.value || 'tips'
    return (list || []).map((item) => {
      if (item && typeof item === 'object') {
        const tips = item[tipsKey]
        return {
          text: item[textKey],
          value: item[valueKey],
          tips: tips === null || tips === undefined ? '' : String(tips),
          raw: item
        }
      }
      // 基本类型数组 [1,2,3] / ['a','b']
      return { text: String(item), value: item, tips: '', raw: { [textKey]: String(item), [valueKey]: item } }
    })
  }

  async function fetchOptions(extraParam?: Record<string, any>) {
    // 静态数据源
    if (opts.dataSource.value) {
      options.value = mergeFixed(normalize(opts.dataSource.value))
      return
    }
    if (!opts.api.value) {
      options.value = mergeFixed([])
      return
    }
    loading.value = true
    opts.emit('apiBefore', { url: opts.api.value })
    try {
      const param = { ...opts.apiParam.value, ...(extraParam || {}) }
      const result =
        opts.apiMethod.value === 'get'
          ? await request.get(opts.api.value, param)
          : await request.post(opts.api.value, param)
      if (result.success) {
        const list = Array.isArray(result.data) ? result.data : result.data?.list || []
        options.value = mergeFixed(normalize(list))
        opts.emit('apiSuccess', { data: result.data })
      } else {
        opts.emit('apiFail', { code: result.code, message: result.message })
      }
    } catch (error: any) {
      opts.emit('apiFail', { error, message: error?.message })
    } finally {
      loading.value = false
      opts.emit('apiAfter')
      loaded.value = true
    }
  }

  /** 合并前插/后追加固定项 */
  function mergeFixed(main: NormalizedOption[]): NormalizedOption[] {
    const head = normalize(opts.addData.value || [])
    const tail = normalize(opts.appendData.value || [])
    return [...head, ...main, ...tail]
  }

  /** 远程搜索（Select remote / AutoComplete） */
  async function remoteSearch(keyword: string, keywordKey = 'keyword') {
    if (!opts.api.value) return
    await fetchOptions({ [keywordKey]: keyword })
  }

  onMounted(() => {
    if (opts.active.value) {
      fetchOptions()
    } else if (opts.dataSource.value || !opts.api.value) {
      options.value = mergeFixed(normalize(opts.dataSource.value || []))
    }
  })

  watch(
    () => [opts.api.value, opts.dataSource.value],
    () => {
      if (opts.active.value || opts.dataSource.value) fetchOptions()
    }
  )

  return { options, loading, fetchOptions, remoteSearch, loaded }
}
