<script setup lang="ts">
import EditableTable from '@lib/components/EditableTable.vue'
import Column from '@lib/types/column'
import Mapper from '@lib/types/mapper'
import { newOne, setProp, getProp } from '@lib/utils'
import STable, { avaCmpTypes, extraDict } from '@/types/sTable'
import { computed, reactive } from 'vue'
import { compoOpns, cmpNickDict, type CompoType, Cond } from '@lib/types/index'
import { cloneDeep } from 'lodash'
import FormGroup from '@lib/components/FormGroup.vue'
import {
  DeleteOutlined,
  UserOutlined,
  TableOutlined,
  ShareAltOutlined
} from '@ant-design/icons-vue'
import api from '@/api'
import JsonEditor from '@lib/components/JsonEditor.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const shareTable = reactive({
  api: api.shareTable.stable,
  columns: [
    new Column('名称', 'name'),
    new Column('表单类型', 'edtMod'),
    new Column('用户授权', 'usrAuth'),
    new Column('用户注册', 'usrReg'),
    new Column('表单结构', 'form')
  ],
  mapper: new Mapper({
    name: {
      type: 'Input',
      label: '表格名称',
      rules: [{ required: true, message: '请输入表格名称' }]
    },
    edtMod: {
      type: 'Radio',
      label: '表单类型',
      options: [
        { label: '直接修改', value: 'direct' },
        { label: '表单修改', value: 'form' }
      ]
    },
    usrAuth: {
      type: 'Switch',
      label: '用户授权',
      chkLabels: ['不需要', '需要']
    },
    usrReg: {
      type: 'Switch',
      label: '用户注册',
      placeholder: '允许用户自己注册',
      chkLabels: ['不允许', '允许'],
      disabled: [Cond.create('usrAuth', '!=', true)]
    },
    form: {
      type: 'JsonEditor',
      label: '表单结构'
    }
  }),
  selTable: null as STable | null,
  showShareURL: false
})
const tblDsg = reactive({
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
    rules: [{ required: false, message: '必须输入/选择值！' }],
    desc: ''
  },
  colMapper: null as any,
  errFields: [] as string[]
})
const isNewCol = computed(() => tblDsg.columns.findIndex(col => col.key === 'newCol') !== -1)
const editKey = computed(() => tblDsg.form.key)
const baseURL = computed(() => import.meta.env.VITE_BASE_URL)

function onAddColClick() {
  if (!tblDsg.columns.find(col => col.key === 'newCol')) {
    tblDsg.columns.push({ title: '', dataIndex: 'newCol', key: 'newCol' })
  } else {
    onClsNewColClick()
  }
}
function onClsNewColClick() {
  const index = tblDsg.columns.findIndex(col => col.key === 'newCol')
  if (index !== -1) {
    tblDsg.columns.splice(index, 1)
  }
  resetTblDsgnForm()
}
function onNewColSubmit(stable: STable) {
  tblDsg.errFields = []
  for (const prop of ['key', 'label', 'type']) {
    if (!tblDsg.form[prop as keyof typeof tblDsg.form]) {
      tblDsg.errFields.push(prop)
    }
  }
  if (tblDsg.errFields.length) {
    return
  }
  const column = tblDsg.columns.find(col => col.key === tblDsg.form.key)
  if (column) {
    column.title = tblDsg.form.label
    column.dataIndex = tblDsg.form.key
    column.key = tblDsg.form.key
    column.mapper = cloneDeep(tblDsg.form)
  } else {
    tblDsg.columns.push({
      title: tblDsg.form.label,
      dataIndex: tblDsg.form.key,
      key: tblDsg.form.key,
      mapper: cloneDeep(tblDsg.form)
    })
  }
  stable.form = Object.fromEntries(
    tblDsg.columns
      .filter(col => !['addCol', 'newCol'].includes(col.key))
      .map(col => [col.key, cloneDeep(col.mapper)])
  )
  resetTblDsgnForm()
  onClsNewColClick()
}
function resetTblDsgnForm() {
  tblDsg.form = {
    key: '',
    label: '',
    type: 'Input',
    placeholder: '',
    rules: [{ required: false, message: '必须输入/选择值！' }],
    desc: ''
  }
}
function onDelColSubmit(column: any) {
  const index = tblDsg.columns.findIndex(col => col.key === column.key)
  if (index !== -1) {
    tblDsg.columns.splice(index, 1)
  }
}
function onSTableEdit(record: STable) {
  tblDsg.columns = tblDsg.columns.concat(
    Object.values(record.form).map(fld => ({
      title: fld.label,
      dataIndex: fld.key,
      key: fld.key,
      mapper: fld
    }))
  )
}
function onStblFormClose() {
  tblDsg.columns = [
    {
      title: '新增列',
      dataIndex: 'addCol',
      key: 'addCol',
      width: 120
    }
  ]
}
function gotoUserPage(record: STable) {
  router.push({ path: '/func_intf/share_table/user', query: { tid: record.key } })
}
function gotoDataPage(record: STable) {
  router.push({ path: '/func_intf/share_table/data', query: { tid: record.key } })
}
function onGenPlaceholderClick() {
  setProp(tblDsg.form, 'placeholder', '输入/选择' + tblDsg.form.label)
}
function showShareLink(record: STable) {
  shareTable.selTable = record
  shareTable.showShareURL = true
}
function onSelTableClose() {
  shareTable.selTable = null
  shareTable.showShareURL = false
}
</script>

