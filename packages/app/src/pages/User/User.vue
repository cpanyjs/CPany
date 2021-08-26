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
            <template #prefix
              ><icon-lightbulb-on class="text-yellow-400"
            /></template>
            <template #>{{ submissions.length }}</template>
          </c-stastic>

          <c-stastic title="通过" class="md:ml-4 <md:ml-2">
            <template #prefix><icon-balloon class="text-red-400" /></template>
            <template #>{{
              submissions.filter((sub) => sub.verdict === Verdict.OK).length
            }}</template>
          </c-stastic>
        </div>

        <div
          class="
            <md:mt-2
            md:mt-4
            grid
            <md:(grid-cols-1
            gap-2)
            md:(grid-cols-2
            gap-4)
          "
        >
          <div
            v-for="(handle, index) in user.handles"
            :key="index"
            class="box <md:(p-2)"
          >
            <handle-card :handle="handle"></handle-card>
          </div>
        </div>
      </div>
      <div
        v-if="avatar !== null"
        class="md:(ml-4 max-w-1/3) <md:(mb-2 w-full flex justify-center)"
      >
        <img :src="avatar" :alt="`${user.name}'s avatar`" />
      </div>
    </div>

    <div class="mb-4">
      <h3 class="my-4 px-2 flex justify-between items-center">
        <div class="text-transparent"><icon-down></icon-down></div>
        <div>训练日历</div>
        <div
          @click="flipHeatmap"
          class="
            p-1
            flex
            items-center
            rounded-full
            cursor-pointer
            hover:bg-light-700
          "
        >
          <icon-down
            v-if="!heatmapState"
            class="text-2xl inline-block"
          ></icon-down>
          <icon-up v-else class="text-2xl inline-block"></icon-up>
        </div>
      </h3>
      <heat-map
        v-if="heatmapState"
        :getColor="handleHeatMapColor"
        :getTooltip="handleHeatMapTooltip"
      ></heat-map>
    </div>

    <div class="mb-4">
      <h3 class="my-4 px-2 flex justify-between items-center">
        <div class="text-transparent"><icon-down></icon-down></div>
        <div>所有提交</div>
        <div
          @click="flipSub"
          class="
            p-1
            flex
            items-center
            rounded-full
            cursor-pointer
            hover:bg-light-700
          "
        >
          <icon-down v-if="!subState" class="text-2xl inline-block"></icon-down>
          <icon-up v-else class="text-2xl inline-block"></icon-up>
        </div>
      </h3>
      <c-table
        v-if="subState"
        :data="submissions"
        default-sort="序号"
        default-sort-order="desc"
        :page-size="10"
        :mobile-page-size="3"
      >
        <template #columns="{ row }">
          <c-table-column
            class="font-600"
            label="序号"
            center
            width="5em"
            :sort="sortByIndex"
          >
            <span>{{ row.index }}</span>
          </c-table-column>
          <c-table-column label="时间" center width="10em">
            <a :href="row.submissionUrl" target="_blank">{{
              toDate(row.creationTime).value
            }}</a>
          </c-table-column>
          <c-table-column label="类型" center width="4em">
            <span>{{ uppercase(row.type) }}</span>
          </c-table-column>
          <c-table-column label="题目" :mobile-header-class="['min-w-8']">
            <a :href="row.problem.problemUrl" target="_blank">{{
              row.problem.id + ' ' + row.problem.name
            }}</a>
          </c-table-column>
          <c-table-column
            label="难度"
            align="right"
            :sort="sortByProblemRating"
          >
            <span>{{ row.problem.rating }}</span>
          </c-table-column>
          <c-table-column label="语言" center>
            <span>{{ row.language }}</span>
          </c-table-column>
          <c-table-column label="结果" width="4em" center>
            <icon-check
              v-if="row.verdict === Verdict.OK"
              class="text-green-400"
            ></icon-check>
            <icon-close v-else class="text-red-400"></icon-close>
          </c-table-column>
        </template>
      </c-table>
    </div>

    <div>
      <h3 class="my-4 px-2 flex items-center justify-between">
        <div class="text-transparent"><icon-down></icon-down></div>
        <div>所有比赛</div>
        <div
          @click="flipContest"
          class="
            p-1
            flex
            items-center
            rounded-full
            cursor-pointer
            hover:bg-light-700
          "
        >
          <icon-down
            v-if="!contestState"
            class="text-2xl inline-block"
          ></icon-down>
          <icon-up v-else class="text-2xl inline-block"></icon-up>
        </div>
      </h3>
      <c-table
        v-if="contestState"
        :data="contests"
        :page-size="10"
        :mobile-page-size="5"
      >
        <template #columns="{ row, index }">
          <c-table-column class="font-600" label="序号" width="4em" center>
            <span>{{ index + 1 }}</span>
          </c-table-column>
          <c-table-column label="时间" center width="10em">
            <a :href="row.contestUrl">{{
              toDate(row.author.participantTime).value
            }}</a>
          </c-table-column>
          <c-table-column label="比赛" :mobile-header-class="['min-w-8']">
            <router-link :to="row.path">{{ row.name }}</router-link>
          </c-table-column>
          <c-table-column label="类型" center>
            <span>{{ displayContestType(row) }}</span>
          </c-table-column>
        </template>
      </c-table>
    </div>

    <div class="mt-4"></div>
  </div>
</template>

<script setup lang="ts">
import type { IUser, ISubmission, IContest } from '@cpany/types';
import { Verdict } from '@cpany/types';
import { ref, toRefs, computed } from 'vue';

import IconCheck from 'virtual:vite-icons/mdi/check';
import IconClose from 'virtual:vite-icons/mdi/close';
import IconCloud from 'virtual:vite-icons/mdi/cloud-outline';
import IconBalloon from 'virtual:vite-icons/mdi/balloon';
import IconLightbulbOn from 'virtual:vite-icons/mdi/lightbulb-on-outline';
import IconUp from 'virtual:vite-icons/mdi/chevron-up';
import IconDown from 'virtual:vite-icons/mdi/chevron-down';

import { CTable, CTableColumn } from '@/components/table';
import { CStastic } from '@/components/stastic';
import { HeatMap, parseHeatMapDate } from '@/components/heatmap';
import { toDate, displayContestType } from '@/utils';

import HandleCard from './HandleCard.vue';

const props = defineProps<{ user: IUser }>();
const { user } = toRefs(props);

const { state: heatmapState, flip: flipHeatmap } = useHover();
const { state: subState, flip: flipSub } = useHover();
const { state: contestState, flip: flipContest } = useHover();

const avatars = ref<string[]>([]);
for (const handle of user.value.handles) {
  if (
    handle.avatar !== undefined &&
    handle.avatar !== null &&
    handle.avatar !== ''
  ) {
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

const sortByIndex = (lhs: { index: number }, rhs: { index: number }) =>
  lhs.index - rhs.index;
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
const handleHeatMapColor = (day: string) => {
  const count = heatmapMap.get(day) ?? 0;
  return count;
};
const handleHeatMapTooltip = (day: string) => {
  const count = heatmapMap.get(day) ?? 0;
  return `在 ${day} ${count ? `有 ${count} 次` : '没有'}正确通过`;
};

const uppercase = (type: string) =>
  type.charAt(0).toUpperCase() + type.slice(1);

// hover
function useHover() {
  const state = ref(true);
  const open = () => (state.value = true);
  const close = () => (state.value = false);
  const flip = () => (state.value = !state.value);
  return { state, open, close, flip };
}
</script>
