<script setup lang="ts">
import api from '../api'
import Column from '@lib/types/column'
import Mapper from '@lib/types/mapper'
import User from '@/types/user'
import { TinyEmitter as Emitter } from 'tiny-emitter'
import { createVNode, onMounted } from 'vue'
import Role from '@/types/role'
import { Cond } from '@lib/types'
import { Modal } from 'ant-design-vue'
import UsrGenCtt from '@/components/UsrGenCtt.vue'
import { pickOrIgnore } from '@lib/utils'

const emitter = new Emitter()
const columns = [
  new Column('访客ID', 'key'),
  new Column('角色', 'role'),
  new Column('创建时间', 'creation_time')
]
const mapper = new Mapper({
  key: {
    label: '访客ID',
    type: 'Input',
    disabled: true
  },
  role: {
    label: '角色',
    type: 'Select',
    rules: [{ required: true, message: '必须选择角色！' }]
  },
  creation_time: {
    label: '创建时间',
    type: 'DateTime',
    display: [new Cond({ prop: 'key', compare: '!=', value: '' })]
  }
})

onMounted(async () => {
  emitter.emit('update:mapper', {
    role: {
      options: (await api.secret.role.all()).map((role: Role) => ({
        value: role.name,
        label: role.name
      }))
    }
  })
})

function onUserCreated(user: any) {
  Modal.success({
    title: '用户创建成功！',
    width: '60vw',
    content: createVNode(UsrGenCtt, pickOrIgnore(user, ['secretId'], false))
  })
}
</script>

<template>
  <EditableTable
    title="用户"
    icon="team-outlined"
    :api="api.secret.user"
    :columns="columns"
    :mapper="mapper"
    :copy="User.copy"
    :emitter="emitter"
    sclHeight="h-full"
    :editable="false"
    size="middle"
    @after-save="onUserCreated"
  >
    <template #keyEDT="{ editing: user }">
      <p v-if="!user.key" class="mb-0 text-red-400">
        访客ID是自动生成的，直接点击【确 认】生成用户密钥
      </p>
      <template v-else>{{ user.key }}</template>
    </template>
    <template #role="{ record: user }">
      <router-link to="/func_intf/secret/role">{{ user.role }}</router-link>
    </template>
    <template #creation_time="{ record: user }">
      {{ user.creation_time.format('YYYY/MM/DD HH:mm:ss') }}
    </template>
  </EditableTable>
</template>
