<script setup lang="ts">
import EditableTable from '@lib/components/EditableTable.vue'
import { notification } from 'ant-design-vue'
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api'
import Column from '@lib/types/column'
import { TinyEmitter } from 'tiny-emitter'
import Mapper, { newObjByMapper } from '@lib/types/mapper'
import { LeftOutlined } from '@ant-design/icons-vue'
import STable from '@/types/sTable'
import type StUser from '@/types/stUser'
import FieldItem from '@lib/components/FieldItem.vue'

const route = useRoute()
const router = useRouter()
const stable = reactive<STable>(new STable())
const emitter = new TinyEmitter()
const mapper = ref(new Mapper())
const columns = reactive<Column[]>([])
const login = reactive({
  form: { lgnIden: '', password: '' },
  mode: 'login' as 'login' | 'register'
})

onMounted(async () => {
  if (!route.query.tid) {
    notification.warn({
      message: '操作错误',
      description: '必须从共享表格页选择跳转到数据表格页！'
    })
    router.replace('/func_intf/share_table/table')
  }
  STable.copy(await api.shareTable.stable.get(route.query.tid as string), stable)
  columns.splice(
    0,
    columns.length,
    ...Object.entries(stable.form).map(([key, value]) => new Column(value.label, key))
  )
  emitter.emit('refresh')
  mapper.value = new Mapper(stable.form)
  emitter.emit('update:mapper', mapper.value)
})

function onLogin(form: StUser) {
  console.log(form)
}
</script>

<template>
  <template v-if="stable.usrAuth">
    <a-typography-title :level="2">共享表格</a-typography-title>
    <a-form
      :model="login.form"
      :label-col="{ span: 10 }"
      :wrapper-col="{ span: 4 }"
      autocomplete="off"
      @finish="onLogin"
    >
      <a-form-item :wrapper-col="{ offset: 10 }">
        <a-radio-group v-model:value="login.mode" button-style="solid">
          <a-radio-button value="login">登录</a-radio-button>
          <a-radio-button value="register">注册</a-radio-button>
        </a-radio-group>
      </a-form-item>

      <a-form-item
        label="登录标识"
        name="lgnIden"
        :rules="[{ required: true, message: '输入登录标识！' }]"
      >
        <a-input v-model:value="login.form.lgnIden" />
      </a-form-item>

      <a-form-item
        label="密码"
        name="password"
        :rules="[{ required: true, message: '输入密码！' }]"
      >
        <a-input-password v-model:value="login.form.password" />
      </a-form-item>

      <a-form-item
        v-if="login.mode === 'register'"
        label="重复密码"
        name="repeatPassword"
        :rules="[{ required: true, message: '重复密码！' }]"
      >
        <a-input-password v-model:value="login.form.password" />
      </a-form-item>

      <FieldItem
        v-for="mapper in Object.values(stable.usrExtra)"
        :form="login.form"
        :skey="mapper.key"
        :mapper="mapper"
      />

      <a-form-item :wrapper-col="{ offset: 10, span: 4 }">
        <a-button type="primary" html-type="submit">登录</a-button>
      </a-form-item>
    </a-form>
  </template>
  <EditableTable
    v-else
    :edit-mode="stable.edtMod"
    :emitter="emitter"
    :api="api.shareTable.data"
    :mapper="mapper"
    :columns="columns"
    :new-fun="() => newObjByMapper(mapper)"
  >
    <template #title>
      <a-button type="text" @click="() => router.back()">
        <template #icon><LeftOutlined /></template>
        数据管理
      </a-button>
    </template>
  </EditableTable>
</template>
