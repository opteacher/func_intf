<script lang="ts" setup>
import api from '@/api'
import { notification } from 'ant-design-vue'
import { reactive, ref } from 'vue'
import { obj2opns } from '../utils'
import OutPanel from '@/components/OutPanel.vue'

const encTypes = {
  base64: 'Base64',
  url: 'URL',
  asc2: 'ASC2',
  hex: 'HEX'
}
const encType = ref(null)
const ascMods = {
  C: '字符',
  2: '二进制',
  8: '八进制',
  10: '十进制',
  16: '十六进制'
}
const ascStats = reactive({
  srcHex: null,
  disHex: null
})
const with0x = ref(true)
const input = ref('')
const output = ref('')

async function onDoClick() {
  if (!encType.value) {
    notification.error({
      message: '提交参数错误！',
      description: '必须选择编码类型'
    })
    return
  }
  let extra = undefined
  switch (encType.value) {
    case 'hex':
      if (with0x.value) {
        extra = { w0x: 1 }
      }
      break
    case 'asc2':
      if (!ascStats.disHex || !ascStats.srcHex) {
        notification.error({
          message: '提交参数错误！',
          description: 'ASC2模式必须选择源码和终码类型'
        })
        return
      }
      extra = ascStats
      break
  }
  output.value = (await api.toolBox.encode(input.value, encType.value, extra)).toString()
}
function reset() {
  ascStats.srcHex = null
  ascStats.disHex = null
  input.value = ''
  output.value = ''
}
</script>

<template>
  <div class="h-full flex flex-col space-y-2.5">
    <a-space>
      <a-select
        class="w-32"
        v-model:value="encType"
        placeholder="选择编码方式"
        :options="obj2opns(encTypes)"
        @change="reset"
      />
      <template v-if="encType === 'asc2'">
        <div class="border border-gray-300 border-solid rounded-sm">
          <a-select
            class="w-32"
            :bordered="false"
            :options="obj2opns(ascMods)"
            placeholder="选择源模式"
            v-model:value="ascStats.srcHex"
          />
          <a-input class="w-5 px-0 text-center" :bordered="false" disabled placeholder=">" />
          <a-select
            class="w-32"
            :bordered="false"
            :options="obj2opns(ascMods)"
            placeholder="选择目标模式"
            v-model:value="ascStats.disHex"
          />
        </div>
      </template>
      <template v-else-if="encType === 'hex'">
        <a-switch v-model:checked="with0x" />
        <span>带0x前缀</span>
      </template>
      <a-button html-type="submit" type="primary" @click="onDoClick">执行</a-button>
    </a-space>
    <a-textarea
      class="flex-1"
      placeholder="输入源码"
      :maxlength="encType === 'asc2' ? (ascStats.srcHex === 'C' ? 1 : undefined) : undefined"
      v-model:value="input"
    />
    <OutPanel class="flex-1" :content="output" placeholder="生成终码" />
  </div>
</template>
