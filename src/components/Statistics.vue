<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from '../store'

const store = useStore()

const stats = computed(() => store.getGoalStats.value)
</script>

<template>
  <div class="card">
    <h2 style="margin-bottom: 20px; color: #1f2937;">📊 学习统计</h2>
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;">
      <div class="stat-item">
        <div class="stat-value">{{ stats.completionRate }}%</div>
        <div class="stat-label">完成率</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ stats.completedHours }}h</div>
        <div class="stat-label">已完成</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ stats.remainingHours }}h</div>
        <div class="stat-label">剩余量</div>
      </div>
      <div class="stat-item">
        <div class="stat-value date-value">{{ stats.estimatedEndDate }}</div>
        <div class="stat-label">预计完成</div>
      </div>
    </div>
    <div style="margin-top: 20px;">
      <div style="height: 12px; background: #e5e7eb; border-radius: 6px; overflow: hidden;">
        <div
          style="height: 100%; background: linear-gradient(90deg, #10b981, #34d399); transition: width 0.5s ease;"
          :style="{ width: stats.completionRate + '%' }"
        ></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stat-item {
  text-align: center;
  padding: 16px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
  border-radius: 12px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 4px;
}

.stat-value.date-value {
  font-size: 16px;
  line-height: 1.4;
}

.stat-label {
  font-size: 13px;
  color: #6b7280;
}
</style>
