<template>
  <span class="font-600">Codeforces: </span>
  <cf-handle :handle="handle"></cf-handle>
  <p>
    <span class="font-600">Contest rating: </span>
    <cf-rating-color :rank="handle.codeforces.rank">{{
      handle.codeforces.rating
    }}</cf-rating-color>
  </p>
  <p>
    <span class="font-600">Max rating: </span>
    <cf-rating-color :rank="handle.codeforces.maxRank">{{
      handle.codeforces.maxRating
    }}</cf-rating-color>
  </p>
</template>

<script setup lang="ts">
import type { IHandleWithCodeforces } from '@cpany/types/codeforces';
import { CfHandle, CfRatingColor } from '@/components/codeforces';

defineProps<{ handle: IHandleWithCodeforces }>();
</script>
