<template>
  <div class="goal-detail" v-if="goal">
    <div class="goal-header">
      <div class="goal-title">
        <h2>{{ goal.name }}</h2>
        <p>{{ goal.description }}</p>
      </div>
      <div class="goal-actions">
        <router-link to="/" class="btn btn-secondary">返回</router-link>
        <button @click="deleteGoal" class="btn btn-danger">删除</button>
      </div>
    </div>

    <div class="stats-cards">
      <div class="stat-card large">
        <div class="stat-header">
          <span class="stat-title">完成进度</span>
          <span class="stat-percent">{{ stats.completionRate }}%</span>
        </div>
        <div class="progress-bar large">
          <div class="progress-fill" :style="{ width: stats.completionRate + '%' }"></div>
        </div>
        <div class="stat-detail">
          <span>{{ goal.completedHours }} / {{ goal.totalHours }} 小时</span>
        </div>
      </div>

      <div class="stat-card">
        <span class="stat-label">剩余时长</span>
        <span class="stat-value">{{ stats.remainingHours }}小时</span>
      </div>

      <div class="stat-card">
        <span class="stat-label">预计完成</span>
        <span class="stat-value">{{ stats.estimatedEndDate }}</span>
      </div>

      <div class="stat-card">
        <span class="stat-label">剩余任务</span>
        <span class="stat-value">{{ stats.remainingTasks }}个</span>
      </div>
    </div>

    <div class="content">
      <div class="stages-section">
        <h3>📚 学习阶段</h3>
        <div class="stages-list">
          <div 
            v-for="stage in goal.stages" 
            :key="stage.id"
            class="stage-card"
            :class="{ active: selectedStage?.id === stage.id }"
            @click="selectStage(stage)"
          >
            <div class="stage-header">
              <h4>{{ stage.name }}</h4>
              <span class="stage-date">{{ stage.startDate }} ~ {{ stage.endDate }}</span>
            </div>
            <div class="stage-progress">
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  :style="{ width: (stage.completedHours / stage.totalHours * 100) + '%' }"
                ></div>
              </div>
              <span>{{ Math.round(stage.completedHours / stage.totalHours * 100) }}%</span>
            </div>
            <div class="stage-stats">
              <span>{{ stage.totalHours }}小时</span>
              <span>{{ stage.weeklyPlans.length }}周</span>
            </div>
          </div>
        </div>
      </div>

      <div class="tasks-section" v-if="selectedStage">
        <h3>📅 周计划与任务</h3>
        <div class="weeks-list">
          <div 
            v-for="week in selectedStage.weeklyPlans" 
            :key="week.id"
            class="week-card"
          >
            <div class="week-header" @click="toggleWeek(week.id)">
              <div class="week-info">
                <h4>第{{ week.weekNumber }}周</h4>
                <span class="week-date">{{ week.startDate }} ~ {{ week.endDate }}</span>
              </div>
              <div class="week-summary">
                <span class="week-hours">{{ week.totalHours }}小时</span>
                <span class="week-progress">{{ Math.round(week.completedHours / week.totalHours * 100) }}%</span>
                <span class="expand-icon">{{ expandedWeeks.includes(week.id) ? '▼' : '▶' }}</span>
              </div>
            </div>

            <div v-show="expandedWeeks.includes(week.id)" class="tasks-list">
              <div 
                v-for="task in week.dailyTasks" 
                :key="task.id"
                class="task-item"
                :class="task.status"
              >
                <div class="task-date">
                  <span class="day-name">{{ getDayName(task.date) }}</span>
                  <span class="date">{{ task.date }}</span>
                </div>
                <div class="task-info">
                  <span class="task-hours">{{ task.hours }}小时</span>
                  <span class="task-status" :class="task.status">
                    {{ getStatusText(task.status) }}
                  </span>
                </div>
                <div class="task-actions" v-if="isTaskActionable(task)">
                  <button 
                    @click="completeTask(task, week.id)"
                    class="btn btn-success btn-sm"
                  >
                    完成
                  </button>
                  <button 
                    @click="skipTask(task, week.id)"
                    class="btn btn-secondary btn-sm"
                  >
                    未完成
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="not-found">
    <h2>目标不存在</h2>
    <router-link to="/" class="btn btn-primary">返回首页</router-link>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useGoalsStore } from '@/stores/goals'
import { useAppStore } from '@/stores/app'
import type { Stage, DailyTask } from '@/types'

const route = useRoute()
const router = useRouter()
const goalsStore = useGoalsStore()
const appStore = useAppStore()

const { currentDate } = storeToRefs(appStore)
const selectedStage = ref<Stage | null>(null)
const expandedWeeks = ref<string[]>([])

const goal = computed(() => {
  return goalsStore.getGoalById(route.params.id as string)
})

const stats = computed(() => {
  if (!goal.value) return { completionRate: 0, remainingHours: 0, estimatedEndDate: '-', remainingTasks: 0 }
  return goalsStore.getGoalStats(goal.value)
})

