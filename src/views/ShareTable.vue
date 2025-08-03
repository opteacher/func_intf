<script setup lang="ts">
import EditableTable from '@lib/components/EditableTable.vue'
import Column from '@lib/types/column'
import Mapper from '@lib/types/mapper'
import { newOne } from '@lib/utils'
import STable from '@/types/sTable'
import { reactive } from 'vue'
import { CloseOutlined } from '@ant-design/icons-vue'

const shareTable = reactive({
  api: { all: () => [] },
  columns: [new Column('名称', 'name'), new Column('表单结构', 'form')],
  mapper: new Mapper({
    name: {
      type: 'Input',
      label: '表格名称'
    },
    form: {
      type: 'JsonEditor',
      label: '表单结构'
    }
  })
})
const tableDesign = reactive({
  columns: [
    {
      title: '新增列',
      dataIndex: 'addCol',
      key: 'addCol'
    }
  ],
  data: [{ addCol: '类型' }],
  form: {

  }
})

function onAddColClick() {
  if (!tableDesign.columns.find(col => col.key === 'newCol')) {
    tableDesign.columns.push({ title: '', dataIndex: 'newCol', key: 'newCol' })
  }
}
</script>

<template>
  <EditableTable
    title="共享表格"
    :api="shareTable.api"
    :columns="shareTable.columns"
    :mapper="shareTable.mapper"
    :new-fun="() => newOne(STable)"
  >
    <template #formEDT>
      <a-table :data-source="tableDesign.data" :columns="tableDesign.columns" :pagination="false">
        <template #headerCell="{ column }">
          <template v-if="column.key === 'addCol'">
            <a-button type="link" @click="onAddColClick">新增列</a-button>
          </template>
          <template v-else-if="column.key === 'newCol'">
            <a-input class="flex-1" v-model:value="column.title" placeholder="请输入列名">
              <template #suffix>
                <a-button type="text" danger size="small">
                  <template #icon><CloseOutlined /></template>
                </a-button>
              </template>
            </a-input>
          </template>
        </template>
        <template #bodyCell="{ column }">
          <template v-if="column.key === 'newCol'">
            <a-select />
          </template>
        </template>
      </a-table>
    </template>
  </EditableTable>
</template>
