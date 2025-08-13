<script lang="ts" setup>
import {
  ToolOutlined,
  AudioOutlined,
  KeyOutlined,
  TableOutlined,
  PictureOutlined,
  FormOutlined,
  FilePdfOutlined
} from '@ant-design/icons-vue'
import router from './router'
import { type SelectInfo } from 'ant-design-vue/lib/menu/src/interface'
import { reactive } from 'vue'
import { useRoute } from 'vue-router'
import zhCN from 'ant-design-vue/es/locale/zh_CN'

const route = useRoute()
const sideKeys = reactive<string[]>([])
const openKeys = reactive<string[]>([])

router.beforeEach(to => {
  const paths = to.path.split('/').filter(sec => sec)
  sideKeys.splice(0, sideKeys.length, ...paths)
  if (paths.length) {
    openKeys.splice(0, openKeys.length, ...paths.slice(0, -1))
  }
})

function onMuItmSelect(params: SelectInfo) {
  router.push('/func_intf/' + (params.keyPath || []).join('/'))
}
</script>

<template>
  <a-config-provider :locale="zhCN">
    <div v-if="route.query.fullView" class="bg-white h-full p-2.5"><router-view /></div>
    <a-layout v-else class="h-full">
      <a-layout-header class="pl-0">
        <div class="h-full p-2.5 bg-white" style="width: 200px">
          <div class="h-full bg-gray-300 rounded-sm" />
        </div>
      </a-layout-header>
      <a-layout class="h-full">
        <a-layout-sider width="200">
          <a-menu
            :selectedKeys="sideKeys"
            :openKeys="openKeys"
            mode="inline"
            class="h-full border-r-0"
            theme="dark"
            @select="onMuItmSelect"
          >
            <a-menu-item key="audio_words">
              <template #icon><audio-outlined /></template>
              <span>语音转文本</span>
            </a-menu-item>
            <a-menu-item key="magic_pdf">
              <template #icon><file-pdf-outlined /></template>
              <span>PDF转文本</span>
            </a-menu-item>
            <a-sub-menu key="tool_box">
              <template #icon><ToolOutlined /></template>
              <template #title>网络工具包</template>
              <a-menu-item key="encode">编码类</a-menu-item>
              <a-menu-item key="crypto">加解密</a-menu-item>
              <a-menu-item key="random">随机</a-menu-item>
            </a-sub-menu>
            <a-sub-menu key="secret">
              <template #icon><key-outlined /></template>
              <template #title>密钥管理</template>
              <a-menu-item key="guide">向导</a-menu-item>
              <a-menu-item key="policy">策略</a-menu-item>
              <a-menu-item key="role">角色</a-menu-item>
              <a-menu-item key="user">用户</a-menu-item>
              <a-menu-item key="manage">密钥</a-menu-item>
            </a-sub-menu>
            <a-sub-menu key="image_optimize">
              <template #icon><PictureOutlined /></template>
              <template #title>图像处理</template>
              <a-menu-item key="denoise">图像去噪</a-menu-item>
              <a-menu-item key="faceRes">人脸修复</a-menu-item>
            </a-sub-menu>
            <a-sub-menu key="custom_form">
              <template #icon><FormOutlined /></template>
              <template #title>自定义表单</template>
              <a-menu-item key="design">设计表单</a-menu-item>
              <a-menu-item key="view" disabled>展示表单</a-menu-item>
              <a-menu-item key="table" disabled>自定义表</a-menu-item>
            </a-sub-menu>
            <a-sub-menu key="share_table">
              <template #icon><TableOutlined /></template>
              <template #title>共享表格</template>
              <a-menu-item key="table">所有表格</a-menu-item>
              <a-menu-item key="data">数据表</a-menu-item>
              <a-menu-item key="user">用户表</a-menu-item>
              <a-menu-item key="n1">一页表</a-menu-item>
            </a-sub-menu>
          </a-menu>
        </a-layout-sider>
        <a-layout>
          <a-layout-content class="bg-white p-5 m-0 h-full">
            <router-view />
          </a-layout-content>
        </a-layout>
      </a-layout>
    </a-layout>
  </a-config-provider>
</template>
