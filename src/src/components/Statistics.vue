<template>
  <div class="card">
    <div class="card-header">
      <h3 class="card-title">学习统计</h3>
    </div>
    
    <div class="stat-grid">
      <div class="stat-card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
        <div class="stat-value">{{ stats.totalGoals }}</div>
        <div class="stat-label">总目标数</div>
      </div>
      
      <div class="stat-card" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
        <div class="stat-value">{{ stats.activeGoals }}</div>
        <div class="stat-label">进行中</div>
      </div>
      
      <div class="stat-card" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">
        <div class="stat-value">{{ stats.completionRate }}%</div>
        <div class="stat-label">完成率</div>
      </div>
      
      <div class="stat-card" style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);">
        <div class="stat-value">{{ stats.remainingHours }}h</div>
        <div class="stat-label">剩余时长</div>
      </div>
    </div>
    
    <div style="margin-top: 20px;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
        <span style="color: #374151; font-weight: 500;">总体进度</span>
        <span style="color: #6b7280;">{{ stats.totalCompletedHours }}h / {{ stats.totalPlannedHours }}h</span>
      </div>
      <div class="progress-bar">
        <div 
          class="progress-fill" 
          :style="{ width: `${stats.completionRate}%` }"
        ></div>
      </div>
    </div>
    
    <div style="margin-top: 15px; padding: 15px; background: #f8fafc; border-radius: 8px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="color: #374151;">预计完成日期</span>
        <span style="font-weight: 600; color: #667eea;">{{ stats.estimatedCompletionDate }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getOverallStatistics } from '../store'

const stats = computed(() => getOverallStatistics())
</script>
