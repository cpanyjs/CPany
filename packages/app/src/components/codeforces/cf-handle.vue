<template>
  <span :class="['cf-handle', handle.codeforces.rank.replace(/ /g, '-')]">
    <slot>
      <a
        :href="`https://codeforces.com/profile/${handle.handle}`"
        target="_blank"
        :class="['cf-handle', handle.codeforces.rank.replace(/ /g, '-')]"
        >{{ handle.handle }}</a
      >
    </slot>
  </span>
</template>

<script setup lang="ts">
import type { IHandleWithCodeforces } from '@cpany/types/codeforces';

defineProps<{ handle: IHandleWithCodeforces }>();
</script>
