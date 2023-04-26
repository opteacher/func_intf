<script setup lang="ts">
import ZSK, { columns, mapper } from '../types/zsk'
import api from '../api'
import { TinyEmitter as Emitter } from 'tiny-emitter'
import { DownloadOutlined } from '@ant-design/icons-vue'

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
    sclHeight="h-full"
    size="middle"
  >
    <template #paramsEDT="{ editing: zsk }">
      <UploadFile
        v-if="zsk.ltype === 'fs'"
        path="/chat_glm_config/api/v1/zsk/upload"
        :form="zsk"
        v-model:value="zsk.params"
      />
    </template>
    <template #params="{ record: zsk }">
      <a-space v-if="zsk.ltype === 'fs'">
        {{ zsk.params[0] }}
        <a @click.stop="() => api.chatGlm.zsk.download(zsk)"><download-outlined /></a>
      </a-space>
    </template>
    <template #imported="{ record: zsk }">
      <a-tag :color="zsk.imported ? 'success' : 'warning'">
        {{ zsk.imported ? '已导入' : '未导入' }}
      </a-tag>
    </template>
    <template #importedEDT="{ editing: zsk }">
      <a-button class="w-full" :disabled="!zsk.key || zsk.imported" type="primary" ghost>
        {{ zsk.imported ? '已导入' : '导入' }}
      </a-button>
    </template>
  </EditableTable>
</template>
