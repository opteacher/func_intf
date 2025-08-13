<script setup lang="ts">
import type STable from '@/types/sTable'
import { TableOutlined } from '@ant-design/icons-vue'
import type { TreeProps } from 'ant-design-vue'
import type { DataNode } from 'ant-design-vue/es/tree'
import { computed, ref, watch, type PropType } from 'vue'

const props = defineProps({
  stables: { type: Array as PropType<STable[]>, required: true },
  selKey: { type: String, default: '' }
})
const emit = defineEmits(['update:selKey'])
const expandedKeys = ref<string[]>([])
const selectedKeys = ref<string[]>([props.selKey])
const treeData = computed<TreeProps['treeData']>(() => {
  const ret = [] as DataNode[]
  for (const stable of props.stables) {
    if (stable.path.length) {
      let arr = ret
      for (const key of stable.path) {
        let pnode = arr.find(nd => nd.key === key)
        if (pnode) {
          arr = pnode.children || []
        } else {
          pnode = { key, title: key, children: [] }
          arr.push(pnode)
          arr = pnode.children as DataNode[]
        }
      }
      arr.push({ key: stable.key, title: stable.name, stable })
    } else {
      ret.push({ key: stable.key, title: stable.name, stable })
    }
  }
  return ret
})

watch(
  () => props.selKey,
  () => (selectedKeys.value[0] = props.selKey)
)
</script>

<template>
  <div class="flex flex-col">
    <a-page-header class="p-0">
      <template #avatar>
        <TableOutlined class="text-xl mr-1" />
      </template>
      <template #title>
        <a-typography-title class="mb-0" :level="5">共享表格</a-typography-title>
      </template>
    </a-page-header>
    <a-divider class="my-3" />
    <a-directory-tree
      class="flex-1"
      v-model:expandedKeys="expandedKeys"
      v-model:selectedKeys="selectedKeys"
      multiple
      :tree-data="treeData"
      @select="([key]: string[]) => emit('update:selKey', key)"
    />
  </div>
</template>
