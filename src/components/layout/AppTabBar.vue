<script setup>
// 手机端底部 TabBar（<768px 显示），4 个高频入口 + 「更多」
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Ellipsis } from 'lucide-vue-next'
import { TAB_ITEMS, isNavActive } from '../../router/nav'
import { useUiStore } from '../../stores/ui'

const route = useRoute()
const ui = useUiStore()

const active = computed(() => TAB_ITEMS.map((item) => isNavActive(route.path, item.path)))
</script>

<template>
  <nav
    class="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 backdrop-blur md:hidden"
    style="padding-bottom: env(safe-area-inset-bottom)"
  >
    <div class="grid h-tabbar grid-cols-5">
      <template v-for="(item, i) in TAB_ITEMS" :key="item.path">
        <RouterLink
          :to="item.path"
          class="flex flex-col items-center justify-center gap-0.5 text-[11px]"
          :class="active[i] ? 'font-bold text-brand-dark' : 'text-muted'"
        >
          <component :is="item.icon" class="h-5 w-5" />
          <span>{{ item.label }}</span>
        </RouterLink>
      </template>
      <button
        class="flex flex-col items-center justify-center gap-0.5 text-[11px] text-muted"
        @click="ui.moreOpen = true"
      >
        <Ellipsis class="h-5 w-5" />
        <span>更多</span>
      </button>
    </div>
  </nav>
</template>
