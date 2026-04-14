export type TaskStatus = 'pending' | 'completed' | 'skipped' | 'postponed'

export interface DailyTask {
  id: string
  date: string
  hours: number
  status: TaskStatus
  completedHours: number
}

export interface WeeklyPlan {
  id: string
  weekNumber: number
  startDate: string
  endDate: string
  totalHours: number
  completedHours: number
  dailyTasks: DailyTask[]
}

export interface Stage {
  id: string
  name: string
  startDate: string
  endDate: string
  totalHours: number
  completedHours: number
  weeklyPlans: WeeklyPlan[]
}

export interface Goal {
  id: string
  name: string
  description: string
  totalHours: number
  completedHours: number
  startDate: string
  endDate: string
  dailyHours: number
  stages: Stage[]
  createdAt: string
}

export interface PendingTask {
  task: DailyTask
  goalId: string
  stageId: string
  weekId: string
}
