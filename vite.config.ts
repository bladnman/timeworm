import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Load env vars at config time (covers .env.local)
const env = loadEnv('development', process.cwd(), '')
const port = env.VITE_PORT ? parseInt(env.VITE_PORT, 10) : 5173

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port,
    strictPort: true,
  },
})
