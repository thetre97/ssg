<template>
  <div v-if="data?.post">
    <p>Posts template!</p>
    <br>
    <h1 v-if="data">{{ data.post.title }}</h1>
    <div v-if="data.post.featuredImage">
      <br>
      <VLazyImage :src="data.post.featuredImage" :alt="data.post.title ?? ''" />
      <br>
    </div>
    <div v-html="data.post.content"></div>
  </div>
</template>

<script lang="ts" setup>
import { inject } from 'vue'
import { usePageData } from 'wind-ssg/vue'
import { Post } from '../../generated/graphql'

import VLazyImage from "v-lazy-image"

const data: { post: Post } = usePageData()
</script>

<page-query>
query Post ($id: ID!) {
  post (id: $id) {
    id
    title
    slug
    date
    content
    featuredImage
  }
}
</page-query>

<style>
h1 {
  color: tomato;
}
img {
  height: 500px;
  width: auto;
}
</style>
