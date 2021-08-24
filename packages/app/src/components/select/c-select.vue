<template>
  <div class="select relative">
    <select
      class="
        pl-2
        pr-8
        py-2
        cursor-pointer
        block
        w-full
        outline-none
        rounded
        border border-1 border-[#dbdbdb]
        appearance-none
      "
    >
      <slot></slot>
    </select>
  </div>
</template>

<script setup lang="ts"></script>

<style>
.select::after {
  z-index: 10;
  right: 1rem;
  border: 3px solid var(--c-brand);
  border-radius: 2px;
  border-right: 0;
  border-top: 0;
  content: ' ';
  display: block;
  height: 0.625em;
  margin-top: -0.4375em;
  pointer-events: none;
  position: absolute;
  top: 50%;
  transform: rotate(-45deg);
  transform-origin: center;
  width: 0.625em;
}
</style>
