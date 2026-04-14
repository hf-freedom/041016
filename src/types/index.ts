export interface Goal {
  id: string
  name: string
  totalHours: number
  totalDays: number
  startDate: string
  createdAt: string
}

export interface Phase {
  id: string
  goalId: string
  name: string
  phaseNumber: number
  startDate: string
  endDate: string
  totalHours: number
}

export interface WeekPlan {
  id: string
  goalId: string
  phaseId: string
  weekNumber: number
  startDate: string
  endDate: string
  totalHours: number
}

export interface DayPlan {
  id: string
  goalId: string
  weekId: string
  date: string
  hours: number
  status: 'pending' | 'completed' | 'skipped'
  completedAt?: string
}

export type HandleUncompletedType = 'postpone' | 'discard'

export interface AppState {
  goals: Goal[]
  phases: Phase[]
  weekPlans: WeekPlan[]
  dayPlans: DayPlan[]
  currentDate: string
}
