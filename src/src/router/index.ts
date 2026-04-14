import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import GoalCreateView from '../views/GoalCreateView.vue'
import GoalDetailView from '../views/GoalDetailView.vue'
import DashboardView from '../views/DashboardView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/goal/create',
      name: 'goal-create',
      component: GoalCreateView
    },
    {
      path: '/goal/:id',
      name: 'goal-detail',
      component: GoalDetailView
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView
    }
  ]
})

export default router
