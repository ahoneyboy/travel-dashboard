// 愿望清单 store：想去 / 已去 / 放弃
import { defineStore } from 'pinia'
import { usePersisted } from './persist'
import { DB_KEYS } from '../utils/storage'
import { uid } from '../utils/id'

export const WISH_STATUS = [
  { value: 'want', label: '想去' },
  { value: 'done', label: '已去' },
  { value: 'dropped', label: '放弃' },
]

export const WISH_STATUS_STYLE = {
  want: 'bg-brand-light text-brand-dark',
  done: 'bg-[#e8eef8] text-[#4a6fa5]',
  dropped: 'bg-[#f0f2f0] text-[#829189]',
}

export const useWishlistStore = defineStore('wishlist', () => {
  const { data: wishlist, load, replaceAll } = usePersisted(DB_KEYS.wishlist, [])

  function byId(id) {
    return wishlist.value.find((w) => w.id === id) || null
  }

  function addItem(payload) {
    wishlist.value.unshift({
      id: uid('wish'),
      name: '',
      location: '',
      bestSeason: '',
      status: 'want',
      level: '',
      imageUrl: '',
      note: '',
      createdAt: new Date().toISOString(),
      ...payload,
    })
  }

  function updateItem(id, patch) {
    const item = byId(id)
    if (item) Object.assign(item, patch)
  }

  function removeItem(id) {
    wishlist.value = wishlist.value.filter((w) => w.id !== id)
  }

  return { wishlist, load, replaceAll, byId, addItem, updateItem, removeItem }
})
