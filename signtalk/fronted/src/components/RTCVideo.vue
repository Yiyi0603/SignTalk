<template>
  <div class="rtc-video">
    <section class="local-video">
      <Video ref="localVideoRef"></Video>
    </section>
    <section class="remote-videos-container">
      <!-- 动态创建多个远程视频 -->
      <div 
        v-for="(remoteVideo, socketId) in remoteVideos" 
        :key="socketId" 
        class="remote-video-item"
      >
        <Video :ref="el => setRemoteVideoRef(el, socketId)"></Video>
        <div class="remote-video-label">{{ remoteVideo.username }}</div>
      </div>
      <!-- 向后兼容：如果没有使用多peer模式，显示单个远程视频 -->
      <div v-if="!useMultiPeer && Object.keys(remoteVideos).length === 0" class="remote-video-item">
        <Video ref="remoteVideoRef"></Video>
      </div>
    </section>
    <RTCDataChannel v-show="showDataChannel" />
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

  <div class="results-container">
    <div class="result local-result" v-if="localResultText">
      <span class="result-label">本地识别：</span>{{ localResultText }}
    </div>
    <div class="result remote-result" v-if="remoteResultText">
      <span class="result-label">对方识别：</span>{{ remoteResultText }}
    </div>
  </div>
</template>

<script setup>
import Video from './Video.vue'
import { ref, onMounted } from 'vue'
import RTCDataChannel from './RTCDataChannel.vue'
import TrackToggle from './TrackToggle.vue'
import { yiyu } from "https://avatar.gbqr.net/avatar.js";
import { onBeforeUnmount } from 'vue';
import { API_ENDPOINTS } from '../config/api';

// 添加组件卸载时的清理逻辑
onBeforeUnmount(() => {
  yiyu.disableYiyuApp();
  console.log('RTCVideo组件卸载，清理数字人');
});

// 修改初始化逻辑确保只在当前实例生效
const initYiyu = () => {
  console.log('=== RTCVideo 组件：初始化 Yiyu ===')
  yiyu.init({
    name: 'NAw0AN2yAnci79YOyaOGovl3dwfQaHUyZoUz1MOwTDxeMTTd+3xlszQR1qpbNa7GOrTwGWnFyAWf3PqJecXHBare9dwOpcmHDe4jWdOhEAl3bwghnrxCUDW61fO/sJuT82ZJUQNI9GgqUcrfLOZf0QJjtDPycZWXgsAMt7t35Cc=',
    readLocalResource: false
  });
  yiyu.enableYiyuApp(); // 显式启用数字人
  yiyu.setSize(500, 500); // 设置合适尺寸
}

onMounted(() => {
  console.log('=== RTCVideo 组件已挂载 ===')
  initYiyu(); // 在挂载时初始化
  console.log('=== 开始初始化本地视频 ===', { localVideoRef: !!localVideoRef.value, hasEl: !!(localVideoRef.value && localVideoRef.value.$el) })
  initVideo(localVideoRef.value.$el);
});

const emits = defineEmits(['streamSuccess', 'leave'])

const audioEnabled = ref(true)
const videoEnabled = ref(true)
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
  stopRecognitionLoop()
  // 清理所有远程视频
  remoteVideos.value = {}
  emits('leave')
}

// 管理多个远程视频（key为socketId）
const remoteVideos = ref({})
const remoteVideoRefs = ref({})
const useMultiPeer = ref(true) // 是否使用多peer模式

// 向后兼容的单远程视频引用
const remoteVideoRef = ref(null)

// 设置远程视频引用
const setRemoteVideoRef = (el, socketId) => {
  if (el) {
    remoteVideoRefs.value[socketId] = el
  }
}

