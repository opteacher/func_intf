<script setup lang="ts">
import { CopyOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { ref, defineProps } from 'vue'
import AButton from 'ant-design-vue/lib/button'

const props = defineProps({
  secretId: { type: String, required: true }
})

const copied = ref(false)

function onCopy() {
  navigator.clipboard.writeText(props.secretId)
  copied.value = true
  message.success('复制成功！')
  setTimeout(() => {
    copied.value = false
  }, 5000)
}
</script>

<template>
  <div class="flex space-x-3">
    <h2>{{ secretId }}</h2>
    <a-button :type="copied ? 'primary' : 'default'" @click="onCopy">
      <template #icon>
        <copy-outlined class="text-gray-400" :class="{ 'text-white': copied }" />
      </template>
    </a-button>
  </div>
  <p class="mb-0 text-red-400 font-bold text-lg">
    请谨慎保管该登录密钥ID，这是用户唯一操作密钥的凭证，系统也不会为您保存（安全考虑），所以请勿丢失！
  </p>
</template>
