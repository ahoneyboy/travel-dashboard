// 行程安排 store：DayPlan（按天）+ ItineraryItem（行程项）
// DayPlan.items 是派生视图：按 order 排序，拖拽排序即重排 order
import { ref } from 'vue'
import { defineStore } from 'pinia'
import { usePersisted } from './persist'
import { DB_KEYS } from '../utils/storage'
import { uid } from '../utils/id'
import { eachDay } from '../utils/date'

// 行程项类型
export const ITEM_TYPES = ['景点', '美食', '交通', '住宿', '购物', '游玩', '其他']

export const ITEM_TYPE_STYLE = {
  景点: 'bg-brand-light text-brand-dark',
  美食: 'bg-[#fdf0e3] text-[#b06a35]',
  交通: 'bg-[#e8eef8] text-[#4a6fa5]',
  住宿: 'bg-[#f0eaf8] text-[#7a5ea6]',
  购物: 'bg-[#fdeef5] text-[#b0557f]',
  游玩: 'bg-[#fdf3e0] text-[#a57b2a]',
  其他: 'bg-[#f0f2f0] text-[#6b7a72]',
}

export const useItineraryStore = defineStore('itinerary', () => {
  const { data: dayPlans, load: loadPlans, replaceAll: replacePlans } = usePersisted(
    DB_KEYS.dayPlans,
    []
  )
  const { data: items, load: loadItems, replaceAll: replaceItems } = usePersisted(
    DB_KEYS.itineraryItems,
    []
  )
  const loaded = ref(false)

  async function load() {
    await Promise.all([loadPlans(), loadItems()])
    loaded.value = true
  }

  /** 某行程的天列表（按日期升序） */
  function dayPlansFor(tripId) {
    return dayPlans.value
      .filter((d) => d.tripId === tripId)
      .sort((a, b) => (a.date || '').localeCompare(b.date || ''))
  }

  /** 某天的行程项（按手动 order，其次时间） */
  function itemsForDay(dayPlanId) {
    return items.value
      .filter((i) => i.dayPlanId === dayPlanId)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || (a.time || '').localeCompare(b.time || ''))
  }

  /** 某行程全部行程项 */
  function itemsForTrip(tripId) {
    const dayIds = new Set(dayPlansFor(tripId).map((d) => d.id))
    return items.value.filter((i) => dayIds.has(i.dayPlanId))
  }

  function dayById(id) {
    return dayPlans.value.find((d) => d.id === id) || null
  }
  function itemById(id) {
    return items.value.find((i) => i.id === id) || null
  }

  /** 依据行程起止日期补齐缺失的天，并删掉超出范围的天（连同其行程项） */
  function syncDayPlans(tripId, startDate, endDate) {
    if (!tripId || !startDate || !endDate) return
    const existing = new Set(dayPlansFor(tripId).map((d) => d.date))
    eachDay(startDate, endDate).forEach((date) => {
      if (!existing.has(date)) {
        dayPlans.value.push({ id: uid('day'), tripId, date, note: '' })
      }
    })
    // 行程改期后，清理范围外的天
    const stale = dayPlansFor(tripId).filter((d) => d.date < startDate || d.date > endDate)
    stale.forEach((d) => removeDayPlan(d.id))
  }

  function addDayPlan(tripId, date) {
    const day = { id: uid('day'), tripId, date, note: '' }
    dayPlans.value.push(day)
    return day
  }

  /** 删除某天（级联删除当天行程项） */
  function removeDayPlan(dayPlanId) {
    removeItemsOfDay(dayPlanId)
    dayPlans.value = dayPlans.value.filter((d) => d.id !== dayPlanId)
  }

  function removeItemsOfDay(dayPlanId) {
    items.value = items.value.filter((i) => i.dayPlanId !== dayPlanId)
  }

  function addItem(payload) {
    const dayItems = itemsForDay(payload.dayPlanId)
    const item = {
      id: uid('item'),
      dayPlanId: '',
      time: '',
      title: '',
      location: '',
      type: '景点',
      note: '',
      imageUrl: '',
      order: dayItems.length ? Math.max(...dayItems.map((i) => i.order ?? 0)) + 1 : 0,
      createdAt: new Date().toISOString(),
      ...payload,
    }
    items.value.push(item)
    return item
  }

  function updateItem(id, patch) {
    const item = itemById(id)
    if (item) Object.assign(item, patch)
  }

  function removeItem(id) {
    items.value = items.value.filter((i) => i.id !== id)
  }

  /** 拖拽排序后重排某天的 order（orderedIds 为新的完整顺序） */
  function reorderDay(dayPlanId, orderedIds) {
    orderedIds.forEach((id, idx) => {
      const item = itemById(id)
      if (item) item.order = idx
    })
  }

  /** 把行程项移动到另一天（放到末尾） */
  function moveItemToDay(itemId, dayPlanId) {
    const item = itemById(itemId)
    if (!item || item.dayPlanId === dayPlanId) return
    const dayItems = itemsForDay(dayPlanId)
    item.dayPlanId = dayPlanId
    item.order = dayItems.length ? Math.max(...dayItems.map((i) => i.order ?? 0)) + 1 : 0
  }

  /** 删除行程时级联清理 */
  function removeTripData(tripId) {
    const dayIds = new Set(dayPlansFor(tripId).map((d) => d.id))
    items.value = items.value.filter((i) => !dayIds.has(i.dayPlanId))
    dayPlans.value = dayPlans.value.filter((d) => d.tripId !== tripId)
  }

  return {
    dayPlans,
    items,
    load,
    replaceAll: (plans, its) => {
      replacePlans(plans)
      replaceItems(its)
    },
    dayPlansFor,
    itemsForDay,
    itemsForTrip,
    dayById,
    itemById,
    syncDayPlans,
    addDayPlan,
    removeDayPlan,
    addItem,
    updateItem,
    removeItem,
    reorderDay,
    moveItemToDay,
    removeTripData,
  }
})
