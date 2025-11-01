<template>
  <div class="home-container">
    <header class="header">
      <div class="logo-container">
        <img :src="logoSrc" alt="Logo" class="logo" />
        <span class="logo-text">Sign Talk</span>
      </div>
      <NavBar />
    </header>

    <main class="main-content">
      <div class="container">
        <header class="home-header">
          <div class="logo-section">
            <h1>手语学习</h1>
            <p class="subtitle">探索无声的语言世界</p>
          </div>
          <SearchBar @search="handleSearch" />
        </header>

        <div class="content-wrapper">
          <CategoryList
            :categories="categories"
            :selected-category="selectedCategory"
            @select="handleCategorySelect"
          />
          <router-view
            :category="selectedCategory"
            :search-query="searchQuery"
          />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import NavBar from '../components/navbar.vue'
import CategoryList from '../components/CategoryList.vue'
import SearchBar from '../components/SearchBar.vue'

// 原Learn.vue数据
const logoSrc = new URL('../assets/logo.png', import.meta.url).href;

// 原HomeView.vue数据
const categories = ref([])
const selectedCategory = ref(null)
const searchQuery = ref('')

// Learn.vue 中检查 API 地址是否以斜杠结尾
const fetchCategories = async () => {
  try {
    const response = await fetch('http://localhost:8000/api/v1/categories/');  // 去掉 ?format=json
    const data = await response.json();
    categories.value = data;
  } catch (error) {
    console.error('获取分类失败:', error);
  }
};

// 事件处理
const handleCategorySelect = (category) => {
  selectedCategory.value = category
}

const handleSearch = (query) => {
  searchQuery.value = query
}

// 生命周期钩子
onMounted(() => {
  fetchCategories()
})
</script>

<style scoped>
/* 基础布局 */
.home-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background-color: rgba(255, 255, 240, 1);
  width: 100%;
  box-sizing: border-box;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo {
  height: 40px;
}

.logo-text {
  font-size: 20px;
  font-weight: 600;
}

.main-content {
  flex: 1;
  width: 100%;
  padding: 5px 20px;
  background: var(--color-background-light);
}

/* 主页内容样式 */
.container {
  max-width: 1280px;
  margin: 0 auto;
}

.home-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 1rem 0;
}

.logo-section h1 {
  font-size: 2.5rem;
  color: var(--color-primary);
  margin-bottom: 0.5rem;
}

.subtitle {
  color: var(--color-text-secondary);
  font-size: 1.1rem;
}

.content-wrapper {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 0.8rem;
  align-items: start;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .content-wrapper {
    grid-template-columns: 1fr;
  }

  .home-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
}

@media (max-width: 768px) {
  .logo-text {
    display: none;
  }

  .home-header h1 {
    font-size: 2rem;
  }

  .main-content {
    padding: 20px 15px;
  }
}

@media (max-width: 480px) {
  .header {
    padding: 15px;
  }

  .logo {
    height: 35px;
  }

  .home-header h1 {
    font-size: 1.75rem;
  }
}
</style>