import { ref, computed, Ref, unref } from 'vue';
import { isDef } from '@/utils';

type MaybeRef<T> = Ref<T> | T;

export function useIsMobile(mobileWidth: MaybeRef<number>) {
  const width = ref(window.innerWidth);
  const isMobile = ref(width.value <= unref(mobileWidth));
  const handler = () => {
    width.value = window.innerWidth;
    isMobile.value = width.value <= unref(mobileWidth);
  };
  const clean = () => window.removeEventListener('resize', handler);
  window.addEventListener('resize', handler, { passive: true });
  return { width, isMobile, clean };
}

export function usePagination(
  _pageSize: MaybeRef<number | undefined>,
  data: MaybeRef<any[]>
) {
  const pageSize = Math.max(1, unref(_pageSize) ?? unref(data).length);

  const pageLength = computed(() => Math.ceil(unref(data).length / pageSize));
  const current = ref(0);
  const L = ref(current.value * pageSize);
  const R = ref(Math.min(unref(data).length, L.value + pageSize));

  const hasNextPage = computed(
    () => current.value + 1 < pageLength.value && R.value < unref(data).length
  );
  const nextPage = () => {
    if (hasNextPage.value) {
      const length = unref(data).length;
      const pageSize = unref(_pageSize) ?? length;
      current.value += 1;
      L.value = current.value * pageSize;
      R.value = Math.min(length, L.value + pageSize);
    }
  };

  const hasPrePage = computed(() => current.value > 0 && L.value > 0);
  const prePage = () => {
    if (hasPrePage.value) {
      const length = unref(data).length;
      const pageSize = unref(_pageSize) ?? length;
      current.value -= 1;
      L.value = current.value * pageSize;
      R.value = Math.min(length, L.value + pageSize);
    }
  };

  return {
    current,
    pageLength,
    L,
    R,
    hasNextPage,
    nextPage,
    hasPrePage,
    prePage
  };
}
