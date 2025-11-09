/**
 * API配置文件
 * 根据环境自动选择API地址
 */

// 检测当前环境
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// API基础地址配置（前端走 Vite 代理，统一用相对路径，避免混用 http/https）
export const API_CONFIG = {
  BASE_URL: '/api',
  // SOCKET_URL 改为运行时动态计算（确保在电脑B访问时不会落到 127.0.0.1）
  SOCKET_URL: null,
  
  // API端点
  ENDPOINTS: {
    LOGIN: '/login/',
    REGISTER: '/register/',
    SIGN_RECOGNIZE: '/sign/recognize/',
    CATEGORIES: '/v1/categories/',
    WORDS: '/v1/words/',
    WORD_DETAIL: '/v1/words/'
  }
};

// 获取完整的API URL
export const getApiUrl = (endpoint) => `${API_CONFIG.BASE_URL}${endpoint}`;

// 获取Socket.IO URL：始终与当前页面 host 对齐，端口固定 3333
export const getSocketUrl = () => {
  const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
  const host = window.location.hostname; // 可能是 IP 或域名
  const port = '3333';
  const base = `${protocol}//${host}:${port}`;
  API_CONFIG.SOCKET_URL = base;
  return base;
};

// 调试信息
console.log('🔧 API配置信息:');
console.log('📍 当前主机名:', window.location.hostname);
console.log('🌐 API地址:', API_CONFIG.BASE_URL);
console.log('🔌 Socket地址:', getSocketUrl());
console.log('💻 环境:', isLocalhost ? '本地开发' : '局域网访问');



