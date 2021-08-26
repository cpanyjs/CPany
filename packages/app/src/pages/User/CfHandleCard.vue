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
  <p>
    <span class="font-600">提交: </span>
    <span>{{ handle.submissions.length }}</span>
  </p>
  <p>
    <span class="font-600">通过: </span>
    <span>{{
      handle.submissions.filter(({ verdict }) => verdict === Verdict.OK).length
    }}</span>
  </p>
</template>

<script setup lang="ts">
import type { IHandleWithCodeforces } from '@cpany/types/codeforces';
import { Verdict } from '@cpany/types';

import { CfHandle, CfRatingColor } from '@/components/codeforces';

defineProps<{ handle: IHandleWithCodeforces }>();
</script>
