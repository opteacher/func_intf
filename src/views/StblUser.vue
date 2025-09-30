<script setup lang="ts">
import EditableTable from '@lib/components/EditableTable.vue'
import api from '@/api'
import { newOne, getProp, pickOrIgnore, setProp } from '@lib/utils'
import Column from '@lib/types/column'
import Mapper, { BaseMapper, mapTypeTemps } from '@lib/types/mapper'
import StUser from '@/types/stUser'
import { onMounted, reactive, ref } from 'vue'
import Auth, { type AuthInterface } from '@/types/stAuth'
import {
  TeamOutlined,
  MinusCircleOutlined,
  EditOutlined,
  AppstoreAddOutlined,
  SafetyOutlined,
  MoreOutlined,
  InfoCircleOutlined
} from '@ant-design/icons-vue'
import { useRoute, useRouter } from 'vue-router'
import { notification } from 'ant-design-vue'
import { TinyEmitter } from 'tiny-emitter'
import { compoOpns } from '@lib/types'
import STable, { avaCmpTypes, extraDict } from '@/types/sTable'
import FormDialog from '@lib/components/FormDialog.vue'
import { cloneDeep, difference } from 'lodash'
import { Tag as ATag } from 'ant-design-vue'

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
    type: {
      type: 'Select',
      label: '类型',
      display: false,
      options: compoOpns.filter(opn => avaCmpTypes.includes(opn.value)),
      onChange: (_user: StUser, newType: keyof typeof extraDict) => {
        userExtra.emitter.emit('update:mprop', {
          'extParams.items': extraDict[newType]
        })
        userExtra.emitter.emit('update:dprop', mapTypeTemps[newType]())
      },
      rules: [{ required: true, message: '必须选择组件类型！' }]
    },
    label: {
      type: 'Input',
      label: '标签',
      display: false,
      placeholder: '输入标签（中文）',
      rules: [{ required: true, message: '必须输入标签！' }]
    },
    key: {
      type: 'Input',
      label: '标识',
      display: false,
      placeholder: '输入标识（英文）',
      rules: [{ required: true, message: '必须输入标识！' }]
    },
    required: {
      type: 'Checkbox',
      label: '是否必须',
      display: false,
      chkLabels: ['非必须', '必须']
    },
    extParams: {
      type: 'FormGroup',
      label: '额外参数',
      display: false,
      canFold: false,
      items: {}
    },
    submit: {
      type: 'Buttons',
      display: false,
      offset: 4,
      buttons: [
        {
          inner: '确定',
          primary: true,
          ghost: false,
          onClick: async (form: any) => {
            await extraForm.value.formRef.refer.validate()
            userExtra.emitter.emit('update:mprop', {
              [form.key]: setProp(
                cloneDeep(pickOrIgnore(form, ['addProp', 'extParams', 'submit'])),
                'disabled',
                true
              )
            })
            onAddExtPropCancel()
          }
        },
        {
          inner: '取消',
          primary: false,
          ghost: false,
          onClick: onAddExtPropCancel
        }
      ]
    },
    addProp: {
      type: 'Button',
      label: '额外字段',
      inner: '添加',
      primary: false,
      ghost: false,
      dashed: true,
      onClick: () => {
        userExtra.emitter.emit('update:mprop', {
          'addProp.display': false,
          ...Object.fromEntries(
            Object.keys(userExtra.mapper)
              .filter(key => key !== 'addProp')
              .map(key => [key + '.display', true])
          )
        })
      }
    }
  })
})
const baseMapper = new BaseMapper()
const extraMkeys = Object.keys(userExtra.mapper)
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
const extraForm = ref()

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
    Object.values(stable.usrExtra).map(mapper => new Column(mapper.label, 'extra.' + mapper.key))
  )
  userTable.emitter.emit('update:mprop', {
    'extra.display': Object.keys(stable.usrExtra).length !== 0,
    'extra.items': stable.usrExtra
  })
  userExtra.emitter.emit(
    'update:mprop',
    Object.fromEntries(
      Object.entries(stable.usrExtra).map(([key, val]) => [
        key,
        { ...pickOrIgnore(val, ['rules']), disabled: true }
      ])
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
    await api.shareTable.user().update(pickOrIgnore(userTable.formState, ['key', 'auth'], false))
  }
  resetUserAuth()
  await refresh()
}
function resetUserAuth() {
  authTable.visible = false
  userTable.formState.reset()
}
async function onUsrExtSubmit(_form: any, callback: Function) {
  await api.shareTable.stable.update({
    key: stable.key,
    usrExtra: Object.fromEntries(
      Object.entries(userExtra.mapper)
        .filter(([key]) => !extraMkeys.includes(key))
        .map(([key, val]) => [
          key,
          {
            disabled: false,
            rules: [{ required: val.required, message: '必须给出该参数！' }],
            ...pickOrIgnore(val, ['disabled', 'required', 'rules'])
          }
        ])
    )
  })
  callback()
  await refresh()
}
function onTempAuthClick() {
  Auth.copy(stable.tempAuth, userTable.formState.auth)
  authTable.visible = true
}
function onMoreClick({ key }: { key: 'extra' | 'auth' }) {
  switch (key) {
    case 'extra':
      userExtra.emitter.emit('update:visible', true)
      break
    case 'auth':
      onTempAuthClick()
      break
  }
}
function onAddExtPropCancel() {
  userExtra.emitter.emit('update:mprop', {
    'addProp.display': true,
    ...Object.fromEntries(
      extraMkeys.filter(key => key !== 'addProp').map(key => [key + '.display', false])
    )
  })
  userExtra.emitter.emit('update:dprop', baseMapper)
}
function onUsrExtCancel(visible: boolean) {
  if (!visible) {
    userExtra.emitter.emit(
      'delete:mapper',
      difference(Object.keys(userExtra.mapper), extraMkeys.concat(Object.keys(stable.usrExtra)))
    )
    onAddExtPropCancel()
  }
}
</script>

