<script setup lang="ts">
import EditableTable from '@lib/components/EditableTable.vue'
import { notification } from 'ant-design-vue'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api'
import Column from '@lib/types/column'
import { TinyEmitter } from 'tiny-emitter'
import Mapper, { newObjByMapper } from '@lib/types/mapper'
import { LeftOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons-vue'
import STable from '@/types/sTable'
import StUser from '@/types/stUser'
import { pickOrIgnore, setProp } from '@lib/utils'
import FormGroup from '@lib/components/FormGroup.vue'
import { useLoginStore } from '@/stores/login'
import { storeToRefs } from 'pinia'

const route = useRoute()
const router = useRouter()
const store = useLoginStore()
const stable = reactive<STable>(new STable())
const emitter = new TinyEmitter()
const mapper = ref(new Mapper())
const columns = reactive<Column[]>([])
const login = reactive({
  form: new StUser(),
  mode: 'login' as 'login' | 'register',
  regSucceed: false
})
const { user: lgnUsr } = storeToRefs(store)
const count = ref(0)
const usrAddable = computed(
  () =>
    lgnUsr.value?.auth.addable &&
    (lgnUsr.value?.auth.canAddNum === '*' || count.value < lgnUsr.value?.auth.canAddNum)
)

onMounted(async () => {
  if (!route.query.tid) {
    notification.warn({
      message: '操作错误',
      description: '必须从共享表格页选择跳转到数据表格页！'
    })
    router.replace('/func_intf/share_table/table')
  }
  STable.copy(await api.shareTable.stable.get(route.query.tid as string), stable)
  login.form.extra = newObjByMapper(stable.usrExtra)
  columns.splice(
    0,
    columns.length,
    ...Object.entries(stable.form).map(([key, value]) => new Column(value.label, key))
  )
  emitter.emit('refresh')
  mapper.value = new Mapper(stable.form)
  emitter.emit('update:mapper', mapper.value)
})

async function onSubmit() {
  try {
    switch (login.mode) {
      case 'register':
        await api.shareTable.user.register(login.form)
        login.regSucceed = true
        break
      case 'login':
        await store.login(login.form)
        await onLogined()
        break
    }
  } catch (e) {
    console.error(e)
  }
}
function validRepPwdIsSame() {
  if (!login.form.repeatPwd) {
    return Promise.reject(new Error('请再次输入新密码'))
  } else if (login.form.password !== login.form.repeatPwd) {
    return Promise.reject(new Error('两次输入新密码不一致!'))
  } else {
    return Promise.resolve()
  }
}
async function onDirectLogin() {
  await store.login(pickOrIgnore(login.form, ['lgnIden', 'password'], false))
  login.regSucceed = false
  await onLogined()
}
function onBackToReg() {
  login.regSucceed = false
  login.mode = 'register'
  login.form.reset()
}
function onFieldUpdate(vals: any) {
  Object.entries(vals).map(([key, val]) => setProp(login.form.extra, key, val))
}
async function onLogined() {
  login.form.reset()
  count.value = await api.shareTable.data.count(lgnUsr.value?.key)
}
</script>

<template>
  <div v-if="stable.usrAuth && !store.isLogined()" class="relative w-full h-full">
    <a-form
      class="w-full absolute top-1/3 left-1/2"
      style="transform: translateX(-50%) translateY(-50%)"
      :model="login.form"
      :label-col="{ span: 10 }"
      :wrapper-col="{ span: 4 }"
      autocomplete="off"
      @finish="onSubmit"
    >
      <a-form-item :wrapper-col="{ offset: 10 }">
        <a-typography-title class="mb-0" :level="3">共享表格</a-typography-title>
      </a-form-item>

      <a-form-item v-if="stable.usrReg" :wrapper-col="{ offset: 10 }">
        <a-radio-group v-model:value="login.mode" button-style="solid">
          <a-radio-button value="login">登录</a-radio-button>
          <a-radio-button value="register">注册</a-radio-button>
        </a-radio-group>
      </a-form-item>

      <a-form-item
        label="登录标识"
        name="lgnIden"
        :rules="[{ required: true, message: '必须输入登录标识！' }]"
      >
        <a-input placeholder="输入登录标识" v-model:value="login.form.lgnIden" />
      </a-form-item>

      <a-form-item
        label="密码"
        name="password"
        :rules="[{ required: true, message: '必须输入密码！' }]"
      >
        <a-input-password placeholder="输入密码" v-model:value="login.form.password" />
      </a-form-item>

      <a-form-item
        v-if="login.mode === 'register'"
        label="重复密码"
        name="repeatPassword"
        :rules="[{ required: true, trigger: 'change', validator: validRepPwdIsSame }]"
      >
        <a-input-password placeholder="重复密码" v-model:value="login.form.repeatPwd" />
      </a-form-item>

      <FormGroup
        v-if="login.mode === 'register'"
        :mapper="new Mapper(stable.usrExtra)"
        :form="login.form.extra"
        :fld-wid="4"
        :lbl-wid="10"
        @update:fprop="onFieldUpdate"
      />

      <a-form-item :wrapper-col="{ offset: 10, span: 4 }">
        <a-button type="primary" html-type="submit">
          {{ login.mode === 'register' ? '注册' : '登录' }}
        </a-button>
      </a-form-item>
    </a-form>
    <a-modal
      v-model:open="login.regSucceed"
      :maskClosable="false"
      :keyboard="false"
      :closable="false"
      :footer="null"
      width="100%"
      wrap-class-name="full-modal"
    >
      <a-result
        status="success"
        title="用户注册成功！"
        :sub-title="`登录标识: ${login.form.lgnIden}，点击按钮直接登录或回到注册页。`"
      >
        <template #extra>
          <a-button type="primary" @click="onDirectLogin">直接登录</a-button>
          <a-button @click="onBackToReg">回到注册页</a-button>
        </template>
      </a-result>
    </a-modal>
  </div>
  <EditableTable
    v-else
    :edit-mode="stable.edtMod"
    :emitter="emitter"
    :api="api.shareTable.data"
    :mapper="mapper"
    :columns="columns"
    :addable="usrAddable"
    :editable="lgnUsr?.auth.updatable"
    :delable="lgnUsr?.auth.deletable"
    :new-fun="() => newObjByMapper(mapper)"
    @refresh="onLogined"
  >
    <template #title>
      <a-button type="text" @click="() => router.back()">
        <template #icon><LeftOutlined /></template>
        数据管理
      </a-button>
    </template>
    <template #description>
      {{ stable.name }}
    </template>
    <template #extra>
      <a-button type="text">
        <template #icon><UserOutlined /></template>
        {{ lgnUsr?.lgnIden }}
      </a-button>
      <a-tooltip>
        <template #title>登出</template>
        <a-button type="text" @click="() => store.logout()">
          <template #icon><LogoutOutlined /></template>
        </a-button>
      </a-tooltip>
    </template>
    <template #operaBefore="{ record }">
      {{ record.fkUser }}
    </template>
  </EditableTable>
</template>

<style lang="less">
.full-modal {
  .ant-modal {
    max-width: 100%;
    top: 0;
    padding-bottom: 0;
    margin: 0;
  }
  .ant-modal-content {
    display: flex;
    flex-direction: column;
    height: calc(100vh);
    border-radius: 0 !important;
  }
  .ant-modal-body {
    flex: 1;
  }
}
</style>
