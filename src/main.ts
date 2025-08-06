import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import MyLib from '@lib/index'
import '@lib/assets/main.css'
import './style.css'
import { createPinia } from 'pinia'

const pinia = createPinia()

createApp(App).use(router).use(Antd).use(MyLib).use(pinia).mount('#app')
