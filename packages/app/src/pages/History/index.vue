<script setup lang="ts">
import { records } from './history';
</script>

<template>
  <div class="divide-y">
    <h2 class="mb-4">历史</h2>
    <div class="py-4 pl-[8px]">
      <div class="relative timeline">
        <div
          v-for="(record, index) in records"
          :key="record.day"
          class="relative timeline-item pl-4"
        >
          <div class="py-4 px-4 border" :style="{ borderTopWidth: index > 0 ? 0 : undefined }">
            <span class="font-bold">{{ record.day }}</span>
            <div v-for="record in record.record.list()">
              <router-link :to="`/user/${record.name}`">{{ record.name }}</router-link>
              <span> 进行了 {{ record.newSubmissions.length }} 次提交</span>
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
