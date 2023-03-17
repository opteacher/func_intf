<script setup lang="ts">
import EditableTable from '@lib/components/EditableTable.vue'
import api from '../api'
import Column from '@lib/types/column'
import Mapper from '@lib/types/mapper'
import User from '@/types/user'
import { PlcPath, operOpns } from '@/types/policy'
import { TinyEmitter as Emitter } from 'tiny-emitter'
import { onMounted } from 'vue'
import Role from '@/types/role'

const emitter = new Emitter()
const pathEmit = new Emitter()

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
</script>

<template>
  <EditableTable
    title="用户"
    icon="team-outlined"
    :api="api.secret.user"
    :columns="[new Column('登录ID', 'roleId'), new Column('角色', 'role')]"
    :mapper="
      new Mapper({
        roleId: {
          label: '登录ID',
          type: 'Input',
          disabled: true
        },
        role: {
          label: '角色',
          type: 'Select'
        }
      })
    "
    :copy="User.copy"
    :emitter="emitter"
    sclHeight="h-full"
    :editable="false"
    size="middle"
  >
    <template #expandedRowRender="{ record: user }">
      <EditableTable
        title="规则"
        :api="{ all: () => user.policies }"
        :columns="[
          new Column('路径', 'path'),
          new Column('权限', 'capabilities'),
          new Column('备注', 'remark', { width: 200 })
        ]"
        :mapper="
          new Mapper({
            path: {
              label: '路径',
              type: 'Input'
            },
            capabilities: {
              label: '权限',
              type: 'EditList',
              mapper: {
                value: {
                  type: 'Select',
                  options: operOpns
                }
              }
            },
            remark: {
              label: '备注',
              type: 'Textarea'
            }
          })
        "
        :copy="PlcPath.copy"
        :emitter="pathEmit"
        :editable="false"
        size="small"
      />
    </template>
  </EditableTable>
</template>
