import type { Plugin } from 'vite';
import type { ICompressOption } from './type';

export function compress({ enable = true }: ICompressOption = {}): Plugin {
  return {
    name: 'cpany:compress',
    enforce: 'pre',
    transform(code, id) {
      if (id.endsWith('.json')) {
        const json = JSON.parse(code);
        if (enable) {
          return JSON.stringify({ data: json }, null, 2);
        } else {
          return JSON.stringify({ data: json }, null, 2);
        }
      }
    }
  };
}
