/**
 * 文档站 Mock 数据层（T6.3 示例可运行的前提）
 *
 * 通过注入 request.transform.responseInterceptor，在 axios 响应到达组件库解封逻辑之前
 * 拦截 /mock/* 请求返回伪造响应体 { code, message, data }，使全部 API 类示例在无后端时可直接演示。
 *
 * 数据保存在内存 store，模拟真实增删改（同一会话内刷新列表可见变更）。
 */

export interface MockContext {
  /** 合并后的请求参数（query + body） */
  params: Record<string, any>
  /** 原始 URL（含 /mock 前缀） */
  url: string
}

export type MockHandler = (ctx: MockContext) => { code?: number; message?: string; data?: any }

interface MockRoute {
  method: string
  pattern: RegExp
  handler: MockHandler
}

// ---------- 内存数据 ----------
export interface UserItem {
  id: number
  name: string
  dept: string
  role: number
  status: number
  email: string
  createTime: string
}

const roles = [
  { value: 1, text: '管理员' },
  { value: 2, text: '编辑' },
  { value: 3, text: '访客' }
]
const states = [
  { value: 1, text: '启用' },
  { value: 0, text: '禁用' }
]
const depts = ['技术部', '产品部', '设计部', '市场部', '运营部']

const store = {
  users: Array.from({ length: 53 }, (_, i): UserItem => ({
    id: i + 1,
    name: `用户${i + 1}`,
    dept: depts[i % depts.length],
    role: (i % 3) + 1,
    status: i % 3 === 0 ? 0 : 1,
    email: `user${i + 1}@example.com`,
    createTime: `2026-0${(i % 9) + 1}-${String((i % 27) + 1).padStart(2, '0')}`
  })),
  files: [] as { id: number; name: string; url: string }[],
  nextFileId: 1
}

const routes: MockRoute[] = []

function mock(method: string, pattern: RegExp, handler: MockHandler) {
  routes.push({ method, pattern, handler })
}

function ok(data: any, message = 'ok') {
  return { code: 0, message, data }
}
function fail(message: string, code = -1) {
  return { code, message, data: null }
}

// ---------- 用户列表（分页 + 搜索） ----------
function queryUserList(params: Record<string, any>) {
  const p = params.param || params || {}
  const keyword = String(p.name || p.keyword || '').trim()
  let list = store.users
  if (keyword) list = list.filter((u) => u.name.includes(keyword) || u.email.includes(keyword))
  if (p.dept) list = list.filter((u) => u.dept === p.dept)
  if (p.status !== undefined && p.status !== '') list = list.filter((u) => u.status === Number(p.status))
  const currentPage = Number(p.currentPage ?? params.currentPage ?? 1) || 1
  const pageSize = Number(p.pageSize ?? params.pageSize ?? 10) || 10
  const start = (currentPage - 1) * pageSize
  return {
    list: list.slice(start, start + pageSize),
    total: list.length,
    currentPage,
    pageSize
  }
}

mock('get', /\/mock\/user\/list$/, ({ params }) => ok(queryUserList(params)))
mock('post', /\/mock\/user\/list$/, ({ params }) => ok(queryUserList(params)))

mock('get', /\/mock\/user\/detail$/, ({ params }) => {
  const id = Number(params.id)
  const row = store.users.find((u) => u.id === id)
  return row ? ok(row) : fail('未找到该用户')
})

mock('post', /\/mock\/user\/save$/, ({ params }) => {
  const id = Number(params.id)
  if (id) {
    const idx = store.users.findIndex((u) => u.id === id)
    if (idx < 0) return fail('用户不存在')
    store.users[idx] = { ...store.users[idx], ...params }
    return ok({ id }, '保存成功')
  }
  const newId = Math.max(0, ...store.users.map((u) => u.id)) + 1
  store.users.unshift({
    id: newId,
    name: params.name || `用户${newId}`,
    dept: params.dept || depts[0],
    role: Number(params.role) || 1,
    status: Number(params.status) ?? 1,
    email: params.email || `user${newId}@example.com`,
    createTime: '2026-09-04'
  })
  return ok({ id: newId }, '新增成功')
})

