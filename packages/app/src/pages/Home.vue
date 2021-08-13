<template>
  <div class="flex <lg:flex-col-reverse">
    <div class="lg:w-3/5 <lg:w-full">
      <div class="box divide-y">
        <h3 class="mb-2">最近比赛</h3>
        <div class="py-2">
          <div v-for="contest in contests">
            <router-link :to="contest.path">{{ contest.name }}</router-link>
          </div>
        </div>
        <div class="text-right pt-2">
          <router-link
            :to="{ name: 'Contests' }"
            class="text-gray-400 font-thin hover:underline"
            ><span class="font-bold">→</span> 更多比赛</router-link
          >
        </div>
      </div>
    </div>
    <div class="lg:w-2/5 <lg:w-full">
      <div class="lg:ml-4 <lg:mb-4">
        <div class="box divide-y">
          <h3 class="mb-2">总览</h3>
          <div class="py-2"></div>
          <div class="text-right pt-2">
            <router-link
              :to="{ name: 'About' }"
              class="text-gray-400 font-thin hover:underline"
              ><span class="font-bold">→</span> 更多</router-link
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { contests } from '../overview';
</script>
