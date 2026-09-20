<script setup>
// 行程详情：按天编排日程（时间线视图）、拖拽排序、行程项 CRUD、预算/清单/回忆速览
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  GripVertical,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  Wallet,
} from 'lucide-vue-next'
import EmptyState from '../components/ui/EmptyState.vue'
import BaseDrawer from '../components/ui/BaseDrawer.vue'
import ImageUploader from '../components/ui/ImageUploader.vue'
import { useTripsStore, TRIP_STATUS, tripStatusLabel } from '../stores/trips'
import { useItineraryStore, ITEM_TYPES, ITEM_TYPE_STYLE } from '../stores/itinerary'
import { useExpensesStore, CATEGORY_COLORS } from '../stores/expenses'
import { usePackingStore } from '../stores/packing'
import { useMemoriesStore } from '../stores/memories'
import { useUiStore } from '../stores/ui'
import { fmtSlash, tripDays, weekCN, fmtShort } from '../utils/date'
import { fmtMoney } from '../utils/format'

const route = useRoute()
const router = useRouter()
const trips = useTripsStore()
const itinerary = useItineraryStore()
const expenses = useExpensesStore()
const packing = usePackingStore()
const memories = useMemoriesStore()
const ui = useUiStore()

const trip = computed(() => trips.byId(route.params.id))
const totalDays = computed(() => (trip.value ? tripDays(trip.value.startDate, trip.value.endDate) : 0))
const spent = computed(() => (trip.value ? expenses.totalFor(trip.value.id) : 0))

// 进入页面时按行程日期补齐天列表
onMounted(() => {
  if (trip.value) itinerary.syncDayPlans(trip.value.id, trip.value.startDate, trip.value.endDate)
})

const days = computed(() => (trip.value ? itinerary.dayPlansFor(trip.value.id) : []))
const selectedDayId = ref('')
watch(
  days,
  (list) => {
    if (!list.find((d) => d.id === selectedDayId.value)) selectedDayId.value = list[0]?.id || ''
  },
  { immediate: true }
)
const dayItems = computed(() => (selectedDayId.value ? itinerary.itemsForDay(selectedDayId.value) : []))

// 行程项抽屉
const itemDrawer = ref(false)
const editingItem = ref(null)
const itemForm = ref(null)

function openAddItem() {
  editingItem.value = null
  itemForm.value = {
    dayPlanId: selectedDayId.value,
    time: '',
    title: '',
    location: '',
    type: '景点',
    note: '',
    imageUrl: '',
  }
  itemErrors.value = {}
  itemDrawer.value = true
}
function openEditItem(item) {
  editingItem.value = item
  itemForm.value = { ...item }
  itemErrors.value = {}
  itemDrawer.value = true
}
const itemErrors = ref({})

function saveItem() {
  const f = itemForm.value
  itemErrors.value.title = f.title.trim() ? '' : '请填写标题'
  itemErrors.value.dayPlanId = f.dayPlanId ? '' : '请选择日期'
  if (itemErrors.value.title || itemErrors.value.dayPlanId) return
  const payload = {
    time: f.time,
    title: f.title.trim(),
    location: f.location.trim(),
    type: f.type,
    note: f.note.trim(),
    imageUrl: f.imageUrl,
  }
  if (editingItem.value) {
    // 换天 = 移动到目标天末尾
    if (f.dayPlanId !== editingItem.value.dayPlanId) {
      itinerary.moveItemToDay(editingItem.value.id, f.dayPlanId)
    }
    itinerary.updateItem(editingItem.value.id, payload)
    ui.toast('行程项已更新')
  } else {
    itinerary.addItem({ ...payload, dayPlanId: f.dayPlanId })
    ui.toast('已添加行程项')
  }
  itemDrawer.value = false
}

async function removeItem(item) {
  const ok = await ui.confirm({ title: '删除行程项', message: `确定删除「${item.title}」吗？` })
  if (ok) {
    itinerary.removeItem(item.id)
    ui.toast('已删除')
  }
}

// ---- 拖拽排序（PC/Pad）+ 上下移按钮（手机）----
const draggingId = ref('')

function onDropRow(targetId) {
  if (!draggingId.value) return
  const ids = dayItems.value.map((i) => i.id)
  const from = ids.indexOf(draggingId.value)
  const to = ids.indexOf(targetId)
  if (from === -1 || to === -1) return
  ids.splice(from, 1)
  ids.splice(to, 0, draggingId.value)
  itinerary.reorderDay(selectedDayId.value, ids)
  draggingId.value = ''
}

