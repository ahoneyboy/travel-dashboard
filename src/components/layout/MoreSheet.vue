<script setup>
// 手机端「更多」面板：TabBar 放不下的其余入口
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import { NAV_ITEMS } from '../../router/nav'
import { useUiStore } from '../../stores/ui'

const route = useRoute()
const ui = useUiStore()

// 跳转后自动收起
watch(
  () => route.fullPath,
  () => (ui.moreOpen = false)
)
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-40 md:hidden" :class="ui.moreOpen ? '' : 'pointer-events-none'">
      <div
        class="absolute inset-0 bg-ink/45 transition-opacity duration-300"
        :class="ui.moreOpen ? 'opacity-100' : 'opacity-0'"
        @click="ui.moreOpen = false"
      />
      <div
        class="absolute inset-x-0 bottom-0 rounded-t-2xl bg-white p-5 pb-8 shadow-pop transition-transform duration-300"
        :class="ui.moreOpen ? 'translate-y-0' : 'translate-y-full'"
        style="padding-bottom: calc(24px + env(safe-area-inset-bottom))"
      >
        <div class="mx-auto mb-4 h-1 w-10 rounded-full bg-line"></div>
        <div class="grid grid-cols-4 gap-3">
          <RouterLink
            v-for="item in NAV_ITEMS"
            :key="item.path"
            :to="item.path"
            class="flex min-h-20 flex-col items-center justify-center gap-2 rounded-2xl bg-brand-soft text-xs text-[#4a5a52] transition-colors active:bg-brand-light"
          >
            <component :is="item.icon" class="h-5 w-5 text-brand-dark" />
            <span>{{ item.label }}</span>
          </RouterLink>
        </div>
      </div>
    </div>
  </Teleport>
</template>
