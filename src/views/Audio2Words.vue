<template>
  <div class="h-full flex flex-col space-y-4">
    <a-space>
      <a-radio-group v-model:value="settings.tech" button-style="solid">
        <a-radio-button v-for="opn in techOpns" :key="opn.value" :value="opn.value">
          {{ opn.label }}
        </a-radio-button>
      </a-radio-group>
      <a-select
        class="w-48"
        placeholder="选择识别精度"
        :options="mdlOpns"
        v-model:value="settings.model"
      />
      <a-radio-group v-model:value="settings.language" button-style="solid">
        <a-radio-button v-for="opn in langOpns" :key="opn.value" :value="opn.value">
          {{ opn.label }}
        </a-radio-button>
      </a-radio-group>
      <a-upload
        name="file"
        :data="settings"
        v-model:file-list="files"
        :action="`${isProd ? 'http://38.152.2.152:9095' : ''}/audio_words/api/v1/audio2words`"
        :showUploadList="false"
        @change="onChange"
      >
        <a-button :loading="loading" type="primary">
          <template v-if="!loading" #icon>
            <upload-outlined />
          </template>
          点击上传音频文件
        </a-button>
      </a-upload>
    </a-space>
    <a-layout class="flex-1">
      <a-layout-sider class="pr-2" width="40%" theme="light">
        <a-list item-layout="horizontal" :data-source="a2wJobs">
          <template #renderItem="{ item: job }: { item: A2wJob }">
            <a-list-item>
              <a-card
                class="w-full border-2"
                :class="{
                  'border-solid border-primary': selA2wJob && selA2wJob?.key === job.key
                }"
                :hoverable="job.status === 'succeed'"
                size="small"
                @click="() => (selA2wJob = job)"
              >
                <div class="flex justify-between">
                  <div>
                    {{ job.name }}&nbsp;
                    <a-tag :color="status[job.status].color">
                      <template #icon>
                        <check-circle-outlined v-if="job.status === 'succeed'" />
                        <close-circle-outlined v-else-if="job.status === 'failed'" />
                        <sync-outlined v-else :spin="true" />
                      </template>
                      {{ status[job.status].text }}
                    </a-tag>
                  </div>
                  <a-button type="link" size="small" danger @click.stop="onJobDelete(job)">
                    <template #icon><delete-outlined /></template>
                  </a-button>
                </div>
              </a-card>
            </a-list-item>
          </template>
        </a-list>
      </a-layout-sider>
      <a-layout-content class="p-2">
        <pre>{{ content }}</pre>
      </a-layout-content>
    </a-layout>
  </div>
</template>

<script lang="ts" setup>
import { notification, UploadChangeParam } from 'ant-design-vue'
import { reactive, ref } from 'vue'
import {
  UploadOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue'
import { isProd } from '../api'
import axios from 'axios'
import { onMounted } from 'vue'
import { gnlCpy, intervalCheck, obj2opns } from '@/utils'
import A2wJob from '@/types/a2wJob'
import Paho, { Message } from 'paho-mqtt'

const files = ref([])
const loading = ref(false)
const content = ref('')
const models = {
  tiny: '最低精度',
  base: '次低精度',
  small: '低精度',
  medium: '中等精度',
  large: '高精度',
  turbo: '最高精度'
}
const mdlOpns = obj2opns(models)
const langs = {
  Chinese: '中文',
  English: '英文'
}
const langOpns = obj2opns(langs)
const techs = {
  sensevoice: 'SenceVoice',
  whisper: 'Whisper'
}
const techOpns = obj2opns(techs)
const settings = reactive({
  tech: 'whisper',
  model: 'small',
  language: 'Chinese'
})
const a2wJobs = reactive<A2wJob[]>([])
const status = {
  succeed: { text: '转化成功', color: 'success' },
  processing: { text: '转化中', color: 'processing' },
  failed: { text: '转化失败', color: 'error' }
}
const selA2wJob = ref<A2wJob | null>(null)

onMounted(refresh)

async function refresh() {
  const resp = await axios.get('/audio_words/mdl/v1/a2wJob/s')
  if (resp.status !== 200) {
    notification.error({
      message: '网络请求失败',
      description: resp.statusText
    })
    return
  }
  a2wJobs.splice(0, a2wJobs.length, ...resp.data.data.map((item: any) => gnlCpy(A2wJob, item)))
}
function onChange(info: UploadChangeParam) {
  switch (info.file.status) {
    case 'uploading':
      loading.value = true
      break
    case 'done':
      loading.value = false
      intervalCheck({
        chkFun: () => refresh().then(() => a2wJobs.every(job => job.status !== 'processing')),
        interval: 5000
      })
      startListenMQTT()
      break
    default:
      loading.value = false
  }
}
function onJobDelete(job: A2wJob) {
  return axios.delete(`/audio_words/mdl/v1/a2wJob/${job.key}`).then(refresh)
}
function startListenMQTT() {
  const client = new Paho.Client('192.168.1.11', 8083, '/mqtt')
  client.onConnectionLost = err => {
    notification.error({
      message: 'MQTT连接失败',
      description: err.errorMessage
    })
  }
  client.onMessageArrived = (message: Message) => {
    content.value += message.payloadString
  }
  client.connect({
    onSuccess: () => {
      client.subscribe('audio_words')
    }
  })
}
</script>
