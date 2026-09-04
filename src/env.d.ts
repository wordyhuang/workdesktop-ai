/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
  export default component
}

// UMD 宿主通过 window 注入全局配置
declare interface Window {
  workDesktopConfig?: Record<string, any>
  WorkDesktop?: any
  Vue?: any
  ElementPlus?: any
  ElementPlusIconsVue?: any
}
