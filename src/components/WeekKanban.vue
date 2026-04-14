<script setup lang="ts">
import { ref, computed } from 'vue'
import dayjs from 'dayjs'
import { useStore } from '../store'
import type { HandleUncompletedType } from '../types'

const store = useStore()

const showHandleModal = ref(false)
const selectedDayId = ref('')
const selectedDayDate = ref('')

const weekDays = computed(() => store.getWeekPlans())
const currentDate = computed(() => store.state.currentDate)

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'completed':
      return { background: '#dcfce7', borderColor: '#10b981' }
    case 'skipped':
      return { background: '#f3f4f6', borderColor: '#9ca3af' }
    default:
      return { background: 'white', borderColor: '#e5e7eb' }
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'completed':
      return '✅ 已完成'
    case 'skipped':
      return '⚪ 已跳过'
    default:
      return '⏳ 待完成'
  }
}

const toggleComplete = (dayPlanId: string, currentStatus: string) => {
  const isCompleted = currentStatus === 'completed'
  store.markDayComplete(dayPlanId, !isCompleted)
}

const openHandleModal = (dayPlanId: string, date: string) => {
  selectedDayId.value = dayPlanId
  selectedDayDate.value = date
  showHandleModal.value = true
}

const handleUncompletedAction = (type: HandleUncompletedType) => {
  store.handleUncompleted(selectedDayId.value, type)
  showHandleModal.value = false
}

const isOverdue = (date: string) => {
  return dayjs(date).isBefore(dayjs(currentDate.value), 'day')
}
</script>

<template>
  <div class="card">
    <h2 style="margin-bottom: 20px; color: #1f2937;">📆 本周计划看板</h2>
    <div class="week-grid">
      <div
        v-for="day in weekDays"
        :key="day.date"
        class="day-column"
        :class="{ 'today': day.isToday }"
      >
        <div class="day-header">
          <div class="day-weekday">{{ dayjs(day.date).format('ddd') }}</div>
          <div class="day-date">{{ dayjs(day.date).format('M/D') }}</div>
          <div v-if="day.isToday" class="today-badge">今天</div>
        </div>
        
        <div class="day-plans">
          <div
            v-for="plan in day.plans"
            :key="plan.id"
            class="plan-card"
            :style="getStatusStyle(plan.status)"
          >
            <div class="plan-hours">{{ plan.hours }}h</div>
            <div class="plan-status">{{ getStatusText(plan.status) }}</div>
            
            <div class="plan-actions" v-if="plan.status === 'pending'">
              <button
                @click="toggleComplete(plan.id, plan.status)"
                class="btn btn-success"
                style="padding: 6px 8px; font-size: 12px; width: 100%;"
              >
                ✅ 标记完成
              </button>
              <button
                @click="openHandleModal(plan.id, day.date)"
                class="btn btn-warning"
                style="padding: 6px 8px; font-size: 12px; width: 100%; margin-top: 6px;"
              >
                ❌ 未完成处理
              </button>
            </div>
            
            <div v-else-if="plan.status === 'completed'">
              <button
                @click="toggleComplete(plan.id, plan.status)"
                class="btn btn-secondary"
                style="padding: 6px 8px; font-size: 12px; width: 100%;"
              >
                🔄 撤销完成
              </button>
            </div>

            <div v-else>
              <div style="text-align: center; font-size: 12px; color: #9ca3af; padding: 4px;">
                已跳过/已顺延
              </div>
            </div>
          </div>
          
          <div v-if="day.plans.length === 0" class="empty-plan">
            暂无计划
          </div>
        </div>
      </div>
    </div>

    <div v-if="showHandleModal" class="modal-overlay" @click="showHandleModal = false">
      <div class="modal-content" @click.stop>
        <h3 style="margin-bottom: 12px;">🔔 未完成任务如何处理？</h3>
        <p style="margin-bottom: 20px; color: #6b7280;">
          {{ selectedDayDate }} 的任务未按时完成，请选择处理方式：
        </p>
        <div style="display: flex; gap: 12px;">
          <button
            @click="handleUncompletedAction('postpone')"
            class="btn btn-primary"
            style="flex: 1;"
          >
            📅 顺延到下一天
          </button>
          <button
            @click="handleUncompletedAction('discard')"
            class="btn btn-secondary"
            style="flex: 1;"
          >
            🗑️ 废弃任务
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.week-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 12px;
}

.day-column {
  background: #f9fafb;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid transparent;
}

.day-column.today {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
}

.day-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 12px;
  text-align: center;
}

.day-weekday {
  font-size: 14px;
  font-weight: 500;
}

.day-date {
  font-size: 20px;
  font-weight: 700;
  margin: 4px 0;
}

.today-badge {
  display: inline-block;
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
}

.day-plans {
  padding: 12px;
  min-height: 150px;
}

.plan-card {
  padding: 12px;
  border-radius: 8px;
  border: 2px solid;
  margin-bottom: 8px;
}

.plan-hours {
  font-size: 24px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 4px;
}

.plan-status {
  text-align: center;
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 8px;
}

.empty-plan {
  text-align: center;
  padding: 20px;
  color: #9ca3af;
  font-size: 13px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 24px;
  width: 450px;
  max-width: 90%;
}
</style>