<template>
  <EditableTable
    :title="stable.name"
    :icon="TeamOutlined"
    :imExport="[{}, true]"
    :api="api.shareTable.user()"
    :columns="userTable.columns"
    :mapper="userTable.mapper"
    :emitter="userTable.emitter"
    :new-fun="() => newOne(StUser)"
  >
    <template #tags>
      <a-tag color="#2db7f5">
        <template #icon><InfoCircleOutlined /></template>
        使用引导
      </a-tag>
    </template>
    <template #description>
      <a-breadcrumb class="inline-block">
        <a-breadcrumb-item><a href="/#/func_intf/share_table/table">共享表格</a></a-breadcrumb-item>
        <a-breadcrumb-item>
          成员管理
          <template #overlay>
            <a-menu>
              <a-menu-item>
                <a :href="`/#/func_intf/share_table/data?tid=${route.query.tid}`">数据表浏览</a>
              </a-menu-item>
            </a-menu>
          </template>
        </a-breadcrumb-item>
      </a-breadcrumb>
    </template>
    <template #extra>
      <a-dropdown>
        <template #overlay>
          <a-menu @click="onMoreClick">
            <a-menu-item key="extra">
              <AppstoreAddOutlined />
              额外信息
            </a-menu-item>
            <a-menu-item key="auth">
              <SafetyOutlined />
              模板权限
            </a-menu-item>
          </a-menu>
        </template>
        <a-button>
          <template #icon><MoreOutlined /></template>
        </a-button>
      </a-dropdown>
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
        <a-form
          v-else-if="record.desc === '操作对象'"
          :layout="column.dataIndex === 'add' ? 'vertical' : 'horizontal'"
          :model="userTable.formState.auth"
        >
          <a-form-item v-if="column.dataIndex === 'desc'" label="操作对象">
            <a-tooltip placement="topLeft">
              <template #title>如需操作所有行/单元格，直接使用【*】符号</template>
              <InfoCircleOutlined />
            </a-tooltip>
          </a-form-item>
          <a-form-item v-if="column.dataIndex === 'add'" label="可新增的记录数" name="canAddNum">
            <a-input
              :disabled="!userTable.formState.auth.addable"
              :type="userTable.formState.auth.canAddNum === '*' ? 'text' : 'number'"
              placeholder="记录数"
              v-model:value="userTable.formState.auth.canAddNum"
            >
              <template #suffix>
                <a-button
                  size="small"
                  type="text"
                  @click="() => (userTable.formState.auth.canAddNum = '*')"
                >
                  无限制
                </a-button>
              </template>
            </a-input>
          </a-form-item>
          <OpSubFmItm
            v-else-if="['delete', 'update', 'query'].includes(column.dataIndex)"
            v-model:auth="userTable.formState.auth"
            :stable="stable"
            :op-ary="operDict[column.dataIndex as 'delete' | 'update' | 'query']"
          />
        </a-form>
      </template>
    </a-table>
  </a-modal>
  <FormDialog
    title="添加额外字段"
    width="30vw"
    ref="extraForm"
    :mapper="userExtra.mapper"
    :emitter="userExtra.emitter"
    :new-fun="() => newOne(BaseMapper)"
    @submit="onUsrExtSubmit"
    @update:visible="onUsrExtCancel"
  >
    <template
      v-for="prop in Object.keys(userExtra.mapper).filter(key => !extraMkeys.includes(key))"
      #[`${prop}SFX`]
    >
      <a-button type="link">
        <template #icon><EditOutlined /></template>
      </a-button>
      <a-popconfirm
        title="确定删除该组件？"
        @confirm="() => userExtra.emitter.emit('delete:mprop', [prop])"
      >
        <a-button type="text" danger>
          <template #icon><MinusCircleOutlined /></template>
        </a-button>
      </a-popconfirm>
    </template>
  </FormDialog>
</template>
