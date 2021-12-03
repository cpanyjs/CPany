<template>
  <div class="divide-y">
    <h2 class="mb-4">所有比赛</h2>

    <div>
      <div class="my-4 relative">
        <IconSearch class="absolute text-xl icon-search" />
        <input
          type="text"
          name="contest_search"
          id="contest_search"
          class="input-search w-full py-2 pr-2 outline-transparent rounded border border-light-900"
          v-model="searchInput"
        />
      </div>

      <c-table :data="displayContests">
        <template #columns="{ row, index }">
          <c-table-column label="#" center>
            <span class="font-600">{{ index + 1 }}</span>
          </c-table-column>
          <c-table-column label="比赛" :mobile-header-class="['min-w-8']">
            <router-link :to="row.path">{{ row.name }}</router-link>
          </c-table-column>
          <c-table-column label="平台" center>
            <span>{{ displayContestType(row) }}</span>
          </c-table-column>
          <c-table-column label="时间" align="center" width="10em">
            <span>{{ toDate(row.startTime).value }}</span>
          </c-table-column>
          <c-table-column label="人数" align="center" width="5em">
            <div class="flex flex-1 items-center justify-center">
              <icon-account />&nbsp;<span>x {{ row.participantNumber }}</span>
            </div>
          </c-table-column>
        </template>
      </c-table>
      <div class="mt-4 flex justify-center" v-if="searchInput === ''">
        <c-button @click="displayMore" success>↓ 浏览更多</c-button>
      </div>
    </div>

    <div class="mt-4 pt-4 text-gray-400">
      共 <span class="font-mono">{{ length }}</span> 场比赛
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

import IconAccount from '~icons/mdi/account';
import IconSearch from '~icons/ic/baseline-search';

import type { IContest } from '@cpany/types';

import { contests } from '@/contests';
import { CTable, CTableColumn } from '@/components/table';
import { recentContestsCount } from '@/overview';
import { toDate, debounce, displayContestType } from '@/utils';

const unit = recentContestsCount * 2;

const SIZEKEY = 'contest.size';

const SEARCHKEY = 'contest.search';

const load = (key: string) => {
  return sessionStorage.getItem(key);
};

const loadSize = () => {
  const result = load(SIZEKEY);
  return result !== null ? +result : unit;
};

const store = (key: string, value: string) => {
  sessionStorage.setItem(key, value);
};

const searchInput = ref(load(SEARCHKEY) ?? '');

const filterContests = ref([] as IContest[]);

const filterFn = () => {
  if (searchInput.value !== '') {
    filterContests.value = contests.filter((contest) =>
      contest.name.toLowerCase().includes(searchInput.value.toLowerCase())
    );
    store(SEARCHKEY, searchInput.value);
  } else {
    store(SEARCHKEY, '');
  }
}
filterFn();
const debounceFilter = debounce(filterFn, 500);

watch(searchInput, () => {
  debounceFilter();
});

const fullContests = ref(contests.slice(0, loadSize()));
const displayContests = computed(() => {
  if (searchInput.value === '') {
    return fullContests.value;
  } else {
    return filterContests.value;
  }
});

const displayMore = () => {
  const curLength = fullContests.value.length;
  fullContests.value.push(...contests.slice(curLength, curLength + unit));
  store(SIZEKEY, String(fullContests.value.length));
};

const length = computed(() => {
  if (searchInput.value === '') {
    return contests.length;
  } else {
    return filterContests.value.length;
  }
});
</script>

<style>
.icon-search {
  top: 50%;
  transform: translate(0.5rem, -50%);
}
.input-search {
  padding-left: calc(1.25rem + 1em);
}
</style>
