<template>
  <div class="card">
    <div class="card-header">
      <h3 class="card-title">目标列表</h3>
    </div>
    
    <div v-if="goals.length === 0" class="empty-state">
      <div class="empty-state-icon">🎯</div>
      <div class="empty-state-text">还没有创建目标</div>
    </div>
    
    <div v-else class="goal-list">
      <div 
        v-for="goal in goals" 
        :key="goal.id"
        class="goal-item"
        :class="{ 'selected': goal.id === selectedGoalId }"
        @click="selectGoal(goal.id)"
      >
        <div class="goal-header">
          <div class="goal-name">{{ goal.name }}</div>
          <span 
            class="badge"
            :class="{
              'badge-success': goal.status === 'completed',
              'badge-info': goal.status === 'active',
              'badge-danger': goal.status === 'abandoned'
            }"
          >
            {{ statusText[goal.status] }}
          </span>
        </div>
        
        <div class="goal-info">
          <span>{{ goal.totalDays }}天 | {{ goal.totalHours }}小时</span>
          <span>{{ goal.startDate }} ~ {{ goal.endDate }}</span>
        </div>
        
        <div class="goal-progress">
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: `${getGoalProgress(goal)}%` }"
            ></div>
          </div>
          <span class="progress-text">{{ getGoalProgress(goal) }}%</span>
        </div>
        
        <div class="goal-stats">
          <span>已完成: {{ goal.completedHours.toFixed(1) }}h</span>
          <span>剩余: {{ (goal.totalHours - goal.completedHours).toFixed(1) }}h</span>
        </div>
        
        <div v-if="showDetails && goal.id === selectedGoalId" class="goal-details">
          <div class="phases-list">
            <div 
              v-for="phase in goal.phases" 
              :key="phase.id"
              class="phase-item"
            >
              <div class="phase-header">
                <span class="phase-name">{{ phase.name }}</span>
                <span class="phase-dates">{{ phase.startDate }} ~ {{ phase.endDate }}</span>
              </div>
              <div class="phase-progress">
                <div class="progress-bar" style="height: 4px;">
                  <div 
                    class="progress-fill"
                    :style="{ width: `${getPhaseProgress(phase)}%` }"
                  ></div>
                </div>
                <span>{{ phase.completedHours.toFixed(1) }}h / {{ phase.plannedHours.toFixed(1) }}h</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="goal-actions">
          <button 
            class="btn btn-secondary btn-sm"
            @click.stop="toggleDetails(goal.id)"
          >
            {{ showDetails && goal.id === selectedGoalId ? '收起' : '详情' }}
          </button>
          <button 
            class="btn btn-danger btn-sm"
            @click.stop="handleDelete(goal.id)"
          >
            删除
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { goals, selectedGoalId, setSelectedGoal, deleteGoal } from '../store'
import { Goal, Phase } from '../types'

const showDetails = ref(false)

const statusText: Record<string, string> = {
  active: '进行中',
  completed: '已完成',
  abandoned: '已废弃'
}

function getGoalProgress(goal: Goal): number {
  if (goal.totalHours === 0) return 0
  return Math.round((goal.completedHours / goal.totalHours) * 100)
}

function getPhaseProgress(phase: Phase): number {
  if (phase.plannedHours === 0) return 0
  return Math.round((phase.completedHours / phase.plannedHours) * 100)
}

function selectGoal(goalId: string) {
  setSelectedGoal(goalId)
}

function toggleDetails(goalId: string) {
  if (showDetails.value && selectedGoalId.value === goalId) {
    showDetails.value = false
  } else {
    setSelectedGoal(goalId)
    showDetails.value = true
  }
}

function handleDelete(goalId: string) {
  if (confirm('确定要删除这个目标吗？此操作不可恢复。')) {
    deleteGoal(goalId)
  }
}
</script>

<style scoped>
.goal-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.goal-item {
  background: #f8fafc;
  border-radius: 8px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.goal-item:hover {
  background: #f1f5f9;
}

.goal-item.selected {
  border-color: #667eea;
  background: #eff6ff;
}

.goal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.goal-name {
  font-weight: 600;
  font-size: 16px;
  color: #1f2937;
}

.goal-info {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 10px;
}

.goal-progress {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.goal-progress .progress-bar {
  flex: 1;
}

.progress-text {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  min-width: 40px;
  text-align: right;
}

.goal-stats {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #6b7280;
}

.goal-details {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #e5e7eb;
}

.phases-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.phase-item {
  background: white;
  border-radius: 6px;
  padding: 10px;
}

.phase-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.phase-name {
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.phase-dates {
  font-size: 12px;
  color: #6b7280;
}

.phase-progress {
  display: flex;
  align-items: center;
  gap: 10px;
}

.phase-progress .progress-bar {
  flex: 1;
}

.phase-progress span {
  font-size: 12px;
  color: #6b7280;
  min-width: 80px;
  text-align: right;
}

.goal-actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.btn-sm {
  padding: 4px 12px;
  font-size: 13px;
}
</style>
