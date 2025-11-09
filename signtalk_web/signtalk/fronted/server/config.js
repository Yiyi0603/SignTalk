import express from "express";
import https from "https";
import { Server as IO } from "socket.io";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * 初始化 express
 * @param app
 * @returns
 */
export default async function initApp() {
  let app = express();
  
  // 读取SSL证书文件
  // 使用相对于本文件的路径，避免被工作目录影响
  const keyPath = path.resolve(__dirname, '../src/certs/localhost-key.pem');
  const certPath = path.resolve(__dirname, '../src/certs/localhost-cert.pem');
  
  let https_server;
  
  try {
    // 尝试使用HTTPS
    const options = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath)
    };
    https_server = https.createServer(options, app);
    console.log('Starting HTTPS server on port 3333');
  } catch (error) {
    console.log('SSL certificates not found, falling back to HTTP');
    console.log('Note: For video calls to work properly, HTTPS is required');
    const http = await import("http");
    https_server = http.default.createServer(app);
  }
  
  https_server.listen(3333);
  
  let io = new IO(https_server, {
    path: "/rtc",
    // 允许跨域访问
    cors: {
      origin: "*"
    }
  });
  
  https_server.on("listening", () => {
    let addr = https_server.address();
    if (addr) {
      let port = typeof addr === "string" ? addr : addr.port;
      console.log(`Socket.IO server listening on port ${port}`);
    }
  });
  
  return io;
}
