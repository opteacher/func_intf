import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import SpeechTranslate from '../views/SpeechTranslate.vue'
import Encode from '../views/Encode.vue'
import Crypto from '../views/Crypto.vue'
import Random from '../views/Random.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/func_intf/speech_translation'
  },
  {
    path: '/func_intf/speech_translation',
    name: 'speech_translation',
    component: SpeechTranslate
  },
  {
    path: '/func_intf/tool_box/encode',
    name: 'encode',
    component: Encode
  },
  {
    path: '/func_intf/tool_box/crypto',
    name: 'crypto',
    component: Crypto
  },
  {
    path: '/func_intf/tool_box/random',
    name: 'random',
    component: Random
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL || '/func_intf/'),
  routes
})

export default router
