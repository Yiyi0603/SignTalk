import {createApp} from 'vue'
import App from './App.vue'
import './style.css';
import router from "./router";

// 应用启动日志
console.log('=== SignTalk 应用启动 ===', new Date().toISOString())

createApp(App).use(router).mount('#app')

console.log('=== SignTalk 应用已挂载 ===')
