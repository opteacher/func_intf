<script setup lang="ts">
import EditableTable from '@lib/components/EditableTable.vue'
import api from '@/api'
import { newOne, getProp } from '@lib/utils'
import Column from '@lib/types/column'
import Mapper from '@lib/types/mapper'
import StUser from '@/types/stUser'
import { reactive } from 'vue'
import Auth, { type AuthInterface } from '@/types/stAuth'
import NumPairLst from '@/components/NumPairLst.vue'
import { LeftOutlined } from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const userTable = reactive({
  columns: [new Column('邮箱', 'email')],
  mapper: new Mapper({
    email: {
      type: 'Input',
      label: '邮箱',
      placeholder: '请输入邮箱'
    },
    password: {
      type: 'Password',
      label: '密码'
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
  opers: [{ desc: '可否操作' }, { desc: '操作对象' }],
  formState: new Auth()
})
type OperType = keyof AuthInterface
const operDict = {
  add: ['addable'],
  delete: ['deletable', 'delOnlyOwn'],
  update: ['updatable', 'updOnlyOwn'],
  query: ['queriable', 'qryOnlyOwn']
}

function onAuthConf(user: StUser) {
  StUser.copy(user, userTable.formState)
  authTable.visible = true
  Auth.copy(user.auth, authTable.formState)
}
async function onAuthSubmit() {
  Auth.copy(authTable.formState, userTable.formState.auth)
  await api.shareTable.user.update(userTable.formState)
  resetUserAuth()
}
function resetUserAuth() {
  authTable.visible = false
  userTable.formState.reset()
  authTable.formState.reset()
}
</script>

<template>
  <EditableTable
    :api="api.shareTable.user"
    :columns="userTable.columns"
    :mapper="userTable.mapper"
    :new-fun="() => newOne(StUser)"
  >
    <template #title>
      <a-space>
        <a-button type="text" @click="() => router.back()">
          <template #icon><LeftOutlined /></template>
        </a-button>
        用户管理
      </a-space>
    </template>
    <template #operaBefore="{ record }">
      <a-button type="link" size="small" @click="() => onAuthConf(record)">配置权限</a-button>
    </template>
  </EditableTable>
  <a-modal width="80vw" v-model:open="authTable.visible" title="配置权限" @ok="onAuthSubmit">
    <a-table
      bordered
      :columns="authTable.columns"
      :data-source="authTable.opers"
      :pagination="false"
    >
      <template #bodyCell="{ record, column }">
        <a-space v-if="record.desc === '可否操作' && column.dataIndex !== 'desc'">
          <a-switch
            v-model:checked="authTable.formState[getProp(operDict, column.dataIndex + '[0]') as OperType]"
            checked-children="可"
            un-checked-children="否"
          />
          <a-checkbox
            v-if="['delete', 'update', 'query'].includes(column.dataIndex)"
            v-model:checked="authTable.formState[getProp(operDict, column.dataIndex + '[1]') as OperType]"
            :disabled="!authTable.formState[getProp(operDict, column.dataIndex + '[0]') as OperType]"
          >
            只可操作自己创建的记录
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
              :disabled="!authTable.formState.addable"
              type="number"
              placeholder="记录数"
              v-model:value="authTable.formState.canAddNum"
            />
          </a-form-item>
          <a-form-item v-else-if="column.dataIndex === 'delete'">
            <template #label>
              可删除的行数&nbsp;
              <a-typography-text type="secondary">结束行不填代表指定行</a-typography-text>
            </template>
            <NumPairLst
              v-model:num-pair-list="authTable.formState.canDelRows"
              :disabled="!authTable.formState.deletable || authTable.formState.delOnlyOwn"
            />
          </a-form-item>
          <a-form-item v-else-if="column.dataIndex === 'update'" label="可修改的行/单元格">
            <NumPairLst
              v-model:num-pair-list="authTable.formState.canUpdRowCells"
              :disabled="!authTable.formState.updatable || authTable.formState.updOnlyOwn"
              :placeholder="['行号', '列号']"
              split-letter="/"
            />
          </a-form-item>
          <a-form-item v-else-if="column.dataIndex === 'query'" label="可修改的行/单元格">
            <NumPairLst
              v-model:num-pair-list="authTable.formState.canQryRowCells"
              :disabled="!authTable.formState.queriable || authTable.formState.qryOnlyOwn"
              :placeholder="['行号', '列号']"
              split-letter="/"
            />
          </a-form-item>
        </a-form>
      </template>
    </a-table>
  </a-modal>
</template>
