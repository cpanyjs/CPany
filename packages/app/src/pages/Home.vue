<template>
  <div class="flex <lg:flex-col-reverse">
    <div class="lg:w-3/5 <lg:w-full">
      <div class="box divide-y">
        <h3 class="mb-4">最近比赛</h3>

        <c-table :data="contests" class="pt-2">
          <template #columns="{ row }">
            <c-table-column label="比赛">
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
          <h3 class="mb-4">总览</h3>
          <div class="py-2"></div>
          <div class="text-right pt-2">
            <router-link
              :to="{ name: 'About' }"
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

import { contests } from '../overview';
import { toDate } from '../utils';
import { CTable, CTableColumn } from '../components/table';
</script>
