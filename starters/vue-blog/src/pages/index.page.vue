<template>
  <div>
    <h1>Welcome!</h1>
    <p>Posts:</p>
    <ul>
      <li v-for="post in data.allPosts" :key="post.id!">
        <a :href="post.path!">
          {{ post.title }} ({{ post.date }})
        </a>
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import { inject } from 'vue'
import { usePageData } from 'wind-ssg/vue'
import { Post } from '../../generated/graphql'

const data: { allPosts: Post[] } = usePageData()
</script>

<page-query>
query Posts {
  allPosts (limit: 1000) {
    id
    title
    path
    date
  }
}
</page-query>
