import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import Antd from 'ant-design-vue'
import MyLib from '@lib/index'
import 'ant-design-vue/dist/antd.css'
import '@lib/assets/main.css'

createApp(App).use(router).use(Antd).use(MyLib).mount('#app')
