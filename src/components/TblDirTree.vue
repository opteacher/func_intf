<script setup lang="ts">
import type STable from '@/types/sTable'
import {
  TableOutlined,
  FolderAddOutlined,
  CheckOutlined,
  SelectOutlined,
  DeleteOutlined,
  FolderOpenOutlined,
  FolderOutlined
} from '@ant-design/icons-vue'
import type { DataNode } from 'ant-design-vue/es/tree'
import { onMounted, reactive, ref, watch, type PropType } from 'vue'

const props = defineProps({
  stables: { type: Array as PropType<STable[]>, required: true },
  selKey: { type: String, default: '' }
})
const emit = defineEmits(['update:selKey', 'add-table', 'del-tables'])
const expandedKeys = ref<string[]>([])
const selectedKeys = ref<string[]>([props.selKey])
const treeData = reactive<DataNode[]>([])
const editDir = ref('')

onMounted(refresh)
watch(() => props.selKey, refresh)
watch(() => props.stables, refresh, { deep: true })

function refresh() {
  selectedKeys.value[0] = props.selKey
  const stable = props.stables.find(tbl => tbl.key === props.selKey)
  if (stable?.path.length) {
    let prevKey = ''
    for (const part of stable?.path) {
      prevKey = prevKey ? [prevKey, part].join('.') : part
      expandedKeys.value.push(prevKey)
    }
  }

  treeData.splice(0, treeData.length)
  for (const stable of props.stables) {
    if (stable.path.length) {
      let arr = treeData
      let prevKey = ''
      for (const part of stable.path) {
        prevKey = prevKey ? [prevKey, part].join('.') : part
        let pnode = arr.find(nd => nd.key === prevKey)
        if (pnode) {
          arr = pnode.children || []
        } else {
          pnode = { key: prevKey, title: part, children: [], isLeaf: false }
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
function onAddDirClick() {
  let nodes = treeData
  if (selectedKeys.value.length) {
    const selNode = findNodeByKey(selectedKeys.value[0])
    if (selNode && !selNode.isLeaf) {
      selNode.children = selNode.children || []
      nodes = selNode.children
    }
  }
  nodes.push({ key: 'addDir', title: '', children: [], isLeaf: false })
}
function onAddDirSubmit() {
  const pnode = rmvNodeByKey('addDir')
  if (editDir.value) {
    const newNode = {
      key: pnode && pnode.key ? [pnode.key, editDir.value].join('.') : editDir.value,
      title: editDir.value,
      children: [],
      isLeaf: false
    }
    if (pnode) {
      pnode.children = pnode.children ? pnode.children.concat([newNode]) : [newNode]
    } else {
      treeData.push(newNode)
    }
    editDir.value = ''
  }
}
function rmvNodeByKey(
  key: string,
  ndArray: DataNode[] = treeData,
  parent?: DataNode
): DataNode | undefined {
  const index = ndArray.findIndex(nd => nd.key === key)
  if (index !== -1) {
    ndArray.splice(index, 1)
    return parent
  } else {
    for (const node of ndArray) {
      const ret = rmvNodeByKey(key, node.children || [], node)
      if (ret) {
        return ret
      }
    }
  }
}
function onCtxMnuClick(nkey: string, mkey: 'select' | 'addDir' | 'addTbl' | 'delete') {
  switch (mkey) {
    case 'select':
      emit('update:selKey', nkey)
      break
    case 'addDir':
      selectedKeys.value = [nkey]
      onAddDirClick()
      break
    case 'addTbl':
      emit('add-table', { path: nkey.split('.') })
      break
    case 'delete':
      {
        const node = findNodeByKey(nkey)
        if (node) {
          // @_@：暂时不做文件夹删除
          emit('del-tables', node.isLeaf ? [node.key] : undefined)
        }
      }
      break
  }
}
function findNodeByKey(key: string, ndArray: DataNode[] = treeData): DataNode | undefined {
  const index = ndArray.findIndex(nd => nd.key === key)
  if (index !== -1) {
    return ndArray[index]
  } else {
    for (const node of ndArray) {
      const match = findNodeByKey(key, node.children || [])
      if (match) {
        return match
      }
    }
  }
}
function onNodeSelect([key]: string[], { node }: { node: DataNode }) {
  !node.isLeaf ? undefined : emit('update:selKey', key)
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
      @select="onNodeSelect"
    >
      <template #icon="{ isLeaf, expanded }">
        <TableOutlined v-if="isLeaf" />
        <FolderOpenOutlined v-else-if="expanded" />
        <FolderOutlined v-else />
      </template>
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
