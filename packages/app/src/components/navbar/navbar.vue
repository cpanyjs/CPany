<template>
  <nav class="navbar">
    <div class="navbar-brand">
      <slot name="brand"></slot>
    </div>
    <div class="navbar-menu">
      <div class="navbar-start">
        <slot name="start"></slot>
        <slot></slot>
      </div>
      <div class="navbar-end">
        <slot name="end"></slot>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts"></script>

<style>
.navbar {
  @apply py-2 px-8;
  @apply shadow-navbar;
}

.navbar,
.navbar-menu,
.navbar-brand,
.navbar-start,
.navbar-end {
  @apply flex items-stretch;
  @apply min-h-12 relative;
}

.navbar-menu {
  @apply flex-1;
}

.navbar-brand {
  @apply items-center;
  @apply bg-transparent;
  @apply cursor-pointer;
}

.navbar-start {
  @apply justify-start items-center mr-auto;
}

.navbar-end {
  @apply justify-end items-center ml-auto;
}
</style>
