export type TaskStatus = 'pending' | 'completed' | 'overdue' | 'abandoned'

export type TaskAction = 'postpone' | 'abandon'

export interface DailyTask {
  id: string
  goalId: string
  phaseId: string
  weekId: string
  date: string
  plannedHours: number
  actualHours: number
  status: TaskStatus
  description: string
  createdAt: string
  completedAt?: string
}

export interface WeekPlan {
  id: string
  goalId: string
  phaseId: string
  weekNumber: number
  startDate: string
  endDate: string
  plannedHours: number
  completedHours: number
  tasks: DailyTask[]
}

export interface Phase {
  id: string
  goalId: string
  name: string
  phaseNumber: number
  startDate: string
  endDate: string
  plannedHours: number
  completedHours: number
  weeks: WeekPlan[]
}

export interface Goal {
  id: string
  name: string
  description: string
  totalHours: number
  totalDays: number
  startDate: string
  endDate: string
  completedHours: number
  phases: Phase[]
  createdAt: string
  status: 'active' | 'completed' | 'abandoned'
}

export interface Statistics {
  totalGoals: number
  activeGoals: number
  completedGoals: number
  totalPlannedHours: number
  totalCompletedHours: number
  completionRate: number
  remainingHours: number
  estimatedCompletionDate: string
}

export interface AppState {
  goals: Goal[]
  currentDate: string
  selectedGoalId: string | null
}
