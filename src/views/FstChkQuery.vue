<template>
  <EditableTable
    v-if="detail.records.length"
    title="详细查询记录"
    :description="`${detail.queryer.name} / ${detail.queryer.institution}`"
    :api="{ all: async () => detail.records }"
    :im-export="{ expable: true }"
    :columns="rcdCols"
    :new-fun="() => newOne(FstRcd)"
    :addable="false"
    :editable="false"
    :delable="false"
  >
    <template #icon>
      <a-button class="mr-3" type="text" @click="resetDetail">
        <template #icon><ArrowLeftOutlined /></template>
      </a-button>
    </template>
    <template #hcrq="{ record }: any">
      {{ record.hcrq.format('YYYY-MM-DD') }}
    </template>
    <template #kssj="{ record }: any">
      {{ record.kssj.format('HH:mm:ss') }}
    </template>
    <template #jssj="{ record }: any">
      {{ record.jssj.format('HH:mm:ss') }}
    </template>
    <template #hczjhm="{ record }: any">
      {{
        record.hczjhm.length === 18
          ? `${record.hczjhm.slice(0, 4)}***${record.hczjhm.slice(-4)}`
          : `${record.hczjhm.slice(0, 3)}***${record.hczjhm.slice(-2)}`
      }}
    </template>
  </EditableTable>
  <EditableTable
    v-else-if="qryRess.length"
    title="快核勤务查询"
    :api="{ all: async () => qryRess }"
    :im-export="{ expable: true }"
    :columns="columns"
    :emitter="emitter"
    :addable="false"
    :editable="false"
    :delable="false"
  >
    <template #icon>
      <a-button class="mr-3" type="text" @click="() => (qryRess = [])">
        <template #icon><ArrowLeftOutlined /></template>
      </a-button>
    </template>
    <template #date="{ record }: any">
      {{ record.date.format('YYYY-MM-DD') }}
    </template>
    <template #begTime="{ record }: any">
      {{ record.begTime.format('HH:mm:ss') }}
    </template>
    <template #endTime="{ record }: any">
      {{ record.endTime.format('HH:mm:ss') }}
    </template>
    <template #qNum="{ record }: any">
      {{ record.qNum || 0 }}
    </template>
    <template #pNum="{ record }: any">
      {{ record.pNum || 0 }}
    </template>
    <template #cNum="{ record }: any">
      {{ record.cNum || 0 }}
    </template>
    <template #exceptions="{ record }: any">
      <a-space direction="vertical">
        <a-badge v-if="record.exStat.samePos.length" :count="record.exStat.samePos.length">
          <a-button size="small" @click="onStatTagClick('samePos', record)">
            同位置多次查询
          </a-button>
        </a-badge>
        <a-badge v-if="record.exStat.qryFreq.length" :count="record.exStat.qryFreq.length">
          <a-button size="small" @click="onStatTagClick('qryFreq', record)">查询频率过快</a-button>
        </a-badge>
        <a-button v-if="record.exStat.notEnough" size="small">查询次数不达标</a-button>
      </a-space>
    </template>
  </EditableTable>
  <div v-else class="relative w-full h-full overflow-auto">
    <div class="w-[50vw] absolute left-1/2 top-0 -translate-x-1/2">
      <a-row class="mb-10">
        <a-col :span="4" class="text-right"><MonitorOutlined class="text-5xl me-3" /></a-col>
        <a-col :span="20">
          <a-typography-title>快核勤务查询平台</a-typography-title>
        </a-col>
      </a-row>
      <FormGroup :mapper="mapper" :form="form" @update:fprop="onFpropUpdate">
        <template #namesSFX>
          <a-button @click="() => swchBoolProp(pasteNames, 'is')">复制粘贴</a-button>
        </template>
        <template #namesTextSFX>
          <a-button @click="() => swchBoolProp(pasteNames, 'is')">单个输入</a-button>
        </template>
        <template #exceptConds.minQrys>
          <a-form-item-rest>
            <a-input-group>
              <a-row :gutter="8" align="middle">
                <a-col :span="2" class="text-right">人数</a-col>
                <a-col :span="10">
                  <a-input
                    placeholder="最少查询人数"
                    :disabled="loading"
                    v-model:value="form.exceptConds.minPeople"
                  />
                </a-col>
                <a-col :span="2" class="text-right">车辆数</a-col>
                <a-col :span="10">
                  <a-input
                    placeholder="最少查询车辆数"
                    :disabled="loading"
                    v-model:value="form.exceptConds.minCars"
                  />
                </a-col>
              </a-row>
            </a-input-group>
          </a-form-item-rest>
        </template>
        <template #tmRange>
          <a-range-picker class="w-full" v-model:value="form.tmRange" :disabled="loading" />
        </template>
      </FormGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
