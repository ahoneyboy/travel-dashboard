// 旅行回忆（相册）store
import { computed } from 'vue'
import { defineStore } from 'pinia'
import { usePersisted } from './persist'
import { DB_KEYS } from '../utils/storage'
import { uid } from '../utils/id'

export const useMemoriesStore = defineStore('memories', () => {
  const { data: memories, load, replaceAll } = usePersisted(DB_KEYS.memories, [])

  /** 全部回忆，按日期倒序 */
  const sorted = computed(() =>
    [...memories.value].sort((a, b) => (b.date || '').localeCompare(a.date || ''))
  )

  function addMemory(payload) {
    memories.value.push({
      id: uid('mem'),
      tripId: null,
      imageUrl: '',
      caption: '',
      date: '',
      ...payload,
    })
  }

  function updateMemory(id, patch) {
    const mem = memories.value.find((m) => m.id === id)
    if (mem) Object.assign(mem, patch)
  }

  function removeMemory(id) {
    memories.value = memories.value.filter((m) => m.id !== id)
  }

  function removeByTrip(tripId) {
    memories.value = memories.value.filter((m) => m.tripId !== tripId)
  }

  return { memories, load, replaceAll, sorted, addMemory, updateMemory, removeMemory, removeByTrip }
})
