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
    <template #end>
      <navbar-item tag="router-link" :to="{ name: 'About' }">关于</navbar-item>
    </template>
  </navbar>

  <div class="px-screen py-4 main-view">
    <router-view></router-view>
  </div>

  <footer class="px-2 py-6">
    <div class="text-center">
      <p>
        <a
          href="https://github.com/yjl9903/CPany/blob/master/LICENSE"
          target="_blank"
          >MIT</a
        >
        Licensed |
        <a href="https://github.com/yjl9903/CPany" target="_blank">CPany</a>
        Copyright © 2021 <a href="https://xlor.cn" target="_blank">XLor</a>
      </p>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { Navbar, NavbarItem } from './components/navbar';
import { Progress } from './components/progress';
</script>

<style>
:root {
  --font-family-base: 'Inter', apple-system, BlinkMacSystemFont, 'Segoe UI',
    Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans',
    'Helvetica Neue', sans-serif;
  --font-family-mono: 'IBM Plex Mono', source-code-pro, Menlo, Monaco, Consolas,
    'Courier New', monospace;

  --text-light-1: #2c3e50;
  --text-light-2: #476582;
  --text-light-3: #90a4b7;

  --c-brand: #3273dc;
  --c-brand-active: #3273dc;
}

html {
  font-family: var(--font-family-base);
  font-size: 16px;
  font-weight: 400;
  color: var(--text-light-1);
}

a {
  text-decoration: none;
  color: var(--c-brand);
}

@screen lg {
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

/* .fade-enter-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from {
  opacity: 0;
}

.fade-enter-from ~ #progress {
  animation: loading-loop 1s;
  animation-iteration-count: infinite;
}

.fade-enter-active ~ #progress {
  animation: loading-loop 1s;
  animation-iteration-count: infinite;
} */
</style>
