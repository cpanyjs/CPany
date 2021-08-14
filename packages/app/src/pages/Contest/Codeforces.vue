<template>
  <div>
    <div v-if="contest">
      <Page :contest="contest" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IContest, RouteKey } from '@cpany/types';
import { useRoute } from 'vue-router';
import { ref, watch } from 'vue';

import Page from './Contest.vue';
import { findCodeforces } from '../../contests';

const route = useRoute();

const contest = ref<RouteKey<IContest> | null>(null);

watch(
  () => route.params,
  (newParams) => {
    if (newParams.id) {
      const cf = findCodeforces(+newParams.id);
      if (cf !== null) {
        contest.value = cf;
      }
    }
  },
  { immediate: true }
);
</script>
