<script setup lang="ts">
import FormGroup from '@lib/components/FormGroup.vue'
import Mapper, { ButtonMapper } from '@lib/types/mapper'
import Rcrd from '@/types/record'
import { onMounted, reactive, ref } from 'vue'
import axios from 'axios'
import { message, notification } from 'ant-design-vue'
import { useRoute } from 'vue-router'
import { fieldDftVal } from '@lib/types/field'
import { gnlCpy, pickOrIgnore, setProp } from '@lib/utils'

const form = ref()
const route = useRoute()
const mapper = ref(new Mapper())
const formState = reactive(new Rcrd())
const rules = reactive({})

onMounted(async () => {
  if (!route.params.fid) {
    notification.error({
      message: '网络异常！',
      description: '请指定表单的记录ID，并作为参数fid接到URL中'
    })
    return
  }
  const resp = await axios.get(`/custom_form/mdl/v1/form/${route.params.fid}`)
  if (resp.status !== 200) {
    notification.error({
      message: '网络异常！',
      description: resp.statusText
    })
    return
  }
  mapper.value = new Mapper(resp.data.data.schema)
  mapper.value['submit'] = gnlCpy(ButtonMapper, {
    type: 'Button',
    label: '',
    inner: '提交',
    htmlType: 'submit',
    offset: 4,
    ghost: false,
    onClick: onSubmit
  })
  formState.data = Object.assign(genEmptyForm(), pickOrIgnore(route.query, ['fullView']))
})

async function onSubmit(data: any) {
  try {
    await form.value.refer.validate()
    if (route.query) {
      data = Object.assign(data, pickOrIgnore(route.query, ['fullView']))
    }
    data = pickOrIgnore(data, ['submit'])
    const resp = await axios.post('/custom_form/mdl/v1/record', { data })
    if (resp.status !== 200) {
      notification.error({
        message: '添加记录失败！',
        description: resp.statusText
      })
    } else {
      message.success('添加记录成功！')
      form.value.refer.resetFields()
    }
  } catch (e) {
    console.log(e)
    return
  }
}
function genEmptyForm() {
  return Object.fromEntries(
    Object.entries(mapper.value).map(([key, val]) => [key, fieldDftVal(val.type as any)])
  )
}
function onFpropUpdate(values: Record<string, any>) {
  Object.entries(values).map(([k, v]) => setProp(formState.data, k, v))
}
</script>

<template>
  <div class="w-1/2">
    <FormGroup
      ref="form"
      :mapper="mapper"
      :form="formState.data"
      :rules="rules"
      @update:fprop="onFpropUpdate"
    />
  </div>
</template>
