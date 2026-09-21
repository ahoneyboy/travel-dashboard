<script setup>
// 响应式抽屉：手机端从底部弹出（Bottom Sheet），PC/Pad 从右侧滑出（Drawer）
// 通过 Tailwind 断点切换位移方向，无需手写媒体查询
import { watch } from 'vue'
import { X } from 'lucide-vue-next'

const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: '' },
  wide: { type: Boolean, default: false },
})
const emit = defineEmits(['close'])

// 打开时锁定背景滚动
watch(
  () => props.open,
  (v) => {
    document.body.style.overflow = v ? 'hidden' : ''
  }
)
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-40" :class="open ? '' : 'pointer-events-none'">
      <!-- 遮罩 -->
      <div
        class="absolute inset-0 bg-ink/45 transition-opacity duration-300"
        :class="open ? 'opacity-100' : 'opacity-0'"
        @click="emit('close')"
      />
      <!-- 面板 -->
      <div
        class="absolute flex flex-col bg-white shadow-pop transition-transform duration-300 ease-out
          inset-x-0 bottom-0 max-h-[90vh] rounded-t-2xl
          md:inset-y-0 md:left-auto md:right-0 md:h-full md:max-h-full md:w-[440px] md:rounded-none md:rounded-l-2xl"
        :class="[
          wide ? 'md:w-[560px]' : '',
          // 关闭时多推出 24px：桌面端滚动条会在视口右侧留缝，只推 100% 会露出面板边缘
          open ? 'translate-y-0 md:translate-x-0' : 'translate-y-[calc(100%+24px)] md:translate-y-0 md:translate-x-[calc(100%+24px)]',
        ]"
      >
        <!-- 头部（手机端顶部带抓握条） -->
        <div class="border-b border-line px-5 pb-3 pt-2.5 md:min-h-[60px] md:py-3">
          <div class="mx-auto mb-2.5 h-1 w-10 rounded-full bg-line md:hidden"></div>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-bold">{{ title }}</h3>
            <button class="btn-icon" aria-label="关闭" @click="emit('close')">
              <X class="h-5 w-5" />
            </button>
          </div>
        </div>
        <!-- 内容 -->
        <div class="flex-1 overflow-y-auto overscroll-contain px-5 pb-8 pt-4">
          <slot />
        </div>
        <div v-if="$slots.footer" class="border-t border-line px-5 py-3">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>
