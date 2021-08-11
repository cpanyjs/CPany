import { createRouter, createWebHistory } from 'vue-router';

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
    component: () => import('./pages/Contests.vue')
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

export const router = createRouter({
  history: createWebHistory(),
  routes
});
