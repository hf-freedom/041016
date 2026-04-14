import { Goal, Phase, WeekPlan, DailyTask, TaskStatus } from '../types'

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function parseDate(dateStr: string): Date {
  return new Date(dateStr)
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export function getDaysBetween(startDate: Date, endDate: Date): number {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
}

export function getWeekNumber(date: Date): number {
  const startOfYear = new Date(date.getFullYear(), 0, 1)
  const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000))
  return Math.ceil((days + startOfYear.getDay() + 1) / 7)
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export function calculateCompletionRate(completed: number, total: number): number {
  if (total === 0) return 0
  return Math.round((completed / total) * 100)
}

export function getTaskStatus(task: DailyTask, currentDate: string): TaskStatus {
  if (task.status === 'completed') return 'completed'
  if (task.status === 'abandoned') return 'abandoned'
  if (task.date < currentDate) return 'overdue'
  return 'pending'
}

export function splitGoalIntoPhases(
  goalName: string,
  totalHours: number,
  totalDays: number,
  startDate: Date
): Goal {
  const goalId = generateId()
  const endDate = addDays(startDate, totalDays - 1)
  
  const phasesCount = Math.max(1, Math.ceil(totalDays / 30))
  const daysPerPhase = Math.ceil(totalDays / phasesCount)
  const hoursPerPhase = totalHours / phasesCount
  
  const phases: Phase[] = []
  
  for (let i = 0; i < phasesCount; i++) {
    const phaseStartDate = addDays(startDate, i * daysPerPhase)
    const phaseEndDate = i === phasesCount - 1 
      ? endDate 
      : addDays(phaseStartDate, daysPerPhase - 1)
    
    const phaseId = generateId()
    const weeksCount = Math.ceil(getDaysBetween(phaseStartDate, phaseEndDate) / 7)
    const hoursPerWeek = hoursPerPhase / weeksCount
    
    const weeks: WeekPlan[] = []
    
    for (let w = 0; w < weeksCount; w++) {
      const weekStartDate = addDays(phaseStartDate, w * 7)
      const weekEndDate = w === weeksCount - 1 
        ? phaseEndDate 
        : addDays(weekStartDate, 6)
      
      const weekId = generateId()
      const daysInWeek = getDaysBetween(weekStartDate, weekEndDate)
      const hoursPerDay = hoursPerWeek / daysInWeek
      
      const tasks: DailyTask[] = []
      
      for (let d = 0; d < daysInWeek; d++) {
        const taskDate = addDays(weekStartDate, d)
        tasks.push({
          id: generateId(),
          goalId,
          phaseId,
          weekId,
          date: formatDate(taskDate),
          plannedHours: Math.round(hoursPerDay * 100) / 100,
          actualHours: 0,
          status: 'pending',
          description: `${goalName} - 第${i + 1}阶段 第${w + 1}周 第${d + 1}天`,
          createdAt: new Date().toISOString()
        })
      }
      
      weeks.push({
        id: weekId,
        goalId,
        phaseId,
        weekNumber: w + 1,
        startDate: formatDate(weekStartDate),
        endDate: formatDate(weekEndDate),
        plannedHours: Math.round(hoursPerWeek * 100) / 100,
        completedHours: 0,
        tasks
      })
    }
    
    phases.push({
      id: phaseId,
      goalId,
      name: `第${i + 1}阶段`,
      phaseNumber: i + 1,
      startDate: formatDate(phaseStartDate),
      endDate: formatDate(phaseEndDate),
      plannedHours: Math.round(hoursPerPhase * 100) / 100,
      completedHours: 0,
      weeks
    })
  }
  
  return {
    id: goalId,
    name: goalName,
    description: `${totalDays}天完成${totalHours}小时学习`,
    totalHours,
    totalDays,
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
    completedHours: 0,
    phases,
    createdAt: new Date().toISOString(),
    status: 'active'
  }
}

export function getGoalStatistics(goal: Goal) {
  let totalTasks = 0
  let completedTasks = 0
  let totalPlannedHours = 0
  let totalCompletedHours = 0
  
  goal.phases.forEach(phase => {
    phase.weeks.forEach(week => {
      week.tasks.forEach(task => {
        totalTasks++
        totalPlannedHours += task.plannedHours
        if (task.status === 'completed') {
          completedTasks++
          totalCompletedHours += task.actualHours
        }
      })
    })
  })
  
  return {
    totalTasks,
    completedTasks,
    totalPlannedHours,
    totalCompletedHours,
    completionRate: calculateCompletionRate(totalCompletedHours, totalPlannedHours),
    remainingHours: totalPlannedHours - totalCompletedHours
  }
}

export function getTasksForDate(goal: Goal, date: string): DailyTask[] {
  const tasks: DailyTask[] = []
  goal.phases.forEach(phase => {
    phase.weeks.forEach(week => {
      week.tasks.forEach(task => {
        if (task.date === date) {
          tasks.push(task)
        }
      })
    })
  })
  return tasks
}

export function getWeekTasks(goal: Goal, weekStartDate: string): DailyTask[] {
  const tasks: DailyTask[] = []
  goal.phases.forEach(phase => {
    phase.weeks.forEach(week => {
      if (week.startDate === weekStartDate) {
        tasks.push(...week.tasks)
      }
    })
  })
  return tasks
}
