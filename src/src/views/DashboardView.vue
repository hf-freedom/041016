<template>
  <div class="dashboard">
    <h2>📊 今日任务看板</h2>
    <p class="date-display">{{ formatDate(currentDate) }}</p>

    <div v-if="todayTasks.length > 0" class="tasks-grid">
      <div 
        v-for="{ task, goal, stage, week } in todayTasks" 
        :key="task.id"
        class="task-card"
        :class="task.status"
      >
        <div class="task-header">
          <h3>{{ goal.name }}</h3>
          <span class="stage-name">{{ stage.name }}</span>
        </div>
        
        <div class="task-body">
          <div class="hours-badge">
            <span class="hours">{{ task.hours }}</span>
            <span class="unit">小时</span>
          </div>
          
          <div class="task-info">
            <p>第{{ week.weekNumber }}周 · {{ getDayName(task.date) }}</p>
            <span class="status-badge" :class="task.status">
              {{ getStatusText(task.status) }}
            </span>
          </div>
        </div>

        <div class="task-actions" v-if="task.status === 'pending'">
          <button 
            @click="completeTask(goal.id, stage.id, week.id, task.id)"
            class="btn btn-success"
          >
            ✓ 完成
          </button>
          <button 
            @click="showIncompleteDialog(goal.id, stage.id, week.id, task.id)"
            class="btn btn-secondary"
          >
            ✗ 未完成
          </button>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <div class="empty-icon">🎉</div>
      <h3>今日暂无任务</h3>
      <p>好好休息，或者去创建新目标吧！</p>
      <router-link to="/goal/create" class="btn btn-primary">
        创建新目标
      </router-link>
    </div>

    <div v-if="allPendingTasks.length > 0" class="pending-section">
      <h3>⚠️ 待处理逾期任务</h3>
      <div class="pending-list">
        <div 
          v-for="item in allPendingTasks" 
          :key="item.task.id"
          class="pending-item"
        >
          <div class="pending-info">
            <span class="pending-goal">{{ getGoalName(item.goalId) }}</span>
            <span class="pending-date">{{ item.task.date }}</span>
            <span class="pending-hours">{{ item.task.hours }}小时</span>
          </div>
          <div class="pending-actions">
            <button 
              @click="postponeTask(item)"
              class="btn btn-secondary btn-sm"
            >
              顺延
            </button>
            <button 
              @click="skipTask(item)"
              class="btn btn-danger btn-sm"
            >
              废弃
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="weekly-overview" v-if="goals.length > 0">
      <h3>📈 本周概览</h3>
      <div class="week-stats">
        <div v-for="goal in goals" :key="goal.id" class="goal-week-stat">
          <h4>{{ goal.name }}</h4>
          <div class="week-progress">
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: getWeeklyProgress(goal) + '%' }"
              ></div>
            </div>
            <span>{{ getWeeklyProgress(goal) }}%</span>
          </div>
          <p class="week-detail">
            本周已完成 {{ getWeeklyCompleted(goal) }} / {{ getWeeklyTotal(goal) }} 小时
          </p>
        </div>
      </div>
    </div>

    <div v-if="showDialog" class="dialog-overlay" @click.self="showDialog = false">
      <div class="dialog">
        <h3>未完成任务处理</h3>
        <p>请选择如何处理这个未完成的任务：</p>
        <div class="dialog-actions">
          <button @click="handlePostpone" class="btn btn-primary">
            📅 顺延到后续日期
          </button>
          <button @click="handleSkip" class="btn btn-danger">
            🗑️ 废弃此任务
          </button>
          <button @click="showDialog = false" class="btn btn-secondary">
            取消
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useGoalsStore } from '@/stores/goals'
import { useAppStore } from '@/stores/app'
import type { PendingTask } from '@/types'

const goalsStore = useGoalsStore()
const appStore = useAppStore()

const { goals, allPendingTasks, todayTasks } = storeToRefs(goalsStore)
const { currentDate } = storeToRefs(appStore)

const showDialog = ref(false)
const selectedTask = ref<{
  goalId: string
  stageId: string
  weekId: string
  taskId: string
} | null>(null)

function formatDate(date: Date): string {
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
}

function getDayName(dateStr: string): string {
  const date = new Date(dateStr)
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return days[date.getDay()]
}

function getStatusText(status: string): string {
  const map: Record<string, string> = {
    pending: '待完成',
    completed: '已完成',
    skipped: '已跳过',
    postponed: '已顺延'
  }
  return map[status] || status
}

function getGoalName(goalId: string): string {
  const goal = goals.value.find(g => g.id === goalId)
  return goal?.name || '未知目标'
}

function getWeeklyProgress(goal: typeof goals.value[0]): number {
  const total = getWeeklyTotal(goal)
  if (total === 0) return 0
  return Math.round((getWeeklyCompleted(goal) / total) * 100)
}

