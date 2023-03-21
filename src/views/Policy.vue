<script setup lang="ts">
import EditableTable from '@lib/components/EditableTable.vue'
import Column from '@lib/types/column'
import Mapper from '@lib/types/mapper'
import Policy, { PlcPath, operOpns } from '@/types/policy'
import { TinyEmitter as Emitter } from 'tiny-emitter'
import api from '@/api'

const plcEmit = new Emitter()
const pathEmit = new Emitter()
</script>

<template>
  <EditableTable
    title="策略"
    icon="audit-outlined"
    :api="api.secret.policy"
    :columns="[new Column('名称', 'name')]"
    :mapper="
      new Mapper({
        name: {
          label: '名称',
          type: 'Input'
        },
        policy: {
          label: '策略',
          type: 'CodeEditor'
        }
      })
    "
    :copy="Policy.copy"
    :emitter="plcEmit"
    sclHeight="h-full"
    size="middle"
  >
    <template #expandedRowRender="{ record: policy }">
      <EditableTable
        title="规则"
        :api="api.secret.policy.path(policy)"
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
        size="small"
      />
    </template>
  </EditableTable>
</template>
