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

<style>
.cf-handle {
  @apply text-black font-bold;
}
.cf-handle.international-grandmaster,
.cf-handle.grandmaster {
  color: #ff0000 !important;
}
.cf-handle.international-master,
.cf-handle.master {
  color: #ff8c00 !important;
}
.cf-handle.candidate-master {
  color: #aa00aa !important;
}
.cf-handle.expert {
  color: #0000ff !important;
}
.cf-handle.specialist {
  color: #03a89e !important;
}
.cf-handle.pupil {
  color: #008000 !important;
}
.cf-handle.newbie {
  color: gray !important;
}
</style>
