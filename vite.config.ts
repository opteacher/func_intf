import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@lib': resolve(__dirname, './lib/src')
    }
  },
  server: {
    proxy: {
      '^/(tools_box|secret_manager|chat_glm_config|audio_words|magic_pdf_apis|custom_form|share-table)/(mdl?|api)': {
        target: 'http://124.28.221.82:6031/',
        ws: true,
        changeOrigin: true
      },
      '^/ait-xecutor/service/rs': {
        target: 'http://124.28.221.82/',
        ws: true,
        changeOrigin: true
      }
    }
  },
})
