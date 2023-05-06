<script setup lang="ts">
import ZSK, { LibType, columns, libTypes, mapper } from '../types/zsk'
import api, { isProd, chatBaseURL } from '../api'
import { TinyEmitter as Emitter } from 'tiny-emitter'
import { DownloadOutlined, SyncOutlined, CheckCircleOutlined } from '@ant-design/icons-vue'
import { intervalCheck, setProp } from '@/utils'

const emitter = new Emitter()

async function onRefresh(zsks: ZSK[]) {
  for (const ltype of Object.keys(libTypes)) {
    intervalCheck({
      chkFun: (stop: () => boolean) =>
        api.chatGlm.zsk
          .crawling(ltype as LibType)
          .then((running: boolean) => !running)
          .catch(stop),
      interval: 5000,
      middle: {
        succeed: () => {
          zsks.filter(zsk => zsk.ltype === ltype).map(zsk => setProp(zsk, 'status', 'imported'))
        }
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
        :path="`${isProd ? chatBaseURL : ''}/chat_glm_config/api/v1/zsk/upload`"
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
    <template #status="{ record: zsk }">
      <a-tag v-if="zsk.status === 'loading'" color="processing">
        <template #icon>
          <sync-outlined :spin="true" />
        </template>
        爬取中
      </a-tag>
      <a-tag v-else color="success">
        <template #icon>
          <check-circle-outlined />
        </template>
        已加载
      </a-tag>
    </template>
  </EditableTable>
</template>
