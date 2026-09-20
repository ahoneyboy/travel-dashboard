<script setup>
// 全局确认弹窗（删除等危险操作的二次确认），由 ui store 驱动
import { TriangleAlert } from 'lucide-vue-next'
import { useUiStore } from '../../stores/ui'

const ui = useUiStore()
</script>

<template>
  <Teleport to="body">
    <Transition name="pop">
      <div
        v-if="ui.confirmState.open"
        class="fixed inset-0 z-50 flex items-center justify-center p-6"
      >
        <div class="absolute inset-0 bg-ink/45" @click="ui.resolveConfirm(false)"></div>
        <div class="relative w-full max-w-sm rounded-card bg-white p-6 shadow-pop">
          <div class="flex flex-col items-center text-center">
            <div
              class="flex h-12 w-12 items-center justify-center rounded-full"
              :class="ui.confirmState.danger ? 'bg-[#fdecec] text-danger' : 'bg-brand-light text-brand-dark'"
            >
              <TriangleAlert class="h-6 w-6" />
            </div>
            <h3 class="mt-3 text-base font-bold">{{ ui.confirmState.title }}</h3>
            <p class="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-muted">
              {{ ui.confirmState.message }}
            </p>
          </div>
          <div class="mt-5 grid grid-cols-2 gap-3">
            <button class="btn-ghost" @click="ui.resolveConfirm(false)">取消</button>
            <button
              :class="ui.confirmState.danger ? 'btn-danger' : 'btn-primary'"
              @click="ui.resolveConfirm(true)"
            >
              {{ ui.confirmState.confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
