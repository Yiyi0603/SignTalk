import express from "express";
import http from "http";
import { Server as IO } from "socket.io";
/**
 * 初始化 express
 * @param app
 * @returns
 */
let appInstance = null;

export default function initApp() {
  let app = express();
  appInstance = app;
  
  // 添加JSON解析中间件
  app.use(express.json());
  
  const http_server = http.createServer(app);
  
  // 明确监听所有网络接口，确保反向代理可以连接
  const PORT = 3333;
  const HOST = '0.0.0.0'; // 监听所有接口，不仅仅 localhost
  
  console.log('=== [Server] 正在启动 Socket.IO 服务器 ===', {
    port: PORT,
    host: HOST,
    path: '/rtc',
    timestamp: new Date().toISOString()
  });
  
  http_server.listen(PORT, HOST, () => {
    let addr = http_server.address();
    if (addr) {
      let port = typeof addr === "string" ? addr : addr.port;
      let address = typeof addr === "string" ? addr : addr.address;
      console.log('=== [Server] Socket.IO 服务器已启动 ===', {
        port: port,
        address: address,
        path: '/rtc',
        timestamp: new Date().toISOString()
      });
    }
  });
  
  http_server.on('error', (error) => {
    console.error('=== [Server] 服务器启动错误 ===', {
      error: error.message,
      code: error.code,
      port: PORT,
      timestamp: new Date().toISOString()
    });
    if (error.code === 'EADDRINUSE') {
      console.error('=== [Server] 端口已被占用，请检查是否有其他进程在使用端口', PORT, '===');
    }
  });
  
  let io = new IO(http_server, {
    path: "/rtc",
    // 允许跨域访问
    cors: {
      origin: "*"
    },
    // 添加更多配置选项以确保连接稳定
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['websocket', 'polling']
  });
  
  // 监听 Socket.IO 引擎错误
  io.engine.on('connection_error', (err) => {
    console.error('=== [Server] Socket.IO 引擎连接错误 ===', {
      error: err.message,
      code: err.code,
      context: err.context,
      timestamp: new Date().toISOString()
    });
  });
  
  console.log('=== [Server] Socket.IO 已配置 ===', {
    path: '/rtc',
    cors: { origin: '*' },
    timestamp: new Date().toISOString()
  });
  
  return io;
}

// 导出app实例供外部使用
export function getApp() {
  return appInstance;
}
