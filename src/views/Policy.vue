<script setup lang="ts" name="Policy">
import EditableTable from '@lib/components/EditableTable.vue'
import Column from '@lib/types/column'
import Mapper from '@lib/types/mapper'
import Policy, { PlcPath, operOpns } from '@/types/policy'
import { TinyEmitter as Emitter } from 'tiny-emitter'
import api from '@/api'
import { Cond } from '@lib/types'
import { fixStartsWith, setProp } from '@lib/utils'

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
          type: 'Input',
          disabled: [
            Cond.copy({ key: 'name', cmp: '!=', val: '' }),
            Cond.copy({ key: 'name', cmp: '!=', val: 'undefined' })
          ],
          rules: [{ required: true, message: '必须输入名称！' }]
        },
        policy: {
          label: '策略',
          type: 'CodeEditor',
          rules: [{ required: true, message: '必须包含策略！' }]
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
        :api="{
          all: () => api.secret.policy.path.all(policy),
          add: (path: PlcPath) => api.secret.policy.path.save(policy, path),
          update: (path: PlcPath) => api.secret.policy.path.save(policy, path),
          remove: (path: PlcPath) => api.secret.policy.path.remove(policy, path)
        }"
        :columns="[
          new Column('路径', 'path'),
          new Column('权限', 'capabilities'),
          new Column('备注', 'remark', { width: 200 })
        ]"
        :mapper="
          new Mapper({
            path: {
              label: '路径',
              type: 'Input',
              rules: [{ required: true, message: '必须输入路径！' }]
            },
            capabilities: {
              label: '权限',
              type: 'EditList',
              mapper: {
                value: {
                  type: 'Select',
                  options: operOpns
                }
              },
              rules: [{ required: true, message: '至少包含一个权限！' }]
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
        @save="() => plcEmit.emit('refresh')"
        @delete="() => plcEmit.emit('refresh')"
      >
        <template #pathEDT="{ editing: path }">
          <a-input
            v-model:value="path.path"
            @change="
              (e: any) => setProp(path, 'path', fixStartsWith(e.target?.value, '/secret/data/'))
            "
          />
        </template>
      </EditableTable>
    </template>
  </EditableTable>
</template>
