<template>
  <EditableTable
    :api="{
      all: () => []
    }"
    :columns="columns"
  />
</template>

<script setup lang="ts">
import EditableTable from '@lib/components/EditableTable.vue'
import { computed } from 'vue'

const columns = computed(() => [])
</script>
