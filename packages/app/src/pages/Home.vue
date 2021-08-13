<template>
  <div class="flex <lg:flex-col-reverse">
    <div class="lg:w-3/5 <lg:w-full">
      <div class="box">
        <h3 class="mb-2">最近比赛</h3>
        <div v-for="contest in contests">
          <span>{{ contest.name }}</span>
        </div>
      </div>
    </div>
    <div class="lg:w-2/5 <lg:w-full">
      <div class="lg:ml-4 <lg:mb-4">
        <div class="box">
          <h3>总览</h3>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { contests } from '../overview';
</script>

<style></style>