import EditableTable from '@lib/components/EditableTable.vue'
import FstQry from '@/types/fstQry'
import FormGroup from '@lib/components/FormGroup.vue'
import Column from '@lib/types/column'
import Mapper from '@lib/types/mapper'
import { setProp, newOne, swchBoolProp } from '@lib/utils'
import { reactive, ref } from 'vue'
import api from '@/api'
import FstRes from '@/types/fstRes'
import { ArrowLeftOutlined, MonitorOutlined } from '@ant-design/icons-vue'
import FstRcd from '@/types/fstRcd'
import { TinyEmitter } from 'tiny-emitter'

const qryRess = ref<FstRes[]>([])
const detail = reactive({
  queryer: { name: '', institution: '' },
  records: [] as FstRcd[]
})
const emitter = new TinyEmitter()
const columns = reactive([
  new Column('序号', 'no'),
  new Column('姓名', 'name'),
  new Column('单位', 'institution'),
  new Column('日期', 'date'),
  new Column('开始时间', 'begTime'),
  new Column('结束时间', 'endTime'),
  new Column('总查询数', 'qNum'),
  new Column('查询人数', 'pNum'),
  new Column('查询车辆数', 'cNum'),
  new Column('异常', 'exceptions')
])
const mapper = reactive(
  new Mapper({
    names: {
      type: 'EditList',
      label: '查询人员姓名',
      desc: '可添加多名人员',
      disabled: () => loading.value,
      mapper: new Mapper({
        name: {
          type: 'Input',
          placeholder: '输入名称'
        }
      }),
      inline: true,
      flatItem: true,
      newFun: () => ({ name: '' }),
      display: () => !pasteNames.is
    },
    namesText: {
      type: 'Textarea',
      label: '查询人员姓名',
      placeholder: '回车或逗号（半月）作为姓名的间隔',
      disabled: () => loading.value,
      display: () => pasteNames.is,
      onBlur: (query: FstQry, text: string) => {
        query.names = text.indexOf(',') != -1 ? text.split(',') : text.split('\n')
      }
    },
    institution: {
      type: 'Select',
      label: '单位',
      disabled: () => loading.value,
      rules: [{ required: true, message: '必须选择单位！' }],
      options: [{ label: '嘉定分局', value: '310114000000' }]
    },
    tmRange: {
      type: 'Unknown',
      label: '时间段'
    },
    exceptConds: {
      type: 'FormGroup',
      label: '异常条件',
      prefix: true,
      items: new Mapper({
        qryRate: {
          type: 'Number',
          label: '查询频率',
          disabled: () => loading.value,
          prefix: '每',
          suffix: '秒查询1次'
        },
        minQrys: {
          type: 'Unknown',
          label: '最低查询次数'
        },
        minDist: {
          type: 'Number',
          label: '最近查询距离',
          disabled: () => loading.value
        }
      })
    },
    queryBtn: {
      type: 'Button',
      inner: '查询',
      loading: () => loading.value,
      offset: 4,
      ghost: false,
      onClick: async (form: FstQry) => {
        loading.value = true
        qryRess.value = await api.fastCheck.record.query(form)
        emitter.emit('refresh')
        loading.value = false
      }
    }
  })
)
const form = reactive(FstQry.copy({ institution: '嘉定分局' }))
const loading = ref(false)
const rcdCols = reactive([
  new Column('调用接口', 'dyjkmc', { filterable: true }),
  new Column('核查对象', 'hcxm'),
  new Column('核查证件号', 'hczjhm'),
  new Column('日期', 'hcrq', { filterable: true }),
  new Column('开始时间', 'kssj'),
  new Column('结束时间', 'jssj'),
  new Column('经度', 'lon'),
  new Column('纬度', 'lat')
])
const pasteNames = reactive({
  is: false,
  value: ''
})

function onFpropUpdate(values: any) {
  Object.entries(values).map(([k, v]) => setProp(form, k, v))
}
async function onStatTagClick(
  exType: 'notEnough' | 'qryFreq' | 'samePos' | 'samePsn',
  qryRes: FstRes
) {
  detail.queryer.name = qryRes.name
  detail.queryer.institution = qryRes.institution
  const params = {}
  switch (exType) {
    case 'samePos':
    case 'qryFreq':
      setProp(params, '_id', qryRes.exStat[exType].flat())
      break
  }
  detail.records = await api.fastCheck.record
    .all({ axiosConfig: { params } })
    .then(records => records.sort((r1, r2) => (r1.kssj.isAfter(r2.kssj) ? 1 : -1)))
}
function resetDetail() {
  detail.queryer.name = ''
  detail.queryer.institution = ''
  detail.records = []
}
</script>
