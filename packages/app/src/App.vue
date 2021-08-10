<template>
  <navbar>
    <template #brand>
      <navbar-item class="font-bold text-lg">CPany</navbar-item>
    </template>
    <template #start>
      <navbar-item>成员</navbar-item>
      <navbar-item>Codeforces</navbar-item>
    </template>
    <template #end>
      <navbar-item>设置</navbar-item>
    </template>
  </navbar>
  <div class="px-8 pt-4">
    <div>Hello World</div>
  </div>
</template>

<script setup lang="ts">
import { Navbar, NavbarItem } from './components/navbar';
</script>

<style>
:root {
  --font-family-base: 'Inter', apple-system, BlinkMacSystemFont, 'Segoe UI',
    Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans',
    'Helvetica Neue', sans-serif;
  --font-family-mono: 'IBM Plex Mono', source-code-pro, Menlo, Monaco, Consolas,
    'Courier New', monospace;
}

html {
  font-family: var(--font-family-base);
}
</style>
