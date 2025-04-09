const { defineConfig } = require('@vue/cli-service')
const path = require('path')
module.exports = defineConfig({
  assetsDir: 'func_intf',
  transpileDependencies: true,
  devServer: {
    client: {
      overlay: false
    },
    proxy: {
      '/(tools_box|secret_manager|chat_glm_config)/(mdl?|api)': {
        target: 'http://192.168.1.11:4009/',
        ws: true,
        changeOrigin: true
      },
      '/audio_words/(api|mdl)': {
        target: 'http://192.168.1.11:4009/',
        ws: true,
        changeOrigin: true
      },
      '/magic_pdf_apis/(mdl?|api)': {
        target: 'http://192.168.1.11:4009/',
        ws: true,
        changeOrigin: true
      },
      '/custom_form/(mdl|api)': {
        target: 'http://192.168.1.11:4009/',
        ws: true,
        changeOrigin: true
      },
      '/ait-xecutor/service/rs': {
        target: 'http://192.168.1.11/',
        ws: true,
        changeOrigin: true
      }
    }
  },
  configureWebpack: {
    resolve: {
      alias: {
        '@': path.resolve('./src'),
        '@lib': path.resolve('./lib/src')
      }
    }
  }
})
