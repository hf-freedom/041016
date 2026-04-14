import { reactive, computed } from 'vue'
import dayjs from 'dayjs'
import type { AppState, Goal, Phase, WeekPlan, DayPlan, HandleUncompletedType } from '../types'

const STORAGE_KEY = 'study-plan-data'

function loadState(): Partial<AppState> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : {}
  } catch {
    return {}
  }
}

function saveState(state: AppState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

const savedState = loadState()

const state = reactive<AppState>({
  goals: savedState.goals || [],
  phases: savedState.phases || [],
  weekPlans: savedState.weekPlans || [],
  dayPlans: savedState.dayPlans || [],
  currentDate: savedState.currentDate || dayjs().format('YYYY-MM-DD')
})

export function useStore() {
  const setCurrentDate = (date: string) => {
    state.currentDate = date
    saveState(state)
  }

  const createGoal = (name: string, totalHours: number, totalDays: number, startDate: string) => {
    const goalId = `goal-${Date.now()}`
    const goal: Goal = {
      id: goalId,
      name,
      totalHours,
      totalDays,
      startDate,
      createdAt: dayjs().toISOString()
    }
    state.goals.push(goal)
    splitGoal(goal)
    saveState(state)
  }

  const splitGoal = (goal: Goal) => {
    const phaseCount = Math.ceil(goal.totalDays / 30)
    const weekCount = Math.ceil(goal.totalDays / 7)
    const hoursPerDay = goal.totalHours / goal.totalDays
    
    for (let i = 0; i < phaseCount; i++) {
      const phaseStart = dayjs(goal.startDate).add(i * 30, 'day')
      const phaseEnd = dayjs(phaseStart).add(29, 'day')
      const phaseDays = Math.min(30, dayjs(goal.startDate).add(goal.totalDays - 1, 'day').diff(phaseStart, 'day') + 1)
      const phase: Phase = {
        id: `phase-${goal.id}-${i}`,
        goalId: goal.id,
        name: `阶段${i + 1}`,
        phaseNumber: i + 1,
        startDate: phaseStart.format('YYYY-MM-DD'),
        endDate: phaseEnd.format('YYYY-MM-DD'),
        totalHours: Math.round(hoursPerDay * phaseDays * 10) / 10
      }
      state.phases.push(phase)
    }

    for (let i = 0; i < weekCount; i++) {
      const weekStart = dayjs(goal.startDate).add(i * 7, 'day')
      const weekEnd = dayjs(weekStart).add(6, 'day')
      const weekDays = Math.min(7, dayjs(goal.startDate).add(goal.totalDays - 1, 'day').diff(weekStart, 'day') + 1)
      const phaseId = `phase-${goal.id}-${Math.floor(i / 4)}`
      const weekPlan: WeekPlan = {
        id: `week-${goal.id}-${i}`,
        goalId: goal.id,
        phaseId,
        weekNumber: i + 1,
        startDate: weekStart.format('YYYY-MM-DD'),
        endDate: weekEnd.format('YYYY-MM-DD'),
        totalHours: Math.round(hoursPerDay * weekDays * 10) / 10
      }
      state.weekPlans.push(weekPlan)

      for (let d = 0; d < weekDays; d++) {
        const dayDate = dayjs(weekStart).add(d, 'day')
        const dayPlan: DayPlan = {
          id: `day-${goal.id}-${i}-${d}`,
          goalId: goal.id,
          weekId: weekPlan.id,
          date: dayDate.format('YYYY-MM-DD'),
          hours: Math.round(hoursPerDay * 10) / 10,
          status: 'pending'
        }
        state.dayPlans.push(dayPlan)
      }
    }
  }

  const markDayComplete = (dayPlanId: string, completed: boolean) => {
    const dayPlan = state.dayPlans.find(d => d.id === dayPlanId)
    if (dayPlan) {
      if (completed) {
        dayPlan.status = 'completed'
        dayPlan.completedAt = dayjs().toISOString()
      } else {
        dayPlan.status = 'pending'
      }
      saveState(state)
    }
  }

  const handleUncompleted = (dayPlanId: string, handleType: HandleUncompletedType) => {
    const dayPlan = state.dayPlans.find(d => d.id === dayPlanId)
    if (!dayPlan) return

    if (handleType === 'discard') {
      dayPlan.status = 'skipped'
    } else if (handleType === 'postpone') {
      const goalId = dayPlan.goalId
      const fromDate = dayPlan.date
      
      const affectedPlans = state.dayPlans.filter(d => 
        d.goalId === goalId && 
        d.date >= fromDate
      ).sort((a, b) => dayjs(b.date).diff(dayjs(a.date)))
      
      for (const plan of affectedPlans) {
        const newDate = dayjs(plan.date).add(1, 'day').format('YYYY-MM-DD')
        plan.date = newDate
      }

      const affectedWeeks = state.weekPlans.filter(w =>
        w.goalId === goalId &&
        w.startDate >= fromDate
      )
      
      for (const week of affectedWeeks) {
        week.startDate = dayjs(week.startDate).add(1, 'day').format('YYYY-MM-DD')
        week.endDate = dayjs(week.endDate).add(1, 'day').format('YYYY-MM-DD')
      }

      const affectedPhases = state.phases.filter(p =>
        p.goalId === goalId &&
        p.startDate >= fromDate
      )
      
      for (const phase of affectedPhases) {
        phase.startDate = dayjs(phase.startDate).add(1, 'day').format('YYYY-MM-DD')
        phase.endDate = dayjs(phase.endDate).add(1, 'day').format('YYYY-MM-DD')
      }
      
      const goal = state.goals.find(g => g.id === goalId)
      if (goal) {
        goal.totalDays += 1
      }
    }
    saveState(state)
  }

  const deleteGoal = (goalId: string) => {
    state.goals = state.goals.filter(g => g.id !== goalId)
    state.phases = state.phases.filter(p => p.goalId !== goalId)
    state.weekPlans = state.weekPlans.filter(w => w.goalId !== goalId)
    state.dayPlans = state.dayPlans.filter(d => d.goalId !== goalId)
    saveState(state)
  }

  const getGoalStats = computed(() => {
    const totalHours = state.dayPlans.reduce((sum, d) => sum + d.hours, 0)
    const completedHours = state.dayPlans.filter(d => d.status === 'completed').reduce((sum, d) => sum + d.hours, 0)
    const remainingHours = state.dayPlans.filter(d => d.status === 'pending').reduce((sum, d) => sum + d.hours, 0)
    const completionRate = totalHours > 0 ? Math.round((completedHours / totalHours) * 100) : 0
    const pendingDays = state.dayPlans
      .filter(d => d.status === 'pending')
      .sort((a, b) => dayjs(a.date).diff(dayjs(b.date)))
    
    const avgHoursPerDay = completedHours > 0 
      ? completedHours / state.dayPlans.filter(d => d.status === 'completed').length 
      : 2

    const remainingDays = Math.ceil(remainingHours / avgHoursPerDay)
    const estimatedEndDate = pendingDays.length > 0 
      ? dayjs(pendingDays[0].date).add(remainingDays - 1, 'day').format('YYYY-MM-DD')
      : dayjs(state.currentDate).format('YYYY-MM-DD')

    return {
      totalHours: Math.round(totalHours * 10) / 10,
      completedHours: Math.round(completedHours * 10) / 10,
      remainingHours: Math.round(remainingHours * 10) / 10,
      completionRate,
      estimatedEndDate
    }
  })

  const getDayPlansByDate = (date: string) => {
    return state.dayPlans.filter(d => d.date === date)
  }

  const getWeekPlans = () => {
    const weekStart = dayjs(state.currentDate).startOf('week')
    const days = []
    for (let i = 0; i < 7; i++) {
      const date = dayjs(weekStart).add(i, 'day').format('YYYY-MM-DD')
      days.push({
        date,
        plans: getDayPlansByDate(date),
        isToday: date === state.currentDate
      })
    }
    return days
  }

  return {
    state,
    createGoal,
    markDayComplete,
    handleUncompleted,
    deleteGoal,
    setCurrentDate,
    getGoalStats,
    getDayPlansByDate,
    getWeekPlans
  }
}
