<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps({
  category: {
    type: Object,
    default: null
  },
  searchQuery: {
    type: String,
    default: ''
  }
})

const words = ref([])
const loading = ref(false)
const pagination = ref({
  count: 0,
  next: null,
  previous: null
})

// WordList.vue 中修改 fetchWords 函数
const fetchWords = async (url = null) => {
  loading.value = true;
  try {
    if (!url) {
      const params = new URLSearchParams();

      // 关键修改：参数名改为 category（与后端 filterset_fields 一致）
      if (props.category) {
        params.append('category', props.category.id);  // 原 category_id 改为 category
      }

      if (props.searchQuery) {
        params.append('search', props.searchQuery);
      }

      url = `http://172.20.10.5:8000/api/v1/words/?${params.toString()}`;
    }

    const response = await fetch(url);
    const data = await response.json();
    words.value = data;
  } catch (error) {
    console.error('获取词汇失败:', error);
  } finally {
    loading.value = false;
  }
};

// 加载更多数据
const loadMore = async () => {
  if (pagination.value.next) {
    const currentWords = [...words.value]
    await fetchWords(pagination.value.next)
    words.value = [...currentWords, ...words.value]
  }
}

// 监听分类和搜索条件变化
watch(() => props.category, (newVal) => {
  console.log('分类变化:', newVal)
  fetchWords()
}, { immediate: true })

watch(() => props.searchQuery, (newVal) => {
  console.log('搜索词变化:', newVal)
  fetchWords()
})

function goToDetail(word) {
  router.push(`/learn/words/${word.id}`)
}
</script>

<template>
  <div class="word-list">
    <div class="content-container">
      <div class="list-container">
        <!-- 加载状态 -->
        <div v-if="loading && !words.length" class="loading">
          <div class="loading-spinner"></div>
          <span>加载中...</span>
        </div>

        <!-- 空状态 -->
        <div v-else-if="!category && !searchQuery" class="empty-state">
          <div class="empty-icon">👋</div>
          <h3>开始学习手语</h3>
          <p>请选择一个类别或搜索感兴趣的手语</p>
        </div>

        <!-- 无搜索结果 -->
        <div v-else-if="words.length === 0" class="empty-state">
          <div class="empty-icon">🔍</div>
          <h3>未找到结果</h3>
          <p>请尝试其他搜索条件</p>
        </div>

        <!-- 词汇列表 -->
        <template v-else>
          <div class="video-grid">
            <div
              v-for="word in words"
              :key="word.id"
              class="video-item"
              @click="goToDetail(word)"
            >
              <div class="thumbnail">
                <div class="video-placeholder">
                  <span class="placeholder-text">视频封面</span>
                </div>
                <video
                  :src="word.video_url"
                  preload="metadata"
                />
                <div class="play-overlay">
                  <div class="play-icon">▶</div>
                </div>
              </div>
              <div class="video-info">
                <h3 class="video-title">{{ word.word }}</h3>
              </div>
            </div>
          </div>

          <!-- 加载更多按钮 -->
          <div v-if="pagination.next" class="load-more">
            <button
              class="load-more-btn"
              :disabled="loading"
              @click="loadMore"
            >
              <span v-if="loading">加载中...</span>
              <span v-else>加载更多</span>
            </button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.word-list {
  padding: 1rem;
  width: 100%;
  min-height: 400px;
  display: flex;
  justify-content: flex-start;
  margin-left: 0;
}

.content-container {
  width: 100%;
  min-width: 800px;
  max-width: 1200px;
}

.list-container {
  width: 100%;
  min-height: 400px;
  background: var(--color-secondary);
  border-radius: var(--radius-lg);
  padding: 2rem;
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 1rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  margin: 2rem auto;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: var(--color-text);
}

.empty-state p {
  color: var(--color-text-light);
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  width: 100%;
}

.video-item {
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--color-secondary);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
}

.video-item:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.thumbnail {
  position: relative;
  width: 100%;
  aspect-ratio: 4/3;
  background: #f1f5f9;
  overflow: hidden;
}

.video-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e2e8f0;
}

.placeholder-text {
  color: #94a3b8;
  font-size: 0.875rem;
}

.thumbnail video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.play-icon {
  color: white;
  font-size: 2rem;
  background: rgba(0, 0, 0, 0.5);
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-item:hover .play-overlay {
  opacity: 1;
}

.video-info {
  padding: 1.25rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.video-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text);
  text-align: center;
  line-height: 1.4;
}

@media (max-width: 1200px) {
  .content-container {
    min-width: 600px;
  }

  .video-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .word-list {
    padding: 1rem;
  }

  .content-container {
    min-width: unset;
  }

  .list-container {
    padding: 1rem;
    position: static;
  }

  .video-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }

  .empty-state {
    margin: 1rem auto;
    padding: 2rem 1.5rem;
    height: 250px;
  }
}

@media (max-width: 480px) {
  .video-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .empty-state {
    padding: 1.5rem 1rem;
    height: 200px;
  }
}

.load-more {
  margin-top: 2rem;
  text-align: center;
}

.load-more-btn {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: var(--radius-md);
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.load-more-btn:hover {
  background: var(--color-primary-light);
}

.load-more-btn:disabled {
  background: var(--color-text-light);
  cursor: not-allowed;
}
</style>