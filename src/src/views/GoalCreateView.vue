<template>
  <div class="goal-create">
    <div class="card">
      <h2 class="card-title">🎯 创建新目标</h2>
      
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>目标名称</label>
          <input 
            v-model="form.name" 
            type="text" 
            placeholder="例如：90天学完英语课程"
            required
          />
        </div>

        <div class="form-group">
          <label>目标描述</label>
          <textarea 
            v-model="form.description" 
            placeholder="详细描述你的学习目标..."
            rows="3"
          ></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>总时长 (小时)</label>
            <input 
              v-model.number="form.totalHours" 
              type="number" 
              min="1"
              placeholder="例如：900"
              required
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>开始日期</label>
            <input 
              v-model="form.startDate" 
              type="date"
              required
            />
          </div>
          <div class="form-group">
            <label>结束日期</label>
            <input 
              v-model="form.endDate" 
              type="date"
              required
            />
          </div>
        </div>

        <div class="preview" v-if="isValid">
          <h4>📊 计划预览</h4>
          <div class="preview-stats">
            <div class="preview-item">
              <span class="preview-label">总天数</span>
              <span class="preview-value">{{ totalDays }}天</span>
            </div>
            <div class="preview-item">
              <span class="preview-label">每日学习</span>
              <span class="preview-value">{{ dailyHours }}小时</span>
            </div>
            <div class="preview-item">
              <span class="preview-label">阶段数</span>
              <span class="preview-value">{{ stageCount }}个</span>
            </div>
            <div class="preview-item">
              <span class="preview-label">周计划数</span>
              <span class="preview-value">{{ weekCount }}周</span>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <router-link to="/" class="btn btn-secondary">取消</router-link>
          <button type="submit" class="btn btn-primary" :disabled="!isValid">
            创建目标
          </button>
        </div>
      </form>
    </div>

    <div class="examples">
      <h3>💡 示例目标</h3>
      <div class="example-list">
        <div 
          v-for="example in examples" 
          :key="example.name"
          class="example-card"
          @click="applyExample(example)"
        >
          <h4>{{ example.name }}</h4>
          <p>{{ example.description }}</p>
          <div class="example-meta">
            <span>{{ example.totalHours }}小时</span>
            <span>{{ example.days }}天</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useGoalsStore } from '@/stores/goals'

const router = useRouter()
const goalsStore = useGoalsStore()

const form = ref({
  name: '',
  description: '',
  totalHours: null as number | null,
  startDate: new Date().toISOString().split('T')[0],
  endDate: ''
})

const examples = [
  {
    name: '90天学完英语课程',
    description: '系统学习英语语法、词汇和口语，达到流利交流水平',
    totalHours: 900,
    days: 90
  },
  {
    name: '60天完成算法刷题',
    description: '掌握常见数据结构与算法，完成480道经典题目',
    totalHours: 480,
    days: 60
  },
  {
    name: '30天健身计划',
    description: '每天健身1小时，增强体质，塑造好身材',
    totalHours: 30,
    days: 30
  }
]

const isValid = computed(() => {
  return form.value.name && 
         form.value.totalHours && 
         form.value.totalHours > 0 &&
         form.value.startDate && 
         form.value.endDate &&
         new Date(form.value.endDate) > new Date(form.value.startDate)
})

const totalDays = computed(() => {
  if (!form.value.startDate || !form.value.endDate) return 0
  const start = new Date(form.value.startDate)
  const end = new Date(form.value.endDate)
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
})

const dailyHours = computed(() => {
  if (!form.value.totalHours || totalDays.value === 0) return 0
  return Math.round((form.value.totalHours / totalDays.value) * 10) / 10
})

const stageCount = computed(() => {
  return Math.min(3, Math.ceil(totalDays.value / 30)) || 1
})

const weekCount = computed(() => {
  return Math.ceil(totalDays.value / 7) || 1
})

function applyExample(example: typeof examples[0]) {
  const startDate = new Date()
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + example.days - 1)
  
  form.value.name = example.name
  form.value.description = example.description
  form.value.totalHours = example.totalHours
  form.value.startDate = startDate.toISOString().split('T')[0]
  form.value.endDate = endDate.toISOString().split('T')[0]
}

function handleSubmit() {
  if (!isValid.value || !form.value.totalHours) return

  const goal = goalsStore.createGoal(
    form.value.name,
    form.value.description,
    form.value.totalHours,
    new Date(form.value.startDate),
    new Date(form.value.endDate)
  )

  router.push(`/goal/${goal.id}`)
}
</script>

<style scoped>
.goal-create {
  max-width: 800px;
  margin: 0 auto;
}

.card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.preview {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
  margin: 1.5rem 0;
}

.preview h4 {
  margin-bottom: 1rem;
  color: #333;
}

.preview-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
}

.preview-item {
  text-align: center;
  padding: 1rem;
  background: white;
  border-radius: 8px;
}

.preview-label {
  display: block;
  font-size: 0.85rem;
  color: #888;
  margin-bottom: 0.25rem;
}

.preview-value {
  display: block;
  font-size: 1.25rem;
  font-weight: 600;
  color: #667eea;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.form-actions .btn {
  padding: 0.75rem 2rem;
}

.examples {
  margin-top: 2rem;
}

.examples h3 {
  margin-bottom: 1rem;
  color: #333;
}

.example-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.example-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  border: 2px solid transparent;
}

.example-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  border-color: #667eea;
}

.example-card h4 {
  color: #333;
  margin-bottom: 0.5rem;
}

.example-card p {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.example-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
  color: #667eea;
  font-weight: 500;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
