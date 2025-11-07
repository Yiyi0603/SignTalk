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
    /*https: {
      key: fs.readFileSync(path.resolve(__dirname, './src/certs/localhost-key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, './src/certs/localhost-cert.pem')),
    },*/
    host: '0.0.0.0',
    port: 5173,
  },
  build: {
    outDir: '../static', // 构建输出到Django的static目录
    emptyOutDir: true,
    rollupOptions: {
      output: {
        // 确保静态资源路径正确
        assetFileNames: 'assets/[name].[ext]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
  },
  base: '/', // 使用根路径，因为Django会在根路径提供静态文件
})
