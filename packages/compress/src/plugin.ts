import type { Plugin } from 'vite';

import type { ICompressOption, ICompressed } from './type';
import { createCounter } from './utils';

export function compress({ enable = true }: ICompressOption = {}): Plugin {
  return {
    name: 'cpany:compress',
    enforce: 'pre',
    transform(code, id) {
      if (id.endsWith('.json')) {
        const json = JSON.parse(code);
        if (enable) {
          const keyCount = new Map<string, number>();
          const stringCount = new Map<string, number>();
          const context: IContext = { keyCount, stringCount };
          collectWalk(json, context);
          return JSON.stringify(gen(json, context), null, 2);
        } else {
          return JSON.stringify({ data: json }, null, 2);
        }
      }
    }
  };
}

interface IContext {
  keyCount: Map<string, number>;
  stringCount: Map<string, number>;
}

function collectWalk(obj: any, context: IContext) {
  if (obj === null || obj === undefined) return;
  const type = typeof obj;
  if (type === 'undefined') return;
  if (type === 'function') return;
  if (type === 'boolean') return;
  if (type === 'symbol') return;
  if (type === 'bigint') return;
  if (type === 'number') return;
  if (type === 'string') {
    context.stringCount.set(obj, 1 + (context.stringCount.get(obj) ?? 0));
    return;
  }
  if (Array.isArray(obj)) {
    for (const key in obj) {
      collectWalk(obj[key], context);
    }
  } else {
    for (const key of Object.keys(obj)) {
      context.keyCount.set(key, 1 + (context.keyCount.get(key) ?? 0));
      collectWalk(obj[key], context);
    }
  }
}

function gen(obj: any, context: IContext): ICompressed {
  const keyMaps = new Map<string, string>();
  const stringMaps = new Map<string, string>();
  const { next: nextKey } = createCounter([...context.keyCount.keys()]);
  const { next: nextString } = createCounter();

  for (const [key, value] of context.keyCount.entries()) {
    if (key.length > 1 && value > 1) {
      const from = key;
      const to = nextKey();
      keyMaps.set(from, to);
    }
  }

  for (const [key, value] of context.stringCount.entries()) {
    if (key.length > 1 && value > 1) {
      const from = key;
      const to = nextString();
      stringMaps.set(from, to);
    }
  }

  const walk = (obj: any) => {
    if (obj === null || obj === undefined) return obj;
    const type = typeof obj;
    if (type === 'undefined') return obj;
    if (type === 'function') return obj;
    if (type === 'boolean') return obj;
    if (type === 'symbol') return obj;
    if (type === 'bigint') return obj;
    if (type === 'number') return obj;
    if (type === 'string') return stringMaps.get(obj) ?? obj;
    if (Array.isArray(obj)) {
      const newArr: any[] = [];
      for (const key in obj) {
        newArr.push(walk(obj[key]));
      }
      return newArr;
    } else {
      const newObj: Record<string, any> = {};
      for (const key of Object.keys(obj)) {
        const newKey = keyMaps.get(key) ?? key;
        newObj[newKey] = walk(obj[key]);
      }
      return newObj;
    }
  };

  return {
    keyMaps: [...keyMaps.entries()],
    stringMaps: [...stringMaps.entries()],
    data: walk(obj)
  };
}
