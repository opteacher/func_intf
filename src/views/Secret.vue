<script setup lang="ts">
import { LogoutOutlined } from '@ant-design/icons-vue'
import EditableTable from '@lib/components/EditableTable.vue'
import { TreeProps, notification } from 'ant-design-vue'
import { onMounted, reactive, ref } from 'vue'
import { KeyOutlined } from '@ant-design/icons-vue'
import Column from '@lib/types/column'
import Mapper from '@lib/types/mapper'
import { Cond } from '@lib/types'
import { TinyEmitter as Emitter } from 'tiny-emitter'
import api from '@/api'
import KV from '@/types/kv'
import Login from '@/types/login'

const treeData: TreeProps['treeData'] = reactive([])
const expandedKeys = ref<string[]>([])
const selectedKeys = ref<string[]>([])
const emitter = new Emitter()
const lgnForm = reactive(new Login())
const logined = ref(false)

onMounted(async () => {
  treeData.splice(0, treeData?.length, await api.secret.secret.all())
  if (window.localStorage.getItem('token')) {
    logined.value = true
  }
})

async function onLogin(form: Login) {
  try {
    await api.secret.user.login(form)
    logined.value = true
  } catch (e) {
    notification.error({
      message: '登录失败！',
      description: '错误的登录ID或密钥ID！'
    })
  }
}
function onLogout() {
  window.localStorage.removeItem('token')
  logined.value = false
}
</script>

<template>
  <div v-if="!logined" class="h-full">
    <a-form class="w-5/12 text-center" :model="lgnForm" autocomplete="off" @finish="onLogin">
      <a-form-item
        label="登录ID"
        name="roleId"
        :rules="[{ required: true, message: '必须输入登录ID！' }]"
      >
        <a-input placeholder="输入登录ID" v-model:value="lgnForm.roleId" />
      </a-form-item>
      <a-form-item
        label="密钥ID"
        name="secretId"
        :rules="[{ required: true, message: '必须输入密钥ID！' }]"
      >
        <a-input-password placeholder="输入密钥ID" v-model:value="lgnForm.secretId" />
      </a-form-item>
      <a-form-item>
        <a-space :size="8">
          <a-button html-type="submit" type="primary">登录</a-button>
          <a-button type="button" @click="() => $router.push('/func_intf/secret/user')">
            注册
          </a-button>
        </a-space>
      </a-form-item>
    </a-form>
  </div>
  <div v-else class="h-full flex flex-col">
    <div class="flex">
      <h3 class="flex-1 mb-0 ml-2">
        <key-outlined class="text-3xl" />
        密钥
      </h3>
      <a-button @click="onLogout">
        <template #icon><logout-outlined /></template>
        登出
      </a-button>
    </div>
    <a-row class="flex-1">
      <a-col class="h-full" :span="8">
        <a-tree
          :show-line="true"
          v-model:expandedKeys="expandedKeys"
          v-model:selectedKeys="selectedKeys"
          :tree-data="treeData"
          @select="() => emitter.emit('refresh')"
        />
      </a-col>
      <a-col class="h-full" :span="16">
        <EditableTable
          :title="`${selectedKeys[0] || 'root'} 包含键值`"
          :api="{
            all: () => api.secret.secret.kv.all(selectedKeys[0])
          }"
          :columns="[new Column('键', 'subKey'), new Column('值', 'subVal')]"
          :mapper="
            new Mapper({
              secret: {
                label: '所在密钥',
                type: 'Input',
                disabled: [Cond.copy({ key: 'key', cmp: '!=', val: '' })]
              },
              subKey: {
                label: '键',
                type: 'Input'
              },
              subVal: {
                label: '值',
                type: 'Input'
              }
            })
          "
          :copy="KV.copy"
          :emitter="emitter"
          size="middle"
          sclHeight="h-full"
        />
      </a-col>
    </a-row>
  </div>
</template>
