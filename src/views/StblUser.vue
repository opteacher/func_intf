<script setup lang="ts">
import EditableTable from '@lib/components/EditableTable.vue'
import api from '@/api'
import { newOne, getProp, pickOrIgnore } from '@lib/utils'
import Column from '@lib/types/column'
import Mapper, { mapTypeTemps } from '@lib/types/mapper'
import StUser from '@/types/stUser'
import { computed, onMounted, reactive } from 'vue'
import Auth, { type AuthInterface } from '@/types/stAuth'
import NumPairLst from '@/components/NumPairLst.vue'
import {
  LeftOutlined,
  MinusCircleOutlined,
  EditOutlined,
  AppstoreAddOutlined,
  SafetyOutlined
} from '@ant-design/icons-vue'
import { useRoute, useRouter } from 'vue-router'
import { notification } from 'ant-design-vue'
import { TinyEmitter } from 'tiny-emitter'
import { compoOpns } from '@lib/types'
import STable, { avaCmpTypes, extraDict } from '@/types/sTable'
import FormDialog from '@lib/components/FormDialog.vue'

const route = useRoute()
const router = useRouter()
const stable = reactive<STable>(new STable())
const userTable = reactive({
  columns: [new Column('登录标识', 'lgnIden')],
  mapper: new Mapper({
    lgnIden: {
      type: 'Input',
      label: '登录标识',
      placeholder: '请输入登录标识',
      rules: [{ required: true, message: '必须给出登录标识！该项用于用户登录' }]
    },
    password: {
      type: 'Password',
      label: '密码'
    },
    extra: {
      type: 'FormGroup',
      label: '额外',
      canFold: false,
      prefix: true,
      display: false
    }
  }),
  formState: new StUser(),
  emitter: new TinyEmitter()
})
const userExtra = reactive({
  emitter: new TinyEmitter(),
  mapper: new Mapper({
    propForm: {
      type: 'FormGroup',
      label: '新字段',
      prefix: true,
      canFold: false,
      display: false,
      items: new Mapper({
        type: {
          type: 'Select',
          label: '类型',
          options: compoOpns.filter(opn => avaCmpTypes.includes(opn.value)),
          onChange: (_user: StUser, newType: keyof typeof extraDict) => {
            const bscItems = Object.entries(userExtra.mapper.propForm.items).filter(([key]) =>
              ['key', 'label', 'type', 'submit'].includes(key)
            )
            bscItems.splice(-1, 0, ...Object.entries(extraDict[newType]))
            userExtra.emitter.emit('update:mprop', {
              'propForm.items': Object.fromEntries(bscItems)
            })
            userExtra.emitter.emit('update:dprop', { propForm: mapTypeTemps[newType]() })
          }
        },
        label: {
          type: 'Input',
          label: '标签',
          placeholder: '输入标签（中文）'
        },
        key: {
          type: 'Input',
          label: '标识',
          placeholder: '输入标识（英文）'
        },
        submit: {
          type: 'Buttons',
          offset: 4,
          buttons: [
            {
              inner: '确定',
              primary: true,
              ghost: false,
              onClick: (form: any) => {
                console.log(form)
                userExtra.emitter.emit('update:mprop', {
                  [form.propForm.key]: form.propForm,
                  'addProp.display': true,
                  'propForm.display': false
                })
              }
            },
            {
              inner: '取消',
              primary: false,
              ghost: false,
              onClick: () =>
                userExtra.emitter.emit('update:mprop', {
                  'addProp.display': true,
                  'propForm.display': false
                })
            }
          ]
        }
      })
    },
    addProp: {
      type: 'Button',
      label: '额外字段',
      inner: '添加',
      primary: false,
      ghost: false,
      dashed: true,
      onClick: () =>
        userExtra.emitter.emit('update:mprop', {
          'addProp.display': false,
          'propForm.display': true
        })
    }
  })
})
const authTable = reactive({
  visible: false,
  columns: [
    {
      title: '*',
      dataIndex: 'desc',
      key: 'desc',
      width: 120,
      align: 'center'
    },
    {
      title: '增',
      dataIndex: 'add',
      key: 'add',
      align: 'center'
    },
    {
      title: '删',
      dataIndex: 'delete',
      key: 'delete',
      align: 'center'
    },
    {
      title: '改',
      dataIndex: 'update',
      key: 'update',
      align: 'center'
    },
    {
      title: '查',
      key: 'query',
      dataIndex: 'query',
      align: 'center'
    }
  ],
  opers: [{ desc: '可否操作' }, { desc: '操作对象' }]
})
type OperType = keyof AuthInterface
const operDict = {
  add: ['addable'],
  delete: ['deletable', 'delOnlyOwn', '删除'],
  update: ['updatable', 'updOnlyOwn', '编辑'],
  query: ['queriable', 'qryOnlyOwn', '查询']
}
const usrExtProps = computed(() =>
  Object.keys(userExtra.mapper).filter(key => !['propForm', 'addProp'].includes(key))
)

