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
  ExclamationCircleOutlined,
  UsergroupAddOutlined,
  InfoCircleOutlined
} from '@ant-design/icons-vue'
import StUser from '@/types/stUser'
import { cloneDeep, difference } from 'lodash'
import { computed, createVNode, onMounted, reactive, ref, watch } from 'vue'
import { TinyEmitter } from 'tiny-emitter'
import Mapper, { BaseMapper, mapTypeTemps } from '@lib/types/mapper'
import { compoOpns } from '@lib/types'
import STable, { avaCmpTypes, extraDict } from '@/types/sTable'
import { pickOrIgnore, setProp, newOne } from '@lib/utils'
import Auth from '@/types/stAuth'
import FormDialog from '@lib/components/FormDialog.vue'
import api from '@/api'
import { Modal } from 'ant-design-vue'
import BatImpBox from '@lib/components/BatImpBox.vue'
import Column from '@lib/types/column'
import type BatImp from '@lib/types/batImp'
import { utils, type WorkSheet } from 'xlsx'
import OpSubFmItm from './OpSubFmItm.vue'
import _ from 'lodash'

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
    nickName: {
      type: 'Input',
      label: '昵称',
      placeholder: '请输入昵称'
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
const columns = computed(() =>
  Object.entries(userList.mapper)
    .filter(([key]) => key !== 'extra')
    .concat(Object.entries(userList.mapper['extra'].items || {}))
    .map(([key, value]) => new Column(value.label, key))
)
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
    },
    {
      title: '导入导出',
      key: 'imExport',
      dataIndex: 'imExport',
      align: 'center'
    }
  ],
  opers: [{ desc: '可否操作' }, { desc: '操作对象' }]
})
const operDict = {
  add: ['addable'],
  delete: ['deletable', 'delOnlyOwn', 'canDelRows', '删除'],
  update: ['updatable', 'updOnlyOwn', 'canUpdRows', '编辑'],
  query: ['queriable', 'qryOnlyOwn', 'canQryRows', '查询']
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
  emit('refresh')
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
async function onBatImpUsrSubmit(info: BatImp) {
  const worksheet = info.worksheet as WorkSheet
  const records = utils.sheet_to_json<any[]>(worksheet, { header: 1 })
  const header = records[info.hdRowNo]
  const dict = Object.entries(info.mapper)
  const colDict = dict.map(([key, value]) => [header.indexOf(key), value.prop]) as [
    number,
    string
  ][]
  const reqDict = Object.fromEntries(dict.map(([_colNam, prop]) => [prop.prop, prop.required]))
  const users = records
    .slice(info.dtRowNo)
    .map(record =>
      Object.fromEntries(
        colDict.map(([idx, prop]) => {
          if (reqDict[prop]) {
            return record[idx] ? [prop, record[idx]] : [prop]
          } else {
            return [prop, record[idx]]
          }
        })
      )
    )
    .filter(
      record => !Object.entries(reqDict).some(([prop, required]) => required && !record[prop])
    )
  await Promise.all(users.map(user => api.shareTable.user(props.stable.key).add(user)))
  emit('refresh')
}
</script>

<template>
  <div class="h-full flex flex-col">
    <a-page-header class="p-0">
      <template #avatar>
        <TeamOutlined class="text-xl mr-1" />
      </template>
      <template #title>
        <a-typography-title class="mb-0" :level="5">成员管理</a-typography-title>
      </template>
      <template #extra>
        <BatImpBox
          :columns="columns"
          :copyFun="StUser.copy"
          @submit="onBatImpUsrSubmit"
        >
          <template #button>
            <a-tooltip>
              <template #title>批量导入成员</template>
              <a-button size="small" @click.prevent>
                <template #icon><UsergroupAddOutlined /></template>
              </a-button>
            </a-tooltip>
          </template>
        </BatImpBox>
        <a-tooltip>
          <template #title>添加成员</template>
          <a-button
            type="primary"
            ghost
            size="small"
            @click="() => userList.emitter.emit('update:visible', { show: true, viewOnly: false })"
          >
            <template #icon><UserAddOutlined /></template>
          </a-button>
        </a-tooltip>
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
    <div class="flex-1 relative overflow-hidden">
      <a-list
        class="absolute top-0 left-0 bottom-0 right-0 overflow-auto"
        item-layout="horizontal"
        size="small"
        :data-source="stable.fkUsers"
      >
        <template #renderItem="{ item: user }">
          <a-list-item class="px-0">
            <a-list-item-meta :description="user.nickName">
              <template #title>
                <a @click="() => onUserClick(user)">
                  <b>{{ user.lgnIden }}</b>
                </a>
              </template>
              <template #avatar>
                <a @click="() => onUserClick(user)">
                  <a-avatar>
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
    </div>
  </div>
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
  <a-modal width="60vw" v-model:open="authTable.visible" @ok="onAuthSubmit">
    <template #title>
      配置权限
      <a-typography-text class="ms-2" type="secondary">
        如需操作所有行/单元格，直接使用【*】符号
      </a-typography-text>
    </template>
    <a-descriptions :column="1" bordered>
      <a-descriptions-item>
        <template #label>
          <div class="flex space-x-2 items-center">
            <a-switch
              v-model:checked="userList.formState.auth.addable"
              checked-children="可"
              un-checked-children="不可"
            />
            <a-typography-text strong>添加</a-typography-text>
          </div>
        </template>
        <div class="flex items-center space-x-2">
          <a-input
            class="flex-1"
            :disabled="!userList.formState.auth.addable"
            :type="userList.formState.auth.canAddNum === '*' ? 'text' : 'number'"
            placeholder="记录数"
            v-model:value="userList.formState.auth.canAddNum"
          >
            <template #prefix>可新增</template>
            <template #suffix>条记录</template>
          </a-input>
          <a-button
            :disabled="!userList.formState.auth.addable"
            @click="() => (userList.formState.auth.canAddNum = '*')"
          >
            无限制
          </a-button>
        </div>
      </a-descriptions-item>
      <a-descriptions-item>
        <template #label>
          <div class="flex space-x-2 items-center">
            <a-switch
              v-model:checked="userList.formState.auth.deletable"
              checked-children="可"
              un-checked-children="不可"
            />
            <a-typography-text strong>删除</a-typography-text>
          </div>
        </template>
        <OpSubFmItm
          v-model:auth="userList.formState.auth"
          :stable="stable"
          :op-ary="operDict.delete"
        />
      </a-descriptions-item>
      <a-descriptions-item>
        <template #label>
          <div class="flex space-x-2 items-center">
            <a-switch
              v-model:checked="userList.formState.auth.updatable"
              checked-children="可"
              un-checked-children="不可"
            />
            <a-typography-text strong>修改</a-typography-text>
          </div>
        </template>
        <OpSubFmItm
          v-model:auth="userList.formState.auth"
          :stable="stable"
          :op-ary="operDict.update"
        />
      </a-descriptions-item>
      <a-descriptions-item>
        <template #label>
          <div class="flex space-x-2 items-center">
            <a-switch
              v-model:checked="userList.formState.auth.queriable"
              checked-children="可"
              un-checked-children="不可"
            />
            <a-typography-text strong>查询</a-typography-text>
          </div>
        </template>
        <OpSubFmItm
          v-model:auth="userList.formState.auth"
          :stable="stable"
          :op-ary="operDict.query"
        />
      </a-descriptions-item>
      <a-descriptions-item>
        <template #label>
          <div class="flex justify-between">
            <div class="flex flex-col space-y-1">
              <div class="flex space-x-2 items-center">
                <a-switch
                  v-model:checked="userList.formState.auth.importable"
                  :disabled="!userList.formState.auth.addable"
                  checked-children="可"
                  un-checked-children="不可"
                />
                <a-typography-text strong>导入</a-typography-text>
              </div>
              <div class="flex space-x-2 items-center">
                <a-switch
                  v-model:checked="userList.formState.auth.exportable"
                  :disabled="!userList.formState.auth.queriable"
                  checked-children="可"
                  un-checked-children="不可"
                />
                <a-typography-text strong>导出</a-typography-text>
              </div>
            </div>
            <a-tooltip>
              <template #title>
                <pre class="mb-0">{{ '* 导入数量受新增数量控制\n* 导出数据是权限可查询得到的数据' }}</pre>
              </template>
              <InfoCircleOutlined />
            </a-tooltip>
          </div>
        </template>
      </a-descriptions-item>
    </a-descriptions>
  </a-modal>
</template>