// 处理远程流的回调函数（提供给socket.js）
const handleRemoteStream = (stream, socketId, username) => {
  // 如果stream为null，表示需要清理该远程视频
  if (!stream) {
    console.log('=== [RTCVideo] 清理远程视频 ===', {
      socketId,
      timestamp: new Date().toISOString()
    })
    if (remoteVideos.value[socketId]) {
      const videoRef = remoteVideoRefs.value[socketId]
      if (videoRef && videoRef.$el) {
        videoRef.$el.srcObject = null
      }
      delete remoteVideos.value[socketId]
      delete remoteVideoRefs.value[socketId]
    }
    return
  }
  
  console.log('=== [RTCVideo] 收到远程流 ===', {
    socketId,
    username,
    streamId: stream.id,
    timestamp: new Date().toISOString()
  })
  
  // 如果远程视频还不存在，创建新的
  if (!remoteVideos.value[socketId]) {
    remoteVideos.value[socketId] = {
      username: username || `用户${socketId.substring(0, 6)}`,
      stream: null
    }
  } else {
    // 更新用户名（如果提供）
    if (username) {
      remoteVideos.value[socketId].username = username
    }
  }
  
  // 等待DOM更新后设置视频流
  setTimeout(() => {
    const videoRef = remoteVideoRefs.value[socketId]
    if (videoRef && videoRef.$el) {
      const video = videoRef.$el
      video.srcObject = stream
      remoteVideos.value[socketId].stream = stream
      
      video.play().catch(err => {
        if (err.name !== 'AbortError') {
          console.warn('=== [RTCVideo] 播放远程视频失败 ===', { socketId, err })
        }
      })
      
      // 触发远程视频流就绪事件
      video.dispatchEvent(new CustomEvent('remoteStreamReady', { 
        detail: { socketId, username } 
      }))
      
      console.log('=== [RTCVideo] 远程视频已设置 ===', {
        socketId,
        username,
        timestamp: new Date().toISOString()
      })
    } else {
      console.warn('=== [RTCVideo] 找不到视频元素 ===', { socketId })
    }
  }, 100)
}

const localVideoRef = ref(null)
onMounted(() => initVideo(localVideoRef.value.$el))

// 用于存储清理函数
let remoteVideoCleanup = null

// 监听远程视频流建立
const watchRemoteVideo = () => {
  // 先清理之前的监听器
  if (remoteVideoCleanup) {
    remoteVideoCleanup()
    remoteVideoCleanup = null
  }
  
  if (!remoteVideoRef.value || !remoteVideoRef.value.$el) {
    // 如果还没有远程视频元素，延迟重试
    setTimeout(() => watchRemoteVideo(), 1000)
    return
  }
  
  const remoteVideo = remoteVideoRef.value.$el
  
  // 启动远程视频识别的函数
  const startRemoteRecognition = () => {
    if (remoteVideo.srcObject && remoteVideo.readyState >= 2) {
      console.log('远程视频流已建立，启动远程视频识别')
      // 停止之前的循环（如果有）
      stopRemoteRecognitionLoop()
      // 延迟一小段时间确保视频完全准备好
      setTimeout(() => {
        startRemoteRecognitionLoop()
      }, 500)
    }
  }
  
  // 监听自定义事件（从socket.js触发）
  const handleRemoteStreamReady = () => {
    console.log('收到远程视频流就绪事件')
    startRemoteRecognition()
  }
  
  // 监听canplay事件
  const handleCanPlay = () => {
    console.log('远程视频canplay事件')
    startRemoteRecognition()
  }
  
  // 添加事件监听器
  remoteVideo.addEventListener('remoteStreamReady', handleRemoteStreamReady)
  remoteVideo.addEventListener('canplay', handleCanPlay)
  remoteVideo.addEventListener('loadedmetadata', handleCanPlay)
  
  // 如果远程视频已经准备好了，直接启动识别
  if (remoteVideo.srcObject && remoteVideo.readyState >= 2) {
    startRemoteRecognition()
  } else {
    // 定期检查远程视频是否准备好
    const checkInterval = setInterval(() => {
      if (remoteVideo.srcObject && remoteVideo.readyState >= 2) {
        clearInterval(checkInterval)
        startRemoteRecognition()
      }
    }, 500)
    
    // 保存清理间隔的引用
    setTimeout(() => clearInterval(checkInterval), 10000) // 10秒后停止检查
  }
  
  // 保存清理函数
  remoteVideoCleanup = () => {
    remoteVideo.removeEventListener('remoteStreamReady', handleRemoteStreamReady)
    remoteVideo.removeEventListener('canplay', handleCanPlay)
    remoteVideo.removeEventListener('loadedmetadata', handleCanPlay)
  }
}

