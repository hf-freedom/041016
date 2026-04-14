<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStore } from '../store'

const store = useStore()
const showModal = ref(false)
const tempDate = ref('')

const currentDate = computed(() => store.state.currentDate)

const openModal = () => {
  tempDate.value = currentDate.value
  showModal.value = true
}

const saveDate = () => {
  store.setCurrentDate(tempDate.value)
  showModal.value = false
}
</script>

<template>
  <div class="date-setting">
    <button @click="openModal" class="btn btn-secondary" style="padding: 6px 12px; font-size: 13px;">
      📅 设置今天: {{ currentDate }}
    </button>

    <div v-if="showModal" class="modal-overlay" @click="showModal = false">
      <div class="modal-content" @click.stop>
        <h3 style="margin-bottom: 20px;">设置当前日期</h3>
        <p style="margin-bottom: 16px; color: #6b7280; font-size: 14px;">
          可以将任意日期设置为"今天"，方便回溯或提前规划
        </p>
        <input
          v-model="tempDate"
          type="date"
          style="width: 100%; margin-bottom: 20px;"
        />
        <div style="display: flex; gap: 12px; justify-content: flex-end;">
          <button @click="showModal = false" class="btn btn-secondary">取消</button>
          <button @click="saveDate" class="btn btn-primary">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.date-setting {
  position: relative;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 24px;
  width: 400px;
  max-width: 90%;
}
</style>
