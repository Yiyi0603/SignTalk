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
      <!-- 左侧功能详情组件框 -->
      <div class="feature-container">
        <div class="feature-box">
          <!-- 功能详情标题 -->
          <div class="feature-title">
            <h2>功能详情</h2>
          </div>
          <!-- 左侧模块列表和功能介绍 -->
          <div class="feature-content">
            <div class="feature-modules">
              <div
                class="feature-module"
                v-for="(module, index) in featureModules"
                :key="index"
                @click="selectModule(index)"
                :class="{ active: currentIndex === index }"
              >
                <img :src="module.icon" alt="模块图标" class="module-icon" />
                <span class="module-text">{{ module.text }}</span>
              </div>
            </div>
            <div class="feature-intro">
              <div class="intro-content" v-if="currentModule">
                <div v-for="(subModule, subIndex) in currentModule.subModules" :key="subIndex" class="sub-module-container">
                  <h3>{{ subModule.title }}</h3>
                  <p>{{ subModule.description }}</p>
                  <div class="intro-tags">
                    <span
                      class="tag"
                      v-for="(tag, tagIndex) in subModule.tags"
                      :key="tagIndex"
                    >
                      {{ tag }}
                    </span>
                  </div>
                  <!-- 在两个子模块之间添加横线 -->
                  <div v-if="subIndex < currentModule.subModules.length - 1" class="divider"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧登录注册组件框 -->
      <div class="auth-container">
        <div class="auth-box">
          <div class="auth-header">
            <div class="auth-logo-container">
              <img :src="logoSrc" alt="Logo" class="auth-logo" />
              <span class="auth-logo-text">Sign Talk</span>
            </div>
          </div>
          <div class="auth-content">
            <!-- 已登录状态 -->
            <div v-if="loggedInUser" class="welcome-container">
              <h3>欢迎回来，{{ loggedInUser }}！</h3>
              <p>开始使用 Sign Talk 的完整功能吧</p>
              <button class="auth-button" @click="handleLogout">退出登录</button>
            </div>

            <!-- 未登录状态 -->
            <div v-else>
                <p>{{ isLogin ? '立即来探索吧' : '创建您的账号' }}</p>
                <form class="auth-form" @submit.prevent="handleSubmit">
                  <div class="form-group">
                    <label for="username">用户名</label>
                    <input
                      type="text"
                      id="username"
                      class="form-control"
                      placeholder="请输入用户名"
                      v-model="formData.username"
                    />
                  </div>
                  <div class="form-group">
                    <label for="password">密   码</label>
                    <input
                      type="password"
                      id="password"
                      class="form-control"
                      placeholder="请输入密码"
                      v-model="formData.password"
                    />
                  </div>
                  <div class="form-group" v-if="!isLogin">
                    <label for="confirmPassword">确认密码</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      class="form-control"
                      placeholder="请确认密码"
                      v-model="formData.confirmPassword"
                    />
                  </div>
                  <button type="submit" class="auth-button">
                    {{ isLogin ? '登  录' : '立即注册' }}
                  </button>
                </form>
                <p class="auth-footer">
                  {{ isLogin ? '还没账号? ' : '已有账号, ' }}
                  <a href="#" @click.prevent="toggleAuthMode">
                    {{ isLogin ? '立即注册' : '立即登录' }}
                  </a>
                </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import NavBar from '../components/navbar.vue';
import { getApiUrl, API_CONFIG } from '../config/api.js';

const logoSrc = new URL('../assets/logo.png', import.meta.url).href;
const isLogin = ref(true); // 控制当前是登录还是注册模式
const formData = ref({
  username: '',
  password: '',
  confirmPassword: ''
});

const loggedInUser = ref(null); // 新增：登录用户状态

const toggleAuthMode = () => {
  isLogin.value = !isLogin.value;
};
const handleSubmit = () => {
  console.log('提交的数据:', formData.value); // 打印表单数据
  if (!isLogin.value && formData.value.password !== formData.value.confirmPassword) {
    alert('密码和确认密码不一致');
    return;
  }

  const apiUrl = isLogin.value ? getApiUrl(API_CONFIG.ENDPOINTS.LOGIN) : getApiUrl(API_CONFIG.ENDPOINTS.REGISTER);
  const dataToSend = {
    username: formData.value.username,
    password: formData.value.password,
  };

  axios.post(apiUrl, dataToSend)
    .then(response => {
      alert(response.data.message);
      if (isLogin.value) {
        // 登录成功后的处理
        loggedInUser.value = formData.value.username;
        formData.value = { username: '', password: '', confirmPassword: '' };
      } else {
        // 注册成功后的处理
        formData.value.username = '';
        formData.value.password = '';
        formData.value.confirmPassword = '';
        toggleAuthMode();
      }
    })
    .catch(error => {
      console.error(error);
      if (error.response && error.response.data) {
        alert(error.response.data.message);
      } else {
        alert('服务器连接失败');
      }
    });
};

// 新增：退出登录方法
const handleLogout = () => {
  loggedInUser.value = null;
  formData.value = { username: '', password: '', confirmPassword: '' };
  alert('已退出登录');
};

