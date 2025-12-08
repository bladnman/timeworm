import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { apiPlugin } from './vite-api-plugin'

// Load env vars at config time (covers .env.local)
const env = loadEnv('development', process.cwd(), '')
const port = env.VITE_PORT ? parseInt(env.VITE_PORT, 10) : 5173

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), apiPlugin()],
  server: {
    port,
    strictPort: true,
  },
})
