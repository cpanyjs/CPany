<template>
  <div v-if="user" class="divide-y">
    <h2 class="mb-2">{{ user.name }}</h2>

    <div class="flex py-4 justify-between <md:(flex-col-reverse)">
      <div class="w-full">
        <div class="info-box border-left pt-4 flex justify-around">
          <c-stastic title="比赛">
            <template #prefix><icon-cloud class="text-blue-400" /></template>
            <template #>{{ user.contests.length }}</template>
          </c-stastic>

          <c-stastic title="提交" class="md:ml-4 <md:ml-2">
            <template #prefix><icon-lightbulb-on class="text-yellow-400" /></template>
            <template #>{{ submissions.length }}</template>
          </c-stastic>

          <c-stastic title="解决" class="md:ml-4 <md:ml-2">
            <template #prefix><icon-balloon class="text-red-400" /></template>
            <template #>{{ solvedSet.size }}</template>
          </c-stastic>
        </div>

        <div class="<md:mt-2 md:mt-4 grid <md:(grid-cols-1 gap-2) md:(grid-cols-2 gap-4)">
          <div v-for="(handle, index) in sortedHandles" :key="index" class="box <md:(p-2)">
            <handle-card :handle="handle"></handle-card>
          </div>
        </div>
      </div>
      <div v-if="avatar !== null" class="md:(ml-4 max-w-1/3) <md:(mb-2 w-full flex justify-center)">
        <img :src="avatar" :alt="`${user.name}'s avatar`" />
      </div>
    </div>

    <Hover :title="heatmapTitle" class="mb-4">
      <heat-map
        :now="heatmapNow"
        :getColor="handleHeatMapColor"
        :getTooltip="handleHeatMapTooltip"
      ></heat-map>
      <div class="flex justify-between items-center md:px-4">
        <div>
          <div>
            <div class="inline-block">
              <span class="font-bold">通过: </span>
              <span>{{ heatmapComment.okCount }}</span>
            </div>
            <div class="inline-block ml-4">
              <span class="font-bold">提交: </span>
              <span>{{ heatmapComment.subCount }}</span>
            </div>
          </div>
          <div>
            <span class="font-bold <md:block">统计时间: </span>
            <span>{{ heatmapComment.time }}</span>
          </div>
        </div>

        <c-select class="inline-block w-28" @change="handleSelectHeatmapYear">
          <option value="latest">最新</option>
          <option v-for="year in heatmapYearList" :value="year">{{ year }} 年</option>
        </c-select>
      </div>
    </Hover>

    <Hover title="所有提交" class="mb-4">
      <c-table
        :data="submissions"
        default-sort="序号"
        default-sort-order="desc"
        :page-size="10"
        :mobile-page-size="3"
      >
        <template #columns="{ row }">
          <c-table-column class="font-600" label="序号" center width="5em" :sort="sortByIndex">
            <span>{{ row.index }}</span>
          </c-table-column>
          <c-table-column label="时间" center width="10em">
            <a :href="row.submissionUrl" target="_blank">{{ toDate(row.creationTime).value }}</a>
          </c-table-column>
          <c-table-column label="类型" center width="4em">
            <span>{{ displayProblemType(row) }}</span>
          </c-table-column>
          <c-table-column label="题目" :mobile-header-class="['min-w-8']">
            <a :href="row.problem.problemUrl" target="_blank">{{
              row.problem.id + ' ' + row.problem.name
            }}</a>
          </c-table-column>
          <c-table-column label="难度" align="right" :sort="sortByProblemRating">
            <span>{{ row.problem.rating }}</span>
          </c-table-column>
          <c-table-column label="语言" center>
            <span>{{ row.language }}</span>
          </c-table-column>
          <c-table-column label="结果" width="4em" center>
            <icon-check v-if="row.verdict === Verdict.OK" class="text-green-400"></icon-check>
            <icon-close v-else class="text-red-400"></icon-close>
          </c-table-column>
        </template>
      </c-table>
    </Hover>

    <Hover title="所有比赛">
      <c-table :data="contests" :page-size="10" :mobile-page-size="5">
        <template #columns="{ row, index }">
          <c-table-column class="font-600" label="序号" width="4em" center>
            <span>{{ index + 1 }}</span>
          </c-table-column>
          <c-table-column label="时间" center width="10em">
            <a :href="row.contestUrl">{{ toDate(row.author.participantTime).value }}</a>
          </c-table-column>
          <c-table-column label="比赛" :mobile-header-class="['min-w-8']">
            <router-link :to="row.path">{{ row.name }}</router-link>
          </c-table-column>
          <c-table-column label="类型" center>
            <span>{{ displayContestType(row) }}</span>
          </c-table-column>
        </template>
      </c-table>
    </Hover>

    <div class="mt-4"></div>
  </div>
</template>

<script setup lang="ts">
import type { IUser, ISubmission, IContest, IHandle } from '@cpany/types';
import { Verdict } from '@cpany/types';
import { ref, toRefs, computed } from 'vue';

import IconCheck from '~icons/mdi/check';
import IconClose from '~icons/mdi/close';
import IconCloud from '~icons/mdi/cloud-outline';
import IconBalloon from '~icons/mdi/balloon';
import IconLightbulbOn from '~icons/mdi/lightbulb-on-outline';

