import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

//vite.config.ts 里写的不是“前端端口”，而是 dev proxy 的目标地址
//你在浏览器访问 http://localhost:5173/api/...
//Vite 会帮你转发到 http://localhost:5000/api/...（你的 dotnet 宿主机端口）

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
    server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // 本地 .NET API
        changeOrigin: true,
      },
    },
  },
})

// 左边 = 你在浏览器 / 本机访问的端口
// 右边 = 容器里这个程序真正监听的端口