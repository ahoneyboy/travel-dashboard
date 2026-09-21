// 分享文案解析：从社交平台（小红书/抖音/微博等）复制或分享来的文案里
// 识别「好地方」——先匹配内置景区库（命中即带出完整资料），再用地名后缀
// 启发式提取未收录的候选地点。全程离线，不请求任何外部服务。
import { getPresetLibrary, ATTRACTION_ALIASES } from '../data/attractions'
import { CITY_COORDS } from './geo'

// 地名后缀词表：用于从未收录的文案里捞「疑似地点」
const PLACE_SUFFIX =
  /(古镇|古城|村|寨|岛|半岛|山|峰|石窟|瀑布|大峡谷|峡谷|草原|沙漠|沙漠公园|温泉|公园|乐园|老街|夜市|步行街|天池|梯田|雪山|小镇|盐湖|海滩|海湾|湖泊|寺|庙|城墙|博物馆|美术馆|风景区|度假区|地质公园|森林公园)/

const PLACE_RE = new RegExp(`([\\u4e00-\\u9fa5A-Za-z]{2,12}?${PLACE_SUFFIX.source})`, 'g')

// 文案里常见的时间词 / 动词 / 语气前缀，从候选地名里迭代剥离
const TIME_PREFIX = /^(今天|昨天|明天|后天|早上|上午|中午|下午|傍晚|晚上|夜里|附近|顺路|旁边|隔壁|顺便)/
const NOISE_PREFIX = /^(去|到了|抵达|打卡|来到|走进|路过|安利|推荐|种草|位于|就在|冲|超爱|最爱|喜欢|脚下|藏|发现)/
const PARTICLE_PREFIX = /^(的|了|是|在|一个)/

/**
 * 解析分享文案
 * @param {string} text 原始分享文案
 * @returns {{ matches: Array<object>, candidates: string[], locationHint: string }}
 * matches：库内命中的景点（完整资料，可直接导入）；candidates：未收录的疑似地点候选
 */
export function analyzeShareText(text) {
  const raw = (text || '').trim()
  if (!raw) return { matches: [], candidates: [], locationHint: '' }

  // 1) 别名归一化：把文案里的短名/俗称补写成正式名，让库匹配更容易命中
  let norm = raw
  for (const [alias, full] of Object.entries(ATTRACTION_ALIASES)) {
    if (norm.includes(alias) && !norm.includes(full)) norm += `\n${full}`
  }

  // 2) 库内匹配：全名命中权重最高，城市/省份作辅助信号
  const lib = getPresetLibrary()
  const matches = lib
    .map((d) => {
      let score = 0
      if (norm.includes(d.name)) score += 10
      if (d.city && d.city !== d.name && norm.includes(d.city)) score += 2
      if (d.province && norm.includes(d.province)) score += 1
      return { d, score }
    })
    .filter((x) => x.score >= 10)
    .sort((a, b) => b.score - a.score || a.d.name.length - b.d.name.length)
    .slice(0, 6)
    .map(({ d }) => ({
      name: d.name,
      province: d.province,
      city: d.city,
      level: d.level,
      bestSeason: d.bestSeason,
      rating: d.rating,
      imageUrl: d.imageUrl,
      note: d.note,
    }))

  // 3) 未收录地点：地名后缀启发式
  const known = new Set([
    ...matches.map((m) => m.name),
    ...Object.keys(ATTRACTION_ALIASES),
    ...Object.keys(CITY_COORDS),
  ])
  const matchedNames = matches.map((m) => m.name)
  const isRedundant = (name) =>
    matchedNames.some(
      (n) => name.includes(n) || (name.length >= 2 && n.includes(name)) || n.slice(-2) === name.slice(-2)
    )
  const candidates = []
  for (const m of raw.matchAll(PLACE_RE)) {
    let name = m[1]
    // 剥掉「明天去」「顺便安利附近的」「脚下的」这类修饰，最多三轮
    for (let i = 0; i < 3; i++) {
      name = name.replace(TIME_PREFIX, '').replace(NOISE_PREFIX, '').replace(PARTICLE_PREFIX, '')
    }
    if (name.length < 2 || known.has(name) || candidates.includes(name) || isRedundant(name)) continue
    candidates.push(name)
    if (candidates.length >= 6) break
  }

  // 4) 省市提示：取第一个出现的已知城市
  const locationHint = Object.keys(CITY_COORDS).find((c) => raw.includes(c)) || ''

  return { matches, candidates, locationHint }
}

/** 从文案里截一段摘要，做导入条目的备注 */
export function excerpt(text, max = 80) {
  const t = (text || '').replace(/#[^#]+\s?#?/g, ' ').replace(/\s+/g, ' ').trim()
  return t.length > max ? `${t.slice(0, max)}…` : t
}
