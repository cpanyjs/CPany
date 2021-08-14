import { defineConfig } from 'windicss/helpers';

export default defineConfig({
  shortcuts: {
    'px-screen': 'md:px-8 <md:px-4',
    box: 'rounded-md p-4 shadow-box'
  },
  theme: {
    boxShadow: {
      navbar: '0 2px 0 0 #f5f5f5',
      box: '0 2px 3px rgb(10 10 10 / 10%), 0 0 0 1px rgb(10 10 10 / 10%)'
    }
  }
});