// 功能模块数据
const featureModules = ref([
  {
    icon: new URL('../assets/contact.jpg', import.meta.url).href,
    text: '双向沟通',
    subModules: [
      {
        title: '手语生成',
        description:
          '精准识别中文文字并生成对应手语，支持实时翻译与学习，适用于多种场景。',
        tags: ['高精度', '实时翻译', '高识别率'],
      },
      {
        title: '手语翻译',
        description:
          '精准识别手语并实时翻译成中文文字，帮助听障人士与健听人群实现高效沟通，适用于学习、工作、生活等多种场景。',
        tags: ['高精度', '高效率', '高识别率'],
      },
    ],
  },
  {
    icon: new URL('../assets/learn.jpg', import.meta.url).href,
    text: '手语学习',
    subModules: [
      {
        title: '视频学习',
        description:
          '通过视频学习手语，专业教师示范，逐句拆解，反复练习，轻松掌握手语交流技巧，适用于零基础学习者。',
        tags: ['专业教学', '视频演示', '多场景应用'],
      },
      {
        title: '手语检测',
        description:
          '通过视频学习手语，AI实时检测用户动作，与标准教学对比，精准分析并指出用户手语动作的不足，帮助快速提升手语表达能力。',
        tags: ['AI分析', '精准反馈', '动作优化'],
      },
    ],
  },
  {
    icon: new URL('../assets/camera.jpg', import.meta.url).href,
    text: '个人数据库',
    subModules: [
      {
        title: '手语数据库定制',
        description:
          '一套专属用户需求定制的特定领域或行业的手语语料库，以提供精准的手语表达和翻译。',
        tags: ['高精度', '高效率', '高识别率'],
      },
    ],
  },
]);

const currentIndex = ref(0); // 当前选中的模块索引
const currentModule = ref(featureModules.value[currentIndex.value]); // 当前模块的数据

// 切换模块
const selectModule = (index) => {
  currentIndex.value = index;
  currentModule.value = featureModules.value[index];
};
</script>

<style scoped>
.home-container {
  background-color: rgba(255, 255, 240, 1);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
  background-color: rgba(255, 255, 240, 1);
}

.logo-container {
  display: flex;
  align-items: center;
}

.logo {
  height: 40px;
  margin-right: 10px;
}

.logo-text {
  font-size: 20px;
  font-weight: bold;
}

.main-content {
  display: flex;
  padding: 20px;
  flex: 1;
  gap: 50px; /* 设置左右组件之间的间距 */
}

/* 左侧功能详情组件框 */
.feature-container {
  width: 1000px;
  margin-left: 50px;
  margin-top: 30px;
}

.feature-box {
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
}

/* 功能详情标题 */
.feature-title {
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e0e0e0;
}

.feature-title h2 {
  font-size: 22px;
  color: #333;
}

/* 左侧模块列表和功能介绍 */
.feature-content {
  display: flex;
}

.feature-modules {
  width: 20%;
  display: flex;
  flex-direction: column;
}

.feature-module {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
}

.feature-module:hover {
  background-color: rgba(0, 150, 255, 0.1);
}

.feature-module.active {
  background-color: rgba(0, 150, 255, 0.2);
}

.module-icon {
  width: 80px;
  height: 80px;
  margin-bottom: 5px;
}

.module-text {
  font-size: 14px;
  color: #333;
}

.feature-intro {
  width: 80%;
  padding: 0 20px;
}

.sub-module-container {
  border: 1px solid #e0e0e0;
  border-radius: 5px;
  padding: 20px;
  margin-bottom: 20px;
}

.sub-module-container:last-child {
  margin-bottom: 0;
}

.intro-content h3 {
  margin-bottom: 10px;
  color: #333;
}

.intro-content p {
  margin-bottom: 15px;
  color: #666;
  line-height: 1.6;
}

.intro-tags {
  display: flex;
  flex-wrap: wrap;
}

.tag {
  display: inline-block;
  padding: 3px 10px;
  background-color: rgba(0, 150, 255, 0.1);
  border-radius: 3px;
  margin-right: 10px;
  margin-bottom: 10px;
  font-size: 12px;
  color: rgba(0, 150, 255, 0.8);
}


/* 右侧登录注册组件框 */
.auth-container {
  width: 400px;
  margin-right: 50px;
  margin-top: 30px;
}

.auth-box {
  background-color: rgba(173, 216, 230, 0.5);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  height: 480px;
  position: relative;
}

.auth-header {
  text-align: center;
  margin-bottom: 20px;
}

.auth-logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}

.auth-logo {
  height: 50px;
  margin-right: 10px;
}

.auth-logo-text {
  font-size: 24px;
  font-weight: bold;
  color: rgba(0, 150, 255, 0.9);
}

.auth-header p {
  color: rgba(0, 150, 255, 0.7);
  font-size: 14px;
}

.auth-title {
  text-align: center;
  margin-bottom: 20px;
  color: #666;
}

.auth-form {
  display: flex;
  flex-direction: column;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  color: #666;
  font-size: 17px;
}

.form-control {
  width: 320px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
}

.auth-content p {
  text-align: center;
  margin-bottom: 15px;
  color: #666;
  font-size: 18px;
}

.auth-button {
  display: block;
  width: 100%;
  padding: 12px;
  background-color: rgba(0, 150, 255, 0.8);
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 18px;
  cursor: pointer;
  margin-bottom: 15px;
  margin-top: 20px;
}

.auth-button:hover {
  background-color: rgba(0, 150, 255, 0.9);
}

.auth-footer {
  text-align: center;
  font-size: 14px;
  color: #666;
}

.auth-footer a {
  color: rgba(0, 150, 255, 0.8);
  text-decoration: none;
}

.auth-footer a:hover {
  text-decoration: underline;
}

/* 欢迎信息容器 */
.welcome-container {
  text-align: center;
  padding: 20px;
}

.welcome-container h3 {
  color: rgba(0, 150, 255, 0.9);
  font-size: 24px;
  margin-bottom: 15px;
}

.welcome-container p {
  color: #666;
  margin-bottom: 30px;
}
</style>