// 初始化本地视频
const initVideo = async (video) => {
  if (!video) {
    console.log('=== [RTCVideo] initVideo: 视频元素不存在 ===', {
      timestamp: new Date().toISOString()
    })
    return
  }
  try {
    // getUserMedia 仅在安全上下文可用（HTTPS 或 http://localhost）
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error('=== [RTCVideo] MediaDevices API 不可用 ===', {
        hasMediaDevices: !!navigator.mediaDevices,
        hasGetUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
        protocol: window.location.protocol,
        host: window.location.host,
        timestamp: new Date().toISOString()
      })
      return
    }
    let config = {
      video: videoEnabled.value,
      audio: audioEnabled.value,
    }
    // userMediaConfig ,getDisplayMedia共享屏幕
    console.log('=== [RTCVideo] 开始获取本地媒体流 ===', {
      config: config,
      timestamp: new Date().toISOString()
    })
    let stream = await navigator.mediaDevices.getUserMedia(config)
    console.log('=== [RTCVideo] 本地媒体流获取成功 ===', { 
      videoTracks: stream.getVideoTracks().length, 
      audioTracks: stream.getAudioTracks().length,
      videoTrackInfo: stream.getVideoTracks().map(t => ({
        id: t.id,
        enabled: t.enabled,
        readyState: t.readyState,
        label: t.label
      })),
      audioTrackInfo: stream.getAudioTracks().map(t => ({
        id: t.id,
        enabled: t.enabled,
        readyState: t.readyState,
        label: t.label
      })),
      hasRemoteVideoRef: !!remoteVideoRef,
      streamId: stream.id,
      active: stream.active,
      timestamp: new Date().toISOString()
    })
    video.srcObject = stream
    console.log('=== [RTCVideo] 本地视频 srcObject 已设置 ===', {
      videoReadyState: video.readyState,
      timestamp: new Date().toISOString()
    })
    console.log('=== [RTCVideo] 触发 streamSuccess 事件 ===', {
      hasStream: !!stream,
      hasRemoteVideoRef: !!remoteVideoRef,
      hasOnRemoteStream: !!handleRemoteStream,
      timestamp: new Date().toISOString()
    })
    emits('streamSuccess', { 
      stream, 
      remoteVideoRef,
      onRemoteStream: handleRemoteStream // 传递回调函数给父组件
    })
    console.log('=== [RTCVideo] streamSuccess 事件已触发 ===', {
      timestamp: new Date().toISOString()
    })
    // 添加错误处理，防止 AbortError
    video.play().then(() => {
      console.log('=== [RTCVideo] 本地视频播放成功 ===', {
        paused: video.paused,
        currentTime: video.currentTime,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
        timestamp: new Date().toISOString()
      })
    }).catch(error => {
      // 忽略 AbortError，这通常发生在 srcObject 被改变时
      if (error.name !== 'AbortError') {
        console.warn('=== [RTCVideo] 播放本地视频失败 ===', {
          error: error.name,
          message: error.message,
          timestamp: new Date().toISOString()
        })
      }
    })
    if (videoEnabled.value) {
      console.log('=== [RTCVideo] 启动本地视频识别循环 ===', {
        timestamp: new Date().toISOString()
      })
      startLocalRecognitionLoop()
      // 监听远程视频流建立（延迟一点确保remoteVideoRef已经传递）
      setTimeout(() => {
        console.log('=== [RTCVideo] 开始监听远程视频 ===', {
          timestamp: new Date().toISOString()
        })
        watchRemoteVideo()
      }, 500)
    }
  } catch (e) {
    console.error('=== [RTCVideo] 获取本地媒体流失败 ===', {
      error: e.name,
      message: e.message,
      stack: e.stack,
      timestamp: new Date().toISOString()
    })
    // 常见错误：用户拒绝、没有设备、权限被浏览器策略限制等
    // 这里不抛出以免中断其他逻辑
  }
}

// --- 手语识别：循环抓帧调用后端 ---
const recognizingLocal = ref(false)
const recognizingRemote = ref(false)
const localResultText = ref('')
const remoteResultText = ref('')
const localLoopTimer = ref(null)
const remoteLoopTimer = ref(null)

// 启动本地视频识别循环
const startLocalRecognitionLoop = () => {
  stopLocalRecognitionLoop()
  localLoopTimer.value = setInterval(captureAndRecognizeLocal, 800) // 每 800ms 一次
}