function getWeeklyCompleted(goal: typeof goals.value[0]): number {
  const today = currentDate.value.toISOString().split('T')[0]
  let completed = 0
  
  goal.stages.forEach(stage => {
    stage.weeklyPlans.forEach(week => {
      week.dailyTasks.forEach(task => {
        if (task.date <= today && task.status === 'completed') {
          completed += task.completedHours
        }
      })
    })
  })
  
  return Math.round(completed * 10) / 10
}

function getWeeklyTotal(goal: typeof goals.value[0]): number {
  const today = currentDate.value.toISOString().split('T')[0]
  const weekStart = new Date(currentDate.value)
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  const weekStartStr = weekStart.toISOString().split('T')[0]
  
  let total = 0
  
  goal.stages.forEach(stage => {
    stage.weeklyPlans.forEach(week => {
      week.dailyTasks.forEach(task => {
        if (task.date >= weekStartStr && task.date <= today) {
          total += task.hours
        }
      })
    })
  })
  
  return Math.round(total * 10) / 10
}

function completeTask(goalId: string, stageId: string, weekId: string, taskId: string) {
  goalsStore.updateTaskStatus(goalId, stageId, weekId, taskId, 'completed')
}

function showIncompleteDialog(goalId: string, stageId: string, weekId: string, taskId: string) {
  selectedTask.value = { goalId, stageId, weekId, taskId }
  showDialog.value = true
}

function handlePostpone() {
  if (!selectedTask.value) return
  const { goalId, stageId, weekId, taskId } = selectedTask.value
  goalsStore.postponeTask(goalId, stageId, weekId, taskId)
  showDialog.value = false
  selectedTask.value = null
}

function handleSkip() {
  if (!selectedTask.value) return
  const { goalId, stageId, weekId, taskId } = selectedTask.value
  goalsStore.updateTaskStatus(goalId, stageId, weekId, taskId, 'skipped')
  showDialog.value = false
  selectedTask.value = null
}

function postponeTask(item: PendingTask) {
  goalsStore.postponeTask(item.goalId, item.stageId, item.weekId, item.task.id)
}

function skipTask(item: PendingTask) {
  goalsStore.updateTaskStatus(item.goalId, item.stageId, item.weekId, item.task.id, 'skipped')
}
</script>

<style scoped>
.dashboard {
  max-width: 1000px;
  margin: 0 auto;
}

.dashboard h2 {
  margin-bottom: 0.5rem;
  color: #333;
}

.date-display {
  color: #888;
  margin-bottom: 2rem;
}

.tasks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.task-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  transition: transform 0.2s;
  border-left: 4px solid #f57c00;
}

.task-card:hover {
  transform: translateY(-4px);
}

.task-card.completed {
  border-left-color: #4caf50;
}

.task-card.skipped,
.task-card.postponed {
  border-left-color: #9e9e9e;
  opacity: 0.7;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.task-header h3 {
  font-size: 1.1rem;
  color: #333;
}

.stage-name {
  font-size: 0.8rem;
  color: #667eea;
  background: #f0f0ff;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
}

.task-body {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.hours-badge {
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
}

.hours {
  font-size: 1.5rem;
  font-weight: bold;
}

.unit {
  font-size: 0.7rem;
}

.task-info p {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-badge.pending {
  background: #fff3e0;
  color: #f57c00;
}

.status-badge.completed {
  background: #e8f5e9;
  color: #4caf50;
}

.task-actions {
  display: flex;
  gap: 0.75rem;
}

.task-actions .btn {
  flex: 1;
  padding: 0.75rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  margin-bottom: 2rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  color: #333;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #888;
  margin-bottom: 1.5rem;
}

.pending-section {
  margin-bottom: 2rem;
}

.pending-section h3 {
  margin-bottom: 1rem;
  color: #333;
}

.pending-list {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  overflow: hidden;
}

.pending-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f0f0f0;
}

.pending-item:last-child {
  border-bottom: none;
}

.pending-info {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.pending-goal {
  font-weight: 500;
  color: #333;
  min-width: 150px;
}

.pending-date {
  color: #f44336;
  font-weight: 500;
}

.pending-hours {
  color: #666;
}

.pending-actions {
  display: flex;
  gap: 0.5rem;
}

.weekly-overview {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
}

.weekly-overview h3 {
  margin-bottom: 1.5rem;
  color: #333;
}

.week-stats {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.goal-week-stat h4 {
  font-size: 1rem;
  color: #333;
  margin-bottom: 0.75rem;
}

.week-progress {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.week-progress .progress-bar {
  flex: 1;
  height: 10px;
  background: #e0e0e0;
  border-radius: 5px;
  overflow: hidden;
}

.week-progress .progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 5px;
  transition: width 0.3s ease;
}

.week-progress span {
  font-size: 0.9rem;
  font-weight: 500;
  color: #667eea;
  min-width: 40px;
}

.week-detail {
  font-size: 0.85rem;
  color: #888;
}

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
  text-align: center;
}

.dialog h3 {
  margin-bottom: 0.5rem;
  color: #333;
}

.dialog p {
  color: #666;
  margin-bottom: 1.5rem;
}

.dialog-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.dialog-actions .btn {
  width: 100%;
  padding: 0.875rem;
}
</style>
