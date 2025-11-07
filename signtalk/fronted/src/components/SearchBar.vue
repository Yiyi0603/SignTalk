<script setup>
import { ref } from 'vue'

const emit = defineEmits(['search'])
const searchInput = ref('')

const handleInput = () => {
  emit('search', searchInput.value)
}
</script>

<template>
  <div class="search-bar">
    <i class="search-icon">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
    </i>
    <input
      v-model="searchInput"
      type="text"
      placeholder="搜索手语..."
      @input="handleInput"
    >
  </div>
</template>

<style scoped>
.search-bar {
  position: relative;
  width: 320px;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-light);
  display: flex;
  align-items: center;
}

input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 3rem;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  font-size: 1rem;
  outline: none;
  transition: all 0.3s ease;
  background: var(--color-secondary);
  color: var(--color-text);
}

input::placeholder {
  color: var(--color-text-light);
}

input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

@media (max-width: 768px) {
  .search-bar {
    width: 100%;
  }
}
</style>