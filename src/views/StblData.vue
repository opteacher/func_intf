<script setup lang="ts">
import EditableTable from '@lib/components/EditableTable.vue'
import { notification } from 'ant-design-vue'
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api'
import Column from '@lib/types/column'
import { TinyEmitter } from 'tiny-emitter'
import Mapper, { newObjByMapper } from '@lib/types/mapper'
import { LeftOutlined } from '@ant-design/icons-vue'
import STable from '@/types/sTable'

const route = useRoute()
const router = useRouter()
const stable = reactive<STable>(new STable())
const emitter = new TinyEmitter()
const mapper = ref(new Mapper())
const columns = reactive<Column[]>([])

onMounted(async () => {
  if (!route.query.tid) {
    notification.warn({
      message: '操作错误',
      description: '必须从共享表格页选择跳转到数据表格页！'
    })
    router.replace('/func_intf/share_table/table')
  }
  STable.copy(await api.shareTable.stable.get(route.query.tid as string), stable)
  columns.splice(
    0,
    columns.length,
    ...Object.entries(stable.form).map(([key, value]) => new Column(value.label, key))
  )
  emitter.emit('refresh')
  mapper.value = new Mapper(stable.form)
  emitter.emit('update:mapper', mapper.value)
})
</script>

<template>
  <EditableTable
    :edit-mode="stable.editMod"
    :emitter="emitter"
    :api="api.shareTable.data"
    :mapper="mapper"
    :columns="columns"
    :new-fun="() => newObjByMapper(mapper)"
  >
    <template #title>
      <a-space>
        <a-button type="text" @click="() => router.back()">
          <template #icon><LeftOutlined /></template>
        </a-button>
        数据管理
      </a-space>
    </template>
  </EditableTable>
</template>
