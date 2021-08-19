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
            v-for="(handle, index) in cfHandles"
            :key="index"
            class="box <md:(p-2)"
          >
            <span class="font-600"
              >{{ transformHandleType(handle.type) }}:
            </span>
            <cf-handle :handle="handle"></cf-handle>
            <p>
              <span class="font-600">Contest rating: </span>
              <cf-rating-color :rank="handle.codeforces.rank">{{
                handle.codeforces.rating
              }}</cf-rating-color>
            </p>
            <p>
              <span class="font-600">Max rating: </span>
              <cf-rating-color :rank="handle.codeforces.maxRank">{{
                handle.codeforces.maxRating
              }}</cf-rating-color>
            </p>
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

    <div class="py-4">
      <h3 class="my-4 text-center">所有提交</h3>
      <c-table :data="submissions" :page-size="10" :mobile-page-size="3">
        <template #columns="{ row }">
          <c-table-column class="font-600" label="#" center>
            <span>{{ row.index }}</span>
          </c-table-column>
          <c-table-column label="时间" center>
            <a :href="row.submissionUrl" target="_blank">{{
              toDate(row.creationTime).value
            }}</a>
          </c-table-column>
          <c-table-column label="题目" :mobile-header-class="['min-w-8']">
            <a :href="row.problem.problemUrl" target="_blank">{{
              row.problem.id + ' ' + row.problem.name
            }}</a>
          </c-table-column>
          <c-table-column label="语言" center>
            <span>{{ row.language }}</span>
          </c-table-column>
          <c-table-column label="结果" center>
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
      <h3 class="my-4 text-center">所有比赛</h3>
      <c-table :data="contests" :page-size="5">
        <template #columns="{ row, index }">
          <c-table-column class="font-600" label="#" width="4em" center>
            <span>{{ index + 1 }}</span>
          </c-table-column>
          <c-table-column label="时间" center>
            <a :href="row.contestUrl">{{
              toDate(row.author.participantTime).value
            }}</a>
          </c-table-column>
          <c-table-column label="比赛" :mobile-header-class="['min-w-8']">
            <router-link :to="row.path">{{ row.name }}</router-link>
          </c-table-column>
        </template>
      </c-table>
    </div>

    <div class="mt-4"></div>
  </div>
</template>

<script setup lang="ts">
import type { RouteKey, IUser, ISubmission, IContest } from '@cpany/types';
import type { IHandleWithCodeforces } from '@cpany/types/codeforces';
import { Verdict } from '@cpany/types';
import { ref, toRefs, computed } from 'vue';

import IconCheck from 'virtual:vite-icons/mdi/check';
import IconClose from 'virtual:vite-icons/mdi/close';
import IconCloud from 'virtual:vite-icons/mdi/cloud-outline';
import IconBalloon from 'virtual:vite-icons/mdi/balloon';
import IconLightbulbOn from 'virtual:vite-icons/mdi/lightbulb-on-outline';

import { CTable, CTableColumn } from '@/components/table';
import { CfHandle, CfRatingColor } from '@/components/codeforces';
import { CStastic } from '@/components/stastic';
import { toDate } from '@/utils';

const props = defineProps<{ user: IUser }>();
const { user } = toRefs(props);

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

// Hack: all handle are cf
const cfHandles = (
  user.value.handles as RouteKey<IHandleWithCodeforces>[]
).sort((lhs, rhs) => rhs.codeforces.rating - lhs.codeforces.rating);

const transformHandleType = (type: string) => {
  return 'Codeforces';
};
</script>
