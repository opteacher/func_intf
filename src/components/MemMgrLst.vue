<script setup lang="ts">
import {
  UserOutlined,
  MoreOutlined,
  UserAddOutlined,
  AppstoreAddOutlined,
  SafetyOutlined,
  EditOutlined,
  MinusCircleOutlined,
  TeamOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons-vue'
import StUser from '@/types/stUser'
import { cloneDeep, difference } from 'lodash'
import { createVNode, onMounted, reactive, ref, watch } from 'vue'
import { TinyEmitter } from 'tiny-emitter'
import Mapper, { BaseMapper, mapTypeTemps } from '@lib/types/mapper'
import { compoOpns } from '@lib/types'
import STable, { avaCmpTypes, extraDict } from '@/types/sTable'
import { pickOrIgnore, setProp, newOne, getProp } from '@lib/utils'
import type { AuthInterface } from '@/types/stAuth'
import Auth from '@/types/stAuth'
import FormDialog from '@lib/components/FormDialog.vue'
import api from '@/api'
import NumPairLst from '@/components/NumPairLst.vue'
import { Modal } from 'ant-design-vue'

const props = defineProps({
  stable: { type: STable, required: true }
})
const emit = defineEmits(['refresh'])
const userList = reactive({
  emitter: new TinyEmitter(),
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
  formState: new StUser()
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
const extraForm = ref()
const baseMapper = new BaseMapper()
const extraMkeys = Object.keys(userExtra.mapper)

onMounted(refresh)
watch(() => props.stable.usrExtra, refresh, { deep: true })

function refresh() {
  userList.emitter.emit('update:mprop', {
    'extra.display': Object.keys(props.stable.usrExtra).length !== 0,
    'extra.items': new Mapper(props.stable.usrExtra)
  })
  userExtra.emitter.emit(
    'update:mprop',
    Object.fromEntries(
      Object.entries(props.stable.usrExtra).map(([key, val]) => [
        key,
        { ...pickOrIgnore(val, ['rules']), disabled: true }
      ])
    )
  )
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
function onTempAuthClick() {
  Auth.copy(props.stable.tempAuth, userList.formState.auth)
  authTable.visible = true
}
async function onUsrExtSubmit(_form: any, callback: Function) {
  await api.shareTable.stable.update({
    key: props.stable.key,
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
  emit('refresh')
}
function onUsrExtCancel(visible: boolean) {
  if (!visible) {
    userExtra.emitter.emit(
      'delete:mapper',
      difference(
        Object.keys(userExtra.mapper),
        extraMkeys.concat(Object.keys(props.stable.usrExtra))
      )
    )
    onAddExtPropCancel()
  }
}
async function onAddUsrSubmit(form: StUser, callback: Function) {
  const oper = form.key ? 'update' : 'add'
  await api.shareTable.user(props.stable.key)[oper](form)
  callback()
  emit('refresh')
}
async function onAuthSubmit() {
  if (!userList.formState.key) {
    await api.shareTable.stable.update({ key: props.stable.key, tempAuth: userList.formState.auth })
  } else {
    await api.shareTable
      .user(props.stable.key)
      .update(pickOrIgnore(userList.formState, ['key', 'auth'], false))
  }
  resetUserAuth()
  emit('refresh')
}
function resetUserAuth() {
  authTable.visible = false
  userList.formState.reset()
}
function onAuthConf(user: StUser) {
  StUser.copy(user, userList.formState, true)
  authTable.visible = true
}
function onUserClick(user: StUser) {
  userList.emitter.emit('update:visible', {
    show: true,
    object: user,
    viewOnly: true
  })
}
function onUsrDelClick(user: StUser) {
  Modal.confirm({
    title: '确定删除该成员吗？',
    icon: createVNode(ExclamationCircleOutlined),
    content: '该成员已录入的数据不会被清空',
    okType: 'danger',
    onOk: async () => {
      await api.shareTable.user(props.stable.key).remove(user)
      emit('refresh')
    }
  })
}
</script>

<template>
  <a-list item-layout="horizontal" size="small" :data-source="stable.fkUsers">
    <template #header>
      <a-page-header class="p-0">
        <template #avatar>
          <TeamOutlined class="text-xl mr-1" />
        </template>
        <template #title>
          <a-typography-title class="mb-0" :level="5">成员管理</a-typography-title>
        </template>
        <template #extra>
          <a-button
            type="primary"
            ghost
            size="small"
            @click="() => userList.emitter.emit('update:visible', { show: true, viewOnly: false })"
          >
            <template #icon><UserAddOutlined /></template>
          </a-button>
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
            <a-button size="small">
              <template #icon><MoreOutlined /></template>
            </a-button>
          </a-dropdown>
        </template>
      </a-page-header>
    </template>
    <template #renderItem="{ item: user }">
      <a-list-item class="px-0">
        <a-list-item-meta>
          <template #title>
            <a @click="() => onUserClick(user)">
              <b>{{ user.lgnIden }}</b>
            </a>
          </template>
          <template #avatar>
            <a @click="() => onUserClick(user)">
              <a-avatar size="small">
                <template #icon><UserOutlined /></template>
              </a-avatar>
            </a>
          </template>
        </a-list-item-meta>
        <template #actions>
          <a-tooltip>
            <template #title>用户权限</template>
            <a-button type="text" size="small" @click="() => onAuthConf(user)">
              <template #icon><SafetyOutlined /></template>
            </a-button>
          </a-tooltip>
          <a-tooltip>
            <template #title>删除用户</template>
            <a-button type="text" size="small" danger @click="() => onUsrDelClick(user)">
              <template #icon><DeleteOutlined /></template>
            </a-button>
          </a-tooltip>
        </template>
      </a-list-item>
    </template>
  </a-list>
  <FormDialog
    title="添加成员"
    :operable="true"
    :mapper="userList.mapper"
    :emitter="userList.emitter"
    :new-fun="() => newOne(StUser)"
    @submit="onAddUsrSubmit"
  />
  <FormDialog
    title="添加额外字段"
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
            v-model:checked="userList.formState.auth[getProp(operDict, column.dataIndex + '[0]') as OperType]"
            checked-children="可"
            un-checked-children="否"
          />
          <a-checkbox
            v-if="['delete', 'update', 'query'].includes(column.dataIndex)"
            v-model:checked="userList.formState.auth[getProp(operDict, column.dataIndex + '[1]') as OperType]"
            :disabled="!userList.formState.auth[getProp(operDict, column.dataIndex + '[0]') as OperType]"
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
              :disabled="!userList.formState.auth.addable"
              type="number"
              placeholder="记录数"
              v-model:value="userList.formState.auth.canAddNum"
            />
          </a-form-item>
          <a-form-item v-else-if="column.dataIndex === 'delete'">
            <template #label>
              可删除的行数&nbsp;
              <a-typography-text type="secondary">结束行不填代表指定行</a-typography-text>
            </template>
            <NumPairLst
              v-model:num-pair-list="userList.formState.auth.canDelRows"
              :disabled="!userList.formState.auth.deletable || userList.formState.auth.delOnlyOwn"
            />
          </a-form-item>
          <a-form-item v-else-if="column.dataIndex === 'update'" label="可修改的行/单元格">
            <NumPairLst
              v-model:num-pair-list="userList.formState.auth.canUpdRowCells"
              :disabled="!userList.formState.auth.updatable || userList.formState.auth.updOnlyOwn"
              :placeholder="['行号', '列号']"
              split-letter="/"
            />
          </a-form-item>
          <a-form-item v-else-if="column.dataIndex === 'query'" label="可修改的行/单元格">
            <NumPairLst
              v-model:num-pair-list="userList.formState.auth.canQryRowCells"
              :disabled="!userList.formState.auth.queriable || userList.formState.auth.qryOnlyOwn"
              :placeholder="['行号', '列号']"
              split-letter="/"
            />
          </a-form-item>
        </a-form>
      </template>
    </a-table>
  </a-modal>
</template>
