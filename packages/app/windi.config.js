import { defineConfig } from 'windicss/helpers';

export default defineConfig({
  shortcuts: {
    'px-screen': 'lg:px-8 <lg:px-4'
  },
  theme: {
    boxShadow: {
      navbar: '0 2px 0 0 #f5f5f5'
    }
  }
});
