import { reactive, computed } from 'vue'
import { Goal, DailyTask, TaskAction } from '../types'
import { formatDate, getGoalStatistics, generateId, addDays } from '../utils/planUtils'

const STORAGE_KEY = 'study-plan-data'

interface Store {
  goals: Goal[]
  currentDate: string
  selectedGoalId: string | null
}

function loadFromStorage(): Store {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) {
      return JSON.parse(data)
    }
  } catch (e) {
    console.error('Failed to load from storage:', e)
  }
  return {
    goals: [],
    currentDate: formatDate(new Date()),
    selectedGoalId: null
  }
}

function saveToStorage(store: Store) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch (e) {
    console.error('Failed to save to storage:', e)
  }
}

const store = reactive<Store>(loadFromStorage())

export const goals = computed(() => store.goals)
export const currentDate = computed(() => store.currentDate)
export const selectedGoalId = computed(() => store.selectedGoalId)

export const selectedGoal = computed(() => {
  if (!store.selectedGoalId) return null
  return store.goals.find(g => g.id === store.selectedGoalId) || null
})

export const activeGoals = computed(() => 
  store.goals.filter(g => g.status === 'active')
)

export function setCurrentDate(date: string) {
  store.currentDate = date
  saveToStorage(store)
}

export function setSelectedGoal(goalId: string | null) {
  store.selectedGoalId = goalId
  saveToStorage(store)
}

export function addGoal(goal: Goal) {
  store.goals.push(goal)
  store.selectedGoalId = goal.id
  saveToStorage(store)
}

export function deleteGoal(goalId: string) {
  const index = store.goals.findIndex(g => g.id === goalId)
  if (index !== -1) {
    store.goals.splice(index, 1)
    if (store.selectedGoalId === goalId) {
      store.selectedGoalId = store.goals.length > 0 ? store.goals[0].id : null
    }
    saveToStorage(store)
  }
}

export function completeTask(goalId: string, taskId: string, actualHours: number) {
  const goal = store.goals.find(g => g.id === goalId)
  if (!goal) return
  
  for (const phase of goal.phases) {
    for (const week of phase.weeks) {
      const task = week.tasks.find(t => t.id === taskId)
      if (task) {
        task.status = 'completed'
        task.actualHours = actualHours
        task.completedAt = new Date().toISOString()
        
        week.completedHours = week.tasks
          .filter(t => t.status === 'completed')
          .reduce((sum, t) => sum + t.actualHours, 0)
        
        phase.completedHours = phase.weeks
          .reduce((sum, w) => sum + w.completedHours, 0)
        
        goal.completedHours = goal.phases
          .reduce((sum, p) => sum + p.completedHours, 0)
        
        const stats = getGoalStatistics(goal)
        if (stats.completionRate >= 100) {
          goal.status = 'completed'
        }
        
        saveToStorage(store)
        return
      }
    }
  }
}

export function handleOverdueTask(
  goalId: string, 
  taskId: string, 
  action: TaskAction,
  postponeDays?: number
) {
  const goal = store.goals.find(g => g.id === goalId)
  if (!goal) return
  
  let targetTaskDate = ''
  
  for (const phase of goal.phases) {
    for (const week of phase.weeks) {
      const task = week.tasks.find(t => t.id === taskId)
      if (task) {
        targetTaskDate = task.date
        if (action === 'abandon') {
          task.status = 'abandoned'
          saveToStorage(store)
          return
        }
        break
      }
    }
    if (targetTaskDate) break
  }
  
  if (action === 'postpone' && postponeDays) {
    goal.phases.forEach(phase => {
      phase.weeks.forEach(week => {
        week.tasks.forEach(task => {
          if (task.date >= targetTaskDate && task.status === 'pending') {
            const newDate = addDays(new Date(task.date), postponeDays)
            task.date = formatDate(newDate)
          }
        })
      })
    })
    
    goal.phases.forEach(phase => {
      const allPhaseTasks: DailyTask[] = []
      phase.weeks.forEach(week => {
        allPhaseTasks.push(...week.tasks)
      })
      if (allPhaseTasks.length > 0) {
        allPhaseTasks.sort((a, b) => a.date.localeCompare(b.date))
        phase.startDate = allPhaseTasks[0].date
        phase.endDate = allPhaseTasks[allPhaseTasks.length - 1].date
      }
      
      phase.weeks.forEach(week => {
        const weekTasks = [...week.tasks].sort((a, b) => a.date.localeCompare(b.date))
        if (weekTasks.length > 0) {
          week.startDate = weekTasks[0].date
          week.endDate = weekTasks[weekTasks.length - 1].date
        }
      })
    })
    
    const lastPhase = goal.phases[goal.phases.length - 1]
    if (lastPhase) {
      const lastWeek = lastPhase.weeks[lastPhase.weeks.length - 1]
      if (lastWeek) {
        const lastTask = lastWeek.tasks[lastWeek.tasks.length - 1]
        if (lastTask) {
          goal.endDate = lastTask.date
        }
      }
    }
    
    saveToStorage(store)
  }
}