if (goal.value && goal.value.stages.length > 0) {
  selectedStage.value = goal.value.stages[0]
  if (selectedStage.value.weeklyPlans.length > 0) {
    expandedWeeks.value = [selectedStage.value.weeklyPlans[0].id]
  }
}

function selectStage(stage: Stage) {
  selectedStage.value = stage
  expandedWeeks.value = stage.weeklyPlans.length > 0 ? [stage.weeklyPlans[0].id] : []
}

function toggleWeek(weekId: string) {
  const index = expandedWeeks.value.indexOf(weekId)
  if (index > -1) {
    expandedWeeks.value.splice(index, 1)
  } else {
    expandedWeeks.value.push(weekId)
  }
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

function isTaskActionable(task: DailyTask): boolean {
  const today = currentDate.value.toISOString().split('T')[0]
  return task.date <= today && task.status === 'pending'
}

function completeTask(task: DailyTask, weekId: string) {
  if (!goal.value || !selectedStage.value) return
  goalsStore.updateTaskStatus(
    goal.value.id,
    selectedStage.value.id,
    weekId,
    task.id,
    'completed'
  )
}

function skipTask(task: DailyTask, weekId: string) {
  if (!goal.value || !selectedStage.value) return
  goalsStore.updateTaskStatus(
    goal.value.id,
    selectedStage.value.id,
    weekId,
    task.id,
    'skipped'
  )
}

function deleteGoal() {
  if (!goal.value) return
  if (confirm('确定要删除这个目标吗？所有相关数据将被清除。')) {
    goalsStore.deleteGoal(goal.value.id)
    router.push('/')
  }
}
</script>

<style scoped>
.goal-detail {
  max-width: 1200px;
  margin: 0 auto;
}

.goal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.goal-title h2 {
  font-size: 1.75rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.goal-title p {
  color: #666;
}

.goal-actions {
  display: flex;
  gap: 0.75rem;
}

.stats-cards {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
}

.stat-card.large {
  grid-row: span 1;
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.stat-title {
  font-size: 0.9rem;
  color: #666;
}

.stat-percent {
  font-size: 1.5rem;
  font-weight: bold;
  color: #667eea;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
}

.stat-detail {
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: #888;
}

.progress-bar {
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar.large {
  height: 12px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.content {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
}

.stages-section h3,
.tasks-section h3 {
  margin-bottom: 1rem;
  color: #333;
}

.stages-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.stage-card {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.stage-card:hover,
.stage-card.active {
  border-color: #667eea;
  transform: translateX(4px);
}

.stage-header {
  margin-bottom: 0.75rem;
}

.stage-header h4 {
  font-size: 1.1rem;
  color: #333;
  margin-bottom: 0.25rem;
}

.stage-date {
  font-size: 0.8rem;
  color: #888;
}

.stage-progress {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.stage-progress .progress-bar {
  flex: 1;
}

.stage-progress span {
  font-size: 0.85rem;
  color: #667eea;
  min-width: 35px;
}

.stage-stats {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: #888;
}

.weeks-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.week-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  overflow: hidden;
}

.week-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  cursor: pointer;
  transition: background 0.2s;
}

.week-header:hover {
  background: #f8f9fa;
}

.week-info h4 {
  font-size: 1.1rem;
  color: #333;
  margin-bottom: 0.25rem;
}

.week-date {
  font-size: 0.85rem;
  color: #888;
}

.week-summary {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.week-hours {
  font-size: 0.9rem;
  color: #667eea;
  font-weight: 500;
}

.week-progress {
  font-size: 0.9rem;
  color: #4caf50;
  font-weight: 500;
}

.expand-icon {
  color: #888;
  font-size: 0.8rem;
}

.tasks-list {
  border-top: 1px solid #eee;
}

.task-item {
  display: flex;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f0f0f0;
  gap: 1rem;
}

.task-item:last-child {
  border-bottom: none;
}

.task-item.completed {
  background: #f0f9f0;
}

.task-item.skipped,
.task-item.postponed {
  background: #fafafa;
  opacity: 0.7;
}

.task-date {
  width: 100px;
}

.day-name {
  display: block;
  font-size: 0.85rem;
  color: #666;
}

.date {
  display: block;
  font-size: 0.9rem;
  color: #333;
  font-weight: 500;
}

.task-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.task-hours {
  font-weight: 500;
  color: #333;
}

.task-status {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.task-status.pending {
  background: #fff3e0;
  color: #f57c00;
}

.task-status.completed {
  background: #e8f5e9;
  color: #4caf50;
}

.task-status.skipped {
  background: #ffebee;
  color: #f44336;
}

.task-status.postponed {
  background: #e3f2fd;
  color: #2196f3;
}

.task-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-sm {
  padding: 0.4rem 0.8rem;
  font-size: 0.85rem;
}

.not-found {
  text-align: center;
  padding: 4rem;
}

.not-found h2 {
  margin-bottom: 1rem;
  color: #333;
}

@media (max-width: 968px) {
  .stats-cards {
    grid-template-columns: 1fr 1fr;
  }
  
  .stat-card.large {
    grid-column: span 2;
  }
  
  .content {
    grid-template-columns: 1fr;
  }
}
</style>
