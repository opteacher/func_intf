import { createRouter, RouteRecordRaw, createWebHashHistory } from 'vue-router'
import SpeechTranslate from '../views/SpeechTranslate.vue'
import Encode from '../views/Encode.vue'
import Crypto from '../views/Crypto.vue'
import Random from '../views/Random.vue'
import Policy from '../views/Policy.vue'
import Role from '../views/Role.vue'
import User from '../views/User.vue'
import Secret from '../views/Secret.vue'
import Guide from '../views/Guide.vue'
import ChatGLM from '../views/ChatGLM.vue'
import ImageOptimize from '../views/ImageOptimize.vue'
import CustomFormView from '../views/CustomFormView.vue'
import CustomFormDsgn from '../views/CustomFormDsgn.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/func_intf/speech_translation'
  },
  {
    path: '/func_intf',
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
  },
  {
    path: '/func_intf/secret/guide',
    name: 'guide',
    component: Guide
  },
  {
    path: '/func_intf/chat_glm/chat',
    name: 'chat_glm',
    component: ChatGLM
  },
  {
    path: '/func_intf/image_optimize/denoise',
    name: 'image_denoise',
    component: ImageOptimize
  },
  {
    path: '/func_intf/image_optimize/faceRes',
    name: 'image_faceRes',
    component: ImageOptimize
  },
  {
    path: '/func_intf/custom_form/view',
    name: 'custom_formView',
    component: CustomFormView
  },
  {
    path: '/func_intf/custom_form/design',
    name: 'custom_formDsgn',
    component: CustomFormDsgn
  }
]

const router = createRouter({
  history: createWebHashHistory(process.env.BASE_URL || '/func_intf'),
  routes
})

export default router
