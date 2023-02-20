<script lang="ts" setup>
import { defineProps, ref } from 'vue'
import { CopyOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

const props = defineProps({
  content: {
    type: String,
    required: true
  },
  placeholder: {
    type: String,
    default: '输出结果'
  }
})

const copied = ref(false)

function onCopy() {
  navigator.clipboard.writeText(props.content)
  copied.value = true
  message.success('复制成功！')
  setTimeout(() => {
    copied.value = false
  }, 5000)
}
</script>

<template>
  <div class="w-full h-full relative">
    <a-button
      class="absolute top-3 right-3 z-10"
      :type="copied ? 'primary' : 'default'"
      @click="onCopy"
    >
      <template #icon>
        <copy-outlined class="text-gray-400" :class="{ 'text-white': copied }" />
      </template>
    </a-button>
    <a-textarea
      class="w-full h-full"
      :placeholder="placeholder"
      :readonly="true"
      :value="content"
    />
  </div>
</template>
