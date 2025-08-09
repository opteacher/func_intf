<script setup lang="ts">
import { reactive, type PropType } from 'vue'
import { type NumOrAll } from '../types/stAuth'
import { cloneDeep } from 'lodash'
import { DownOutlined } from '@ant-design/icons-vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const props = defineProps({
  numPairList: { type: Array as unknown as PropType<Array<[NumOrAll, NumOrAll]>>, required: true },
  placeholder: {
    type: Array as unknown as PropType<[string, string]>,
    default: () => ['开始行', '结束行']
  },
  splitLetter: { type: String, default: '~' },
  disabled: { type: Boolean, default: false }
})
const emit = defineEmits(['update:numPairList'])
const formState = reactive(['', ''])

function onAddClick() {
  emit('update:numPairList', [...props.numPairList, cloneDeep(formState)])
}
function onDelClick(index: number) {
  emit('update:numPairList', [
    ...props.numPairList.slice(0, index),
    ...props.numPairList.slice(index + 1)
  ])
}
function onAllSelClick() {
  emit('update:numPairList', [['*', '*']])
}
function onCtrlNumOnly(i: number) {
  formState[i] = formState[i].replace(/(\D+|^\*)/g, '')
}
function onDropDownClick({ key }: { key: 'all' | 'pick' }) {
  switch (key) {
    case 'all':
      onAllSelClick()
      break
    case 'pick':
      router.push({
        path: '/func_intf/share_table/data',
        query: { pickMode: 1, tid: route.query.tid }
      })
      break
  }
}
</script>

<template>
  <a-input-group class="flex" compact>
    <a-input
      class="flex-1 border-e-0 focus:shadow-none"
      :disabled="disabled"
      :placeholder="placeholder[0]"
      v-model:value="formState[0]"
      @change="() => onCtrlNumOnly(0)"
    />
    <a-input
      class="w-5 p-0 border-x-0"
      :class="{ 'bg-white': !disabled }"
      disabled
      :placeholder="splitLetter"
    />
    <a-input
      class="flex-1 border-s-0 focus:shadow-none"
      type="number"
      :disabled="disabled"
      :placeholder="placeholder[1]"
      v-model:value="formState[1]"
      @change="() => onCtrlNumOnly(1)"
    />
    <a-dropdown-button class="num-pair-add-btn" :disabled="disabled" @click="onAddClick">
      添加
      <template #overlay>
        <a-menu @click="onDropDownClick">
          <a-menu-item key="all">全选</a-menu-item>
          <a-menu-item key="pick">选择</a-menu-item>
        </a-menu>
      </template>
      <template #icon><DownOutlined /></template>
    </a-dropdown-button>
  </a-input-group>
  <a-list v-if="numPairList.length && !disabled" size="small" :data-source="numPairList">
    <template #renderItem="{ item, index }">
      <a-list-item>
        <template #actions>
          <a-button danger type="link" @click="() => onDelClick(index)">删除</a-button>
        </template>
        {{ item[0] }} {{ splitLetter }} {{ item[1] }}
      </a-list-item>
    </template>
  </a-list>
</template>

<style>
.num-pair-add-btn button:first-child {
  border-start-start-radius: 0px !important;
  border-end-start-radius: 0px !important;
}
</style>