<template>
  <EditableTable
    title="共享表格"
    dlg-width="100vw"
    :icon="TableOutlined"
    :api="shareTable.api"
    :columns="shareTable.columns"
    :mapper="shareTable.mapper"
    :new-fun="() => newOne(STable)"
    @edit="onSTableEdit"
    @form-close="onStblFormClose"
  >
    <template #operaBefore="{ record }">
      <a-button type="primary" size="small" @click="() => showShareLink(record)">
        <template #icon><ShareAltOutlined /></template>
        分享表格
      </a-button>
      <br />
      <a-button type="text" size="small" @click="() => gotoUserPage(record)">
        <template #icon><UserOutlined /></template>
        管理用户
      </a-button>
      <br />
      <a-button type="text" size="small" @click="() => gotoDataPage(record)">
        <template #icon><TableOutlined /></template>
        查看数据
      </a-button>
      <br />
    </template>
    <template #usrAuth="{ record }: any">
      {{ record.usrAuth ? '需要' : '不需要' }}
      <a-tag v-if="record.usrAuth && !record.fkUsers.length" class="ms-1" color="warning">
        目前没有用户，需要先注册用户
      </a-tag>
    </template>
    <template #form="{ record }: any">
      <a-button @click="() => (shareTable.selTable = record)">查看表单结构</a-button>
    </template>
    <template #formEDT="{ editing }: any">
      <a-form-item-rest>
        <a-table
          :data-source="tblDsg.data"
          :columns="tblDsg.columns"
          :pagination="false"
          size="small"
        >
          <template #headerCell="{ column }">
            <template v-if="column.key === 'addCol'">
              <a @click="onAddColClick">
                <a-space align="center">
                  <span class="text-[#ff4d4f] text-xl">*</span>
                  新增列
                </a-space>
              </a>
            </template>
            <template v-else-if="column.key === 'newCol' || (editKey && column.key === editKey)">
              <a-input
                class="flex-1"
                :status="tblDsg.errFields.includes('label') ? 'error' : undefined"
                placeholder="请输入列名（中文）"
                v-model:value="tblDsg.form.label"
              />
              <a-typography-text v-if="tblDsg.errFields.includes('label')" type="danger">
                必须填写列名！
              </a-typography-text>
            </template>
            <template v-else>
              <a-button
                type="link"
                size="small"
                @click="() => (tblDsg.form = cloneDeep(column.mapper))"
              >
                {{ column.title }}
              </a-button>
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
            <template v-else-if="column.key === 'newCol' || (editKey && column.key === editKey)">
              <template v-if="record.addCol === '唯一标识'">
                <a-input
                  :status="tblDsg.errFields.includes('key') ? 'error' : undefined"
                  placeholder="输入唯一标识（英文）"
                  v-model:value="tblDsg.form.key"
                />
                <a-typography-text v-if="tblDsg.errFields.includes('key')" type="danger">
                  必须填写唯一标识！
                </a-typography-text>
              </template>
              <template v-else-if="record.addCol === '类型'">
                <a-select
                  :status="tblDsg.errFields.includes('type') ? 'error' : undefined"
                  placeholder="选择类型"
                  :options="compoOpns.filter(opn => avaCmpTypes.includes(opn.value))"
                  v-model:value="tblDsg.form.type"
                />
                <a-typography-text v-if="tblDsg.errFields.includes('type')" type="danger">
                  必须填写唯一标识！
                </a-typography-text>
              </template>
              <a-input-group v-else-if="record.addCol === '提示'">
                <a-row :gutter="8">
                  <a-col :span="20">
                    <a-input
                      placeholder="输入表单框中提示"
                      v-model:value="tblDsg.form.placeholder"
                    />
                  </a-col>
                  <a-col :span="4">
                    <a-button class="w-full" @click="onGenPlaceholderClick">生成提示</a-button>
                  </a-col>
                </a-row>
              </a-input-group>
              <a-switch
                v-else-if="record.addCol === '必填/必选'"
                v-model:checked="tblDsg.form.rules[0].required"
              />
              <a-textarea
                v-else-if="record.addCol === '描述'"
                placeholder="输入描述"
                v-model:value="tblDsg.form.desc"
              />
              <a-form v-else-if="record.addCol === '额外参数'">
                <FormGroup
                  :mapper="new Mapper(getProp(extraDict, tblDsg.form.type) || {})"
                  :form="tblDsg.form"
                  @update:fprop="(e: any) => Object.assign(tblDsg.form, e)"
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
                {{ column.mapper.rules[0].required ? '必要' : '非必要' }}
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
                      :form="column.mapper"
                      :viewOnly="true"
                    >
                      <template #optionsVW>
                        <ul>
                          <li v-for="option in column.mapper.options">
                            {{ option.label }}&nbsp;
                            <span class="text-gray-400">{{ option.value }}</span>
                          </li>
                        </ul>
                      </template>
                    </FormGroup>
                  </template>
                  <a-button @click="() => setProp(tblDsg, 'colMapper', column.mapper)">
                    显示额外参数
                  </a-button>
                </a-popover>
              </template>
            </template>
          </template>
          <template v-if="isNewCol || editKey" #footer>
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
  <a-modal
    :open="shareTable.selTable !== null"
    :title="shareTable.showShareURL ? '分享表格' : '表单结构'"
    :footer="null"
    width="30vw"
    @cancel="onSelTableClose"
  >
    <a-typography-link
      v-if="shareTable.showShareURL"
      :href="`/#/func_intf/share_table/data?tid=${shareTable.selTable?.key}&fullView=1`"
      target="_blank"
      copyable
    >
      {{ `${baseURL}/#/func_intf/share_table/data?tid=${shareTable.selTable?.key}&fullView=1` }}
    </a-typography-link>
    <JsonEditor
      v-else
      height="60vh"
      :value="shareTable.selTable?.form || {}"
      :disabled="true"
      :mainMenuBar="false"
      :navigationBar="false"
      :statusBar="false"
    />
  </a-modal>
</template>
