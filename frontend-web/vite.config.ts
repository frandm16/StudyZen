import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backendTarget = env.VITE_BACKEND_URL || 'http://192.168.1.52:8082';

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    server: {
      port: env.PORT ? Number(env.PORT) : 7777,
      host: true,
      proxy: {
        '/api': {
          target: backendTarget,
          changeOrigin: true,
        },
        '/oauth2': {
          target: backendTarget,
          changeOrigin: true,
        },
        '/login/oauth2': {
          target: backendTarget,
          changeOrigin: true,
        },
      },
    },
  }
})