import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import Antd from 'ant-design-vue'
import axios from 'axios'
import 'ant-design-vue/dist/antd.css'
import './index.css'

createApp(App).use(router).use(Antd).mount('#app')
