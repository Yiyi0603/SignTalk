<template>
  <!-- <header class="header">一对一音视频聊天</header> -->
  <main class="main">
    <RTCVideo @streamSuccess="streamSuccess" @leave="leave" v-if="showRTCVideo" />
    <Login @join="handleJoin" v-else />
  </main>
</template>

<script setup>
import 'ant-design-vue/dist/reset.css'
import RTCVideo from '../components/RTCVideo.vue'
import Login from '../components/Login.vue'
import { ref } from 'vue'
import initSocket from '../socket'
import adapter from 'webrtc-adapter';
import { yiyu } from "https://avatar.gbqr.net/avatar.js";
import { onBeforeUnmount } from 'vue';

let userInfo = {}
let socket

const showRTCVideo = ref(false)
const handleJoin = (user) => {
  console.log('=== [Contact] 用户加入房间 ===', {
    user: user,
    username: user.username,
    room: user.room,
    previousRoom: userInfo.room,
    hasExistingSocket: !!socket,
    socketConnected: socket?.connected,
    timestamp: new Date().toISOString()
  })
  
  // 如果切换房间或已有连接，先断开旧连接
  if (socket) {
    const shouldDisconnect = socket.connected || 
                            userInfo.room !== user.room || 
                            userInfo.username !== user.username
    
    if (shouldDisconnect) {
      console.log('=== [Contact] 检测到需要断开旧连接 ===', {
        previousRoom: userInfo.room,
        previousUsername: userInfo.username,
        newRoom: user.room,
        newUsername: user.username,
        socketConnected: socket.connected,
        timestamp: new Date().toISOString()
      })
      // 强制断开，不自动重连
      socket.disconnect(true)
      socket = null
      
      // 等待一小段时间确保断开完成
      setTimeout(() => {
        showRTCVideo.value = true
        userInfo = user
        console.log('=== [Contact] showRTCVideo 已设置为 true ===', {
          timestamp: new Date().toISOString()
        })
      }, 100)
      return
    }
  }
  
  showRTCVideo.value = true
  userInfo = user
  console.log('=== [Contact] showRTCVideo 已设置为 true ===', {
    timestamp: new Date().toISOString()
  })
}
// 等待本地视频初始化完成后发送信令服务
const streamSuccess = ({ stream, remoteVideoRef, onRemoteStream }) => {
  console.log('=== [Contact] streamSuccess 被调用 ===', { 
    userInfo: userInfo,
    hasStream: !!stream,
    hasRemoteVideoRef: !!remoteVideoRef,
    hasOnRemoteStream: !!onRemoteStream,
    streamId: stream?.id,
    streamActive: stream?.active,
    timestamp: new Date().toISOString()
  })
  const info = { ...userInfo, localStream: stream, remoteVideoRef, onRemoteStream }
  console.log('=== [Contact] 调用 initSocket ===', {
    info: {
      username: info.username,
      room: info.room,
      hasLocalStream: !!info.localStream,
      hasRemoteVideoRef: !!info.remoteVideoRef,
      hasOnRemoteStream: !!info.onRemoteStream
    },
    timestamp: new Date().toISOString()
  })
  socket = initSocket(info)
  console.log('=== [Contact] initSocket 返回 ===', {
    socket: !!socket,
    socketId: socket?.id,
    timestamp: new Date().toISOString()
  })
}
const leave = () => {
  console.log('=== [Contact] 用户离开房间 ===', {
    timestamp: new Date().toISOString()
  })
  if (socket) {
    socket.disconnect()
    console.log('=== [Contact] Socket 已断开 ===', {
      timestamp: new Date().toISOString()
    })
  }
  showRTCVideo.value = false
  console.log('=== [Contact] showRTCVideo 已设置为 false ===', {
    timestamp: new Date().toISOString()
  })
}
// 在组件卸载时清理数字人和socket连接
onBeforeUnmount(() => {
  console.log('=== [Contact] 组件卸载，清理资源 ===', {
    hasSocket: !!socket,
    socketConnected: socket?.connected,
    timestamp: new Date().toISOString()
  })
  
  // 断开socket连接
  if (socket) {
    socket.disconnect()
    socket = null
  }
  
  yiyu.disableYiyuApp();  // 关闭数字人
  yiyu.disableTextSelection(); // 关闭划词功能
  console.log('数字人已销毁');
});

</script>

<style lang="css" scoped>
.header {
  color: #fff;
  font-size: 28px;
  height: 120px;
  line-height: 120px;
  margin-bottom: 15px;
}
.main {
  display: flex;
  flex-direction: column;
  height: 200vh;
  padding: 120px;
}

/* 视频容器自适应 */
.rtc-container {
  flex: 1;
  min-height: 0; /* 修复flex溢出问题 */
}
</style>
