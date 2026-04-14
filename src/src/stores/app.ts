import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', () => {
  const currentDate = ref<Date>(new Date())

  function setCurrentDate(date: Date) {
    currentDate.value = date
  }

  return {
    currentDate,
    setCurrentDate
  }
})
