import { createApp, ref } from 'vue';
import { router } from './router';
import 'virtual:windi.css';

import App from './App.vue';

const loading = ref(false);

router.beforeEach(async () => {
  loading.value = true;
});

router.afterEach(async () => {
  loading.value = false;
});

createApp(App).provide('loading', loading).use(router).mount('#app');
