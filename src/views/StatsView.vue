<script setup>
// 数据统计：时间范围切换（今年 / 近三年 / 全部）+ KPI + 组合图 + 分类占比
import { computed, ref } from 'vue'
import { CalendarDays, ChartPie, Coins, Route } from 'lucide-vue-next'
import PageHeader from '../components/ui/PageHeader.vue'
import ChartCard from '../components/ui/ChartCard.vue'
import StatCard from '../components/ui/StatCard.vue'
import { useTripsStore } from '../stores/trips'
import { useExpensesStore, CATEGORY_COLORS } from '../stores/expenses'
import { monthLabel, tripDays, yearOf, today } from '../utils/date'
import { fmtMoney } from '../utils/format'
import { comboOption, donutOption, C } from '../utils/charts'

const trips = useTripsStore()
const expenses = useExpensesStore()

const RANGES = [
  { value: 'year', label: '今年' },
  { value: 'three', label: '近三年' },
  { value: 'all', label: '全部' },
]
const range = ref('year')

// 时间分桶：今年按月、近三年按季度、全部按年 → [{ key, label }]
const year = today().slice(0, 4)

const buckets = computed(() => {
  if (range.value === 'year') {
    const out = []
    for (let m = 1; m <= 12; m++) {
      const key = `${year}-${String(m).padStart(2, '0')}`
      out.push({ key, label: monthLabel(key) })
    }
    return out
  }
  if (range.value === 'three') {
    const ys = [Number(year) - 2, Number(year) - 1, Number(year)]
    return ys.flatMap((y) =>
      [1, 2, 3, 4].map((q) => ({ key: `${y}-Q${q}`, label: `${String(y).slice(2)} Q${q}` }))
    )
  }
  const doneYears = trips.trips
    .filter((t) => t.status !== 'planned')
    .map((t) => yearOf(t.startDate))
    .filter(Boolean)
  const min = Math.min(...doneYears, Number(year))
  const max = Math.max(...doneYears, Number(year))
  return Array.from({ length: max - min + 1 }, (_, i) => ({ key: `${min + i}`, label: `${min + i}` }))
})

/** 日期 → 桶 key */
function bucketOf(dateStr) {
  if (!dateStr) return null
  if (range.value === 'year') return dateStr.slice(0, 7)
  if (range.value === 'three') {
    const q = Math.ceil(Number(dateStr.slice(5, 7)) / 3)
    return `${dateStr.slice(0, 4)}-Q${q}`
  }
  return dateStr.slice(0, 4)
}

const labels = computed(() => buckets.value.map((b) => b.label))

// 统计范围内、已走过的行程
const rangeTrips = computed(() => {
  const keys = new Set(buckets.value.map((b) => b.key))
  return trips.trips.filter((t) => t.status !== 'planned' && keys.has(bucketOf(t.startDate)))
})

const kpi = computed(() => {
  const list = rangeTrips.value
  const tripIds = new Set(list.map((t) => t.id))
  const spend = expenses.expenses
    .filter((e) => tripIds.has(e.tripId))
    .reduce((s, e) => s + (Number(e.amount) || 0), 0)
  const days = list.reduce((s, t) => s + tripDays(t.startDate, t.endDate), 0)
  return {
    count: list.length,
    days,
    spend,
    avg: list.length ? Math.round(spend / list.length) : 0,
  }
})

// 组合图：每月/季/年 花费（柱）+ 次数（线）
const combo = computed(() => {
  const barValues = []
  const lineValues = []
  buckets.value.forEach(({ key }) => {
    const tIds = new Set(
      trips.trips.filter((t) => t.status !== 'planned' && bucketOf(t.startDate) === key).map((t) => t.id)
    )
    lineValues.push(tIds.size)
    barValues.push(
      expenses.expenses.filter((e) => tIds.has(e.tripId)).reduce((s, e) => s + (Number(e.amount) || 0), 0)
    )
  })
  return comboOption({ labels: labels.value, bars: barValues, line: lineValues })
})

// 分类占比
const donut = computed(() => {
  const tIds = new Set(rangeTrips.value.map((t) => t.id))
  const map = {}
  expenses.expenses
    .filter((e) => tIds.has(e.tripId))
    .forEach((e) => {
      map[e.category] = (map[e.category] || 0) + (Number(e.amount) || 0)
    })
  const data = Object.entries(map)
    .map(([category, amount]) => ({ name: category, value: amount, color: CATEGORY_COLORS[category] || C.muted }))
    .sort((a, b) => b.value - a.value)
  return donutOption({ data, centerTitle: '分类花费', centerValue: fmtMoney(kpi.value.spend) })
})
</script>

<template>
  <div>
    <PageHeader title="数据统计" sub="用数字回顾走过的每一步">
      <div class="flex gap-2">
        <button
          v-for="r in RANGES"
          :key="r.value"
          class="chip"
          :class="range === r.value && 'chip-active'"
          @click="range = r.value"
        >
          {{ r.label }}
        </button>
      </div>
    </PageHeader>

    <!-- KPI -->
    <div class="grid grid-cols-2 gap-3 lg:grid-cols-4 md:gap-3.5">
      <StatCard :value="kpi.count + ' 次'" label="旅行次数" :icon="Route" tone="green" />
      <StatCard :value="kpi.days + ' 天'" label="旅行天数" :icon="CalendarDays" tone="blue" />
      <StatCard :value="fmtMoney(kpi.spend)" label="花费总额" :icon="Coins" tone="orange" />
      <StatCard :value="fmtMoney(kpi.avg)" label="人均花费" sub="每次旅行平均" :icon="Coins" tone="purple" />
    </div>

    <div class="mt-3.5 grid grid-cols-1 gap-3.5 lg:grid-cols-2">
      <ChartCard title="花费与次数趋势" :class="{ 'lg:col-span-2': range === 'all' }">
        <VChart :option="combo" autoresize class="h-56 md:h-64" />
      </ChartCard>
      <ChartCard title="分类花费占比">
        <VChart :option="donut" autoresize class="h-56 md:h-64" />
      </ChartCard>
      <div class="card card-pad">
        <div class="mb-3 flex items-center gap-2">
          <ChartPie class="h-4 w-4 text-brand" />
          <h3 class="text-base font-bold">分类明细</h3>
        </div>
        <ul class="space-y-2.5">
          <li v-for="c in donut.series[0].data" :key="c.name" class="flex items-center justify-between text-sm">
            <span class="flex items-center gap-2 text-[#4a5a52]">
              <span class="h-2.5 w-2.5 rounded-sm" :style="{ background: CATEGORY_COLORS[c.name] || C.muted }"></span>
              {{ c.name }}
            </span>
            <span class="text-muted">
              {{ fmtMoney(c.value) }} ·
              {{ kpi.spend ? Math.round((c.value / kpi.spend) * 100) : 0 }}%
            </span>
          </li>
          <li v-if="!donut.series[0].data.length" class="py-3 text-center text-xs text-muted">
            当前范围还没有花费记录
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
