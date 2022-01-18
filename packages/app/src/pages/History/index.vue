<script setup lang="ts">
import { Verdict } from '@cpany/types';
import { records, ISub } from './history';

const countOk = (subs: ISub[]) => subs.filter((sub) => sub.verdict === Verdict.OK);
</script>

<template>
  <div class="divide-y">
    <h2 class="mb-4">历史</h2>
    <div class="py-4">
      <div class="pl-[8px] relative timeline">
        <div
          v-for="(record, index) in records"
          :key="record.day"
          class="relative timeline-item pl-4"
        >
          <div
            class="py-4 px-4 border rounded-md divide-y"
            :style="{
              borderTopWidth: index > 0 ? 0 : undefined,
              borderTopLeftRadius: index > 0 ? 0 : undefined,
              borderTopRightRadius: index > 0 ? 0 : undefined,
              borderBottomLeftRadius: index + 1 < records.length ? 0 : undefined,
              borderBottomRightRadius: index + 1 < records.length ? 0 : undefined
            }"
          >
            <div class="font-bold pb-2">{{ record.day }}</div>
            <div>
              <div v-for="record in record.record.list()" class="mt-2">
                <router-link :to="`/user/${record.name}`">{{ record.name }}</router-link>
                <span> 提交了 </span>
                <span class="font-bold">{{ record.newSubmissions.length }}</span>
                <span> 次代码，通过了 </span>
                <span class="font-bold">{{ countOk(record.newSubmissions).length }}</span>
                <span> 个题目</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.timeline:before {
  content: ' ';
  background: #d4d9df;
  display: inline-block;
  position: absolute;
  width: 2px;
  height: 100%;
  z-index: 400;
}

.timeline-item:before {
  content: ' ';
  background: white;
  display: inline-block;
  position: absolute;
  border-radius: 50%;
  border: 3px solid #22c0e8;
  left: -6.5px;
  top: calc(1em + 6.5px);
  width: 15px;
  height: 15px;
  z-index: 500;
}
</style>
