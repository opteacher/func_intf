<script setup lang="ts">
import FormGroup from '@lib/components/FormGroup.vue'
import Mapper from '@lib/types/mapper'
import Joiner from '@/types/joiner'
import { reactive } from 'vue'
import axios from 'axios'
import departments from '../data/departments.json'
import { message, notification } from 'ant-design-vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const mapper = new Mapper({
  department: {
    label: '单位',
    type: 'Select',
    options: departments.data.map((dpt: string) => ({ label: dpt, value: dpt }))
  },
  name: {
    label: '姓名',
    type: 'Input'
  },
  post: {
    label: '职务',
    type: 'Input'
  },
  phone: {
    label: '联系电话',
    type: 'Input'
  },
  topic: {
    label: '会议主题',
    type: 'Input',
    display: false
  }
})
const formState = reactive(new Joiner())
const rules = reactive({})

async function onSubmit() {
  if (route.query.meetTopic) {
    formState.topic = route.query.meetTopic as string
  }
  console.log(formState)
  const resp = await axios.post('/meet_joiner/mdl/v1/joiner', formState)
  if (resp.status !== 200) {
    notification.error({
      message: '添加参会人员失败！',
      description: resp.statusText
    })
  } else {
    message.success('添加参会人员成功！')
    formState.reset()
  }
}
</script>

<template>
  <div class="w-1/2">
    <FormGroup :mapper="mapper" :copy="Joiner.copy" :form="formState" :rules="rules" />
    <a-row>
      <a-col :offset="4">
        <a-button type="primary" size="large" @click="onSubmit">提交</a-button>
      </a-col>
    </a-row>
  </div>
</template>
