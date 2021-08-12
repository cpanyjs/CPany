<template>
  <div v-if="loading" id="progress"><b></b><i></i></div>
</template>

<script setup lang="ts">
import { inject } from 'vue';
import type { Ref } from 'vue';

const loading = inject<Ref<boolean>>('loading');
</script>

<style>
#progress {
  position: fixed;
  z-index: 1;
  top: 0;
  left: -1%;
  height: 3px;

  border-radius: 1px;
  background-color: #3ab9d4;

  animation: loading-loop 1s;
  animation-iteration-count: infinite;
}

@keyframes loading-loop {
  0% {
    width: 0%;
  }
  100% {
    width: 101%;
  }
}

#progress b,
#progress i {
  position: absolute;
  top: 0;
  height: 3px;

  border-radius: 100%;
  box-shadow: #777777 1px 0 6px 1px;
}

#progress b {
  clip: rect(-6px, 22px, 14px, 10px);
  opacity: 0.6;
  width: 20px;
  right: 0;
}

#progress i {
  clip: rect(-6px, 90px, 14px, -6px);
  opacity: 0.6;
  width: 180px;
  right: -80px;
}
</style>
