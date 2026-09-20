// 花费 store：按行程录入，分类统计
import { defineStore } from 'pinia'
import { usePersisted } from './persist'
import { DB_KEYS } from '../utils/storage'
import { uid } from '../utils/id'

export const EXPENSE_CATEGORIES = ['交通', '住宿', '餐饮', '景点', '购物', '其他']

// 分类 → 颜色（与示例页一致）
export const CATEGORY_COLORS = {
  交通: '#5b8fd6',
  住宿: '#4a9e6e',
  餐饮: '#e8935a',
  景点: '#e0a85a',
  购物: '#9b7ec4',
  其他: '#829189',
}

export const useExpensesStore = defineStore('expenses', () => {
  const { data: expenses, load, replaceAll } = usePersisted(DB_KEYS.expenses, [])

  /** 某行程的花费（按日期倒序） */
  function forTrip(tripId) {
    return expenses.value
      .filter((e) => e.tripId === tripId)
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
  }

  /** 某行程总花费 */
  function totalFor(tripId) {
    return expenses.value
      .filter((e) => e.tripId === tripId)
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
  }

  /** 某行程按分类汇总：[{ category, amount }]，金额降序 */
  function byCategory(tripId) {
    const map = {}
    expenses.value
      .filter((e) => e.tripId === tripId)
      .forEach((e) => {
        map[e.category] = (map[e.category] || 0) + (Number(e.amount) || 0)
      })
    return Object.entries(map)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
  }

  function addExpense(payload) {
    expenses.value.push({
      id: uid('exp'),
      tripId: '',
      category: '其他',
      amount: 0,
      date: '',
      note: '',
      ...payload,
    })
  }

  function updateExpense(id, patch) {
    const exp = expenses.value.find((e) => e.id === id)
    if (exp) Object.assign(exp, patch)
  }

  function removeExpense(id) {
    expenses.value = expenses.value.filter((e) => e.id !== id)
  }

  function removeByTrip(tripId) {
    expenses.value = expenses.value.filter((e) => e.tripId !== tripId)
  }

  return {
    expenses,
    load,
    replaceAll,
    forTrip,
    totalFor,
    byCategory,
    addExpense,
    updateExpense,
    removeExpense,
    removeByTrip,
  }
})
