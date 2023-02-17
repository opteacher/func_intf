import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import SpeechTranslate from '../views/SpeechTranslate.vue'
import Encode from '../views/Encode.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/speech_translation'
  },
  {
    path: '/speech_translation',
    name: 'speech_translation',
    component: SpeechTranslate
  },
  {
    path: '/tool_box/encode',
    name: 'encode',
    component: Encode
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL || '/func_intf/'),
  routes
})

export default router
