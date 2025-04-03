<template>
  <div class="h-full flex flex-col space-y-4">
    <a-space>
      <a-radio-group v-model:value="data.tech" button-style="solid">
        <a-radio-button v-for="opn in techOpns" :key="opn.value" :value="opn.value">
          {{ opn.label }}
        </a-radio-button>
      </a-radio-group>
      <a-select
        class="w-48"
        placeholder="选择识别精度"
        :options="mdlOpns"
        v-model:value="data.model"
      />
      <a-radio-group v-model:value="data.language" button-style="solid">
        <a-radio-button v-for="opn in langOpns" :key="opn.value" :value="opn.value">
          {{ opn.label }}
        </a-radio-button>
      </a-radio-group>
      <a-upload
        name="file"
        :data="data"
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
      <a-layout-sider width="40%" theme="light">Sider</a-layout-sider>
      <a-layout-content>
        <pre>{{ content }}</pre>
      </a-layout-content>
    </a-layout>
  </div>
</template>

<script lang="ts" setup>
import { UploadChangeParam } from 'ant-design-vue'
import { reactive, ref } from 'vue'
import { UploadOutlined } from '@ant-design/icons-vue'
import { isProd } from '../api'

const files = ref([])
const loading = ref(false)
const content = ref('')
const models = {
  tiny: '最低精度',
  base: '次低精度',
  small: '低精度',
  medium: '中等精度',
  large: '最高精度'
}
const mdlOpns = Object.entries(models).map(([value, label]) => ({ label, value }))
const langs = {
  Chinese: '中文',
  English: '英文'
}
const langOpns = Object.entries(langs).map(([value, label]) => ({ label, value }))
const techs = {
  sensevoice: 'SenceVoice',
  whisper: 'Whisper'
}
const techOpns = Object.entries(techs).map(([value, label]) => ({ label, value }))
const data = reactive({
  tech: 'sensevoice',
  model: 'small',
  language: 'Chinese'
})

function onChange(info: UploadChangeParam) {
  switch (info.file.status) {
    case 'uploading':
      loading.value = true
      content.value = ''
      break
    case 'done':
      loading.value = false
      content.value = info.file.response.result
      break
    default:
      loading.value = false
  }
}
</script>
