// 目的地库 store
import { computed } from 'vue'
import { defineStore } from 'pinia'
import { usePersisted } from './persist'
import { DB_KEYS } from '../utils/storage'
import { uid } from '../utils/id'

// 目的地状态：去过 / 想去
export const DEST_STATUS = [
  { value: 'visited', label: '去过' },
  { value: 'want', label: '想去' },
]

export const useDestinationsStore = defineStore('destinations', () => {
  const { data: destinations, load, replaceAll } = usePersisted(DB_KEYS.destinations, [])

  const visited = computed(() => destinations.value.filter((d) => d.status === 'visited'))
  const wanted = computed(() => destinations.value.filter((d) => d.status === 'want'))

  function byId(id) {
    return destinations.value.find((d) => d.id === id) || null
  }

  function addDestination(payload) {
    destinations.value.unshift({
      id: uid('dest'),
      name: '',
      country: '',
      province: '',
      city: '',
      status: 'want',
      level: '',
      bestSeason: '',
      rating: 0,
      imageUrl: '',
      note: '',
      createdAt: new Date().toISOString(),
      ...payload,
    })
  }

  function updateDestination(id, patch) {
    const dest = byId(id)
    if (dest) Object.assign(dest, patch)
  }

  function removeDestination(id) {
    destinations.value = destinations.value.filter((d) => d.id !== id)
  }

  return {
    destinations,
    load,
    replaceAll,
    visited,
    wanted,
    byId,
    addDestination,
    updateDestination,
    removeDestination,
  }
})
