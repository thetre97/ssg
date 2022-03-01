<template>
  <div
    v-once
    class="post"
  >
    <!-- <lazy-image
      class="cover-image"
      :src="post.coverImage"
    /> -->
    <h1>{{ post.title }}</h1>
    <div v-html="post.content" />
  </div>
</template>

<script lang="ts" setup>
interface Props {
  post: { id: string, title: string, content: string, coverImage: string }
}
defineProps<Props>()
</script>

<script lang="ts">
export { onBeforeRender } from './onBeforeRender'
</script>

<style lang="scss">
.post {
  .cover-image {
    width: auto;
    height: 320px;
  }
}
</style>
