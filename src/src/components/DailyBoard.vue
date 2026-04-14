<template>
  <div class="card">
    <div class="card-header">
      <h3 class="card-title">每日计划看板</h3>
      <span class="badge badge-info">{{ date }}</span>
    </div>
    
    <div v-if="tasks.length === 0" class="empty-state">
      <div class="empty-state-icon">📅</div>
      <div class="empty-state-text">今天没有计划任务</div>
    </div>
    
    <ul v-else class="task-list">
      <li 
        v-for="task in tasks" 
        :key="task.id"
        class="task-item"
        :class="{
          'completed': task.status === 'completed',
          'pending': task.status === 'pending'
        }"
      >
        <div style="flex: 1;">
          <div style="font-weight: 500; margin-bottom: 5px;">{{ task.description }}</div>
          <div style="font-size: 13px; color: #6b7280;">
            计划: {{ task.plannedHours }}小时
            <span v-if="task.status === 'completed'">
              | 实际: {{ task.actualHours }}小时
            </span>
          </div>
        </div>
        
        <div v-if="task.status === 'pending'" style="display: flex; gap: 8px;">
          <button 
            class="btn btn-success btn-sm"
            @click="handleComplete(task)"
          >
            完成
          </button>
        </div>
        
        <div v-else-if="task.status === 'completed'" style="color: #10b981;">
          ✓ 已完成
        </div>
      </li>
    </ul>
    
    <div v-if="showCompleteModal" class="modal-overlay" @click.self="showCompleteModal = false">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">完成任务</h3>
          <button class="modal-close" @click="showCompleteModal = false">&times;</button>
        </div>
        
        <div class="form-group">
          <label class="form-label">实际学习时长（小时）</label>
          <input
            v-model.number="actualHours"
            type="number"
            class="form-input"
            :placeholder="`计划: ${selectedTask?.plannedHours}小时`"
            step="0.5"
            min="0"
          />
        </div>
        
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showCompleteModal = false">取消</button>
          <button class="btn btn-success" @click="confirmComplete">确认完成</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { DailyTask } from '../types'
import { getTodayTasks, completeTask } from '../store'

const props = defineProps<{
  date: string
}>()

const showCompleteModal = ref(false)
const selectedTask = ref<DailyTask | null>(null)
const actualHours = ref(0)

const tasks = computed(() => {
  return getTodayTasks()
})

function handleComplete(task: DailyTask) {
  selectedTask.value = task
  actualHours.value = task.plannedHours
  showCompleteModal.value = true
}

function confirmComplete() {
  if (selectedTask.value) {
    completeTask(selectedTask.value.goalId, selectedTask.value.id, actualHours.value)
    showCompleteModal.value = false
    selectedTask.value = null
  }
}
</script>

<style scoped>
.btn-sm {
  padding: 4px 12px;
  font-size: 13px;
}
</style>
