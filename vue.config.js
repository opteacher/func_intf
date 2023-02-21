const { defineConfig } = require('@vue/cli-service')
const path = require('path')
module.exports = defineConfig({
  assetsDir: 'func_intf',
  transpileDependencies: true,
  devServer: {
    proxy: {
      '/(speech_translation|tool_box)/(mdl|api)': {
        target: 'http://192.168.1.11/',
        ws: true,
        changeOrigin: true
      }
    }
  },
  configureWebpack: {
    resolve: {
      alias: {
        '@lib': path.resolve('./lib/src')
      }
    }
  }
})
