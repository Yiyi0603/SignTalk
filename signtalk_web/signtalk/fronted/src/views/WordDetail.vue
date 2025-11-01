<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const word = ref(null)
const videoRef = ref(null)
const playbackRate = ref(1)
const videoLoaded = ref(false)
const loading = ref(true)

onMounted(async () => {
  const wordId = parseInt(route.params.id)
  try {
    const response = await fetch(`http://localhost:8000/api/v1/words/${wordId}/`)
    const data = await response.json()
    word.value = data
  } catch (error) {
    console.error('获取词汇详情失败:', error)
  } finally {
    loading.value = false
  }
})

const goBack = () => {
  router.back()
}

// 添加视频控制功能
const replayVideo = () => {
  if (videoRef.value) {
    videoRef.value.currentTime = 0
    videoRef.value.play()
  }
}

const toggleSpeed = () => {
  if (videoRef.value) {
    // 在 0.5x 和 1x 之间切换
    playbackRate.value = playbackRate.value === 1 ? 0.5 : 1
    videoRef.value.playbackRate = playbackRate.value
  }
}
</script>

<template>
  <div class="word-detail">
    <div class="detail-container">
      <button class="back-button" @click="goBack">
        <span class="back-icon">←</span>
        返回列表
      </button>

      <div v-if="word" class="content">
        <header class="detail-header">
          <div class="title-section">
            <div class="character">{{ word.word }}</div>
            <p class="pinyin">{{ word.pinyin }}</p>
          </div>
        </header>

        <div class="main-content">
          <div class="video-section">
            <div class="video-wrapper">
              <div class="video-container">
                <div v-if="!videoLoaded" class="video-placeholder">
                  <span class="loading-text">
                    <div class="loading-spinner"></div>
                    视频加载中...
                  </span>
                </div>
                <video
                  ref="videoRef"
                  :src="word.video_url"
                  controls
                  preload="auto"
                  :playbackRate="playbackRate"
                  @loadeddata="videoLoaded = true"
                  controlsList="nodownload"
                  class="main-video"
                />
              </div>
              <div class="video-controls">
                <button class="control-btn" @click="replayVideo">
                  <span>重复播放</span>
                </button>
                <button class="control-btn" @click="toggleSpeed">
                  <span>{{ playbackRate === 1 ? '减速播放' : '正常速度' }}</span>
                </button>
              </div>
            </div>
          </div>

          <div class="info-section">
            <!-- 保留手语描述 -->
            <div class="info-card description-card">
              <div class="card-header">
                <h2>手语描述</h2>
                <div class="card-icon">📝</div>
              </div>
              <p>{{ word.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="loading">
        <div class="loading-spinner"></div>
        <span>加载中...</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 修改布局为单列 */
.main-content {
  display: grid;
  grid-template-columns: 1fr; /* 改为单列布局 */
  gap: 2rem; /* 调整间距 */
  align-items: start;
}

/* 调整信息卡片间距 */
.info-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 2rem; /* 增加与视频区域的间距 */
}

/* 删除原学习步骤相关样式 */
.word-detail {
  padding: 1.5rem;
  width: 100%;
  min-height: 400px;
  display: flex;
  justify-content: flex-start;
}

.detail-container {
  width: 100%;
  min-width: 800px;
  max-width: 1200px;
  background: var(--color-secondary);
  border-radius: var(--radius-lg);
  padding: 2.5rem;
  box-shadow: var(--shadow-md);
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  color: var(--color-text-light);
  border: none;
  padding: 0.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 2rem;
  border-radius: var(--radius-sm);
}

.back-button:hover {
  color: var(--color-primary);
  background: rgba(59, 130, 246, 0.1);
}

.back-icon {
  font-size: 1.25rem;
}

.detail-header {
  margin-bottom: 3rem;
  text-align: center;
}

.character {
  font-size: 5rem;
  color: var(--color-text);
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 0.5rem;
}

.pinyin {
  font-size: 1.5rem;
  color: var(--color-text-light);
  margin: 0;
}

.main-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: start;
}

.video-section {
  position: sticky;
  top: 2rem;
}

.video-wrapper {
  background: var(--color-background);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
}

.video-container {
  width: 100%;
  aspect-ratio: 16/9;
  background: #000;
  border-radius: var(--radius-lg);
  overflow: hidden;
  position: relative;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-controls {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.control-btn {
  background: var(--color-secondary);
  border: 1px solid var(--color-border);
  padding: 0.75rem 1.25rem;
  border-radius: var(--radius-md);
  color: var(--color-text);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1rem;
}

.control-btn:hover {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.control-btn:active {
  transform: translateY(1px);
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
  background: #1a1a1a;
  color: #fff;
  z-index: 1;
}

.loading-text {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.main-video {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: contain;
  background: #000;
  z-index: 2;
}

/* 确保视频控件可见 */
.main-video::-webkit-media-controls {
  display: flex !important;
  opacity: 1 !important;
}

.info-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.info-card {
  background: var(--color-background);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease;
}

.info-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.card-icon {
  font-size: 1.5rem;
}

h2 {
  font-size: 1.25rem;
  color: var(--color-text);
  margin: 0;
  font-weight: 600;
}

p {
  margin: 0;
  line-height: 1.6;
  color: var(--color-text);
}

ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

li {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  line-height: 1.6;
}

li:last-child {
  margin-bottom: 0;
}

.step-number {
  width: 2rem;
  height: 2rem;
  background: var(--color-primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
  padding-top: 0.25rem;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;
  color: var(--color-text-light);
}

.loading-spinner {
  width: 2.5rem;
  height: 2.5rem;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 1200px) {
  .detail-container {
    min-width: 600px;
  }
}

@media (max-width: 900px) {
  .main-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .video-section {
    position: static;
  }

  .character {
    font-size: 4rem;
  }
}

@media (max-width: 768px) {
  .detail-container {
    padding: 1.5rem;
  }

  .character {
    font-size: 3.5rem;
  }

  .pinyin {
    font-size: 1.25rem;
  }
}

@media (max-width: 480px) {
  .word-detail {
    padding: 1rem;
  }

  .detail-container {
    padding: 1rem;
  }

  .character {
    font-size: 3rem;
  }

  .video-wrapper,
  .info-card {
    padding: 1rem;
  }

  .control-btn {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }
}
</style>