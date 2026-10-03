import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

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
          target: 'http://192.168.1.52:8082',
          changeOrigin: true,
        },
      },
    },
  }
})