<template>
  <a-row class="h-full" :gutter="8">
    <a-col :span="12">
      <a-upload-dragger
        v-if="!orgImg.file.length"
        v-model:fileList="orgImg.file"
        name="file"
        @change="onChange"
        @drop="onDrop"
      >
        <p class="ant-upload-drag-icon">
          <inbox-outlined></inbox-outlined>
        </p>
        <p class="ant-upload-text">点击上传图片</p>
      </a-upload-dragger>
      <div v-else class="h-full relative">
        <div class="absolute overflow-y-auto img-gallery">
          <img class="w-full" :src="orgImg.file[0]" />
        </div>
        <a-button class="absolute bottom-0 left-0 right-0" danger @click="onCleanClick">
          <template #icon><DeleteOutlined /></template>
          清空
        </a-button>
      </div>
    </a-col>
    <a-col :span="12" class="h-full relative">
      <div class="absolute overflow-y-auto img-gallery left-0 right-0">
        <img id="imgDisp" class="w-full" :src="disImg" />
      </div>
      <a-button
        class="absolute bottom-0 left-0 right-0"
        type="primary"
        :disabled="!orgImg.file.length"
        :loading="loading"
        @click="onDloadClick"
      >
        <template #icon><DownloadOutlined /></template>
        下载
      </a-button>
    </a-col>
  </a-row>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { InboxOutlined, DownloadOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import { notification, type UploadChangeParam } from 'ant-design-vue'
import axios from 'axios'
import { getProperty } from '@lib/utils'
import placehold from '@/assets/placehold.svg'
import { useRoute } from 'vue-router'

const orgImg = reactive({
  name: '',
  file: [] as string[]
})
const loading = ref<boolean>(false)
const route = useRoute()
const opera = route.path.split('/').pop()
const host = 'http://38.152.2.152:4208'
const path = '/image_denoise/api/v1/image/optimize'
const rule = {
  rulesParam: [
    {
      scene: 'VideoSnapDetect',
      eventType: opera === 'faceRes' ? 'FaceRestore' : 'imgDeblue',
      ruleCustomName: 'SnapVideo',
      ruleID: '1ab4f3a4d10144f1bd21a3303418a0d6'
    }
  ],
  globalParams: null
}
const disImg = ref<string>(placehold)

async function onChange(info: UploadChangeParam) {
  loading.value = true
  orgImg.name = info.file.originFileObj?.name as string
  const orgFile = info.file.originFileObj as Blob
  const reader = new FileReader()
  reader.readAsDataURL(orgFile)
  const image = new Image()
  image.src = await new Promise<string>(resolve => {
    reader.onload = function () {
      resolve(this.result as string)
    }
  })
  const imgEle = await new Promise(resolve => {
    image.onload = function () {
      resolve(this)
    }
  })
  const width = image.width
  const height = image.height
  const canvas = document.createElement('canvas')
  canvas.setAttribute('width', width.toString())
  canvas.setAttribute('height', height.toString())
  const context = canvas.getContext('2d')
  context?.drawImage(imgEle as any, 0, 0, width, height)
  const base64 = canvas.toDataURL('image/jpeg', 1)
  orgImg.file.splice(0, orgImg.file.length, base64)
  const resp = await axios.post(
    path,
    {
      taskInfo: {
        taskSource: 'other',
        aiFunctionCode:
          opera === 'faceRes'
            ? 'HIKVISION_rlhzxf967_1.1.0_rlhzxf967'
            : 'HIKVISION_txqz985_1.0.0_txqz985',
        imageType: 'binary',
        imageData: base64.substring(base64.indexOf(';base64,') + ';base64,'.length),
        rule: JSON.stringify(rule)
      }
    },
    {
      baseURL: host,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  )
  if (resp.status !== 200) {
    notification.error({
      message: '接口响应错误',
      description: resp.statusText
    })
    loading.value = false
    return
  }
  const data = resp.data
  if (!data.result) {
    notification.error({
      message: '接口响应体错误',
      description: '没有result字段'
    })
    loading.value = false
    return
  }
  const result = data.result
  if (result.code != 0) {
    notification.error({
      message: `接口调用错误，代码：${result.code}`,
      description: result.msg
    })
    loading.value = false
    return
  }
  const densBase64 = getProperty(result, 'data.analysisResults.[0].eventInfo.[0].paramsInfo.value')
  disImg.value = 'data:image/jpeg;base64,' + densBase64
  loading.value = false
}
function onDrop(e: DragEvent) {
  console.log(e)
}
function onCleanClick() {
  orgImg.name = ''
  orgImg.file = []
  disImg.value = placehold
  loading.value = false
}
function onDloadClick() {
  const strBase64 = atob(
    disImg.value.substring(disImg.value.indexOf(';base64,') + ';base64,'.length)
  )
  const byteArray = new Array(strBase64.length)
  for (let i = 0; i < strBase64.length; ++i) {
    byteArray[i] = strBase64.charCodeAt(i)
  }
  const uint8Array = new Uint8Array(byteArray)
  const blob = new Blob([uint8Array], { type: undefined })
  const dloadLink = document.createElement('a')
  dloadLink.download = `${orgImg.name}.jpg`
  dloadLink.href = URL.createObjectURL(blob)
  dloadLink.click()
}
</script>

<style>
.img-gallery {
  height: calc(100% - 2.5rem);
}
</style>
