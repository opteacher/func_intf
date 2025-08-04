<script setup lang="ts">
import EditableTable from '@lib/components/EditableTable.vue'
import Column from '@lib/types/column'
import Mapper from '@lib/types/mapper'
import { newOne, setProp, getProp } from '@lib/utils'
import STable, { avaCmpTypes, extraDict } from '@/types/sTable'
import { computed, reactive } from 'vue'
import { compoOpns, cmpNickDict, type CompoType } from '@lib/types/index'
import { cloneDeep } from 'lodash'
import FormGroup from '@lib/components/FormGroup.vue'
import { DeleteOutlined } from '@ant-design/icons-vue'

const shareTable = reactive({
  api: {
    all: () => []
  },
  columns: [new Column('名称', 'name'), new Column('表单结构', 'form')],
  mapper: new Mapper({
    name: {
      type: 'Input',
      label: '表格名称',
      rules: [{ required: true, message: '请输入表格名称' }]
    },
    form: {
      type: 'JsonEditor',
      label: '表单结构'
    }
  })
})
const tableDesign = reactive({
  columns: [
    {
      title: '新增列',
      dataIndex: 'addCol',
      key: 'addCol',
      width: 120
    }
  ] as Array<any>,
  data: [
    { addCol: '唯一标识' },
    { addCol: '类型' },
    { addCol: '提示' },
    { addCol: '必填/必选' },
    { addCol: '描述' },
    { addCol: '额外参数' }
  ],
  form: {
    key: '',
    label: '',
    type: 'Input',
    placeholder: '',
    required: false,
    desc: '',
    extra: {} as any
  },
  colMapper: null as any
})
const isNewCol = computed(() => tableDesign.columns.findIndex(col => col.key === 'newCol') !== -1)

function onAddColClick() {
  if (!tableDesign.columns.find(col => col.key === 'newCol')) {
    tableDesign.columns.push({ title: '', dataIndex: 'newCol', key: 'newCol' })
  } else {
    onClsNewColClick()
  }
}
function onClsNewColClick() {
  const index = tableDesign.columns.findIndex(col => col.key === 'newCol')
  if (index !== -1) {
    tableDesign.columns.splice(index, 1)
  }
}
function onNewColSubmit(stable: STable) {
  tableDesign.columns.push({
    title: tableDesign.form.label,
    dataIndex: tableDesign.form.key,
    key: tableDesign.form.key,
    mapper: cloneDeep(tableDesign.form)
  })
  stable.form = Object.fromEntries(
    tableDesign.columns
      .filter(col => !['addCol', 'newCol'].includes(col.key))
      .map(col => [col.key, cloneDeep(col.mapper)])
  )
  resetTblDsgnForm()
  onClsNewColClick()
}
function resetTblDsgnForm() {
  tableDesign.form.key = ''
  tableDesign.form.label = ''
  tableDesign.form.type = 'Input'
  tableDesign.form.required = false
  tableDesign.form.desc = ''
  tableDesign.form.extra = {}
}
function onDelColSubmit(column: any) {
  const index = tableDesign.columns.findIndex(col => col.key === column.key)
  if (index !== -1) {
    tableDesign.columns.splice(index, 1)
  }
}
</script>

