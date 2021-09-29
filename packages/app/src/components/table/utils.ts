import { ref, computed, Ref, unref } from 'vue';

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

export function usePagination(_pageSize: Ref<number | undefined>, data: MaybeRef<any[]>) {
  const dataLength = computed(() => unref(data).length);
  const pageSize = computed(() => Math.max(1, unref(_pageSize) ?? dataLength.value));

  const pageLength = computed(() => Math.ceil(dataLength.value / pageSize.value));
  const current = ref(0);
  const L = computed(() => current.value * pageSize.value);
  const R = computed(() => Math.min(dataLength.value, L.value + pageSize.value));

  const hasNextPage = computed(
    () => current.value + 1 < pageLength.value && R.value < dataLength.value
  );
  const nextPage = () => {
    if (hasNextPage.value) {
      current.value += 1;
    }
  };

  const hasPrePage = computed(() => current.value > 0 && L.value > 0);
  const prePage = () => {
    if (hasPrePage.value) {
      current.value -= 1;
    }
  };

  const goPage = (_page: MaybeRef<number>) => {
    const page = unref(_page);
    if (0 <= page && page < pageLength.value) {
      current.value = page;
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
    prePage,
    goPage
  };
}
