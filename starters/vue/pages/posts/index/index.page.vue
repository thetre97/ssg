<template>
  <div>
    <h1
      class="text-cyan-200"
    >
      Latest Posts
    </h1>
    <ol
      v-if="posts"
    >
      <li
        v-for="item in posts"
        :key="item.id"
      >
        <a :href="item.path">{{ item.title }}</a> ({{ item.path }})
      </li>
    </ol>
  </div>
</template>

<script lang="ts" setup>
interface Props {
  posts: { id: string, title: string, path: string }[]
}
defineProps<Props>()
</script>
