/**
 * 容器组件（Dialog/Drawer）共享逻辑：
 * 显隐、iframe/内容渲染、关闭前拦截（confirmMessage + 内容注册的 beforeClose 守卫）、关闭后联动刷新
 */
import { ref, watch, provide, onMounted, onBeforeUnmount, computed } from 'vue'
import { ElMessageBox } from 'element-plus'
import { refreshDataGrid } from '../../lib/core/linkage'
import { provideContainer, type ContainerContext } from './containerContext'

type BridgeMessage = {
  type: string
  payload?: any
}

export function useContainerController(options: {
  props: {
    modelValue?: boolean
    url?: string
    title?: string
    confirmMessage?: string
    headRefreshDatagrid?: boolean | string
    filter?: string
    data?: Record<string, any>
    origin?: string
    [key: string]: any
  }
  emit: (event: any, ...args: any[]) => void
}) {
  const { props, emit } = options
  const visible = ref(!!props.modelValue)

  // 受控模式：外部 v-model 变化时同步显隐。
  // 容器可能「挂载后再置 true」（如 DrawerButton 懒挂载两段式打开），必须监听后续变化，
  // 否则 modelValue 只在挂载时生效一次，弹层永远无法打开。
  watch(
    () => props.modelValue,
    (val) => {
      if (val !== visible.value) visible.value = !!val
    }
  )

  // 反向同步：弹层被 X/遮罩/ESC 关闭后（el-dialog/drawer 内部把 visible 置 false，不经过 syncVisible），
  // 需把实际状态回写外部，否则父级 v-model 仍为 true，下次打开会失效。
  watch(visible, (val) => {
    if (props.modelValue !== val) emit('update:modelValue', val)
  })

  /** 关闭前守卫集合（内部 DataForm 的 confirmLeave 等，含 iframe 上报） */
  const beforeCloseGuards = new Set<() => Promise<boolean>>()

  function syncVisible(val: boolean) {
    visible.value = val
    emit('update:modelValue', val)
  }

  function open() {
    syncVisible(true)
    emit('open')
    sendInitToIframe()
    emit('open')
  }

  /**
   * 供内部内容主动请求关闭（DataForm headCloseDrawer）
   * @param reason 'submit'=提交成功，直接关闭；其余先走过渡守卫（未保存确认）
   */
  async function requestClose(reason = 'request') {
    if (reason !== 'submit') {
      const allowed = await runGuards()
      if (!allowed) return
    }
    syncVisible(false)
    afterClosed(reason)
  }

  function addBeforeClose(guard: () => Promise<boolean>) {
    beforeCloseGuards.add(guard)
    return () => beforeCloseGuards.delete(guard)
  }

  /** 执行全部内容守卫，任一返回 false 则中止 */
  async function runGuards(): Promise<boolean> {
    for (const guard of beforeCloseGuards) {
      const ok = await guard()
      if (!ok) return false
    }
    return true
  }

  /** el-dialog/el-drawer 关闭拦截入口（X 按钮 / 遮罩 / ESC） */
  async function handleBeforeClose(done: () => void) {
    // 1. 内容守卫（DataForm 未保存确认，含 iframe）
    const allowed = await runGuards()
    if (!allowed) return
    // 2. 容器自身确认
    if (props.confirmMessage) {
      try {
        await ElMessageBox.confirm(props.confirmMessage, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
      } catch {
        return
      }
    }
    done()
    afterClosed('manual')
  }

  function onClosed() {
    emit('close')
  }

  function afterClosed(reason: string) {
    emit('confirm', { reason })
    // 关闭后声明式联动刷新 DataGrid
    if (props.headRefreshDatagrid) {
      refreshDataGrid(props.headRefreshDatagrid, props.filter)
    }
  }

  // ================= iframe 跨上下文桥接 =================
  let iframeRef: HTMLIFrameElement | null = null
  const targetOrigin = computed(() => {
    if (props.origin) return props.origin
    if (!props.url) return window.location.origin
    try {
      return new URL(props.url).origin
    } catch {
      return window.location.origin
    }
  })

  /** 消息来源校验：targetOrigin='*' 时放行（与 postMessage 通配语义一致） */
  function isAllowedOrigin(eventOrigin: string) {
    return targetOrigin.value === '*' || eventOrigin === targetOrigin.value
  }

  function setIframeRef(el: HTMLIFrameElement | null) {
    iframeRef = el
  }

  function sendToIframe(type: string, payload?: any) {
    if (!iframeRef?.contentWindow) return
    const msg: BridgeMessage = { type, payload }
    iframeRef.contentWindow.postMessage(msg, targetOrigin.value)
  }

  /** 发送初始化数据给 iframe（代替 query 参数，支持复杂对象） */
  function sendInitToIframe() {
    if (!props.url) return
    sendToIframe('wd-container:init', { data: props.data })
  }

  /**
   * 处理 iframe 发来的消息：
   * 1. 以 emit 透传给外部（iframe-message 原始透传 + iframe-xxx 语义化事件）
   * 2. 保留默认联动行为（提交成功自动关闭、脏状态自动注册守卫、就绪自动下发数据）
   */
  function onBridgeMessage(event: MessageEvent) {
    // 安全校验：来源必须匹配目标 origin（* 通配放行）
    if (!isAllowedOrigin(event.origin)) return
    const data = event.data
    if (!data || typeof data !== 'object' || !data.type) return

    // 透传原始消息，外部可用 @iframe-message 统一监听
    emit('iframe-message', data)

    switch (data.type) {
      // 提交成功：关闭容器并刷新
      case 'wd-container:submit-success':
        emit('iframe-submit-success', data.payload)
        requestClose('submit')
        break
      // 子页面主动请求关闭（DataForm「关闭」按钮 / 业务主动触发）
      case 'wd-container:close':
        requestClose('manual')
        break
      // 注册/注销未保存守卫
      case 'wd-container:dirty':
        emit('iframe-dirty', data.payload)
        if (data.payload?.dirty) {
          addBeforeClose(async () => {
            return new Promise((resolve) => {
              const requestId = Math.random().toString(36).slice(2)
              const handler = (e: MessageEvent) => {
                if (!isAllowedOrigin(e.origin)) return
                if (e.data?.type === 'wd-container:dirty-confirm-response' && e.data?.requestId === requestId) {
                  window.removeEventListener('message', handler)
                  resolve(!!e.data.payload.allowClose)
                }
              }
              window.addEventListener('message', handler)
              sendToIframe('wd-container:dirty-confirm', { requestId })
            })
          })
        }
        break
      case 'wd-container:ready':
        emit('iframe-ready', data.payload)
        sendInitToIframe()
        break
      default:
        break
    }
  }

  onMounted(() => {
    window.addEventListener('message', onBridgeMessage)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('message', onBridgeMessage)
  })

  // 向内部内容（非 iframe 的 Vue 插槽内容）提供容器上下文
  provideContainer({
    data: props.data,
    requestClose,
    addBeforeClose
  } as ContainerContext)

  return {
    visible,
    open,
    requestClose,
    addBeforeClose,
    handleBeforeClose,
    onClosed,
    // iframe 桥接暴露
    setIframeRef,
    sendToIframe,
    targetOrigin
  }
}
