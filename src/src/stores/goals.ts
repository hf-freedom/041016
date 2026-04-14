import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Goal, Stage, WeeklyPlan, DailyTask, PendingTask } from '@/types'
import { useAppStore } from './app'

function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

export const useGoalsStore = defineStore('goals', () => {
  const goals = ref<Goal[]>([])
  const appStore = useAppStore()

  const allPendingTasks = computed<PendingTask[]>(() => {
    const pending: PendingTask[] = []
    const today = formatDate(appStore.currentDate)

    goals.value.forEach(goal => {
      goal.stages.forEach(stage => {
        stage.weeklyPlans.forEach(week => {
          week.dailyTasks.forEach(task => {
            if (task.date < today && task.status === 'pending') {
              pending.push({
                task,
                goalId: goal.id,
                stageId: stage.id,
                weekId: week.id
              })
            }
          })
        })
      })
    })

    return pending.sort((a, b) => a.task.date.localeCompare(b.task.date))
  })

  const todayTasks = computed(() => {
    const today = formatDate(appStore.currentDate)
    const tasks: Array<{
      task: DailyTask
      goal: Goal
      stage: Stage
      week: WeeklyPlan
    }> = []

    goals.value.forEach(goal => {
      goal.stages.forEach(stage => {
        stage.weeklyPlans.forEach(week => {
          const task = week.dailyTasks.find(t => t.date === today)
          if (task) {
            tasks.push({ task, goal, stage, week })
          }
        })
      })
    })

    return tasks
  })

  function createGoal(
    name: string,
    description: string,
    totalHours: number,
    startDate: Date,
    endDate: Date
  ): Goal {
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
    const dailyHours = totalHours / totalDays

    const goal: Goal = {
      id: generateId(),
      name,
      description,
      totalHours,
      completedHours: 0,
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      dailyHours,
      stages: [],
      createdAt: new Date().toISOString()
    }

    goal.stages = generateStages(goal, startDate, endDate, totalHours)
    goals.value.push(goal)
    saveGoals()
    return goal
  }

  function generateStages(goal: Goal, startDate: Date, endDate: Date, totalHours: number): Stage[] {
    const stages: Stage[] = []
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
    
    const stageCount = Math.min(3, Math.ceil(totalDays / 30))
    const daysPerStage = Math.floor(totalDays / stageCount)
    const hoursPerStage = totalHours / stageCount

    for (let i = 0; i < stageCount; i++) {
      const stageStartDate = addDays(startDate, i * daysPerStage)
      const stageEndDate = i === stageCount - 1 
        ? endDate 
        : addDays(startDate, (i + 1) * daysPerStage - 1)

      const stage: Stage = {
        id: generateId(),
        name: `第${i + 1}阶段`,
        startDate: formatDate(stageStartDate),
        endDate: formatDate(stageEndDate),
        totalHours: hoursPerStage,
        completedHours: 0,
        weeklyPlans: []
      }

      stage.weeklyPlans = generateWeeklyPlans(stage, stageStartDate, stageEndDate, hoursPerStage)
      stages.push(stage)
    }

    return stages
  }

  function generateWeeklyPlans(stage: Stage, startDate: Date, endDate: Date, totalHours: number): WeeklyPlan[] {
    const weeklyPlans: WeeklyPlan[] = []
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
    const weekCount = Math.ceil(totalDays / 7)
    const hoursPerWeek = totalHours / weekCount

    for (let i = 0; i < weekCount; i++) {
      const weekStartDate = addDays(startDate, i * 7)
      const weekEndDate = i === weekCount - 1
        ? endDate
        : addDays(startDate, Math.min((i + 1) * 7 - 1, totalDays - 1))

      const week: WeeklyPlan = {
        id: generateId(),
        weekNumber: i + 1,
        startDate: formatDate(weekStartDate),
        endDate: formatDate(weekEndDate),
        totalHours: hoursPerWeek,
        completedHours: 0,
        dailyTasks: []
      }

      week.dailyTasks = generateDailyTasks(week, weekStartDate, weekEndDate, hoursPerWeek)
      weeklyPlans.push(week)
    }

    return weeklyPlans
  }

  function generateDailyTasks(week: WeeklyPlan, startDate: Date, endDate: Date, totalHours: number): DailyTask[] {
    const dailyTasks: DailyTask[] = []
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
    const hoursPerDay = totalHours / totalDays

    for (let i = 0; i < totalDays; i++) {
      const taskDate = addDays(startDate, i)
      dailyTasks.push({
        id: generateId(),
        date: formatDate(taskDate),
        hours: Math.round(hoursPerDay * 10) / 10,
        status: 'pending',
        completedHours: 0
      })
    }

    return dailyTasks
  }

  function getGoalById(id: string): Goal | undefined {
    return goals.value.find(g => g.id === id)
  }

  function updateTaskStatus(
    goalId: string,
    stageId: string,
    weekId: string,
    taskId: string,
    status: 'completed' | 'skipped',
    completedHours?: number
  ) {
    const goal = goals.value.find(g => g.id === goalId)
    if (!goal) return

    const stage = goal.stages.find(s => s.id === stageId)
    if (!stage) return

    const week = stage.weeklyPlans.find(w => w.id === weekId)
    if (!week) return

    const task = week.dailyTasks.find(t => t.id === taskId)
    if (!task) return

    task.status = status
    task.completedHours = status === 'completed' ? (completedHours ?? task.hours) : 0

    recalculateProgress(goal)
    saveGoals()
  }

  function postponeTask(goalId: string, stageId: string, weekId: string, taskId: string) {
    const goal = goals.value.find(g => g.id === goalId)
    if (!goal) return

    const stage = goal.stages.find(s => s.id === stageId)
    if (!stage) return

    const week = stage.weeklyPlans.find(w => w.id === weekId)
    if (!week) return

    const taskIndex = week.dailyTasks.findIndex(t => t.id === taskId)
    if (taskIndex === -1) return

    const task = week.dailyTasks[taskIndex]
    const postponedHours = task.hours
    task.status = 'postponed'
    task.completedHours = 0

    const remainingTasks = week.dailyTasks.slice(taskIndex + 1).filter(t => t.date > task.date)
    if (remainingTasks.length > 0) {
      const hoursPerTask = postponedHours / remainingTasks.length
      remainingTasks.forEach(t => {
        t.hours = Math.round((t.hours + hoursPerTask) * 10) / 10
      })
    } else {
      const nextWeek = stage.weeklyPlans[stage.weeklyPlans.indexOf(week) + 1]
      if (nextWeek) {
        const hoursPerTask = postponedHours / nextWeek.dailyTasks.length
        nextWeek.dailyTasks.forEach(t => {
          t.hours = Math.round((t.hours + hoursPerTask) * 10) / 10
        })
        nextWeek.totalHours = Math.round((nextWeek.totalHours + postponedHours) * 10) / 10
      }
    }

    recalculateProgress(goal)
    saveGoals()
  }

  function recalculateProgress(goal: Goal) {
    goal.completedHours = 0
    goal.stages.forEach(stage => {
      stage.completedHours = 0
      stage.weeklyPlans.forEach(week => {
        week.completedHours = week.dailyTasks.reduce((sum, t) => sum + t.completedHours, 0)
        stage.completedHours += week.completedHours
      })
      goal.completedHours += stage.completedHours
    })
  }

  function getGoalStats(goal: Goal) {
    const completionRate = goal.totalHours > 0 ? (goal.completedHours / goal.totalHours) * 100 : 0
    const remainingHours = goal.totalHours - goal.completedHours
    
    const today = formatDate(appStore.currentDate)
    const remainingTasks: DailyTask[] = []
    
    goal.stages.forEach(stage => {
      stage.weeklyPlans.forEach(week => {
        week.dailyTasks.forEach(task => {
          if (task.status === 'pending' && task.date >= today) {
            remainingTasks.push(task)
          }
        })
      })
    })

    const totalRemainingTaskHours = remainingTasks.reduce((sum, t) => sum + t.hours, 0)
    const avgDailyHours = remainingTasks.length > 0 ? totalRemainingTaskHours / remainingTasks.length : goal.dailyHours
    
    const estimatedDays = avgDailyHours > 0 ? Math.ceil(remainingHours / avgDailyHours) : 0
    const estimatedEndDate = addDays(appStore.currentDate, estimatedDays)

    return {
      completionRate: Math.round(completionRate * 10) / 10,
      remainingHours: Math.round(remainingHours * 10) / 10,
      estimatedEndDate: formatDate(estimatedEndDate),
      remainingTasks: remainingTasks.length
    }
  }

  function deleteGoal(id: string) {
    const index = goals.value.findIndex(g => g.id === id)
    if (index > -1) {
      goals.value.splice(index, 1)
      saveGoals()
    }
  }

  function saveGoals() {
    localStorage.setItem('study-goals', JSON.stringify(goals.value))
  }

  function loadGoals() {
    const saved = localStorage.getItem('study-goals')
    if (saved) {
      goals.value = JSON.parse(saved)
    }
  }

  loadGoals()

  return {
    goals,
    allPendingTasks,
    todayTasks,
    createGoal,
    getGoalById,
    updateTaskStatus,
    postponeTask,
    getGoalStats,
    deleteGoal,
    saveGoals,
    loadGoals
  }
})
