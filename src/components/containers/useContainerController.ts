/**
 * 容器组件（Dialog/Drawer）共享逻辑：
 * 显隐、iframe/内容渲染、关闭前拦截（confirmMessage + 内容注册的 beforeClose 守卫）、关闭后联动刷新
 */
import { ref, provide } from 'vue'
import { ElMessageBox } from 'element-plus'
import { refreshDataGrid } from '../../lib/core/linkage'
import { provideContainer, type ContainerContext } from './containerContext'

export function useContainerController(options: {
  props: {
    modelValue?: boolean
    url?: string
    title?: string
    confirmMessage?: string
    headRefreshDatagrid?: boolean | string
    filter?: string
    [key: string]: any
  }
  emit: (event: any, ...args: any[]) => void
}) {
  const { props, emit } = options
  const visible = ref(!!props.modelValue)
  /** 关闭前守卫集合（内部 DataForm 的 confirmLeave 等） */
  const beforeCloseGuards = new Set<() => Promise<boolean>>()

  function syncVisible(val: boolean) {
    visible.value = val
    emit('update:modelValue', val)
  }

  function open() {
    syncVisible(true)
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
    // 1. 内容守卫（DataForm 未保存确认）
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

  // 向内部内容（DataForm）提供容器上下文
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
    onClosed
  }
}
