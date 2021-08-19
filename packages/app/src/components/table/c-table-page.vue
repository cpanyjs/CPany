<template>
  <div v-if="isMobile" class="mb-2 grid grid-cols-2 gap-2">
    <c-button padding="p-2" @click="prePage" :disable="current <= first"
      ><icon-left></icon-left
    ></c-button>

    <c-button padding="p-2" @click="nextPage" :disable="current + 1 >= last"
      ><icon-right></icon-right
    ></c-button>
  </div>

  <div class="flex justify-center">
    <c-button
      v-if="!isMobile"
      padding="p-2"
      @click="prePage"
      :disable="current <= first"
      ><icon-left></icon-left
    ></c-button>

    <template v-if="last - first <= pageView">
      <c-button
        v-for="index in last - first"
        :key="index"
        class="ml-2"
        :info="index + first === current + 1"
        @click="goPage(index + first - 1)"
      >
        <span>{{ index + first }}</span>
      </c-button>
    </template>
    <template v-else-if="current - first < pageView">
      <c-button
        v-for="index in pageView"
        :key="index"
        class="ml-2"
        :info="index + first === current + 1"
        @click="goPage(index + first - 1)"
      >
        <span>{{ index + first }}</span>
      </c-button>
      <span class="ml-2 inline-flex justify-center items-center py-2 md:px-2"
        >...</span
      >
      <c-button class="ml-2" @click="goPage(last - 1)">{{ last }}</c-button>
    </template>
    <template v-else-if="last - current <= pageView">
      <c-button class="ml-2" @click="goPage(first)">{{ first + 1 }}</c-button>
      <span class="ml-2 inline-flex justify-center items-center py-2 md:px-2"
        >...</span
      >
      <c-button
        v-for="index in pageView"
        :key="index"
        class="ml-2"
        :info="last - pageView + index === current + 1"
        @click="goPage(last - pageView + index - 1)"
      >
        <span>{{ last - pageView + index }}</span>
      </c-button>
    </template>
    <template v-else>
      <c-button class="ml-2" @click="goPage(first)">{{ first + 1 }}</c-button>
      <span class="ml-2 inline-flex justify-center items-center py-2 md:px-2"
        >...</span
      >
      <c-button
        v-for="index in pageView"
        :key="index"
        class="ml-2"
        :info="current - Math.floor(pageView / 2) + index === current + 1"
        @click="goPage(current - Math.floor(pageView / 2) + index - 1)"
      >
        <span>{{ current - Math.floor(pageView / 2) + index }}</span>
      </c-button>
      <span class="ml-2 inline-flex justify-center items-center py-2 md:px-2"
        >...</span
      >
      <c-button class="ml-2" @click="goPage(last - 1)">{{ last }}</c-button>
    </template>

    <c-button
      v-if="!isMobile"
      padding="p-2"
      class="ml-2"
      @click="nextPage"
      :disable="current + 1 >= last"
      ><icon-right></icon-right
    ></c-button>
  </div>
</template>

<script setup lang="ts">
import { toRefs, computed } from 'vue';
import IconLeft from 'virtual:vite-icons/mdi/chevron-left';
import IconRight from 'virtual:vite-icons/mdi/chevron-right';

const props = defineProps<{
  isMobile?: boolean;
  pageView?: number;
  current: number;
  first: number;
  last: number;
  nextPage: () => void;
  prePage: () => void;
  goPage: (page: number) => void;
}>();

const {
  isMobile: _isMobile,
  pageView: _pageView,
  current,
  first,
  last
} = toRefs(props);

const pageView = computed(() => _pageView?.value ?? 5);
const isMobile = computed(() => _isMobile?.value ?? false);
</script>
