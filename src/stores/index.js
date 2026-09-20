// 应用初始化：首次使用灌入演示数据，之后从 IndexedDB 加载
import { dbClear, dbGet, dbSet, DB_KEYS } from '../utils/storage'
import { buildSeedData } from '../utils/seed'
import { useTripsStore } from './trips'
import { useItineraryStore } from './itinerary'
import { useDestinationsStore } from './destinations'
import { useExpensesStore } from './expenses'
import { usePackingStore } from './packing'
import { useMemoriesStore } from './memories'
import { useWishlistStore } from './wishlist'
import { useSettingsStore } from './settings'

export async function initStores() {
  const seeded = await dbGet(DB_KEYS.seeded, false)
  if (!seeded) {
    const data = buildSeedData()
    await Promise.all(
      // settings 单独存对象，其余都是数组
      Object.entries(data).map(([name, value]) => dbSet(DB_KEYS[name], value))
    )
    await dbSet(DB_KEYS.seeded, true)
  }

  await Promise.all([
    useTripsStore().load(),
    useItineraryStore().load(),
    useDestinationsStore().load(),
    useExpensesStore().load(),
    usePackingStore().load(),
    useMemoriesStore().load(),
    useWishlistStore().load(),
    useSettingsStore().load(),
  ])
}

/** 数据导入后：整体替换各模块（由 settings 模块的 importData 调用） */
export function replaceAllStores(data) {
  useTripsStore().replaceAll(data.trips || [])
  useItineraryStore().replaceAll(data.dayPlans || [], data.itineraryItems || [])
  useDestinationsStore().replaceAll(data.destinations || [])
  useExpensesStore().replaceAll(data.expenses || [])
  usePackingStore().replaceAll(data.packTemplates || [], data.packItems || [])
  useMemoriesStore().replaceAll(data.memories || [])
  useWishlistStore().replaceAll(data.wishlist || [])
  useSettingsStore().replaceAll(data.settings || {})
}

/** 清空全部数据（设置页「清空数据」用） */
export async function clearAllStores() {
  await dbClear()
  replaceAllStores({
    trips: [],
    dayPlans: [],
    itineraryItems: [],
    destinations: [],
    expenses: [],
    packTemplates: [],
    packItems: [],
    memories: [],
    wishlist: [],
    settings: {},
  })
  // 标记已初始化，避免下次启动又灌入演示数据
  await dbSet(DB_KEYS.seeded, true)
}

/** 汇总全部模块数据为可导出对象 */
export function buildExportPayload() {
  return {
    app: 'travel-workbench',
    version: 1,
    exportedAt: new Date().toISOString(),
    data: {
      trips: useTripsStore().trips,
      dayPlans: useItineraryStore().dayPlans,
      itineraryItems: useItineraryStore().items,
      destinations: useDestinationsStore().destinations,
      expenses: useExpensesStore().expenses,
      packTemplates: usePackingStore().templates,
      packItems: usePackingStore().items,
      memories: useMemoriesStore().memories,
      wishlist: useWishlistStore().wishlist,
      settings: useSettingsStore().settings,
    },
  }
}

/** 导入 JSON 文本（校验 + 整体替换） */
export async function importPayload(text) {
  let obj
  try {
    obj = JSON.parse(text)
  } catch {
    throw new Error('文件不是有效的 JSON')
  }
  if (!obj || obj.app !== 'travel-workbench' || typeof obj.data !== 'object' || obj.data === null) {
    throw new Error('这不是本应用导出的数据文件')
  }
  const d = obj.data
  const arr = (v) => (Array.isArray(v) ? v : [])
  replaceAllStores({
    trips: arr(d.trips),
    dayPlans: arr(d.dayPlans),
    itineraryItems: arr(d.itineraryItems),
    destinations: arr(d.destinations),
    expenses: arr(d.expenses),
    packTemplates: arr(d.packTemplates),
    packItems: arr(d.packItems),
    memories: arr(d.memories),
    wishlist: arr(d.wishlist),
    settings: typeof d.settings === 'object' && d.settings !== null ? d.settings : {},
  })
  // 导入的数据视为「已初始化」，避免下次启动误判重新灌入演示数据
  await dbSet(DB_KEYS.seeded, true)
}
