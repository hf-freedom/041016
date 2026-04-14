<template>
  <div class="card">
    <div class="card-header">
      <h3 class="card-title">逾期任务处理</h3>
      <span v-if="overdueTasks.length > 0" class="badge badge-danger">
        {{ overdueTasks.length }} 个逾期
      </span>
    </div>
    
    <div v-if="overdueTasks.length === 0" class="empty-state">
      <div class="empty-state-icon">✅</div>
      <div class="empty-state-text">没有逾期任务</div>
    </div>
    
    <ul v-else class="task-list">
      <li 
        v-for="task in overdueTasks" 
        :key="task.id"
        class="task-item overdue"
      >
        <div style="flex: 1;">
          <div style="font-weight: 500; margin-bottom: 5px;">{{ task.description }}</div>
          <div style="font-size: 13px; color: #6b7280;">
            原定日期: {{ task.date }} | 计划: {{ task.plannedHours }}小时
          </div>
          <div style="font-size: 12px; color: #f59e0b; margin-top: 4px;">
            ⚠️ 顺延将把该任务及后续所有计划推迟一天
          </div>
        </div>
        
        <div style="display: flex; gap: 8px;">
          <button 
            class="btn btn-warning btn-sm"
            @click="handlePostpone(task)"
          >
            顺延计划
          </button>
          <button 
            class="btn btn-danger btn-sm"
            @click="handleAbandon(task)"
          >
            废弃
          </button>
          <button 
            class="btn btn-success btn-sm"
            @click="handleComplete(task)"
          >
            完成
          </button>
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
import { getOverdueTasks, handleOverdueTask, completeTask } from '../store'

const showCompleteModal = ref(false)
const selectedTask = ref<DailyTask | null>(null)
const actualHours = ref(0)

const overdueTasks = computed(() => getOverdueTasks())

function handlePostpone(task: DailyTask) {
  if (confirm('确定要顺延吗？这将把该任务及后续所有计划推迟一天。')) {
    handleOverdueTask(task.goalId, task.id, 'postpone', 1)
  }
}

function handleAbandon(task: DailyTask) {
  if (confirm('确定要废弃这个任务吗？')) {
    handleOverdueTask(task.goalId, task.id, 'abandon')
  }
}

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
