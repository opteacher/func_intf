<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { objToOpns } from '../utils'

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
  desHex: null
})
</script>

<template>
  <a-form class="h-full p-2.5 flex flex-col space-y-2.5">
    <a-textarea
      class="flex-1"
      placeholder="输入源码"
      :maxlength="encType === 'asc2' ? (ascStats.srcHex === 'C' ? 1 : undefined) : undefined"
    ></a-textarea>
    <a-space>
      <a-select
        class="w-32"
        v-model:value="encType"
        placeholder="选择编码方式"
        :options="objToOpns(encTypes)"
      />
      <template v-if="encType === 'asc2'">
        <div class="border">
          <a-select
            class="w-32"
            :options="objToOpns(ascMods)"
            placeholder="选择源模式"
            v-model="ascStats.srcHex"
          />
          <a-input class="w-5 px-0 text-center" :bordered="false" disabled placeholder=">" />
          <a-select
            class="w-32"
            :options="objToOpns(ascMods)"
            placeholder="选择目标模式"
            v-model="ascStats.desHex"
          />
        </div>
      </template>
      <a-button type="submit">执行</a-button>
    </a-space>
    <a-textarea class="flex-1" placeholder="生成终码" disabled></a-textarea>
  </a-form>
</template>
