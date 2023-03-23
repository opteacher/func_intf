<script setup lang="ts">
import { EyeInvisibleOutlined, EyeOutlined, CopyOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { ref } from 'vue'

const props = defineProps({
  kv: { type: Object, required: true },
  vwVals: { type: Set, required: true }
})

const copied = ref(false)

function onCopy() {
  navigator.clipboard.writeText(props.kv.svalue)
  copied.value = true
  message.success('复制成功！')
  setTimeout(() => {
    copied.value = false
  }, 5000)
}
</script>

<template>
  <a-space align="baseline">
    <template v-if="vwVals.has(kv.skey)">{{ kv.svalue }}</template>
    <template v-else>●●●●●●●●</template>
    <a-button
      type="link"
      size="small"
      @click.stop="() => (vwVals.has(kv.skey) ? vwVals.delete(kv.skey) : vwVals.add(kv.skey))"
    >
      <template #icon>
        <eye-outlined v-if="vwVals.has(kv.skey)" />
        <eye-invisible-outlined v-else />
      </template>
    </a-button>
    <a-button type="link" size="small" @click.stop="onCopy">
      <template #icon>
        <copy-outlined class="text-gray-500" :class="{ 'text-primary': copied }" />
      </template>
    </a-button>
  </a-space>
</template>
