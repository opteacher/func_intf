<script setup lang="ts"></script>

<template>
  <a-row class="h-full p-5">
    <a-col :span="8">
      <a-timeline>
        <a-timeline-item>创建一条策略</a-timeline-item>
        <a-timeline-item>创建一个角色并拥有这条策略</a-timeline-item>
        <a-timeline-item>以该角色为模板，创建一名用户</a-timeline-item>
        <a-timeline-item>以该用户登录</a-timeline-item>
        <a-timeline-item>管理旗下所有密钥</a-timeline-item>
      </a-timeline>
    </a-col>
    <a-col :span="16"></a-col>
  </a-row>
</template>
