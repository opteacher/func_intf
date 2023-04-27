<script setup lang="ts">
import ZSK, { LibType, columns, libTypes, mapper } from '../types/zsk'
import api from '../api'
import { TinyEmitter as Emitter } from 'tiny-emitter'
import { DownloadOutlined } from '@ant-design/icons-vue'
import { intervalCheck, reqPut } from '@/utils'

const emitter = new Emitter()

async function onRefresh(zsks: ZSK[]) {
  for (const ltype of Object.keys(libTypes)) {
    intervalCheck({
      chkFun: () => api.chatGlm.zsk.crawling(ltype as LibType),
      middle: {
        succeed: () => reqPut('zsk', zsk.key, { imported: true }, chatGlmOpns)
      }
    })
  }
}
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
    @refresh="onRefresh"
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
      <a-tag v-if="zsk.imported" color="success">已导入</a-tag>
      <a-tag v-else-if="zsk.loading" color="processing">导入中……</a-tag>
      <a-popconfirm
        v-else
        title="确定导入知识库？"
        ok-text="确定"
        cancel-text="取消"
        @confirm="() => api.chatGlm.zsk.reload(zsk)"
      >
        <a-button size="small" @click.stop>未导入</a-button>
      </a-popconfirm>
    </template>
    <template #importedEDT="{ editing: zsk }">
      <a-button
        class="w-full"
        :disabled="!zsk.key || zsk.loading || zsk.imported"
        :loading="zsk.loading"
        type="primary"
        ghost
      >
        {{ zsk.imported ? '已导入' : '导入' }}
      </a-button>
    </template>
  </EditableTable>
</template>
