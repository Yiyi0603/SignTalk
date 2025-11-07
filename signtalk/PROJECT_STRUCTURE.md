# SignTalk 2.0 项目结构说明

## 📁 目录结构

```
signtalk_web/signtalk/
├── fronted/                    # 前端项目
│   ├── src/                    # 前端源码
│   │   ├── components/         # Vue组件
│   │   │   ├── RTCVideo.vue   # 视频通话核心组件（支持多用户）
│   │   │   ├── Video.vue      # 基础视频组件
│   │   │   ├── Login.vue      # 登录组件
│   │   │   ├── TrackToggle.vue # 功能按钮组件
│   │   │   └── ...
│   │   ├── views/             # 页面视图
│   │   │   ├── Contact.vue    # 视频通话页面
│   │   │   ├── Home.vue       # 主页面
│   │   │   ├── Learn.vue      # 手语学习页面
│   │   │   └── WordDetail.vue # 词汇详情页面
│   │   ├── socket.js          # WebRTC信令处理（支持多peer连接）
│   │   ├── constants.js       # WebRTC配置常量
│   │   ├── dataChannel.js     # 数据通道处理
│   │   ├── enum.js            # Socket事件枚举
│   │   └── ...
│   └── server/                # Socket.IO信令服务器
│       ├── main.js            # 服务器主文件（房间管理、用户管理）
│       ├── config.js          # 服务器配置
│       ├── on.js              # 信令转发处理
│       └── enum.js            # Socket事件枚举
│
├── signrecognition/           # 手语识别应用
│   ├── model_files/           # 模型文件
│   │   ├── model.py           # 神经网络模型定义
│   │   ├── tools/             # 工具函数
│   │   └── checkpoints/       # 模型权重
│   ├── services.py            # 手语识别服务类
│   ├── views.py               # API视图
│   └── urls.py                # URL配置
│
├── userauth/                  # 用户认证应用
│   ├── models.py              # 用户模型
│   ├── views.py               # 认证视图
│   └── ...
│
├── words/                     # 手语学习应用
│   ├── models.py              # 词汇模型
│   ├── views.py               # 词汇视图
│   └── ...
│
├── static/                    # 静态文件（构建产物）
│   ├── assets/                # 静态资源
│   └── index.html             # 前端入口文件
│
├── manage.py                  # Django管理脚本
├── requirements.txt           # Python依赖（完整版）
├── requirements_core.txt      # Python依赖（核心版）
└── ...
```

## 🔑 核心文件说明

### 前端核心文件

#### `src/socket.js`
- **功能**: WebRTC信令处理，支持多用户连接
- **关键特性**:
  - 为每个远程用户创建独立的RTCPeerConnection
  - 使用Map管理多个peer连接（key为socketId）
  - 支持多peer模式和单peer模式（向后兼容）

#### `src/components/RTCVideo.vue`
- **功能**: 视频通话核心组件
- **关键特性**:
  - 支持显示多个远程视频（动态创建video元素）
  - 管理本地和远程视频流
  - 处理手语识别循环

#### `src/views/Contact.vue`
- **功能**: 视频通话页面入口
- **关键特性**:
  - 管理socket连接生命周期
  - 处理房间加入和离开

### 后端核心文件

#### `server/main.js`
- **功能**: Socket.IO服务器主文件
- **关键特性**:
  - 房间管理（Map结构，key为房间号）
  - 用户连接管理（防止重复连接）
  - 自动清理无效连接（每30秒）
  - HTTP API接口（房间管理）

#### `server/on.js`
- **功能**: WebRTC信令转发
- **关键特性**:
  - 支持多peer模式（路由到指定socketId）
  - 向后兼容单peer模式（广播）

#### `signrecognition/services.py`
- **功能**: 手语识别服务
- **关键特性**:
  - 模型加载和推理
  - 图像预处理
  - 结果返回

## 🔄 数据流

### WebRTC连接流程

1. **用户加入房间**
   - 客户端连接Socket.IO
   - 服务器添加用户到房间
   - 服务器广播用户列表

2. **建立WebRTC连接**
   - 客户端收到用户列表
   - 为每个其他用户创建RTCPeerConnection
   - socketId较小的用户创建OFFER
   - 通过服务器转发信令（OFFER/ANSWER/ICE）

3. **视频流传输**
   - 建立连接后，视频流通过WebRTC传输
   - 客户端收到远程流，显示在对应的video元素中

### 手语识别流程

1. **图像捕获**
   - 客户端从video元素捕获帧
   - 转换为base64编码

2. **API请求**
   - 发送到Django后端
   - `/api/v1/sign-recognition/recognize/`

3. **识别处理**
   - 后端使用MediaPipe提取手部关键点
   - 使用PyTorch模型进行推理
   - 返回识别结果和置信度

## 📊 配置说明

### 房间人数限制

在 `server/main.js` 中配置：
```javascript
const MAX_ROOM_MEMBERS = 10  // 默认10人
```

### WebRTC配置

在 `src/constants.js` 中配置：
```javascript
export const rtcConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' }
  ]
}
```

## 🧹 清理和维护

### 自动清理

- 服务器每30秒自动清理无效连接
- 用户加入时自动清理重复连接

### 手动清理

使用HTTP API：
```bash
# 查看所有房间
curl http://localhost:3333/api/rooms

# 清理无效连接
curl -X POST http://localhost:3333/api/rooms/cleanup

# 清空所有房间
curl -X POST http://localhost:3333/api/rooms/clear
```

## 📝 开发注意事项

1. **多用户支持**: 确保使用多peer模式（传递onRemoteStream回调）
2. **连接管理**: 注意断开连接时的清理逻辑
3. **信令路由**: 确保信令包含targetSocketId以便正确路由
4. **错误处理**: 注意WebRTC状态错误（InvalidStateError等）

## 🔍 调试工具

### 客户端调试

在浏览器控制台使用：
```javascript
// 诊断WebRTC连接
window.diagnoseWebRTC()

// 访问WebRTC对象
window.webRTC_debug.localPc
```

### 服务器调试

查看服务器日志：
- 连接日志
- 房间管理日志
- 信令转发日志


