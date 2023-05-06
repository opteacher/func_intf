<script setup lang="ts">
import { isProd } from '../api'
import { defineProps } from 'vue'

const props = defineProps({
  port: {
    type: Number,
    required: true
  }
})
</script>

<template>
  <iframe
    class="w-full h-full"
    :src="`http://${isProd ? '38.152.2.152' : '192.168.1.11'}:${props.port}`"
  />
</template>
