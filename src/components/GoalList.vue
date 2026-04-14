<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from '../store'
import dayjs from 'dayjs'

const store = useStore()

const goals = computed(() => store.state.goals)
</script>

<template>
  <div class="card" v-if="goals.length > 0">
    <h2 style="margin-bottom: 20px; color: #1f2937;">📋 目标列表</h2>
    <div style="display: flex; flex-direction: column; gap: 12px;">
      <div
        v-for="goal in goals"
        :key="goal.id"
        style="padding: 16px; background: #f9fafb; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;"
      >
        <div>
          <h4 style="margin-bottom: 8px;">{{ goal.name }}</h4>
          <div style="font-size: 13px; color: #6b7280;">
            {{ goal.totalHours }}小时 · {{ goal.totalDays }}天 · 开始于 {{ goal.startDate }}
          </div>
        </div>
        <button
          @click="store.deleteGoal(goal.id)"
          class="btn btn-danger"
          style="padding: 6px 12px; font-size: 12px;"
        >
          删除
        </button>
      </div>
    </div>
  </div>
</template>