// 启动远程视频识别循环
const startRemoteRecognitionLoop = () => {
  stopRemoteRecognitionLoop()
  remoteLoopTimer.value = setInterval(captureAndRecognizeRemote, 800) // 每 800ms 一次
}

// 停止本地视频识别循环
const stopLocalRecognitionLoop = () => {
  if (localLoopTimer.value) {
    clearInterval(localLoopTimer.value)
    localLoopTimer.value = null
  }
}

// 停止远程视频识别循环
const stopRemoteRecognitionLoop = () => {
  if (remoteLoopTimer.value) {
    clearInterval(remoteLoopTimer.value)
    remoteLoopTimer.value = null
  }
}

// 统一停止所有识别循环
const stopRecognitionLoop = () => {
  stopLocalRecognitionLoop()
  stopRemoteRecognitionLoop()
}

onBeforeUnmount(() => {
  stopRecognitionLoop()
  if (remoteVideoCleanup) {
    remoteVideoCleanup()
    remoteVideoCleanup = null
  }
})

// 识别本地视频
const captureAndRecognizeLocal = async () => {
  if (recognizingLocal.value) return
  if (!videoEnabled.value) return
  if (!localVideoRef.value || !localVideoRef.value.$el) return
  const video = localVideoRef.value.$el
  if (!video.srcObject) return
  recognizingLocal.value = true
  try {
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const dataUrl = canvas.toDataURL('image/jpeg')
    const base64 = dataUrl.split(',')[1]

    const resp = await fetch(`${API_ENDPOINTS.signRecognition}recognize/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_data: base64 })
    })
    const data = await resp.json()
    if (data && data.success) {
      const conf = (data.confidence !== undefined && data.confidence !== null)
        ? Number(data.confidence).toFixed(2)
        : 'N/A'
      localResultText.value = `${data.label} (置信度: ${conf})`
    } else if (data) {
      localResultText.value = data.message ? `识别失败: ${data.message}` : '识别失败'
    }
  } catch (err) {
    // 静默失败，避免刷屏
    console.error('本地识别错误:', err)
  } finally {
    recognizingLocal.value = false
  }
}

// 识别远程视频（新增功能，使双方都能看到识别结果）
const captureAndRecognizeRemote = async () => {
  if (recognizingRemote.value) return
  if (!remoteVideoRef.value || !remoteVideoRef.value.$el) return
  const video = remoteVideoRef.value.$el
  if (!video.srcObject) return
  // 检查远程视频是否已准备好
  if (video.readyState !== 4 || video.videoWidth === 0 || video.videoHeight === 0) return
  
  recognizingRemote.value = true
  try {
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const dataUrl = canvas.toDataURL('image/jpeg')
    const base64 = dataUrl.split(',')[1]

    const resp = await fetch(`${API_ENDPOINTS.signRecognition}recognize/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_data: base64 })
    })
    const data = await resp.json()
    if (data && data.success) {
      const conf = (data.confidence !== undefined && data.confidence !== null)
        ? Number(data.confidence).toFixed(2)
        : 'N/A'
      remoteResultText.value = `${data.label} (置信度: ${conf})`
    } else if (data) {
      remoteResultText.value = data.message ? `识别失败: ${data.message}` : '识别失败'
    }
  } catch (err) {
    // 静默失败，避免刷屏
    console.error('远程识别错误:', err)
  } finally {
    recognizingRemote.value = false
  }
}
</script>

<style lang="css" scoped>
.rtc-video {
  display: flex;
  justify-content: center;
  width: 100%;
  height: 400px;
  padding: 20px;
  gap: 12px;
}
.local-video {
  width: 40%;
  height: 100%;
}
.remote-videos-container {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  width: 60%;
  height: 100%;
  overflow-y: auto;
}
.remote-video-item {
  position: relative;
  width: calc(50% - 6px);
  height: calc(50% - 6px);
  min-width: 200px;
  min-height: 150px;
}
.remote-video-label {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 8px;
  font-size: 12px;
  text-align: center;
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

.recognize {
  background-color: #2563eb;
  color: #fff;
}

.results-container {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 20px;
}

.result {
  text-align: center;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
}

.local-result {
  background-color: #1e3a8a;
  color: #fff;
}

.remote-result {
  background-color: #059669;
  color: #fff;
}

.result-label {
  font-weight: bold;
  margin-right: 8px;
}

</style>
