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
const toHalfWidthLower = (str) => {
  const s = String(str || '').trim()
    .replace(/[\u3000]/g, ' ')
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xFEE0))
  return s.toLowerCase()
}

const handleJoin = (user) => {
  showRTCVideo.value = true
  userInfo = {
    username: toHalfWidthLower(user.username),
    room: toHalfWidthLower(user.room),
  }
}
// 等待本地视频初始化完成后发送信令服务
const streamSuccess = ({ stream, remoteVideoRef }) => {
  const info = { ...userInfo, localStream: stream, remoteVideoRef }
  socket = initSocket(info)
}
const leave = () => {
  socket.disconnect()
  showRTCVideo.value = false
}
// 在组件卸载时清理数字人
onBeforeUnmount(() => {
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
