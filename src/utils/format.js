// 金额 / 数字展示
export function fmtMoney(n) {
  const num = Number(n) || 0
  return `¥${num.toLocaleString('zh-CN', { maximumFractionDigits: 0 })}`
}

export function fmtNum(n) {
  return (Number(n) || 0).toLocaleString('zh-CN')
}
