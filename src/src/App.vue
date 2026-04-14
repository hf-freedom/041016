<template>
  <div class="app-container">
    <header class="app-header">
      <div class="header-left">
        <h1 class="app-title">📚 学习计划与监督平台</h1>
      </div>
      <div class="header-right">
        <DatePicker v-model="currentDateValue" />
      </div>
    </header>
    
    <main class="app-main">
      <div class="main-grid">
        <div class="left-column">
          <Statistics />
          <GoalForm />
          <GoalList />
        </div>
        
        <div class="right-column">
          <div class="tabs">
            <button 
              class="tab"
              :class="{ active: activeTab === 'daily' }"
              @click="activeTab = 'daily'"
            >
              每日计划
            </button>
            <button 
              class="tab"
              :class="{ active: activeTab === 'week' }"
              @click="activeTab = 'week'"
            >
              周计划
            </button>
            <button 
              class="tab"
              :class="{ active: activeTab === 'overdue' }"
              @click="activeTab = 'overdue'"
            >
              逾期任务
              <span v-if="overdueCount > 0" class="tab-badge">{{ overdueCount }}</span>
            </button>
          </div>
          
          <DailyBoard v-if="activeTab === 'daily'" :date="currentDate" />
          <WeekBoard v-else-if="activeTab === 'week'" />
          <OverdueTasks v-else-if="activeTab === 'overdue'" />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { currentDate, setCurrentDate, getOverdueTasks } from './store'
import DatePicker from './components/DatePicker.vue'
import Statistics from './components/Statistics.vue'
import GoalForm from './components/GoalForm.vue'
import GoalList from './components/GoalList.vue'
import DailyBoard from './components/DailyBoard.vue'
import WeekBoard from './components/WeekBoard.vue'
import OverdueTasks from './components/OverdueTasks.vue'

const activeTab = ref('daily')

const currentDateValue = computed({
  get: () => currentDate.value,
  set: (value: string) => setCurrentDate(value)
})

const overdueCount = computed(() => getOverdueTasks().length)
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.app-header {
  background: rgba(255, 255, 255, 0.95);
  padding: 15px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
}

.app-title {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.app-main {
  padding: 20px;
}

.main-grid {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 20px;
  max-width: 1600px;
  margin: 0 auto;
}

.left-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.right-column {
  display: flex;
  flex-direction: column;
}

.tab-badge {
  background: #ef4444;
  color: white;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 10px;
  margin-left: 5px;
}

@media (max-width: 1200px) {
  .main-grid {
    grid-template-columns: 1fr;
  }
  
  .left-column {
    order: 2;
  }
  
  .right-column {
    order: 1;
  }
}

@media (max-width: 600px) {
  .app-header {
    flex-direction: column;
    gap: 15px;
    padding: 15px;
  }
  
  .app-title {
    font-size: 20px;
  }
  
  .app-main {
    padding: 10px;
  }
}
</style>
