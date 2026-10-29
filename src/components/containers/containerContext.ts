/**
 * 容器（Dialog/Drawer）与内部内容（DataForm 等）的联动上下文
 */
import { inject, provide, type InjectionKey } from 'vue'

export interface ContainerContext {
  /** 容器携带的数据（DrawerButton data 等，供内部表单回填） */
  data?: Record<string, any>
  /** 请求关闭容器（DataForm headCloseDrawer 提交成功后调用） */
  requestClose: (reason?: string) => void
  /** 注册关闭前拦截（返回 false 阻止关闭，如 DataForm 的 confirmLeave） */
  addBeforeClose: (guard: () => Promise<boolean>) => () => void
  /**
   * 注册内容组件自身的刷新函数（如 DataGrid.refresh）。
   * 容器 refresh() 优先调用注册的刷新函数（只重拉数据、不销毁组件），
   * 无注册时回退 key 强制重挂载。
   */
  registerRefresh?: (fn: () => any) => () => void
}

export const WD_CONTAINER_KEY: InjectionKey<ContainerContext> = Symbol('wdContainer')

export function provideContainer(ctx: ContainerContext) {
  provide(WD_CONTAINER_KEY, ctx)
}

export function useContainer(): ContainerContext | undefined {
  return inject(WD_CONTAINER_KEY, undefined)
}
