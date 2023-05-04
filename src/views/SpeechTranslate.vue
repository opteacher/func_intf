<template>
  <a-space>
    <a-upload
      name="file"
      :data="data"
      v-model:file-list="files"
      :action="`${isProd ? 'http://38.152.2.152:9095' : ''}/speech_translation/api/v1/translate`"
      :showUploadList="false"
      @change="onChange"
    >
      <a-button :loading="loading">
        <template v-if="!loading" #icon>
          <upload-outlined />
        </template>
        点击上传音频文件
      </a-button>
    </a-upload>
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
  </a-space>
  <a-typography-paragraph v-if="content">
    <pre>{{ content }}</pre>
  </a-typography-paragraph>
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
const data = reactive({
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
