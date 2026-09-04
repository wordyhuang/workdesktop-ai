import { onUnmounted } from 'vue'

/**
 * 轻量事件总线（PRD 5.3 / 6.3）
 * 跨组件事件联动。组件卸载自动 off。
 */

type Handler = (payload?: any) => void

const channel: Map<string, Set<Handler>> = new Map()

function emit(event: string, payload?: any) {
  const set = channel.get(event)
  if (!set) return
  set.forEach((fn) => {
    try {
      fn(payload)
    } catch (e) {
      console.error(`[WorkDesktop] eventBus[${event}] handler error:`, e)
    }
  })
}

function on(event: string, handler: Handler): () => void {
  if (!channel.has(event)) channel.set(event, new Set())
  channel.get(event)!.add(handler)
  return () => off(event, handler)
}

function off(event: string, handler: Handler) {
  channel.get(event)?.delete(handler)
}

function clear(event?: string) {
  if (event) channel.delete(event)
  else channel.clear()
}

export function useEventBus() {
  const disposers: Array<() => void> = []

  const autoOn = (event: string, handler: Handler) => {
    const dispose = on(event, handler)
    disposers.push(dispose)
    return dispose
  }

  // 组件卸载时自动 off（setup 上下文中）
  try {
    onUnmounted(() => {
      disposers.forEach((d) => d())
      disposers.length = 0
    })
  } catch {
    // 组件外使用时无生命周期，忽略
  }

  return {
    emit,
    on: autoOn,
    off,
    clear
  }
}

export type EventBus = ReturnType<typeof useEventBus>
