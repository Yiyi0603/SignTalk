# SignTalk 前端项目

## 📋 项目说明

这是 SignTalk 2.0 的前端项目，基于 Vue 3 + Vite 构建，包含视频通话、手语识别等功能。

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

构建产物会输出到 `../static/` 目录。

## 📁 项目结构

```
fronted/
├── src/
│   ├── components/      # Vue组件
│   │   ├── RTCVideo.vue      # 视频通话核心组件
│   │   ├── Video.vue         # 基础视频组件
│   │   ├── Login.vue         # 登录组件
│   │   └── ...
│   ├── views/           # 页面视图
│   │   ├── Contact.vue       # 视频通话页面
│   │   ├── Home.vue          # 主页面
│   │   └── Learn.vue         # 手语学习页面
│   ├── socket.js        # WebRTC信令处理
│   ├── constants.js     # 常量配置
│   └── ...
├── server/              # Socket.IO信令服务器
│   ├── main.js          # 服务器主文件
│   ├── config.js        # 服务器配置
│   └── on.js            # 信令处理
└── package.json
```

## 🔧 配置

### 环境变量

创建 `.env.production` 文件（可选）：

```env
VITE_SIGNAL_HOST=your_signal_server_ip
VITE_SIGNAL_PORT=3333
```

## 📝 开发说明

### 核心组件

- **RTCVideo.vue**: 管理本地和远程视频流，处理WebRTC连接
- **socket.js**: 处理WebRTC信令，支持多用户连接
- **Contact.vue**: 视频通话页面入口

### 信令服务器

信令服务器位于 `server/` 目录，使用 Socket.IO 实现。

启动信令服务器：
```bash
cd server
node main.js
```

## 🐛 常见问题

1. **前端代码未加载**: 运行 `npm run build` 重新构建
2. **WebRTC连接失败**: 检查信令服务器是否运行（端口3333）
3. **视频无法显示**: 检查浏览器权限设置

## 📚 相关文档

- [主项目README](../../../README.md)
- [部署指南](../../部署指南_通过网址访问.md)