<script setup>
// 旅行计划表单（新建 / 编辑共用），内嵌在 TripDrawer 中
import { reactive, ref } from 'vue'
import { X } from 'lucide-vue-next'
import { useTripsStore } from '../stores/trips'
import { useUiStore } from '../stores/ui'
import ImageUploader from './ui/ImageUploader.vue'

const props = defineProps({
  trip: { type: Object, default: null }, // null = 新建
})
const emit = defineEmits(['close'])

const trips = useTripsStore()
const ui = useUiStore()

const form = reactive({
  name: props.trip?.name || '',
  startDate: props.trip?.startDate || '',
  endDate: props.trip?.endDate || '',
  destinations: [...(props.trip?.destinations || [])],
  budget: props.trip?.budget ?? 0,
  status: props.trip?.status || 'planned',
  coverImage: props.trip?.coverImage || '',
  notes: props.trip?.notes || '',
})
const errors = reactive({})
const tagInput = ref('')

// 表单校验：必填、日期先后、非负数字
function validate() {
  errors.name = form.name.trim() ? '' : '请输入行程名称'
  errors.startDate = form.startDate ? '' : '请选择出发日期'
  errors.endDate = form.endDate ? '' : '请选择结束日期'
  if (!errors.startDate && !errors.endDate && form.endDate < form.startDate) {
    errors.endDate = '结束日期需晚于或等于出发日期'
  }
  errors.budget = Number(form.budget) >= 0 ? '' : '预算不能为负数'
  return !errors.name && !errors.startDate && !errors.endDate && !errors.budget
}

function addDest() {
  const v = tagInput.value.trim().replaceAll(',', '').replaceAll('，', '')
  if (v && !form.destinations.includes(v)) form.destinations.push(v)
  tagInput.value = ''
}
function removeDest(i) {
  form.destinations.splice(i, 1)
}

function save() {
  if (!validate()) return
  const payload = {
    name: form.name.trim(),
    startDate: form.startDate,
    endDate: form.endDate,
    destinations: [...form.destinations],
    budget: Math.max(0, Number(form.budget) || 0),
    status: form.status,
    coverImage: form.coverImage,
    notes: form.notes.trim(),
  }
  if (props.trip) {
    trips.updateTrip(props.trip.id, payload)
    ui.toast('行程已更新')
  } else {
    trips.addTrip(payload)
    ui.toast('行程已创建，去安排日程吧')
  }
  emit('close')
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="save">
    <div>
      <label class="field-label">行程名称 *</label>
      <input v-model="form.name" class="input" placeholder="如：日本 · 关西之旅" />
      <p v-if="errors.name" class="field-error">{{ errors.name }}</p>
    </div>

    <div class="grid grid-cols-2 gap-3">
      <div>
        <label class="field-label">出发日期 *</label>
        <input v-model="form.startDate" type="date" class="input" />
        <p v-if="errors.startDate" class="field-error">{{ errors.startDate }}</p>
      </div>
      <div>
        <label class="field-label">结束日期 *</label>
        <input v-model="form.endDate" type="date" class="input" :min="form.startDate" />
        <p v-if="errors.endDate" class="field-error">{{ errors.endDate }}</p>
      </div>
    </div>

    <div>
      <label class="field-label">目的地（回车添加）</label>
      <div class="input flex min-h-11 flex-wrap items-center gap-1.5 !py-1.5">
        <span
          v-for="(d, i) in form.destinations"
          :key="d"
          class="inline-flex items-center gap-1 rounded-full bg-brand-light px-2.5 py-1 text-xs font-bold text-brand-dark"
        >
          {{ d }}
          <button type="button" aria-label="移除目的地" @click="removeDest(i)">
            <X class="h-3 w-3" />
          </button>
        </span>
        <input
          v-model="tagInput"
          class="min-w-24 flex-1 bg-transparent text-sm outline-none"
          placeholder="大阪、京都…"
          @keydown.enter.prevent="addDest"
          @blur="addDest"
        />
      </div>
    </div>

    <div class="grid grid-cols-2 gap-3">
      <div>
        <label class="field-label">总预算（¥）</label>
        <input v-model.number="form.budget" type="number" min="0" class="input" placeholder="0" />
        <p v-if="errors.budget" class="field-error">{{ errors.budget }}</p>
      </div>
      <div>
        <label class="field-label">状态</label>
        <select v-model="form.status" class="input">
          <option value="planned">未开始</option>
          <option value="ongoing">进行中</option>
          <option value="done">已完成</option>
        </select>
      </div>
    </div>

    <div>
      <label class="field-label">封面图</label>
      <ImageUploader v-model="form.coverImage" />
    </div>

    <div>
      <label class="field-label">备注</label>
      <textarea v-model="form.notes" rows="3" class="input resize-none" placeholder="签证、交通、想做的事…"></textarea>
    </div>

    <div class="grid grid-cols-2 gap-3 pt-1">
      <button type="button" class="btn-ghost" @click="emit('close')">取消</button>
      <button type="submit" class="btn-primary">{{ trip ? '保存修改' : '创建行程' }}</button>
    </div>
  </form>
</template>