<template>
  <EditableTable
    title="共享表格"
    :dlg-full-scrn="true"
    :api="shareTable.api"
    :columns="shareTable.columns"
    :mapper="shareTable.mapper"
    :new-fun="() => newOne(STable)"
  >
    <template #formEDT="{ editing }: any">
      <a-form-item-rest>
        <a-table :data-source="tableDesign.data" :columns="tableDesign.columns" :pagination="false">
          <template #headerCell="{ column }">
            <template v-if="column.key === 'addCol'">
              <a @click="onAddColClick">
                <a-space align="center">
                  <span class="text-[#ff4d4f] text-xl">*</span>
                  新增列
                </a-space>
              </a>
            </template>
            <template v-else-if="column.key === 'newCol'">
              <a-input
                class="flex-1"
                placeholder="请输入列名（中文）"
                v-model:value="tableDesign.form.label"
              />
            </template>
            <template v-else>
              {{ column.title }}
              <a-popconfirm title="确定删除该列" @confirm="() => onDelColSubmit(column)">
                <a-button type="text" danger>
                  <template #icon><DeleteOutlined /></template>
                </a-button>
              </a-popconfirm>
            </template>
          </template>
          <template #bodyCell="{ column, record }">
            <template
              v-if="column.key === 'addCol' && ['唯一标识', '类型'].includes(record.addCol)"
            >
              <a-space align="center">
                <span class="text-[#ff4d4f] text-xl">*</span>
                {{ record.addCol }}
              </a-space>
            </template>
            <template v-else-if="column.key === 'newCol'">
              <a-input
                v-if="record.addCol === '唯一标识'"
                placeholder="输入唯一标识（英文）"
                v-model:value="tableDesign.form.key"
              />
              <a-select
                v-else-if="record.addCol === '类型'"
                placeholder="选择类型"
                :options="compoOpns.filter(opn => avaCmpTypes.includes(opn.value))"
                v-model:value="tableDesign.form.type"
              />
              <a-input
                v-else-if="record.addCol === '提示'"
                placeholder="输入表单框中提示"
                v-model:value="tableDesign.form.placeholder"
              />
              <a-switch
                v-else-if="record.addCol === '必填/必选'"
                v-model:checked="tableDesign.form.required"
              />
              <a-textarea
                v-else-if="record.addCol === '描述'"
                placeholder="输入描述"
                v-model:value="tableDesign.form.desc"
              />
              <a-form v-else-if="record.addCol === '额外参数'">
                <FormGroup
                  :mapper="new Mapper(getProp(extraDict, tableDesign.form.type) || {})"
                  :form="tableDesign.form.extra"
                  @update:fprop="(e: any) => Object.assign(tableDesign.form.extra, e)"
                >
                  <template #chkLabels>
                    <a-form-item-rest>
                      <a-input-group compact class="flex">
                        <a-input
                          class="flex-1 border-e-0 focus:shadow-none"
                          placeholder="为真时的文本说明"
                        />
                        <a-input class="bg-white px-0 w-2 border-x-0" disabled placeholder="/" />
                        <a-input
                          class="flex-1 border-s-0 focus:shadow-none"
                          placeholder="为假时的文本说明"
                        />
                      </a-input-group>
                    </a-form-item-rest>
                  </template>
                </FormGroup>
              </a-form>
            </template>
            <template v-else-if="column.mapper">
              <a-typography-text v-if="record.addCol === '唯一标识'">
                {{ column.mapper.key }}
              </a-typography-text>
              <a-typography-text v-else-if="record.addCol === '类型'">
                {{ cmpNickDict[column.mapper.type as CompoType] }}
              </a-typography-text>
              <a-typography-text v-else-if="record.addCol === '提示'">
                {{ column.mapper.placeholder || '无' }}
              </a-typography-text>
              <a-typography-text v-else-if="record.addCol === '必填/必选'">
                {{ column.mapper.required ? '必填/必选' : '非必要' }}
              </a-typography-text>
              <a-typography-text v-else-if="record.addCol === '描述'">
                {{ column.mapper.desc || '无' }}
              </a-typography-text>
              <template v-else-if="record.addCol === '额外参数'">
                <a-popover trigger="click">
                  <template #content>
                    <FormGroup
                      class="w-96"
                      :lbl-wid="4"
                      :mapper="new Mapper(getProp(extraDict, column.mapper.type))"
                      :form="column.mapper.extra"
                      :viewOnly="true"
                    >
                      <template #optionsVW>
                        <ul>
                          <li v-for="option in column.mapper.extra.options">
                            {{ option.label }}&nbsp;
                            <span class="text-gray-400">{{ option.value }}</span>
                          </li>
                        </ul>
                      </template>
                    </FormGroup>
                  </template>
                  <a-button @click="() => setProp(tableDesign, 'colMapper', column.mapper)">
                    显示额外参数
                  </a-button>
                </a-popover>
              </template>
            </template>
          </template>
          <template v-if="isNewCol" #footer>
            <div class="text-right">
              <a-space>
                <a-button type="primary" @click="() => onNewColSubmit(editing)">确定</a-button>
                <a-button @click="onClsNewColClick">取消</a-button>
              </a-space>
            </div>
          </template>
        </a-table>
      </a-form-item-rest>
    </template>
  </EditableTable>
</template>

<style>
.ant-form-item:last-child {
  margin-bottom: 0 !important;
}
</style>
