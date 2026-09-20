// 行李清单 store：可复用模板（templateId）+ 按行程清单（tripId）
import { defineStore } from 'pinia'
import { usePersisted } from './persist'
import { DB_KEYS } from '../utils/storage'
import { uid } from '../utils/id'

export const usePackingStore = defineStore('packing', () => {
  const { data: templates, load: loadTemplates, replaceAll: replaceTemplates } = usePersisted(
    DB_KEYS.packTemplates,
    []
  )
  const { data: items, load: loadItems, replaceAll: replaceItems } = usePersisted(
    DB_KEYS.packItems,
    []
  )

  async function load() {
    await Promise.all([loadTemplates(), loadItems()])
  }

  // ---- 模板 ----
  function templateItems(templateId) {
    return items.value.filter((i) => i.templateId === templateId)
  }

  function addTemplate(name) {
    const tpl = { id: uid('tpl'), name, createdAt: new Date().toISOString() }
    templates.value.push(tpl)
    return tpl
  }

  function renameTemplate(id, name) {
    const tpl = templates.value.find((t) => t.id === id)
    if (tpl) tpl.name = name
  }

  /** 删除模板及其条目 */
  function removeTemplate(id) {
    items.value = items.value.filter((i) => i.templateId !== id)
    templates.value = templates.value.filter((t) => t.id !== id)
  }

  function addTemplateItem(templateId, name) {
    if (!name.trim()) return
    items.value.push({ id: uid('pack'), templateId, tripId: null, name: name.trim(), checked: false })
  }

  // ---- 按行程 ----
  function tripItems(tripId) {
    return items.value.filter((i) => i.tripId === tripId)
  }

  /** 行程清单完成度 */
  function tripProgress(tripId) {
    const list = tripItems(tripId)
    const done = list.filter((i) => i.checked).length
    return { total: list.length, done, pct: list.length ? Math.round((done / list.length) * 100) : 0 }
  }

  function addTripItem(tripId, name) {
    if (!name.trim()) return
    items.value.push({ id: uid('pack'), templateId: null, tripId, name: name.trim(), checked: false })
  }

  function toggleItem(id) {
    const item = items.value.find((i) => i.id === id)
    if (item) item.checked = !item.checked
  }

  function removeItem(id) {
    items.value = items.value.filter((i) => i.id !== id)
  }

  /** 清掉某行程已勾选的项 */
  function clearDoneForTrip(tripId) {
    items.value = items.value.filter((i) => !(i.tripId === tripId && i.checked))
  }

  /** 把模板克隆为某行程的清单（同名跳过，checked 归零） */
  function applyTemplate(templateId, tripId) {
    const exist = new Set(tripItems(tripId).map((i) => i.name))
    let added = 0
    templateItems(templateId).forEach((i) => {
      if (!exist.has(i.name)) {
        items.value.push({
          id: uid('pack'),
          templateId: null,
          tripId,
          name: i.name,
          checked: false,
        })
        added++
      }
    })
    return added
  }

  function removeByTrip(tripId) {
    items.value = items.value.filter((i) => i.tripId !== tripId)
  }

  return {
    templates,
    items,
    load,
    replaceAll: (tpls, its) => {
      replaceTemplates(tpls)
      replaceItems(its)
    },
    templateItems,
    tripItems,
    tripProgress,
    addTemplate,
    renameTemplate,
    removeTemplate,
    addTemplateItem,
    addTripItem,
    toggleItem,
    removeItem,
    clearDoneForTrip,
    applyTemplate,
    removeByTrip,
  }
})
