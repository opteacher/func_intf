<script setup lang="ts">
import EditableTable from '@lib/components/EditableTable.vue'
import Mapper from '@lib/types/mapper'
import Column from '@lib/types/column'
import Role from '@/types/role'
import api from '@/api'
import { TinyEmitter as Emitter } from 'tiny-emitter'
import { onMounted } from 'vue'
import Policy from '@/types/policy'

const emitter = new Emitter()

onMounted(async () => {
  emitter.emit('update:mapper', {
    policy: {
      options: (await api.secret.policy.all()).map((policy: Policy) => ({
        value: policy.name,
        label: policy.name
      }))
    }
  })
})
</script>

<template>
  <EditableTable
    title="角色"
    icon="solution-outlined"
    :api="api.secret.role"
    :columns="[
      new Column('名称', 'name'),
      new Column('角色ID', 'key'),
      new Column('策略', 'policy')
    ]"
    :mapper="
      new Mapper({
        name: {
          label: '名称',
          type: 'Input'
        },
        key: {
          label: '角色ID',
          type: 'Input',
          disabled: true
        },
        policy: {
          label: '策略',
          type: 'Select'
        }
      })
    "
    :copy="Role.copy"
    :emitter="emitter"
    sclHeight="h-full"
    :editable="false"
    size="middle"
  >
    <template #policy="{ record: role }">
      <router-link to="/func_intf/secret/policy">{{ role.policy }}</router-link>
    </template>
  </EditableTable>
</template>
