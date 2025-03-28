<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import {
  UploadOutlined,
  CloseCircleFilled,
  SearchOutlined,
  CheckCircleOutlined,
  SyncOutlined
} from '@ant-design/icons-vue'
import { UploadChangeParam, message, notification } from 'ant-design-vue'
import axios from 'axios'
import PdfRcd from '@/types/pdfRcd'
import { rmvStartsOf } from '@lib/utils'

interface PdfFile {
  file?: File
  url?: string
}

const formState = reactive({} as PdfFile)
const paramMode = ref<'file' | 'url'>('file')
const upldPrgs = ref(-1)
const searchText = ref('')
const records = reactive<PdfRcd[]>([])
const upldScol = {
  processing: 'processing',
  succeed: 'success'
}
const mdMode = ref<'view' | 'source'>('view')

onMounted(refresh)

async function refresh() {
  const resp = await axios.get('/magic_pdf_apis/mdl/v1/record/s')
  if (resp.status !== 200) {
    notification.error({
      message: '网络异常！',
      description: resp.statusText
    })
    return
  }
  const data = resp.data.data as any[]
  records.splice(0, records.length, ...data.map(itm => PdfRcd.copy(itm)).reverse())
}
async function onUploadChange({ file, event }: UploadChangeParam) {
  if (file.status === 'uploading') {
    upldPrgs.value = !event ? 0 : event?.percent || 0
  } else {
    upldPrgs.value = -1
    await refresh()
  }
}
async function onRecordRmv(record: PdfRcd) {
  const resp = await axios.delete(`/magic_pdf_apis/mdl/v1/record/${record.key}`)
  if (resp.status !== 200) {
    notification.error({
      message: '删除失败！',
      description: resp.statusText
    })
  } else {
    message.success('删除成功！')
    await refresh()
  }
}
async function onDocUrlUpload() {
  const resp = await axios.post('/magic_pdf_apis/api/v1/pdf/upload', formState)
  if (resp.status !== 200) {
    notification.error({
      message: '上传失败！',
      description: resp.statusText
    })
  } else {
    message.success('上传成功！')
    await refresh()
  }
}
</script>

<template>
  <a-layout class="h-full overflow-hidden">
    <a-layout-sider class="pr-2.5" width="40%" theme="light">
      <div class="h-full flex flex-col">
        <div class="flex">
          <a-radio-group class="mr-2" v-model:value="paramMode" button-style="solid">
            <a-radio-button value="file">上传文件</a-radio-button>
            <a-radio-button value="url">文件链接</a-radio-button>
          </a-radio-group>
          <template v-if="paramMode === 'file'">
            <a-upload
              v-show="upldPrgs === -1"
              class="flex-1"
              v-model:value="formState.file"
              name="file"
              action="/magic_pdf_apis/api/v1/pdf/upload"
              :show-upload-list="false"
              @change="onUploadChange"
            >
              <a-button class="w-full">
                <template #icon>
                  <upload-outlined />
                </template>
                上传PDF
              </a-button>
            </a-upload>
            <div v-if="upldPrgs !== -1" class="flex-1 flex">
              <a-progress class="flex-1" :percent="upldPrgs" :show-info="false" />
              <a-button danger type="link">
                <template #icon><close-circle-filled /></template>
              </a-button>
            </div>
          </template>
          <div v-else-if="paramMode === 'url'" class="flex-1 flex space-x-2">
            <a-input class="flex-1" v-model:value="formState.url" placeholder="输入文档URL">
              <template #prefix>http://</template>
            </a-input>
            <a-button type="primary" :disabled="!formState.url" @click="onDocUrlUpload">
              转化
            </a-button>
          </div>
        </div>
        <a-divider>查询转化任务</a-divider>
        <a-input class="mb-2" v-model:value="searchText" placeholder="输入文档名搜索转化进度">
          <template #prefix>
            <search-outlined />
          </template>
        </a-input>
        <div class="flex-1 px-1 overflow-y-auto">
          <a-list
            class="relative top-0 left-0 bottom-0 right-0"
            item-layout="horizontal"
            :data-source="records"
          >
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta
                  :description="'上传时间：' + item.upldTime.format('YY年MM月DD日 HH:mm:ss')"
                >
                  <template #title>
                    {{ rmvStartsOf(item.orgFile, '/tmp/') }}&nbsp;
                    <a-tag :color="upldScol[item.status as 'processing' | 'succeed']">
                      <template #icon>
                        <check-circle-outlined v-if="item.status === 'succeed'" />
                        <sync-outlined v-else :spin="true" />
                        {{ item.status === 'succeed' ? '转化成功' : '转化中' }}
                      </template>
                    </a-tag>
                  </template>
                </a-list-item-meta>
                <template #actions>
                  <a-button type="link" danger @click="() => onRecordRmv(item)">删除</a-button>
                </template>
              </a-list-item>
            </template>
          </a-list>
        </div>
      </div>
    </a-layout-sider>
    <a-layout-content class="pl-2.5">
      <div class="flex flex-col">
        <div class="flex text-right">
          <a-radio-group class="mr-2" v-model:value="mdMode" button-style="solid">
            <a-radio-button value="view">浏览</a-radio-button>
            <a-radio-button value="source">源文本</a-radio-button>
          </a-radio-group>
          <a-button type="primary">下载</a-button>
        </div>
        <div class="flex-1" />
      </div>
    </a-layout-content>
  </a-layout>
</template>

<style>
.ant-upload {
  @apply w-full;
}
</style>
