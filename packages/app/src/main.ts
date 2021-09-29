import { createApp, ref } from 'vue';
import { router } from './router';

import 'tippy.js/dist/tippy.css';
import 'virtual:windi.css';
import './assets/cf.css';
import './assets/layout.css';

import App from './App.vue';
import CButton from './components/c-button.vue';

const loading = ref(false);

router.beforeEach(async () => {
  loading.value = true;
});

router.afterEach(async () => {
  loading.value = false;
});

createApp(App).provide('loading', loading).use(router).component('c-button', CButton).mount('#app');
