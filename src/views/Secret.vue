<script setup lang="ts">
import { LogoutOutlined, ExclamationCircleOutlined } from '@ant-design/icons-vue'
import EditableTable from '@lib/components/EditableTable.vue'
import SctValue from '@/components/SctValue.vue'
import { Modal, TreeProps, notification } from 'ant-design-vue'
import { createVNode, onMounted, reactive, ref } from 'vue'
import { KeyOutlined } from '@ant-design/icons-vue'
import Column from '@lib/types/column'
import Mapper from '@lib/types/mapper'
import { Cond, OpnType } from '@lib/types'
import { TinyEmitter as Emitter } from 'tiny-emitter'
import api from '@/api'
import KV from '@/types/kv'
import Login from '@/types/login'
import { OperType } from '@/types/policy'
import Role from '@/types/role'

const treeData: TreeProps['treeData'] = reactive([])
const expandedKeys = ref<string[]>([])
const selectedKeys = ref<string[]>([])
const emitter = new Emitter()
const lgnForm = reactive(new Login())
const logined = ref(false)
const capabilities = reactive<OperType[]>([])
const roleOpns = reactive<OpnType[]>([])
const vwVals = reactive<Set<string>>(new Set())

onMounted(refresh)

async function refresh() {
  if (window.localStorage.getItem('token')) {
    logined.value = true
    treeData?.splice(0, treeData.length, await api.secret.secret.all())
  } else {
    roleOpns.splice(
      0,
      roleOpns.length,
      ...(await api.secret.role
        .all()
        .then(roles => roles.map((role: Role) => ({ label: role.name, value: role.key }))))
    )
  }
}
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
  await refresh()
}
async function onLogout() {
  window.localStorage.removeItem('token')
  logined.value = false
  await refresh()
}
function onSecretClick(_selKeys: string[], { selectedNodes }: any) {
  capabilities.splice(0, capabilities.length, ...(selectedNodes[0].capabilities as OperType[]))
  emitter.emit('refresh')
}
function onRmvSctClick() {
  Modal.confirm({
    title: '确定删除该密钥节点吗？',
    icon: createVNode(ExclamationCircleOutlined),
    content: '删除节点的同时，所有该节点的键值也会同时被删除！',
    okType: 'danger',
    onOk: () => api.secret.secret.remove(selectedKeys.value[0]).then(refresh)
  })
}
</script>

<template>
  <div v-if="!logined" class="h-full">
    <a-form
      class="w-5/12 text-center"
      :label-col="{ span: 4 }"
      :model="lgnForm"
      autocomplete="off"
      @finish="onLogin"
    >
      <a-form-item
        label="角色"
        name="roleId"
        :rules="[{ required: true, message: '必须输入登录ID！' }]"
      >
        <a-select placeholder="选择登录角色" :options="roleOpns" v-model:value="lgnForm.roleId" />
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
  <div v-else class="h-full flex flex-col space-y-2">
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
    <a-row class="flex-1" :gutter="8">
      <a-col class="h-full flex flex-col" :span="8">
        <a-tree
          class="flex-1"
          :show-line="true"
          v-model:expandedKeys="expandedKeys"
          v-model:selectedKeys="selectedKeys"
          :tree-data="treeData"
          @select="onSecretClick"
        />
        <a-button
          v-if="selectedKeys[0] && capabilities.includes('delete')"
          danger
          type="ghost"
          @click="onRmvSctClick"
        >
          删除密钥
        </a-button>
      </a-col>
      <a-col class="h-full" :span="16">
        <EditableTable
          :title="`${selectedKeys[0] || 'root'} 包含的键值`"
          :api="{
            all: () =>
              capabilities.includes('list') ? api.secret.secret.kv.all(selectedKeys[0]) : [],
            add: api.secret.secret.kv.save,
            update: api.secret.secret.kv.save,
            remove: api.secret.secret.kv.remove
          }"
          :columns="[new Column('键', 'skey'), new Column('值', 'svalue')]"
          :mapper="
            new Mapper({
              secret: {
                label: '所在密钥',
                type: 'Input',
                disabled: [
                  Cond.copy({ key: 'key', cmp: '!=', val: '' }),
                  Cond.copy({ key: 'key', cmp: '!=', val: 'undefined' })
                ]
              },
              skey: {
                label: '键',
                type: 'Input'
              },
              svalue: {
                label: '值',
                type: 'Input'
              }
            })
          "
          :copy="KV.copy"
          :emitter="emitter"
          size="middle"
          sclHeight="h-full"
          :addable="capabilities.includes('create')"
          :editable="capabilities.includes('update')"
          :delable="capabilities.includes('delete')"
          :clkable="false"
          @add="() => emitter.emit('update:data', { secret: selectedKeys[0] })"
        >
          <template #svalue="{ record: kv }"><SctValue :kv="kv" :vwVals="vwVals" /></template>
        </EditableTable>
      </a-col>
    </a-row>
  </div>
</template>
