<template>
  <div class="app">
    <header class="header">
      <h1>📚 学习计划与监督平台</h1>
      <div class="date-setting">
        <label>设置今天日期:</label>
        <input 
          type="date" 
          :value="formatDateForInput(currentDate)"
          @change="handleDateChange"
        />
        <span class="current-date">今天是: {{ formatDate(currentDate) }}</span>
      </div>
    </header>
    <main class="main">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useAppStore } from './stores/app'

const appStore = useAppStore()
const { currentDate } = storeToRefs(appStore)
const { setCurrentDate } = appStore

function formatDate(date: Date): string {
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
}

function formatDateForInput(date: Date): string {
  return date.toISOString().split('T')[0]
}

function handleDateChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.value) {
    setCurrentDate(new Date(target.value))
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  background: #f5f7fa;
  color: #333;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.header h1 {
  font-size: 1.5rem;
}

.date-setting {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.date-setting label {
  font-size: 0.9rem;
}

.date-setting input[type="date"] {
  padding: 0.5rem;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
}

.current-date {
  font-size: 0.9rem;
  opacity: 0.9;
}

.main {
  flex: 1;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: #e0e0e0;
  color: #333;
}

.btn-secondary:hover {
  background: #d0d0d0;
}

.btn-success {
  background: #4caf50;
  color: white;
}

.btn-danger {
  background: #f44336;
  color: white;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  margin-bottom: 1.5rem;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #333;
}
</style>
