<template>
  <Progress />

  <navbar>
    <template #brand>
      <navbar-item class="font-bold text-lg" tag="router-link" :to="{ name: 'Home' }"
        >CPany</navbar-item
      >
    </template>
    <template #start>
      <navbar-item tag="router-link" :to="{ name: 'Members' }" v-if="members">成员</navbar-item>
      <navbar-item tag="router-link" :to="{ name: 'Codeforces' }" v-if="codeforces"
        >Codeforces</navbar-item
      >
      <navbar-item tag="router-link" :to="{ name: 'Contests' }" v-if="contests">比赛</navbar-item>
    </template>
  </navbar>

  <div class="px-screen py-4 main-view">
    <router-view v-slot="{ Component }">
      <transition name="fade">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>

  <footer class="px-1 py-6">
    <div class="text-center text-gray-400">
      <div class="flex items-center justify-center my-2 font-mono">
        <div class="mr-2">
          <a class="text-$text-light-1" href="https://github.com/" target="_blank"
            ><icon-github class="align-middle"></icon-github
          ></a>
        </div>
        <div>
          <a
            class="block text-left"
            :href="`https://github.com/cpanyjs/CPany/tree/v${cliVersion}`"
            target="_blank"
          >
            @cpany/cli: {{ cliVersion }}</a
          >
        </div>
      </div>
      <p v-if="fetchTime && fetchTime !== ''">
        <span>更新时间</span>
        <span class="font-mono">: {{ toDate(+fetchTime).value }}</span>
      </p>
      <p v-if="buildTime && buildTime !== ''" class="mt-2">
        <span>构建时间</span>
        <span class="font-mono">: {{ toDate(+buildTime).value }}</span>
      </p>
      <p class="mt-2">
        <a href="https://github.com/cpanyjs/CPany/blob/master/LICENSE" target="_blank">MIT</a>
        Licensed | Copyright © 2021
        <a href="https://xlor.cn" target="_blank">XLor</a>
      </p>
    </div>
  </footer>
</template>

<script setup lang="ts">
import IconGithub from '~icons/mdi/github';
import { Navbar, NavbarItem } from './components/navbar';
import { Progress } from './components/progress';
import { toDate } from './utils';
import { nav } from './overview';

const cliVersion = __CLI_VERSION__;

const fetchTime = __FETCH_TIMESTAMP__;

const buildTime = __BUILD_TIMESTAMP__;

const members = nav.findIndex((t) => t === 'members' || t === 'member') !== -1;
const codeforces = nav.findIndex((t) => t === 'codeforces') !== -1;
const contests = nav.findIndex((t) => t === 'contests' || t === 'contest') !== -1;
</script>

<style>
@screen md {
  html,
  body,
  #app {
    height: 100%;
    min-height: 100%;
  }

  .main-view {
    min-height: calc(100% - 10rem);
  }
}

.fade-enter-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from {
  opacity: 0;
}
</style>
