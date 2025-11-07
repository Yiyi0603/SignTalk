// API 配置
// 可以通过环境变量 VITE_API_BASE_URL 来覆盖默认值
// 如果没有环境变量，将根据当前主机自动检测
const getApiBaseUrl = () => {
  // 优先使用环境变量
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL
  }
  
  // 根据当前访问的主机名自动构建 API 地址
  // 如果通过Django访问（同一端口），API在同一端口
  // 如果通过Vite开发服务器访问（5173端口），API在8000端口
  const hostname = window.location.hostname
  const protocol = window.location.protocol === 'https:' ? 'https' : 'http'
  const port = window.location.port
  
  // 如果端口是8000或者是生产环境（没有端口号），API在同一主机
  if (port === '8000' || !port || (protocol === 'https:' && (port === '443' || !port))) {
    return `${protocol}://${hostname}${port ? `:${port}` : ''}`
  }
  
  // 开发环境，使用8000端口
  return `${protocol}://${hostname}:8000`
}

export const API_BASE_URL = getApiBaseUrl()

// 导出常用 API 端点
export const API_ENDPOINTS = {
  register: `${API_BASE_URL}/api/register/`,
  login: `${API_BASE_URL}/api/login/`,
  categories: `${API_BASE_URL}/api/v1/categories/`,
  words: `${API_BASE_URL}/api/v1/words/`,
  signRecognition: `${API_BASE_URL}/api/v1/sign-recognition/`,
}

