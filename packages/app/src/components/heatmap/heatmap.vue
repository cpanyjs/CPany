<template>
  <div class="flex justify-center">
    <div class="relative" :style="{ width: 2 * unitValue + 'px' }">
      <div
        v-for="day in 7"
        class="absolute flex items-center"
        :style="{
          height: unit,
          top: (unitValue + 4) * day + 4 + 'px',
          right: '4px'
        }"
      >
        <span
          class="inline-block h-full !align-middle"
          :style="{ fontSize: '12px', transform: fontScale }"
          >{{ dayInWeek[day - 1] }}</span
        >
      </div>
    </div>
    <div
      ref="container"
      class="mb-4 w-full text-left whitespace-nowrap overflow-auto"
    >
      <div
        v-for="week in 53"
        class="inline-grid grid-rows-7 gap-[4px] ml-[4px]"
        :style="{ width: unit }"
      >
        <div
          :class="[!displayMonth(week) ? 'text-transparent' : '', 'relative']"
          :style="{ height: unit }"
        >
          <span
            class="inline-block absolute"
            :style="{ fontSize: '12px', transform: fontScale }"
            >{{ displayMonth(week) ?? '一' }}</span
          >
        </div>
        <div v-for="day in 7" :style="{ height: unit }">
          <div
            v-if="week < 53 || day <= now.getDay()"
            class="
              w-full
              h-full
              rounded
              bg-[#ebedf0]
              border-[rgba(27,31,35,0.06)]
            "
            @click="getDate(week, day)"
            :style="{ backgroundColor: getDayColor(week, day) }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, toRefs, onMounted } from 'vue';
import { parseHeatMapDate } from './utils';

const props =
  defineProps<{ colors?: string[]; getColor: (day: string) => number }>();

const DefaultColors = [
  'rgb(235,237,240)',
  'rgb(155,233,168)',
  'rgb(64,196,99)',
  'rgb(48,161,78)',
  'rgb(33,110,57)'
];
const { colors: _colors, getColor } = toRefs(props);
const colors = computed(() => _colors?.value ?? DefaultColors);

const dayInWeek = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

const container = ref<HTMLElement | null>(null);
const unitValue = computed(() => {
  if (container.value === null) {
    return 16;
  } else {
    return Math.max(container.value.clientWidth / 53 - 4.5, 16);
  }
});
const unit = computed(() => {
  return unitValue.value + 'px';
});
const fontScale = computed(() => {
  if (container.value === null) {
    return '1.0';
  } else {
    const unit = Math.max(container.value.clientWidth / 53 - 4.5, 16);
    return `scale(${Math.min(1.0, (unit - 4) / 12)})`;
  }
});
onMounted(() => {
  // auto scroll to right
  const el = container.value!;
  if (el.scrollLeft !== el.scrollWidth) {
    el.scrollTo(el.scrollWidth, 0);
  }
});

const now = new Date();

const getDate = (week: number, day: number) => {
  const duration = 52 * 7 + now.getDay() - ((week - 1) * 7 + day);
  const clicked = new Date(now.getTime() - duration * 1000 * 3600 * 24);
  return clicked;
};

const displayMonth = (week: number) => {
  const lastDay = getDate(week, 7);
  if (lastDay.getDate() <= 7) {
    return [
      '一月',
      '二月',
      '三月',
      '四月',
      '五月',
      '六月',
      '七月',
      '八月',
      '九月',
      '十月',
      '十一月',
      '十二月'
    ][lastDay.getMonth()];
  } else {
    return null;
  }
};

const getDayColor = (week: number, day: number) => {
  const date = parseHeatMapDate(getDate(week, day));
  const color = Math.max(
    0,
    Math.min(colors.value.length - 1, getColor.value(date) ?? 0)
  );
  return colors.value[color];
};
</script>
