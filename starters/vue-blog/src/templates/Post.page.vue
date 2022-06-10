<template>
  <div>
    <p>Posts template!</p>
    <br>
    <h1 v-if="data">{{ data.post.title }}</h1>
  </div>
</template>

<script lang="ts" setup>
import { inject } from 'vue'
import { usePageData } from 'wind-ssg/vue'
import {Post} from '../../generated/graphql'

const data: { post: Post } = usePageData()
</script>

<page-query>
query Post ($id: ID!) {
  post (id: $id) {
    id
    title
    slug
    date
  }
}
</page-query>

<style>
h1 {
  color: tomato;
}
</style>
