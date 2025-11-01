<script setup>
defineProps({
  categories: {
    type: Array,
    required: true,
    default: () => []
  },
  selectedCategory: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['select'])
</script>

<template>
  <div class="category-list">
    <h2>手语类别</h2>
    <ul>
      <li
        v-for="category in categories"
        :key="category?.id || category?.pk"
        :class="{ active: selectedCategory?.id === (category?.id || category?.pk) }"
        @click="emit('select', category)"
      >
        {{ category?.name || category?.fields?.name }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
.category-list {
  background: var(--color-secondary);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--color-border);
  height: fit-content;
}

h2 {
  font-size: 1.25rem;
  margin-bottom: 1.5rem;
  color: var(--color-text);
  font-weight: 600;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-border);
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

li {
  padding: 0.875rem 1.25rem;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  color: var(--color-text);
  background: transparent;
}

li:hover {
  background: var(--color-background);
  color: var(--color-primary);
}

li.active {
  background: #e6f5ea; /* 浅绿色 */
  color: #2b5938;      /* 深绿色字体 */
  font-weight: 600;
}


li.active:hover {
  background: var(--color-primary-light);
  color: white;
}
</style>