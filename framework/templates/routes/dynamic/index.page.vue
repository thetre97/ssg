<template>
  <h1>{{ item.id }}</h1>
</template>

<script lang="ts" setup>
interface Props {
  item: {
    id: string
  }
}

defineProps<Props>()
</script>
