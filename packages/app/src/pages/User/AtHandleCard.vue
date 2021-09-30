<template>
  <p>
    <span class="font-600">AtCoder: </span>
    <a :href="atcoder.handleUrl" target="_blank">{{
      atcoder.handle
    }}</a>
  </p>
</template>

<script setup lang="ts">
import type { IHandleWithAtCoder } from '@cpany/types/atcoder';

// import { Verdict } from '@cpany/types';

defineProps<{ atcoder: IHandleWithAtCoder }>();
</script>
