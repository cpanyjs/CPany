<template>
  <template v-if="codeforces">
    <cf-handle-card :handle="codeforces"></cf-handle-card>
  </template>
  <template v-else-if="hdu">
    <p>
      <span class="font-600">HDu: </span>
      <a :href="handle.handleUrl" target="_blank">{{ handle.handle }}</a>
    </p>
    <p>
      <span class="font-600">Rank: </span>
      <span>{{ hdu.hdu.rank }}</span>
    </p>
    <p>
      <span class="font-600">提交: </span>
      <span>{{ hdu.submissions.length }}</span>
    </p>
    <p>
      <span class="font-600">通过: </span>
      <span>{{ hdu.submissions.filter(({ verdict }) => verdict === Verdict.OK).length }}</span>
    </p>
  </template>
  <template v-else-if="luogu">
    <LgHandleCardVue :luogu="luogu"></LgHandleCardVue>
  </template>
  <template v-else-if="atcoder">
    <AtHandleCardVue :atcoder="atcoder"></AtHandleCardVue>
  </template>
  <template v-else-if="nowcoder">
    <NcHandleCard :nowcoder="nowcoder"></NcHandleCard>
  </template>
  <template v-else>
    <p>
      <span class="font-600">{{ handle.type.split('/')[0] }}: </span>
      <a :href="handle.handleUrl" target="_blank">{{ handle.handle }}</a>
    </p>
  </template>
</template>

<script setup lang="ts">
import type { IHandle } from '@cpany/types';
import type { IHandleWithCodeforces } from '@cpany/types/codeforces';
import type { IHandleWithHdu } from '@cpany/types/hdu';
import type { IHandleWithLuogu } from '@cpany/types/luogu';
import type { IHandleWithAtCoder } from '@cpany/types/atcoder';
import type { IHandleWithNowcoder } from '@cpany/types/nowcoder';
import { Verdict } from '@cpany/types';

import { toRefs, computed } from 'vue';
import CfHandleCard from './CfHandleCard.vue';
import LgHandleCardVue from './LgHandleCard.vue';
import AtHandleCardVue from './AtHandleCard.vue';
import NcHandleCard from './NcHandleCard.vue';

const props = defineProps<{ handle: IHandle }>();
const { handle } = toRefs(props);

const codeforces = computed(() => {
  if (handle.value.type.startsWith('codeforces')) {
    return handle.value as IHandleWithCodeforces;
  } else {
    return null;
  }
});

const hdu = computed(() => {
  if (handle.value.type.startsWith('hdu')) {
    return handle.value as IHandleWithHdu;
  } else {
    return null;
  }
});

const luogu = computed(() => {
  if (handle.value.type.startsWith('luogu')) {
    return handle.value as IHandleWithLuogu;
  } else {
    return null;
  }
});

const atcoder = computed(() => {
  if (handle.value.type.startsWith('atcoder')) {
    return handle.value as IHandleWithAtCoder;
  } else {
    return null;
  }
});

const nowcoder = computed(() => {
  if (handle.value.type.startsWith('nowcoder')) {
    return handle.value as IHandleWithNowcoder;
  } else {
    return null;
  }
});
</script>
