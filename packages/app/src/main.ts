import { createApp } from 'vue';
import { router } from './router';
import 'virtual:windi.css';

import App from './App.vue';

createApp(App).use(router).mount('#app');
