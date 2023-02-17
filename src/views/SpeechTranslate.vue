<template>
  <a-upload
    v-model:file-list="files"
    name="file"
    action="/speech_translation/api/v1/translate"
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
  <a-typography-paragraph v-if="content">
    <pre>{{ content }}</pre>
  </a-typography-paragraph>
</template>

<script lang="ts" setup>
import { UploadChangeParam } from 'ant-design-vue'
import { ref } from 'vue'
import { UploadOutlined } from '@ant-design/icons-vue'

const files = ref([])
const loading = ref(false)
const content = ref('')

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
