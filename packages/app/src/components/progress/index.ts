import Progress from './progress.vue';
import { inject } from 'vue';
import type { Ref } from 'vue';

export { Progress };

export function useGlobalLoading() {
  const loading = inject<Ref<boolean>>('loading');
  return {
    start() {
      loading!.value = true;
    },
    end() {
      loading!.value = false;
    }
  };
}
