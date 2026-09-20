// 旅行计划 store：Trip CRUD + 统计口径
import { computed } from 'vue'
import { defineStore } from 'pinia'
import { usePersisted } from './persist'
import { useItineraryStore } from './itinerary'
import { useExpensesStore } from './expenses'
import { usePackingStore } from './packing'
import { useMemoriesStore } from './memories'
import { DB_KEYS } from '../utils/storage'
import { uid } from '../utils/id'
import { tripDays } from '../utils/date'

// 行程状态字典
export const TRIP_STATUS = [
  { value: 'planned', label: '未开始' },
  { value: 'ongoing', label: '进行中' },
  { value: 'done', label: '已完成' },
]

// 状态 → 徽标样式
export const TRIP_STATUS_STYLE = {
  planned: 'bg-[#e8eef8] text-[#4a6fa5]',
  ongoing: 'bg-brand-light text-brand-dark',
  done: 'bg-[#f0ece4] text-[#9a8b6f]',
}

export function tripStatusLabel(status) {
  return TRIP_STATUS.find((s) => s.value === status)?.label || '未开始'
}

export const useTripsStore = defineStore('trips', () => {
  const { data: trips, load, replaceAll } = usePersisted(DB_KEYS.trips, [])

  // 按开始日期倒序（新的在前）
  const sorted = computed(() =>
    [...trips.value].sort((a, b) => (b.startDate || '').localeCompare(a.startDate || ''))
  )
  // 待出发（按出发日期升序，最近的在前）
  const planned = computed(() =>
    trips.value
      .filter((t) => t.status === 'planned')
      .sort((a, b) => (a.startDate || '').localeCompare(b.startDate || ''))
  )
  const ongoing = computed(() => trips.value.filter((t) => t.status === 'ongoing'))
  const done = computed(() => trips.value.filter((t) => t.status === 'done'))
  // 最近一个待出发行程
  const nextTrip = computed(() => planned.value[0] || null)
  // 已走过的行程总天数（未开始的不计）
  const totalDays = computed(() =>
    trips.value
      .filter((t) => t.status !== 'planned')
      .reduce((sum, t) => sum + tripDays(t.startDate, t.endDate), 0)
  )
  // 去过的城市（来自已完成/进行中行程的目的地，去重）
  const visitedCities = computed(() => {
    const set = new Set()
    trips.value
      .filter((t) => t.status !== 'planned')
      .forEach((t) => (t.destinations || []).forEach((d) => set.add(d)))
    return [...set]
  })

  function byId(id) {
    return trips.value.find((t) => t.id === id) || null
  }

  function addTrip(payload) {
    trips.value.unshift({
      id: uid('trip'),
      name: '',
      startDate: '',
      endDate: '',
      destinations: [],
      budget: 0,
      coverImage: '',
      status: 'planned',
      notes: '',
      createdAt: new Date().toISOString(),
      ...payload,
    })
  }

  function updateTrip(id, patch) {
    const trip = byId(id)
    if (trip) Object.assign(trip, patch)
  }

  /** 删除行程，并级联清理日程/花费/清单/回忆 */
  function removeTrip(id) {
    useItineraryStore().removeTripData(id)
    useExpensesStore().removeByTrip(id)
    usePackingStore().removeByTrip(id)
    useMemoriesStore().removeByTrip(id)
    trips.value = trips.value.filter((t) => t.id !== id)
  }

  return {
    trips,
    load,
    replaceAll,
    sorted,
    planned,
    ongoing,
    done,
    nextTrip,
    totalDays,
    visitedCities,
    byId,
    addTrip,
    updateTrip,
    removeTrip,
  }
})

