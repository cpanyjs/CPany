<template>
  <Progress />

  <navbar>
    <template #brand>
      <navbar-item
        class="font-bold text-lg"
        tag="router-link"
        :to="{ name: 'Home' }"
        >CPany</navbar-item
      >
    </template>
    <template #start>
      <navbar-item tag="router-link" :to="{ name: 'Members' }"
        >成员</navbar-item
      >
      <navbar-item tag="router-link" :to="{ name: 'Codeforces' }"
        >Codeforces</navbar-item
      >
      <navbar-item tag="router-link" :to="{ name: 'Contests' }"
        >比赛</navbar-item
      >
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
    <div class="text-center text-gray-400 font-mono">
      <p>
        <a
          class="text-$text-light-1"
          href="https://github.com/yjl9903/CPany"
          target="_blank"
          ><icon-github class="align-middle"></icon-github
        ></a>
        <a
          :href="`https://github.com/yjl9903/CPany/tree/v${cliVersion}`"
          target="_blank"
        >
          @cpany/cli: {{ cliVersion }}</a
        >
      </p>
      <p>
        <a
          href="https://github.com/yjl9903/CPany/blob/master/LICENSE"
          target="_blank"
          >MIT</a
        >
        Licensed | Copyright © 2021
        <a href="https://xlor.cn" target="_blank">XLor</a>
      </p>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { Navbar, NavbarItem } from './components/navbar';
import { Progress } from './components/progress';
import IconGithub from 'virtual:vite-icons/mdi/github';

const cliVersion = import.meta.env.VITE_CLI_VERSION;
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
