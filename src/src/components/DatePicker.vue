<template>
  <div class="date-picker">
    <span style="color: #374151; font-weight: 500;">当前日期:</span>
    <input
      type="date"
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      class="date-input"
    />
    <button class="btn btn-secondary btn-sm" @click="setToday">今天</button>
  </div>
</template>

<script setup lang="ts">
import { formatDate } from '../utils/planUtils'

defineProps<{
  modelValue: string
}>()

defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

function setToday() {
  const today = formatDate(new Date())
  const event = new CustomEvent('update:modelValue', { detail: today })
  document.querySelector('.date-input')?.dispatchEvent(event)
}
</script>

<style scoped>
.date-picker {
  display: flex;
  align-items: center;
  gap: 10px;
}

.date-input {
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

.date-input:focus {
  outline: none;
  border-color: #667eea;
}

.btn-sm {
  padding: 4px 12px;
  font-size: 13px;
}
</style>
