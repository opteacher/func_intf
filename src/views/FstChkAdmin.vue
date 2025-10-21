<template>
  <EditableTable :api="api.fastCheck.record" :columns="columns" :pagable="true">
    <template #extra>
      <a-button @click="() => emitter.emit('update:visible', true)">批量导入</a-button>
    </template>
    <template #hcrq="{ record }: { record: FstRcd }">
      {{ record.hcrq.format('YYYY-MM-DD') }}
    </template>
    <template #kssj="{ record }: { record: FstRcd }">
      {{ record.kssj.format('HH:mm:ss') }}
    </template>
    <template #jssj="{ record }: { record: FstRcd }">
      {{ record.jssj.format('HH:mm:ss') }}
    </template>
  </EditableTable>
  <FormDialog
    title="批量导入"
    :mapper="mapper"
    :emitter="emitter"
    :new-fun="() => newOne(FstImp)"
    @submit="onBatImpSubmit"
  >
    <template #data.dtPair="{ formState }: { formState: FstImp }">
      <a-range-picker class="w-full" v-model:value="formState.data.dtPair" />
    </template>
  </FormDialog>
</template>

<script setup lang="ts">
import EditableTable from '@lib/components/EditableTable.vue'
import FormDialog from '@lib/components/FormDialog.vue'
import { Cond } from '@lib/types'
import Mapper from '@lib/types/mapper'
import { reactive } from 'vue'
import { TinyEmitter } from 'tiny-emitter'
import api from '@/api'
import FstImp from '@/types/fstImp'
import { newOne } from '@lib/utils'
import FstRcd from '@/types/fstRcd'
import Column from '@lib/types/column'

const emitter = new TinyEmitter()
const columns = reactive([
  new Column('调用接口', 'dyjkmc', { filterable: true }),
  new Column('核查人', 'cxrxm'),
  new Column('单位', 'cxrbmhz', { filterable: true }),
  new Column('日期', 'hcrq', { filterable: true }),
  new Column('开始时间', 'kssj'),
  new Column('结束时间', 'jssj')
])
const mapper = reactive(
  new Mapper({
    impType: {
      type: 'Radio',
      label: '导入方式',
      style: 'button',
      options: [
        { label: '返回Json', value: 'json' },
        { label: '请求Token', value: 'token' },
        { label: 'Excel文件', value: 'file' }
      ]
    },
    data: {
      type: 'FormGroup',
      label: '数据',
      prefix: true,
      canFold: false,
      items: new Mapper({
        jsonType: {
          type: 'Radio',
          label: 'Json导入方式',
          style: 'button',
          options: [
            { label: '复制黏贴', value: 'editor' },
            { label: '上传Json文件', value: 'file' }
          ],
          display: [Cond.create('impType', '=', 'json')]
        },
        jsonFile: {
          type: 'UploadFile',
          label: '上传Json',
          display: [Cond.create('impType', '=', 'json'), Cond.create('data.jsonType', '=', 'file')],
          onBeforeUpload: (file: File) => {
            const reader = new FileReader()
            reader.readAsText(file, 'utf-8')
            reader.onload = e => {
              let str = '{}'
              if (e.target?.result instanceof ArrayBuffer) {
                const decoder = new TextDecoder('utf-8')
                str = decoder.decode(e.target.result)
              } else if (e.target?.result) {
                str = e.target?.result
              }
              emitter.emit('update:dprop', {
                'data.json': JSON.parse(str),
                'data.jsonType': 'editor'
              })
            }
            return false
          }
        },
        json: {
          type: 'JsonEditor',
          label: '请求返回Json',
          display: [
            Cond.create('impType', '=', 'json'),
            Cond.create('data.jsonType', '=', 'editor')
          ]
        },
        token: {
          type: 'Textarea',
          label: '请求授权Token',
          display: [Cond.create('impType', '=', 'token')]
        },
        dtPair: {
          type: 'Unknown',
          label: '时间段',
          display: [Cond.create('impType', '=', 'token')]
        },
        file: {
          type: 'UploadFile',
          label: 'Excel文件',
          display: [Cond.create('impType', '=', 'file')]
        }
      })
    }
  })
)

async function onBatImpSubmit(form: FstImp, callback: Function) {
  let records = []
  switch (form.impType) {
    case 'token':
      {
        const res = await api.fastCheck.record.impByTkn(form.data)
        records = res.rows ? res.rows : res
      }
      break
    case 'json':
      {
        const res = typeof form.data.json === 'string' ? JSON.parse(form.data.json) : form.data.json
        records = res.rows ? res.rows : res
      }
      break
  }
  for (const record of records) {
    await api.fastCheck.record.add(record)
  }
  callback()
  emitter.emit('refresh')
}
</script>
