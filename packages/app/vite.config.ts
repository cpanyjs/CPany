import { resolve } from 'path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import WindiCSS from 'vite-plugin-windicss';
import Icons from 'vite-plugin-icons';

export default defineConfig({
  plugins: [vue(), WindiCSS(), Icons()],
  resolve: {
    alias: {
      '@cpany/types': resolve(__dirname, '../types/src'),
      '@': resolve(__dirname, 'src')
    }
  }
});
