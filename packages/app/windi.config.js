import { defineConfig } from 'windicss/helpers';

export default defineConfig({
  shortcuts: {
    'px-screen': 'md:px-8 <md:px-4'
  },
  theme: {
    boxShadow: {
      navbar: '0 2px 0 0 #f5f5f5'
    }
  }
});
