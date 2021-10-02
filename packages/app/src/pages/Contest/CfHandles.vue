<template>
  <template v-if="isDef(author.teamName) && author.members.length <= 1">
    <user-link :name="author.teamName"></user-link>
    <span class="space-left">
      <a
        v-for="(handle, index) in author.members"
        :key="index"
        class="ml-2"
        :href="`https://codeforces.com/profile/${handle}`"
        target="_blank"
      >
        <cf-rating-color :rating="findHandleRating(handle)">{{ handle }}</cf-rating-color>
      </a>
    </span>
  </template>
  <template v-else-if="isDef(author.teamName)">
    <div>
      <user-link :name="author.teamName"></user-link>
    </div>
    <div class="space-left">
      <a
        v-for="(handle, index) in author.members"
        :key="index"
        :class="index > 0 && 'ml-2'"
        :href="`https://codeforces.com/profile/${handle}`"
        target="_blank"
      >
        <cf-rating-color :rating="findHandleRating(handle)">{{ handle }}</cf-rating-color>
      </a>
    </div>
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
