<template>
  <template v-if="isDef(author.teamName)">
    <user-link :name="author.teamName"></user-link>
    <span class="space-left">
      <cf-rating-color
        v-for="(handle, index) in author.members"
        class="ml-2"
        :key="handle"
        :rating="findHandleRating(handle)"
        >{{ handle }}</cf-rating-color
      >
    </span>
  </template>
  <span v-else>{{ author.members[0] }}</span>
</template>

<script setup lang="ts">
import type { IAuthor } from '@cpany/types';
import { isDef } from '@/utils';
import UserLink from '@/components/user-link.vue';
import { CfRatingColor } from '@/components/codeforces';
import { findHandleRating } from '@/cfHandles';

defineProps<{ author: IAuthor }>();
</script>
