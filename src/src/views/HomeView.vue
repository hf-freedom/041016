<template>
  <div class="home">
    <div class="hero">
      <h2>制定目标，拆解计划，每日进步</h2>
      <p>将长期目标拆解为可执行的每日任务，让学习更高效</p>
      <router-link to="/goal/create" class="btn btn-primary create-btn">
        + 创建新目标
      </router-link>
    </div>

    <div class="stats-overview" v-if="goals.length > 0">
      <div class="stat-card">
        <div class="stat-value">{{ goals.length }}</div>
        <div class="stat-label">进行中目标</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ todayTasks.length }}</div>
        <div class="stat-label">今日任务</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ allPendingTasks.length }}</div>
        <div class="stat-label">待处理逾期</div>
      </div>
    </div>

    <div class="section" v-if="allPendingTasks.length > 0">
      <h3>⚠️ 待处理逾期任务</h3>
      <div class="pending-tasks">
        <div v-for="item in allPendingTasks.slice(0, 5)" :key="item.task.id" class="pending-task">
          <div class="pending-info">
            <span class="pending-date">{{ item.task.date }}</span>
            <span class="pending-hours">{{ item.task.hours }}小时</span>
          </div>
          <div class="pending-actions">
            <button @click="handlePostpone(item)" class="btn btn-secondary btn-sm">顺延</button>
            <button @click="handleSkip(item)" class="btn btn-danger btn-sm">废弃</button>
          </div>
        </div>
      </div>
    </div>

    <div class="section" v-if="goals.length > 0">
      <h3>📋 我的目标</h3>
      <div class="goals-grid">
        <div v-for="goal in goals" :key="goal.id" class="goal-card" @click="viewGoal(goal.id)">
          <div class="goal-header">
            <h4>{{ goal.name }}</h4>
            <span class="goal-date">{{ goal.startDate }} ~ {{ goal.endDate }}</span>
          </div>
          <p class="goal-desc">{{ goal.description }}</p>
          <div class="goal-progress">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: getProgress(goal) + '%' }"></div>
            </div>
            <span class="progress-text">{{ getProgress(goal) }}%</span>
          </div>
          <div class="goal-stats">
            <span>总时长: {{ goal.totalHours }}小时</span>
            <span>已完成: {{ goal.completedHours }}小时</span>
          </div>
        </div>
      </div>
    </div>

    <div class="empty-state" v-else>
      <div class="empty-icon">🎯</div>
      <h3>还没有目标</h3>
      <p>点击上方按钮创建你的第一个学习目标</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useGoalsStore } from '@/stores/goals'
import type { PendingTask } from '@/types'
import { useRouter } from 'vue-router'

const goalsStore = useGoalsStore()
const { goals, allPendingTasks, todayTasks } = storeToRefs(goalsStore)
const router = useRouter()

function getProgress(goal: typeof goals.value[0]): number {
  if (goal.totalHours === 0) return 0
  return Math.round((goal.completedHours / goal.totalHours) * 100)
}

function viewGoal(id: string) {
  router.push(`/goal/${id}`)
}

function handlePostpone(item: PendingTask) {
  goalsStore.postponeTask(item.goalId, item.stageId, item.weekId, item.task.id)
}

function handleSkip(item: PendingTask) {
  goalsStore.updateTaskStatus(item.goalId, item.stageId, item.weekId, item.task.id, 'skipped')
}
</script>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
}

.hero {
  text-align: center;
  padding: 3rem 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 16px;
  margin-bottom: 2rem;
}

.hero h2 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.hero p {
  opacity: 0.9;
  margin-bottom: 1.5rem;
}

.create-btn {
  font-size: 1.1rem;
  padding: 1rem 2rem;
  text-decoration: none;
  display: inline-block;
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #667eea;
}

.stat-label {
  color: #666;
  margin-top: 0.5rem;
}

.section {
  margin-bottom: 2rem;
}

.section h3 {
  margin-bottom: 1rem;
  color: #333;
}

.pending-tasks {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.pending-task {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border-bottom: 1px solid #eee;
}

.pending-task:last-child {
  border-bottom: none;
}

.pending-info {
  display: flex;
  gap: 1rem;
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

.btn-sm {
  padding: 0.4rem 0.8rem;
  font-size: 0.85rem;
}

.goals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.goal-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.goal-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}

.goal-header {
  margin-bottom: 0.75rem;
}

.goal-header h4 {
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 0.25rem;
}

.goal-date {
  font-size: 0.85rem;
  color: #888;
}

.goal-desc {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.goal-progress {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.9rem;
  font-weight: 500;
  color: #667eea;
  min-width: 40px;
}

.goal-stats {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: #888;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
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
}
</style>
