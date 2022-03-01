<template>
  <h1>Latest Posts</h1>
  <ol v-if="errors?.length">
    <li
      v-for="(error, e) in errors"
      :key="e"
    >
      {{ error.message }}
    </li>
  </ol>
  <ol
    v-if="data?.allPosts"
    v-once
  >
    <li
      v-for="item in data.allPosts"
      :key="item.id"
    >
      <a :href="'/post/' + item.slug">{{ item.title }}</a> ({{ item.slug }})
    </li>
  </ol>
</template>

<script lang="ts" setup>
import { getCurrentInstance } from 'vue'

function usePageData () {
  const instance = getCurrentInstance()
  return instance?.type.pageData
}

const { data, errors } = usePageData()
</script>

<page-query>
query Posts {
  allPosts {
    id
    title
    slug
  }
}
</page-query>
