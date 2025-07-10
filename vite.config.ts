import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 1 'mode'=加载环境变量，'process.cwd()'=表示项目根目录
  const env = loadEnv(mode, process.cwd())

  // 2 现在可以通过env访问变量
  console.log('env.VITE_APP_BASE_API', env.VITE_APP_BASEURL)


  return {
    base: env.VITE_APP_BASEURL,
    plugins: [react()],
  }
})
