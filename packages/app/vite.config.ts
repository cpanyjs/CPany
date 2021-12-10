import { resolve } from 'path';
import { defineConfig, Plugin } from 'vite';
import vue from '@vitejs/plugin-vue';
import WindiCSS from 'vite-plugin-windicss';
import Icons from 'unplugin-icons/vite';

const preset: Plugin[] = [
  {
    name: 'cpany:router',
    enforce: 'pre',
    resolveId(id) {
      return id === '~cpany/routes' ? '~cpany/routes' : null;
    },
    async load(id) {
      if (id === '~cpany/routes') {
        return `export const routes = [];\nexport const base = '/';`;
      }
      return null;
    }
  }
];

export default defineConfig({
  plugins: [vue(), WindiCSS(), Icons(), preset],
  resolve: {
    alias: {
      '@cpany/types': resolve(__dirname, '../types/src'),
      '@': resolve(__dirname, 'src')
    }
  }
});
