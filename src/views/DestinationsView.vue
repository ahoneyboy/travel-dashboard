<script setup>
// 目的地库：卡片 + 状态筛选 + 搜索 + CRUD
import { computed, ref } from 'vue'
import { Compass, MapPin, Pencil, Plus, Search, Sun, Trash2 } from 'lucide-vue-next'
import PageHeader from '../components/ui/PageHeader.vue'
import EmptyState from '../components/ui/EmptyState.vue'
import BaseDrawer from '../components/ui/BaseDrawer.vue'
import ImageUploader from '../components/ui/ImageUploader.vue'
import StarRating from '../components/ui/StarRating.vue'
import { useDestinationsStore, DEST_STATUS } from '../stores/destinations'
import { useUiStore } from '../stores/ui'

const destinations = useDestinationsStore()
const ui = useUiStore()

const filter = ref('all')
const keyword = ref('')
const drawerOpen = ref(false)
const editingId = ref(null)
const errors = ref({})

const form = ref({})

const filtered = computed(() => {
  let list = destinations.destinations
  if (filter.value !== 'all') list = list.filter((d) => d.status === filter.value)
  const kw = keyword.value.trim()
  if (kw) list = list.filter((d) => d.name.includes(kw) || d.country.includes(kw) || d.city.includes(kw))
  return list
})

function statusStyle(d) {
  return d.status === 'visited'
    ? 'bg-brand text-white'
    : 'bg-gold text-white'
}

function openCreate() {
  editingId.value = null
  form.value = { name: '', country: '中国', city: '', status: 'want', bestSeason: '', rating: 0, imageUrl: '', note: '' }
  errors.value = {}
  drawerOpen.value = true
}
function openEdit(d) {
  editingId.value = d.id
  form.value = { ...d }
  errors.value = {}
  drawerOpen.value = true
}

function save() {
  errors.value.name = form.value.name.trim() ? '' : '请输入目的地名称'
  if (errors.value.name) return
  const payload = { ...form.value, name: form.value.name.trim(), city: form.value.city.trim(), country: form.value.country.trim() }
  if (editingId.value) {
    destinations.updateDestination(editingId.value, payload)
    ui.toast('目的地已更新')
  } else {
    destinations.addDestination(payload)
    ui.toast('已加入目的地库')
  }
  drawerOpen.value = false
}

async function remove(d) {
  const ok = await ui.confirm({ title: '删除目的地', message: `确定删除「${d.name}」吗？` })
  if (ok) {
    destinations.removeDestination(d.id)
    ui.toast('已删除')
  }
}
</script>

<template>
  <div>
    <PageHeader title="目的地库" sub="去过的地方与想去的远方">
      <button class="btn-primary" @click="openCreate"><Plus class="h-4 w-4" /> 新增目的地</button>
    </PageHeader>

    <div class="mb-4 flex flex-wrap items-center gap-2.5">
      <div class="scroll-x flex gap-2">
        <button class="chip" :class="filter === 'all' && 'chip-active'" @click="filter = 'all'">全部</button>
        <button
          v-for="s in DEST_STATUS"
          :key="s.value"
          class="chip"
          :class="filter === s.value && 'chip-active'"
          @click="filter = s.value"
        >
          {{ s.label }}
        </button>
      </div>
      <div class="relative ml-auto w-full sm:w-56">
        <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input v-model="keyword" class="input !pl-9" placeholder="搜索名称 / 国家 / 城市" />
      </div>
    </div>

    <div v-if="filtered.length" class="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="d in filtered" :key="d.id" class="card row-hover overflow-hidden">
        <div class="relative h-36">
          <img v-if="d.imageUrl" :src="d.imageUrl" :alt="d.name" class="h-full w-full object-cover" />
          <div v-else class="flex h-full items-center justify-center bg-gradient-to-br from-brand-light to-[#dcebf9]">
            <Compass class="h-8 w-8 text-brand/60" />
          </div>
          <span class="absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-bold" :class="statusStyle(d)">
            {{ d.status === 'visited' ? '去过' : '想去' }}
          </span>
          <div class="absolute right-3 top-3 flex gap-1" @click.prevent>
            <button class="btn-icon !h-8 !w-8 bg-white/90" title="编辑" @click="openEdit(d)">
              <Pencil class="h-3.5 w-3.5" />
            </button>
            <button class="btn-icon-danger !h-8 !w-8 bg-white/90" title="删除" @click="remove(d)">
              <Trash2 class="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <div class="p-4">
          <div class="flex items-center justify-between gap-2">
            <b class="text-base">{{ d.name }}</b>
            <StarRating :model-value="d.rating" />
          </div>
          <div class="mt-1 flex items-center gap-1 text-xs text-muted">
            <MapPin class="h-3.5 w-3.5 shrink-0" />
            {{ [d.country, d.city !== d.name ? d.city : ''].filter(Boolean).join(' · ') || '未填写' }}
          </div>
          <div v-if="d.bestSeason" class="mt-1 flex items-center gap-1 text-xs text-muted">
            <Sun class="h-3.5 w-3.5 shrink-0" /> 最佳时间：{{ d.bestSeason }}
          </div>
          <p v-if="d.note" class="mt-2 line-clamp-2 text-xs leading-relaxed text-muted">{{ d.note }}</p>
        </div>
      </div>
    </div>

    <div v-else class="card">
      <EmptyState
        :icon="Compass"
        :title="keyword || filter !== 'all' ? '没有匹配的目的地' : '目的地库还是空的'"
        :desc="keyword || filter !== 'all' ? '换个条件试试' : '把去过和想去的地方都收藏进来'"
        action-text="新增目的地"
        @action="openCreate"
      />
    </div>

    <BaseDrawer
      :open="drawerOpen"
      :title="editingId ? '编辑目的地' : '新增目的地'"
      @close="drawerOpen = false"
    >
      <form v-if="drawerOpen" class="space-y-4" @submit.prevent="save">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="field-label">名称 *</label>
            <input v-model="form.name" class="input" placeholder="如：京都" />
            <p v-if="errors.name" class="field-error">{{ errors.name }}</p>
          </div>
          <div>
            <label class="field-label">国家</label>
            <input v-model="form.country" class="input" placeholder="如：日本" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="field-label">城市</label>
            <input v-model="form.city" class="input" placeholder="同名称可留空" />
          </div>
          <div>
            <label class="field-label">状态</label>
            <select v-model="form.status" class="input">
              <option v-for="s in DEST_STATUS" :key="s.value" :value="s.value">{{ s.label }}</option>
            </select>
          </div>
        </div>
        <div>
          <label class="field-label">最佳旅行时间</label>
          <input v-model="form.bestSeason" class="input" placeholder="如：3-5月 / 10-11月" />
        </div>
        <div>
          <label class="field-label">评分</label>
          <StarRating v-model="form.rating" editable />
        </div>
        <div>
          <label class="field-label">图片</label>
          <ImageUploader v-model="form.imageUrl" />
        </div>
        <div>
          <label class="field-label">笔记</label>
          <textarea v-model="form.note" rows="3" class="input resize-none" placeholder="想念的美食、没走完的路…"></textarea>
        </div>
        <div class="grid grid-cols-2 gap-3 pt-1">
          <button type="button" class="btn-ghost" @click="drawerOpen = false">取消</button>
          <button type="submit" class="btn-primary">{{ editingId ? '保存' : '添加' }}</button>
        </div>
      </form>
    </BaseDrawer>
  </div>
</template>
