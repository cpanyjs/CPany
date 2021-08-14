<template>
  <div v-if="loading" id="progress">
    <div></div>
    <div></div>
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue';
import type { Ref } from 'vue';

const loading = inject<Ref<boolean>>('loading');
</script>

<style>
#progress div {
  position: fixed;
  z-index: 1;
  top: 0;
  width: 20%;
  height: 3px;

  border-radius: 1px;
  background: linear-gradient(90deg, #3acbd4, #75ddcf);

  animation: loading-loop 1s;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}

#progress div:first-child {
  left: 0%;
}

#progress div:last-child {
  left: -20%;
  animation-delay: 0.8s;
}

@keyframes loading-loop {
  0% {
    transform: translateX(0%);
  }
  100% {
    transform: translateX(500%);
  }
}
</style>
