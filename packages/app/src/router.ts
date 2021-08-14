import { createRouter, createWebHistory } from 'vue-router';

/* __imports__ */

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('./pages/Home.vue')
  },
  {
    path: '/members',
    name: 'Members',
    component: () => import('./pages/Members.vue')
  },
  {
    path: '/contests',
    name: 'Contests',
    component: () => import('./pages/Contest/Main.vue')
  },
  {
    path: '/contest/codeforces/:id',
    name: 'CodeforcesContestDetail',
    component: () => import('./pages/Contest/Codeforces.vue')
  },
  {
    path: '/codeforces',
    name: 'Codeforces',
    component: () => import('./pages/Codeforces.vue')
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('./pages/About.vue')
  }
];

/* __contests__ */

export const router = createRouter({
  history: createWebHistory(),
  routes
});
