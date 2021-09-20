import { resolve } from 'path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import WindiCSS from 'vite-plugin-windicss';
import Icons from 'unplugin-icons/vite';
import IconsResolver from 'unplugin-icons/resolver';
import Components from 'unplugin-vue-components/vite';

export default defineConfig({
  plugins: [
    vue(),
    WindiCSS(),
    Icons(),
    Components({
      resolvers: IconsResolver()
    })
  ],
  resolve: {
    alias: {
      '@cpany/types': resolve(__dirname, '../types/src'),
      '@': resolve(__dirname, 'src')
    }
  }
});
