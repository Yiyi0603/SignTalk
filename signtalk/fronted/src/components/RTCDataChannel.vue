<template>
  <div class="data-channel">
    <a-textarea
      v-model="outputMessages"
      disabled
      class="data-channel__output"
    />
    <div class="input-wrapper">
      <a-textarea
        v-model="inputMessage"
        placeholder="请输入要翻译成手语的消息"
        class="data-channel__input"
        @keyup.enter="sendSignMessage"
      />
      <a-button
        type="primary"
        class="data-channel__button"
        @click="sendSignMessage"
      >
        👐 发送手语
      </a-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { yiyu } from "https://avatar.gbqr.net/avatar.js";

const inputMessage = ref('');
const outputMessages = ref('');



const sendSignMessage = async () => {
  if (!inputMessage.value.trim()) return;

  try {
    // 显示到消息框
    outputMessages.value += `[手语] ${inputMessage.value}\n`;

    // 调用虚拟人手语翻译
    await yiyu.startSignLanguage(inputMessage.value);

    // 清空输入
    inputMessage.value = '';
  } catch (error) {
    console.error('手语翻译失败:', error);
    outputMessages.value += `[错误] 手语翻译失败\n`;
  }
};
</script>

<style lang="css" scoped>
.data-channel {
  width: 40%;
  height: 150%;
  background-color: #f0f8ff;
  border: 2px solid #2196F3;
  border-radius: 8px;
  padding: 20px;
}

.input-wrapper {
  display: flex;
  gap: 8px;
  align-items: center;
}

.data-channel__input {
  flex: 1;
  height: 35px;
  border: 2px solid #87CEEB;
  resize: none;
  margin-top:20px;
}
.data-channel__output{
  flex: 1;
  height: 85%;
  border: 2px solid #87CEEB;
  resize: none;
}
.data-channel__button {
  background-color: #2196F3;
  color: white;
  border: none;
  transition: background 0.3s;
  display: flex;
  align-items: center;
  gap: 2px;
  margin-top:20px;
}

.data-channel__button:hover {
  background-color: #6CA6CD;
}
</style>