<script setup lang="ts">
import EditableTable from '@lib/components/EditableTable.vue'
import { TreeProps } from 'ant-design-vue'
import { ref } from 'vue'
import { KeyOutlined } from '@ant-design/icons-vue'
import Column from '@lib/types/column'
import Mapper from '@lib/types/mapper'
import { TinyEmitter as Emitter } from 'tiny-emitter'

const treeData: TreeProps['treeData'] = [
  {
    title: 'parent 1',
    key: '0-0',
    children: [
      {
        title: 'parent 1-0',
        key: '0-0-0',
        children: [
          { title: 'leaf', key: '0-0-0-0' },
          { title: 'leaf', key: '0-0-0-1' }
        ]
      },
      {
        title: 'parent 1-1',
        key: '0-0-1',
        children: [{ key: '0-0-1-0', title: 'sss' }]
      }
    ]
  }
]
const expandedKeys = ref<string[]>(['0-0-0', '0-0-1'])
const selectedKeys = ref<string[]>(['0-0-0', '0-0-1'])
const checkedKeys = ref<string[]>(['0-0-0', '0-0-1'])

const emitter = new Emitter()
</script>

<template>
  <div class="h-full flex flex-col">
    <h3 class="mb-0 ml-2">
      <key-outlined class="text-3xl" />
      密钥
    </h3>
    <a-row class="flex-1">
      <a-col class="h-full" :span="10">
        <a-tree
          v-model:expandedKeys="expandedKeys"
          v-model:selectedKeys="selectedKeys"
          v-model:checkedKeys="checkedKeys"
          checkable
          :tree-data="treeData"
        />
      </a-col>
      <a-col class="h-full" :span="14">
        <EditableTable
          :api="{ all: () => [] }"
          :columns="[new Column('键', 'k'), new Column('值', 'v')]"
          :mapper="
            new Mapper({
              k: {
                label: '键',
                type: 'Input'
              },
              v: {
                label: '值',
                type: 'Input'
              }
            })
          "
          :emitter="emitter"
          size="middle"
          sclHeight="h-full"
        />
      </a-col>
    </a-row>
  </div>
</template>