import { CTable, CTableColumn } from '@/components/table';
import { CStastic } from '@/components/stastic';
import { HeatMap, parseHeatMapDate } from '@/components/heatmap';
import { CSelect } from '@/components/select';
import { toDate, displayContestType, displayProblemType } from '@/utils';

import { IHandleWithCodeforces } from '@cpany/types/codeforces';
import Hover from './Hover.vue';
import HandleCard from './HandleCard.vue';
import { IHandleWithAtCoder } from '@cpany/types/atcoder';

const props = defineProps<{ user: IUser }>();
const { user } = toRefs(props);

const avatars = ref<string[]>([]);
for (const handle of user.value.handles) {
  if (handle.avatar !== undefined && handle.avatar !== null && handle.avatar !== '') {
    avatars.value.push(handle.avatar);
    break;
  }
}
const avatar = computed(() => {
  if (avatars.value.length === 0) return '';
  const id = Math.floor(Math.random() * avatars.value.length);
  return avatars.value[id];
});

const submissions = ref<ISubmission[]>(
  ([] as ISubmission[])
    .concat(...user.value.handles.map((handle) => handle.submissions))
    .sort((lhs, rhs) => lhs.creationTime - rhs.creationTime)
    .map((sub, index) => ({ index: index + 1, ...sub }))
    .reverse()
);
const contests = ref<IContest[]>(user.value.contests);

const sortedHandles = computed(() => {
  const f = (handle: IHandle) => {
    const base = 100000;
    if (handle.type.startsWith('codeforces')) {
      return base * 9 + (handle as IHandleWithCodeforces).codeforces.rating;
    } else if (handle.type.startsWith('atcoder')) {
      return base * 8 + ((handle as IHandleWithAtCoder).atcoder.rating ?? 0);
    } else if (handle.type.startsWith('luogu')) {
      return base * 7;
    } else {
      return 0;
    }
  };
  return user.value.handles.sort((lhs, rhs) => {
    return f(rhs) - f(lhs);
  });
});

const sortByIndex = (lhs: { index: number }, rhs: { index: number }) => lhs.index - rhs.index;
const sortByProblemRating = (lhs: ISubmission, rhs: ISubmission) => {
  const lval = lhs.problem.rating ?? 0;
  const rval = rhs.problem.rating ?? 0;
  return lval - rval;
};

// For calendar heatmap
const heatmapMap: Map<string, number> = new Map();
const solvedSet: Set<string> = new Set();
submissions.value.forEach((sub) => {
  const pid = `${sub.type}/${sub.problem.id}`;
  if (sub.verdict === Verdict.OK && !solvedSet.has(pid)) {
    solvedSet.add(pid);
    const date = parseHeatMapDate(new Date(sub.creationTime * 1000));
    heatmapMap.set(date, (heatmapMap.get(date) ?? 0) + 1);
  }
});
const heatmapYearList = [...new Set([...heatmapMap.keys()].map((date) => date.slice(0, 4)))]
  .sort()
  .reverse();

const handleHeatMapColor = (day: string) => {
  const count = heatmapMap.get(day) ?? 0;
  return count;
};
const handleHeatMapTooltip = (day: string) => {
  const count = heatmapMap.get(day) ?? 0;
  return `在 ${day} ${count ? `有 ${count} 次` : '没有'}正确通过`;
};

const getHeatmapComment = (year?: string) => {
  const now = year ? new Date(+year, 11, 31, 23, 59, 59) : new Date();
  const lastYear = new Date(now.getTime() - 365 * 24 * 3600 * 1000);
  const start = new Date(lastYear.getTime() - (lastYear.getDay() - 1) * 24 * 3600 * 1000);
  const time = `${parseHeatMapDate(start)} ~ ${parseHeatMapDate(now)}`;

  const subCount = submissions.value.filter(
    (sub) => start.getTime() / 1000 <= sub.creationTime && sub.creationTime <= now.getTime() / 1000
  ).length;

  const okCount = [...heatmapMap.entries()].reduce((sum, [date, count]) => {
    const result = /(\d+)-(\d+)-(\d+)/.exec(date);
    const dateTime =
      result !== null ? new Date(+result[1], +result[2] - 1, +result[3]) : new Date(date);
    if (start.getTime() <= dateTime.getTime() && dateTime.getTime() <= now.getTime()) {
      return sum + count;
    } else {
      return sum;
    }
  }, 0);

  return { time, okCount, subCount };
};

const heatmapNow = ref(new Date());
const heatmapTitle = ref('训练日历');
const heatmapComment = ref(getHeatmapComment());

const handleSelectHeatmapYear = (ev: any) => {
  const year = ev.target?.value;
  if (year === 'latest') {
    heatmapNow.value = new Date();
    heatmapTitle.value = '训练日历';
    heatmapComment.value = getHeatmapComment();
  } else {
    heatmapNow.value = new Date(+year, 11, 31, 23, 59, 59);
    heatmapTitle.value = year + ' 年训练日历';
    heatmapComment.value = getHeatmapComment(year);
  }
};
</script>
