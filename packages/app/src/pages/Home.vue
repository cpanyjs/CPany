<template>
  <div class="flex <lg:flex-col-reverse">
    <div class="lg:w-3/5 <lg:w-full">
      <div class="box md:divide-y">
        <h3 class="mb-4">最近比赛</h3>

        <c-table :data="contests" class="pt-2">
          <template #columns="{ row }">
            <c-table-column label="比赛" :mobile-header-class="['min-w-8']">
              <router-link :to="row.path">{{ row.name }}</router-link>
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

        <div class="text-right pt-2">
          <router-link
            :to="{ name: 'Contests' }"
            class="text-gray-400 font-thin hover:underline"
            >→ 更多比赛</router-link
          >
        </div>
      </div>
    </div>

    <div class="lg:w-2/5 <lg:w-full">
      <div class="lg:ml-4 <lg:mb-4">
        <div class="box divide-y">
          <h3 class="mb-4">
            <span v-if="title !== ''">{{ title }}&nbsp;</span>总览
          </h3>

          <div
            class="
              py-4
              md:(flex
              items-center
              justify-around)
              <md:(grid
              grid-cols-2)
            "
          >
            <c-stastic title="用户">
              <template #prefix><icon-account /></template>
              <template #>{{ users.length }}</template>
            </c-stastic>

            <c-stastic title="参与比赛">
              <template #prefix><icon-cloud class="text-blue-400" /></template>
              <template #>{{ allContestCount }}</template>
            </c-stastic>

            <c-stastic title="提交">
              <template #prefix
                ><icon-lightbulb-on class="text-yellow-400"
              /></template>
              <template #>{{ allSubmissionCount }}</template>
            </c-stastic>

            <c-stastic title="正确提交">
              <template #prefix><icon-balloon class="text-red-400" /></template>
              <template #>{{ allOkSubmissionCount }}</template>
            </c-stastic>
          </div>

          <div class="text-right pt-2">
            <router-link
              :to="{ name: 'About' }"
              class="text-gray-400 font-thin hover:underline"
              >→ 更多</router-link
            >
          </div>
        </div>

        <div class="box mt-4 divide-y">
          <h3 class="mb-4">最近{{ recent }}用户提交数</h3>

          <c-table :data="usersBySub" :mobile="0">
            <template #columns="{ row, index }">
              <c-table-column label="#" width="2em" align="center">
                <span class="font-600">{{ index + 1 }}</span>
              </c-table-column>
              <c-table-column label="姓名">
                <user-link :name="row.name"></user-link>
              </c-table-column>
              <c-table-column label="提交数" width="6em" align="center">
                <span>{{ row.submissions.length }}</span>
              </c-table-column>
            </template>
          </c-table>

          <div class="text-right pt-2">
            <router-link
              :to="{ name: 'Members' }"
              class="text-gray-400 font-thin hover:underline"
              >→ 更多</router-link
            >
          </div>
        </div>

        <div class="box mt-4 divide-y">
          <h3 class="mb-4">最近{{ recent }}用户比赛数</h3>

          <c-table :data="usersByContest" :mobile="0">
            <template #columns="{ row, index }">
              <c-table-column label="#" width="2em" align="center">
                <span class="font-600">{{ index + 1 }}</span>
              </c-table-column>
              <c-table-column label="姓名">
                <user-link :name="row.name"></user-link>
              </c-table-column>
              <c-table-column label="比赛数" width="6em" align="center">
                <span>{{ row.contestsLength }}</span>
              </c-table-column>
            </template>
          </c-table>

          <div class="text-right pt-2">
            <router-link
              :to="{ name: 'Members' }"
              class="text-gray-400 font-thin hover:underline"
              >→ 更多</router-link
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import IconAccount from 'virtual:vite-icons/mdi/account';
import IconCloud from 'virtual:vite-icons/mdi/cloud-outline';
import IconBalloon from 'virtual:vite-icons/mdi/balloon';
import IconLightbulbOn from 'virtual:vite-icons/mdi/lightbulb-on-outline';

import {
  contests,
  users,
  recentTime,
  title,
  recentUserCount,
  recentStartTime,
  allSubmissionCount,
  allContestCount,
  allOkSubmissionCount
} from '../overview';
import { toDate } from '../utils';
import { CTable, CTableColumn } from '../components/table';
import { CStastic } from '../components/stastic';
import UserLink from '../components/user-link.vue';

const recent = ' ' + (recentTime / (24 * 3600)).toFixed(0) + ' 天';

const usersBySub = users
  .sort((lhs, rhs) => rhs.submissions.length - lhs.submissions.length)
  .slice(0, recentUserCount);

const usersByContest = users
  .map((user) => {
    const contestsLength = user.contests.filter(
      ({ t }) => t >= recentStartTime
    ).length;
    return { contestsLength, ...user };
  })
  .sort((lhs, rhs) => rhs.contestsLength - lhs.contestsLength)
  .slice(0, recentUserCount);
</script>
