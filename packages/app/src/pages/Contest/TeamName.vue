<template>
  <template v-if="isDef(author.teamName)">
    <div>{{ author.teamName }}</div>
    <div class="space-left">
      <user-link
        v-for="user in author.members"
        :key="user"
        :name="user"
      ></user-link>
    </div>
  </template>
  <span v-else>{{ author.members[0] }}</span>
</template>

<script setup lang="ts">
import type { IAuthor } from '@cpany/types';
import { isDef } from '@/utils';
import UserLink from '@/components/user-link.vue';

defineProps<{ author: IAuthor }>();
</script>

<style>
.space-left > a {
  @apply ml-2;
}
.space-left > a:first-child {
  @apply ml-0;
}
</style>
