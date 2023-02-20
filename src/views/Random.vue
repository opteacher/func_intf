<script lang="ts" setup>
import OutPanel from '@/components/OutPanel.vue'
import { obj2opns } from '@/utils'
import { reactive, ref } from 'vue'
import api from '@/api'

const randTyps = {
  number: '数字',
  uuid: 'ID',
  string: '串'
}
const output = ref('')
const randType = ref<'number' | 'uuid' | 'string' | 'name'>('number')
const numStats = reactive({
  range: [0, 10],
  rounding: false
})
const strLen = ref(null)

async function onDoClick() {
  let extra: any = undefined
  switch (randType.value) {
    case 'number':
      extra = { min: numStats.range[0], max: numStats.range[1] }
      if (numStats.rounding) {
        extra.rounding = 1
      }
      break
    case 'string':
      extra = { length: strLen.value }
  }
  output.value = (await api.toolBox.random(randType.value, extra)).toString()
}
</script>

<template>
  <div class="h-full flex flex-col space-y-2.5">
    <a-space>
      <a-select
        class="w-32"
        :options="obj2opns(randTyps)"
        placeholder="选择随机类型"
        v-model:value="randType"
      />
      <template v-if="randType === 'number'">
        <div class="flex">
          <a-input
            class="flex-1 border-r-0 text-center"
            type="number"
            v-model:value="numStats.range[0]"
            placeholder="输入随机下限"
          />
          <a-input class="bg-white w-10 border-x-0 text-center" placeholder="~" disabled />
          <a-input
            class="flex-1 border-l-0 text-center"
            type="number"
            v-model:value="numStats.range[1]"
            placeholder="M输入随机上限"
          />
        </div>
        <a-checkbox v-model:checked="numStats.rounding">取整</a-checkbox>
      </template>
      <template v-else-if="randType === 'string'">
        <a-input-number class="w-32" v-model:value="strLen" placeholder="输入串长度" />
      </template>
      <a-button html-type="submit" type="primary" @click="onDoClick">执行</a-button>
    </a-space>
    <OutPanel class="flex-1" :content="output" placeholder="生成随机值" />
  </div>
</template>
