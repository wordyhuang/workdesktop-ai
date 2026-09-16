/**
 * 跨 iframe 容器联动 hooks（供 iframe 内页面使用）
 * 与父容器的 wd-drawer 组件通过 postMessage 协议通信
 */
import { onBeforeUnmount } from 'vue'

type ContainerMessage = {
  type: string
  payload?: any
  requestId?: string
}

export interface IframeContainerApi {
  /** 通知父容器：表单提交成功 → 请求关闭抽屉并刷新表格 */
  notifySubmitSuccess: () => void
  /** 通知父容器：当前表单脏状态变更 → 注册/注销未保存确认守卫 */
  notifyDirty: (dirty: boolean) => void
  /**
   * 就绪后与父容器握手：父容器会下发初始化数据（Drawer 的 data prop）
   * 同时自动响应父容器的「关闭前脏状态确认」：调用方需在收到确认时给出 allowClose
   */
  connect: (options?: {
    onInit?: (data?: Record<string, any>) => void
    /** 关闭前询问是否允许关闭（返回 false 阻止关闭） */
    onAskClose?: () => boolean | Promise<boolean>
  }) => void
}

/**
 * 提供给 iframe 内页面，拿到与父容器通信的方法。
 * 注意：iframe 与父容器同源时无需配置；跨域时必须传父容器的 origin。
 */
export function useIframeContainer(origin?: string): IframeContainerApi {
  const targetOrigin = origin || window.location.origin

  function sendToParent(type: string, payload?: any, requestId?: string) {
    if (!window.parent || window.parent === window) {
      console.warn('[useIframeContainer] 当前不在 iframe 内，消息未发送:', type)
      return
    }
    const msg: ContainerMessage = { type, payload }
    if (requestId) msg.requestId = requestId
    window.parent.postMessage(msg, targetOrigin)
  }

  function notifySubmitSuccess() {
    sendToParent('wd-container:submit-success')
  }

  function notifyDirty(dirty: boolean) {
    sendToParent('wd-container:dirty', { dirty })
  }

  function connect(options?: { onInit?: (data?: Record<string, any>) => void; onAskClose?: () => boolean | Promise<boolean> }) {
    const handleMessage = (event: MessageEvent) => {
      // 跨域安全校验：只信任父容器来源
      if (origin && event.origin !== origin) return
      const data = event.data
      if (!data || typeof data !== 'object' || !data.type) return

      // 父容器下发初始化数据
      if (data.type === 'wd-container:init') {
        options?.onInit?.(data.payload?.data)
      }
      // 父容器关闭前询问是否允许关闭 → 回复
      if (data.type === 'wd-container:dirty-confirm' && data.requestId) {
        Promise.resolve(options?.onAskClose?.() ?? true).then((allowClose) => {
          sendToParent('wd-container:dirty-confirm-response', { allowClose }, data.requestId)
        })
      }
    }

    // 就绪握手：通知父容器已就绪，父容器会下发 wd-container:init
    sendToParent('wd-container:ready')

    window.addEventListener('message', handleMessage)
    onBeforeUnmount(() => {
      window.removeEventListener('message', handleMessage)
    })
  }

  return { notifySubmitSuccess, notifyDirty, connect }
}
