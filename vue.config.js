const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    proxy: {
      '/speech_translation/(mdl|api)': {
        target: 'http://192.168.1.11/',
        ws: true,
        changeOrigin: true
      }
    }
  }
})