onMounted(refresh)

async function refresh() {
  if (!route.query.tid) {
    notification.warn({
      message: '操作错误',
      description: '必须从共享表格页选择跳转到用户页！'
    })
    router.replace('/func_intf/share_table/table')
  }
  STable.copy(await api.shareTable.stable.get(route.query.tid as string), stable, true)
  userTable.columns = [new Column('登录标识', 'lgnIden')].concat(
    Object.values(stable.usrExtra).map(
      mapper => new Column(mapper.label, 'extra.' + mapper.key, { key: 'extra.item.' + mapper.key })
    )
  )
  userTable.emitter.emit('update:mprop', {
    'extra.display': Object.keys(stable.usrExtra).length !== 0,
    'extra.items': stable.usrExtra
  })
  userExtra.emitter.emit(
    'update:mprop',
    Object.fromEntries(
      Object.entries(stable.usrExtra).map(([key, val]) => [key, { ...val, disabled: true }])
    )
  )
  userTable.emitter.emit('refresh')
}
function onAuthConf(user: StUser) {
  StUser.copy(user, userTable.formState, true)
  authTable.visible = true
}
async function onAuthSubmit() {
  if (!userTable.formState.key) {
    await api.shareTable.stable.update({ key: route.query.tid, tempAuth: userTable.formState.auth })
  } else {
    await api.shareTable.user.update(pickOrIgnore(userTable.formState, ['key', 'auth'], false))
  }
  resetUserAuth()
  await refresh()
}
function resetUserAuth() {
  authTable.visible = false
  userTable.formState.reset()
}
async function onUsrExtSubmit() {
  await api.shareTable.stable.update({
    key: stable.key,
    usrExtra: Object.fromEntries(
      Object.entries(userExtra.mapper).filter(([key]) => !['propForm', 'addProp'].includes(key))
    )
  })
  userExtra.emitter.emit('update:visible', false)
  await refresh()
}
function onTempAuthClick() {
  Auth.copy(stable.tempAuth, userTable.formState.auth)
  authTable.visible = true
}
</script>

