import { createApp, ref } from 'vue';
import { router } from './router';
import 'virtual:windi.css';

import App from './App.vue';

const loading = ref(false);

// const sleep = (time: number) => new Promise(res => setTimeout(res, time))

router.beforeEach(async () => {
  loading.value = true;
});

router.afterEach(async () => {
  loading.value = false;
});

createApp(App).provide('loading', loading).use(router).mount('#app');
