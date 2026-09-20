<script setup>
// 足迹地图：中国地图打点 + 点亮城市/国家统计 + 点击查看详情
import { computed, ref } from 'vue'
import * as echarts from 'echarts/core'
import { Globe, MapPin, MapPinned, Star } from 'lucide-vue-next'
import PageHeader from '../components/ui/PageHeader.vue'
import ChartCard from '../components/ui/ChartCard.vue'
import chinaGeo from '../assets/china.json'
import { useTripsStore } from '../stores/trips'
import { useDestinationsStore } from '../stores/destinations'
import { findCityCoord } from '../utils/geo'
import { geoScatterOption } from '../utils/charts'
import { fmtSlash } from '../utils/date'

// 注册中国地图（简化省级 GeoJSON）
echarts.registerMap('china', chinaGeo)

const trips = useTripsStore()
const destinations = useDestinationsStore()

const selectedCity = ref('')

// 已走过的行程目的地 → 按城市聚合到访次数（可定位的）
const cityStats = computed(() => {
  const map = new Map()
  trips.trips
    .filter((t) => t.status !== 'planned')
    .forEach((t) =>
      (t.destinations || []).forEach((name) => {
        const coord = findCityCoord(name)
        if (!coord) return
        const prev = map.get(name)
        map.set(name, { name, coord, count: (prev?.count || 0) + 1, trips: [...(prev?.trips || []), t] })
      })
    )
  // 目的地库中标记「去过」但未出现在行程里的城市
  destinations.visited.forEach((d) => {
    if (!map.has(d.name)) {
      const coord = findCityCoord(d.name)
      if (coord) map.set(d.name, { name: d.name, coord, count: 1, trips: [] })
    }
  })
  return [...map.values()].sort((a, b) => b.count - a.count)
})

// 无法定位的地点（海外城市等）
const unlocated = computed(() => {
  const set = new Set()
  trips.trips
    .filter((t) => t.status !== 'planned')
    .forEach((t) => (t.destinations || []).forEach((n) => !findCityCoord(n) && set.add(n)))
  destinations.visited.forEach((d) => !findCityCoord(d.name) && set.add(d.name))
  return [...set]
})

// 点亮统计：国内城市 + 全部到访国家
const countrySet = computed(() => new Set(destinations.visited.map((d) => d.country).filter(Boolean)))
const cityCount = computed(() => cityStats.value.length)

const chartOption = computed(() =>
  geoScatterOption({
    points: cityStats.value.map((c) => ({ name: c.name, coord: c.coord, count: c.count })),
  })
)

function onChartClick(params) {
  if (params.componentType === 'series') selectedCity.value = params.name
}

// 选中城市详情
const selected = computed(() => cityStats.value.find((c) => c.name === selectedCity.value) || null)
const selectedDest = computed(() => destinations.destinations.find((d) => d.name === selectedCity.value) || null)
</script>

<template>
  <div>
    <PageHeader title="足迹地图" sub="把去过的城市一颗颗点亮">
    </PageHeader>

    <div class="grid grid-cols-1 gap-3.5 lg:grid-cols-3">
      <!-- 地图 -->
      <ChartCard title="到访足迹" class="lg:col-span-2">
        <VChart :option="chartOption" autoresize class="h-[340px] md:h-[440px]" @click="onChartClick" />
        <!-- 点亮统计 -->
        <div class="mt-3 grid grid-cols-2 gap-2.5">
          <div class="rounded-xl bg-[#f4f8f5] p-3 text-center">
            <b class="text-xl text-brand-dark md:text-2xl">{{ cityCount }}</b>
            <span class="mt-0.5 block text-xs text-muted">点亮城市（国内）</span>
          </div>
          <div class="rounded-xl bg-[#f4f8f5] p-3 text-center">
            <b class="text-xl text-brand-dark md:text-2xl">{{ countrySet.size }}</b>
            <span class="mt-0.5 block text-xs text-muted">点亮国家/地区</span>
          </div>
        </div>
      </ChartCard>

      <!-- 详情与列表 -->
      <div class="space-y-3.5">
        <!-- 选中城市详情 -->
        <div class="card card-pad">
          <h3 class="mb-2.5 text-sm font-bold">城市详情</h3>
          <template v-if="selected">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <MapPin class="h-4 w-4 text-brand" />
                <b class="text-base">{{ selected.name }}</b>
              </div>
              <span class="rounded-full bg-brand-light px-2.5 py-1 text-xs font-bold text-brand-dark">
                到访 {{ selected.count }} 次
              </span>
            </div>
            <div v-if="selectedDest" class="mt-2 flex items-center gap-1.5 text-xs text-muted">
              <Star class="h-3.5 w-3.5 text-gold" :fill="'currentColor'" />
              {{ selectedDest.rating ? selectedDest.rating + ' 分' : '未评分' }}
              <template v-if="selectedDest.bestSeason"> · 最佳 {{ selectedDest.bestSeason }}</template>
            </div>
            <p v-if="selectedDest?.note" class="mt-1.5 text-xs leading-relaxed text-muted">{{ selectedDest.note }}</p>
            <div v-if="selected.trips.length" class="mt-3 space-y-1.5">
              <p class="text-xs font-bold text-muted">相关行程</p>
              <div
                v-for="t in selected.trips"
                :key="t.id"
                class="flex items-center justify-between rounded-lg bg-[#f7faf8] px-3 py-2 text-xs"
              >
                <span>{{ t.name }}</span>
                <span class="text-muted">{{ fmtSlash(t.startDate) }}</span>
              </div>
            </div>
          </template>
          <p v-else class="py-4 text-center text-xs text-muted">点击地图上的光点查看城市详情</p>
        </div>

        <!-- 已点亮城市 -->
        <div class="card card-pad">
          <h3 class="mb-2.5 flex items-center gap-1.5 text-sm font-bold">
            <MapPinned class="h-4 w-4 text-brand" /> 已点亮城市
          </h3>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="c in cityStats"
              :key="c.name"
              class="rounded-full px-3 py-1.5 text-xs font-bold transition-colors"
              :class="selectedCity === c.name ? 'bg-brand text-white' : 'bg-brand-light text-brand-dark hover:bg-brand/20'"
              @click="selectedCity = c.name"
            >
              {{ c.name }} · {{ c.count }}
            </button>
            <p v-if="!cityStats.length" class="py-2 text-xs text-muted">还没有可定位的到访城市</p>
          </div>
          <template v-if="unlocated.length">
            <p class="mb-2 mt-4 flex items-center gap-1.5 text-xs font-bold text-muted">
              <Globe class="h-3.5 w-3.5" /> 海外足迹
            </p>
            <div class="flex flex-wrap gap-1.5">
              <span v-for="n in unlocated" :key="n" class="rounded-full bg-[#f0f2f0] px-3 py-1.5 text-xs text-muted">
                {{ n }}
              </span>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
