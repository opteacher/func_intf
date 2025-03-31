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
      '/(speech_translation|tools_box|secret_manager|chat_glm_config|magic_pdf_apis)/(mdl?|api)': {
        target: 'http://192.168.1.11:4009/',
        ws: true,
        changeOrigin: true
      },
      '/custom_form/(mdl|api)': {
        target: 'http://38.152.2.152:3141',
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
