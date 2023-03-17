import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import SpeechTranslate from '../views/SpeechTranslate.vue'
import Encode from '../views/Encode.vue'
import Crypto from '../views/Crypto.vue'
import Random from '../views/Random.vue'
import Policy from '../views/Policy.vue'
import Role from '../views/Role.vue'
import User from '../views/User.vue'
import Secret from '../views/Secret.vue'

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
  },
  {
    path: '/func_intf/secret/policy',
    name: 'policy',
    component: Policy
  },
  {
    path: '/func_intf/secret/role',
    name: 'role',
    component: Role
  },
  {
    path: '/func_intf/secret/user',
    name: 'user',
    component: User
  },
  {
    path: '/func_intf/secret/manage',
    name: 'secret',
    component: Secret
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL || '/func_intf/'),
  routes
})

export default router
