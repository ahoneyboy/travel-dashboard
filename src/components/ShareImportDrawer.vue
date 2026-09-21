<script setup>
// 分享文案导入抽屉：粘贴小红书/抖音等平台的文案 → 离线智能识别 → 勾选导入愿望清单
// 识别分两层：① 命中内置景区库（自动带出等级/最佳季节/图片等完整资料）
//            ② 未收录地点用「地名后缀 + 动词/时间词过滤」启发式提取候选
import { computed, ref, watch } from 'vue'
import { ScanSearch, Sparkles } from 'lucide-vue-next'
import BaseDrawer from './ui/BaseDrawer.vue'
import { analyzeShareText, excerpt } from '../utils/parse-share'

const props = defineProps({
  open: { type: Boolean, default: false },
  initialText: { type: String, default: '' },
})
const emit = defineEmits(['close', 'import'])

const text = ref('')
const analyzed = ref(null)
const sel = ref({})
const manualName = ref('')

// 打开抽屉时：带入初始文案并自动识别一次
watch(
  () => props.open,
  (v) => {
    if (v) {
      text.value = props.initialText || ''
      analyzed.value = null
      sel.value = {}
      if (text.value.trim()) doAnalyze()
    }
  }
)

function doAnalyze() {
  if (!text.value.trim()) return
  const r = analyzeShareText(text.value)
  analyzed.value = r
  sel.value = {}
  // 库内命中默认勾选，候选默认不勾（用户自己挑）
  r.matches.forEach((m) => (sel.value['lib:' + m.name] = true))
}

function toggle(key) {
  sel.value[key] = !sel.value[key]
}

function addManual() {
  const name = manualName.value.trim()
  if (!name) return
  if (!analyzed.value) analyzed.value = { matches: [], candidates: [], locationHint: '' }
  if (!analyzed.value.candidates.includes(name)) analyzed.value.candidates.unshift(name)
  sel.value['cand:' + name] = true
  manualName.value = ''
}

const selectedItems = computed(() => {
  if (!analyzed.value) return []
  const items = []
  analyzed.value.matches.forEach((m) => {
    if (sel.value['lib:' + m.name]) {
      items.push({
        name: m.name,
        location: [m.province, m.city].filter(Boolean).join(' · '),
        level: m.level,
        bestSeason: m.bestSeason,
        rating: m.rating,
        imageUrl: m.imageUrl,
        note: m.note,
      })
    }
  })
  analyzed.value.candidates.forEach((c) => {
    if (sel.value['cand:' + c]) {
      items.push({
        name: c,
        location: analyzed.value.locationHint,
        level: '',
        bestSeason: '',
        rating: 0,
        imageUrl: '',
        note: '分享看到：' + excerpt(text.value, 60),
      })
    }
  })
  return items
})

function submit() {
  const items = selectedItems.value
  if (!items.length) return
  emit('import', items)
}
</script>

<template>
  <BaseDrawer :open="open" title="粘贴导入 · 智能识别" wide @close="emit('close')">
    <div class="space-y-4">
      <p class="rounded-xl bg-brand-soft p-3 text-xs leading-relaxed text-[#4a5a52]">
        在小红书 / 抖音 / 微博看到好地方？把文案复制粘贴到下面，自动识别地点：
        命中内置景区库的会带出完整资料，没收录的也能提取出地名。
      </p>

      <textarea
        v-model="text"
        rows="5"
        class="input resize-none leading-relaxed"
        placeholder="粘贴分享文案，如：茶卡盐湖真的绝了！天空之镜名不虚传…"
      ></textarea>

      <button class="btn-primary w-full" :disabled="!text.trim()" @click="doAnalyze">
        <ScanSearch class="h-4 w-4" /> 智能识别
      </button>

      <template v-if="analyzed">
        <!-- 库内命中 -->
        <div v-if="analyzed.matches.length">
          <h4 class="mb-2 text-sm font-bold">
            命中景区库
            <span class="ml-1 text-xs font-normal text-muted">资料自动补全</span>
          </h4>
          <div class="space-y-2">
            <label
              v-for="m in analyzed.matches"
              :key="m.name"
              class="flex cursor-pointer items-center gap-3 rounded-xl bg-[#f7faf8] p-2.5 transition-colors"
              :class="sel['lib:' + m.name] ? 'ring-1 ring-brand/40' : ''"
            >
              <input
                type="checkbox"
                class="h-4 w-4 shrink-0 accent-[#4a9e6e]"
                :checked="sel['lib:' + m.name]"
                @change="toggle('lib:' + m.name)"
              />
              <img :src="m.imageUrl" class="h-11 w-14 shrink-0 rounded-lg object-cover" alt="" />
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-1.5">
                  <b class="truncate text-sm">{{ m.name }}</b>
                  <span v-if="m.level" class="rounded-full bg-black/55 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {{ m.level }}
                  </span>
                </div>
                <span class="block truncate text-xs text-muted">
                  {{ [m.province, m.city].filter(Boolean).join(' · ') }}
                  <template v-if="m.bestSeason"> · {{ m.bestSeason }}</template>
                </span>
              </div>
            </label>
          </div>
        </div>

        <!-- 未收录候选 -->
        <div v-if="analyzed.candidates.length">
          <h4 class="mb-2 text-sm font-bold">
            疑似新地点
            <span class="ml-1 text-xs font-normal text-muted">识别自文案，资料需自行补充</span>
          </h4>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="c in analyzed.candidates"
              :key="c"
              class="chip !h-10"
              :class="sel['cand:' + c] && 'chip-active'"
              @click="toggle('cand:' + c)"
            >
              {{ c }}
            </button>
          </div>
        </div>

        <!-- 空结果引导 -->
        <div v-if="!analyzed.matches.length && !analyzed.candidates.length" class="py-4 text-center">
          <Sparkles class="mx-auto h-6 w-6 text-brand" />
          <p class="mt-2 text-xs text-muted">
            没认出地点。文案里要带有地名（如「茶卡盐湖」「XX古镇」），或直接在下面手动输入
          </p>
        </div>

        <!-- 手动补充 -->
        <div class="flex gap-2">
          <input
            v-model="manualName"
            class="input"
            :placeholder="analyzed.locationHint ? `手动输入地点（${analyzed.locationHint}）` : '手动输入地点名称'"
            @keydown.enter="addManual"
          />
          <button class="btn-ghost shrink-0 !px-4" @click="addManual">添加</button>
        </div>

        <button class="btn-primary w-full" :disabled="!selectedItems.length" @click="submit">
          导入所选（{{ selectedItems.length }}）
        </button>
      </template>
    </div>
  </BaseDrawer>
</template>
