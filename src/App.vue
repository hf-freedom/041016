<script setup lang="ts">
import GoalForm from './components/GoalForm.vue'
import GoalList from './components/GoalList.vue'
import Statistics from './components/Statistics.vue'
import WeekKanban from './components/WeekKanban.vue'
import DateSetting from './components/DateSetting.vue'
</script>

<template>
  <div class="app">
    <header class="header">
      <div class="container header-content">
        <h1 class="title">📚 学习计划与监督平台</h1>
        <DateSetting />
      </div>
    </header>

    <main class="container">
      <Statistics />
      <GoalForm />
      <GoalList />
      <WeekKanban />

      <div class="card" style="background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);">
        <h3 style="margin-bottom: 12px; color: #4338ca;">💡 使用说明</h3>
        <ul style="color: #4b5563; font-size: 14px; line-height: 1.8; padding-left: 20px;">
          <li>输入长期目标（如"90天学完英语课程(900小时)"），系统会自动按小时拆分为阶段、周计划、日计划</li>
          <li>在看板中点击"完成"按钮标记任务完成状态</li>
          <li>过期未完成的任务可以选择"顺延到下一天"或"废弃任务"</li>
          <li>右上角可以设置"今天"的日期，方便回溯或提前规划</li>
          <li>所有数据自动保存到浏览器本地存储中</li>
        </ul>
      </div>
    </main>
  </div>
</template>

<style scoped>
.header {
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
}

.title {
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
</style>
