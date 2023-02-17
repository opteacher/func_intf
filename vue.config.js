const { defineConfig } = require('@vue/cli-service')
const path = require('path')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    proxy: {
      '/(speech_translation|tool_box)/(mdl|api)': {
        target: 'http://1.15.57.178/',
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
