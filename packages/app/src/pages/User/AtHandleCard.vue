<template>
  <p>
    <span class="font-600">AtCoder: </span>
    <a :href="atcoder.handleUrl" target="_blank" class="font-bold">
      <AtRatingColor :color="atcoder.atcoder.color" :rating="atcoder.atcoder.rating">{{
        atcoder.handle
      }}</AtRatingColor>
    </a>
  </p>
  <p v-if="!!atcoder.atcoder.rating">
    <span class="font-600">Rating: </span>
    <AtRatingColor class="font-bold" :rating="atcoder.atcoder.rating">{{
      atcoder.atcoder.rating
    }}</AtRatingColor>
  </p>
  <p v-if="!!atcoder.atcoder.maxRating">
    <span class="font-600">Max rating: </span>
    <AtRatingColor class="font-bold" :rating="atcoder.atcoder.maxRating">{{
      atcoder.atcoder.maxRating
    }}</AtRatingColor>
  </p>
  <p v-if="sub > 0">
    <span class="font-600">提交: </span>
    <span>{{ sub }}</span>
  </p>
  <p v-if="ok > 0">
    <span class="font-600">通过: </span>
    <span>{{ ok }}</span>
  </p>
</template>

<script setup lang="ts">
import type { IHandleWithAtCoder } from '@cpany/types/atcoder';
import { Verdict } from '@cpany/types';

import { AtRatingColor } from '@/components/atcoder';

const props = defineProps<{ atcoder: IHandleWithAtCoder }>();

const sub = props.atcoder.submissions.length;
const ok = props.atcoder.submissions.filter(({ verdict }) => verdict === Verdict.OK).length;
</script>
