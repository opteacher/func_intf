<script setup lang="ts">
import { onMounted, reactive, ref, nextTick, watch } from 'vue'
import {
  UploadOutlined,
  CloseCircleFilled,
  SearchOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CloseOutlined,
  SyncOutlined
} from '@ant-design/icons-vue'
import { UploadChangeParam, message, notification } from 'ant-design-vue'
import api, { mgcPdfURL } from '@/api'
import PdfRcd from '@/types/pdfRcd'
import { rmvStartsOf, setProp } from '@lib/utils'
import markdownit from 'markdown-it'
import hljs from 'highlight.js'

interface PdfFile {
  file?: File
  url?: string
}

const md = markdownit({
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value
      } catch (__) {
        console.log()
      }
    }

    return '' // use external default escaping
  }
})
const formState = reactive({} as PdfFile)
const paramMode = ref<'file' | 'url'>('file')
const upldPrgs = ref(-1)
const searchText = ref('')
const records = reactive<PdfRcd[]>([])
const upldScol = {
  processing: 'processing',
  succeed: 'success',
  failed: 'error'
}
const mdMode = ref<'view' | 'source'>('view')
const selDoc = reactive<PdfRcd>(new PdfRcd())
const mdSrc = ref('')

onMounted(refresh)
watch(
  () => mdMode.value,
  () => {
    if (mdMode.value === 'view' && selDoc.src) {
      nextTick(() => setProp(mdSrc, 'value', fmtMdSrc(selDoc.src as string)))
    }
  }
)

async function refresh() {
  const data = await api.magicPdf.record.all()
  records.splice(0, records.length, ...data.reverse())
  if (records.some(record => record.status === 'processing')) {
    setTimeout(refresh, 5000)
  }
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
  await api.magicPdf.record.remove(record.key)
  await refresh()
}
async function onDocUrlUpload() {
  await api.magicPdf.pdf.upload(formState)
  await refresh()
}
function dispRcdTime(record: PdfRcd) {
  return record.pcsdTime.isAfter(record.upldTime)
    ? '完成时间：' + record.pcsdTime.format('YY年MM月DD日 HH:mm:ss')
    : '上传时间：' + record.upldTime.format('YY年MM月DD日 HH:mm:ss')
}
async function onRecordClick(record: PdfRcd) {
  if (!record.url) {
    notification.warn({
      message: '无法查询该文档！',
      description: '查询不到该文档的位置信息'
    })
    return
  }
  const data = await api.magicPdf.pdf.get(record.url as string)
  PdfRcd.copy(record, selDoc)
  selDoc.src = data
  setProp(mdSrc, 'value', fmtMdSrc(data))
}
function onMdPnlClear() {
  selDoc.reset()
  mdSrc.value = ''
}
function onMdDocDload() {
  const link = document.createElement('a')
  const urls = selDoc.url?.split('/')
  urls?.pop()
  link.href = urls?.join('/') + '.zip'
  link.style.display = 'none'
  link.click()
  link.remove()
}
function fmtMdSrc(src: string) {
  return md.render(
    src.replaceAll('(images/', `(magic_pdf_apis/md/v1/${selDoc.pcsFile?.split('/').pop()}/images/`)
  )
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
              :action="mgcPdfURL + '/magic_pdf_apis/api/v1/pdf/upload'"
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
                <a-list-item-meta :description="dispRcdTime(item)">
                  <template #title>
                    <a v-if="item.status === 'succeed'" @click="() => onRecordClick(item)">
                      {{ rmvStartsOf(item.orgFile, '/tmp/') }}
                    </a>
                    <template v-else>{{ rmvStartsOf(item.orgFile, '/tmp/') }}</template>
                    &nbsp;
                    <a-tag :color="upldScol[item.status as 'processing' | 'succeed' | 'failed']">
                      <template #icon>
                        <check-circle-outlined v-if="item.status === 'succeed'" />
                        <close-circle-outlined v-else-if="item.status === 'failed'" />
                        <sync-outlined v-else :spin="true" />
                      </template>
                      <template v-if="item.status === 'succeed'">转化成功</template>
                      <template v-else-if="item.status === 'failed'">转化失败</template>
                      <template v-else>转化中</template>
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
    <a-layout-content class="pl-2.5 flex flex-col">
      <div class="flex justify-between">
        <a-space>
          <a-radio-group v-model:value="mdMode" button-style="solid">
            <a-radio-button value="view">浏览</a-radio-button>
            <a-radio-button value="source">源文本</a-radio-button>
          </a-radio-group>
          <a-button v-if="selDoc.url" type="primary" @click="onMdDocDload">下载</a-button>
        </a-space>
        <a-button v-if="selDoc.src" type="text" @click="onMdPnlClear">
          <template #icon><close-outlined /></template>
        </a-button>
      </div>
      <div class="flex-1 pt-3 overflow-auto">
        <!-- <div v-if="mdMode === 'view'" id="mdPanel" class="relative top-0 left-0 bottom-0 right-0" /> -->
        <div v-if="mdMode === 'view'" v-html="mdSrc" />
        <pre v-else>{{ selDoc.src }}</pre>
      </div>
    </a-layout-content>
  </a-layout>
</template>

<style>
.ant-upload {
  @apply w-full;
}
</style>