mock('delete', /\/mock\/user$/, ({ params }) => {
  const id = Number(params.id)
  const idx = store.users.findIndex((u) => u.id === id)
  if (idx >= 0) store.users.splice(idx, 1)
  return ok(null, '删除成功')
})

mock('post', /\/mock\/user\/status$/, ({ params }) => {
  const id = Number(params.id)
  const row = store.users.find((u) => u.id === id)
  if (!row) return fail('用户不存在')
  row.status = Number(params.status)
  return ok(null, '状态已更新')
})

// ---------- 选项 ----------
mock('get', /\/mock\/options\/roles$/, () => ok(roles))
mock('get', /\/mock\/options\/states$/, () => ok(states))

// ---------- 文件上传 / 删除 ----------
mock('post', /\/mock\/file\/upload$/, () => {
  const id = store.nextFileId++
  const name = `demo-file-${id}.png`
  const url = `https://picsum.photos/seed/wd${id}/200/120`
  store.files.push({ id, name, url })
  return ok({ id, name, url, path: url })
})

mock('delete', /\/mock\/file$/, ({ params }) => {
  const id = Number(params.id)
  const idx = store.files.findIndex((f) => f.id === id)
  if (idx >= 0) store.files.splice(idx, 1)
  return ok(null, '文件已删除')
})

// ---------- 部门树 ----------
const treeData = [
  {
    id: 1,
    name: '研发中心',
    children: [
      { id: 11, name: '前端组' },
      { id: 12, name: '后端组' },
      { id: 13, name: '测试组' }
    ]
  },
  {
    id: 2,
    name: '产品中心',
    children: [{ id: 21, name: '产品组' }, { id: 22, name: '设计组' }]
  },
  {
    id: 3,
    name: '运营中心',
    children: [{ id: 31, name: '市场组' }]
  }
]
mock('get', /\/mock\/dept\/tree$/, () => ok(treeData))

// ---------- 批量操作 ----------
mock('post', /\/mock\/user\/batch$/, ({ params }) => {
  const ids: number[] = Array.isArray(params.ids) ? params.ids.map(Number) : []
  const action = params.action
  ids.forEach((id) => {
    const row = store.users.find((u) => u.id === id)
    if (!row) return
    if (action === 'enable') row.status = 1
    else if (action === 'disable') row.status = 0
    else if (action === 'remove') {
      const idx = store.users.indexOf(row)
      if (idx >= 0) store.users.splice(idx, 1)
    }
  })
  return ok({ count: ids.length }, `批量操作完成（${ids.length} 条）`)
})

// ---------- 导出 ----------
mock('get', /\/mock\/user\/export$/, () =>
  ok({ url: 'https://example.com/export/users.xlsx' }, '导出任务已创建')
)

/**
 * 创建响应拦截器：命中 /mock/* 则返回伪造响应，否则放行真实请求
 */
export function createMockInterceptor() {
  return async (response: any) => {
    const cfg = response?.config || {}
    const url = String(cfg.url || '')
    const method = String(cfg.method || 'get').toLowerCase()
    const route = routes.find((r) => r.method === method && r.pattern.test(url))
    if (!route) return response

    const query = cfg.params || {}
    let body: Record<string, any> = {}
    if (cfg.data) {
      try {
        body = typeof cfg.data === 'string' ? JSON.parse(cfg.data) : cfg.data
      } catch {
        body = { raw: cfg.data }
      }
    }
    const result = route.handler({ params: { ...query, ...body }, url })
    return {
      ...response,
      data: { code: result.code ?? 0, message: result.message ?? 'ok', data: result.data ?? null },
      status: 200,
      statusText: 'OK'
    }
  }
}

/** 供静态示例直接读内存数据（Playground / 导出按钮用） */
export const mockStore = {
  get roles() {
    return roles
  },
  get states() {
    return states
  },
  get depts() {
    return depts
  },
  get users() {
    return store.users
  },
  get treeData() {
    return treeData
  }
}
