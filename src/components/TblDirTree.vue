<script setup lang="ts">
import type STable from '@/types/sTable'
import {
  TableOutlined,
  FolderAddOutlined,
  CheckOutlined,
  SelectOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue'
import type { DataNode } from 'ant-design-vue/es/tree'
import { onMounted, reactive, ref, watch, type PropType } from 'vue'

const props = defineProps({
  stables: { type: Array as PropType<STable[]>, required: true },
  selKey: { type: String, default: '' }
})
const emit = defineEmits(['update:selKey', 'add-table'])
const expandedKeys = ref<string[]>([])
const selectedKeys = ref<string[]>([props.selKey])
const treeData = reactive<DataNode[]>([])
const editDir = ref('')

onMounted(refresh)
watch(() => props.selKey, refresh)
watch(() => props.stables, refresh, { deep: true })

function refresh() {
  selectedKeys.value[0] = props.selKey
  treeData.splice(0, treeData.length)
  for (const stable of props.stables) {
    if (stable.path.length) {
      let arr = treeData
      for (const key of stable.path) {
        let pnode = arr.find(nd => nd.key === key)
        if (pnode) {
          arr = pnode.children || []
        } else {
          pnode = { key, title: key, children: [], isLeaf: false }
          arr.push(pnode)
          arr = pnode.children as DataNode[]
        }
      }
      arr.push({ key: stable.key, title: stable.name, stable, isLeaf: true })
    } else {
      treeData.push({ key: stable.key, title: stable.name, stable, isLeaf: true })
    }
  }
}
function onAddDirClick(nodes: DataNode[] = treeData) {
  nodes.push({ key: 'addDir', title: '', children: [], isLeaf: false })
}
function onAddDirSubmit() {
  rmvNodeByKey('addDir')
  if (editDir.value) {
    treeData.push({ key: editDir.value, title: editDir.value, children: [], isLeaf: false })
    editDir.value = ''
  }
}
function rmvNodeByKey(key: string, ndArray: DataNode[] = treeData) {
  const index = ndArray.findIndex(nd => nd.key === key)
  if (index !== -1) {
    ndArray.splice(index, 1)
  } else {
    for (const node of ndArray) {
      rmvNodeByKey(key, node.children || [])
    }
  }
}
function onCtxMnuClick(nkey: string, mkey: 'select' | 'addDir' | 'addTbl' | 'delete') {
  switch (mkey) {
    case 'select':
      emit('update:selKey', nkey)
      break
    case 'addDir':
      {
        const node = findNodeByKey(nkey)
        if (node) {
          expandedKeys.value.push(node?.key as string)
          onAddDirClick(node?.children)
        }
      }
      break
    case 'addTbl':
      emit('add-table', { path: pathNodeByKey(nkey) })
      break
    case 'delete':
      break
  }
}
function findNodeByKey(key: string, ndArray: DataNode[] = treeData): DataNode | undefined {
  const index = ndArray.findIndex(nd => nd.key === key)
  if (index !== -1) {
    return ndArray[index]
  } else {
    for (const node of ndArray) {
      const match = findNodeByKey(key, node.children)
      if (match) {
        return match
      }
    }
  }
}
function pathNodeByKey(key: string, ndArray: DataNode[] = treeData): string[] {
  const index = ndArray.findIndex(nd => nd.key === key)
  if (index === -1) {
    for (const node of ndArray) {
      const paths = pathNodeByKey(key, node.children)
      if (paths.length) {
        return [key].concat(paths)
      }
    }
  }
  return []
}
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
      <template #extra>
        <a-tooltip>
          <template #title>当前表格同目录添加文件夹</template>
          <a-button type="primary" ghost size="small" @click="() => onAddDirClick()">
            <template #icon><FolderAddOutlined /></template>
          </a-button>
        </a-tooltip>
      </template>
    </a-page-header>
    <a-divider class="my-3" />
    <a-directory-tree
      class="flex-1"
      v-model:expandedKeys="expandedKeys"
      v-model:selectedKeys="selectedKeys"
      multiple
      :tree-data="treeData"
      @select="([key]: string[]) => key === 'addDir' ? undefined : emit('update:selKey', key)"
    >
      <template #title="{ key, title, isLeaf }">
        <a-input
          v-if="key === 'addDir'"
          class="my-1"
          size="small"
          allow-clear
          v-model:value="editDir"
        >
          <template #suffix>
            <a-button type="link" size="small" @click.stop="onAddDirSubmit">
              <template #icon><CheckOutlined /></template>
            </a-button>
          </template>
        </a-input>
        <a-dropdown v-else :trigger="['contextmenu']">
          <span>{{ title }}</span>
          <template v-if="isLeaf" #overlay>
            <a-menu @click="({ key: menuKey }: any) => onCtxMnuClick(key, menuKey)">
              <a-menu-item key="select">
                <template #icon><SelectOutlined /></template>
                选中
              </a-menu-item>
              <a-menu-item key="delete" danger>
                <template #icon><DeleteOutlined /></template>
                删除
              </a-menu-item>
            </a-menu>
          </template>
          <template v-else #overlay>
            <a-menu @click="({ key: menuKey }: any) => onCtxMnuClick(key, menuKey)">
              <a-menu-item key="addDir">
                <template #icon><FolderAddOutlined /></template>
                创建子文件夹
              </a-menu-item>
              <a-menu-item key="addTbl">
                <template #icon><TableOutlined /></template>
                创建表格
              </a-menu-item>
              <a-menu-item key="delete" danger>
                <template #icon><DeleteOutlined /></template>
                删除
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </template>
    </a-directory-tree>
  </div>
</template>
