<template>
  <div class="card">
    <div class="card-header">
      <h3 class="card-title">制定新目标</h3>
    </div>
    
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label class="form-label">目标名称</label>
        <input
          v-model="form.name"
          type="text"
          class="form-input"
          placeholder="例如：90天学完英语课程"
          required
        />
      </div>
      
      <div class="form-group">
        <label class="form-label">总时长（小时）</label>
        <input
          v-model.number="form.totalHours"
          type="number"
          class="form-input"
          placeholder="例如：900"
          min="1"
          required
        />
      </div>
      
      <div class="form-group">
        <label class="form-label">总天数</label>
        <input
          v-model.number="form.totalDays"
          type="number"
          class="form-input"
          placeholder="例如：90"
          min="1"
          required
        />
      </div>
      
      <div class="form-group">
        <label class="form-label">开始日期</label>
        <input
          v-model="form.startDate"
          type="date"
          class="form-input"
          required
        />
      </div>
      
      <div style="display: flex; gap: 10px;">
        <button type="submit" class="btn btn-primary">创建目标</button>
        <button type="button" class="btn btn-secondary" @click="resetForm">重置</button>
      </div>
    </form>
    
    <div v-if="preview" style="margin-top: 20px; padding: 15px; background: #f8fafc; border-radius: 8px;">
      <h4 style="margin-bottom: 10px; color: #374151;">目标预览</h4>
      <p><strong>目标：</strong>{{ preview.name }}</p>
      <p><strong>总时长：</strong>{{ preview.totalHours }} 小时</p>
      <p><strong>总天数：</strong>{{ preview.totalDays }} 天</p>
      <p><strong>每日学习：</strong>{{ (preview.totalHours / preview.totalDays).toFixed(1) }} 小时</p>
      <p><strong>阶段数量：</strong>{{ preview.phases.length }} 个阶段</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { splitGoalIntoPhases, formatDate } from '../utils/planUtils'
import { addGoal } from '../store'
import { Goal } from '../types'

const form = ref({
  name: '',
  totalHours: 0,
  totalDays: 0,
  startDate: formatDate(new Date())
})

const preview = ref<Goal | null>(null)

watch(form, (newVal) => {
  if (newVal.name && newVal.totalHours > 0 && newVal.totalDays > 0 && newVal.startDate) {
    preview.value = splitGoalIntoPhases(
      newVal.name,
      newVal.totalHours,
      newVal.totalDays,
      new Date(newVal.startDate)
    )
  } else {
    preview.value = null
  }
}, { deep: true })

function handleSubmit() {
  if (!form.value.name || form.value.totalHours <= 0 || form.value.totalDays <= 0) {
    return
  }
  
  const goal = splitGoalIntoPhases(
    form.value.name,
    form.value.totalHours,
    form.value.totalDays,
    new Date(form.value.startDate)
  )
  
  addGoal(goal)
  resetForm()
}

function resetForm() {
  form.value = {
    name: '',
    totalHours: 0,
    totalDays: 0,
    startDate: formatDate(new Date())
  }
  preview.value = null
}
</script>
