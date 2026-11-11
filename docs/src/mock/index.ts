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

// ---------- 全局延迟配置 ----------
/**
 * Mock API 延迟（毫秒）：所有 /mock/* 响应统一随机等待 min~max，
 * 模拟真实网络耗时，便于演示组件的加载（loading）状态。
 * dev（vite HTTP 中间件）与 prod（axios adapter）两条链路共用；
 * min/max 调 0 即关闭延迟。
 */
export const mockApiDelay = { min: 500, max: 1000 }

/** 按 mockApiDelay 区间随机等待 */
function sleepRandom(): Promise<void> {
  const { min, max } = mockApiDelay
  const ms = Math.max(0, min + Math.random() * Math.max(0, max - min))
  return ms ? new Promise((resolve) => setTimeout(resolve, ms)) : Promise.resolve()
}

// ---------- 内存数据 ----------
export interface UserItem {
  id: number
  name: string
  /** 性别：1 男，2 女 */
  gender: number
  dept: string
  role: number
  status: number
  email: string
  phone: string
  /** 岗位 */
  job: string
  /** 季度目标完成进度（0-100） */
  progress: number
  /** 最近一次绩效：A/B/C/D */
  performance: string
  /** 入职日期 YYYY-MM-DD */
  entryTime: string
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
const jobs = [
  '前端工程师', '后端工程师', '测试工程师', '架构师',
  '产品经理', 'UI 设计师', '交互设计师',
  '市场专员', '品牌经理', '运营专员', '数据分析师'
]
/** 姓名与性别配对：[姓名, 性别(1男 2女)] */
const namePool: [string, number][] = [
  ['张伟', 1], ['王芳', 2], ['李娜', 2], ['刘洋', 1], ['陈静', 2],
  ['杨帆', 1], ['赵磊', 1], ['黄敏', 2], ['周杰', 1], ['吴婷', 2],
  ['徐强', 1], ['孙丽', 2], ['马超', 1], ['朱琳', 2], ['胡军', 1],
  ['郭娟', 2], ['林峰', 1], ['何雪', 2], ['高翔', 1], ['罗丹', 2],
  ['郑凯', 1], ['梁爽', 2], ['谢鹏', 1], ['韩梅', 2], ['唐勇', 1],
  ['冯璐', 2], ['于浩', 1], ['董洁', 2], ['萧远', 1], ['袁媛', 2],
  ['邓超', 1], ['许晴', 2], ['傅博', 1], ['沈妍', 2], ['彭飞', 1],
  ['苏红', 2], ['吕刚', 1], ['蒋雯', 2], ['蔡明', 1], ['贾玲', 2],
  ['丁宁', 2], ['魏晨', 1], ['薛佳', 2], ['叶斌', 1], ['阎妮', 2],
  ['余欢', 1], ['潘越', 1], ['杜鹃', 2], ['戴琪', 2], ['夏天', 1],
  ['钟琴', 2], ['汪海', 1], ['任洁', 2]
]
const performancePool = ['A', 'B', 'C', 'B', 'A', 'C', 'B', 'D']

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

/** 当前时间文本 YYYY-MM-DD HH:mm:ss（流水记录用） */
function nowText() {
  const d = new Date()
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`
}

const store = {
  users: namePool.map(([name, gender], i): UserItem => {
    const id = i + 1
    const progress = [100, 92, 88, 76, 65, 58, 43, 27, 12, 0][i % 10]
    return {
      id,
      name,
      gender,
      dept: depts[i % depts.length],
      role: (i % 3) + 1,
      status: i % 7 === 2 ? 0 : 1,
      email: `user${String(id).padStart(3, '0')}@workdesktop.cn`,
      phone: `13${(i % 9) + 1}${String(10000000 + ((i * 7919) % 89999999)).slice(0, 8)}`,
      job: jobs[i % jobs.length],
      progress,
      performance: performancePool[i % performancePool.length],
      entryTime: `20${19 + (i % 7)}-${pad2((i % 12) + 1)}-${pad2((i % 27) + 1)}`,
      createTime: `2026-0${(i % 9) + 1}-${pad2((i % 27) + 1)}`
    }
  }),
  /** 设置中心 · 变更记录（保存配置后追加流水） */
  settingsLogs: [
    { id: 3, section: '安全与登录', action: '修改了登录密码', time: '2026-11-09 18:24:10' },
    { id: 2, section: '通知偏好', action: '开启了任务指派的短信提醒', time: '2026-11-06 10:32:45' },
    { id: 1, section: '基本设置', action: '更新了「个人签名」', time: '2026-11-03 09:15:02' }
  ] as { id: number; section: string; action: string; time: string }[],
  nextLogId: 4
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
  if (keyword) {
    list = list.filter(
      (u) => u.name.includes(keyword) || u.email.includes(keyword) || u.phone.includes(keyword)
    )
  }
  if (p.dept) list = list.filter((u) => u.dept === p.dept)
  if (p.role) list = list.filter((u) => u.role === Number(p.role))
  if (p.gender) list = list.filter((u) => u.gender === Number(p.gender))
  if (p.performance) list = list.filter((u) => u.performance === String(p.performance))
  if (p.status !== undefined && p.status !== '') list = list.filter((u) => u.status === Number(p.status))
  // entryTime 为日期区间（数组或逗号分隔字符串）：[开始, 结束]
  const range = Array.isArray(p.entryTime) ? p.entryTime : String(p.entryTime || '').split(',')
  if (range.length === 2 && range[0] && range[1]) {
    list = list.filter((u) => u.entryTime >= range[0] && u.entryTime <= range[1])
  }
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
    name: params.name || `新员工${newId}`,
    gender: Number(params.gender) || 1,
    dept: params.dept || depts[0],
    role: Number(params.role) || 1,
    status: Number(params.status) ?? 1,
    email: params.email || `user${String(newId).padStart(3, '0')}@workdesktop.cn`,
    phone: params.phone || '13800000000',
    job: params.job || jobs[0],
    progress: Number(params.progress) || 0,
    performance: params.performance || 'C',
    entryTime: params.entryTime || '2026-09-04',
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

// ---------- 文件上传 / 删除（Upload / ImageUpload 文档示例） ----------
mock('post', /\/mock\/file\/upload$/, () => {
  const url = 'https://picsum.photos/seed/wd-upload/200/120'
  return ok({ id: 1, name: 'demo-file.png', url, path: url })
})

mock('delete', /\/mock\/file$/, () => ok(null, '文件已删除'))

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

// ---------- 导出（ApiButton 文档示例） ----------
// ApiButton 默认 apiMethod=post，get/post 双注册保证按钮不传 method 也能命中
mock('get', /\/mock\/user\/export$/, () =>
  ok({ url: 'https://example.com/export/users.xlsx' }, '导出任务已创建')
)
mock('post', /\/mock\/user\/export$/, () =>
  ok({ url: 'https://example.com/export/users.xlsx' }, '导出任务已创建')
)

// ---------- 设置中心（保存流水 / 变更记录 / 登录日志 / 安全操作） ----------
const settingSectionNames: Record<string, string> = {
  all: '全部设置',
  basic: '基本设置',
  security: '安全与登录',
  notify: '通知偏好',
  appearance: '外观与语言'
}

function handleSettingsSave(params: Record<string, any>) {
  const sectionKey = String(params.section || 'basic')
  const sectionName = settingSectionNames[sectionKey] || '设置'
  store.settingsLogs.unshift({
    id: store.nextLogId++,
    section: sectionName,
    action: `更新了「${sectionName}」配置`,
    time: nowText()
  })
  return ok(null, '保存成功，变更已记录')
}
mock('get', /\/mock\/settings\/save$/, ({ params }) => handleSettingsSave(params))
mock('post', /\/mock\/settings\/save$/, ({ params }) => handleSettingsSave(params))

function querySettingsLogs(params: Record<string, any>) {
  const p = params.param || params || {}
  const currentPage = Number(p.currentPage ?? params.currentPage ?? 1) || 1
  const pageSize = Number(p.pageSize ?? params.pageSize ?? 10) || 10
  // 变更记录页 with-pager=false，一次返回全量（避免跨运行累积后只显示首页）
  return {
    list: store.settingsLogs,
    total: store.settingsLogs.length,
    currentPage,
    pageSize
  }
}
mock('get', /\/mock\/settings\/logs$/, ({ params }) => ok(querySettingsLogs(params)))
mock('post', /\/mock\/settings\/logs$/, ({ params }) => ok(querySettingsLogs(params)))

const loginLogs = [
  { id: 1, time: '2026-11-11 09:12:38', device: 'Chrome · macOS', ip: '10.12.8.24', result: '登录成功' },
  { id: 2, time: '2026-11-10 20:47:02', device: 'Safari · iPhone', ip: '10.12.8.61', result: '登录成功' },
  { id: 3, time: '2026-11-10 14:05:19', device: 'Chrome · Windows', ip: '10.12.9.130', result: '登录成功' },
  { id: 4, time: '2026-11-09 18:23:46', device: 'Edge · Windows', ip: '10.12.9.130', result: '密码错误' },
  { id: 5, time: '2026-11-09 08:30:11', device: 'Feishu · iOS', ip: '10.12.8.61', result: '登录成功' }
]
mock('get', /\/mock\/settings\/login-logs$/, ({ params }) => {
  const p = params.param || params || {}
  const currentPage = Number(p.currentPage ?? params.currentPage ?? 1) || 1
  const pageSize = Number(p.pageSize ?? params.pageSize ?? 10) || 10
  const start = (currentPage - 1) * pageSize
  return ok({
    list: loginLogs.slice(start, start + pageSize),
    total: loginLogs.length,
    currentPage,
    pageSize
  })
})
mock('post', /\/mock\/settings\/login-logs$/, ({ params }) => {
  const p = params.param || params || {}
  const currentPage = Number(p.currentPage ?? params.currentPage ?? 1) || 1
  const pageSize = Number(p.pageSize ?? params.pageSize ?? 10) || 10
  const start = (currentPage - 1) * pageSize
  return ok({
    list: loginLogs.slice(start, start + pageSize),
    total: loginLogs.length,
    currentPage,
    pageSize
  })
})

mock('post', /\/mock\/settings\/sessions\/revoke$/, () => ok(null, '已强制下线其他设备'))
mock('post', /\/mock\/settings\/deactivate$/, () => ok(null, '注销申请已提交'))

// ---------- 任务列表（EditableGrid 接口分页 + 批量保存演示） ----------
interface TaskItem {
  id: number
  name: string
  owner: string
  priority: string
  progress: number
}

const taskNames = [
  '组件库文档站', '订单中台重构', '数据看板二期', '权限体系升级', '移动端适配',
  '网关限流改造', '日志平台接入', 'CI 流水线优化', '灰度发布方案', '缓存穿透治理',
  '消息队列迁移', '搜索体验优化', '账单对账系统', '客服工单重构', 'AB 实验平台',
  '内容审核接入', '国际化改造', '性能压测专项', '依赖升级治理', '安全漏洞修复',
  '新人引导改版', '数据字典梳理', '接口契约测试'
]

const store2 = {
  tasks: taskNames.map((name, i): TaskItem => ({
    id: i + 1,
    name,
    owner: namePool[i % namePool.length][0],
    priority: ['高', '中', '低'][i % 3],
    progress: [100, 92, 88, 76, 65, 58, 43, 27, 12, 0][i % 10]
  })),
  nextTaskId: taskNames.length + 1
}

function queryTaskList(params: Record<string, any>) {
  const p = params.param || params || {}
  const keyword = String(p.name || p.keyword || '').trim()
  let list = store2.tasks
  if (keyword) list = list.filter((t) => t.name.includes(keyword) || t.owner.includes(keyword))
  if (p.priority) list = list.filter((t) => t.priority === String(p.priority))
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

mock('get', /\/mock\/task\/list$/, ({ params }) => ok(queryTaskList(params)))
mock('post', /\/mock\/task\/list$/, ({ params }) => ok(queryTaskList(params)))

mock('post', /\/mock\/task\/batch-save$/, ({ params }) => {
  const rows: TaskItem[] = Array.isArray(params.rows) ? params.rows : []
  rows.forEach((row) => {
    const idx = store2.tasks.findIndex((t) => t.id === Number(row.id))
    if (idx >= 0) {
      store2.tasks[idx] = { ...store2.tasks[idx], ...row, id: Number(row.id) }
    } else {
      store2.tasks.unshift({ ...row, id: store2.nextTaskId++ })
    }
  })
  return ok({ count: rows.length }, `已保存 ${rows.length} 行`)
})

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

/**
 * 创建 axios adapter：在请求层短路 /mock/*，不发出真实 HTTP。
 *
 * 文档站没有后端，/mock/* 请求若真正发出会被 dev server 以 404 拒绝，
 * 导致响应拦截器（createMockInterceptor）根本不执行。adapter 在网络层之前
 * 直接返回伪造响应，未命中 /mock 的请求则委托给默认 adapter（fetch/xhr）。
 */
export function createMockAdapter() {
  return async (config: any) => {
    const url = String(config.url || '')
    const method = String(config.method || 'get').toLowerCase()
    const route = routes.find((r) => r.method === method && r.pattern.test(url))

    if (!route) {
      // 非 mock 请求：交给 axios 默认 adapter
      const { getAdapter } = await import('axios')
      const defaultAdapter = getAdapter(['fetch', 'xhr', 'http'])
      return defaultAdapter(config)
    }

    const query = config.params || {}
    let body: Record<string, any> = {}
    if (config.data) {
      try {
        body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data
      } catch {
        body = { raw: config.data }
      }
    }
    const result = route.handler({ params: { ...query, ...body }, url })

    // 全局 mock 延迟：模拟网络耗时，演示加载状态
    await sleepRandom()

    return {
      data: { code: result.code ?? 0, message: result.message ?? 'ok', data: result.data ?? null },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
      request: {}
    }
  }
}

/**
 * 读取 HTTP 请求 body（JSON）
 */
function readBody(req: any): Promise<Record<string, any>> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = []
    req.on('data', (c: Buffer) => chunks.push(c))
    req.on('end', () => {
      if (!chunks.length) return resolve({})
      const raw = Buffer.concat(chunks).toString('utf-8')
      try {
        resolve(raw ? JSON.parse(raw) : {})
      } catch {
        resolve({ raw })
      }
    })
  })
}

/**
 * 创建 vite dev server 中间件（HTTP 层 mock）：
 * 请求真实发出（浏览器 Network 可见 GET/POST /mock/xxx），由 dev server 返回伪造响应，
 * 未命中 /mock 的请求放行给 vite 正常处理。替代原来的 axios adapter 短路方案，
 * 解决「点击后 Network 面板看不到请求」的演示困惑。
 */
export function createMockHttpHandler() {
  return async (req: any, res: any, next: any) => {
    if (req.url === undefined) return next()
    const [pathname, queryStr] = String(req.url).split('?')
    if (!pathname.startsWith('/mock/')) return next()

    const method = String(req.method || 'get').toLowerCase()
    const route = routes.find((r) => r.method === method && r.pattern.test(pathname))
    if (!route) {
      res.statusCode = 404
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ code: -1, message: `mock 未定义: ${method} ${pathname}`, data: null }))
      return
    }

    const query: Record<string, any> = {}
    if (queryStr) {
      for (const [k, v] of new URLSearchParams(queryStr)) {
        query[k] = v
      }
    }

    let body: Record<string, any> = {}
    if (method === 'post' || method === 'put' || method === 'delete' || method === 'patch') {
      body = await readBody(req)
    }

    const result = route.handler({ params: { ...query, ...body }, url: pathname })

    // 全局 mock 延迟：模拟网络耗时，演示加载状态（404 未命中不延迟，立即暴露配置错误）
    await sleepRandom()

    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ code: result.code ?? 0, message: result.message ?? 'ok', data: result.data ?? null }))
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
