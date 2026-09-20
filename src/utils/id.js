// 生成唯一 id：前缀 + 时间戳 + 随机串，本地数据够用
export function uid(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
}
