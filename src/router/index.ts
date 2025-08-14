import { createRouter, type RouteRecordRaw, createWebHashHistory } from 'vue-router'
import Audio2Words from '../views/Audio2Words.vue'
import Encode from '../views/Encode.vue'
import Crypto from '../views/Crypto.vue'
import Random from '../views/Random.vue'
import Policy from '../views/Policy.vue'
import Role from '../views/Role.vue'
import User from '../views/User.vue'
import Secret from '../views/Secret.vue'
import Guide from '../views/Guide.vue'
import MagicPDF from '../views/MagicPDF.vue'
import ImageOptimize from '../views/ImageOptimize.vue'
import CstmFormView from '../views/CstmFormView.vue'
import CstmFormDsgn from '../views/CstmFormDsgn.vue'
import CstmFormTable from '../views/CstmFormTable.vue'
import ShareTable from '../views/ShareTable.vue'
import StblUser from '../views/StblUser.vue'
import StblData from '../views/StblData.vue'
import ShareTable1 from '../views/ShareTable1.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/func_intf/audio_words'
  },
  {
    path: '/func_intf',
    redirect: '/func_intf/audio_words'
  },
  {
    path: '/func_intf/audio_words',
    name: 'audio_words',
    component: Audio2Words
  },
  {
    path: '/func_intf/magic_pdf',
    name: 'magic_pdf',
    component: MagicPDF
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
    path: '/func_intf/custom_form/view/:fid',
    name: 'custom_formView',
    component: CstmFormView
  },
  {
    path: '/func_intf/custom_form/design',
    name: 'custom_formDsgn',
    component: CstmFormDsgn
  },
  {
    path: '/func_intf/custom_form/table/:fid',
    name: 'custom_formTable',
    component: CstmFormTable
  },
  {
    path: '/func_intf/share_table/table',
    name: 'share_tableTable',
    component: ShareTable
  },
  {
    path: '/func_intf/share_table/user',
    name: 'share_tableUser',
    component: StblUser
  },
  {
    path: '/func_intf/share_table/data',
    name: 'share_tableData',
    component: StblData
  },
  {
    path: '/func_intf/share_table/table1',
    name: 'share_tableTable1',
    component: ShareTable1
  }
]

const router = createRouter({
  history: createWebHashHistory('/func_intf'),
  routes
})

export default router
