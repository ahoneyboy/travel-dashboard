// 日期工具：内部统一使用 'YYYY-MM-DD' 字符串（可直接用字符串比较大小）

/** Date/时间戳 → 'YYYY-MM-DD' */
export function fmt(date) {
  const d = date instanceof Date ? date : new Date(date)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

/** 今天的 'YYYY-MM-DD' */
export function today() {
  return fmt(new Date())
}

/** 起止日期之间共多少天（含首尾） */
export function tripDays(start, end) {
  if (!start || !end) return 0
  const diff = Math.round((new Date(end) - new Date(start)) / 86400000)
  return Math.max(diff + 1, 0)
}

/** 目标日期距今天还剩多少天（负数表示已过去） */
export function daysUntil(dateStr) {
  if (!dateStr) return NaN
  const target = new Date(dateStr)
  const now = new Date(today())
  return Math.round((target - now) / 86400000)
}

/** 日期所在月份 key，如 '2026-10' */
export function monthKey(dateStr) {
  return dateStr ? dateStr.slice(0, 7) : ''
}

/** 日期所在年份，如 2026 */
export function yearOf(dateStr) {
  return dateStr ? Number(dateStr.slice(0, 4)) : 0
}

/** 从某月开始往前数 n 个月的月份 key 列表（时间升序），默认截止到当前月 */
export function lastMonthKeys(n, endKey = monthKey(today())) {
  const [y, m] = endKey.split('-').map(Number)
  const keys = []
  for (let i = 0; i < n; i++) {
    const d = new Date(y, m - 1 - i, 1)
    keys.unshift(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  return keys
}

/** 遍历起止日期，返回每天日期数组 */
export function eachDay(start, end) {
  const days = []
  let cur = start
  const total = tripDays(start, end)
  for (let i = 0; i < total; i++) {
    days.push(cur)
    const d = new Date(cur)
    d.setDate(d.getDate() + 1)
    cur = fmt(d)
  }
  return days
}

const WEEK = ['日', '一', '二', '三', '四', '五', '六']

/** '2026-10-05' → '10.05' */
export function fmtShort(dateStr) {
  return dateStr ? dateStr.slice(5).replace('-', '.') : ''
}

/** '2026-10-05' → '2026.10.05' */
export function fmtSlash(dateStr) {
  return dateStr ? dateStr.replaceAll('-', '.') : ''
}

/** '2026-10-05' → '2026年10月5日' */
export function fmtCN(dateStr) {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-')
  return `${Number(y)}年${Number(m)}月${Number(d)}日`
}

/** '2026-10-05' → '周日' */
export function weekCN(dateStr) {
  if (!dateStr) return ''
  return `周${WEEK[new Date(dateStr).getDay()]}`
}

/** '2026-10' → '10月'；withYear 时 → '2026.10' */
export function monthLabel(key, withYear = false) {
  if (!key) return ''
  const [y, m] = key.split('-')
  return withYear ? `${y}.${m}` : `${Number(m)}月`
}
