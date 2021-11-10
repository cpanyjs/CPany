import { defineConfig } from 'windicss/helpers';

export default defineConfig({
  shortcuts: {
    'px-screen': 'md:px-8 <md:px-4',
    box: 'rounded-md p-4 shadow-box',
    'info-box': 'rounded border-8 border-green-100 bg-light-200 md:(pl-4) <md:(pl-2) py-2'
  },
  theme: {
    boxShadow: {
      DEFAULT: '0 0 0 0.125rem rgba(0, 0, 0, 0.1)',
      navbar: '0 2px 0 0 #f5f5f5',
      box: '0 2px 3px rgb(10 10 10 / 10%), 0 0 0 1px rgb(10 10 10 / 10%)',
      // used in <c-button />
      success: '0 0 0 0.125em rgb(72 199 142 / 25%)',
      info: '0 0 0 0.125em rgb(32 156 238 / 25%)',
      warning: '0 0 0 0.125em rgb(255 224 138 / 25%)',
      danger: '0 0 0 0.125em rgb(241 70 104 / 25%)'
    },
    extend: {
      fontFamily: {
        mono: ['var(--font-family-mono)', 'var(--font-family-base)']
      }
    }
  }
});
