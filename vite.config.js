import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/rest/v1': {
        target: 'https://hldcabxeueretuwqtqnb.supabase.co',
        changeOrigin: true,
      },
      '/auth/v1': {
        target: 'https://hldcabxeueretuwqtqnb.supabase.co',
        changeOrigin: true,
      }
    }
  }
})
