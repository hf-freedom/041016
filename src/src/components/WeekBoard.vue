<template>
  <div class="card">
    <div class="card-header">
      <h3 class="card-title">周计划看板</h3>
      <div style="display: flex; gap: 10px; align-items: center;">
        <button class="btn btn-secondary" @click="prevWeek">上一周</button>
        <span>{{ weekRange }}</span>
        <button class="btn btn-secondary" @click="nextWeek">下一周</button>
      </div>
    </div>
    
    <div v-if="tasks.length === 0" class="empty-state">
      <div class="empty-state-icon">📆</div>
      <div class="empty-state-text">本周没有计划任务</div>
    </div>
    
    <div v-else class="week-grid">
      <div 
        v-for="day in weekDays" 
        :key="day.date"
        class="day-column"
        :class="{ 'today': day.date === currentDate }"
      >
        <div class="day-header">
          <div class="day-name">{{ day.dayName }}</div>
          <div class="day-date">{{ day.displayDate }}</div>
        </div>
        
        <div class="day-tasks">
          <div 
            v-for="task in day.tasks"
            :key="task.id"
            class="task-card"
            :class="{
              'completed': task.status === 'completed',
              'overdue': task.status === 'overdue',
              'pending': task.status === 'pending'
            }"
          >
            <div class="task-title">{{ getGoalName(task.goalId) }}</div>
            <div class="task-hours">{{ task.plannedHours }}h</div>
            <div v-if="task.status === 'completed'" class="task-status completed">
              ✓ {{ task.actualHours }}h
            </div>
            <div v-else-if="task.status === 'overdue'" class="task-status overdue">
              逾期
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { DailyTask } from '../types'
import { goals, currentDate } from '../store'
import { formatDate, addDays, parseDate } from '../utils/planUtils'

const weekOffset = ref(0)

const weekStart = computed(() => {
  const current = parseDate(currentDate.value)
  const dayOfWeek = current.getDay()
  const start = new Date(current)
  start.setDate(current.getDate() - dayOfWeek + (weekOffset.value * 7))
  return start
})

const weekEnd = computed(() => {
  return addDays(weekStart.value, 6)
})

const weekRange = computed(() => {
  return `${formatDate(weekStart.value)} ~ ${formatDate(weekEnd.value)}`
})

const weekDays = computed(() => {
  const days = []
  const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  
  for (let i = 0; i < 7; i++) {
    const date = addDays(weekStart.value, i)
    const dateStr = formatDate(date)
    const dayTasks = getTasksForDate(dateStr)
    
    days.push({
      date: dateStr,
      dayName: dayNames[date.getDay()],
      displayDate: `${date.getMonth() + 1}/${date.getDate()}`,
      tasks: dayTasks
    })
  }
  
  return days
})

const tasks = computed(() => {
  const allTasks: DailyTask[] = []
  goals.value.forEach(goal => {
    if (goal.status !== 'active') return
    goal.phases.forEach(phase => {
      phase.weeks.forEach(week => {
        week.tasks.forEach(task => {
          if (task.date >= formatDate(weekStart.value) && 
              task.date <= formatDate(weekEnd.value)) {
            allTasks.push(task)
          }
        })
      })
    })
  })
  return allTasks
})

function getTasksForDate(date: string): DailyTask[] {
  const result: DailyTask[] = []
  goals.value.forEach(goal => {
    if (goal.status !== 'active') return
    goal.phases.forEach(phase => {
      phase.weeks.forEach(week => {
        week.tasks.forEach(task => {
          if (task.date === date) {
            let status = task.status
            if (status === 'pending' && task.date < currentDate.value) {
              status = 'overdue'
            }
            result.push({ ...task, status })
          }
        })
      })
    })
  })
  return result
}

function getGoalName(goalId: string): string {
  const goal = goals.value.find(g => g.id === goalId)
  return goal ? goal.name.substring(0, 10) + (goal.name.length > 10 ? '...' : '') : '未知目标'
}

function prevWeek() {
  weekOffset.value--
}

function nextWeek() {
  weekOffset.value++
}
</script>

<style scoped>
.week-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px;
}

.day-column {
  background: #f8fafc;
  border-radius: 8px;
  padding: 10px;
  min-height: 200px;
}

.day-column.today {
  background: #eff6ff;
  border: 2px solid #3b82f6;
}

.day-header {
  text-align: center;
  padding-bottom: 10px;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 10px;
}

.day-name {
  font-weight: 600;
  color: #374151;
}

.day-date {
  font-size: 12px;
  color: #6b7280;
}

.day-tasks {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.task-card {
  background: white;
  border-radius: 6px;
  padding: 8px;
  border-left: 3px solid #667eea;
}

.task-card.completed {
  border-left-color: #10b981;
  background: #f0fdf4;
}

.task-card.overdue {
  border-left-color: #ef4444;
  background: #fef2f2;
}

.task-title {
  font-size: 12px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 4px;
}

.task-hours {
  font-size: 11px;
  color: #6b7280;
}

.task-status {
  font-size: 11px;
  margin-top: 4px;
}

.task-status.completed {
  color: #10b981;
}

.task-status.overdue {
  color: #ef4444;
}

@media (max-width: 900px) {
  .week-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 600px) {
  .week-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
