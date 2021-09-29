<template>
  <div>
    <h3 class="my-4 px-2 flex items-center justify-between">
      <div class="text-transparent"><icon-down></icon-down></div>
      <div>
        <slot name="title">{{ title }}</slot>
      </div>
      <div
        @click="flip"
        class="p-1 flex items-center rounded-full cursor-pointer hover:bg-light-700"
      >
        <icon-down v-if="!state" class="text-2xl inline-block"></icon-down>
        <icon-up v-else class="text-2xl inline-block"></icon-up>
      </div>
    </h3>
    <slot v-if="state"></slot>
  </div>
</template>

<script setup lang="ts">
import type { Ref } from 'vue';
import { ref, toRefs, unref } from 'vue';
import IconUp from '~icons/mdi/chevron-up';
import IconDown from '~icons/mdi/chevron-down';

const props = defineProps<{ title?: string; hide?: boolean }>();
const { title, hide } = toRefs(props);

const { state, flip } = useHover(hide);

function useHover(flag: Ref<boolean | undefined> | boolean = false) {
  const init = unref(flag) ?? false;
  const state = ref(!init);
  const open = () => (state.value = true);
  const close = () => (state.value = false);
  const flip = () => (state.value = !state.value);
  return { state, open, close, flip };
}
</script>
