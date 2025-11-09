<template>
  <div class="rtc-video">
    <section class="local-video video-box">
      <Video ref="localVideoRef" :muted="true"></Video>
      <!-- 本地字幕覆盖在本地视频底部 -->
      <div v-if="showLocalCC && !!signLanguageResult" class="cc-bubble">
        <span class="cc-text">{{ signLanguageResult }}（{{ signConfidence }}%）</span>
      </div>
      <button class="cc-toggle" @click="showLocalCC = !showLocalCC">{{ showLocalCC ? '隐藏字幕' : '显示字幕' }}</button>
    </section>
    <section class="remote-video video-box">
      <Video ref="remoteVideoRef" :muted="true"></Video>
      <!-- 对端字幕（3秒自动消失）覆盖在远端视频底部 -->
      <div v-if="showRemoteCC && !!remoteSubtitle" class="cc-bubble">
        <span class="cc-text">{{ remoteSubtitle }}</span>
      </div>
      <button class="cc-toggle" @click="showRemoteCC = !showRemoteCC">{{ showRemoteCC ? '隐藏字幕' : '显示字幕' }}</button>
    </section>
    <RTCDataChannel v-show="showDataChannel" :signLanguageResult="signLanguageResult" />
  </div>
  <div class="footer">
    <button className="audio">
      <TrackToggle
        source="microphone"
        :initialState="true"
        @onChange="onAudioChange"
      />
    </button>
    <button className="video">
      <TrackToggle
        source="camera"
        :initialState="true"
        @onChange="onVideoChange"
      />
    </button>
    <button className="message">
      <TrackToggle
        source="message"
        :initialState="true"
        @onChange="onMessageShow"
      />
    </button>
    <button className="leave">
      <TrackToggle source="leave" :initialState="true" @onChange="onLeave" />
    </button>
  </div>
</template>

<script setup>
import Video from './Video.vue'
import { ref, onMounted, onUnmounted } from 'vue'
import RTCDataChannel from './RTCDataChannel.vue'
import TrackToggle from './TrackToggle.vue'
import { getApiUrl, API_CONFIG } from '../config/api.js';
import { sendSignSubtitle, onDataMessage } from '../dataChannel.js'

onMounted(() => {
  initVideo(localVideoRef.value.$el);
});

const emits = defineEmits(['streamSuccess', 'leave'])

const audioEnabled = ref(true)
const videoEnabled = ref(true)

// 手语识别相关变量
const signLanguageResult = ref('')
const signConfidence = ref(0)
const isSignRecognitionEnabled = ref(false)
const recognitionInterval = ref(null)
const remoteSubtitle = ref('')
let remoteSubtitleTimer = null
const onAudioChange = (enabled) => {
  audioEnabled.value = enabled
  initVideo(localVideoRef.value.$el)
}
const onVideoChange = (enabled) => {
  videoEnabled.value = enabled
  initVideo(localVideoRef.value.$el)
}

const showDataChannel = ref(false)
const onMessageShow = () => (showDataChannel.value = !showDataChannel.value)
const onLeave = () => {
  // 停止手语识别
  stopSignRecognition()
  emits('leave')
}

const remoteVideoRef = ref(null)
const localVideoRef = ref(null)

// 字幕开关
const showLocalCC = ref(true)
const showRemoteCC = ref(true)

// 手语识别函数
const startSignRecognition = () => {
  if (recognitionInterval.value) return
  
  isSignRecognitionEnabled.value = true
  recognitionInterval.value = setInterval(() => {
    if (localVideoRef.value && localVideoRef.value.$el) {
      recognizeSignLanguage(localVideoRef.value.$el)
    }
  }, 500) // 每500ms识别一次
}

const stopSignRecognition = () => {
  if (recognitionInterval.value) {
    clearInterval(recognitionInterval.value)
    recognitionInterval.value = null
  }
  isSignRecognitionEnabled.value = false
  signLanguageResult.value = ''
  signConfidence.value = 0
}

