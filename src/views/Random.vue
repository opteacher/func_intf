<script lang="ts" setup>
import OutPanel from '@/components/OutPanel.vue'
import { obj2opns } from '@/utils'
import { reactive, ref } from 'vue'
import api from '@/api'

const randTyps = {
  number: '数字',
  uuid: 'ID'
}
const output = ref('')
const randType = ref<'number' | 'uuid' | 'hex' | 'name'>('number')
const numRng = reactive<[number, number]>([0, 10])

async function onDoClick() {
  let extra = undefined
  switch (randType.value) {
    case 'number':
      extra = { min: numRng[0], max: numRng[1] }
      break
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
            v-model:value="numRng[0]"
            placeholder="输入随机下限"
          />
          <a-input class="bg-white w-10 border-x-0 text-center" placeholder="~" disabled />
          <a-input
            class="flex-1 border-l-0 text-center"
            type="number"
            v-model:value="numRng[1]"
            placeholder="M输入随机上限"
          />
        </div>
      </template>
      <a-button html-type="submit" type="primary" @click="onDoClick">执行</a-button>
    </a-space>
    <OutPanel class="flex-1" :content="output" placeholder="生成随机值" />
  </div>
</template>
