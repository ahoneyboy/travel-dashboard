// localforage 封装：所有业务数据都存 IndexedDB，导出/导入也基于这里的 key
import localforage from 'localforage'

const db = localforage.createInstance({
  name: 'travel-workbench',
  storeName: 'workbench',
  description: '旅行规划与回忆工作台本地数据',
})

// 各数据集合的存储 key（与 Pinia store 一一对应）
export const DB_KEYS = {
  trips: 'trips',
  dayPlans: 'dayPlans',
  itineraryItems: 'itineraryItems',
  destinations: 'destinations',
  expenses: 'expenses',
  packTemplates: 'packTemplates',
  packItems: 'packItems',
  memories: 'memories',
  wishlist: 'wishlist',
  settings: 'settings',
  seeded: 'meta:seeded',
}

export async function dbGet(key, fallback = null) {
  try {
    const v = await db.getItem(key)
    return v === null || v === undefined ? fallback : v
  } catch (e) {
    console.error('[storage] 读取失败', key, e)
    return fallback
  }
}

export async function dbSet(key, value) {
  try {
    await db.setItem(key, value)
    return true
  } catch (e) {
    console.error('[storage] 写入失败', key, e)
    return false
  }
}

export async function dbClear() {
  try {
    await db.clear()
    return true
  } catch (e) {
    console.error('[storage] 清空失败', e)
    return false
  }
}

export { db }
