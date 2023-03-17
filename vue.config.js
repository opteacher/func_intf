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
      '/(speech_translation|tool_box|secret-manager)/(mdl|api)': {
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
