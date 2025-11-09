import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'
import fs from 'fs';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    Components({
      resolvers: [
        AntDesignVueResolver({
          importStyle: false, // css in js
        }),
      ],
    }),
  ],
  server: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, './src/certs/localhost-key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, './src/certs/localhost-cert.pem')),
    },
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      // 将以 /api 开头的请求代理到本地 HTTP Django 后端，避免浏览器混用协议
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
