<script setup lang="ts">
import ZSK, { columns, mapper } from '../types/zsk'
import EditableTable from '@lib/components/EditableTable.vue'
import api from '../api'
import { TinyEmitter as Emitter } from 'tiny-emitter'
import UploadFile from '@lib/components/UploadFile.vue'

const emitter = new Emitter()
</script>

<template>
  <EditableTable
    title="知识库"
    :api="api.chatGlm.zsk"
    :columns="columns"
    :mapper="mapper"
    :copy="ZSK.copy"
    :emitter="emitter"
  >
    <template #paramsEDT="{ editing: zsk }">
      <UploadFile v-if="zsk.ltype === 'fs'" :form="zsk" v-model:value="zsk.params" />
    </template>
  </EditableTable>
</template>
