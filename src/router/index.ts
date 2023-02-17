import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import SpeechTranslate from '../views/SpeechTranslate.vue'
import Encode from '../views/Encode.vue'
import Crypto from '../views/Crypto.vue'
import Random from '../views/Random.vue'

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
  },
  {
    path: '/tool_box/crypto',
    name: 'crypto',
    component: Crypto
  },
  {
    path: '/tool_box/random',
    name: 'random',
    component: Random
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL || '/func_intf/'),
  routes
})

export default router
