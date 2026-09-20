<script setup>
// 仪表盘：统计卡 + 即将出发 + 足迹 + 预算环图 + 月度趋势 + 待办提醒
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  CalendarClock,
  CalendarDays,
  ChevronRight,
  ListChecks,
  Luggage,
  MapPin,
  MapPinned,
  Package,
  Plus,
  Sparkles,
  TriangleAlert,
  Wallet,
} from 'lucide-vue-next'
import PageHeader from '../components/ui/PageHeader.vue'
import StatCard from '../components/ui/StatCard.vue'
import TripDrawer from '../components/TripDrawer.vue'
import { useTripsStore, tripStatusLabel } from '../stores/trips'
import { useDestinationsStore } from '../stores/destinations'
import { useExpensesStore, CATEGORY_COLORS } from '../stores/expenses'
import { usePackingStore } from '../stores/packing'
import { useWishlistStore } from '../stores/wishlist'
import { daysUntil, lastMonthKeys, monthKey, monthLabel, fmtSlash, tripDays } from '../utils/date'
import { fmtMoney } from '../utils/format'
import { donutOption, lineOption, C } from '../utils/charts'

const router = useRouter()
const trips = useTripsStore()
const destinations = useDestinationsStore()
const expenses = useExpensesStore()
const packing = usePackingStore()
const wishlist = useWishlistStore()

const drawerOpen = ref(false)

// 统计口径
const cityCount = computed(() => {
  const set = new Set(trips.visitedCities)
  destinations.visited.forEach((d) => set.add(d.name))
  return set.size
})
const countryCount = computed(() => new Set(destinations.visited.map((d) => d.country)).size)

// 即将出发
const next = computed(() => trips.nextTrip)
const nextCountdown = computed(() => (next.value ? daysUntil(next.value.startDate) : null))

// 预算环图：即将出发行程的分项花费
const nextSpent = computed(() => (next.value ? expenses.totalFor(next.value.id) : 0))
const budgetDonut = computed(() => {
  const cats = next.value ? expenses.byCategory(next.value.id) : []
  return donutOption({
    data: cats.map((c) => ({ name: c.category, value: c.amount, color: CATEGORY_COLORS[c.category] || C.muted })),
    centerTitle: next.value ? '已花费 / 总预算' : '',
    centerValue: next.value ? fmtMoney(nextSpent.value) : '',
  })
})

// 月度趋势：近 12 个月花费折线
const trend = computed(() => {
  const keys = lastMonthKeys(12)
  const sums = Object.fromEntries(keys.map((k) => [k, 0]))
  expenses.expenses.forEach((e) => {
    const k = monthKey(e.date)
    if (k in sums) sums[k] += Number(e.amount) || 0
  })
  return lineOption({
    labels: keys.map((k) => monthLabel(k)),
    values: keys.map((k) => sums[k]),
  })
})

// 待办提醒
const reminders = computed(() => {
  const list = []
  if (next.value && nextCountdown.value >= 0 && nextCountdown.value <= 30) {
    list.push({
      icon: CalendarClock,
      tone: 'text-brand-dark bg-brand-light',
      text: `「${next.value.name}」还有 ${nextCountdown.value} 天出发`,
      to: `/trips/${next.value.id}`,
    })
    const prog = packing.tripProgress(next.value.id)
    if (prog.total > 0 && prog.done < prog.total) {
      list.push({
        icon: Luggage,
        tone: 'text-[#b06a35] bg-[#fdf0e3]',
        text: `行李清单还有 ${prog.total - prog.done} 项没备齐`,
        to: '/packing',
      })
    }
  }
  trips.trips.forEach((t) => {
    const spent = expenses.totalFor(t.id)
    if (t.budget > 0 && spent > t.budget) {
      list.push({
        icon: TriangleAlert,
        tone: 'text-danger bg-[#fdecec]',
        text: `「${t.name}」已超支 ${fmtMoney(spent - t.budget)}`,
        to: '/budget',
      })
    }
  })
  const wantCount = wishlist.wishlist.filter((w) => w.status === 'want').length
  if (wantCount > 0) {
    list.push({
      icon: Sparkles,
      tone: 'text-[#7a5ea6] bg-[#f0eaf8]',
      text: `愿望清单里还有 ${wantCount} 个想去的地方`,
      to: '/wishlist',
    })
  }
  return list
})
</script>