export function getTodayTasks(): DailyTask[] {
  const tasks: DailyTask[] = []
  store.goals.forEach(goal => {
    if (goal.status !== 'active') return
    goal.phases.forEach(phase => {
      phase.weeks.forEach(week => {
        week.tasks.forEach(task => {
          if (task.date === store.currentDate && task.status === 'pending') {
            tasks.push(task)
          }
        })
      })
    })
  })
  return tasks
}

export function getOverdueTasks(): DailyTask[] {
  const tasks: DailyTask[] = []
  store.goals.forEach(goal => {
    if (goal.status !== 'active') return
    goal.phases.forEach(phase => {
      phase.weeks.forEach(week => {
        week.tasks.forEach(task => {
          if (task.date < store.currentDate && task.status === 'pending') {
            tasks.push(task)
          }
        })
      })
    })
  })
  return tasks
}

export function getWeekTasksForGoal(goalId: string): DailyTask[] {
  const goal = store.goals.find(g => g.id === goalId)
  if (!goal) return []
  
  const current = new Date(store.currentDate)
  const dayOfWeek = current.getDay()
  const weekStart = new Date(current)
  weekStart.setDate(current.getDate() - dayOfWeek)
  
  const weekStartStr = formatDate(weekStart)
  const weekEndStr = formatDate(addDays(weekStart, 6))
  
  const tasks: DailyTask[] = []
  goal.phases.forEach(phase => {
    phase.weeks.forEach(week => {
      week.tasks.forEach(task => {
        if (task.date >= weekStartStr && task.date <= weekEndStr) {
          tasks.push(task)
        }
      })
    })
  })
  
  return tasks.sort((a, b) => a.date.localeCompare(b.date))
}

export function getOverallStatistics() {
  let totalPlannedHours = 0
  let totalCompletedHours = 0
  let activeGoalsCount = 0
  let completedGoalsCount = 0
  
  store.goals.forEach(goal => {
    const stats = getGoalStatistics(goal)
    totalPlannedHours += stats.totalPlannedHours
    totalCompletedHours += stats.totalCompletedHours
    
    if (goal.status === 'active') activeGoalsCount++
    if (goal.status === 'completed') completedGoalsCount++
  })
  
  const remainingHours = totalPlannedHours - totalCompletedHours
  const completionRate = totalPlannedHours > 0 
    ? Math.round((totalCompletedHours / totalPlannedHours) * 100) 
    : 0
  
  const avgDailyHours = 8
  const remainingDays = Math.ceil(remainingHours / avgDailyHours)
  const estimatedCompletion = addDays(new Date(store.currentDate), remainingDays)
  
  return {
    totalGoals: store.goals.length,
    activeGoals: activeGoalsCount,
    completedGoals: completedGoalsCount,
    totalPlannedHours: Math.round(totalPlannedHours * 100) / 100,
    totalCompletedHours: Math.round(totalCompletedHours * 100) / 100,
    completionRate,
    remainingHours: Math.round(remainingHours * 100) / 100,
    estimatedCompletionDate: formatDate(estimatedCompletion)
  }
}
