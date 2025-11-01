<template>
  <img @click="handleClick" :src="src" class="track-img" />
</template>

<script setup>
import { computed, ref } from 'vue'
import audio from '../assets/audio.svg'
import audioDisabled from '../assets/audio-disabled.svg'
import camera from '../assets/camera.svg'
import cameraDisabled from '../assets/camera-disabled.svg'
import leave from '../assets/leave.svg'
import message from '../assets/message.svg'
const props = defineProps({
  source: String,
  initialState: Boolean,
})
const emits = defineEmits(['onChange'])

const enabled = ref(true)
const handleClick = () => {
  enabled.value = !enabled.value
  emits('onChange', enabled.value)
}

const src = computed(() => {
  switch (props.source) {
    case 'microphone':
      return enabled.value ? audio : audioDisabled
    case 'camera':
      return enabled.value ? camera : cameraDisabled
    case 'leave':
      return leave
    case 'message':
      return message
    default:
      return undefined
  }
})
</script>

<style lang="css" scoped>
.track-toggle-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px; /* 按钮容器内边距 */
  background-color: rgba(255, 255, 255, 0.1); /* 容器背景（可选） */
  border-radius: 50%; /* 圆形背景 */
  transition: background 0.2s; /* 悬停动效 */
}

.track-toggle-container:hover {
  background-color: rgba(255, 255, 255, 0.2); /* 悬停时背景加深 */
}

.track-img {
  cursor: pointer;
  width: 26px; /* 增大图标尺寸 */
  height: 26px;
  filter: brightness(0.9); /* 图标轻微透明 */
  transition: filter 0.2s;
}

.track-img:hover {
  filter: brightness(1.2); /* 悬停时图标高亮 */
}
</style>