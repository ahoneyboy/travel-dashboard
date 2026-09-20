<script setup>
// 全局 Toast：成功 / 失败 / 提示
import { CircleCheckBig, Info, TriangleAlert } from 'lucide-vue-next'
import { useUiStore } from '../../stores/ui'

const ui = useUiStore()

const ICONS = {
  success: { icon: CircleCheckBig, cls: 'text-brand' },
  error: { icon: TriangleAlert, cls: 'text-danger' },
  info: { icon: Info, cls: 'text-sky' },
}
</script>

<template>
  <Teleport to="body">
    <div
      class="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex flex-col items-center gap-2 px-4 md:bottom-8"
    >
      <TransitionGroup name="pop">
        <div
          v-for="t in ui.toasts"
          :key="t.id"
          class="flex items-center gap-2 rounded-full bg-ink/90 py-2.5 pl-4 pr-5 text-sm text-white shadow-pop backdrop-blur"
        >
          <component :is="ICONS[t.type]?.icon || ICONS.success.icon" class="h-4 w-4" :class="ICONS[t.type]?.cls" />
          <span>{{ t.message }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>
