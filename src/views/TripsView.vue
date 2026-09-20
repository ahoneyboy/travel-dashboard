<script setup>
// 行程计划列表：状态筛选 + 搜索 + 新建/编辑/删除
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { CalendarDays, MapPin, Pencil, Plus, Search, Trash2, Wallet } from 'lucide-vue-next'
import PageHeader from '../components/ui/PageHeader.vue'
import EmptyState from '../components/ui/EmptyState.vue'
import TripDrawer from '../components/TripDrawer.vue'
import { useTripsStore, TRIP_STATUS, TRIP_STATUS_STYLE, tripStatusLabel } from '../stores/trips'
import { useExpensesStore } from '../stores/expenses'
import { useUiStore } from '../stores/ui'
import { daysUntil, fmtSlash, tripDays } from '../utils/date'
import { fmtMoney } from '../utils/format'
import { Luggage } from 'lucide-vue-next'

const router = useRouter()
const trips = useTripsStore()
const expenses = useExpensesStore()
const ui = useUiStore()

const filter = ref('all')
const keyword = ref('')
const drawerOpen = ref(false)
const editingTrip = ref(null)

const filtered = computed(() => {
  let list = trips.sorted
  if (filter.value !== 'all') list = list.filter((t) => t.status === filter.value)
  const kw = keyword.value.trim()
  if (kw) {
    list = list.filter(
      (t) =>
        t.name.includes(kw) ||
        (t.destinations || []).some((d) => d.includes(kw))
    )
  }
  return list
})

function spent(id) {
  return expenses.totalFor(id)
}

function openCreate() {
  editingTrip.value = null
  drawerOpen.value = true
}
function openEdit(trip) {
  editingTrip.value = trip
  drawerOpen.value = true
}

async function removeTrip(trip) {
  const ok = await ui.confirm({
    title: '删除旅行计划',
    message: `确定删除「${trip.name}」吗？\n该行程的日程、花费、清单和回忆都会一并删除。`,
  })
  if (ok) {
    trips.removeTrip(trip.id)
    ui.toast('行程已删除')
  }
}

function goDetail(trip) {
  router.push(`/trips/${trip.id}`)
}
</script>

<template>
  <div>
    <PageHeader title="行程计划" sub="每一次出发，都值得认真规划">
      <button class="btn-primary" @click="openCreate"><Plus class="h-4 w-4" /> 新建旅行计划</button>
    </PageHeader>

    <!-- 筛选 + 搜索 -->
    <div class="mb-4 flex flex-wrap items-center gap-2.5">
      <div class="scroll-x flex gap-2">
        <button class="chip" :class="filter === 'all' && 'chip-active'" @click="filter = 'all'">全部</button>
        <button
          v-for="s in TRIP_STATUS"
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
        <input v-model="keyword" class="input !pl-9" placeholder="搜索行程 / 目的地" />
      </div>
    </div>

    <!-- 列表：手机 1 列 / Pad 2 列 / PC 3 列 -->
    <div v-if="filtered.length" class="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="trip in filtered"
        :key="trip.id"
        class="card row-hover cursor-pointer overflow-hidden"
        @click="goDetail(trip)"
      >
        <div class="relative h-36">
          <img v-if="trip.coverImage" :src="trip.coverImage" :alt="trip.name" class="h-full w-full object-cover" />
          <div v-else class="h-full w-full bg-gradient-to-br from-brand-light to-[#dcebf9]"></div>
          <span
            class="absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-bold"
            :class="TRIP_STATUS_STYLE[trip.status]"
          >
            {{ tripStatusLabel(trip.status) }}
          </span>
          <div class="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/60 to-transparent px-3 pb-2.5 pt-8">
            <span class="text-sm font-bold text-white">{{ trip.name }}</span>
            <span class="text-xs text-white/90">{{ tripDays(trip.startDate, trip.endDate) }} 天</span>
          </div>
        </div>
        <div class="p-4">
          <div class="flex items-center gap-1.5 text-xs text-muted">
            <CalendarDays class="h-3.5 w-3.5 shrink-0" />
            {{ fmtSlash(trip.startDate) }} – {{ fmtSlash(trip.endDate) }}
            <template v-if="trip.status === 'planned' && daysUntil(trip.startDate) >= 0">
              · 还有 {{ daysUntil(trip.startDate) }} 天
            </template>
          </div>
          <div class="mt-1.5 flex items-center gap-1.5 text-xs text-muted">
            <MapPin class="h-3.5 w-3.5 shrink-0" />
            <span class="truncate">{{ (trip.destinations || []).join(' · ') || '未设置目的地' }}</span>
          </div>
          <div class="mt-1.5 flex items-center gap-1.5 text-xs text-muted">
            <Wallet class="h-3.5 w-3.5 shrink-0" />
            已花 {{ fmtMoney(spent(trip.id)) }} / 预算 {{ fmtMoney(trip.budget) }}
          </div>
          <!-- 预算进度 -->
          <div class="mt-2.5 h-1.5 overflow-hidden rounded-full bg-[#eef2ee]">
            <div
              class="h-full rounded-full transition-all"
              :class="spent(trip.id) > trip.budget ? 'bg-danger' : 'bg-brand'"
              :style="{ width: `${Math.min(100, trip.budget ? (spent(trip.id) / trip.budget) * 100 : 0)}%` }"
            ></div>
          </div>
          <div class="mt-3 flex items-center justify-end gap-1" @click.stop>
            <button class="btn-icon" title="编辑" @click="openEdit(trip)"><Pencil class="h-4 w-4" /></button>
            <button class="btn-icon-danger" title="删除" @click="removeTrip(trip)"><Trash2 class="h-4 w-4" /></button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="card">
      <EmptyState
        :icon="Luggage"
        :title="keyword || filter !== 'all' ? '没有符合条件的行程' : '还没有旅行计划'"
        :desc="keyword || filter !== 'all' ? '换个关键词或筛选条件试试' : '从周末短途开始，记录你的第一段旅程吧'"
        action-text="新建旅行计划"
        @action="openCreate"
      />
    </div>

    <TripDrawer
      :open="drawerOpen"
      :trip="editingTrip"
      :title="editingTrip ? '编辑行程' : '新建旅行计划'"
      @close="drawerOpen = false"
    />
  </div>
</template>
