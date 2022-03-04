<template>
  <div>
    <h1>Latest Posts</h1>
    <ol
      v-if="posts"
    >
      <li
        v-for="item in posts"
        :key="item.id"
      >
        <a :href="'/post/' + item.slug">{{ item.title }}</a> ({{ item.slug }})
      </li>
    </ol>
  </div>
</template>

<script lang="ts" setup>
interface Props {
  posts: { id: string, title: string, slug: string }[]
}
defineProps<Props>()
</script>
