/**
 * 文档站：站点级 WorkDesktop 配置（单一来源）
 * main.ts app.use 注入；示例页清场后经 restoreSiteConfig() 重建同一份，
 * 避免 resetConfig 把 urlPrefix='/mock' / pager.pageSize=10 一并清掉无人补回。
 *
 * urlPrefix=/mock：
 * - 开发模式（dev）：请求真实发出到 dev server，由 docs/vite.config.ts 的 wd-mock-server
 *   插件在 HTTP 层返回假数据（浏览器 Network 可见 /mock/xxx）。
 * - 生产构建（build/preview 等静态部署无后端）：回退 axios adapter 短路，保证示例仍可演示。
 */
import { createMockAdapter } from './mock'

export const siteBaseConfig = {
  request: {
    urlPrefix: '/mock',
    ...(import.meta.env.PROD
      ? { axiosConfig: { adapter: createMockAdapter() } }
      : {})
  },
  page: {
    pager: { pageSize: 10 }
  }
}
