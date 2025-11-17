<script setup lang="ts">
import {
  LogoutOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  SubnodeOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue'
import SctValue from '@/components/SctValue.vue'
import { Modal, type TreeProps, notification } from 'ant-design-vue'
import { createVNode, onMounted, reactive, ref } from 'vue'
import { KeyOutlined } from '@ant-design/icons-vue'
import Column from '@lib/types/column'
import Mapper from '@lib/types/mapper'
import { Cond, type OpnType } from '@lib/types'
import { TinyEmitter as Emitter } from 'tiny-emitter'
import api from '@/api'
import KV from '@/types/kv'
import Login from '@/types/login'
import { type OperType } from '@/types/policy'
import Role from '@/types/role'
import { setProp } from '@lib/utils'

const treeData: TreeProps['treeData'] = reactive([])
const expandedKeys = ref<string[]>([])
const selectedKeys = ref<string[]>([])
const emitter = new Emitter()
const lgnForm = reactive(new Login())
const logined = ref(false)
const capabilities = reactive<OperType[]>([])
const roleOpns = reactive<OpnType[]>([])
const vwVals = reactive<Set<string>>(new Set())
const columns = [new Column('键', 'skey'), new Column('值', 'svalue')]
const mapper = new Mapper({
  secret: {
    label: '所在密钥',
    type: 'Input',
    disabled: [
      new Cond({ prop: 'key', compare: '!=', value: '' }),
      new Cond({ prop: 'key', compare: '!=', value: 'undefined' })
    ]
  },
  skey: {
    label: '键',
    type: 'Input'
  },
  svalue: {
    label: '值',
    type: 'Password'
  }
})

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
  if (!selectedKeys.value.length) {
    capabilities.splice(0, capabilities.length)
  } else {
    capabilities.splice(0, capabilities.length, ...(selectedNodes[0].capabilities as OperType[]))
  }
  emitter.emit('refresh')
}
function onRmvSctClick(delKey?: string) {
  if (!delKey) {
    delKey = selectedKeys.value[0]
  }
  Modal.confirm({
    title: `确定删除该密钥节点 ${delKey} 吗？`,
    icon: createVNode(ExclamationCircleOutlined),
    content: '删除节点的同时，所有该节点的键值也会同时被删除！',
    okType: 'danger',
    onOk: () => api.secret.secret.remove(delKey as string).then(refresh)
  })
}
function onCtxMuClick(treeKey: string, menuKey: 'create' | 'delete' | 'refresh') {
  switch (menuKey) {
    case 'create':
      emitter.emit('update:show', {
        show: true,
        cpyRcd: (form: any) => setProp(form, 'secret', treeKey)
      })
      break
    case 'delete':
      onRmvSctClick(treeKey)
      break
    case 'refresh':
      refresh()
      break
  }
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
        >
          <template #title="{ key: treeKey, title }">
            <a-dropdown :trigger="['contextmenu']">
              <span>{{ title }}</span>
              <template #overlay>
                <a-menu @click="({ key: menuKey }: any) => onCtxMuClick(treeKey, menuKey)">
                  <a-menu-item key="refresh">
                    <template #icon>
                      <reload-outlined />
                    </template>
                    刷新
                  </a-menu-item>
                  <a-menu-item key="create">
                    <template #icon>
                      <subnode-outlined />
                    </template>
                    新增
                  </a-menu-item>
                  <a-menu-item key="delete">
                    <template #icon>
                      <delete-outlined />
                    </template>
                    删除
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </template>
        </a-tree>
      </a-col>
      <a-col class="h-full" :span="16">
        <EditableTable
          :title="`${selectedKeys[0] || 'root'} 包含的键值`"
          :api="{
            all: () =>
              capabilities.includes('list') ? api.secret.secret.kv.all(selectedKeys[0]) : [],
            add: (sctKV: KV) => api.secret.secret.kv.save(sctKV, refresh),
            update: (sctKV: KV) => api.secret.secret.kv.save(sctKV, refresh),
            remove: (sctKV: KV) => api.secret.secret.kv.remove(sctKV, refresh)
          }"
          :columns="columns"
          :mapper="mapper"
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
