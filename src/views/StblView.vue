<template>
  <EditableTable
    :title="stable.name"
    :size="selView.size"
    :edit-mode="stable.edtMod"
    :emitter="emitter"
    :api="api.shareTable.data()"
    :columns="columns"
    :addable="false"
    :editable="false"
    :delable="false"
    @refresh="(records: any[], callback: Function) => genViewRefresh(stable, selView)(records, callback)"
  />
</template>

<script setup lang="ts">
import EditableTable from '@lib/components/EditableTable.vue'
import api from '@/api'
import { computed, nextTick, onMounted, ref } from 'vue'
import { TinyEmitter } from 'tiny-emitter'
import Column from '@lib/types/column'
import STable from '@/types/sTable'
import { useRoute } from 'vue-router'
import StView, { genViewColumns, genViewRefresh } from '@/types/stView'
import { notification } from 'ant-design-vue'

const route = useRoute()
const stable = ref(new STable())
const selView = ref(new StView())
const emitter = new TinyEmitter()
const columns = computed<Column[]>(() => {
  nextTick(() => emitter.emit('refresh'))
  return genViewColumns(stable.value, selView.value)
})

onMounted(refresh)

async function refresh() {
  stable.value = await api.shareTable.stable.get(route.query.tid as string)
  const svw = (stable.value.fkViews as StView[]).find(vw => vw.key === route.query.vid)
  if (!svw) {
    notification.error({ message: '无法找到对应视图！' })
    return
  }
  selView.value = svw
  emitter.emit('refresh')
}
</script>