<template>
  <EditableTable
    :imExport="[{}, true]"
    :api="api.shareTable.user"
    :columns="userTable.columns"
    :mapper="userTable.mapper"
    :emitter="userTable.emitter"
    :new-fun="() => newOne(StUser)"
  >
    <template #title>
      <a-button type="text" @click="() => router.back()">
        <template #icon><LeftOutlined /></template>
        用户管理
      </a-button>
    </template>
    <template #description>
      <a-space align="center">
        <a-typography-title class="mb-0" :level="4">{{ stable.name }}</a-typography-title>
        <a-button @click="() => userExtra.emitter.emit('update:visible', true)">
          <template #icon><AppstoreAddOutlined /></template>
          额外信息
        </a-button>
        <a-button @click="onTempAuthClick">
          <template #icon><SafetyOutlined /></template>
          模板权限
        </a-button>
      </a-space>
    </template>
    <template #operaBefore="{ record }">
      <a-button type="link" size="small" @click="() => onAuthConf(record)">配置权限</a-button>
    </template>
  </EditableTable>
  <a-modal width="100vw" v-model:open="authTable.visible" title="配置权限" @ok="onAuthSubmit">
    <a-table
      bordered
      :columns="authTable.columns"
      :data-source="authTable.opers"
      :pagination="false"
    >
      <template #bodyCell="{ record, column }">
        <a-space v-if="record.desc === '可否操作' && column.dataIndex !== 'desc'">
          <a-switch
            v-model:checked="userTable.formState.auth[getProp(operDict, column.dataIndex + '[0]') as OperType]"
            checked-children="可"
            un-checked-children="否"
          />
          <a-checkbox
            v-if="['delete', 'update', 'query'].includes(column.dataIndex)"
            v-model:checked="userTable.formState.auth[getProp(operDict, column.dataIndex + '[1]') as OperType]"
            :disabled="!userTable.formState.auth[getProp(operDict, column.dataIndex + '[0]') as OperType]"
          >
            只可{{ getProp(operDict, column.dataIndex + '[2]') }}自己创建的记录
          </a-checkbox>
        </a-space>
        <a-form v-else-if="record.desc === '操作对象'" layout="vertical">
          <a-form-item v-if="column.dataIndex === 'desc'" label="操作对象">
            <a-typography-text type="secondary">
              如需操作所有行/单元格，直接使用【*】符号
            </a-typography-text>
          </a-form-item>
          <a-form-item v-if="column.dataIndex === 'add'" label="可添加的记录数">
            <a-input
              :disabled="!userTable.formState.auth.addable"
              type="number"
              placeholder="记录数"
              v-model:value="userTable.formState.auth.canAddNum"
            />
          </a-form-item>
          <a-form-item v-else-if="column.dataIndex === 'delete'">
            <template #label>
              可删除的行数&nbsp;
              <a-typography-text type="secondary">结束行不填代表指定行</a-typography-text>
            </template>
            <NumPairLst
              v-model:num-pair-list="userTable.formState.auth.canDelRows"
              :disabled="!userTable.formState.auth.deletable || userTable.formState.auth.delOnlyOwn"
            />
          </a-form-item>
          <a-form-item v-else-if="column.dataIndex === 'update'" label="可修改的行/单元格">
            <NumPairLst
              v-model:num-pair-list="userTable.formState.auth.canUpdRowCells"
              :disabled="!userTable.formState.auth.updatable || userTable.formState.auth.updOnlyOwn"
              :placeholder="['行号', '列号']"
              split-letter="/"
            />
          </a-form-item>
          <a-form-item v-else-if="column.dataIndex === 'query'" label="可修改的行/单元格">
            <NumPairLst
              v-model:num-pair-list="userTable.formState.auth.canQryRowCells"
              :disabled="!userTable.formState.auth.queriable || userTable.formState.auth.qryOnlyOwn"
              :placeholder="['行号', '列号']"
              split-letter="/"
            />
          </a-form-item>
        </a-form>
      </template>
    </a-table>
  </a-modal>
  <FormDialog
    title="添加额外字段"
    :mapper="userExtra.mapper"
    :emitter="userExtra.emitter"
    @submit="onUsrExtSubmit"
  >
    <template v-for="prop in usrExtProps" #[`${prop}SFX`]>
      <a-button type="link">
        <template #icon><EditOutlined /></template>
      </a-button>
      <a-popconfirm title="确定删除该组件？" @confirm="() => delete userExtra.mapper[prop]">
        <a-button type="text" danger>
          <template #icon><MinusCircleOutlined /></template>
        </a-button>
      </a-popconfirm>
    </template>
  </FormDialog>
</template>