<template>
  <div>
    <PageHeader title="旅行规划与回忆工作台" sub="探索世界 · 规划行程 · 记录美好 · 珍藏回忆">
      <button class="btn-primary" @click="drawerOpen = true">
        <Plus class="h-4 w-4" /> 新建旅行计划
      </button>
    </PageHeader>

    <!-- 统计卡片：手机 2 列 / PC 4 列 -->
    <div class="grid grid-cols-2 gap-3 lg:grid-cols-4 md:gap-3.5">
      <StatCard :value="trips.planned.length" label="待出发行程" sub="即将开启新旅程" :icon="Luggage" tone="green" />
      <StatCard :value="trips.done.length" label="已完成旅行" sub="每一次都是回忆" :icon="Package" tone="blue" />
      <StatCard :value="cityCount" label="去过城市" sub="留下足迹的地方" :icon="MapPin" tone="orange" />
      <StatCard :value="trips.totalDays" label="旅行天数" sub="在路上的日子" :icon="CalendarDays" tone="purple" />
    </div>

    <!-- 第一行：即将出发 / 旅行足迹 / 本次预算 -->
    <div class="mt-3.5 grid grid-cols-1 gap-3.5 lg:grid-cols-3">
      <!-- 即将出发 -->
      <div class="card card-pad cursor-pointer transition-shadow hover:shadow-pop" @click="next && router.push(`/trips/${next.id}`)">
        <div class="mb-3 flex items-center justify-between">
          <h3 class="text-base font-bold">即将出发的行程</h3>
          <span class="flex cursor-pointer items-center text-xs text-muted" @click.stop="router.push('/trips')">
            查看全部 <ChevronRight class="h-3.5 w-3.5" />
          </span>
        </div>
        <template v-if="next">
          <div class="relative h-40 overflow-hidden rounded-xl md:h-[180px]">
            <img v-if="next.coverImage" :src="next.coverImage" :alt="next.name" class="h-full w-full object-cover" />
            <div v-else class="h-full w-full bg-gradient-to-br from-brand-light to-[#dcebf9]"></div>
            <span class="absolute right-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-xs text-white">
              {{ tripDays(next.startDate, next.endDate) }}天{{ tripDays(next.startDate, next.endDate) - 1 }}晚
            </span>
          </div>
          <div class="mt-3 text-lg font-black">{{ next.name }}</div>
          <div class="mt-1 text-[13px] text-muted">
            {{ fmtSlash(next.startDate) }} – {{ fmtSlash(next.endDate) }}
          </div>
          <div class="mt-0.5 text-[13px] text-muted">{{ (next.destinations || []).join(' · ') }}</div>
          <div class="mt-2.5 text-[13px] text-muted">
            还有 <b class="text-base text-brand">{{ Math.max(nextCountdown, 0) }}</b> 天出发 ·
            {{ tripStatusLabel(next.status) }}
          </div>
        </template>
        <div v-else class="flex h-52 flex-col items-center justify-center text-center">
          <Luggage class="h-8 w-8 text-brand" />
          <p class="mt-3 text-sm font-bold">还没有待出发的行程</p>
          <p class="mt-1 text-xs text-muted">点击右上角「新建旅行计划」开始规划</p>
        </div>
      </div>

      <!-- 旅行足迹 -->
      <div class="card card-pad">
        <div class="mb-3 flex items-center justify-between">
          <h3 class="text-base font-bold">旅行足迹</h3>
          <span class="flex cursor-pointer items-center text-xs text-muted" @click="router.push('/map')">
            足迹地图 <ChevronRight class="h-3.5 w-3.5" />
          </span>
        </div>
        <div class="relative flex h-32 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#eef4ee] to-[#dcebe0] md:h-[180px]">
          <div class="absolute inset-0 opacity-60" style="background-image: radial-gradient(#ffffff9c 1.4px, transparent 1.4px); background-size: 18px 18px"></div>
          <MapPinned class="h-10 w-10 text-brand/70" />
        </div>
        <div class="mt-3 flex gap-2.5">
          <div class="flex-1 rounded-xl bg-[#f4f8f5] p-2.5 text-center md:p-3">
            <b class="text-lg text-brand-dark md:text-xl">{{ cityCount }}</b>
            <span class="block text-xs text-muted">点亮城市</span>
          </div>
          <div class="flex-1 rounded-xl bg-[#f4f8f5] p-2.5 text-center md:p-3">
            <b class="text-lg text-brand-dark md:text-xl">{{ countryCount }}</b>
            <span class="block text-xs text-muted">点亮国家</span>
          </div>
        </div>
      </div>

      <!-- 本次行程预算 -->
      <div class="card card-pad">
        <div class="mb-3 flex items-center justify-between">
          <h3 class="text-base font-bold">本次行程预算</h3>
          <span class="flex cursor-pointer items-center text-xs text-muted" @click="router.push('/budget')">
            预算管理 <ChevronRight class="h-3.5 w-3.5" />
          </span>
        </div>
        <template v-if="next">
          <VChart :option="budgetDonut" autoresize class="h-40 md:h-[170px]" />
          <ul class="mt-2 space-y-1.5">
            <li
              v-for="c in expenses.byCategory(next.id)"
              :key="c.category"
              class="flex items-center justify-between text-xs"
            >
              <span class="flex items-center gap-1.5 text-[#4a5a52]">
                <span class="h-2.5 w-2.5 rounded-sm" :style="{ background: CATEGORY_COLORS[c.category] || C.muted }"></span>
                {{ c.category }}
              </span>
              <span class="text-muted">{{ fmtMoney(c.amount) }}</span>
            </li>
            <li v-if="!expenses.byCategory(next.id).length" class="py-3 text-center text-xs text-muted">
              还没有录入花费，点「预算管理」开始记账
            </li>
          </ul>
        </template>
        <div v-else class="flex h-52 flex-col items-center justify-center text-center">
          <Wallet class="h-8 w-8 text-brand" />
          <p class="mt-3 text-sm font-bold">暂无待出发行程</p>
        </div>
      </div>
    </div>

    <!-- 第二行：月度趋势 + 待办提醒 -->
    <div class="mt-3.5 grid grid-cols-1 gap-3.5 lg:grid-cols-3">
      <div class="card card-pad lg:col-span-2">
        <div class="mb-3 flex items-center justify-between">
          <h3 class="text-base font-bold">月度花费趋势</h3>
          <span class="flex cursor-pointer items-center text-xs text-muted" @click="router.push('/stats')">
            数据统计 <ChevronRight class="h-3.5 w-3.5" />
          </span>
        </div>
        <VChart :option="trend" autoresize class="h-48 md:h-[190px]" />
      </div>

      <div class="card card-pad">
        <div class="mb-3 flex items-center justify-between">
          <h3 class="text-base font-bold">待办提醒</h3>
          <span class="rounded-full bg-brand-light px-2 py-0.5 text-xs font-bold text-brand-dark">
            {{ reminders.length }}
          </span>
        </div>
        <div v-if="reminders.length" class="space-y-2">
          <button
            v-for="(r, i) in reminders"
            :key="i"
            class="flex w-full items-center gap-3 rounded-xl bg-[#f7faf8] p-3 text-left transition-colors hover:bg-brand-soft"
            @click="router.push(r.to)"
          >
            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" :class="r.tone">
              <component :is="r.icon" class="h-4 w-4" />
            </span>
            <span class="flex-1 text-[13px] leading-snug">{{ r.text }}</span>
            <ChevronRight class="h-4 w-4 shrink-0 text-muted" />
          </button>
        </div>
        <div v-else class="flex flex-col items-center py-8 text-center">
          <ListChecks class="h-7 w-7 text-brand" />
          <p class="mt-2 text-sm text-muted">一切就绪，安心享受旅行吧</p>
        </div>
      </div>
    </div>

    <TripDrawer :open="drawerOpen" @close="drawerOpen = false" />
  </div>
</template>
