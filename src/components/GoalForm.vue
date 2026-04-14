<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import dayjs from 'dayjs'
import { useStore } from '../store'

const store = useStore()

const goalName = ref('')
const totalHours = ref(900)
const totalDays = ref(90)
const currentDate = computed(() => store.state.currentDate)
const startDate = ref(currentDate.value)

watch(currentDate, (newDate) => {
  startDate.value = newDate
})

const handleSubmit = () => {
  if (!goalName.value || totalHours.value <= 0 || totalDays.value <= 0) {
    alert('请填写完整信息')
    return
  }
  store.createGoal(goalName.value, totalHours.value, totalDays.value, startDate.value)
  goalName.value = ''
  totalHours.value = 900
  totalDays.value = 90
}

const presetGoals = [
  { name: '90天学完英语课程(900小时)', hours: 900, days: 90 },
  { name: '60天完成算法刷题(480小时)', hours: 480, days: 60 },
  { name: '30天健身计划(60小时)', hours: 60, days: 30 }
]

const applyPreset = (preset: typeof presetGoals[0]) => {
  goalName.value = preset.name
  totalHours.value = preset.hours
  totalDays.value = preset.days
}
</script>

<template>
  <div class="card">
    <h2 style="margin-bottom: 20px; color: #1f2937;">🎯 创建学习目标</h2>
    
    <div style="margin-bottom: 20px;">
      <span style="margin-right: 10px; font-size: 14px; color: #6b7280;">快捷选择：</span>
      <button
        v-for="preset in presetGoals"
        :key="preset.name"
        @click="applyPreset(preset)"
        class="btn btn-secondary"
        style="margin-right: 8px; padding: 6px 12px; font-size: 12px;"
      >
        {{ preset.name }}
      </button>
    </div>

    <div class="form-row">
      <div class="form-group" style="flex: 2;">
        <label>目标名称</label>
        <input
          v-model="goalName"
          type="text"
          placeholder="例如：90天学完英语课程"
          style="width: 100%;"
        />
      </div>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label>总时长(小时)</label>
        <input v-model.number="totalHours" type="number" min="1" />
      </div>
      <div class="form-group">
        <label>总天数</label>
        <input v-model.number="totalDays" type="number" min="1" />
      </div>
      <div class="form-group">
        <label>开始日期</label>
        <input v-model="startDate" type="date" />
      </div>
    </div>

    <div style="background: #f3f4f6; padding: 12px; border-radius: 8px; margin-bottom: 16px;">
      <strong>每日计划：</strong>
      {{ (totalHours / totalDays).toFixed(1) }} 小时/天
    </div>

    <button @click="handleSubmit" class="btn btn-primary">
      创建目标并自动拆分
    </button>
  </div>
</template>
