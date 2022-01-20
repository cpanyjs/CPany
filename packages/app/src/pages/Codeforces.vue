<template>
  <div class="divide-y">
    <h2 class="mb-4">Codeforces</h2>
    <c-table
      :data="extendUsers"
      cache="codeforces"
      :default-sort="defaultSort"
      :default-sort-order="defaultSortOrder"
    >
      <template #columns="{ index, row }">
        <c-table-column label="#" width="3em" align="center"
          ><span class="font-600">{{ index + 1 }}</span></c-table-column
        >
        <c-table-column label="姓名">
          <user-link :name="row.name"></user-link>
        </c-table-column>

        <c-table-column label="Handle">
          <a :href="`https://codeforces.com/profile/${row.handle}`" target="_blank">
            <cf-rating-color v-if="row.isRated" :rating="row.rating">
              {{ row.handle }}
            </cf-rating-color>
            <cf-rating-color v-else>{{ row.handle }}</cf-rating-color>
          </a>
        </c-table-column>

        <c-table-column label="Rating" :sort="normalSortBy(sortByRating)" align="right"
          ><cf-rating-color v-if="row.isRated" :rating="row.rating" disable-legendary>{{
            row.rating
          }}</cf-rating-color></c-table-column
        >

        <c-table-column
          label="最近通过"
          width="7em"
          align="right"
          :sort="normalSortBy(sortByRecentOk)"
          >{{ row.recentOkCount }}</c-table-column
        >
        <c-table-column
          label="最近平均难度"
          width="10em"
          align="right"
          :sort="normalSortBy(sortByAvgDiffcult)"
          >{{ row.recentAvgDiffcult }}</c-table-column
        >
        <c-table-column
          label="最近比赛"
          width="7em"
          align="right"
          :sort="normalSortBy(sortByRecentContest)"
          >{{ row.recentContest }}</c-table-column
        >
        <c-table-column
          label="最新通过"
          width="10em"
          align="center"
          :sort="normalSortBy(sortByLastSolve)"
          ><span v-if="row.lastSolveTime > 0">{{
            toDate(row.lastSolveTime).value
          }}</span></c-table-column
        >

        <c-table-column label="通过" width="5em" align="right" :sort="normalSortBy(sortByOk)">{{
          row.okCount
        }}</c-table-column>
        <c-table-column
          label="比赛"
          width="5em"
          align="right"
          :sort="normalSortBy(sortByContest)"
          >{{ row.contests.length }}</c-table-column
        >
      </template>

      <template #empty>
        <div class="my-4 px-3">人捏？</div>
      </template>
    </c-table>
    <div class="mt-4 pt-4">
      <span class="text-gray-400">最近开始于 {{ toDate(recentStartTime).value }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IUserOverview } from '@cpany/types';
import type { IHandleWithCodeforces } from '@cpany/types/codeforces';
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';

import { users } from '../users';
import { CTable, CTableColumn } from '../components/table';
import UserLink from '../components/user-link.vue';
import { CfRatingColor } from '../components/codeforces';
import { recentStartTime as defaultRecentStartTime } from '../overview';
import { toDate, isDef, createSortBy, combineCmp, createSortByString } from '../utils';

const route = useRoute();
const defaultSort = String(route.query.sort ?? '最近通过');
const defaultSortOrder = String(route.query.order ?? 'desc');

const recentStartTime = ref(defaultRecentStartTime);

const isTypeCf = (type: string) => type.startsWith('codeforces');

const extendFn = (user: IUserOverview) => {
  const submissions = user.submissions.filter(({ type }) => isTypeCf(type));
  const subCount = submissions.length;
  const okCount = submissions.filter(({ v }) => v === 1).length;
  const recentSubCount = submissions.filter(({ t }) => t >= recentStartTime.value).length;
  const recentOkCount = submissions.filter(
    ({ t, v }) => t >= recentStartTime.value && v === 1
  ).length;
  const recentContest = user.contests.filter(
    ({ type, t }) => t >= recentStartTime.value && isTypeCf(type)
  ).length;

  const recentOkDiffcultSubs = submissions.filter(
    ({ t, v, d }) => t >= recentStartTime.value && v === 1 && isDef(d)
  );
  const recentDiffcult = recentOkDiffcultSubs.reduce((sum, sub) => sum + (sub.d ?? 0), 0);
  const recentAvgDiffcult = Math.ceil(
    recentOkDiffcultSubs.length > 0 ? recentDiffcult / recentOkDiffcultSubs.length : 0
  );

  const solveSubs = submissions.filter(({ v }) => v === 1).sort((lhs, rhs) => rhs.t - lhs.t);
  const lastSolveTime = solveSubs.length > 0 ? solveSubs[0].t : 0;

  const handles = user.handles.filter((user) => isTypeCf(user.type));
  let handle = handles.length > 0 ? handles[0].handle : '';
  let isRated = false;
  const rating = handles.reduce((max, _handle) => {
    const cfHandle = _handle as unknown as IHandleWithCodeforces;
    if (isDef(cfHandle.codeforces)) {
      isRated = true;
    }
    if (isDef(cfHandle.codeforces) && cfHandle.codeforces.rating > max) {
      handle = cfHandle.handle;
      return cfHandle.codeforces.rating;
    } else {
      return max;
    }
  }, 0);

  return {
    subCount,
    okCount,
    recentSubCount,
    recentOkCount,
    recentContest,
    recentDiffcult,
    recentAvgDiffcult,
    lastSolveTime,
    rating,
    isRated,
    handle,
    ...user
  };
};

const extendUsers = computed(() => users.map(extendFn));

type ExtendUser = ReturnType<typeof extendFn>;

const sortByRating = createSortBy<ExtendUser>((user) => user.rating);
const sortByRecentOk = createSortBy<ExtendUser>((user) => user.recentOkCount);
const sortByRecentContest = createSortBy<ExtendUser>((user) => user.recentContest);
const sortByLastSolve = createSortBy<ExtendUser>((user) => user.lastSolveTime);
const sortByAvgDiffcult = createSortBy<ExtendUser>((user) => user.recentAvgDiffcult);
const sortByOk = createSortBy<ExtendUser>((user) => user.okCount);
const sortByContest = createSortBy<ExtendUser>((user) => user.contests.length);

const sortByName = createSortByString<ExtendUser>((user) => user.name);

function normalSortBy(cmpFn: typeof sortByRating) {
  return combineCmp(
    cmpFn,
    sortByRating,
    sortByRecentOk,
    sortByRecentContest,
    sortByLastSolve,
    sortByAvgDiffcult,
    sortByOk,
    sortByContest,
    sortByName
  );
}
</script>
