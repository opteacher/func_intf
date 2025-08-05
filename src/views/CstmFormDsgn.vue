<script setup lang="ts">
import FormGroup from '@lib/components/FormGroup.vue'
import Mapper from '@lib/types/mapper'
import FmDsgn from '@/types/fmDsgn'
import { onMounted, reactive, ref } from 'vue'
import axios from 'axios'
import { message, notification } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { setProp } from '@lib/utils'

const form = ref()
const router = useRouter()
const mapper = reactive(
  new Mapper({
    cstmForm: {
      label: '选定表单',
      type: 'SelOrIpt',
      options: [],
      mode: 'select',
      onChange: onFormChange
    },
    edtMapper: {
      label: '表单蓝图',
      type: 'CodeEditor',
      lang: 'json'
    },
    sbtToRes: {
      label: '跳转结果',
      type: 'Switch',
      placeholder: '提交表单后是否跳转到结果表'
    },
    submit: {
      label: '',
      offset: 4,
      type: 'Button',
      inner: '保存',
      htmlType: 'submit',
      ghost: false,
      onClick: onFormSubmit
    }
  })
)
const formState = reactive(new FmDsgn())
const fullView = ref(false)

onMounted(refresh)

async function refresh() {
  const resp = await axios.get('/custom_form/mdl/v1/form/s')
  if (resp.status !== 200) {
    notification.error({
      message: '网络异常！',
      description: resp.statusText
    })
    return
  }
  const forms = resp.data.data as any[]
  mapper['cstmForm'].options.splice(
    0,
    mapper['cstmForm'].options.length,
    ...forms.map((itm: any) => ({ label: itm.using, value: itm._id }))
  )
}
async function onFormChange(_form: any, fmId: string) {
  if (mapper['cstmForm'].mode === 'input') {
    return
  }
  const resp = await axios.get(`/custom_form/mdl/v1/form/${fmId}`)
  if (resp.status !== 200) {
    notification.error({
      message: '网络异常！',
      description: resp.statusText
    })
    return
  }
  formState.edtMapper = JSON.stringify(resp.data.data.schema, null, 2)
}
async function onFormSubmit(fmDsgn: FmDsgn) {
  const req = { url: '', method: 'put' as 'put' | 'post' }
  switch (mapper['cstmForm'].mode) {
    case 'select':
      req.url = `/custom_form/mdl/v1/form/${fmDsgn.cstmForm}`
      req.method = 'put'
      break
    case 'input':
      req.url = '/custom_form/mdl/v1/form'
      req.method = 'post'
      break
  }
  const resp = await axios[req.method](req.url, {
    using: req.method === 'post' ? fmDsgn.cstmForm : undefined,
    schema: typeof fmDsgn.edtMapper === 'string' ? JSON.parse(fmDsgn.edtMapper) : fmDsgn.edtMapper
  })
  if (resp.status !== 200) {
    notification.error({
      message: '网络异常！',
      description: resp.statusText
    })
  } else {
    message.success('添加记录成功！')
    await refresh()
  }
}
function onToFormView() {
  if (!formState.cstmForm) {
    notification.error({
      message: '无目标表单！',
      description: '请先选择要阅览的表单'
    })
    return
  }
  router.push(
    `/func_intf/custom_form/view/${formState.cstmForm}?fullView=${fullView.value ? '1' : ''}`
  )
}
function onFpropUpdate(values: Record<string, any>) {
  Object.entries(values).map(([k, v]) => setProp(formState, k, v))
}
</script>

<template>
  <div class="w-1/2">
    <FormGroup
      ref="form"
      :mapper="mapper"
      :form="formState"
      :rules="{}"
      @update:fprop="onFpropUpdate"
    >
      <template #cstmFormSFX="{ formState }">
        <a-space>
          <a-button :disabled="formState.cstmForm === ''" @click="onToFormView">浏览表单</a-button>
          <a-form-item-rest>
            <a-checkbox v-model:checked="fullView">全屏</a-checkbox>
          </a-form-item-rest>
        </a-space>
      </template>
    </FormGroup>
  </div>
</template>
