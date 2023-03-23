<script setup lang="ts">
import { ref, computed } from 'vue'
import Policy from './Policy.vue'
import Role from './Role.vue'
import User from './User.vue'
import Secret from './Secret.vue'
import { LeftOutlined, RightOutlined, SendOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

const curStep = ref<number>(-1)
const compos = [Policy, Role, User, Secret, Secret]
const curCompo = computed(() => (curStep.value >= 0 ? compos[curStep.value] : null))
const isLogined = computed(() => window.localStorage.getItem('token'))

function onPgsItmSelect(index: number) {
  curStep.value = index
}
function onStpBtnClick(next: boolean) {
  if (next && curStep.value === 3 && !window.localStorage.getItem('token')) {
    message.warn('管理密钥前请先登录！')
    return
  }
  next ? curStep.value++ : curStep.value--
}
</script>

<template>
  <a-row class="h-full p-5">
    <a-col :span="8">
      <a-timeline>
        <a-timeline-item>
          <a
            :class="{ 'text-gray-400': curStep > 0, 'font-bold': curStep === 0 }"
            @click="onPgsItmSelect(0)"
          >
            创建一条策略
          </a>
        </a-timeline-item>
        <a-timeline-item>
          <a
            :class="{ 'text-gray-400': curStep > 1, 'font-bold': curStep === 1 }"
            @click="onPgsItmSelect(1)"
          >
            创建一个角色并拥有这条策略
          </a>
        </a-timeline-item>
        <a-timeline-item>
          <a
            :class="{ 'text-gray-400': curStep > 2, 'font-bold': curStep === 2 }"
            @click="onPgsItmSelect(2)"
          >
            以该角色为模板，创建一名用户
          </a>
        </a-timeline-item>
        <a-timeline-item>
          <a
            :class="{ 'text-gray-400': curStep > 3, 'font-bold': curStep === 3 }"
            @click="onPgsItmSelect(3)"
          >
            以该用户登录
          </a>
        </a-timeline-item>
        <a-timeline-item>
          <a
            :class="{ 'text-gray-400': curStep > 4, 'font-bold': curStep === 4 }"
            :disabled="!isLogined"
            @click="isLogined ? onPgsItmSelect(4) : message.warn('管理密钥前请先登录！')"
          >
            管理旗下所有密钥
          </a>
        </a-timeline-item>
      </a-timeline>
    </a-col>
    <a-col :span="16" class="flex flex-col space-y-2">
      <div class="flex-1">
        <keep-alive v-if="curStep >= 0">
          <component :is="curCompo" />
        </keep-alive>
      </div>
      <div class="flex justify-between">
        <a-button v-if="curStep >= 0" @click="onStpBtnClick(false)">
          <template #icon><left-outlined /></template>
          上一步
        </a-button>
        <div v-else />
        <a-button v-if="curStep >= 0" type="primary" @click="onStpBtnClick(true)">
          <template #icon><right-outlined /></template>
          下一步
        </a-button>
        <a-button v-else type="primary" @click="onStpBtnClick(true)">
          <template #icon><send-outlined /></template>
          开始
        </a-button>
      </div>
    </a-col>
  </a-row>
</template>