function moveBy(index, dir) {
  const ids = dayItems.value.map((i) => i.id)
  const to = index + dir
  if (to < 0 || to >= ids.length) return
  ;[ids[index], ids[to]] = [ids[to], ids[index]]
  itinerary.reorderDay(selectedDayId.value, ids)
}

// 右栏速览
const packingProg = computed(() => (trip.value ? packing.tripProgress(trip.value.id) : { total: 0, done: 0, pct: 0 }))
const tripMemories = computed(() =>
  trip.value ? memories.sorted.filter((m) => m.tripId === trip.value.id) : []
)
const catBars = computed(() => {
  if (!trip.value) return []
  const cats = expenses.byCategory(trip.value.id)
  const max = Math.max(...cats.map((c) => c.amount), 1)
  return cats.map((c) => ({ ...c, pct: Math.round((c.amount / max) * 100) }))
})

async function removeTrip() {
  const ok = await ui.confirm({
    title: '删除旅行计划',
    message: `确定删除「${trip.value.name}」吗？\n该行程的日程、花费、清单和回忆都会一并删除。`,
  })
  if (ok) {
    trips.removeTrip(trip.value.id)
    ui.toast('行程已删除')
    router.push('/trips')
  }
}
</script>

<template>
  <div v-if="trip">
    <!-- 封面 Hero -->
    <div class="relative h-44 overflow-hidden rounded-card md:h-56">
      <img v-if="trip.coverImage" :src="trip.coverImage" :alt="trip.name" class="h-full w-full object-cover" />
      <div v-else class="h-full w-full bg-gradient-to-br from-brand-light to-[#dcebf9]"></div>
      <div class="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-black/20"></div>
      <button class="btn-icon absolute left-3 top-3 bg-white/90" title="返回" @click="router.push('/trips')">
        <ArrowLeft class="h-4 w-4" />
      </button>
      <div class="absolute inset-x-0 bottom-0 p-4 md:p-5">
        <div class="flex flex-wrap items-center gap-2">
          <h1 class="text-xl font-black text-white md:text-2xl">{{ trip.name }}</h1>
          <span class="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold text-white backdrop-blur">
            {{ tripStatusLabel(trip.status) }}
          </span>
        </div>
        <p class="mt-1 text-[13px] text-white/90">
          {{ fmtSlash(trip.startDate) }} – {{ fmtSlash(trip.endDate) }} · 共 {{ totalDays }} 天
          <template v-if="trip.destinations?.length"> · {{ trip.destinations.join(' · ') }}</template>
        </p>
      </div>
    </div>

    <!-- 概要条 -->
    <div class="card card-pad mt-3.5">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex flex-1 flex-wrap items-center gap-x-6 gap-y-2">
          <div class="min-w-36 flex-1">
            <div class="flex items-center justify-between text-xs text-muted">
              <span>已花费 {{ fmtMoney(spent) }} / 预算 {{ fmtMoney(trip.budget) }}</span>
              <span :class="spent > trip.budget ? 'text-danger font-bold' : ''">
                {{ trip.budget ? Math.round((spent / trip.budget) * 100) : 0 }}%
              </span>
            </div>
            <div class="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#eef2ee]">
              <div
                class="h-full rounded-full"
                :class="spent > trip.budget ? 'bg-danger' : 'bg-brand'"
                :style="{ width: `${Math.min(100, trip.budget ? (spent / trip.budget) * 100 : 0)}%` }"
              ></div>
            </div>
          </div>
          <label class="flex items-center gap-2 text-xs text-muted">
            状态
            <select
              class="input !w-auto !py-1.5 text-xs"
              :value="trip.status"
              @change="trips.updateTrip(trip.id, { status: $event.target.value })"
            >
              <option v-for="s in TRIP_STATUS" :key="s.value" :value="s.value">{{ s.label }}</option>
            </select>
          </label>
        </div>
        <div class="flex gap-2">
          <button class="btn-ghost !px-4" @click="router.push('/trips')">
            <Pencil class="h-4 w-4" /> 到列表中编辑
          </button>
          <button class="btn-ghost !px-4 !text-danger hover:!bg-[#fdecec]" @click="removeTrip">
            <Trash2 class="h-4 w-4" /> 删除
          </button>
        </div>
      </div>
      <p v-if="trip.notes" class="mt-3 rounded-xl bg-brand-soft p-3 text-[13px] leading-relaxed text-[#4a5a52]">
        {{ trip.notes }}
      </p>
    </div>

    <div class="mt-3.5 grid grid-cols-1 gap-3.5 lg:grid-cols-3">
      <!-- 行程安排（时间线） -->
      <div class="card card-pad lg:col-span-2">
        <div class="mb-3 flex items-center justify-between">
          <h3 class="text-base font-bold">行程安排</h3>
          <button class="btn-primary !min-h-9 md:!min-h-9 !px-4 text-xs" @click="openAddItem">
            <Plus class="h-4 w-4" /> 添加行程项
          </button>
        </div>

        <!-- 天标签：横向滚动 -->
        <div class="scroll-x -mx-1 mb-4 flex gap-1.5 px-1 pb-1">
          <button
            v-for="(d, i) in days"
            :key="d.id"
            class="flex min-h-11 min-w-[68px] shrink-0 flex-col items-center justify-center rounded-xl px-3 py-1.5 text-center transition-colors"
            :class="selectedDayId === d.id ? 'bg-brand text-white' : 'bg-[#f4f8f5] text-muted hover:bg-brand-soft'"
            @click="selectedDayId = d.id"
          >
            <span class="text-[13px] font-bold">D{{ i + 1 }} · {{ fmtShort(d.date) }}</span>
            <span class="text-[11px]">{{ weekCN(d.date) }}</span>
          </button>
        </div>

        <!-- 当天行程项 -->
        <div v-if="dayItems.length" class="space-y-2">
          <div
            v-for="(item, i) in dayItems"
            :key="item.id"
            class="flex items-center gap-3 rounded-xl bg-[#f7faf8] p-3 transition-all"
            :class="draggingId === item.id ? 'opacity-40' : ''"
            draggable="true"
            @dragstart="draggingId = item.id"
            @dragend="draggingId = ''"
            @dragover.prevent
            @drop.prevent="onDropRow(item.id)"
          >
            <GripVertical class="hidden h-4 w-4 shrink-0 cursor-grab text-line md:block" />
            <img
              v-if="item.imageUrl"
              :src="item.imageUrl"
              :alt="item.title"
              class="h-12 w-16 shrink-0 rounded-lg object-cover"
            />
            <div
              v-else
              class="flex h-12 w-16 shrink-0 items-center justify-center rounded-lg bg-brand-light text-[11px] font-bold text-brand-dark"
            >
              {{ item.type }}
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <b class="text-sm">{{ item.title }}</b>
                <span
                  v-if="item.time"
                  class="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-muted"
                >
                  {{ item.time }}
                </span>
                <span class="rounded-full px-2 py-0.5 text-[11px] font-bold" :class="ITEM_TYPE_STYLE[item.type] || ITEM_TYPE_STYLE['其他']">
                  {{ item.type }}
                </span>
              </div>
              <span v-if="item.location" class="mt-0.5 flex items-center gap-1 text-xs text-muted">
                <MapPin class="h-3 w-3" /> {{ item.location }}
              </span>
              <p v-if="item.note" class="mt-0.5 truncate text-xs text-muted">{{ item.note }}</p>
            </div>
            <div class="flex shrink-0 items-center">
              <button class="btn-icon !h-9 !w-9" title="上移" :disabled="i === 0" @click="moveBy(i, -1)">
                <ChevronUp class="h-4 w-4" :class="i === 0 && 'opacity-30'" />
              </button>
              <button class="btn-icon !h-9 !w-9" title="下移" :disabled="i === dayItems.length - 1" @click="moveBy(i, 1)">
                <ChevronDown class="h-4 w-4" :class="i === dayItems.length - 1 && 'opacity-30'" />
              </button>
              <button class="btn-icon !h-9 !w-9" title="编辑" @click="openEditItem(item)">
                <Pencil class="h-4 w-4" />
              </button>
              <button class="btn-icon-danger !h-9 !w-9" title="删除" @click="removeItem(item)">
                <Trash2 class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        <div v-else class="rounded-xl border border-dashed border-line py-10 text-center">
          <p class="text-sm text-muted">这一天还没有安排</p>
          <button class="mt-2 text-sm font-bold text-brand hover:underline" @click="openAddItem">+ 添加行程项</button>
        </div>
      </div>

      <!-- 右栏速览 -->
      <div class="space-y-3.5">
        <div class="card card-pad">
          <div class="mb-2.5 flex items-center justify-between">
            <h3 class="text-sm font-bold">本程预算</h3>
            <button class="text-xs text-muted hover:text-brand-dark" @click="router.push('/budget?trip=' + trip.id)">
              去记账 →
            </button>
          </div>
          <div class="flex items-baseline gap-1.5">
            <b class="text-xl font-black" :class="spent > trip.budget ? 'text-danger' : ''">{{ fmtMoney(spent) }}</b>
            <span class="text-xs text-muted">/ 预算 {{ fmtMoney(trip.budget) }}</span>
          </div>
          <div class="mt-2.5 space-y-2">
            <div v-for="c in catBars" :key="c.category" class="flex items-center gap-2 text-xs">
              <span class="w-8 shrink-0 text-muted">{{ c.category }}</span>
              <div class="h-1.5 flex-1 overflow-hidden rounded-full bg-[#eef2ee]">
                <div class="h-full rounded-full" :style="{ width: c.pct + '%', background: CATEGORY_COLORS[c.category] }"></div>
              </div>
              <span class="w-16 shrink-0 text-right text-muted">{{ fmtMoney(c.amount) }}</span>
            </div>
            <p v-if="!catBars.length" class="py-2 text-center text-xs text-muted">还没有花费记录</p>
          </div>
        </div>

        <div class="card card-pad">
          <div class="mb-2.5 flex items-center justify-between">
            <h3 class="text-sm font-bold">行李清单</h3>
            <button class="text-xs text-muted hover:text-brand-dark" @click="router.push('/packing?trip=' + trip.id)">
              去准备 →
            </button>
          </div>
          <template v-if="packingProg.total">
            <div class="flex items-center justify-between text-xs text-muted">
              <span>已备齐 {{ packingProg.done }} / {{ packingProg.total }}</span>
              <b class="text-brand">{{ packingProg.pct }}%</b>
            </div>
            <div class="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#eef2ee]">
              <div class="h-full rounded-full bg-brand transition-all" :style="{ width: packingProg.pct + '%' }"></div>
            </div>
          </template>
          <p v-else class="py-2 text-center text-xs text-muted">还没有清单，去挑个模板吧</p>
        </div>

        <div class="card card-pad">
          <div class="mb-2.5 flex items-center justify-between">
            <h3 class="text-sm font-bold">旅行回忆</h3>
            <button class="text-xs text-muted hover:text-brand-dark" @click="router.push('/memories?trip=' + trip.id)">
              去上传 →
            </button>
          </div>
          <div v-if="tripMemories.length" class="grid grid-cols-3 gap-1.5">
            <img
              v-for="m in tripMemories.slice(0, 6)"
              :key="m.id"
              :src="m.imageUrl"
              :alt="m.caption"
              class="aspect-square w-full rounded-lg object-cover"
            />
          </div>
          <p v-else class="py-2 text-center text-xs text-muted">旅途中的照片，回来上传到这里</p>
        </div>
      </div>
    </div>

    <!-- 行程项抽屉 -->
    <BaseDrawer
      :open="itemDrawer"
      :title="editingItem ? '编辑行程项' : '添加行程项'"
      @close="itemDrawer = false"
    >
      <form v-if="itemForm" class="space-y-4" @submit.prevent="saveItem">
        <div>
          <label class="field-label">所属日期 *</label>
          <select v-model="itemForm.dayPlanId" class="input">
            <option v-for="(d, i) in days" :key="d.id" :value="d.id">D{{ i + 1 }} · {{ d.date }}（{{ weekCN(d.date) }}）</option>
          </select>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="field-label">时间</label>
            <input v-model="itemForm.time" type="time" class="input" />
          </div>
          <div>
            <label class="field-label">类型</label>
            <select v-model="itemForm.type" class="input">
              <option v-for="t in ITEM_TYPES" :key="t" :value="t">{{ t }}</option>
            </select>
          </div>
        </div>
        <div>
          <label class="field-label">标题 *</label>
          <input v-model="itemForm.title" class="input" placeholder="如：清水寺" />
          <p v-if="itemErrors.title" class="field-error">{{ itemErrors.title }}</p>
        </div>
        <div>
          <label class="field-label">地点</label>
          <input v-model="itemForm.location" class="input" placeholder="如：京都 · 东山区" />
        </div>
        <div>
          <label class="field-label">图片</label>
          <ImageUploader v-model="itemForm.imageUrl" />
        </div>
        <div>
          <label class="field-label">备注</label>
          <textarea v-model="itemForm.note" rows="2" class="input resize-none" placeholder="预约信息、注意事项…"></textarea>
        </div>
        <div class="grid grid-cols-2 gap-3 pt-1">
          <button type="button" class="btn-ghost" @click="itemDrawer = false">取消</button>
          <button type="submit" class="btn-primary">{{ editingItem ? '保存' : '添加' }}</button>
        </div>
      </form>
    </BaseDrawer>
  </div>

  <div v-else class="card">
    <EmptyState
      :icon="Wallet"
      title="找不到这个行程"
      desc="它可能已被删除"
      action-text="返回行程列表"
      @action="router.push('/trips')"
    />
  </div>
</template>