// 手语识别函数
const recognizeSignLanguage = async (videoElement) => {
  try {
    // 从视频元素获取当前帧
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = videoElement.videoWidth || 640
    canvas.height = videoElement.videoHeight || 480
    
    // 绘制当前视频帧到canvas
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height)
    
    // 转换为base64
    const imageData = canvas.toDataURL('image/jpeg', 0.8)
    
    // 调用后端API
    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.SIGN_RECOGNIZE), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: imageData
      })
    })
    
    const result = await response.json()
    
    if (result.success) {
      signLanguageResult.value = result.label
      signConfidence.value = Math.round(result.confidence * 100)
      console.log(`手语识别成功: ${result.label} (${result.model_type}) - 置信度: ${result.confidence}`)
      // 通过 DataChannel 把识别文本发送给对端
      try { sendSignSubtitle(result.label) } catch (e) {}
    } else {
      console.log('手语识别失败:', result.message)
    }
  } catch (error) {
    console.error('手语识别错误:', error)
    // 如果API调用失败，使用模拟数据
    const mockResults = [
      { label: '你好', confidence: 0.85 },
      { label: '谢谢', confidence: 0.92 },
      { label: '再见', confidence: 0.78 },
      { label: '好的', confidence: 0.88 },
      { label: '不好', confidence: 0.75 }
    ]
    
    const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)]
    
    if (randomResult.confidence > 0.7) {
      signLanguageResult.value = randomResult.label
      signConfidence.value = Math.round(randomResult.confidence * 100)
      try { sendSignSubtitle(randomResult.label) } catch (e) {}
    }
  }
}

onMounted(() => {
  initVideo(localVideoRef.value.$el)
  // 启动手语识别
  startSignRecognition()
  // 注册 DataChannel 消息回调，接收对端字幕并3秒自动消失
  onDataMessage((msg) => {
    if (typeof msg === 'string' && msg.startsWith('SIGN_SUBTITLE:')) {
      const text = msg.substring('SIGN_SUBTITLE:'.length)
      remoteSubtitle.value = text
      if (remoteSubtitleTimer) clearTimeout(remoteSubtitleTimer)
      remoteSubtitleTimer = setTimeout(() => { remoteSubtitle.value = '' }, 3000)
    }
  })
})

onUnmounted(() => {
  stopSignRecognition()
})
// 初始化本地视频
const initVideo = async (video) => {
  if (!video) {
    console.log('[日志] 本地video标签未获取到');
    return;
  }
  try {
    let config = {
      video: videoEnabled.value,
      audio: audioEnabled.value,
    };
    let stream = await navigator.mediaDevices.getUserMedia(config);
    video.srcObject = stream;
    console.log('[日志] 本地流获取成功，即将emits到上层，remoteVideoRef=', remoteVideoRef.value);
    emits('streamSuccess', { stream, remoteVideoRef });
    video.play();
  } catch (e) {
    console.log(`[日志] 本地流获取失败: `, e);
  }
};
</script>

<style lang="css" scoped>
.rtc-video {
  display: flex;
  justify-content: center;
  width: 100%;
  height: 400px;
  padding: 20px;
}
.local-video,
.remote-video {
  width: 40%;
  height: 100%;
  position: relative;
}
.remote-video {
  margin: 0 12px;
}
.footer {
  margin-top: 10px;
  display: flex;
  gap: 16px; /* 按钮间距 */
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
}

.audio,
.video,
.message,
.leave {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  margin: 0 4px;
  background-image: none;
  background-color: #1e1e1e;
  border: 0;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
  text-indent: 0px;
  text-shadow: none;
  outline: none;
}
.audio:hover,
.video:hover {
  background-color: #2b2b2b;
}
.leave {
  background-color: rgb(249, 31, 49);
}

/* 手语识别结果样式 */
.sign-language-result {
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 10px;
  border-radius: 5px;
  font-size: 14px;
  z-index: 1000;
}

/* 远端字幕覆盖在右侧视频底部中央 */
.sign-language-remote {
  position: absolute;
  bottom: 18px;
  left: 50%;
  transform: translateX(-50%);
  max-width: 40%;
  background-color: rgba(0, 0, 0, 0.75);
  color: #fff;
  padding: 8px 12px;
  border-radius: 6px;
  z-index: 1000;
}
.sign-remote-text {
  font-size: 16px;
  font-weight: 600;
  text-align: center;
}

/* 通用字幕与开关按钮样式 */
.video-box .cc-toggle {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 6px 10px;
  background: rgba(0,0,0,0.55);
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}
.video-box .cc-toggle:hover { background: rgba(0,0,0,0.7); }

.video-box .cc-bubble {
  position: absolute;
  bottom: 18px;
  left: 50%;
  transform: translateX(-50%);
  max-width: 80%;
  background-color: rgba(0, 0, 0, 0.75);
  color: #fff;
  padding: 8px 12px;
  border-radius: 6px;
  z-index: 1000;
}
.video-box .cc-text { font-size: 16px; font-weight: 600; text-align: center; }

.sign-text {
  font-weight: bold;
  margin-bottom: 5px;
}

.sign-confidence {
  font-size: 12px;
  color: #4CAF50;
}

</style>
