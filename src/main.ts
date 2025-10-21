import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import MyLib from '@lib/index'
import '@lib/assets/main.css'
import './style.css'
import { createPinia } from 'pinia'
import 'dayjs/locale/zh-cn'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault('Asia/Shanghai')
dayjs.locale('zh-cn')

const pinia = createPinia()

createApp(App).use(router).use(Antd).use(MyLib).use(pinia).mount('#app')
