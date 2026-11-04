/**
 * WdTag 色板与 auto 颜色匹配
 *
 * 12 种预设颜色（5 种 ElementPlus 语义色 + 7 种扩展色），每种以一个基准色值
 * 参与 light / plain / dark 三种 effect 的样式派生：
 *   light = 12% 浅底 + 彩字 + 25% 浅边框（color-mix）
 *   plain = 透明底 + 彩字 + 实色边框
 *   dark  = 实色底 + 白字
 *
 * type='auto'：按「语义关键词 → 稳定 hash」两步匹配：
 * 1. 内容文本命中下方关键词表（中英文，大小写不敏感）时返回对应颜色；
 * 2. 未命中时对文本做确定性 hash（同一文本永远映射到同一颜色），映射到 12 色之一。
 */

/** 色板颜色名（12 种预设色） */
export type WdTagColor =
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'purple'
  | 'cyan'
  | 'orange'
  | 'pink'
  | 'geekblue'
  | 'magenta'
  | 'lime'

/** type 属性取值：12 种预设色 + auto */
export type WdTagType = WdTagColor | 'auto'

/** 色板：颜色名 → 基准色值 */
export const TAG_PALETTE: Record<WdTagColor, string> = {
  primary: '#409eff', // 主蓝（ElementPlus primary）
  success: '#67c23a', // 成功绿（ElementPlus success）
  warning: '#e6a23c', // 警告黄（ElementPlus warning）
  danger: '#f56c6c', // 危险红（ElementPlus danger）
  info: '#909399', // 信息灰（ElementPlus info）
  purple: '#9254de', // 紫（推荐/会员/活动）
  cyan: '#13c2c2', // 青（测试/开发/灰度）
  orange: '#fa8c16', // 橙（提醒/延期）
  pink: '#eb2f96', // 品红（收藏/喜欢）
  geekblue: '#2f54eb', // 靛蓝（归档/发布）
  magenta: '#c41d7f', // 洋红（促销/爆款）
  lime: '#7cb305' // 黄绿（新鲜/生态/成长）
}

/** 色板颜色顺序（hash 兜底时的映射空间） */
export const TAG_COLOR_ORDER: WdTagColor[] = Object.keys(TAG_PALETTE) as WdTagColor[]

/**
 * auto 关键词表（按数组顺序匹配，取首个命中色）：
 * 先状态语义（success → danger → warning → info），后业务扩展语义。
 */
const AUTO_KEYWORDS: Array<{ color: WdTagColor; keys: string[] }> = [
  {
    color: 'success',
    keys: ['成功', '完成', '已完成', '正常', '通过', '启用', '在线', '已发布', '可用', 'success', 'ok', 'done', 'active', 'enabled', 'online', 'pass']
  },
  {
    color: 'danger',
    keys: ['失败', '错误', '异常', '禁用', '停用', '已拒绝', '已删除', '紧急', '严重', '高危', '已过期', '已失效', 'error', 'fail', 'danger', 'disabled', 'rejected', 'deleted', 'urgent', 'critical', 'expired']
  },
  {
    color: 'warning',
    keys: ['警告', '待处理', '进行中', '处理中', '待审核', '审核中', '等待', '暂停', '预警', '即将到期', 'warning', 'pending', 'processing', 'waiting', 'reviewing']
  },
  {
    color: 'info',
    keys: ['未知', '草稿', '未开始', '已取消', '暂无', 'info', 'unknown', 'draft', 'none', 'cancel']
  },
  {
    color: 'primary',
    keys: ['新增', '创建', '重点', '默认', 'new', 'add', 'create', 'primary', 'default']
  },
  {
    color: 'purple',
    keys: ['热门', '精选', '会员', '推荐', '活动', '限时', 'hot', 'vip', 'featured', 'recommend', 'activity']
  },
  {
    color: 'cyan',
    keys: ['测试', '开发', '灰度', '体验', '演示', 'beta', 'test', 'dev', 'canary', 'trial', 'demo']
  },
  {
    color: 'orange',
    keys: ['提醒', '注意', '低库存', '延期', 'notice', 'remind', 'delay']
  },
  {
    color: 'pink',
    keys: ['收藏', '喜欢', '关注', '点赞', 'favorite', 'like', 'follow', 'collect', 'star']
  },
  {
    color: 'geekblue',
    keys: ['归档', '历史', '已完结', '已上线', '发布', 'archive', 'history', 'publish', 'release', 'completed']
  },
  {
    color: 'magenta',
    keys: ['促销', '爆款', '热卖', '时尚', '醒目', 'promo', 'sale', 'fashion']
  },
  {
    color: 'lime',
    keys: ['新鲜', '生态', '环保', '成长', '自然', '有机', 'fresh', 'eco', 'nature', 'growth']
  }
]

/**
 * auto 颜色匹配（纯函数，确定性）：
 * 1. 语义关键词命中：文本包含即命中（大小写不敏感），按表顺序取首个命中色；
 * 2. 未命中走稳定 hash：同一文本永远映射到同一颜色；
 * 3. 空文本回退 primary。
 */
export function matchAutoColor(text: string): WdTagColor {
  const t = String(text ?? '')
    .trim()
    .toLowerCase()
  if (!t) return 'primary'
  for (const { color, keys } of AUTO_KEYWORDS) {
    if (keys.some((k) => t.includes(k))) return color
  }
  let sum = 0
  for (let i = 0; i < t.length; i++) sum = (sum * 31 + t.charCodeAt(i)) >>> 0
  return TAG_COLOR_ORDER[sum % TAG_COLOR_ORDER.length]
}
