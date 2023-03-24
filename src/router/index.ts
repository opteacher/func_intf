import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import SpeechTranslate from '../views/SpeechTranslate.vue'
import Encode from '../views/Encode.vue'
import Crypto from '../views/Crypto.vue'
import Random from '../views/Random.vue'
import Policy from '../views/Policy.vue'
import Role from '../views/Role.vue'
import User from '../views/User.vue'
import Secret from '../views/Secret.vue'
import Guide from '../views/Guide.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/secret-manager',
    redirect: '/secret-manager/speech_translation'
  },
  {
    path: '/secret-manager/speech_translation',
    name: 'speech_translation',
    component: SpeechTranslate
  },
  {
    path: '/secret-manager/tool_box/encode',
    name: 'encode',
    component: Encode
  },
  {
    path: '/secret-manager/tool_box/crypto',
    name: 'crypto',
    component: Crypto
  },
  {
    path: '/secret-manager/tool_box/random',
    name: 'random',
    component: Random
  },
  {
    path: '/secret-manager/secret/policy',
    name: 'policy',
    component: Policy
  },
  {
    path: '/secret-manager/secret/role',
    name: 'role',
    component: Role
  },
  {
    path: '/secret-manager/secret/user',
    name: 'user',
    component: User
  },
  {
    path: '/secret-manager/secret/manage',
    name: 'secret',
    component: Secret
  },
  {
    path: '/secret-manager/secret/guide',
    name: 'guide',
    component: Guide
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL || '/secret-manager'),
  routes
})

export default router
