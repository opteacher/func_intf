<script lang="ts" setup>
import { obj2opns } from '@/utils'
import { reactive, ref } from 'vue'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import api from '@/api'
import { notification } from 'ant-design-vue'
import OutPanel from '@/components/OutPanel.vue'

const aymAlgs = {
  sha1: 'SHA.1',
  sha256: 'SHA.256',
  md5: 'MD5'
}
const symAlgs = {
  jwt: 'JWT',
  aes: 'AES',
  RSA: 'RSA'
}
const algs = Object.assign({}, aymAlgs, symAlgs)
const crypt = ref<'encrypt' | 'decrypt'>('encrypt')
const alg = ref(null)
const secret = ref('')
const salts = reactive<string[]>([])
const output = ref('')

async function onDoClick() {
  if (!alg.value) {
    notification.error({
      message: '提交参数错误！',
      description: '必须选择加解密算法'
    })
    return
  }
  output.value = await api.toolBox.crypto(crypt.value, alg.value, salts, secret.value || undefined)
}
</script>

<template>
  <div class="h-full flex flex-col">
    <a-space>
      <a-select
        class="w-28"
        placeholder="加解密"
        :options="[
          { label: '加密', value: 'encrypt' },
          { label: '解密', value: 'decrypt' }
        ]"
        v-model:value="crypt"
      />
      <a-select
        class="w-32"
        placeholder="选择算法"
        :options="obj2opns(crypt === 'decrypt' ? symAlgs : algs)"
        v-model:value="alg"
      />
      <a-input-password placeholder="输入密钥（可选）" v-model:value="secret" allowClear />
      <a-button html-type="submit" type="primary" @click="onDoClick">执行</a-button>
    </a-space>
    <a-card class="flex-1" :bordered="false" size="small">
      <template #title>
        <a-space>
          <span>加盐</span>
          <a-button
            class="text-gray-300 hover:text-primary"
            size="small"
            @click="() => salts.push('')"
          >
            <template #icon><plus-outlined /></template>
          </a-button>
        </a-space>
      </template>
      <a-row :gutter="8">
        <a-col :span="3" v-for="(salt, index) in salts" :key="index">
          <a-input
            class="w-full"
            :value="salt"
            placeholder="输入盐"
            @change="(e: any) => { salts[index] = e.target.value as string }"
          >
            <template #suffix>
              <delete-outlined
                class="cursor-pointer hover:text-error"
                @click="() => salts.splice(index, 1)"
              />
            </template>
          </a-input>
        </a-col>
      </a-row>
    </a-card>
    <OutPanel class="flex-1" :content="output" placeholder="加解密结果" />
  </div>
</template>
