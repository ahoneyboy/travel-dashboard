<script setup>
// 侧边栏：Pad（<1024px）收起为 64px 图标条，PC 固定 232px 全宽
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Heart, MapPin } from 'lucide-vue-next'
import { NAV_ITEMS, isNavActive } from '../../router/nav'
import { useSettingsStore } from '../../stores/settings'
import { useTripsStore } from '../../stores/trips'
import { useDestinationsStore } from '../../stores/destinations'

const route = useRoute()
const settings = useSettingsStore()
const trips = useTripsStore()
const destinations = useDestinationsStore()

const active = computed(() =>
  NAV_ITEMS.map((item) => isNavActive(route.path, item.path))
)

// 已探索国家 / 城市统计（侧栏小卡片）
const explored = computed(() => {
  const countries = new Set()
  destinations.destinations
    .filter((d) => d.status === 'visited')
    .forEach((d) => d.country && countries.add(d.country))
  return { countries: countries.size, cities: trips.visitedCities.length }
})
</script>

<template>
  <aside
    class="fixed inset-y-0 left-0 z-30 hidden w-rail flex-col border-r border-line bg-white md:flex lg:w-sidebar"
  >
    <!-- 个人资料 -->
    <div class="flex flex-col items-center gap-2 px-2 pt-5 lg:items-start lg:gap-2.5 lg:px-5">
      <img
        v-if="settings.settings.avatar"
        :src="settings.settings.avatar"
        alt="头像"
        class="h-10 w-10 rounded-full border-[3px] border-brand-light object-cover lg:h-14 lg:w-14"
      />
      <div
        v-else
        class="flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-brand-light bg-brand-light text-base font-black text-brand-dark lg:h-14 lg:w-14 lg:text-xl"
      >
        {{ (settings.settings.nickname || '旅')[0] }}
      </div>
      <div class="hidden text-center lg:block lg:text-left">
        <div class="text-lg font-black">{{ settings.settings.nickname }}</div>
        <div class="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-brand">
          <MapPin class="h-3.5 w-3.5" />
          {{ settings.settings.tag || '旅行探索者' }}
        </div>
        <p class="mt-1.5 text-xs leading-relaxed text-muted">{{ settings.settings.bio }}</p>
      </div>
    </div>

    <!-- 导航 -->
    <nav class="flex-1 space-y-0.5 overflow-y-auto py-3">
      <RouterLink
        v-for="(item, i) in NAV_ITEMS"
        :key="item.path"
        :to="item.path"
        :title="item.label"
        class="mx-2 flex min-h-11 items-center gap-3 rounded-xl px-0 lg:mx-3 lg:px-3 text-[13.5px] text-[#4a5a52] transition-colors hover:bg-brand-soft lg:justify-start"
        :class="active[i] ? 'justify-center bg-brand-light font-bold text-brand-dark lg:justify-start' : 'justify-center'"
      >
        <component :is="item.icon" class="h-5 w-5 shrink-0" />
        <span class="hidden lg:inline">{{ item.label }}</span>
      </RouterLink>
    </nav>

    <!-- 已探索统计 + 座右铭（仅 PC 全宽侧栏展示） -->
    <div class="hidden px-4 pb-5 lg:block">
      <div class="rounded-2xl bg-[#f7faf7] p-4">
        <h4 class="mb-2 text-xs font-medium text-muted">已探索国家/地区</h4>
        <div class="mb-2.5 flex gap-4">
          <div>
            <b class="text-xl font-black">{{ explored.countries }}</b>
            <span class="ml-1 text-[11px] text-muted">个国家</span>
          </div>
          <div>
            <b class="text-xl font-black">{{ explored.cities }}</b>
            <span class="ml-1 text-[11px] text-muted">个城市</span>
          </div>
        </div>
        <div class="h-[70px] rounded-lg bg-gradient-to-br from-[#eef4ee] to-[#e3ede5]"></div>
      </div>
      <div class="mt-3 px-1.5 text-[13px] italic leading-relaxed text-muted">
        “世界那么大，我想去看看。”
        <Heart class="ml-1 inline h-3.5 w-3.5 fill-rose text-rose" />
      </div>
    </div>
  </aside>
</template>
